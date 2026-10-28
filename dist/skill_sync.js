"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillSyncController = void 0;
exports.skillIgnores = skillIgnores;
exports.validateSkillSnapshot = validateSkillSnapshot;
exports.snapshotSkill = snapshotSkill;
exports.inspectSkill = inspectSkill;
exports.applySkillSnapshot = applySkillSnapshot;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const chokidar_1 = __importDefault(require("chokidar"));
const agent_protocol_1 = require("./agent_protocol");
const util_1 = require("./util");
// Package metadata belongs to the App. It must survive development publication.
function skillIgnores(ignore) { return [...new Set(['/skill.json', ...ignore])]; }
function validateSkillSnapshot(raw) {
    if (!raw || !Array.isArray(raw.files) || raw.files.length > agent_protocol_1.MAX_FILES || !Array.isArray(raw.ignore) || raw.ignore.length > 100 || raw.ignore.some((p) => typeof p !== 'string' || Buffer.byteLength(p) > 1024) || !raw.ignore.includes('/skill.json'))
        throw new agent_protocol_1.AgentError('invalid_snapshot', 'Invalid skill manifest.');
    let bytes = 0;
    const seen = new Set(), portableNames = new Set();
    for (const file of raw.files) {
        if (!file || typeof file.path !== 'string' || !(0, agent_protocol_1.safeRelativePath)(file.path) || seen.has(file.path) || (0, util_1.isIgnoredPath)(file.path, raw.ignore) || typeof file.data !== 'string' || file.data.length > Math.ceil(agent_protocol_1.MAX_SOURCE_BYTES / 3) * 4)
            throw new agent_protocol_1.AgentError('invalid_snapshot', 'Unsafe skill source.');
        const portable = file.path.normalize('NFC').toLowerCase();
        if (portableNames.has(portable))
            throw new agent_protocol_1.AgentError('invalid_path', 'Source names differ only in case or normalization.');
        portableNames.add(portable);
        seen.add(file.path);
        const data = Buffer.from(file.data, 'base64');
        bytes += data.length;
        if (bytes > agent_protocol_1.MAX_SOURCE_BYTES || data.toString('base64') !== file.data || (0, agent_protocol_1.hash)(data) !== file.sha256)
            throw new agent_protocol_1.AgentError('invalid_snapshot', 'Skill content exceeds the limit or has a bad digest.');
    }
    if ((0, agent_protocol_1.revisionForFiles)(raw.files) !== raw.revision)
        throw new agent_protocol_1.AgentError('revision_mismatch', 'Skill manifest digest does not match.');
    const skill = raw.files.find((f) => f.path === 'SKILL.md');
    const markdown = skill ? Buffer.from(skill.data, 'base64').toString('utf8') : '';
    const front = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (!front || !['name', 'description'].every(key => front.split(/\r?\n/).some(line => line.startsWith(key + ':') && line.slice(key.length + 1).trim().replace(/^["']|["']$/g, '').trim())))
        throw new agent_protocol_1.AgentError('invalid_skill', 'SKILL.md needs name and description in its frontmatter.');
    return raw;
}
async function snapshotSkill(workspace, name, ignore) {
    ensureRoot(workspace);
    return validateSkillSnapshot(await (0, agent_protocol_1.snapshotSource)(workspace, name, skillIgnores(ignore), 'skills'));
}
function ensureRoot(workspace) {
    const root = path_1.default.join(workspace, 'skills');
    if (fs_1.default.existsSync(root)) {
        if (fs_1.default.lstatSync(root).isSymbolicLink() || !fs_1.default.statSync(root).isDirectory())
            throw new agent_protocol_1.AgentError('invalid_path', 'skills must be a regular directory.');
    }
    else
        fs_1.default.mkdirSync(root);
    return root;
}
async function inspectSkill(workspace, name, ignore) {
    if (!(0, agent_protocol_1.validPackageName)(name))
        throw new agent_protocol_1.AgentError('invalid_skill', 'Invalid skill directory name.');
    const root = path_1.default.join(ensureRoot(workspace), name);
    try {
        await fs_1.default.promises.lstat(root);
    }
    catch (e) {
        if (e.code === 'ENOENT')
            return;
        throw e;
    }
    return snapshotSkill(workspace, name, ignore);
}
async function applySkillSnapshot(workspace, name, raw, expected) {
    if (!(0, agent_protocol_1.validPackageName)(name))
        throw new agent_protocol_1.AgentError('invalid_skill', 'Invalid skill directory name.');
    const snapshot = validateSkillSnapshot(raw), parent = ensureRoot(workspace), root = path_1.default.join(parent, name);
    const stage = await fs_1.default.promises.mkdtemp(path_1.default.join(parent, '.skill-stage-'));
    const backup = path_1.default.join(parent, '.skill-backup-' + crypto_1.default.randomUUID());
    let moved = false, published = false, retainRecovery = false;
    try {
        for (const file of snapshot.files) {
            const target = path_1.default.join(stage, file.path);
            await fs_1.default.promises.mkdir(path_1.default.dirname(target), { recursive: true });
            await fs_1.default.promises.writeFile(target, Buffer.from(file.data, 'base64'));
        }
        for (const file of snapshot.files) {
            const target = path_1.default.join(stage, file.path);
            if (path_1.default.relative(fs_1.default.realpathSync(stage), fs_1.default.realpathSync(target)).split(path_1.default.sep).join('/') !== file.path || (0, agent_protocol_1.hash)(fs_1.default.readFileSync(target)) !== file.sha256)
                throw new agent_protocol_1.AgentError('invalid_path', 'Source names collide on this filesystem.');
        }
        // No await between the final version check and the directory swap. Changes
        // from this server cannot interleave publication; external edits conflict.
        const current = await inspectSkill(workspace, name, snapshot.ignore);
        if ((current?.revision ?? null) !== expected)
            throw new agent_protocol_1.AgentError('skill_conflict', 'Desktop skill changed. Select the source again.');
        const preserved = [];
        const movedPaths = [];
        if (current) {
            const collect = (dir, relative = '') => {
                for (const item of fs_1.default.readdirSync(dir, { withFileTypes: true })) {
                    const rel = relative ? relative + '/' + item.name : item.name;
                    if ((0, util_1.isIgnoredPath)(rel, snapshot.ignore))
                        preserved.push(rel);
                    else if (item.isDirectory())
                        collect(path_1.default.join(root, rel), rel);
                }
            };
            collect(root);
            fs_1.default.renameSync(root, backup);
            moved = true;
        }
        try {
            for (const rel of preserved) {
                const target = path_1.default.join(stage, rel);
                fs_1.default.mkdirSync(path_1.default.dirname(target), { recursive: true });
                fs_1.default.renameSync(path_1.default.join(backup, rel), target);
                movedPaths.push(rel);
            }
            fs_1.default.renameSync(stage, root);
            published = true;
        }
        catch (e) {
            if (moved) {
                try {
                    for (const rel of movedPaths.reverse()) {
                        const target = path_1.default.join(backup, rel);
                        fs_1.default.mkdirSync(path_1.default.dirname(target), { recursive: true });
                        fs_1.default.renameSync(path_1.default.join(stage, rel), target);
                    }
                    fs_1.default.renameSync(backup, root);
                }
                catch {
                    retainRecovery = true;
                    throw new agent_protocol_1.AgentError('recovery_required', `Preserve ${backup} and ${stage} for recovery.`);
                }
            }
            throw e;
        }
        return snapshot;
    }
    finally {
        if (!retainRecovery) {
            await fs_1.default.promises.rm(stage, { recursive: true, force: true }).catch(() => { });
            if (published && moved)
                await fs_1.default.promises.rm(backup, { recursive: true, force: true }).catch(() => { });
        }
    }
}
class SkillSyncController {
    socket;
    workspace;
    ignore;
    beforeBind;
    binding;
    watcher;
    catalog;
    timer;
    catalogTimer;
    tail = Promise.resolve();
    pauses = 0;
    closed = false;
    constructor(socket, workspace, ignore, beforeBind) {
        this.socket = socket;
        this.workspace = workspace;
        this.ignore = ignore;
        this.beforeBind = beforeBind;
        socket.on('skillSyncRequest', (request, ack) => {
            void this.serial(async () => {
                try {
                    if (typeof ack !== 'function')
                        return;
                    ack({ success: true, ...await this.request(request) });
                }
                catch (e) {
                    if (typeof ack === 'function')
                        ack({ error: (0, agent_protocol_1.failure)(e) });
                }
            });
        });
        socket.emit('skillSyncHello', { version: 1 });
    }
    serial(work) { const result = this.tail.then(work); this.tail = result.catch(() => { }); return result; }
    selected() { const b = this.binding; return b?.ready && !b.blocked ? { name: b.name, bindingId: b.id, revision: b.revision } : null; }
    async drain() { await this.tail; }
    pause() { this.pauses++; }
    resume(snapshot) {
        this.pauses = Math.max(0, this.pauses - 1);
        if (snapshot && this.binding)
            this.binding.revision = snapshot.revision;
        this.schedule();
    }
    async stop() {
        this.binding = undefined;
        if (this.timer)
            clearTimeout(this.timer);
        const watcher = this.watcher;
        this.watcher = undefined;
        await watcher?.close();
    }
    async close() { this.closed = true; await this.stop(); if (this.catalogTimer)
        clearTimeout(this.catalogTimer); await this.catalog?.close(); }
    async names() {
        const root = ensureRoot(this.workspace);
        return fs_1.default.readdirSync(root, { withFileTypes: true }).filter(item => item.isDirectory() && !item.isSymbolicLink() && (0, agent_protocol_1.validPackageName)(item.name) && fs_1.default.existsSync(path_1.default.join(root, item.name, 'SKILL.md'))).map(x => x.name).sort().slice(0, 1000);
    }
    watchCatalog() {
        if (this.catalog)
            return;
        this.catalog = chokidar_1.default.watch(ensureRoot(this.workspace), { depth: 1, ignoreInitial: true, ignored: p => path_1.default.relative(path_1.default.join(this.workspace, 'skills'), p).split(path_1.default.sep).some(x => x.startsWith('.') || x === 'node_modules') });
        const refresh = () => { if (this.catalogTimer)
            clearTimeout(this.catalogTimer); this.catalogTimer = setTimeout(() => { void this.names().then(names => this.socket.emit('skillSyncCatalog', { version: 1, names })).catch(() => { }); }, 200); };
        this.catalog.on('add', refresh).on('unlink', refresh).on('addDir', refresh).on('unlinkDir', refresh).on('error', () => { });
    }
    async request(r) {
        if (this.closed || !this.socket.connected)
            throw new agent_protocol_1.AgentError('disconnected', 'Skill connection ended.');
        if (r?.version !== 1)
            throw new agent_protocol_1.AgentError('unsupported_capability', 'Unsupported skill sync version.');
        if (r.method === 'list') {
            this.watchCatalog();
            return { names: await this.names(), ignore: skillIgnores(this.ignore) };
        }
        if (r.method === 'inspect')
            return { snapshot: await inspectSkill(this.workspace, r.name, this.ignore) ?? null };
        if (this.pauses)
            throw new agent_protocol_1.AgentError('busy', 'A desktop run is active.');
        if (r.method === 'stop') {
            if (this.binding && r.bindingId !== this.binding.id)
                throw new agent_protocol_1.AgentError('skill_mismatch', 'The skill binding changed.');
            await this.stop();
            return {};
        }
        if (r.method === 'bind') {
            if (!(0, agent_protocol_1.validPackageName)(r.name) || typeof r.bindingId !== 'string' || !/^[a-f0-9-]{36}$/i.test(r.bindingId))
                throw new agent_protocol_1.AgentError('invalid_request', 'Invalid skill binding.');
            await this.beforeBind();
            await this.stop();
            const files = r.types;
            if (!files || typeof files !== 'object' || Array.isArray(files) || Object.keys(files).length > 16 || !files['global.d.ts'] || !files['scripting.d.ts'] || Object.entries(files).some(([name, content]) => !(/^[a-zA-Z0-9_-]+\.d\.ts$/.test(name)) || typeof content !== 'string') || Buffer.byteLength(JSON.stringify(files)) > 8 * 1024 * 1024)
                throw new agent_protocol_1.AgentError('invalid_request', 'Invalid declaration bundle.');
            const dts = path_1.default.join(this.workspace, 'dts');
            if (fs_1.default.existsSync(dts) && fs_1.default.lstatSync(dts).isSymbolicLink())
                throw new agent_protocol_1.AgentError('invalid_path', 'Type directory cannot be a symlink.');
            for (const name of Object.keys(files))
                if (fs_1.default.existsSync(path_1.default.join(dts, name)) && fs_1.default.lstatSync(path_1.default.join(dts, name)).isSymbolicLink())
                    throw new agent_protocol_1.AgentError('invalid_path', 'Type file cannot be a symlink.');
            await (0, util_1.writeDtsFiles)(files, this.workspace);
            for (const [name, content] of Object.entries(files))
                if (fs_1.default.readFileSync(path_1.default.join(dts, name), 'utf8') !== content)
                    throw new agent_protocol_1.AgentError('sync_failed', 'Type declarations were not written.');
            let snapshot;
            if (r.snapshot) {
                const checked = validateSkillSnapshot(r.snapshot);
                if (JSON.stringify(checked.ignore) !== JSON.stringify(skillIgnores(this.ignore)))
                    throw new agent_protocol_1.AgentError('invalid_snapshot', 'Ignore configuration changed.');
                snapshot = await applySkillSnapshot(this.workspace, r.name, checked, r.expectedRevision ?? null);
            }
            else {
                snapshot = await inspectSkill(this.workspace, r.name, this.ignore);
                if (!snapshot || snapshot.revision !== r.expectedRevision)
                    throw new agent_protocol_1.AgentError('skill_conflict', 'Desktop skill changed. Select the source again.');
            }
            if (this.closed || !this.socket.connected)
                throw new agent_protocol_1.AgentError('disconnected', 'Connection ended before binding.');
            this.binding = { name: r.name, id: r.bindingId, revision: snapshot.revision, ready: false, blocked: false };
            return { snapshot };
        }
        if (r.method === 'ready') {
            const b = this.binding;
            if (!b || b.id !== r.bindingId || b.name !== r.name || b.revision !== r.revision)
                throw new agent_protocol_1.AgentError('skill_mismatch', 'The skill binding changed.');
            const root = path_1.default.join(this.workspace, 'skills', b.name);
            this.watcher = chokidar_1.default.watch(root, { ignoreInitial: true, ignored: p => (0, util_1.isIgnoredPath)(path_1.default.relative(root, p).split(path_1.default.sep).join('/'), skillIgnores(this.ignore)) });
            this.watcher.on('all', () => this.schedule()).on('ready', () => this.schedule()).on('error', e => this.block(b, e));
            b.ready = true;
            return {};
        }
        throw new agent_protocol_1.AgentError('invalid_request', 'Unknown skill sync method.');
    }
    schedule() { if (this.timer)
        clearTimeout(this.timer); if (this.closed)
        return; this.timer = setTimeout(() => { void this.serial(() => this.pump()); }, 200); }
    block(b, error) { if (this.binding !== b)
        return; b.blocked = true; this.socket.emit('skillSyncFailure', { bindingId: b.id, name: b.name, error: (0, agent_protocol_1.failure)(error) }); }
    async pump() {
        const b = this.binding;
        if (!b || !b.ready || b.blocked || this.pauses || this.closed)
            return;
        try {
            const snapshot = await snapshotSkill(this.workspace, b.name, this.ignore);
            if (this.binding !== b || this.pauses)
                return;
            if (snapshot.revision === b.revision)
                return;
            const reply = await new Promise((resolve, reject) => this.socket.timeout(10000).emit('skillSyncUpdate', { version: 1, name: b.name, bindingId: b.id, baseRevision: b.revision, snapshot }, (error, value) => error ? reject(new agent_protocol_1.AgentError('device_timeout', 'Skill synchronization was not acknowledged.')) : resolve(value)));
            if (this.binding !== b)
                return;
            if (reply?.success !== true || reply.revision !== snapshot.revision)
                throw new agent_protocol_1.AgentError(reply?.error?.code ?? 'sync_failed', reply?.error?.message ?? 'Skill publication failed.');
            b.revision = snapshot.revision;
            // Capture again after acknowledgement so saves during transmission remain.
            this.schedule();
        }
        catch (e) {
            this.block(b, e);
        }
    }
}
exports.SkillSyncController = SkillSyncController;
