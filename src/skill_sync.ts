import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import chokidar, { FSWatcher } from 'chokidar';
import { Socket } from 'socket.io';
import { AgentError, SourceSnapshot, snapshotSource, safeRelativePath, validPackageName, hash, revisionForFiles, MAX_FILES, MAX_SOURCE_BYTES, failure } from './agent_protocol';
import { writeDtsFiles, isIgnoredPath } from './util';

// Package metadata belongs to the App. It must survive development publication.
export function skillIgnores(ignore: string[]) { return [...new Set(['/skill.json', ...ignore])]; }
export function validateSkillSnapshot(raw: any): SourceSnapshot {
  if (!raw || !Array.isArray(raw.files) || raw.files.length > MAX_FILES || !Array.isArray(raw.ignore) || raw.ignore.length > 100 || raw.ignore.some((p:any)=>typeof p!=='string'||Buffer.byteLength(p)>1024) || !raw.ignore.includes('/skill.json')) throw new AgentError('invalid_snapshot','Invalid skill manifest.');
  let bytes=0; const seen=new Set<string>(),portableNames=new Set<string>();
  for(const file of raw.files) {
    if(!file || typeof file.path!=='string' || !safeRelativePath(file.path) || seen.has(file.path) || isIgnoredPath(file.path,raw.ignore) || typeof file.data!=='string' || file.data.length>Math.ceil(MAX_SOURCE_BYTES/3)*4) throw new AgentError('invalid_snapshot','Unsafe skill source.');
    const portable=file.path.normalize('NFC').toLowerCase();if(portableNames.has(portable))throw new AgentError('invalid_path','Source names differ only in case or normalization.');portableNames.add(portable);
    seen.add(file.path);const data=Buffer.from(file.data,'base64');bytes+=data.length;
    if(bytes>MAX_SOURCE_BYTES || data.toString('base64')!==file.data || hash(data)!==file.sha256) throw new AgentError('invalid_snapshot','Skill content exceeds the limit or has a bad digest.');
  }
  if(revisionForFiles(raw.files)!==raw.revision) throw new AgentError('revision_mismatch','Skill manifest digest does not match.');
  const skill=raw.files.find((f:any)=>f.path==='SKILL.md');
  const markdown=skill ? Buffer.from(skill.data,'base64').toString('utf8') : '';
  const front=markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if(!front || !['name','description'].every(key=>front.split(/\r?\n/).some(line=>line.startsWith(key+':') && line.slice(key.length+1).trim().replace(/^["']|["']$/g,'').trim()))) throw new AgentError('invalid_skill','SKILL.md needs name and description in its frontmatter.');
  return raw;
}
export async function snapshotSkill(workspace:string,name:string,ignore:string[]) {
  ensureRoot(workspace);
  return validateSkillSnapshot(await snapshotSource(workspace,name,skillIgnores(ignore),'skills'));
}
function ensureRoot(workspace:string) {
  const root=path.join(workspace,'skills');
  if(fs.existsSync(root)) {
    if(fs.lstatSync(root).isSymbolicLink() || !fs.statSync(root).isDirectory()) throw new AgentError('invalid_path','skills must be a regular directory.');
  } else fs.mkdirSync(root);
  return root;
}
export async function inspectSkill(workspace:string,name:string,ignore:string[]):Promise<SourceSnapshot|undefined> {
  if(!validPackageName(name)) throw new AgentError('invalid_skill','Invalid skill directory name.');
  const root=path.join(ensureRoot(workspace),name);
  try { await fs.promises.lstat(root); } catch(e:any) {if(e.code==='ENOENT')return;throw e;}
  return snapshotSkill(workspace,name,ignore);
}
export async function applySkillSnapshot(workspace:string,name:string,raw:unknown,expected:string|null) {
  if(!validPackageName(name))throw new AgentError('invalid_skill','Invalid skill directory name.');
  const snapshot=validateSkillSnapshot(raw),parent=ensureRoot(workspace),root=path.join(parent,name);
  const stage=await fs.promises.mkdtemp(path.join(parent,'.skill-stage-'));
  const backup=path.join(parent,'.skill-backup-'+crypto.randomUUID());
  let moved=false,published=false,retainRecovery=false;
  try {
    for(const file of snapshot.files) { const target=path.join(stage,file.path);await fs.promises.mkdir(path.dirname(target),{recursive:true});await fs.promises.writeFile(target,Buffer.from(file.data,'base64')); }
    for(const file of snapshot.files) {
      const target=path.join(stage,file.path);
      if(path.relative(fs.realpathSync(stage),fs.realpathSync(target)).split(path.sep).join('/')!==file.path || hash(fs.readFileSync(target))!==file.sha256)throw new AgentError('invalid_path','Source names collide on this filesystem.');
    }
    // No await between the final version check and the directory swap. Changes
    // from this server cannot interleave publication; external edits conflict.
    const current=await inspectSkill(workspace,name,snapshot.ignore);
    if((current?.revision??null)!==expected)throw new AgentError('skill_conflict','Desktop skill changed. Select the source again.');
    const preserved:string[]=[];const movedPaths:string[]=[];
    if(current) {
      const collect=(dir:string,relative='')=>{
        for(const item of fs.readdirSync(dir,{withFileTypes:true})) {
          const rel=relative?relative+'/'+item.name:item.name;
          if(isIgnoredPath(rel,snapshot.ignore))preserved.push(rel);
          else if(item.isDirectory())collect(path.join(root,rel),rel);
        }
      };
      collect(root);fs.renameSync(root,backup);moved=true;
    }
    try {
      for(const rel of preserved){const target=path.join(stage,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.renameSync(path.join(backup,rel),target);movedPaths.push(rel);}
      fs.renameSync(stage,root);published=true;
    } catch(e) {
      if(moved){try{
        for(const rel of movedPaths.reverse()){const target=path.join(backup,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.renameSync(path.join(stage,rel),target);}
        fs.renameSync(backup,root);
      }catch{retainRecovery=true;throw new AgentError('recovery_required',`Preserve ${backup} and ${stage} for recovery.`);}}
      throw e;
    }
    return snapshot;
  } finally {
    if(!retainRecovery) {await fs.promises.rm(stage,{recursive:true,force:true}).catch(()=>{});if(published&&moved)await fs.promises.rm(backup,{recursive:true,force:true}).catch(()=>{});}
  }
}

interface Binding {name:string;id:string;revision:string;ready:boolean;blocked:boolean;}
export class SkillSyncController {
  private binding?:Binding;
  private watcher?:FSWatcher;
  private catalog?:FSWatcher;
  private timer?:ReturnType<typeof setTimeout>;
  private catalogTimer?:ReturnType<typeof setTimeout>;
  private tail:Promise<unknown>=Promise.resolve();
  private pauses=0;
  private closed=false;
  constructor(private socket:Socket,private workspace:string,private ignore:string[],private beforeBind:()=>Promise<void>) {
    socket.on('skillSyncRequest',(request:any,ack:any)=>{
      void this.serial(async()=>{
        try {if(typeof ack!=='function')return;ack({success:true,...await this.request(request)});}
        catch(e){if(typeof ack==='function')ack({error:failure(e)});}
      });
    });
    socket.emit('skillSyncHello',{version:1});
  }
  private serial<T>(work:()=>Promise<T>):Promise<T> {const result=this.tail.then(work);this.tail=result.catch(()=>{});return result;}
  selected() {const b=this.binding;return b?.ready&&!b.blocked?{name:b.name,bindingId:b.id,revision:b.revision}:null;}
  async drain(){await this.tail;}
  pause(){this.pauses++;}
  resume(snapshot?:SourceSnapshot){
    this.pauses=Math.max(0,this.pauses-1);
    if(snapshot&&this.binding)this.binding.revision=snapshot.revision;
    this.schedule();
  }
  async stop() {
    this.binding=undefined;if(this.timer)clearTimeout(this.timer);
    const watcher=this.watcher;this.watcher=undefined;await watcher?.close();
  }
  async close(){this.closed=true;await this.stop();if(this.catalogTimer)clearTimeout(this.catalogTimer);await this.catalog?.close();}
  private async names() {
    const root=ensureRoot(this.workspace);
    return fs.readdirSync(root,{withFileTypes:true}).filter(item=>item.isDirectory()&&!item.isSymbolicLink()&&validPackageName(item.name)&&fs.existsSync(path.join(root,item.name,'SKILL.md'))).map(x=>x.name).sort().slice(0,1000);
  }
  private watchCatalog() {
    if(this.catalog)return;
    this.catalog=chokidar.watch(ensureRoot(this.workspace),{depth:1,ignoreInitial:true,ignored:p=>path.relative(path.join(this.workspace,'skills'),p).split(path.sep).some(x=>x.startsWith('.')||x==='node_modules')});
    const refresh=()=>{if(this.catalogTimer)clearTimeout(this.catalogTimer);this.catalogTimer=setTimeout(()=>{void this.names().then(names=>this.socket.emit('skillSyncCatalog',{version:1,names})).catch(()=>{});},200);};
    this.catalog.on('add',refresh).on('unlink',refresh).on('addDir',refresh).on('unlinkDir',refresh).on('error',()=>{});
  }
  private async request(r:any):Promise<Record<string,unknown>> {
    if(this.closed||!this.socket.connected)throw new AgentError('disconnected','Skill connection ended.');
    if(r?.version!==1)throw new AgentError('unsupported_capability','Unsupported skill sync version.');
    if(r.method==='list'){this.watchCatalog();return {names:await this.names(),ignore:skillIgnores(this.ignore)};}
    if(r.method==='inspect')return {snapshot:await inspectSkill(this.workspace,r.name,this.ignore)??null};
    if(this.pauses)throw new AgentError('busy','A desktop run is active.');
    if(r.method==='stop') {if(this.binding&&r.bindingId!==this.binding.id)throw new AgentError('skill_mismatch','The skill binding changed.');await this.stop();return {};}
    if(r.method==='bind') {
      if(!validPackageName(r.name)||typeof r.bindingId!=='string'||!/^[a-f0-9-]{36}$/i.test(r.bindingId))throw new AgentError('invalid_request','Invalid skill binding.');
      await this.beforeBind();await this.stop();
      const files=r.types;
      if(!files||typeof files!=='object'||Array.isArray(files)||Object.keys(files).length>16||!files['global.d.ts']||!files['scripting.d.ts']||Object.entries(files).some(([name,content])=>!(/^[a-zA-Z0-9_-]+\.d\.ts$/.test(name))||typeof content!=='string')||Buffer.byteLength(JSON.stringify(files))>8*1024*1024)throw new AgentError('invalid_request','Invalid declaration bundle.');
      const dts=path.join(this.workspace,'dts');
      if(fs.existsSync(dts)&&fs.lstatSync(dts).isSymbolicLink())throw new AgentError('invalid_path','Type directory cannot be a symlink.');
      for(const name of Object.keys(files))if(fs.existsSync(path.join(dts,name))&&fs.lstatSync(path.join(dts,name)).isSymbolicLink())throw new AgentError('invalid_path','Type file cannot be a symlink.');
      await writeDtsFiles(files,this.workspace);
      for(const [name,content] of Object.entries(files))if(fs.readFileSync(path.join(dts,name),'utf8')!==content)throw new AgentError('sync_failed','Type declarations were not written.');

      let snapshot:SourceSnapshot|undefined;
      if(r.snapshot) {
        const checked=validateSkillSnapshot(r.snapshot);
        if(JSON.stringify(checked.ignore)!==JSON.stringify(skillIgnores(this.ignore)))throw new AgentError('invalid_snapshot','Ignore configuration changed.');
        snapshot=await applySkillSnapshot(this.workspace,r.name,checked,r.expectedRevision??null);
      } else {
        snapshot=await inspectSkill(this.workspace,r.name,this.ignore);
        if(!snapshot||snapshot.revision!==r.expectedRevision)throw new AgentError('skill_conflict','Desktop skill changed. Select the source again.');
      }
      if(this.closed||!this.socket.connected)throw new AgentError('disconnected','Connection ended before binding.');
      this.binding={name:r.name,id:r.bindingId,revision:snapshot.revision,ready:false,blocked:false};
      return {snapshot};
    }
    if(r.method==='ready') {
      const b=this.binding;
      if(!b||b.id!==r.bindingId||b.name!==r.name||b.revision!==r.revision)throw new AgentError('skill_mismatch','The skill binding changed.');
      const root=path.join(this.workspace,'skills',b.name);
      this.watcher=chokidar.watch(root,{ignoreInitial:true,ignored:p=>isIgnoredPath(path.relative(root,p).split(path.sep).join('/'),skillIgnores(this.ignore))});
      this.watcher.on('all',()=>this.schedule()).on('ready',()=>this.schedule()).on('error',e=>this.block(b,e));
      b.ready=true;return {};
    }
    throw new AgentError('invalid_request','Unknown skill sync method.');
  }
  private schedule(){if(this.timer)clearTimeout(this.timer);if(this.closed)return;this.timer=setTimeout(()=>{void this.serial(()=>this.pump());},200);}
  private block(b:Binding,error:unknown){if(this.binding!==b)return;b.blocked=true;this.socket.emit('skillSyncFailure',{bindingId:b.id,name:b.name,error:failure(error)});}
  private async pump() {
    const b=this.binding;if(!b||!b.ready||b.blocked||this.pauses||this.closed)return;
    try {
      const snapshot=await snapshotSkill(this.workspace,b.name,this.ignore);
      if(this.binding!==b||this.pauses)return;
      if(snapshot.revision===b.revision)return;
      const reply:any=await new Promise((resolve,reject)=>this.socket.timeout(10000).emit('skillSyncUpdate',{version:1,name:b.name,bindingId:b.id,baseRevision:b.revision,snapshot},(error:any,value:any)=>error?reject(new AgentError('device_timeout','Skill synchronization was not acknowledged.')):resolve(value)));
      if(this.binding!==b)return;
      if(reply?.success!==true||reply.revision!==snapshot.revision)throw new AgentError(reply?.error?.code??'sync_failed',reply?.error?.message??'Skill publication failed.');
      b.revision=snapshot.revision;
      // Capture again after acknowledgement so saves during transmission remain.
      this.schedule();
    }catch(e){this.block(b,e);}
  }
}
