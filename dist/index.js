#!/usr/bin/env node
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    .command('migrate', 'Migrate the scripts in the workspace root directory to the scripts directory.', (yargs) => {
    return yargs
        .usage("$0 migrate")
        .example([
        ["$0 migrate", "Migrate the scripts in the workspace root directory to the scripts directory."]
    ]);
}, async () => {
    const { migrateOldFiles } = await Promise.resolve().then(() => __importStar(require('./util')));
    await migrateOldFiles();
    process.exit(0);
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
