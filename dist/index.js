#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const start_server_1 = require("./start_server");
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
    (0, start_server_1.startServer)(argv.port);
})
    .option('help', {
    alias: 'h',
    describe: 'Show help',
})
    .parse();
// if (require.main === module) {
//   startServer();
// }
