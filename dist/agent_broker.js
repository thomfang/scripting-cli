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
const terminal = (s) => ['completed', 'failed', 'cancelled'].includes(s);
class AgentBroker {
    workspace;
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
        socket.on('agentJobState', (event) => {
            const job = this.jobs.get(event?.runId);
            if (job && !job.cancellationRequested && !terminal(job.status) && job.sessionId === peer.metadata?.sessionId && ['syncing', 'running', 'capturing'].includes(event?.status))
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
        const mutation = ['run', 'widget'].includes(command.method);
        const requestId = command.requestId || crypto_1.default.randomUUID();
        if (!peer.metadata.capabilities.includes(command.method))
            throw new agent_protocol_1.AgentError('unsupported_capability', 'This App does not support the command.');
        if (mutation && (!peer.hooks.project() || peer.metadata.project !== peer.hooks.project()))
            throw new agent_protocol_1.AgentError('debug_session_required', 'Open the current project in the App debug page first.');
        const project = command.project ?? peer.hooks.project() ?? undefined;
        if (mutation && project !== peer.hooks.project())
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
            }
            else
                throw new agent_protocol_1.AgentError('busy', 'Too many outstanding requests.');
        }
        const job = { runId: crypto_1.default.randomUUID(), requestId, deviceId: peer.metadata.deviceId, sessionId: peer.metadata.sessionId, project: mutation ? project : undefined, status: 'accepted', createdAt: Date.now(), fingerprint };
        this.jobs.set(job.runId, job);
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
            if (mutation && peer.hooks.project() !== job.project)
                throw new agent_protocol_1.AgentError('project_mismatch', 'The debug project changed.');
            const request = { ...command, protocolVersion: 1, requestId: job.requestId, runId: job.runId, sessionId: job.sessionId, project: job.project, deadline, budgetMs: Math.max(1, deadline - Date.now()), snapshot };
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
        }
    }
    get(id) { this.prune(); const job = this.jobs.get(id); if (!job)
        throw new agent_protocol_1.AgentError('job_not_found', 'Unknown or expired run ID.'); return this.publicJob(job); }
    cancel(id) { const job = this.jobs.get(id); if (!job)
        throw new agent_protocol_1.AgentError('job_not_found', 'Unknown run ID.'); if (!terminal(job.status)) {
        job.cancellationRequested = true;
        job.status = 'cancelling';
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
        const { image: _boundedImage, ...textResult } = result ?? {};
        if (Buffer.byteLength(JSON.stringify(textResult)) > 1024 * 1024)
            throw new agent_protocol_1.AgentError('invalid_response', 'Text result exceeds 1 MiB.');
        if (!result?.image)
            return result;
        const image = result.image;
        if (typeof image.data !== 'string' || image.data.length > Math.ceil(agent_protocol_1.MAX_IMAGE_BYTES / 3) * 4 + 4)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Screenshot payload is too large.');
        const bytes = Buffer.from(image.data, 'base64');
        if (bytes.length < 24 || bytes.length > agent_protocol_1.MAX_IMAGE_BYTES || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || (0, agent_protocol_1.hash)(bytes) !== image.sha256 || bytes.readUInt32BE(16) < 1 || bytes.readUInt32BE(20) < 1 || bytes.readUInt32BE(16) * bytes.readUInt32BE(20) > 16777216)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Screenshot is not a bounded valid PNG.');
        const images = [...this.jobs.values()].filter(j => j.result?.artifacts?.length);
        while (images.length >= 8)
            this.removeArtifact(images.shift());
        this.artifactDirectory ??= fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'scripting-cli-artifacts-'));
        const file = path_1.default.join(this.artifactDirectory, runId + '.png');
        fs_1.default.writeFileSync(file, bytes, { mode: 0o600, flag: 'wx' });
        const { image: _image, ...rest } = result;
        return { ...rest, artifacts: [{ path: file, mimeType: 'image/png', sha256: image.sha256, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }] };
    }
    prune(now = Date.now()) {
        for (const job of this.jobs.values())
            if (terminal(job.status) && now - job.createdAt > 15 * 60 * 1000) {
                this.removeArtifact(job);
                this.jobs.delete(job.runId);
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
