import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { AgentError, safeRelativePath } from './agent_protocol';

export const documentationPath = 'docs/Scripting Documentation';
const marker = '.scripting-documentation.json';
const owner = 'scripting-cli.documentation.v1';
const publishing = new Set<string>();
const maxBytes = 32 * 1024 * 1024;

export function developmentWorkspace(workspace: string) {
  return { version: 1, workspaceId: crypto.createHash('sha256').update(os.hostname() + '\0' + fs.realpathSync(workspace)).digest('hex'), documentationSync: true, documentationPath };
}

function stat(file: string) {
  try { return fs.lstatSync(file); } catch (e: any) { if (e.code === 'ENOENT') return; throw e; }
}
function directory(file: string) {
  const value = stat(file);
  if (value && (!value.isDirectory() || value.isSymbolicLink())) throw new AgentError('invalid_path', 'Documentation directories cannot be symbolic links or files.');
  return value;
}
function checkTarget(parent: string, target: string, workspaceId: string) {
  if (!directory(parent)) throw new AgentError('invalid_path', 'Documentation parent disappeared.');
  if (!directory(target)) return;
  const receipt = path.join(target, marker), info = stat(receipt);
  if (!info?.isFile() || info.isSymbolicLink() || info.size > 1024) throw new AgentError('documentation_conflict', 'Move the existing docs/Scripting Documentation directory before syncing.');
  let value: any;
  try { value = JSON.parse(fs.readFileSync(receipt, 'utf8')); } catch { /* Report a conflict below. */ }
  if (value?.owner !== owner || value?.workspaceId !== workspaceId) throw new AgentError('documentation_conflict', 'The existing documentation directory is not managed by this workspace.');
}

// Independent of script/skill selection and watchers. A whole snapshot is
// published only after all writes complete and the original socket is live.
export async function syncDocumentation(workspace: string, raw: any, active: () => boolean) {
  const root = fs.realpathSync(workspace), { workspaceId } = developmentWorkspace(root);
  if (publishing.has(root)) throw new AgentError('busy', 'Documentation synchronization is already active.');
  if (raw?.version !== 1 || raw?.workspaceId !== workspaceId || !Array.isArray(raw.files) || !raw.files.length || raw.files.length > 5000) throw new AgentError('invalid_snapshot', 'Invalid documentation snapshot or workspace.');
  const files: { path: string; data: Buffer }[] = [], names = new Set<string>(), components = new Map<string, string>();
  let bytes = 0;
  for (const item of raw.files) {
    if (typeof item?.path !== 'string' || !safeRelativePath(item.path) || item.path.split('/').some((part: string) => part.startsWith('.')) || item.path.length > 1024 || typeof item.data !== 'string' || item.data.length > Math.ceil(8 * 1024 * 1024 / 3) * 4) throw new AgentError('invalid_path', 'Unsafe documentation path or content.');
    const portable = item.path.normalize('NFC').toLowerCase();
    if (names.has(portable)) throw new AgentError('invalid_path', 'Documentation paths collide.');
    names.add(portable);
    const parts = item.path.split('/');
    for (let count = 1; count <= parts.length; count++) {
      const original = parts.slice(0, count).join('/'), folded = original.normalize('NFC').toLowerCase();
      if (components.has(folded) && components.get(folded) !== original) throw new AgentError('invalid_path', 'Documentation directory names collide.');
      components.set(folded, original);
    }
    const data = Buffer.from(item.data, 'base64'); bytes += data.length;
    if (data.length > 8 * 1024 * 1024 || data.toString('base64') !== item.data || bytes > maxBytes) throw new AgentError('invalid_snapshot', 'Documentation exceeds the limit or contains invalid base64.');
    files.push({ path: item.path, data });
  }
  for (const name of names) {
    const parts = name.split('/'); parts.pop();
    while (parts.length) { if (names.has(parts.join('/'))) throw new AgentError('invalid_path', 'A documentation file is also a directory.'); parts.pop(); }
  }
  if (!names.has('doc.json')) throw new AgentError('invalid_snapshot', 'Documentation index is missing.');
  publishing.add(root);
  const parent = path.join(root, 'docs'), target = path.join(root, documentationPath);
  let stage: string | undefined, backup: string | undefined, keepRecovery = false;
  try {
    if (!active()) throw new AgentError('disconnected', 'The development connection ended.');
    if (!directory(parent)) fs.mkdirSync(parent);
    checkTarget(parent, target, workspaceId);
    const parentIdentity = fs.statSync(parent);
    // Keep staged writes outside docs: replacing docs with a symlink while an
    // upload is in progress must never redirect those writes. The final parent
    // identity check below still rejects publication into a replaced directory.
    stage = await fs.promises.mkdtemp(path.join(root, '.scripting-docs-stage-'));
    for (const file of files) {
      if (!active()) throw new AgentError('disconnected', 'The development connection ended.');
      const destination = path.join(stage, file.path);
      await fs.promises.mkdir(path.dirname(destination), { recursive: true });
      await fs.promises.writeFile(destination, file.data, { flag: 'wx' });
    }
    await fs.promises.writeFile(path.join(stage, marker), JSON.stringify({ owner, workspaceId }), { flag: 'wx' });
    // No await between final boundary/session validation and commit/rollback.
    checkTarget(parent, target, workspaceId);
    const currentParent = fs.statSync(parent);
    if (currentParent.dev !== parentIdentity.dev || currentParent.ino !== parentIdentity.ino || fs.realpathSync(parent) !== parent || !active()) throw new AgentError('disconnected', 'The workspace or development connection changed.');
    if (stat(target)) { backup = path.join(parent, '.scripting-docs-backup-' + crypto.randomUUID()); fs.renameSync(target, backup); }
    try { fs.renameSync(stage, target); stage = undefined; }
    catch (e) {
      if (backup) {
        try { fs.renameSync(backup, target); backup = undefined; }
        catch { keepRecovery = true; throw new AgentError('recovery_required', 'Preserve the documentation stage and backup directories for recovery.'); }
      }
      throw e;
    }
    return { success: true, path: documentationPath, fileCount: files.length };
  } finally {
    try {
      if (!keepRecovery) {
        if (stage) await fs.promises.rm(stage, { recursive: true, force: true });
        if (backup) await fs.promises.rm(backup, { recursive: true, force: true });
      }
    } finally { publishing.delete(root); }
  }
}
