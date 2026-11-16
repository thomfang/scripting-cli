const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const express=require('express');
const {developmentWorkspace,syncDocumentation,documentationPath}=require('../dist/documentation_sync');
const {initHttpRouter}=require('../dist/http_router');
const {Controller}=require('../dist/controller');

function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'scripting-docs-test-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
function snapshot(root,files={'doc.json':'[]','en.md':'English','zh.md':'中文','images/sample.bin':Buffer.from([0,255,42])}){
  return {version:1,workspaceId:developmentWorkspace(root).workspaceId,files:Object.entries(files).map(([path,data])=>({path,data:Buffer.from(data).toString('base64')}))};
}
test('complete publication replaces only its managed copy and removes stale files',async t=>{
  const root=fixture(t);fs.mkdirSync(path.join(root,'docs'));fs.writeFileSync(path.join(root,'docs','personal.md'),'keep');
  const first=await syncDocumentation(root,snapshot(root),()=>true);assert.equal(first.path,documentationPath);
  assert.deepEqual(fs.readFileSync(path.join(root,documentationPath,'images/sample.bin')),Buffer.from([0,255,42]));
  await syncDocumentation(root,snapshot(root,{'doc.json':'[1]','updated.md':'new'}),()=>true);
  assert.equal(fs.readFileSync(path.join(root,documentationPath,'updated.md'),'utf8'),'new');
  assert.ok(!fs.existsSync(path.join(root,documentationPath,'en.md')));
  assert.equal(fs.readFileSync(path.join(root,'docs/personal.md'),'utf8'),'keep');
  assert.deepEqual(fs.readdirSync(path.join(root,'docs')).sort(),['Scripting Documentation','personal.md']);
});
test('unmanaged directories and symlinks are rejected without changing user content',async t=>{
  const root=fixture(t),external=fixture(t),target=path.join(root,documentationPath);
  fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'personal.md'),'keep');
  await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),e=>e.code==='documentation_conflict');
  assert.equal(fs.readFileSync(path.join(target,'personal.md'),'utf8'),'keep');
  fs.rmSync(path.join(root,'docs'),{recursive:true});fs.symlinkSync(external,path.join(root,'docs'));
  await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),e=>e.code==='invalid_path');
  assert.deepEqual(fs.readdirSync(external),[]);
  fs.unlinkSync(path.join(root,'docs'));fs.mkdirSync(path.join(root,'docs'));fs.symlinkSync(external,target);
  await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),e=>e.code==='invalid_path');
});
test('invalid manifests reject traversal, aliases, conflicting parents and noncanonical bytes',async t=>{
  const root=fixture(t);
  for(const files of [
    {'doc.json':'[]','../escape':'bad'}, {'doc.json':'[]','a\\b':'bad'},
    {'doc.json':'[]','Case.md':'one','case.md':'two'}, {'doc.json':'[]','Dir/a.md':'one','dir/b.md':'two'}, {'doc.json':'[]','a':'file','a/b':'child'},
    {'doc.json':'[]','.scripting-documentation.json':'fake'}, {'en.md':'missing index'}
  ])await assert.rejects(syncDocumentation(root,snapshot(root,files),()=>true));
  const bad=snapshot(root);bad.files[0].data+='\n';await assert.rejects(syncDocumentation(root,bad,()=>true));
  await assert.rejects(syncDocumentation(root,snapshot(root,{'doc.json':'[]','large.bin':Buffer.alloc(8*1024*1024+1)}),()=>true),e=>e.code==='invalid_snapshot');
  await assert.rejects(syncDocumentation(root,{...snapshot(root),workspaceId:'other'},()=>true));
  assert.ok(!fs.existsSync(path.join(root,'docs')));
});
test('disconnection and failed writes preserve the old complete copy and permit retry',async t=>{
  const root=fixture(t);await syncDocumentation(root,snapshot(root),()=>true);
  let checks=0;
  await assert.rejects(syncDocumentation(root,snapshot(root,{'doc.json':'new','a.md':'new','b.md':'new'}),()=>++checks<3),e=>e.code==='disconnected');
  assert.equal(fs.readFileSync(path.join(root,documentationPath,'doc.json'),'utf8'),'[]');
  const original=fs.promises.writeFile;
  fs.promises.writeFile=async()=>{throw new Error('owned fixture write failure');};
  try{await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),/owned fixture/);}finally{fs.promises.writeFile=original;}
  assert.equal(fs.readFileSync(path.join(root,documentationPath,'doc.json'),'utf8'),'[]');
  assert.deepEqual(fs.readdirSync(path.join(root,'docs')),['Scripting Documentation']);
  await syncDocumentation(root,snapshot(root,{'doc.json':'retry'}),()=>true);
  assert.equal(fs.readFileSync(path.join(root,documentationPath,'doc.json'),'utf8'),'retry');
});
test('concurrent publication is rejected and workspace identity is stable across aliases',async t=>{
  const root=fixture(t),alias=path.join(fixture(t),'workspace');fs.symlinkSync(root,alias);
  assert.equal(developmentWorkspace(root).workspaceId,developmentWorkspace(alias).workspaceId);
  const first=syncDocumentation(root,snapshot(root),()=>true);
  await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),e=>e.code==='busy');await first;
});
test('failed final publication rolls back the previous complete directory',async t=>{
  const root=fixture(t);await syncDocumentation(root,snapshot(root),()=>true);
  const original=fs.renameSync;let injected=false;
  fs.renameSync=(from,to)=>{
    if(path.basename(from).startsWith('.scripting-docs-stage-')&&!injected){injected=true;throw new Error('owned publish failure');}
    return original(from,to);
  };
  try{await assert.rejects(syncDocumentation(root,snapshot(root,{'doc.json':'candidate'}),()=>true),/owned publish failure/);}finally{fs.renameSync=original;}
  assert.ok(injected);assert.equal(fs.readFileSync(path.join(root,documentationPath,'doc.json'),'utf8'),'[]');
  assert.deepEqual(fs.readdirSync(path.join(root,'docs')),['Scripting Documentation']);
});
test('replacing docs during upload cannot redirect staged writes outside the workspace',async t=>{
  const root=fixture(t),external=fixture(t);await syncDocumentation(root,snapshot(root),()=>true);
  const docs=path.join(root,'docs'),moved=path.join(root,'moved-docs'),original=fs.promises.writeFile;
  let swapped=false,escaped=false;
  fs.promises.writeFile=async function(file,...args){
    const value=await original.call(this,file,...args);
    if(fs.realpathSync(file).startsWith(external+path.sep))escaped=true;
    if(!swapped&&String(file).includes('.scripting-docs-stage-')){
      swapped=true;fs.renameSync(docs,moved);fs.symlinkSync(external,docs);
    }
    return value;
  };
  try{await assert.rejects(syncDocumentation(root,snapshot(root),()=>true),e=>e.code==='invalid_path');}finally{fs.promises.writeFile=original;}
  assert.ok(swapped);assert.equal(escaped,false);assert.deepEqual(fs.readdirSync(external),[]);
  assert.equal(fs.readFileSync(path.join(moved,'Scripting Documentation/doc.json'),'utf8'),'[]');
  assert.ok(!fs.readdirSync(root).some(name=>name.startsWith('.scripting-docs-stage-')));
});
test('HTTP workspace and sync routes require the current socket and preserve selection',async t=>{
  const root=fixture(t),app=express(),ctrl={workspace:root,socket:{connected:true},scriptName:'unchanged'};
  const original=Controller.get;Controller.get=id=>id==='owned-socket'?ctrl:undefined;t.after(()=>{Controller.get=original;});
  initHttpRouter(app);const server=http.createServer(app);await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
  const base=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base+'/developmentWorkspace?socketId=stale')).status,409);
  const info=await (await fetch(base+'/developmentWorkspace?socketId=owned-socket')).json();assert.equal(info.documentationSync,true);
  const result=await (await fetch(base+'/syncDocumentation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...snapshot(root),socketId:'owned-socket'})})).json();assert.equal(result.success,true);assert.equal(ctrl.scriptName,'unchanged');
  ctrl.socket.connected=false;
  assert.equal((await fetch(base+'/syncDocumentation',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...snapshot(root),socketId:'owned-socket'})})).status,409);
});
