#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { startServer } from './start_server';

yargs(hideBin(process.argv))
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
        },
        "no-auto-open": {
          type: "boolean",
          describe: "Do not open the index.tsx/widget.tsx file automatically",
        },
        bonjour: {
          type: "boolean",
          describe: "Enable bonjour service",
        },
        editor: {
          type: "string",
          describe: "Override the editor for this run (e.g. vscode, cursor, zed, webstorm)",
        },
        reconfigure: {
          type: "boolean",
          describe: "Force the interactive editor selection again, overwriting the saved config",
        },
      })
      .usage("$0 start [--port=<port>] [--editor=<key>] [--reconfigure] [--no-auto-open] [--bonjour]")
      .example([
        ["$0 start -p=8000", "Start server and listen on 8000"],
        ["$0 start --no-auto-open", "Start server without opening the entry file"],
        ["$0 start --bonjour", "Start server with bonjour service"],
        ["$0 start --editor=cursor", "Use Cursor for this run"],
        ["$0 start --reconfigure", "Reselect the editor interactively"],
      ]);
  }, (argv) => {
    startServer({
      port: argv.port,
      noAutoOpen: argv['no-auto-open'],
      startBonjourService: argv.bonjour,
      editorOverride: argv.editor,
      reconfigure: argv.reconfigure,
    });
  })
  .command('migrate', 'Migrate the scripts in the workspace root directory to the scripts directory.', (yargs) => {
    return yargs
      .usage("$0 migrate")
      .example([
        ["$0 migrate", "Migrate the scripts in the workspace root directory to the scripts directory."]
      ]);
  }, async () => {
    const { migrateOldFiles } = await import('./util');
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
