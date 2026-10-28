const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const {snapshotSkill,validateSkillSnapshot,applySkillSnapshot,SkillSyncController}=require('../dist/skill_sync');
const {AgentBroker}=require('../dist/agent_broker');
const {validateCommand,revisionForFiles,hash}=require('../dist/agent_protocol');
const {startAgentControl}=require('../dist/agent_control');
const uuid=()=>crypto.randomUUID();
const markdown='---\nname: fixture\ndescription: Test skill\n---\nBody\n';
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'scripting-skills-test-'));fs.mkdirSync(path.join(root,'skills','fixture','scripts'),{recursive:true});fs.writeFileSync(path.join(root,'skills','fixture','SKILL.md'),markdown);fs.writeFileSync(path.join(root,'skills','fixture','scripts','main.tsx'),'import { Script } from "scripting"; Script.exit(42)');t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
const manifest=(files)=>({ignore:['/skill.json'],files:Object.entries(files).map(([file,data])=>({path:file,data:Buffer.from(data).toString('base64'),sha256:hash(Buffer.from(data))}))});
function snapshot(files){const s=manifest(files);s.revision=revisionForFiles(s.files);return s;}
class Peer extends EventEmitter {
  constructor(){super();this.id=uuid();this.connected=true;}
  timeout(){return {emit:(event,data,ack)=>this.emit(event,data,reply=>ack(null,reply))};}
}
function request(peer,r){return new Promise(resolve=>peer.emit('skillSyncRequest',{version:1,...r},resolve));}
const types={'global.d.ts':'declare var x: number','scripting.d.ts':'export {}'};
async function until(check){const end=Date.now()+3000;while(Date.now()<end){const value=check();if(value)return value;await new Promise(r=>setTimeout(r,10));}throw Error('Expected condition timed out');}

