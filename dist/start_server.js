"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ip_1 = __importDefault(require("ip"));
const bonjour_1 = __importDefault(require("bonjour"));
const chalk_1 = __importDefault(require("chalk"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const util_1 = require("./util");
const controller_1 = require("./controller");
const http_router_1 = require("./http_router");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const bonjour = (0, bonjour_1.default)();
function startServer({ port, noAutoOpen, startBonjourService }) {
    // console.log("port", port, "noAutoOpen", noAutoOpen);
    const PORT = port ?? 3000;
    (0, http_router_1.initHttpRouter)(app);
    io.on('connection', (socket) => {
        controller_1.Controller.create(socket, noAutoOpen);
        console.log(chalk_1.default.blue(`Client [${socket.id}] connected`));
    });
    server.listen(PORT, async () => {
        (0, util_1.createTsConfig)(); // Create tsconfig.json when the server starts
        (0, util_1.createVSCodeSettings)(); // Create vscode settings.json when the server starts
        (0, util_1.ensureScriptsDirectory)(); // Ensure the scripts directory exists
        // await migrateOldFiles(); // Migrate old files to the scripts directory
        const ipAddress = ip_1.default.address();
        const address = `http://${ipAddress}:${PORT}`;
        if (startBonjourService) {
            console.log(`Server listening on ${chalk_1.default.bold.blue(address)}\n\n${chalk_1.default.yellow('You can select this server in the Scripting app to connect')}.\n`);
            console.log(`Alternatively, you can ${chalk_1.default.green.bold("use the Scripting app to scan")} the QR code and connect: `);
        }
        else {
            console.log(chalk_1.default.yellow.italic(`The bonjour service is not started, you can use \`--bonjour\` option to start it.`));
            console.log(`Server listening on ${chalk_1.default.bold.blue(address)}\nYou can ${chalk_1.default.green.bold("use the Scripting app to scan")} the QR code and connect: `);
        }
        qrcode_terminal_1.default.generate(address, { small: true });
        if (startBonjourService) {
            function gracefulShutdown() {
                console.log('Shutting down Bonjour...');
                service.stop(() => {
                    bonjour.unpublishAll(() => {
                        // wait for 500ms，let goodbye message be sent completely
                        setTimeout(() => {
                            bonjour.destroy();
                            console.log('Bonjour services have been shut down properly.');
                            process.exit(0);
                        }, 500);
                    });
                });
            }
            const service = bonjour.publish({
                name: 'Scripting-service',
                type: 'http',
                port: PORT,
                host: 'scripting-service.local',
            });
            // Register bonjour service error handler
            service.on('error', err => {
                console.error('Bonjour service error:', err);
            });
            ['SIGINT', 'SIGTERM'].forEach(sig => process.once(sig, gracefulShutdown));
            // Handle uncaught exceptions
            process.on('uncaughtException', err => {
                console.error('Uncaught exception:', err);
                gracefulShutdown();
            });
        }
    });
}
