const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const {AgentBroker}=require('../dist/agent_broker');
const {snapshotProject,revisionForFiles,hash,validateCommand,isAcknowledgedChange,safeRelativePath}=require('../dist/agent_protocol');
const {startAgentControl,controlRequest,materializeArtifacts,statePath}=require('../dist/agent_control');
const uuid=()=>crypto.randomUUID();
function fixture(t) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'scripting-agent-tests-'));
  fs.mkdirSync(path.join(directory,'scripts','Fixture'),{recursive:true});
  fs.writeFileSync(path.join(directory,'scripts','Fixture','index.tsx'),'old');
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  return directory;
}
function device(broker,id=uuid(),handler) {
  const socket=new EventEmitter();socket.id=uuid();socket.connected=true;
  const state={pauses:0,resumes:0,requests:[],project:'Fixture',cancelled:[]};
  broker.register(socket,{project:()=>state.project,ignore:()=>[],pause:()=>state.pauses++,resume:()=>state.resumes++});
  socket.on('agentRequest',request=>{
    state.requests.push(request);
    if(handler)handler(request,reply=>socket.emit('agentResult',{protocolVersion:1,requestId:request.requestId,runId:request.runId,sessionId:request.sessionId,...reply}));
  });
  socket.on('agentCancel',value=>state.cancelled.push(value));
  socket.emit('agentHello',{protocolVersion:1,deviceId:id,sessionId:uuid(),project:'Fixture',capabilities:['status','run','widget','docs.search','docs.get','api.get']});
  return {socket,state,id};
}
async function finished(broker,id) {
  const end=Date.now()+3000;
  while(Date.now()<end) {const job=broker.get(id);if(['completed','failed','cancelled'].includes(job.status))return job;await new Promise(r=>setTimeout(r,5));}
  throw new Error('Test job never completed');
}
test('snapshot includes binary/unicode files, ignores configured/default paths, and hashes exact bytes',async t=>{
  const root=fixture(t),project=path.join(root,'scripts','Fixture');
  fs.mkdirSync(path.join(project,'.git'));fs.writeFileSync(path.join(project,'.git','secret'),'excluded');
  fs.writeFileSync(path.join(project,'a.log'),'ignored');fs.writeFileSync(path.join(project,'图.bin'),Buffer.from([0,255,128,1]));
  const snapshot=await snapshotProject(root,'Fixture',['*.log']);
  assert.deepEqual(snapshot.files.map(f=>f.path).sort(),['index.tsx','图.bin']);
  assert.deepEqual(Buffer.from(snapshot.files.find(f=>f.path==='图.bin').data,'base64'),Buffer.from([0,255,128,1]));
  assert.equal(snapshot.revision,revisionForFiles(snapshot.files));
  fs.writeFileSync(path.join(project,'index.tsx'),'changed');assert.notEqual((await snapshotProject(root,'Fixture',['*.log'])).revision,snapshot.revision);
});
test('snapshot rejects traversal, symlinks and oversized files',async t=>{
  const root=fixture(t),project=path.join(root,'scripts','Fixture');
  await assert.rejects(snapshotProject(root,'../bad',[]),e=>e.code==='invalid_project');
  fs.symlinkSync(os.tmpdir(),path.join(project,'escape'));
  await assert.rejects(snapshotProject(root,'Fixture',[]),e=>e.code==='invalid_path');fs.unlinkSync(path.join(project,'escape'));
  fs.writeFileSync(path.join(project,'huge'),Buffer.alloc(8*1024*1024+1));
  await assert.rejects(snapshotProject(root,'Fixture',[]),e=>e.code==='source_limit');
});
test('invalid options fail before dispatch',()=>{
  for(const value of [{method:'run',options:{timeout:0}},{method:'run',options:{captureAfter:11}},{method:'widget',options:{family:'invented'}},{method:'run',options:{screenshot:'yes'}}])assert.throws(()=>validateCommand(value),e=>e.code==='invalid_request');
});
test('multiple devices require explicit choice and project mismatch cannot execute',t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());device(broker);device(broker);
  assert.throws(()=>broker.submit({method:'docs.search'}),e=>e.code==='device_ambiguous');
  const single=new AgentBroker(fixture(t));t.after(()=>single.close());device(single);
  assert.throws(()=>single.submit({method:'run',project:'Other'}),e=>e.code==='project_mismatch');
});
test('run transfers a complete revision and preserves result identity; repeated request does not run twice',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  const peer=device(broker,undefined,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:request.snapshot.revision,result:{value:'done'}})));
  const command={method:'run',requestId:uuid()};const job=broker.submit(command);const result=await finished(broker,job.runId);
  assert.equal(result.status,'completed');assert.equal(result.revision,peer.state.requests[0].snapshot.revision);
  assert.equal(peer.state.requests.length,1);assert.equal(peer.state.pauses,1);assert.equal(peer.state.resumes,1);
  assert.equal(broker.submit(command).runId,job.runId);assert.equal(peer.state.requests.length,1);
  assert.throws(()=>broker.submit({...command,options:{screenshot:true}}),e=>e.code==='request_id_reused');
});
test('bad revision and mismatched response identity fail closed',async t=>{
  for(const badIdentity of [false,true]) {
    const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
    const peer=device(broker,undefined,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:'wrong',...(badIdentity?{sessionId:uuid()}:{}),result:{value:'stale'}})));
    const result=await finished(broker,broker.submit({method:'run'}).runId);
    assert.equal(result.status,'failed');assert.equal(result.error.code,'invalid_response');assert.equal(peer.state.resumes,1);
  }
});
test('cancel targets only its run and prevents replacement while native cancellation is outstanding',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());let respond;
  const peer=device(broker,undefined,(_request,reply)=>{respond=reply;});
  const first=broker.submit({method:'run'});while(!respond)await new Promise(r=>setTimeout(r,5));
  assert.equal(broker.cancel(first.runId).status,'cancelling');assert.equal(peer.state.cancelled[0].runId,first.runId);
  assert.throws(()=>broker.submit({method:'run'}),e=>e.code==='busy');
  respond({status:'cancelled'});await new Promise(r=>setImmediate(r));assert.equal(peer.state.resumes,1);
  assert.equal(broker.get(first.runId).status,'cancelled');
});
test('disconnect fails the old session without replaying a script',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  const peer=device(broker);const job=broker.submit({method:'run'});while(!peer.state.requests.length)await new Promise(r=>setTimeout(r,5));
  peer.socket.connected=false;peer.socket.emit('disconnect');
  const result=await finished(broker,job.runId);assert.equal(result.error.code,'disconnected');
  device(broker,peer.id);await new Promise(r=>setImmediate(r));assert.equal(peer.state.requests.length,1);assert.equal(peer.state.resumes,1);
});
test('local control rejects unauthenticated, browser-origin and wrong-host requests',async t=>{
  const root=fixture(t),broker=new AgentBroker(root),control=await startAgentControl(broker);
  t.after(()=>control.close());
  const url=`http://127.0.0.1:${control.state.port}`;
  assert.equal((fs.statSync(statePath(root)).mode&0o777),0o600);
  assert.equal((await fetch(url+'/v1/info')).status,403);
  const authorization=`Bearer ${control.state.token}`;
  assert.equal((await fetch(url+'/v1/info',{headers:{authorization,origin:'https://example.com'}})).status,403);
  const wrongHost=await new Promise((resolve,reject)=>{
    const request=require('node:http').request(url+'/v1/info',{headers:{authorization,host:'evil.test'}},response=>{response.resume();resolve(response.statusCode);});
    assert.equal(request.getHeader('host'),'evil.test');request.on('error',reject);request.end();
  });
  assert.equal(wrongHost,403);
  assert.equal((await controlRequest(control.state,'/v1/info')).result.workspace,fs.realpathSync(root));
  await assert.rejects(startAgentControl(broker),e=>e.code==='server_already_running');
});
test('PNG result is stored outside JSON and copied to an explicit output path',async t=>{
  const root=fixture(t),broker=new AgentBroker(root);t.after(()=>broker.close());
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
  device(broker,undefined,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:request.snapshot.revision,result:{image:{data:png.toString('base64'),sha256:hash(png)}}})));
  const result=await finished(broker,broker.submit({method:'run',options:{screenshot:true}}).runId);
  assert.equal(result.status,'completed');assert.equal(result.result.image,undefined);
  const materialized=materializeArtifacts(result.result,result.runId,path.join(root,'output'));
  assert.equal(materialized.artifacts[0].width,1);assert.equal(materialized.artifacts[0].height,1);
  assert.equal(hash(fs.readFileSync(materialized.artifacts[0].path)),hash(png));
  assert.deepEqual(materializeArtifacts(result.result,result.runId,path.join(root,'output')),materialized);
});

