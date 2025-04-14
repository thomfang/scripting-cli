#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { startServer } from './start_server';

yargs(hideBin(process.argv))
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
          default: true,
          describe: "Do not open the index.tsx/widget.tsx file automatically",
        },
      })
      .usage("$0 start [--no-auto-open]")
      .example([
        ["$0 start --no-auto-open", "Start server without opening the index.tsx/widget.tsx file"],
        ["$0 start --no-auto-open -p=8000", "Start server without opening the index.tsx/widget.tsx file and listen on 8000"],
      ]);
  }, (argv) => {
    startServer({
      port: argv.port,
      noAutoOpen: argv['no-auto-open'],
    });
  })
  .option('help', {
    alias: 'h',
    describe: 'Show help',
  })
  .parse();



// if (require.main === module) {
//   startServer();
// }
