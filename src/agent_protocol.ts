import fs from 'fs';
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
export interface AgentOptions { timeout?: number; screenshot?: boolean; captureAfter?: number; family?: string; parameter?: string; noSync?: boolean; queryParameters?: Record<string, unknown>; }
export interface AgentCommand { method: string; device?: string; project?: string; options?: AgentOptions; query?: string; docId?: string; symbol?: string; lang?: string; limit?: number; requestId?: string; }
export const methods = ['status', 'docs.search', 'docs.get', 'api.get', 'run', 'widget'];
export function validateCommand(value: any): AgentCommand {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !methods.includes(value.method)) throw new AgentError('invalid_request', 'Unknown command.');
  for (const key of ['device', 'project', 'query', 'docId', 'symbol', 'requestId']) {
    if (value[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > 1024)) throw new AgentError('invalid_request', `Invalid ${key}.`);
  }
  if (value.lang !== undefined && !['en', 'zh'].includes(value.lang)) throw new AgentError('invalid_request', 'Language must be en or zh.');
  if (value.limit !== undefined && (!Number.isInteger(value.limit) || value.limit < 1 || value.limit > 50)) throw new AgentError('invalid_request', 'Limit must be 1...50.');
  if (value.method === 'docs.get' && !value.docId) throw new AgentError('invalid_request','A document ID is required.');
  if (value.method === 'api.get' && !value.symbol) throw new AgentError('invalid_request','An API symbol is required.');
  const o = value.options ?? {};
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw new AgentError('invalid_request', 'Invalid options.');
  for (const k of ['screenshot', 'noSync']) if (o[k] !== undefined && typeof o[k] !== 'boolean') throw new AgentError('invalid_request', `Invalid ${k}.`);
  if (o.timeout !== undefined && (!Number.isFinite(o.timeout) || o.timeout < 1 || o.timeout > 120)) throw new AgentError('invalid_request', 'Timeout must be 1...120 seconds.');
  if (o.captureAfter !== undefined && (!Number.isFinite(o.captureAfter) || o.captureAfter < 0 || o.captureAfter > 10)) throw new AgentError('invalid_request', 'Capture delay must be 0...10 seconds.');
  if (o.family !== undefined && !widgetFamilies.includes(o.family)) throw new AgentError('invalid_request', 'Unsupported widget family.');
  if (o.parameter !== undefined && (typeof o.parameter !== 'string' || o.parameter.length > 16384)) throw new AgentError('invalid_request', 'Invalid widget parameter.');
  if (o.queryParameters !== undefined && (!o.queryParameters || typeof o.queryParameters !== 'object' || Array.isArray(o.queryParameters) || Buffer.byteLength(JSON.stringify(o.queryParameters)) > 65536)) throw new AgentError('invalid_request', 'Invalid query parameters.');
  return { ...value, options: o };
}
export function safeRelativePath(value: string): boolean {
  return Buffer.byteLength(value) > 0 && Buffer.byteLength(value) < 1024 && !/[\\:\x00-\x1f\x7f]/.test(value) && !path.posix.isAbsolute(value) && value.split('/').length <= 32 && value.split('/').every(p => !!p && p !== '.' && p !== '..');
}
export function revisionForFiles(files: Pick<SourceFile, 'path' | 'sha256'>[]): string {
  return hash([...files].sort((a,b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path))).map(f => `${f.path}\0${f.sha256}\n`).join(''));
}
export async function snapshotProject(workspace: string, project: string, ignore: string[]): Promise<SourceSnapshot> {
  if (!project || project === '.' || project === '..' || /[\/\\\x00-\x1f]/.test(project)) throw new AgentError('invalid_project', 'Invalid project name.');
  const root = path.join(workspace, 'scripts', project);
  const scripts = await fs.promises.realpath(path.join(workspace, 'scripts'));
  if ((await fs.promises.realpath(root)) !== path.join(scripts, project) || (await fs.promises.lstat(root)).isSymbolicLink()) throw new AgentError('invalid_project', 'Project symlinks are unsupported.');
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
export function failure(error: unknown) {
  return { code: error instanceof AgentError ? error.code : 'internal_error', message: error instanceof Error ? error.message : String(error) };
}

/** A delayed watcher notification for bytes already applied by this job must
 * not trigger a second automatic run. Changes made after the snapshot remain. */
export function isAcknowledgedChange(workspace: string, project: string, relative: string, snapshot: SourceSnapshot): boolean {
  if (!safeRelativePath(relative)) return false;
  const expected=snapshot.files.find(file=>file.path===relative);
  const file=path.join(workspace,'scripts',project,relative);
  if (!fs.existsSync(file)) return expected===undefined;
  if (!expected || fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) return false;
  try { return hash(fs.readFileSync(file))===expected.sha256; } catch { return false; }
}
