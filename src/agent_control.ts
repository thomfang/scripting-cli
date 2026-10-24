import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import crypto from 'crypto';
import express from 'express';
import { AgentBroker } from './agent_broker';
import { AgentError, failure, hash, MAX_IMAGE_BYTES } from './agent_protocol';

export interface ControlState { protocolVersion: 1; port: number; token: string; instanceId: string; workspace: string; }
export function statePath(workspace: string) {
  const user = typeof process.getuid === 'function' ? String(process.getuid()) : hash(os.userInfo().username).slice(0,16);
  return path.join(os.tmpdir(), `scripting-cli-${user}`, hash(fs.realpathSync(workspace)), 'server.json');
}
function privateDirectory(directory: string) {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new AgentError('unsafe_state', 'Private state directory cannot be a symlink.');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = fs.statSync(directory);
  if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw new AgentError('unsafe_state', 'Private state belongs to another user.');
  fs.chmodSync(directory, 0o700);
}
export function loadControl(workspace: string): ControlState {
  const file = statePath(workspace);
  if (!fs.existsSync(file)) throw new AgentError('server_unavailable','Start scripting-cli start in this workspace first.');
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || (typeof process.getuid === 'function' && (stat.uid !== process.getuid() || (stat.mode & 0o077) !== 0))) throw new AgentError('unsafe_state', 'Unsafe local control credentials.');
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (state.workspace !== fs.realpathSync(workspace) || state.protocolVersion !== 1 || !Number.isInteger(state.port) || state.port < 1 || state.port > 65535 || typeof state.token !== 'string' || !/^[0-9a-f]{64}$/.test(state.token)) throw new AgentError('invalid_state', 'Invalid local control state.');
  return state;
}
export async function controlRequest(state: ControlState, route: string, body?: unknown) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`http://127.0.0.1:${state.port}${route}`, { method: body === undefined ? 'GET' : 'POST', headers: { authorization: `Bearer ${state.token}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
    const value = await response.json() as any;
    if (!response.ok) throw new AgentError(value.error?.code ?? 'control_error', value.error?.message ?? 'Control request failed.');
    if (value.instanceId !== state.instanceId) throw new AgentError('stale_server', 'The local server instance changed.');
    return value;
  } catch(error) {
    if(error instanceof AgentError)throw error;
    throw new AgentError('control_unavailable','The local CLI service stopped responding. Execution was not replayed; inspect the App before retrying.');
  } finally { clearTimeout(timer); }
}
export async function startAgentControl(broker: AgentBroker) {
  const file = statePath(broker.workspace); privateDirectory(path.dirname(path.dirname(file))); privateDirectory(path.dirname(file));
  if (fs.existsSync(file)) {
    const old = loadControl(broker.workspace);
    let alive = false;
    try { await controlRequest(old, '/v1/info'); alive = true; } catch {}
    if (alive) throw new AgentError('server_already_running', 'A CLI server is already running for this workspace.');
    fs.unlinkSync(file);
  }
  const app = express(); const server = http.createServer(app);
  const state: ControlState = { protocolVersion: 1, port: 0, token: crypto.randomBytes(32).toString('hex'), instanceId: crypto.randomUUID(), workspace: fs.realpathSync(broker.workspace) };
  app.use((req,res,next) => {
    const expected = Buffer.from(`Bearer ${state.token}`); const supplied = Buffer.from(req.headers.authorization ?? '');
    if (req.socket.remoteAddress !== '127.0.0.1' || req.headers.origin || req.headers.host !== `127.0.0.1:${state.port}` || supplied.length !== expected.length || !crypto.timingSafeEqual(expected,supplied)) { res.status(403).json({ error: { code:'forbidden', message:'Local authenticated control only.' }}); return; }
    next();
  });
  app.use(express.json({ limit:'128kb' }));
  const send = (res: express.Response, result: unknown) => res.json({ instanceId:state.instanceId, result });
  app.get('/v1/info', (_req,res) => { send(res,{ protocolVersion:1, workspace:state.workspace }); });
  app.get('/v1/devices', async (_req,res,next) => { try { send(res,await broker.devices()); } catch(e) { next(e); } });
  app.post('/v1/requests', (req,res,next) => { try { send(res,broker.submit(req.body)); } catch(e) { next(e); } });
  app.get('/v1/jobs/:id', (req,res,next) => { try { send(res,broker.get(req.params.id)); } catch(e) { next(e); } });
  app.get('/v1/jobs/:id/events',(req,res,next)=>{try{send(res,broker.events(req.params.id,Number(req.query.after??0)));}catch(e){next(e);}});
  app.post('/v1/jobs/:id/cancel', (req,res,next) => { try { send(res,broker.cancel(req.params.id)); } catch(e) { next(e); } });
  app.use((_req,res) => { res.status(404).json({ error: {code:'not_found',message:'Unknown control route.'} }); });
  app.use((error: unknown,_req: express.Request,res: express.Response,_next: express.NextFunction) => { res.status(400).json({ error: failure(error) }); });
  await new Promise<void>((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
  state.port = (server.address() as {port:number}).port;
  try { fs.writeFileSync(file,JSON.stringify(state),{ mode:0o600, flag:'wx' }); } catch(e) { server.close(); throw e; }
  const sweep=setInterval(()=>broker.prune(),60000);sweep.unref();
  const cleanup = () => {
    clearInterval(sweep);broker.close();
    try {
      if (JSON.parse(fs.readFileSync(file,'utf8')).instanceId === state.instanceId) { fs.unlinkSync(file); fs.rmdirSync(path.dirname(file)); }
    } catch {}
  };
  const signalCleanup = () => {
    cleanup();server.close();
    // The existing Bonjour handler may finish sooner; otherwise stop this
    // server process after its private credentials have been removed.
    setTimeout(()=>process.exit(0),1000).unref();
  };
  process.once('exit',cleanup);process.once('SIGINT',signalCleanup);process.once('SIGTERM',signalCleanup);
  return { state, close: async () => {
    cleanup();process.removeListener('exit',cleanup);process.removeListener('SIGINT',signalCleanup);process.removeListener('SIGTERM',signalCleanup);
    await new Promise<void>(r => server.close(() => r()));
  } };
}

export function materializeArtifacts(result: any, runId: string, output: string) {
  if (!result?.artifacts?.length) return result;
  if (!/^[0-9a-f-]{36}$/i.test(runId)) throw new AgentError('invalid_artifact','Invalid run ID.');
  const artifacts=result.artifacts.map((image:any) => {
    if (typeof image.path !== 'string' || fs.lstatSync(image.path).isSymbolicLink()) throw new AgentError('invalid_artifact','Invalid screenshot source.');
    const size=fs.statSync(image.path).size;
    if (size>MAX_IMAGE_BYTES) throw new AgentError('invalid_artifact','Screenshot exceeds the image limit.');
    const bytes=fs.readFileSync(image.path);
    if (bytes.length<24 || bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a' || hash(bytes)!==image.sha256) throw new AgentError('invalid_artifact','Invalid PNG screenshot.');
    const directory=path.resolve(output,runId);fs.mkdirSync(directory,{recursive:true});
    if (fs.lstatSync(directory).isSymbolicLink()) throw new AgentError('invalid_artifact','Artifact directory cannot be a symlink.');
    if(image.id!==undefined && (typeof image.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(image.id))) throw new AgentError('invalid_artifact','Invalid image case ID.');
    const file=path.join(directory,(image.id??'screenshot')+'.png');
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isSymbolicLink() || hash(fs.readFileSync(file))!==image.sha256) throw new AgentError('artifact_exists','Output already exists with different content.');
    } else fs.writeFileSync(file,bytes,{flag:'wx',mode:0o600});
    return {...(image.id?{id:image.id}:{}),path:file,mimeType:'image/png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sha256:image.sha256};
  });
  return {...result,artifacts};
}
