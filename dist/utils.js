"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearConsole = exports.getIpAddress = void 0;
const node_os_1 = __importDefault(require("node:os"));
function getIpAddress() {
    const interfaces = node_os_1.default.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        if (iface == null) {
            continue;
        }
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4'
                && alias.address !== '127.0.0.1'
                && !alias.internal) {
                return alias.address;
            }
        }
    }
}
exports.getIpAddress = getIpAddress;
function clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}
exports.clearConsole = clearConsole;
