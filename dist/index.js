#!/usr/bin/env node
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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ip_1 = __importDefault(require("ip"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const bonjour_1 = __importDefault(require("bonjour"));
const crypto_1 = __importDefault(require("crypto"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const os_1 = __importDefault(require("os"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const bonjour = (0, bonjour_1.default)();
const getPath = (filename) => path_1.default.join(process.cwd(), filename);
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('start', 'Start the scripting-cli server', (yargs) => {
    return yargs.options({
        port: {
            alias: ["p"],
            describe: "The port the server listens on",
            type: "number",
            default: 3000,
        }
    })
        .usage("$0 start [--port=<port>]")
        .example([
        ["$0 start -p=8000", "Start server and listen on 8000"]
    ]);
}, (argv) => {
    startServer(argv.port);
})
    .option('help', {
    alias: 'h',
    describe: 'Show help',
})
    .parse();
function md5(content) {
    return crypto_1.default
        .createHash('md5')
        .update(content)
        .digest('hex');
}
function startServer(port) {
    // Function to create tsconfig.json
    const createTsConfig = () => {
        const tsconfigContent = `{
  "compilerOptions": {
    "target": "ESNext",
    "lib": [
      "esnext"
    ],
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "CommonJS",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment",
    "paths": {
      "scripting": [
        "./dts/scripting.d.ts"
      ]
    }
  },
  "include": [
    "./dts/global.d.ts"
  ]
}`;
        const filePath = getPath('tsconfig.json');
        ensureDirectoryExistence(filePath);
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, tsconfigContent);
            console.log(chalk_1.default.green('tsconfig.json created.'));
        }
        else {
            console.log(chalk_1.default.gray('tsconfig.json already exists.'));
        }
    };
    const createVSCodeSettings = () => {
        const settingsContent = `{
  "typescript.format.semicolons": "remove",
  "typescript.preferences.jsxAttributeCompletionStyle": "braces",
}`;
        const filePath = getPath('.vscode/settings.json');
        ensureDirectoryExistence(filePath);
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, settingsContent);
            console.log(chalk_1.default.green('.vscode/settings.json created.'));
        }
        else {
            console.log(chalk_1.default.gray('.vscode/settings.json already exists.'));
        }
    };
    const ensureDirectoryExistence = (filePath) => {
        const dirname = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(dirname)) {
            fs_1.default.mkdirSync(dirname, { recursive: true });
        }
    };
    const writeDtsFiles = (files) => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(Object.entries(files).map((_a) => __awaiter(this, [_a], void 0, function* ([filename, content]) {
            const filePath = getPath(`dts/${filename}`);
            ensureDirectoryExistence(filePath);
            yield fs_1.default
                .promises
                .writeFile(filePath, content)
                .catch((err) => {
                console.log(chalk_1.default.red(`Error writing file: ${err}`));
            });
        })));
    });
    const tryOpenFileInVSCode = (filePath) => {
        let cmd = `code "${filePath}"`;
        if (os_1.default.platform() === "win32") {
            cmd = `cmd.exe /c ${cmd}`;
        }
        else if (os_1.default.platform() === "linux") {
            const shell = process.env["SHELL"];
            cmd = `${shell} -c ${cmd}`;
        }
        else {
            cmd = `"/Applications/Visual Studio Code.app/Contents/MacOS/Electron" "${filePath}"`;
        }
        child_process_1.default.execSync(cmd);
    };
    const PORT = port !== null && port !== void 0 ? port : 3000;
    io.on('connection', (socket) => {
        console.log(chalk_1.default.blue(`Client [${socket.id}] connected`));
        let watcher = null;
        let scriptName = "";
        const createWatcher = (scriptName) => {
            const scriptDir = getPath(scriptName);
            watcher = chokidar_1.default.watch(scriptDir, {
                ignored: /(^|[\/\\])\../,
                persistent: true,
            });
            watcher
                .on('change', (filePath) => {
                if (filePath.match(/\.(js(x)?|ts(x)?|json|md|txt)$/)) {
                    // send file content md5 hash to client
                    // const content = fs.readFileSync(filePath, 'utf-8');
                    fs_1.default.readFile(filePath, 'utf-8', (err, content) => {
                        if (err) {
                            console.log(chalk_1.default.red(`Error reading file: ${err}`));
                            return;
                        }
                        const hash = md5(content);
                        const relativePath = path_1.default.relative(scriptDir, filePath);
                        console.log(`[${chalk_1.default.bold.blue(scriptName)}] File changed: [${hash}]${relativePath}`);
                        socket.emit('fileChange', {
                            scriptName,
                            filePath: relativePath,
                            hash,
                        });
                    });
                }
                // TODO, add support for other file types
            })
                .on('unlink', (filePath) => {
                const relativePath = path_1.default.relative(scriptDir, filePath);
                socket.emit('deleteFile', {
                    scriptName,
                    filePath: relativePath,
                });
            })
                .on('unlinkDir', (filePath) => {
                const relativePath = path_1.default.relative(scriptDir, filePath);
                socket.emit('deleteFile', {
                    scriptName,
                    filePath: relativePath,
                });
            })
                .on('error', error => console.log(chalk_1.default.bgRed(`Watcher error: ${error}`)))
                .on('ready', () => console.log(`[${chalk_1.default.bold.blue(scriptName)}] Watching files for changes`));
        };
        socket.on('syncScriptFromClient', (data, ack) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (data.scriptName === scriptName) {
                    ack({
                        error: `Script [${data.scriptName}] is already initialized`,
                    });
                    return;
                }
                if (scriptName != null) {
                    console.log(`Received new script, closing previous watcher`);
                    watcher === null || watcher === void 0 ? void 0 : watcher.close();
                    watcher = null;
                }
                yield writeDtsFiles({
                    "global.d.ts": data["global.d.ts"],
                    "scripting.d.ts": data["scripting.d.ts"],
                });
                scriptName = data.scriptName;
                const scriptDir = getPath(data.scriptName);
                const tsconfig = require(getPath('tsconfig.json'));
                if (!tsconfig.include.includes(scriptName)) {
                    tsconfig.include.push(scriptName);
                    yield fs_1.default.promises.writeFile(getPath('tsconfig.json'), JSON.stringify(tsconfig, null, 2));
                }
                ensureDirectoryExistence(scriptDir);
                yield Promise.all(Object.entries(data.scriptFiles).map((_a) => __awaiter(this, [_a], void 0, function* ([filename, content]) {
                    const filePath = path_1.default.join(scriptDir, filename);
                    ensureDirectoryExistence(filePath);
                    yield fs_1.default.promises.writeFile(filePath, content);
                })));
                console.log(chalk_1.default.green('global.d.ts and scripting.d.ts and other script files saved.'));
                createWatcher(data.scriptName);
                ack({
                    success: true,
                });
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    tryOpenFileInVSCode(entryFilePath);
                }, 1000);
            }
            catch (e) {
                console.log(chalk_1.default.red(`Error: ${e}`));
                ack({
                    error: `Failed to init and sync script files.\n${e}`,
                });
            }
        }));
        socket.on("syncScriptFromServer", (data, ack) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (scriptName === data.scriptName) {
                    ack({
                        error: `Script ${data.scriptName} is already initialized`,
                    });
                    return;
                }
                if (scriptName != null) {
                    console.log(`Received new script [${chalk_1.default.bold.blue(data.scriptName)}], closing previous watcher`);
                    watcher === null || watcher === void 0 ? void 0 : watcher.close();
                    watcher = null;
                }
                yield writeDtsFiles({
                    "global.d.ts": data["global.d.ts"],
                    "scripting.d.ts": data["scripting.d.ts"],
                });
                const scriptDir = getPath(data.scriptName);
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
                            const relativePath = path_1.default.relative(scriptDir, filePath);
                            const content = yield fs_1.default.promises.readFile(filePath, 'utf-8').catch((err) => {
                                console.log(chalk_1.default.red(`Error reading file: ${err}`));
                            });
                            if (typeof content === "string") {
                                scriptFiles[relativePath] = {
                                    hash: md5(content),
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
                scriptName = data.scriptName;
                ack({
                    scriptFiles,
                });
                createWatcher(data.scriptName);
                // Open the entry file in VSCode after a delay
                // to ensure the response is sent. Because the open file command
                // may suspend the response and cause the client to not receive the ack.
                setTimeout(() => {
                    const entryFilePath = path_1.default.join(scriptDir, "index.tsx");
                    tryOpenFileInVSCode(entryFilePath);
                }, 1000);
            }
            catch (e) {
                ack({
                    error: `Failed to init and pull script files.\n${e}`,
                });
            }
        }));
        socket.on('stopDebugScript', (data, ack) => {
            if (data === scriptName) {
                console.log(`[${chalk_1.default.bold.blue(scriptName)}] Stop debug script`);
                watcher === null || watcher === void 0 ? void 0 : watcher.close();
                watcher = null;
                scriptName = "";
                ack(true);
            }
            else {
                ack(false);
            }
        });
        socket.on("getFileContent", (data, ack) => __awaiter(this, void 0, void 0, function* () {
            if (scriptName !== data.scriptName) {
                ack({
                    error: `Script ${data.scriptName} is not initialized`,
                });
                return;
            }
            const filePath = path_1.default.join(getPath(data.scriptName), data.relativePath);
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
        }));
        socket.on("log", (data) => {
            if (data.scriptName !== scriptName) {
                return;
            }
            console.log(`[${chalk_1.default.bold.blue(scriptName)}][${data.isError ? chalk_1.default.red("ERROR") : "LOG"}][${new Date().toLocaleTimeString()}] ${data.content}`);
        });
        socket.on("openFile", (data) => __awaiter(this, void 0, void 0, function* () {
            if (data.scriptName !== scriptName) {
                return;
            }
            const filePath = path_1.default.join(getPath(scriptName), data.relativePath);
            if (fs_1.default.existsSync(filePath)) {
                tryOpenFileInVSCode(filePath);
            }
        }));
        socket.on('disconnect', () => {
            console.log(chalk_1.default.gray(`Client [${socket.id}] disconnected`));
            watcher === null || watcher === void 0 ? void 0 : watcher.close();
            watcher = null;
        });
        const serverScriptNames = fs_1.default.readdirSync(process.cwd())
            .filter((filename) => fs_1.default.statSync(filename).isDirectory()
            &&
                filename !== '.vscode');
        // console.log(serverScriptNames)
        socket.emit("serverScripts", serverScriptNames);
    });
    server.listen(PORT, () => {
        createTsConfig(); // Create tsconfig.json when the server starts
        createVSCodeSettings(); // Create vscode settings.json when the server starts
        const ipAddress = ip_1.default.address();
        const address = `http://${ipAddress}:${PORT}`;
        console.log(`Server listening on ${chalk_1.default.bold.blue(address)}\nYou can select this server in the Scripting app to connect.\n`);
        console.log(`Alternatively, you can ${chalk_1.default.green.bold("use the Scripting app to scan")} the QR code and connect: `);
        qrcode_terminal_1.default.generate(address, { small: true });
        bonjour.publish({ name: 'Scripting-service', type: 'http', port: PORT });
        process.on('SIGINT', () => {
            bonjour.unpublishAll(() => {
                console.log('Server stopped');
                process.exit();
            });
        });
    });
}
// if (require.main === module) {
//   startServer();
// }