test('actual CLI process supports JSON docs, API, execution and widget commands',async t=>{
  const root=fixture(t),broker=new AgentBroker(root),control=await startAgentControl(broker);t.after(()=>control.close());
  const peer=device(broker,undefined,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:request.snapshot?.revision,result:request.method==='status'?{appState:'foreground'}:{method:request.method,value:'ok'}})));
  async function command(args) {
    return new Promise((resolve,reject)=>{
      const child=require('node:child_process').spawn(process.execPath,[path.resolve(__dirname,'../dist/cli.js'),...args,'--json'],{cwd:root});
      let stdout='',stderr='';child.stdout.on('data',value=>stdout+=value);child.stderr.on('data',value=>stderr+=value);child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));
    });
  }
  for (const args of [['devices'],['status'],['docs','search','Navigation'],['docs','get','navigation','--lang','zh'],['api','get','Navigation.present'],['run','Fixture','--capture-after','1','--query-parameters','{"sample":true}'],['widget','Fixture','--family','systemMedium']]) {
    const result=await command(args);assert.equal(result.code,0,result.stderr+result.stdout);
    const value=JSON.parse(result.stdout);if(!Array.isArray(value))assert.equal(value.status,'completed');
  }
  assert.ok(peer.state.requests.some(request=>request.method==='api.get'&&request.symbol==='Navigation.present'));
  assert.ok(peer.state.requests.some(request=>request.method==='run'&&request.options.captureAfter===1&&request.options.queryParameters.sample===true));
  assert.ok(peer.state.requests.some(request=>request.method==='widget'&&request.options.family==='systemMedium'));
  const typo=await command(['widget','Fixture','--capture-after','2']);assert.notEqual(typo.code,0);assert.match(typo.stderr+typo.stdout,/Unknown argument/);assert.equal(JSON.parse(typo.stdout).error.code,'invalid_usage');
});

