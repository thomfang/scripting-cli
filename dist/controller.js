"use strict";
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
const const_1 = require("./const");
class Controller {
    static instances = new Map();
    static create(socket, noAutoOpen) {
        const ctrl = new Controller(socket, noAutoOpen);
        Controller.instances.set(socket.id, ctrl);
        return ctrl;
    }
    static get(socketId) {
        return Controller.instances.get(socketId);
    }
    watcher = null;
    scriptName = null;
    socket = null;
    noAutoOpen;
    constructor(socket, noAutoOpen) {
        this.noAutoOpen = noAutoOpen;
        this.socket = socket;
        socket.emit("socketId", socket.id);
        // socket.on('syncScriptFromClient', this.handleSyncScriptFromClient);
        // socket.on("syncScriptFromServer", this.handleSyncScriptFromClient);
        // socket.on('stopDebugScript', this.handleStopDebugScript);
        // socket.on("getFileContent", this.handleGetFileContent);
        socket.on("log", this.handleLog);
        socket.on("openFile", this.handleOpenFile);
        socket.on('disconnect', (reason) => {
            console.log(chalk_1.default.gray(`Client [${socket.id}] disconnected: ${reason}`));
            this.watcher?.close();
            this.watcher = null;
            this.scriptName = null;
            Controller.instances.delete(socket.id);
            socket.removeAllListeners();
        });
        fs_1.default.promises.readdir((0, util_1.getScriptPath)()).then((files) => {
            const serverScriptNames = files.filter((filename) => fs_1.default.statSync((0, util_1.getScriptPath)(filename)).isDirectory()
                && !filename.startsWith('.')
                && filename !== 'dts');
            socket.emit("serverScripts", serverScriptNames);
        });
    }
    createWatcher(scriptName) {
        const scriptDir = (0, util_1.getScriptPath)(scriptName);
        this.watcher = chokidar_1.default.watch(scriptDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });
        const updateHandler = (filePath) => {
            if (filePath.match(/\.(js(x)?|ts(x)?|json|md|txt)$/)) {
                // send file content md5 hash to client
                // const content = fs.readFileSync(filePath, 'utf-8');
                fs_1.default.readFile(filePath, 'utf-8', (err, content) => {
                    if (err) {
                        console.log(chalk_1.default.red(`Error reading file: ${err}`));
                        return;
                    }
                    const hash = (0, util_1.md5)(content);
                    const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
                    console.log(`[${chalk_1.default.bold.blue(scriptName)}] File changed: [${hash}]${relativePath}`);
                    this.socket?.emit('fileChange', {
                        scriptName,
                        filePath: relativePath,
                        hash,
                    });
                });
            }
            else {
                // Other file types, just notify the client to reload the file
                const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
                console.log(`[${chalk_1.default.bold.blue(scriptName)}] File changed: ${relativePath}`);
                this.socket?.emit('otherFileChange', {
                    scriptName,
                    filePath: relativePath,
                });
            }
        };
        const deleteHandler = (filePath) => {
            const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
            this.socket?.emit('deleteFile', {
                scriptName,
                filePath: relativePath,
            });
        };
        this.watcher
            .on('add', updateHandler)
            .on('change', updateHandler)
            .on('unlink', deleteHandler)
            .on('unlinkDir', deleteHandler)
            .on('error', error => console.log(chalk_1.default.bgRed(`Watcher error: ${error}`)))
            .on('ready', () => console.log(`[${chalk_1.default.bold.blue(scriptName)}] Watching files for changes`));
    }
    handleSyncScriptFromClient = async (data, ack) => {
        try {
            if (data.scriptName === this.scriptName) {
                ack({
                    error: `Script [${data.scriptName}] is already initialized`,
                });
                return;
            }
            if (this.scriptName != null) {
                console.log(`Received new script, closing previous watcher`);
                this.watcher?.close();
                this.watcher = null;
            }
            await (0, util_1.writeDtsFiles)({
                [const_1.globalDtsFileName]: data[const_1.globalDtsFileName],
                [const_1.scriptingDtsFileName]: data[const_1.scriptingDtsFileName],
            });
            this.scriptName = data.scriptName;
            const scriptDir = (0, util_1.getScriptPath)(data.scriptName);
            (0, util_1.ensureDirectoryExistence)(scriptDir);
            await Promise.all(Object.entries(data.scriptFiles).map(async ([filename, content]) => {
                const filePath = path_1.default.join(scriptDir, filename);
                (0, util_1.ensureDirectoryExistence)(filePath);
                await fs_1.default.promises.writeFile(filePath, content);
            }));
            console.log(chalk_1.default.green(`${const_1.globalDtsFileName} and ${const_1.scriptingDtsFileName} and other script files saved.`));
            this.createWatcher(data.scriptName);
            ack({
                success: true,
            });
            if (!this.noAutoOpen) {
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    (0, util_1.tryOpenFileInVSCode)(entryFilePath);
                }, 1000);
            }
        }
        catch (e) {
            console.log(chalk_1.default.red(`Error: ${e}`));
            ack({
                error: `Failed to init and sync script files.\n${e}`,
            });
        }
    };
    handleSyncScriptFromServer = async (data, ack) => {
        try {
            if (this.scriptName === data.scriptName) {
                ack({
                    error: `Script ${data.scriptName} is already initialized`,
                });
                return;
            }
            if (this.scriptName != null) {
                console.log(`Received new script [${chalk_1.default.bold.blue(data.scriptName)}], closing previous watcher`);
                this.watcher?.close();
                this.watcher = null;
            }
            await (0, util_1.writeDtsFiles)({
                globalDtsFileName: data[const_1.globalDtsFileName],
                scriptingDtsFileName: data[const_1.scriptingDtsFileName],
            });
            const scriptDir = (0, util_1.getScriptPath)(data.scriptName);
            if (!fs_1.default.existsSync(scriptDir)) {
                ack({
                    error: `Script directory ${scriptDir} does not exist`,
                });
                return;
            }
            const scriptFiles = {};
            const otherFiles = [];
            const readDir = async (dir) => {
                const files = await fs_1.default.promises.readdir(dir, { withFileTypes: true });
                await Promise.all(files.map(async (file) => {
                    // ignore .git and .vscode directories
                    if (file.name.startsWith('.git') || file.name.startsWith('.vscode')) {
                        return;
                    }
                    // only read js, jsx, ts, tsx, json, md, txt files
                    if (file.isFile()) {
                        const filePath = path_1.default.join(dir, file.name);
                        const relativePath = (0, util_1.getRelativePath)(scriptDir, filePath);
                        if (file.name.match(/\.(js(x)?|ts(x)?|json|md|txt)$/)) {
                            const content = await fs_1.default.promises.readFile(filePath, 'utf-8').catch((err) => {
                                console.log(chalk_1.default.red(`Error reading file: ${err}`));
                            });
                            if (typeof content === "string") {
                                scriptFiles[relativePath] = {
                                    hash: (0, util_1.md5)(content),
                                    content,
                                };
                            }
                        }
                        else {
                            otherFiles.push(relativePath);
                        }
                    }
                    else if (file.isDirectory()) {
                        await readDir(path_1.default.join(dir, file.name));
                    }
                }));
            };
            await readDir(scriptDir);
            this.scriptName = data.scriptName;
            ack({
                scriptFiles,
                otherFiles: otherFiles.length > 0 ? otherFiles : undefined,
            });
            this.createWatcher(data.scriptName);
            if (!this.noAutoOpen) {
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    (0, util_1.tryOpenFileInVSCode)(entryFilePath);
                }, 1000);
            }
        }
        catch (e) {
            ack({
                error: `Failed to init and pull script files.\n${e}`,
            });
        }
    };
    handleLog = (data) => {
        if (data.scriptName !== this.scriptName) {
            return;
        }
        console.log(`[${chalk_1.default.bold.blue(this.scriptName)}][${data.isError ? chalk_1.default.red("ERROR") : "LOG"}][${new Date().toLocaleTimeString()}] ${data.content}`);
    };
    handleOpenFile = async (data) => {
        if (data.scriptName !== this.scriptName) {
            return;
        }
        const filePath = path_1.default.join((0, util_1.getScriptPath)(this.scriptName), data.relativePath);
        if (!this.noAutoOpen && fs_1.default.existsSync(filePath)) {
            (0, util_1.tryOpenFileInVSCode)(filePath);
        }
    };
    handleStopDebugScript = (data, ack) => {
        if (data === this.scriptName) {
            console.log(`[${chalk_1.default.bold.blue(this.scriptName)}] Stop debug script`);
            this.watcher?.close();
            this.watcher = null;
            this.scriptName = null;
            ack(true);
        }
        else {
            ack(false);
        }
    };
    handleGetFileContent = async (data, ack) => {
        if (this.scriptName !== data.scriptName) {
            ack({
                error: `Script ${data.scriptName} is not initialized`,
            });
            return;
        }
        const filePath = path_1.default.join((0, util_1.getScriptPath)(data.scriptName), data.relativePath);
        try {
            const content = await fs_1.default.promises.readFile(filePath, 'utf-8');
            ack({
                content,
            });
        }
        catch (e) {
            ack({
                error: `Failed to get file content.\n${e}`,
            });
        }
    };
    handleGetFilePath = async (data, ack) => {
        if (this.scriptName !== data.scriptName) {
            ack({
                error: `Script ${data.scriptName} is not initialized`,
            });
            return;
        }
        const filePath = path_1.default.join((0, util_1.getScriptPath)(data.scriptName), data.relativePath);
        if (fs_1.default.existsSync(filePath)) {
            ack({
                filePath,
            });
        }
        else {
            ack({
                error: `File ${filePath} does not exist`,
            });
        }
    };
}
exports.Controller = Controller;
