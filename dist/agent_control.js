"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statePath = statePath;
exports.loadControl = loadControl;
exports.controlRequest = controlRequest;
exports.startAgentControl = startAgentControl;
exports.materializeArtifacts = materializeArtifacts;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const http_1 = __importDefault(require("http"));
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importDefault(require("express"));
const agent_protocol_1 = require("./agent_protocol");
function statePath(workspace) {
    const user = typeof process.getuid === 'function' ? String(process.getuid()) : (0, agent_protocol_1.hash)(os_1.default.userInfo().username).slice(0, 16);
    return path_1.default.join(os_1.default.tmpdir(), `scripting-cli-${user}`, (0, agent_protocol_1.hash)(fs_1.default.realpathSync(workspace)), 'server.json');
}
function privateDirectory(directory) {
    if (fs_1.default.existsSync(directory) && fs_1.default.lstatSync(directory).isSymbolicLink())
        throw new agent_protocol_1.AgentError('unsafe_state', 'Private state directory cannot be a symlink.');
    fs_1.default.mkdirSync(directory, { recursive: true, mode: 0o700 });
    const stat = fs_1.default.statSync(directory);
    if (typeof process.getuid === 'function' && stat.uid !== process.getuid())
        throw new agent_protocol_1.AgentError('unsafe_state', 'Private state belongs to another user.');
    fs_1.default.chmodSync(directory, 0o700);
}
function loadControl(workspace) {
    const file = statePath(workspace);
    if (!fs_1.default.existsSync(file))
        throw new agent_protocol_1.AgentError('server_unavailable', 'Start scripting-cli start in this workspace first.');
    const stat = fs_1.default.lstatSync(file);
    if (stat.isSymbolicLink() || (typeof process.getuid === 'function' && (stat.uid !== process.getuid() || (stat.mode & 0o077) !== 0)))
        throw new agent_protocol_1.AgentError('unsafe_state', 'Unsafe local control credentials.');
    const state = JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    if (state.workspace !== fs_1.default.realpathSync(workspace) || state.protocolVersion !== 1 || !Number.isInteger(state.port) || state.port < 1 || state.port > 65535 || typeof state.token !== 'string' || !/^[0-9a-f]{64}$/.test(state.token))
        throw new agent_protocol_1.AgentError('invalid_state', 'Invalid local control state.');
    return state;
}
async function controlRequest(state, route, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`http://127.0.0.1:${state.port}${route}`, { method: body === undefined ? 'GET' : 'POST', headers: { authorization: `Bearer ${state.token}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
        const value = await response.json();
        if (!response.ok)
            throw new agent_protocol_1.AgentError(value.error?.code ?? 'control_error', value.error?.message ?? 'Control request failed.');
        if (value.instanceId !== state.instanceId)
            throw new agent_protocol_1.AgentError('stale_server', 'The local server instance changed.');
        return value;
    }
    catch (error) {
        if (error instanceof agent_protocol_1.AgentError)
            throw error;
        throw new agent_protocol_1.AgentError('control_unavailable', 'The local CLI service stopped responding. Execution was not replayed; inspect the App before retrying.');
    }
    finally {
        clearTimeout(timer);
    }
}
async function startAgentControl(broker) {
    const file = statePath(broker.workspace);
    privateDirectory(path_1.default.dirname(path_1.default.dirname(file)));
    privateDirectory(path_1.default.dirname(file));
    if (fs_1.default.existsSync(file)) {
        const old = loadControl(broker.workspace);
        let alive = false;
        try {
            await controlRequest(old, '/v1/info');
            alive = true;
        }
        catch { }
        if (alive)
            throw new agent_protocol_1.AgentError('server_already_running', 'A CLI server is already running for this workspace.');
        fs_1.default.unlinkSync(file);
    }
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const state = { protocolVersion: 1, port: 0, token: crypto_1.default.randomBytes(32).toString('hex'), instanceId: crypto_1.default.randomUUID(), workspace: fs_1.default.realpathSync(broker.workspace) };
    app.use((req, res, next) => {
        const expected = Buffer.from(`Bearer ${state.token}`);
        const supplied = Buffer.from(req.headers.authorization ?? '');
        if (req.socket.remoteAddress !== '127.0.0.1' || req.headers.origin || req.headers.host !== `127.0.0.1:${state.port}` || supplied.length !== expected.length || !crypto_1.default.timingSafeEqual(expected, supplied)) {
            res.status(403).json({ error: { code: 'forbidden', message: 'Local authenticated control only.' } });
            return;
        }
        next();
    });
    app.use(express_1.default.json({ limit: '128kb' }));
    const send = (res, result) => res.json({ instanceId: state.instanceId, result });
    app.get('/v1/info', (_req, res) => { send(res, { protocolVersion: 1, workspace: state.workspace }); });
    app.get('/v1/devices', async (_req, res, next) => { try {
        send(res, await broker.devices());
    }
    catch (e) {
        next(e);
    } });
    app.post('/v1/requests', (req, res, next) => { try {
        send(res, broker.submit(req.body));
    }
    catch (e) {
        next(e);
    } });
    app.get('/v1/jobs/:id', (req, res, next) => { try {
        send(res, broker.get(req.params.id));
    }
    catch (e) {
        next(e);
    } });
    app.get('/v1/jobs/:id/events', (req, res, next) => { try {
        send(res, broker.events(req.params.id, Number(req.query.after ?? 0)));
    }
    catch (e) {
        next(e);
    } });
    app.post('/v1/jobs/:id/cancel', (req, res, next) => { try {
        send(res, broker.cancel(req.params.id));
    }
    catch (e) {
        next(e);
    } });
    app.use((_req, res) => { res.status(404).json({ error: { code: 'not_found', message: 'Unknown control route.' } }); });
    app.use((error, _req, res, _next) => { res.status(400).json({ error: (0, agent_protocol_1.failure)(error) }); });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    state.port = server.address().port;
    try {
        fs_1.default.writeFileSync(file, JSON.stringify(state), { mode: 0o600, flag: 'wx' });
    }
    catch (e) {
        server.close();
        throw e;
    }
    const sweep = setInterval(() => broker.prune(), 60000);
    sweep.unref();
    const cleanup = () => {
        clearInterval(sweep);
        broker.close();
        try {
            if (JSON.parse(fs_1.default.readFileSync(file, 'utf8')).instanceId === state.instanceId) {
                fs_1.default.unlinkSync(file);
                fs_1.default.rmdirSync(path_1.default.dirname(file));
            }
        }
        catch { }
    };
    const signalCleanup = () => {
        cleanup();
        server.close();
        // The existing Bonjour handler may finish sooner; otherwise stop this
        // server process after its private credentials have been removed.
        setTimeout(() => process.exit(0), 1000).unref();
    };
    process.once('exit', cleanup);
    process.once('SIGINT', signalCleanup);
    process.once('SIGTERM', signalCleanup);
    return { state, close: async () => {
            cleanup();
            process.removeListener('exit', cleanup);
            process.removeListener('SIGINT', signalCleanup);
            process.removeListener('SIGTERM', signalCleanup);
            await new Promise(r => server.close(() => r()));
        } };
}
function materializeArtifacts(result, runId, output) {
    if (!result?.artifacts?.length)
        return result;
    if (!/^[0-9a-f-]{36}$/i.test(runId))
        throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid run ID.');
    const artifacts = result.artifacts.map((image) => {
        if (typeof image.path !== 'string' || fs_1.default.lstatSync(image.path).isSymbolicLink())
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid screenshot source.');
        const size = fs_1.default.statSync(image.path).size;
        if (size > agent_protocol_1.MAX_IMAGE_BYTES)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Screenshot exceeds the image limit.');
        const bytes = fs_1.default.readFileSync(image.path);
        if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || (0, agent_protocol_1.hash)(bytes) !== image.sha256)
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid PNG screenshot.');
        const directory = path_1.default.resolve(output, runId);
        fs_1.default.mkdirSync(directory, { recursive: true });
        if (fs_1.default.lstatSync(directory).isSymbolicLink())
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Artifact directory cannot be a symlink.');
        if (image.id !== undefined && (typeof image.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(image.id)))
            throw new agent_protocol_1.AgentError('invalid_artifact', 'Invalid image case ID.');
        const file = path_1.default.join(directory, (image.id ?? 'screenshot') + '.png');
        if (fs_1.default.existsSync(file)) {
            if (fs_1.default.lstatSync(file).isSymbolicLink() || (0, agent_protocol_1.hash)(fs_1.default.readFileSync(file)) !== image.sha256)
                throw new agent_protocol_1.AgentError('artifact_exists', 'Output already exists with different content.');
        }
        else
            fs_1.default.writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
        return { ...(image.id ? { id: image.id } : {}), path: file, mimeType: 'image/png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), sha256: image.sha256 };
    });
    return { ...result, artifacts };
}
