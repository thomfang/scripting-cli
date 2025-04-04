#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { startServer } from './start_server';

yargs(hideBin(process.argv))
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



// if (require.main === module) {
//   startServer();
// }
