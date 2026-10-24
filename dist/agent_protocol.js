"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.hash = exports.AgentError = exports.widgetFamilies = exports.MAX_IMAGE_BYTES = exports.MAX_FILES = exports.MAX_SOURCE_BYTES = exports.PROTOCOL_VERSION = void 0;
exports.validateCommand = validateCommand;
exports.safeRelativePath = safeRelativePath;
exports.revisionForFiles = revisionForFiles;
exports.snapshotProject = snapshotProject;
exports.failure = failure;
exports.isAcknowledgedChange = isAcknowledgedChange;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("./util");
exports.PROTOCOL_VERSION = 1;
exports.MAX_SOURCE_BYTES = 8 * 1024 * 1024;
exports.MAX_FILES = 2000;
exports.MAX_IMAGE_BYTES = 8 * 1024 * 1024;
exports.widgetFamilies = ['systemSmall', 'systemMedium', 'systemLarge', 'systemExtraLarge', 'accessoryCircular', 'accessoryRectangular', 'accessoryInline'];
class AgentError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.AgentError = AgentError;
const hash = (bytes) => crypto_1.default.createHash('sha256').update(bytes).digest('hex');
exports.hash = hash;
exports.methods = ['status', 'docs.search', 'docs.get', 'api.get', 'run', 'widget'];
function validateCommand(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !exports.methods.includes(value.method))
        throw new AgentError('invalid_request', 'Unknown command.');
    for (const key of ['device', 'project', 'query', 'docId', 'symbol', 'requestId']) {
        if (value[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > 1024))
            throw new AgentError('invalid_request', `Invalid ${key}.`);
    }
    if (value.lang !== undefined && !['en', 'zh'].includes(value.lang))
        throw new AgentError('invalid_request', 'Language must be en or zh.');
    if (value.limit !== undefined && (!Number.isInteger(value.limit) || value.limit < 1 || value.limit > 50))
        throw new AgentError('invalid_request', 'Limit must be 1...50.');
    if (value.method === 'docs.get' && !value.docId)
        throw new AgentError('invalid_request', 'A document ID is required.');
    if (value.method === 'api.get' && !value.symbol)
        throw new AgentError('invalid_request', 'An API symbol is required.');
    const o = value.options ?? {};
    if (!o || typeof o !== 'object' || Array.isArray(o))
        throw new AgentError('invalid_request', 'Invalid options.');
    for (const k of ['screenshot', 'noSync'])
        if (o[k] !== undefined && typeof o[k] !== 'boolean')
            throw new AgentError('invalid_request', `Invalid ${k}.`);
    if (o.timeout !== undefined && (!Number.isFinite(o.timeout) || o.timeout < 1 || o.timeout > 120))
        throw new AgentError('invalid_request', 'Timeout must be 1...120 seconds.');
    if (o.captureAfter !== undefined && (!Number.isFinite(o.captureAfter) || o.captureAfter < 0 || o.captureAfter > 10))
        throw new AgentError('invalid_request', 'Capture delay must be 0...10 seconds.');
    if (o.family !== undefined && !exports.widgetFamilies.includes(o.family))
        throw new AgentError('invalid_request', 'Unsupported widget family.');
    if (o.parameter !== undefined && (typeof o.parameter !== 'string' || o.parameter.length > 16384))
        throw new AgentError('invalid_request', 'Invalid widget parameter.');
    if (o.queryParameters !== undefined && (!o.queryParameters || typeof o.queryParameters !== 'object' || Array.isArray(o.queryParameters) || Buffer.byteLength(JSON.stringify(o.queryParameters)) > 65536))
        throw new AgentError('invalid_request', 'Invalid query parameters.');
    return { ...value, options: o };
}
function safeRelativePath(value) {
    return Buffer.byteLength(value) > 0 && Buffer.byteLength(value) < 1024 && !/[\\:\x00-\x1f\x7f]/.test(value) && !path_1.default.posix.isAbsolute(value) && value.split('/').length <= 32 && value.split('/').every(p => !!p && p !== '.' && p !== '..');
}
function revisionForFiles(files) {
    return (0, exports.hash)([...files].sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path))).map(f => `${f.path}\0${f.sha256}\n`).join(''));
}
async function snapshotProject(workspace, project, ignore) {
    if (!project || project === '.' || project === '..' || /[\/\\\x00-\x1f]/.test(project))
        throw new AgentError('invalid_project', 'Invalid project name.');
    const root = path_1.default.join(workspace, 'scripts', project);
    const scripts = await fs_1.default.promises.realpath(path_1.default.join(workspace, 'scripts'));
    if ((await fs_1.default.promises.realpath(root)) !== path_1.default.join(scripts, project) || (await fs_1.default.promises.lstat(root)).isSymbolicLink())
        throw new AgentError('invalid_project', 'Project symlinks are unsupported.');
    const files = [];
    let bytes = 0;
    const stamps = [];
    async function visit(relative) {
        for (const name of (await fs_1.default.promises.readdir(path_1.default.join(root, relative))).sort()) {
            const file = relative ? `${relative}/${name}` : name;
            if ((0, util_1.isIgnoredPath)(file, ignore))
                continue;
            if (!safeRelativePath(file))
                throw new AgentError('invalid_path', `Unsupported source path: ${file}`);
            const full = path_1.default.join(root, file);
            const before = await fs_1.default.promises.lstat(full);
            if (before.isSymbolicLink())
                throw new AgentError('invalid_path', `Source symlink: ${file}`);
            if (before.isDirectory()) {
                await visit(file);
                continue;
            }
            if (!before.isFile())
                throw new AgentError('invalid_path', `Not a regular file: ${file}`);
            if (bytes + before.size > exports.MAX_SOURCE_BYTES || files.length >= exports.MAX_FILES)
                throw new AgentError('source_limit', 'Source snapshot exceeds 8 MiB or 2000 files.');
            const handle = await fs_1.default.promises.open(full, fs_1.default.constants.O_RDONLY | (fs_1.default.constants.O_NOFOLLOW || 0));
            let data, after;
            try {
                const opened = await handle.stat();
                if (!opened.isFile() || opened.ino !== before.ino)
                    throw new AgentError('source_changed', 'Source was replaced during capture.');
                const buffer = Buffer.alloc(before.size + 1);
                let read = 0;
                while (read < buffer.length) {
                    const result = await handle.read(buffer, read, buffer.length - read, read);
                    if (!result.bytesRead)
                        break;
                    read += result.bytesRead;
                }
                data = buffer.subarray(0, read);
                after = await handle.stat();
            }
            finally {
                await handle.close();
            }
            const named = await fs_1.default.promises.lstat(full);
            if (before.ino !== after.ino || before.ino !== named.ino || named.isSymbolicLink() || before.mtimeMs !== after.mtimeMs || before.size !== data.length || after.size !== data.length)
                throw new AgentError('source_changed', 'Source changed while taking the snapshot; retry explicitly.');
            stamps.push({ full, ino: after.ino, mtimeMs: after.mtimeMs, size: after.size });
            bytes += data.length;
            files.push({ path: file, sha256: (0, exports.hash)(data), data: data.toString('base64') });
        }
    }
    await visit('');
    for (const stamp of stamps) {
        const final = await fs_1.default.promises.lstat(stamp.full);
        if (!final.isFile() || final.isSymbolicLink() || final.ino !== stamp.ino || final.mtimeMs !== stamp.mtimeMs || final.size !== stamp.size)
            throw new AgentError('source_changed', 'Source changed during the snapshot; retry explicitly.');
    }
    return { files, revision: revisionForFiles(files), ignore: [...ignore] };
}
function failure(error) {
    return { code: error instanceof AgentError ? error.code : 'internal_error', message: error instanceof Error ? error.message : String(error) };
}
/** A delayed watcher notification for bytes already applied by this job must
 * not trigger a second automatic run. Changes made after the snapshot remain. */
function isAcknowledgedChange(workspace, project, relative, snapshot) {
    if (!safeRelativePath(relative))
        return false;
    const expected = snapshot.files.find(file => file.path === relative);
    const file = path_1.default.join(workspace, 'scripts', project, relative);
    if (!fs_1.default.existsSync(file))
        return expected === undefined;
    if (!expected || fs_1.default.lstatSync(file).isSymbolicLink() || !fs_1.default.statSync(file).isFile())
        return false;
    try {
        return (0, exports.hash)(fs_1.default.readFileSync(file)) === expected.sha256;
    }
    catch {
        return false;
    }
}
