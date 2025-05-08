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
    .parserConfiguration({
    "boolean-negation": false
})
    .command('start', 'Start the scripting-cli server', (yargs) => {
    return yargs
        .options({
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
    ])
        .options({
        "no-auto-open": {
            type: "boolean",
            describe: "Do not open the index.tsx/widget.tsx file automatically",
        },
    })
        .usage("$0 start [--no-auto-open]")
        .example([
        ["$0 start --no-auto-open", "Start server without opening the index.tsx/widget.tsx file"],
        ["$0 start --no-auto-open -p=8000", "Start server without opening the index.tsx/widget.tsx file and listen on 8000"],
    ])
        .options({
        "bonjour": {
            type: "boolean",
            describe: "Enable bonjour service",
        },
    })
        .usage("$0 start [--bonjour]")
        .example([
        ["$0 start --bonjour", "Start server with bonjour service"],
        ["$0 start --bonjour -p=8000", "Start server with bonjour service and listen on 8000"],
        ["$0 start --bonjour --no-auto-open", "Start server with bonjour service without opening the index.tsx/widget.tsx file"],
        ["$0 start --bonjour --no-auto-open -p=8000", "Start server with bonjour service without opening the index.tsx/widget.tsx file and listen on 8000"],
    ]);
}, (argv) => {
    (0, start_server_1.startServer)({
        port: argv.port,
        noAutoOpen: argv['no-auto-open'],
        startBonjourService: argv.bonjour,
    });
})
    .showHelpOnFail(true)
    .option('help', {
    alias: 'h',
    describe: 'Show help',
})
    .demandCommand()
    .parse();
// if (require.main === module) {
//   startServer();
// }