test('skill snapshots include resources but preserve App metadata and ignore dependency trees',async t=>{
 const root=fixture(t),dir=path.join(root,'skills','fixture');
 fs.writeFileSync(path.join(dir,'skill.json'),'{"is_builtin":true,"unknown":42}');fs.writeFileSync(path.join(dir,'图.bin'),Buffer.from([0,255,1]));
 fs.mkdirSync(path.join(dir,'node_modules'));fs.writeFileSync(path.join(dir,'node_modules','dependency'),'local');
 const before=await snapshotSkill(root,'fixture',[]);assert.ok(!before.files.some(f=>f.path==='skill.json'||f.path.includes('node_modules')));
 const next=snapshot({'SKILL.md':markdown,'scripts/main.tsx':'new','nested/图.bin':Buffer.from([0,128,255])});
 await applySkillSnapshot(root,'fixture',next,before.revision);
 assert.equal(fs.readFileSync(path.join(dir,'skill.json'),'utf8'),'{"is_builtin":true,"unknown":42}');
 assert.equal(fs.readFileSync(path.join(dir,'node_modules','dependency'),'utf8'),'local');
 assert.ok(!fs.existsSync(path.join(dir,'图.bin')));assert.deepEqual(fs.readFileSync(path.join(dir,'nested','图.bin')),Buffer.from([0,128,255]));
 assert.equal((await snapshotSkill(root,'fixture',[])).revision,next.revision);
});
test('stale source versions and missing SKILL.md never overwrite an existing package',async t=>{
 const root=fixture(t),dir=path.join(root,'skills','fixture'),before=await snapshotSkill(root,'fixture',[]);
 fs.writeFileSync(path.join(dir,'scripts','main.tsx'),'App edited');
 await assert.rejects(applySkillSnapshot(root,'fixture',snapshot({'SKILL.md':markdown,'scripts/main.tsx':'desktop'}),before.revision),e=>e.code==='skill_conflict');
 await assert.rejects(applySkillSnapshot(root,'fixture',snapshot({'scripts/main.tsx':'missing manifest'}),null),e=>e.code==='invalid_skill');
 assert.equal(fs.readFileSync(path.join(dir,'scripts','main.tsx'),'utf8'),'App edited');
 assert.deepEqual(fs.readdirSync(path.join(root,'skills')),['fixture']);
});
test('skill paths, digests, metadata injection, symlinks, invalid headers and size limits fail closed',async t=>{
 const root=fixture(t),dir=path.join(root,'skills','fixture');
 for(const name of ['../escape','.hidden','bad/name'])await assert.rejects(snapshotSkill(root,name,[]));
 for(const file of ['../escape','/absolute','a//b','a\\b','skill.json'])assert.throws(()=>validateSkillSnapshot(snapshot({'SKILL.md':markdown,[file]:'bad'})));
 assert.throws(()=>validateSkillSnapshot(snapshot({'SKILL.md':'---\nname: x\n---\n'})),e=>e.code==='invalid_skill');
 const bad=snapshot({'SKILL.md':markdown});bad.files[0].data=Buffer.from('different').toString('base64');assert.throws(()=>validateSkillSnapshot(bad));
 fs.symlinkSync(os.tmpdir(),path.join(dir,'escape'));await assert.rejects(snapshotSkill(root,'fixture',[]),e=>e.code==='invalid_path');fs.unlinkSync(path.join(dir,'escape'));
 fs.writeFileSync(path.join(dir,'large'),Buffer.alloc(8*1024*1024+1));await assert.rejects(snapshotSkill(root,'fixture',[]),e=>e.code==='source_limit');
});
test('a new skill is created only when the expected desktop version is absent',async t=>{
 const root=fixture(t),s=snapshot({'SKILL.md':markdown,'scripts/a.ts':'created'});
 await applySkillSnapshot(root,'new',s,null);assert.equal((await snapshotSkill(root,'new',[])).revision,s.revision);
 await assert.rejects(applySkillSnapshot(root,'new',s,null),e=>e.code==='skill_conflict');
 assert.ok(fs.existsSync(path.join(root,'skills','fixture','SKILL.md')));
});
test('Skill watcher requires ready, preserves binding identity, defers saves during run and stops after conflict',async t=>{
 const root=fixture(t),peer=new Peer();let binds=0;const ctrl=new SkillSyncController(peer,root,[],async()=>{binds++;});t.after(()=>ctrl.close());
 const s=await snapshotSkill(root,'fixture',[]),id=uuid();
 const bound=await request(peer,{method:'bind',name:'fixture',bindingId:id,expectedRevision:s.revision,types});assert.equal(bound.success,true);assert.equal(ctrl.selected(),null);
 const updates=[];peer.on('skillSyncUpdate',(value,ack)=>{updates.push(value);ack({success:true,revision:value.snapshot.revision});});
 await request(peer,{method:'ready',name:'fixture',bindingId:id,revision:s.revision});assert.equal(ctrl.selected().bindingId,id);assert.equal(binds,1);
 ctrl.pause();fs.writeFileSync(path.join(root,'skills','fixture','scripts','main.tsx'),'during run');
 await new Promise(r=>setTimeout(r,500));assert.equal(updates.length,0);ctrl.resume();
 await until(()=>updates.length===1);assert.equal(updates[0].baseRevision,s.revision);assert.equal(updates[0].bindingId,id);await ctrl.drain();
 peer.removeAllListeners('skillSyncUpdate');peer.on('skillSyncUpdate',(_value,ack)=>ack({error:{code:'skill_conflict',message:'App changed'}}));
 const failures=[];peer.on('skillSyncFailure',v=>failures.push(v));fs.writeFileSync(path.join(root,'skills','fixture','scripts','main.tsx'),'conflict');
 await until(()=>failures.length);assert.equal(ctrl.selected(),null);assert.equal(failures[0].error.code,'skill_conflict');
 assert.equal((await request(peer,{method:'stop',bindingId:uuid()})).error.code,'skill_mismatch');
 assert.equal((await request(peer,{method:'stop',bindingId:id})).success,true);
});
test('skill run validates entry and options before device dispatch',()=>{
 const valid={method:'skills.run',skill:'fixture',entry:'scripts/main.tsx',options:{check:true,queryParameters:{sample:true}}};assert.equal(validateCommand(valid).options.check,true);
 for(const patch of [{entry:'../x.tsx'},{entry:'/a.ts'},{entry:'main.js'},{skill:'../bad'},{options:{check:'yes'}},{options:{screenshot:true}}])assert.throws(()=>validateCommand({...valid,...patch}));
});
function skillDevice(broker,name='fixture'){
 const peer=new Peer(),state={name,id:uuid(),revision:'0'.repeat(64),requests:[],resumes:[],pauses:0};
 broker.register(peer,{project:()=>null,skill:()=>({name:state.name,bindingId:state.id,revision:state.revision}),skillReady:async()=>{},ignore:()=>[],pause:()=>state.pauses++,resume:(snapshot,id)=>{state.resumes.push({snapshot,id});if(snapshot)state.revision=snapshot.revision;}});
 peer.emit('agentHello',{protocolVersion:1,deviceId:uuid(),sessionId:uuid(),skill:name,skillBindingId:state.id,capabilities:['status','skills.run','events-v1']});
 peer.on('agentRequest',r=>state.requests.push(r));return {peer,state};
}
test('skill jobs bind to the selected skill, snapshot full package, stream logs, and acknowledge source on failure',async t=>{
 const root=fixture(t),broker=new AgentBroker(root);t.after(()=>broker.close());const {peer,state}=skillDevice(broker);
 assert.throws(()=>broker.submit({method:'skills.run',skill:'other',entry:'scripts/main.tsx'}),e=>e.code==='skill_mismatch');
 const job=broker.submit({method:'skills.run',skill:'fixture',entry:'scripts/main.tsx',options:{events:true}});
 const r=await until(()=>state.requests[0]);assert.equal(r.bindingId,state.id);assert.equal(r.baseRevision,'0'.repeat(64));assert.equal(r.project,undefined);assert.ok(r.snapshot.files.some(f=>f.path==='SKILL.md'));
 peer.emit('agentEvent',{runId:r.runId,requestId:r.requestId,sessionId:r.sessionId,type:'log',message:'nonce42'});
 peer.emit('agentResult',{protocolVersion:1,runId:r.runId,requestId:r.requestId,sessionId:r.sessionId,status:'failed',revision:r.snapshot.revision,error:{code:'execution_failed',message:'test'},result:{stdout:['nonce42']}});
 const done=await until(()=>broker.get(job.runId).status==='failed'&&broker.get(job.runId));assert.equal(done.revision,r.snapshot.revision);assert.equal(done.skill,'fixture');assert.equal(state.resumes[0].id,state.id);assert.equal(broker.events(job.runId,0).events.filter(e=>e.type==='log')[0].message,'nonce42');
});
test('actual skills run CLI handles check and query parameters with one JSON result',async t=>{
 const root=fixture(t),broker=new AgentBroker(root),control=await startAgentControl(broker);t.after(()=>control.close());const {peer,state}=skillDevice(broker);
 peer.on('agentRequest',r=>peer.emit('agentResult',{protocolVersion:1,runId:r.runId,requestId:r.requestId,sessionId:r.sessionId,status:'completed',revision:r.snapshot.revision,result:{value:42,stdout:['nonce42']}}));
 const result=await new Promise((resolve,reject)=>{const child=require('node:child_process').spawn(process.execPath,[path.resolve(__dirname,'../dist/cli.js'),'skills','run','fixture','scripts/main.tsx','--check','--query-parameters','{"sample":true}','--json'],{cwd:root});let stdout='',stderr='';child.stdout.on('data',v=>stdout+=v);child.stderr.on('data',v=>stderr+=v);child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));});
 assert.equal(result.code,0,result.stdout+result.stderr);assert.equal(JSON.parse(result.stdout).result.value,42);assert.equal(state.requests[0].options.check,true);assert.equal(state.requests[0].options.queryParameters.sample,true);
});

