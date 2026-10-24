import path from 'path';
import { Argv } from 'yargs';
import { AgentCommand, AgentError, failure } from './agent_protocol';
import { controlRequest, loadControl, materializeArtifacts } from './agent_control';

export async function invokeAgentCommand(command: AgentCommand, output: string, json: boolean) {
  const state = loadControl(process.cwd());
  const info = await controlRequest(state,'/v1/info');
  if (info.result.workspace !== state.workspace) throw new AgentError('workspace_mismatch','The running server belongs to another workspace.');
  let job = (await controlRequest(state,'/v1/requests',command)).result;
  const cancel = () => { void controlRequest(state,`/v1/jobs/${job.runId}/cancel`,{}).catch(()=>{}); };
  process.once('SIGINT',cancel);
  try {
    while (!['completed','failed','cancelled'].includes(job.status)) {
      await new Promise(r=>setTimeout(r,200));
      job = (await controlRequest(state,`/v1/jobs/${job.runId}`)).result;
    }
    if (job.result?.artifacts?.length) job.result = materializeArtifacts(job.result,job.runId,output);
    if (json) console.log(JSON.stringify(job)); else console.log(JSON.stringify(job,null,2));
    process.exitCode = job.status === 'completed' ? 0 : job.status === 'cancelled' ? 130 : ['execution_timeout','device_timeout'].includes(job.error?.code) ? 124 : 1;
  } finally { process.removeListener('SIGINT',cancel); }
}
function common(y: Argv) {
  return y.option('device',{type:'string',describe:'Target device ID; required when several devices are connected'})
    .option('json',{type:'boolean',default:false,describe:'Print one JSON result'})
    .option('output',{type:'string',default:'artifacts',describe:'Screenshot output directory'});
}
function runOptions(y: Argv, script = true) {
  const options = common(y).positional('project',{type:'string',describe:'Currently selected App debug project'})
    .option('screenshot',{type:'boolean',default:false})
    .option('timeout',{type:'number',default:30,describe:'Overall run deadline in seconds, 1...120'})
    .option('no-sync',{type:'boolean',default:false,describe:'Use the last acknowledged App revision'});
  return script ? options.option('capture-after',{type:'number',default:2,describe:'Seconds after a script view is available before capture'}).option('query-parameters',{type:'string',describe:'JSON object passed to the script'}) : options;
}
const handler = (build: (a:any)=>AgentCommand) => async (a:any) => {
  try { await invokeAgentCommand(build(a),path.resolve(a.output ?? 'artifacts'),a.json ?? false); }
  catch(e) { const result = {status:'failed',error:failure(e)}; console.log(JSON.stringify(result,a.json ? undefined : null,a.json ? undefined : 2)); process.exitCode=1; }
};
export function installAgentCommands(y: Argv): Argv {
  return y.command('devices','List connected devices and their current responsiveness',common,async (a:any)=>{
    try { const value=await controlRequest(loadControl(process.cwd()),'/v1/devices'); console.log(JSON.stringify(value.result,null,a.json?undefined:2)); }
    catch(e) { console.log(JSON.stringify({status:'failed',error:failure(e)}));process.exitCode=1; }
  }).command('status','Query the selected App debug session',common,handler(a=>({method:'status',device:a.device})))
    .command('docs <action> [value]','Search docs or read a returned document ID',y=>common(y).positional('action',{choices:['search','get'] as const}).positional('value',{type:'string'}).option('lang',{choices:['en','zh'] as const,default:'en'}).option('limit',{type:'number',default:20}),handler(a=>({method:a.action==='search'?'docs.search':'docs.get',device:a.device,query:a.action==='search'?a.value:undefined,docId:a.action==='get'?a.value:undefined,lang:a.lang,limit:a.limit})))
    .command('api <action> <symbol>','Read an exact Scripting API declaration',y=>common(y).positional('action',{choices:['get'] as const}).positional('symbol',{type:'string'}),handler(a=>({method:'api.get',device:a.device,symbol:a.symbol})))
    .command('run [project]','Sync and execute the current debug project',y=>runOptions(y),handler(a=>({method:'run',device:a.device,project:a.project,options:{screenshot:a.screenshot,captureAfter:a.captureAfter,timeout:a.timeout,noSync:a['no-sync'],queryParameters:a['query-parameters']?JSON.parse(a['query-parameters']):undefined}})))
    .command('widget [project]','Render the current project widget and close its preview',y=>runOptions(y,false).option('family',{type:'string',default:'systemSmall'}).option('parameter',{type:'string'}),handler(a=>({method:'widget',device:a.device,project:a.project,options:{screenshot:a.screenshot,timeout:a.timeout,noSync:a['no-sync'],family:a.family,parameter:a.parameter}})))
    .command('jobs <action> <id>','Read a recent result or cancel an owned run',y=>common(y).positional('action',{choices:['show','cancel'] as const}).positional('id',{type:'string'}),async (a:any)=>{
      try { const state=loadControl(process.cwd()); const route=`/v1/jobs/${encodeURIComponent(a.id)}${a.action==='cancel'?'/cancel':''}`; let job=(await controlRequest(state,route,a.action==='cancel'?{}:undefined)).result; if (job.result?.artifacts?.length) job.result=materializeArtifacts(job.result,job.runId,path.resolve(a.output)); console.log(JSON.stringify(job,null,a.json?undefined:2)); }
      catch(e) { console.log(JSON.stringify({status:'failed',error:failure(e)}));process.exitCode=1; }
    });
}
