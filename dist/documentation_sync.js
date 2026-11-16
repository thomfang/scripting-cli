"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentationPath = void 0;
exports.developmentWorkspace = developmentWorkspace;
exports.syncDocumentation = syncDocumentation;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const agent_protocol_1 = require("./agent_protocol");
exports.documentationPath = 'docs/Scripting Documentation';
const marker = '.scripting-documentation.json';
const owner = 'scripting-cli.documentation.v1';
const publishing = new Set();
const maxBytes = 32 * 1024 * 1024;
function developmentWorkspace(workspace) {
    return { version: 1, workspaceId: crypto_1.default.createHash('sha256').update(os_1.default.hostname() + '\0' + fs_1.default.realpathSync(workspace)).digest('hex'), documentationSync: true, documentationPath: exports.documentationPath };
}
function stat(file) {
    try {
        return fs_1.default.lstatSync(file);
    }
    catch (e) {
        if (e.code === 'ENOENT')
            return;
        throw e;
    }
}
function directory(file) {
    const value = stat(file);
    if (value && (!value.isDirectory() || value.isSymbolicLink()))
        throw new agent_protocol_1.AgentError('invalid_path', 'Documentation directories cannot be symbolic links or files.');
    return value;
}
function checkTarget(parent, target, workspaceId) {
    if (!directory(parent))
        throw new agent_protocol_1.AgentError('invalid_path', 'Documentation parent disappeared.');
    if (!directory(target))
        return;
    const receipt = path_1.default.join(target, marker), info = stat(receipt);
    if (!info?.isFile() || info.isSymbolicLink() || info.size > 1024)
        throw new agent_protocol_1.AgentError('documentation_conflict', 'Move the existing docs/Scripting Documentation directory before syncing.');
    let value;
    try {
        value = JSON.parse(fs_1.default.readFileSync(receipt, 'utf8'));
    }
    catch { /* Report a conflict below. */ }
    if (value?.owner !== owner || value?.workspaceId !== workspaceId)
        throw new agent_protocol_1.AgentError('documentation_conflict', 'The existing documentation directory is not managed by this workspace.');
}
// Independent of script/skill selection and watchers. A whole snapshot is
// published only after all writes complete and the original socket is live.
async function syncDocumentation(workspace, raw, active) {
    const root = fs_1.default.realpathSync(workspace), { workspaceId } = developmentWorkspace(root);
    if (publishing.has(root))
        throw new agent_protocol_1.AgentError('busy', 'Documentation synchronization is already active.');
    if (raw?.version !== 1 || raw?.workspaceId !== workspaceId || !Array.isArray(raw.files) || !raw.files.length || raw.files.length > 5000)
        throw new agent_protocol_1.AgentError('invalid_snapshot', 'Invalid documentation snapshot or workspace.');
    const files = [], names = new Set(), components = new Map();
    let bytes = 0;
    for (const item of raw.files) {
        if (typeof item?.path !== 'string' || !(0, agent_protocol_1.safeRelativePath)(item.path) || item.path.split('/').some((part) => part.startsWith('.')) || item.path.length > 1024 || typeof item.data !== 'string' || item.data.length > Math.ceil(8 * 1024 * 1024 / 3) * 4)
            throw new agent_protocol_1.AgentError('invalid_path', 'Unsafe documentation path or content.');
        const portable = item.path.normalize('NFC').toLowerCase();
        if (names.has(portable))
            throw new agent_protocol_1.AgentError('invalid_path', 'Documentation paths collide.');
        names.add(portable);
        const parts = item.path.split('/');
        for (let count = 1; count <= parts.length; count++) {
            const original = parts.slice(0, count).join('/'), folded = original.normalize('NFC').toLowerCase();
            if (components.has(folded) && components.get(folded) !== original)
                throw new agent_protocol_1.AgentError('invalid_path', 'Documentation directory names collide.');
            components.set(folded, original);
        }
        const data = Buffer.from(item.data, 'base64');
        bytes += data.length;
        if (data.length > 8 * 1024 * 1024 || data.toString('base64') !== item.data || bytes > maxBytes)
            throw new agent_protocol_1.AgentError('invalid_snapshot', 'Documentation exceeds the limit or contains invalid base64.');
        files.push({ path: item.path, data });
    }
    for (const name of names) {
        const parts = name.split('/');
        parts.pop();
        while (parts.length) {
            if (names.has(parts.join('/')))
                throw new agent_protocol_1.AgentError('invalid_path', 'A documentation file is also a directory.');
            parts.pop();
        }
    }
    if (!names.has('doc.json'))
        throw new agent_protocol_1.AgentError('invalid_snapshot', 'Documentation index is missing.');
    publishing.add(root);
    const parent = path_1.default.join(root, 'docs'), target = path_1.default.join(root, exports.documentationPath);
    let stage, backup, keepRecovery = false;
    try {
        if (!active())
            throw new agent_protocol_1.AgentError('disconnected', 'The development connection ended.');
        if (!directory(parent))
            fs_1.default.mkdirSync(parent);
        checkTarget(parent, target, workspaceId);
        const parentIdentity = fs_1.default.statSync(parent);
        // Keep staged writes outside docs: replacing docs with a symlink while an
        // upload is in progress must never redirect those writes. The final parent
        // identity check below still rejects publication into a replaced directory.
        stage = await fs_1.default.promises.mkdtemp(path_1.default.join(root, '.scripting-docs-stage-'));
        for (const file of files) {
            if (!active())
                throw new agent_protocol_1.AgentError('disconnected', 'The development connection ended.');
            const destination = path_1.default.join(stage, file.path);
            await fs_1.default.promises.mkdir(path_1.default.dirname(destination), { recursive: true });
            await fs_1.default.promises.writeFile(destination, file.data, { flag: 'wx' });
        }
        await fs_1.default.promises.writeFile(path_1.default.join(stage, marker), JSON.stringify({ owner, workspaceId }), { flag: 'wx' });
        // No await between final boundary/session validation and commit/rollback.
        checkTarget(parent, target, workspaceId);
        const currentParent = fs_1.default.statSync(parent);
        if (currentParent.dev !== parentIdentity.dev || currentParent.ino !== parentIdentity.ino || fs_1.default.realpathSync(parent) !== parent || !active())
            throw new agent_protocol_1.AgentError('disconnected', 'The workspace or development connection changed.');
        if (stat(target)) {
            backup = path_1.default.join(parent, '.scripting-docs-backup-' + crypto_1.default.randomUUID());
            fs_1.default.renameSync(target, backup);
        }
        try {
            fs_1.default.renameSync(stage, target);
            stage = undefined;
        }
        catch (e) {
            if (backup) {
                try {
                    fs_1.default.renameSync(backup, target);
                    backup = undefined;
                }
                catch {
                    keepRecovery = true;
                    throw new agent_protocol_1.AgentError('recovery_required', 'Preserve the documentation stage and backup directories for recovery.');
                }
            }
            throw e;
        }
        return { success: true, path: exports.documentationPath, fileCount: files.length };
    }
    finally {
        try {
            if (!keepRecovery) {
                if (stage)
                    await fs_1.default.promises.rm(stage, { recursive: true, force: true });
                if (backup)
                    await fs_1.default.promises.rm(backup, { recursive: true, force: true });
            }
        }
        finally {
            publishing.delete(root);
        }
    }
}
