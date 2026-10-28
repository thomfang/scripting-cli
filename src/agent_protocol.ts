import fs from 'fs';
import { scriptMethod, scriptError } from './dev_terms';
import path from 'path';
import crypto from 'crypto';
import { isIgnoredPath } from './util';

export const PROTOCOL_VERSION = 1;
export const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
export const MAX_FILES = 2000;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const widgetFamilies = ['systemSmall', 'systemMedium', 'systemLarge', 'systemExtraLarge', 'accessoryCircular', 'accessoryRectangular', 'accessoryInline'];
export class AgentError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export const hash = (bytes: crypto.BinaryLike) => crypto.createHash('sha256').update(bytes).digest('hex');
export interface SourceFile { path: string; sha256: string; data: string; }
export interface SourceSnapshot { revision: string; files: SourceFile[]; ignore: string[]; }
export interface WidgetCase { id: string; family: string; parameter?: string; screenshot: boolean; }
export interface AgentOptions { check?: boolean; events?: boolean; readyLog?: string; cases?: WidgetCase[]; replace?: boolean; expectedRevision?: string; timeout?: number; screenshot?: boolean; captureAfter?: number; family?: string; parameter?: string; noSync?: boolean; queryParameters?: Record<string, unknown>; }
export interface AgentCommand { method: string; device?: string; script?: string; /** @deprecated Compatibility input for protocol-v1 clients. */ project?: string; skill?: string; entry?: string; options?: AgentOptions; query?: string; docId?: string; symbol?: string; lang?: string; limit?: number; requestId?: string; }
export const methods = ['status', 'docs.search', 'docs.get', 'api.get', 'run', 'widget', 'widget.batch', 'scripts.list', 'scripts.inspect', 'scripts.create', 'scripts.attach', 'skills.run'];
export function validateCommand(value: any): AgentCommand {
  if(value && typeof value==='object' && !Array.isArray(value)) {
    if(value.script!==undefined && value.project!==undefined && value.script!==value.project) throw new AgentError('invalid_request','Conflicting script names.');
    const {project,...canonical}=value;
    value={...canonical,method:typeof value.method==='string'?scriptMethod(value.method):value.method,script:value.script??project};
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || !methods.includes(value.method)) throw new AgentError('invalid_request', 'Unknown command.');
  for (const key of ['device', 'script', 'query', 'docId', 'symbol', 'requestId', 'skill', 'entry']) {
    if (value[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > 1024)) throw new AgentError('invalid_request', `Invalid ${key}.`);
  }
  if (value.lang !== undefined && !['en', 'zh'].includes(value.lang)) throw new AgentError('invalid_request', 'Language must be en or zh.');
  if (value.limit !== undefined && (!Number.isInteger(value.limit) || value.limit < 1 || value.limit > 50)) throw new AgentError('invalid_request', 'Limit must be 1...50.');
  if (value.method === 'docs.get' && !value.docId) throw new AgentError('invalid_request','A document ID is required.');
  if (value.method === 'api.get' && !value.symbol) throw new AgentError('invalid_request','An API symbol is required.');
  const o = value.options ?? {};
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw new AgentError('invalid_request', 'Invalid options.');
  for (const k of ['screenshot', 'noSync', 'replace', 'events', 'check']) if (o[k] !== undefined && typeof o[k] !== 'boolean') throw new AgentError('invalid_request', `Invalid ${k}.`);
  if (o.timeout !== undefined && (!Number.isFinite(o.timeout) || o.timeout < 1 || o.timeout > 120)) throw new AgentError('invalid_request', 'Timeout must be 1...120 seconds.');
  if (o.captureAfter !== undefined && (!Number.isFinite(o.captureAfter) || o.captureAfter < 0 || o.captureAfter > 10)) throw new AgentError('invalid_request', 'Capture delay must be 0...10 seconds.');
  if (o.family !== undefined && !widgetFamilies.includes(o.family)) throw new AgentError('invalid_request', 'Unsupported widget family.');
  if (o.parameter !== undefined && (typeof o.parameter !== 'string' || o.parameter.length > 16384)) throw new AgentError('invalid_request', 'Invalid widget parameter.');
  if (o.queryParameters !== undefined && (!o.queryParameters || typeof o.queryParameters !== 'object' || Array.isArray(o.queryParameters) || Buffer.byteLength(JSON.stringify(o.queryParameters)) > 65536)) throw new AgentError('invalid_request', 'Invalid query parameters.');
  if (o.readyLog !== undefined && (value.method !== 'run' || !o.screenshot || typeof o.readyLog !== 'string' || !o.readyLog.length || Buffer.byteLength(o.readyLog)>1024 || /[\r\n]/.test(o.readyLog))) throw new AgentError('invalid_request','Ready log requires script screenshot mode and one exact line.');
  if (o.expectedRevision !== undefined && (typeof o.expectedRevision!=='string' || !/^[a-f0-9]{64}$/.test(o.expectedRevision))) throw new AgentError('invalid_request','Invalid expected revision.');
  if (value.method.startsWith('scripts.') && value.method!=='scripts.list' && !validPackageName(value.script)) throw new AgentError('invalid_script','A safe script name is required.');
  if (value.method==='widget.batch') {
    if (!Array.isArray(o.cases) || o.cases.length<1 || o.cases.length>8) throw new AgentError('invalid_request','Supply 1...8 widget cases.');
    const ids=new Set<string>();
    for (const c of o.cases) {
      if (!c || typeof c!=='object' || typeof c.id!=='string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(c.id) || ids.has(c.id) || !widgetFamilies.includes(c.family) || typeof c.screenshot!=='boolean' || (c.parameter!==undefined && (typeof c.parameter!=='string'||c.parameter.length>16384))) throw new AgentError('invalid_request','Invalid or duplicate widget case.');
      ids.add(c.id);
    }
  }
  if(value.method==='skills.run' && (!validPackageName(value.skill) || typeof value.entry!=='string' || !safeRelativePath(value.entry) || !/\.tsx?$/.test(value.entry) || o.screenshot || o.readyLog || o.noSync)) throw new AgentError('invalid_request','Specify a skill name and a skill-relative .ts/.tsx entry.');
  return { ...value, options: o };
}
export function validPackageName(value: unknown): value is string { return typeof value==='string' && value.length>0 && Buffer.byteLength(value)<256 && value!=='.' && value!=='..' && !value.startsWith('.') && !/[\/\\:\x00-\x1f\x7f]/.test(value); }
export function safeRelativePath(value: string): boolean {
  return Buffer.byteLength(value) > 0 && Buffer.byteLength(value) < 1024 && !/[\\:\x00-\x1f\x7f]/.test(value) && !path.posix.isAbsolute(value) && value.split('/').length <= 32 && value.split('/').every(p => !!p && p !== '.' && p !== '..');
}
export function revisionForFiles(files: Pick<SourceFile, 'path' | 'sha256'>[]): string {
  return hash([...files].sort((a,b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path))).map(f => `${f.path}\0${f.sha256}\n`).join(''));
}
export async function snapshotSource(workspace: string, name: string, ignore: string[], kind: 'scripts' | 'skills' = 'scripts'): Promise<SourceSnapshot> {
  if (!validPackageName(name)) throw new AgentError(kind==='skills'?'invalid_skill':'invalid_script', 'Invalid source name.');
  const root = path.join(workspace, kind, name);
  const scripts = await fs.promises.realpath(path.join(workspace, kind));
  if ((await fs.promises.realpath(root)) !== path.join(scripts, name) || (await fs.promises.lstat(root)).isSymbolicLink()) throw new AgentError('invalid_path', 'Source symlinks are unsupported.');
  const files: SourceFile[] = []; let bytes = 0;
  const stamps: {full:string;ino:number;mtimeMs:number;size:number}[]=[];
  async function visit(relative: string) {
    for (const name of (await fs.promises.readdir(path.join(root, relative))).sort()) {
      const file = relative ? `${relative}/${name}` : name;
      if (isIgnoredPath(file, ignore)) continue;
      if (!safeRelativePath(file)) throw new AgentError('invalid_path', `Unsupported source path: ${file}`);
      const full = path.join(root, file); const before = await fs.promises.lstat(full);
      if (before.isSymbolicLink()) throw new AgentError('invalid_path', `Source symlink: ${file}`);
      if (before.isDirectory()) { await visit(file); continue; }
      if (!before.isFile()) throw new AgentError('invalid_path', `Not a regular file: ${file}`);
      if (bytes + before.size > MAX_SOURCE_BYTES || files.length >= MAX_FILES) throw new AgentError('source_limit', 'Source snapshot exceeds 8 MiB or 2000 files.');
      const handle=await fs.promises.open(full,fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
      let data:Buffer, after:fs.Stats;
      try {
        const opened=await handle.stat();
        if (!opened.isFile() || opened.ino!==before.ino) throw new AgentError('source_changed','Source was replaced during capture.');
        const buffer=Buffer.alloc(before.size+1);let read=0;
        while(read<buffer.length) { const result=await handle.read(buffer,read,buffer.length-read,read);if(!result.bytesRead)break;read+=result.bytesRead; }
        data=buffer.subarray(0,read);after=await handle.stat();
      } finally { await handle.close(); }
      const named=await fs.promises.lstat(full);
      if (before.ino !== after.ino || before.ino!==named.ino || named.isSymbolicLink() || before.mtimeMs !== after.mtimeMs || before.size !== data.length || after.size !== data.length) throw new AgentError('source_changed', 'Source changed while taking the snapshot; retry explicitly.');
      stamps.push({full,ino:after.ino,mtimeMs:after.mtimeMs,size:after.size});
      bytes += data.length; files.push({ path: file, sha256: hash(data), data: data.toString('base64') });
    }
  }
  await visit('');
  for (const stamp of stamps) {
    const final=await fs.promises.lstat(stamp.full);
    if (!final.isFile() || final.isSymbolicLink() || final.ino!==stamp.ino || final.mtimeMs!==stamp.mtimeMs || final.size!==stamp.size) throw new AgentError('source_changed','Source changed during the snapshot; retry explicitly.');
  }
  return { files, revision: revisionForFiles(files), ignore: [...ignore] };
}
export const snapshotScript = snapshotSource;
/** @deprecated Protocol-v1 compatibility exports. */
export const snapshotProject = snapshotSource;
export const validProjectName = validPackageName;
export function failure(error: unknown) {
  return scriptError({ code: error instanceof AgentError ? error.code : 'internal_error', message: error instanceof Error ? error.message : String(error) });
}

/** A delayed watcher notification for bytes already applied by this job must
 * not trigger a second automatic run. Changes made after the snapshot remain. */
export function isAcknowledgedChange(workspace: string, script: string, relative: string, snapshot: SourceSnapshot): boolean {
  if (!safeRelativePath(relative)) return false;
  const expected=snapshot.files.find(file=>file.path===relative);
  const file=path.join(workspace,'scripts',script,relative);
  if (!fs.existsSync(file)) return expected===undefined;
  if (!expected || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) return false;
  try { return hash(fs.readFileSync(file))===expected.sha256; } catch { return false; }
}
