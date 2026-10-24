"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentBroker = exports.AgentBroker = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const agent_protocol_1 = require("./agent_protocol");
const mutations = ['run', 'widget', 'widget.batch', 'projects.create', 'projects.attach'];
const projectChanges = ['projects.create', 'projects.attach'];
const terminal = (s) => ['completed', 'failed', 'cancelled'].includes(s);
class AgentBroker {
    workspace;
    eventLogs = new Map();
    peers = new Map();
    jobs = new Map();
    activeMutations = new Set();
    artifactDirectory;
    constructor(workspace) {
        this.workspace = workspace;
    }
    register(socket, hooks) {
        if (this.peers.size >= 64)
            return;
        const peer = { socket, hooks, pending: new Map() };
        this.peers.set(socket.id, peer);
        socket.on('agentHello', (meta) => {
            if (!meta || meta.protocolVersion !== 1 || typeof meta.deviceId !== 'string' || meta.deviceId.length > 128 || typeof meta.sessionId !== 'string' || meta.sessionId.length > 128 || !Array.isArray(meta.capabilities))
                return;
            // Duplicate installation IDs remain ambiguous. A second socket must not
            // take over a connected device merely by claiming its identifier.
            if (meta.capabilities.length > 16 || !meta.capabilities.every((value) => typeof value === 'string' && value.length < 64))
                return;
            if (peer.metadata && peer.metadata.sessionId !== meta.sessionId)
                this.invalidate(peer);
            peer.metadata = { protocolVersion: 1, deviceId: meta.deviceId, sessionId: meta.sessionId,
                name: typeof meta.name === 'string' ? meta.name.slice(0, 128) : 'Scripting device',
                appVersion: typeof meta.appVersion === 'string' ? meta.appVersion.slice(0, 64) : '',
                capabilities: [...meta.capabilities], ...this.statusFields(meta) };
        });
        socket.on('agentResult', (reply) => {
            const pending = peer.pending.get(reply?.requestId);
            if (!pending)
                return;
            const request = pending.request;
            if (reply.protocolVersion !== 1 || reply.sessionId !== request.sessionId || reply.runId !== request.runId || peer.metadata?.sessionId !== request.sessionId) {
                pending.reject(new agent_protocol_1.AgentError('invalid_response', 'Device returned mismatched result identity.'));
            }
            else
                pending.resolve(reply);
        });
        socket.on('agentTypes', async (data, ack) => {
            try {
                const pending = peer.pending.get(data?.requestId);
                if (!pending || !projectChanges.includes(pending.request.method) || pending.request.runId !== data.runId || pending.request.sessionId !== data.sessionId || peer.metadata?.sessionId !== data.sessionId || !hooks.types)
                    throw new agent_protocol_1.AgentError('invalid_request', 'No matching project admission.');
                const files = data.files;
                if (!files || typeof files !== 'object' || Array.isArray(files) || Object.keys(files).length > 16 || !files['scripting.d.ts'] || !files['global.d.ts'] || Object.entries(files).some(([name, content]) => !(/^[a-zA-Z0-9_-]+\.d\.ts$/.test(name)) || typeof content !== 'string') || Buffer.byteLength(JSON.stringify(files)) > 8 * 1024 * 1024)
                    throw new agent_protocol_1.AgentError('invalid_request', 'Invalid declaration bundle.');
                await hooks.types(files);
                if (typeof ack === 'function')
                    ack({ success: true });
            }
            catch (e) {
                if (typeof ack === 'function')
                    ack({ error: (0, agent_protocol_1.failure)(e) });
            }
        });
        socket.on('agentEvent', (event) => {
            const job = this.jobs.get(event?.runId), pending = peer.pending.get(event?.requestId);
            if (!job || !pending || terminal(job.status) || job.requestId !== event.requestId || job.sessionId !== event.sessionId || job.sessionId !== peer.metadata?.sessionId || pending.request.runId !== job.runId)
                return;
            if (event.type === 'stage' && ['syncing', 'compiling', 'running', 'waiting_ready', 'capturing', 'rendering', 'selecting_project'].includes(event.stage)) {
                if (!job.cancellationRequested)
                    job.status = event.stage;
                this.event(job, 'stage', { stage: event.stage, caseId: typeof event.caseId === 'string' ? event.caseId.slice(0, 64) : undefined });
            }
            else if (event.type === 'log' && typeof event.message === 'string') {
                this.event(job, 'log', { message: event.message.slice(0, 8192), isError: event.isError === true, caseId: typeof event.caseId === 'string' ? event.caseId.slice(0, 64) : undefined });
            }
            else if (event.type === 'diagnostic' && event.diagnostic && typeof event.diagnostic === 'object' && Buffer.byteLength(JSON.stringify(event.diagnostic)) <= 8192) {
                this.event(job, 'diagnostic', { diagnostic: event.diagnostic });
            }
        });
        // Protocol-v1 Apps still publish the original stage event.
        socket.on('agentJobState', (event) => {
            const job = this.jobs.get(event?.runId);
            if (job && peer.pending.has(job.requestId) && job.sessionId === event.sessionId && job.sessionId === peer.metadata?.sessionId && !terminal(job.status) && !job.cancellationRequested && ['syncing', 'running', 'capturing'].includes(event.status))
                job.status = event.status;
        });
        socket.on('disconnect', () => { this.invalidate(peer); this.peers.delete(socket.id); });
    }
    invalidate(peer) {
        for (const pending of peer.pending.values())
            pending.reject(new agent_protocol_1.AgentError('disconnected', 'Device session ended.'));
        for (const job of this.jobs.values())
            if (!terminal(job.status) && job.sessionId === peer.metadata?.sessionId) {
                job.status = 'failed';
                job.error = { code: 'disconnected', message: 'Device disconnected. The command was not replayed.' };
                job.cancel?.();
            }
    }
    select(device) {
        const peers = [...this.peers.values()].filter(p => p.socket.connected && p.metadata);
        const found = device ? peers.filter(p => p.metadata.deviceId === device) : peers;
        if (!found.length)
            throw new agent_protocol_1.AgentError('device_unavailable', 'No compatible device is connected.');
        if (found.length !== 1)
            throw new agent_protocol_1.AgentError('device_ambiguous', 'Select a device using --device.');
        return found[0];
    }
    call(peer, request, deadline) {
        return new Promise((resolve, reject) => {
            const finish = (value, error) => {
                clearTimeout(timer);
                peer.pending.delete(request.requestId);
                error ? reject(error) : resolve(value);
            };
            const timer = setTimeout(() => finish(undefined, new agent_protocol_1.AgentError('device_timeout', 'Device did not return a result before the deadline.')), Math.max(1, deadline - Date.now()));
            peer.pending.set(request.requestId, { request, resolve: value => finish(value), reject: error => finish(undefined, error) });
            peer.socket.emit('agentRequest', request);
        });
    }
    async devices() {
        return Promise.all([...this.peers.values()].filter(p => p.socket.connected && p.metadata).map(async (p) => {
            try {
                const id = crypto_1.default.randomUUID();
                const reply = await this.call(p, { protocolVersion: 1, method: 'status', requestId: id, runId: id, sessionId: p.metadata.sessionId }, Date.now() + 3000);
                return { ...p.metadata, ...this.statusFields(reply.result), responsive: reply.status === 'completed' };
            }
            catch {
                return { ...p.metadata, responsive: false };
            }
        }));
    }
    submit(raw) {
        this.prune();
        const command = (0, agent_protocol_1.validateCommand)(raw);
        const peer = this.select(command.device);
        const mutation = mutations.includes(command.method);
        const projectChange = projectChanges.includes(command.method);
        const requestId = command.requestId || crypto_1.default.randomUUID();
        if (!peer.metadata.capabilities.includes(command.method))
            throw new agent_protocol_1.AgentError('unsupported_capability', 'This App does not support the command.');
        if (command.options?.readyLog && !peer.metadata.capabilities.includes('ready-log') || command.options?.events && !peer.metadata.capabilities.includes('events-v1'))
            throw new agent_protocol_1.AgentError('unsupported_capability', 'This App does not support ready-log or live events.');
        if (mutation && !projectChange && (!peer.hooks.project() || peer.metadata.project !== peer.hooks.project()))
            throw new agent_protocol_1.AgentError('debug_session_required', 'Open the current project in the App debug page first.');
        const project = command.project ?? peer.hooks.project() ?? undefined;
        if (mutation && !projectChange && project !== peer.hooks.project())
            throw new agent_protocol_1.AgentError('project_mismatch', 'Commands can only run the currently selected debug project.');
        const fingerprint = (0, agent_protocol_1.hash)(JSON.stringify({ ...command, project, device: peer.metadata.deviceId }));
        const old = [...this.jobs.values()].find(j => j.requestId === requestId && j.sessionId === peer.metadata.sessionId);
        if (old) {
            if (old.fingerprint !== fingerprint)
                throw new agent_protocol_1.AgentError('request_id_reused', 'A request ID cannot be reused for a different command.');
            return this.publicJob(old);
        }
        if (mutation && this.activeMutations.has(peer.metadata.deviceId))
            throw new agent_protocol_1.AgentError('busy', 'Another device run is active.');
        if (this.jobs.size >= 64) {
            const done = [...this.jobs.values()].find(j => terminal(j.status));
            if (done) {
                this.removeArtifact(done);
                this.jobs.delete(done.runId);
                this.eventLogs.delete(done.runId);
            }
            else
                throw new agent_protocol_1.AgentError('busy', 'Too many outstanding requests.');
        }
        const job = { runId: crypto_1.default.randomUUID(), requestId, deviceId: peer.metadata.deviceId, sessionId: peer.metadata.sessionId, project: mutation ? project : undefined, status: 'accepted', createdAt: Date.now(), fingerprint };
        this.jobs.set(job.runId, job);
        this.event(job, 'stage', { stage: 'accepted' });
        job.cancel = () => peer.socket.emit('agentCancel', { runId: job.runId, sessionId: job.sessionId });
        void this.execute(job, peer, command, mutation);
        return this.publicJob(job);
    }
    async execute(job, peer, command, mutation) {
        const deadline = Date.now() + (command.options?.timeout ?? 30) * 1000;
        let acknowledgedSnapshot;
        if (mutation) {
            this.activeMutations.add(job.deviceId);
            peer.hooks.pause();
        }
        try {
            if (command.method === 'projects.create')
                this.scaffold(job.project);
            const snapshot = mutation && !command.options?.noSync ? await (0, agent_protocol_1.snapshotProject)(this.workspace, job.project, peer.hooks.ignore()) : undefined;
            if (terminal(job.status))
                return;
            // Cancellation during local snapshot capture precedes native admission.
            // Do not send a later request after its cancellation event was ignored.
            if (job.cancellationRequested) {
                job.status = 'cancelled';
                job.error = { code: 'cancelled', message: 'Cancelled before device admission.' };
                return;
            }
            if (Date.now() >= deadline)
                throw new agent_protocol_1.AgentError('execution_timeout', 'The command deadline expired while preparing source.');
            if (peer.metadata?.sessionId !== job.sessionId || !peer.socket.connected)
                throw new agent_protocol_1.AgentError('disconnected', 'The session changed before execution.');
            if (mutation && !projectChanges.includes(command.method) && peer.hooks.project() !== job.project)
                throw new agent_protocol_1.AgentError('project_mismatch', 'The debug project changed.');
            const request = { ...command, protocolVersion: 1, requestId: job.requestId, runId: job.runId, sessionId: job.sessionId, project: command.project ?? job.project, ignore: peer.hooks.ignore(), deadline, budgetMs: Math.max(1, deadline - Date.now()), snapshot };
            job.requestedRevision = snapshot?.revision;
            job.status = mutation ? 'syncing' : 'running';
            const reply = await this.call(peer, request, deadline + 3000);
            if (snapshot && reply.revision === snapshot.revision)
                acknowledgedSnapshot = snapshot;
            if (terminal(job.status))
                return;
            if (!terminal(reply.status))
                throw new agent_protocol_1.AgentError('invalid_response', 'Device did not return a terminal result.');
            if (mutation && reply.status === 'completed' && (!reply.revision || (snapshot && reply.revision !== snapshot.revision)))
                throw new agent_protocol_1.AgentError('invalid_response', 'Source revision did not match the applied snapshot.');
            if (reply.status === 'completed' && projectChanges.includes(command.method)) {
                if (!peer.hooks.switchProject)
                    throw new agent_protocol_1.AgentError('unsupported_capability', 'Server cannot change projects.');
                await peer.hooks.switchProject(job.project);
            }
            job.result = this.storeArtifact(reply.result, job.runId);
            job.status = reply.status;
            job.revision = reply.revision ?? job.revision;
            job.error = reply.error;
        }
        catch (e) {
            if (!terminal(job.status)) {
                job.status = 'failed';
                job.error = (0, agent_protocol_1.failure)(e);
                job.cancel?.();
            }
        }
        finally {
            if (mutation) {
                peer.hooks.resume(acknowledgedSnapshot);
                this.activeMutations.delete(job.deviceId);
            }
            job.cancel = undefined;
            this.event(job, 'stage', { stage: job.status });
        }
    }
    get(id) { this.prune(); const job = this.jobs.get(id); if (!job)
        throw new agent_protocol_1.AgentError('job_not_found', 'Unknown or expired run ID.'); return this.publicJob(job); }
    cancel(id) { const job = this.jobs.get(id); if (!job)
        throw new agent_protocol_1.AgentError('job_not_found', 'Unknown run ID.'); if (!terminal(job.status)) {
        job.cancellationRequested = true;
        job.status = 'cancelling';
        this.event(job, 'stage', { stage: 'cancelling' });
        job.cancel?.();
    } return this.publicJob(job); }
    publicJob(job) { const { cancel, fingerprint, ...copy } = job; return copy; }
    removeArtifact(job) {
        for (const artifact of job.result?.artifacts ?? []) {
            if (this.artifactDirectory && path_1.default.dirname(artifact.path) === this.artifactDirectory) {
                try {
                    fs_1.default.unlinkSync(artifact.path);
                }
                catch { }
            }
        }
        if (job.result?.artifacts) {
            job.result.artifacts = [];
            job.result.artifactsExpired = true;
        }
    }
    statusFields(value) {
        if (!value || typeof value !== 'object')
            return {};
        return {
            project: typeof value.project === 'string' ? value.project.slice(0, 255) : null,
            appState: ['foreground', 'background', 'inactive'].includes(value.appState) ? value.appState : 'unknown',
            busy: value.busy === true, revision: typeof value.revision === 'string' && /^[a-f0-9]{64}$/.test(value.revision) ? value.revision : null,
            activeRunId: typeof value.activeRunId === 'string' ? value.activeRunId.slice(0, 128) : null,
            backgroundKeeper: { status: typeof value.backgroundKeeper?.status === 'string' ? value.backgroundKeeper.status.slice(0, 32) : 'unknown', requested: value.backgroundKeeper?.requested === true, isActive: value.backgroundKeeper?.isActive === true, lastFailure: typeof value.backgroundKeeper?.lastFailure === 'string' ? value.backgroundKeeper.lastFailure.slice(0, 128) : null }
        };
    }
    storeArtifact(result, runId) {
        if (result?.artifacts !== undefined || result?.artifactsExpired !== undefined)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Device cannot supply host filesystem artifact paths.');
        const { image: _boundedImage, images: _boundedImages, ...textResult } = result ?? {};
        if (Buffer.byteLength(JSON.stringify(textResult)) > 1024 * 1024)
            throw new agent_protocol_1.AgentError('invalid_response', 'Text result exceeds 1 MiB.');
        const images = result?.images ?? (result?.image ? [{ ...result.image, id: 'screenshot' }] : []);
        if (!Array.isArray(images) || images.length > 8)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid image batch.');
        const ids = new Set();
        let totalBytes = 0;
        const decoded = images.map((image) => {
            if (!image || typeof image.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(image.id) || ids.has(image.id))
                throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid image case identity.');
            ids.add(image.id);
            if (typeof image.data !== 'string' || image.data.length > Math.ceil(agent_protocol_1.MAX_IMAGE_BYTES / 3) * 4 + 4)
                throw new agent_protocol_1.AgentError('invalid_artifact', 'Screenshot payload is too large.');
            const bytes = Buffer.from(image.data, 'base64');
            totalBytes += bytes.length;
            if (bytes.length < 24 || totalBytes > agent_protocol_1.MAX_IMAGE_BYTES || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || (0, agent_protocol_1.hash)(bytes) !== image.sha256 || bytes.readUInt32BE(16) < 1 || bytes.readUInt32BE(20) < 1 || bytes.readUInt32BE(16) > 8192 || bytes.readUInt32BE(20) > 8192 || bytes.readUInt32BE(16) * bytes.readUInt32BE(20) > 16777216)
                throw new agent_protocol_1.AgentError('invalid_artifact', 'Screenshot is not a bounded valid PNG.');
            return { image, bytes };
        });
        if (!decoded.length)
            return textResult;
        const retained = [...this.jobs.values()].filter(j => j.result?.artifacts?.length);
        while (retained.length >= 8)
            this.removeArtifact(retained.shift());
        this.artifactDirectory ??= fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'scripting-cli-artifacts-'));
        const artifacts = decoded.map(({ image, bytes }) => {
            const file = path_1.default.join(this.artifactDirectory, runId + '-' + image.id + '.png');
            fs_1.default.writeFileSync(file, bytes, { mode: 0o600, flag: 'wx' });
            return { id: image.id, path: file, mimeType: 'image/png', sha256: image.sha256, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
        });
        const { image: _image, images: _images, ...rest } = result;
        return { ...rest, artifacts };
    }
    event(job, type, data) {
        let log = this.eventLogs.get(job.runId);
        if (!log) {
            log = { sequence: 0, events: [], logBytes: 0, droppedLogs: false };
            this.eventLogs.set(job.runId, log);
        }
        if (type === 'log') {
            const count = Buffer.byteLength(String(data.message));
            if (log.logBytes + count > 65536) {
                log.droppedLogs = true;
                return;
            }
            log.logBytes += count;
        }
        log.events.push({ seq: ++log.sequence, type, runId: job.runId, requestId: job.requestId, deviceId: job.deviceId, sessionId: job.sessionId, ...data });
        if (log.events.length > 256)
            log.events.shift();
    }
    events(id, after) {
        const job = this.get(id), log = this.eventLogs.get(id);
        if (!Number.isSafeInteger(after) || after < 0)
            throw new agent_protocol_1.AgentError('invalid_cursor', 'Invalid event cursor.');
        const events = log?.events.filter(e => e.seq > after) ?? [];
        return { events, nextCursor: log?.sequence ?? 0, truncated: !!log?.events.length && after < log.events[0].seq - 1, terminal: terminal(job.status), logsTruncated: log?.droppedLogs === true };
    }
    scaffold(project) {
        const root = path_1.default.join(this.workspace, 'scripts', project);
        if (fs_1.default.existsSync(root))
            return;
        fs_1.default.mkdirSync(root, { recursive: false });
        fs_1.default.writeFileSync(path_1.default.join(root, 'script.json'), JSON.stringify({ name: project, version: '1.0.0', icon: 'curlybraces', color: 'systemBlue' }, null, 2), { flag: 'wx' });
        fs_1.default.writeFileSync(path_1.default.join(root, 'index.tsx'), 'import { Script } from "scripting"\nScript.exit({ message: "Hello Scripting" })\n', { flag: 'wx' });
    }
    prune(now = Date.now()) {
        for (const job of this.jobs.values())
            if (terminal(job.status) && now - job.createdAt > 15 * 60 * 1000) {
                this.removeArtifact(job);
                this.jobs.delete(job.runId);
                this.eventLogs.delete(job.runId);
            }
    }
    close() {
        for (const peer of this.peers.values())
            this.invalidate(peer);
        if (this.artifactDirectory) {
            fs_1.default.rmSync(this.artifactDirectory, { recursive: true, force: true });
            this.artifactDirectory = undefined;
        }
    }
}
exports.AgentBroker = AgentBroker;
exports.agentBroker = new AgentBroker(process.cwd());