test('watcher notifications already in the acknowledged snapshot do not rerun, later edits still propagate',async t=>{
  const root=fixture(t),entry=path.join(root,'scripts','Fixture','index.tsx');
  const snapshot=await snapshotProject(root,'Fixture',[]);
  assert.equal(isAcknowledgedChange(root,'Fixture','index.tsx',snapshot),true);
  fs.writeFileSync(entry,'edited after capture');
  assert.equal(isAcknowledgedChange(root,'Fixture','index.tsx',snapshot),false);
  assert.equal(isAcknowledgedChange(root,'Fixture','already-deleted.ts',snapshot),true);
  fs.unlinkSync(entry);assert.equal(isAcknowledgedChange(root,'Fixture','index.tsx',snapshot),false);
});

test('result retention is bounded in time, and expired run IDs cannot be replayed implicitly',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  device(broker,undefined,(_request,reply)=>queueMicrotask(()=>reply({status:'completed',result:{documents:[]}})));
  const job=await finished(broker,broker.submit({method:'docs.search'}).runId);
  broker.prune(Date.now()+16*60*1000);
  assert.throws(()=>broker.get(job.runId),e=>e.code==='job_not_found');
});

test('a second socket claiming a live device ID cannot hijack it or receive source',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());const id=uuid();
  const original=device(broker,id,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:request.snapshot?.revision,result:{value:'original'}})));
  const impostor=device(broker,id);
  assert.throws(()=>broker.submit({method:'run',device:id}),e=>e.code==='device_ambiguous');
  assert.equal(impostor.state.requests.length,0);assert.equal(original.state.requests.length,0);
  impostor.socket.connected=false;impostor.socket.emit('disconnect');
  const job=await finished(broker,broker.submit({method:'run',device:id}).runId);assert.equal(job.result.value,'original');
});
test('device results cannot inject local filesystem artifacts',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  device(broker,undefined,(request,reply)=>queueMicrotask(()=>reply({status:'completed',revision:request.snapshot?.revision,result:{artifacts:[{path:'/private/user-file.png'}]}})));
  const job=await finished(broker,broker.submit({method:'run'}).runId);assert.equal(job.status,'failed');assert.equal(job.error.code,'invalid_artifact');
});

test('a rejected request reports its requested revision without claiming App publication',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  device(broker,undefined,(_request,reply)=>queueMicrotask(()=>reply({status:'failed',error:{code:'needs_foreground',message:'Bring App forward.'}})));
  const job=await finished(broker,broker.submit({method:'run',options:{screenshot:true}}).runId);
  assert.equal(job.status,'failed');assert.ok(job.requestedRevision);assert.equal(job.revision,undefined);
});

test('source path budget uses UTF-8 bytes and bounded directory depth on both endpoints',()=>{
  assert.equal(safeRelativePath('assets/图.png'),true);
  assert.equal(safeRelativePath('字'.repeat(400)),false);
  assert.equal(safeRelativePath(Array(34).fill('a').join('/')),false);
});


test('cancelling during local source capture never admits a later device execution',async t=>{
  const broker=new AgentBroker(fixture(t));t.after(()=>broker.close());
  const peer=device(broker);
  const job=broker.submit({method:'run'});
  broker.cancel(job.runId);
  const result=await finished(broker,job.runId);
  assert.equal(result.status,'cancelled');assert.equal(result.error.code,'cancelled');
  assert.equal(peer.state.requests.length,0);assert.equal(peer.state.pauses,1);assert.equal(peer.state.resumes,1);
});
