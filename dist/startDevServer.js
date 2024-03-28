"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.startDevServer = void 0;
const node_http_1 = __importDefault(require("node:http"));
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = require("node:fs/promises");
const chalk_1 = __importDefault(require("chalk"));
const express_1 = __importDefault(require("express"));
const minimist_1 = __importDefault(require("minimist"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const socket_io_1 = require("socket.io");
const utils = __importStar(require("./utils"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_config_1 = __importDefault(require("./config/webpack.config"));
function startDevServer() {
    const args = (0, minimist_1.default)(process.argv.slice(2));
    const ipAddress = utils.getIpAddress();
    const port = args['port'] || 8000;
    const app = (0, express_1.default)();
    const server = node_http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    let isStarted = false;
    let connectedSockets = [];
    webpack_config_1.default.mode = 'development';
    const compiler = (0, webpack_1.default)(webpack_config_1.default);
    console.log('Start running webpack compiler in watch mode...');
    compiler.watch({}, (err, stats) => {
        utils.clearConsole();
        if (err) {
            console.log(chalk_1.default.red(' ✖️ webpack compile error: \n') + err);
        }
        else {
            console.log(stats === null || stats === void 0 ? void 0 : stats.toString({
                chunks: false,
                colors: true,
            }));
            if ((stats === null || stats === void 0 ? void 0 : stats.toJson().errorsCount) === 0) {
                onCompileDone();
            }
        }
    });
    function onCompileDone() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isStarted) {
                printDevServerAddress();
                console.log(chalk_1.default.gray(` ~ Sent update event to ${connectedSockets.length} client(s)`));
                const appJson = yield (0, promises_1.readFile)(node_path_1.default.resolve(process.cwd(), 'build/app.json'), 'utf-8');
                for (const socket of connectedSockets) {
                    socket.emit('update', appJson);
                }
            }
            else {
                start();
            }
        });
    }
    function printDevServerAddress() {
        console.log(`Server running at ${chalk_1.default.bold(chalk_1.default.green(`http://${ipAddress}:${port}`))}`);
        console.log(`Use the Scripting app to scan the QR code below:`);
        qrcode_terminal_1.default.generate(`http://${ipAddress}:${port}`, { small: true });
    }
    function start() {
        if (isStarted) {
            return;
        }
        app.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, PUT, DELETE');
            next();
        });
        app.use('/', express_1.default.static(node_path_1.default.resolve(process.cwd(), 'build')));
        //有新的客户端连接时触发
        io.on('connection', function (socket) {
            console.log(chalk_1.default.green(` + A client(${socket.id}) connected.`));
            connectedSockets.push(socket);
            socket.on('error', function (err) {
                console.log(chalk_1.default.red(' ✖️ Server Error: ', err));
            });
            socket.on('disconnect', function () {
                var index = connectedSockets.indexOf(socket);
                if (index > -1) {
                    connectedSockets.splice(index, 1);
                    console.log(chalk_1.default.gray(` - A client(${socket.id}) disconnected.`));
                }
            });
        });
        server.listen(port);
        printDevServerAddress();
        isStarted = true;
    }
}
exports.startDevServer = startDevServer;