test('large bounded binary payload validates without regex recursion and rejects non-canonical base64',()=>{
 const large=Buffer.alloc(7*1024*1024,255),s=snapshot({'SKILL.md':markdown,'assets/large.bin':large});
 assert.equal(validateSkillSnapshot(s).revision,s.revision);
 s.files[1].data+='\n';assert.throws(()=>validateSkillSnapshot(s),e=>e.code==='invalid_snapshot');
});
test('Skill catalog discovers new desktop packages without selecting or running them',async t=>{
 const root=fixture(t),peer=new Peer(),ctrl=new SkillSyncController(peer,root,[],async()=>{});t.after(()=>ctrl.close());
 const catalog=await request(peer,{method:'list'});assert.deepEqual(catalog.names,['fixture']);
 const events=[];peer.on('skillSyncCatalog',v=>events.push(v));await new Promise(r=>setTimeout(r,100));
 fs.mkdirSync(path.join(root,'skills','new'));fs.writeFileSync(path.join(root,'skills','new','SKILL.md'),markdown);
 await until(()=>events.some(e=>e.names.includes('new')));assert.equal(ctrl.selected(),null);
});

test('publication rejects portable source path aliases and preserves existing bytes',async t=>{
 const root=fixture(t),dir=path.join(root,'skills','fixture');
 const previous=await snapshotSkill(root,'fixture',[]),incoming=snapshot({'SKILL.md':markdown,'Case.ts':'one','case.ts':'two'});
 await assert.rejects(applySkillSnapshot(root,'fixture',incoming,previous.revision),e=>e.code==='invalid_path');
 assert.ok(!fs.existsSync(path.join(dir,'Case.ts')));assert.equal((await snapshotSkill(root,'fixture',[])).revision,previous.revision);
});
