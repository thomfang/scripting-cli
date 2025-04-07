"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const util_1 = require("./util");
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
class Controller {
    static create(socket) {
        const ctrl = new Controller(socket);
        Controller.instances.set(socket.id, ctrl);
        return ctrl;
    }
    static get(socketId) {
        return Controller.instances.get(socketId);
    }
    constructor(socket) {
        this.watcher = null;
        this.scriptName = null;
        this.socket = null;
        this.handleSyncScriptFromClient = (data, ack) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (data.scriptName === this.scriptName) {
                    ack({
                        error: `Script [${data.scriptName}] is already initialized`,
                    });
                    return;
                }
                if (this.scriptName != null) {
                    console.log(`Received new script, closing previous watcher`);
                    (_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close();
                    this.watcher = null;
                }
                yield (0, util_1.writeDtsFiles)({
                    "global.d.ts": data["global.d.ts"],
                    "scripting.d.ts": data["scripting.d.ts"],
                });
                this.scriptName = data.scriptName;
                const scriptName = data.scriptName;
                const scriptDir = (0, util_1.getPath)(data.scriptName);
                const tsconfig = require((0, util_1.getPath)('tsconfig.json'));
                if (!tsconfig.include.includes(scriptName)) {
                    tsconfig.include.push(scriptName);
                    yield fs_1.default.promises.writeFile((0, util_1.getPath)('tsconfig.json'), JSON.stringify(tsconfig, null, 2));
                }
                (0, util_1.ensureDirectoryExistence)(scriptDir);
                yield Promise.all(Object.entries(data.scriptFiles).map((_a) => __awaiter(this, [_a], void 0, function* ([filename, content]) {
                    const filePath = path_1.default.join(scriptDir, filename);
                    (0, util_1.ensureDirectoryExistence)(filePath);
                    yield fs_1.default.promises.writeFile(filePath, content);
                })));
                console.log(chalk_1.default.green('global.d.ts and scripting.d.ts and other script files saved.'));
                this.createWatcher(data.scriptName);
                ack({
                    success: true,
                });
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    (0, util_1.tryOpenFileInVSCode)(entryFilePath);
                }, 1000);
            }
            catch (e) {
                console.log(chalk_1.default.red(`Error: ${e}`));
                ack({
                    error: `Failed to init and sync script files.\n${e}`,
                });
            }
        });
        this.handleSyncScriptFromServer = (data, ack) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (this.scriptName === data.scriptName) {
                    ack({
                        error: `Script ${data.scriptName} is already initialized`,
                    });
                    return;
                }
                if (this.scriptName != null) {
                    console.log(`Received new script [${chalk_1.default.bold.blue(data.scriptName)}], closing previous watcher`);
                    (_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close();
                    this.watcher = null;
                }
                yield (0, util_1.writeDtsFiles)({
                    "global.d.ts": data["global.d.ts"],
                    "scripting.d.ts": data["scripting.d.ts"],
                });
                const scriptDir = (0, util_1.getPath)(data.scriptName);
                if (!fs_1.default.existsSync(scriptDir)) {
                    ack({
                        error: `Script directory ${scriptDir} does not exist`,
                    });
                    return;
                }
                const scriptFiles = {};
                const readDir = (dir) => __awaiter(this, void 0, void 0, function* () {
                    const files = yield fs_1.default.promises.readdir(dir, { withFileTypes: true });
                    yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                        if (file.isFile()) {
                            const filePath = path_1.default.join(dir, file.name);
                            const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
                            const content = yield fs_1.default.promises.readFile(filePath, 'utf-8').catch((err) => {
                                console.log(chalk_1.default.red(`Error reading file: ${err}`));
                            });
                            if (typeof content === "string") {
                                scriptFiles[relativePath] = {
                                    hash: (0, util_1.md5)(content),
                                    content,
                                };
                            }
                        }
                        else if (file.isDirectory()) {
                            yield readDir(path_1.default.join(dir, file.name));
                        }
                    })));
                });
                yield readDir(scriptDir);
                this.scriptName = data.scriptName;
                ack({
                    scriptFiles,
                });
                this.createWatcher(data.scriptName);
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    (0, util_1.tryOpenFileInVSCode)(entryFilePath);
                }, 1000);
            }
            catch (e) {
                ack({
                    error: `Failed to init and pull script files.\n${e}`,
                });
            }
        });
        this.handleLog = (data) => {
            if (data.scriptName !== this.scriptName) {
                return;
            }
            console.log(`[${chalk_1.default.bold.blue(this.scriptName)}][${data.isError ? chalk_1.default.red("ERROR") : "LOG"}][${new Date().toLocaleTimeString()}] ${data.content}`);
        };
        this.handleOpenFile = (data) => __awaiter(this, void 0, void 0, function* () {
            if (data.scriptName !== this.scriptName) {
                return;
            }
            const filePath = path_1.default.join((0, util_1.getPath)(this.scriptName), data.relativePath);
            if (fs_1.default.existsSync(filePath)) {
                (0, util_1.tryOpenFileInVSCode)(filePath);
            }
        });
        this.handleStopDebugScript = (data, ack) => {
            var _a;
            if (data === this.scriptName) {
                console.log(`[${chalk_1.default.bold.blue(this.scriptName)}] Stop debug script`);
                (_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close();
                this.watcher = null;
                this.scriptName = null;
                ack(true);
            }
            else {
                ack(false);
            }
        };
        this.handleGetFileContent = (data, ack) => __awaiter(this, void 0, void 0, function* () {
            if (this.scriptName !== data.scriptName) {
                ack({
                    error: `Script ${data.scriptName} is not initialized`,
                });
                return;
            }
            const filePath = path_1.default.join((0, util_1.getPath)(data.scriptName), data.relativePath);
            try {
                const content = yield fs_1.default.promises.readFile(filePath, 'utf-8');
                ack({
                    content,
                });
            }
            catch (e) {
                ack({
                    error: `Failed to get file content.\n${e}`,
                });
            }
        });
        this.socket = socket;
        socket.emit("socketId", socket.id);
        socket.on('syncScriptFromClient', this.handleSyncScriptFromClient);
        socket.on("syncScriptFromServer", this.handleSyncScriptFromClient);
        socket.on('stopDebugScript', this.handleStopDebugScript);
        socket.on("getFileContent", this.handleGetFileContent);
        socket.on("log", this.handleLog);
        socket.on("openFile", this.handleOpenFile);
        socket.on('disconnect', (reason) => {
            var _a;
            console.log(chalk_1.default.gray(`Client [${socket.id}] disconnected: ${reason}`));
            (_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close();
            this.watcher = null;
            this.scriptName = null;
            Controller.instances.delete(socket.id);
            socket.removeAllListeners();
        });
        fs_1.default.promises.readdir(process.cwd()).then((files) => {
            const serverScriptNames = files.filter((filename) => fs_1.default.statSync(filename).isDirectory()
                && filename !== '.vscode'
                && filename !== 'dts');
            socket.emit("serverScripts", serverScriptNames);
        });
    }
    createWatcher(scriptName) {
        const scriptDir = (0, util_1.getPath)(scriptName);
        this.watcher = chokidar_1.default.watch(scriptDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });
        this.watcher
            .on('change', (filePath) => {
            if (filePath.match(/\.(js(x)?|ts(x)?|json|md|txt)$/)) {
                // send file content md5 hash to client
                // const content = fs.readFileSync(filePath, 'utf-8');
                fs_1.default.readFile(filePath, 'utf-8', (err, content) => {
                    var _a;
                    if (err) {
                        console.log(chalk_1.default.red(`Error reading file: ${err}`));
                        return;
                    }
                    const hash = (0, util_1.md5)(content);
                    const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
                    console.log(`[${chalk_1.default.bold.blue(scriptName)}] File changed: [${hash}]${relativePath}`);
                    (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('fileChange', {
                        scriptName,
                        filePath: relativePath,
                        hash,
                    });
                });
            }
            // TODO, add support for other file types
        })
            .on('unlink', (filePath) => {
            var _a;
            const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('deleteFile', {
                scriptName,
                filePath: relativePath,
            });
        })
            .on('unlinkDir', (filePath) => {
            var _a;
            const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.emit('deleteFile', {
                scriptName,
                filePath: relativePath,
            });
        })
            .on('error', error => console.log(chalk_1.default.bgRed(`Watcher error: ${error}`)))
            .on('ready', () => console.log(`[${chalk_1.default.bold.blue(scriptName)}] Watching files for changes`));
    }
}
exports.Controller = Controller;
Controller.instances = new Map();
