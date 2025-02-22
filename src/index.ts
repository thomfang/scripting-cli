#!/usr/bin/env node
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import fs from 'fs';
import ip from 'ip';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import Bonjour from 'bonjour';
import crypto from 'crypto';
import chalk from 'chalk';
import childProcess from 'child_process';
import os from 'os';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const bonjour = Bonjour();

const getPath = (filename: string) => path.join(process.cwd(), filename);

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

function md5(content: string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

function startServer(port?: number) {
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

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, tsconfigContent);
      console.log(chalk.green('tsconfig.json created.'));
    } else {
      console.log(chalk.gray('tsconfig.json already exists.'));
    }
  };

  const createVSCodeSettings = () => {
    const settingsContent = `{
  "typescript.format.semicolons": "remove",
  "typescript.preferences.jsxAttributeCompletionStyle": "braces",
}`;

    const filePath = getPath('.vscode/settings.json');
    ensureDirectoryExistence(filePath);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, settingsContent);
      console.log(chalk.green('.vscode/settings.json created.'));
    } else {
      console.log(chalk.gray('.vscode/settings.json already exists.'));
    }

  };

  const ensureDirectoryExistence = (filePath: string) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  };

  const writeDtsFiles = async (files: Record<string, string>) => {
    await Promise.all(
      Object.entries(files).map(async ([filename, content]) => {
        const filePath = getPath(`dts/${filename}`);
        ensureDirectoryExistence(filePath);
        await
          fs
            .promises
            .writeFile(filePath, content)
            .catch((err) => {
              console.log(chalk.red(`Error writing file: ${err}`));
            }
            );
      })
    );
  };

  const tryOpenFileInVSCode = (filePath: string) => {
    let cmd = `code "${filePath}"`;
    if (os.platform() === "win32") {
      cmd = `cmd.exe /c ${cmd}`;
    } else if (os.platform() === "linux") {
      const shell = process.env["SHELL"];
      cmd = `${shell} -c ${cmd}`;
    } else {
      cmd = `"/Applications/Visual Studio Code.app/Contents/MacOS/Electron" "${filePath}"`;
    }
    childProcess.execSync(cmd);
  }

  const PORT = port ?? 3000;

  io.on('connection', (socket) => {
    console.log(chalk.blue(`Client [${socket.id}] connected`));

    let watcher: FSWatcher | null = null;
    let scriptName: string = "";

    const createWatcher = (scriptName: string) => {
      const scriptDir = getPath(scriptName)
      watcher = chokidar.watch(scriptDir, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
      });

      watcher
        .on('change', (filePath) => {
          if (filePath.match(/\.(js(x)?|ts(x)?)$/)) {
            // send file content md5 hash to client
            // const content = fs.readFileSync(filePath, 'utf-8');
            fs.readFile(filePath, 'utf-8', (err, content) => {
              if (err) {
                console.log(chalk.red(`Error reading file: ${err}`));
                return;
              }
              const hash = md5(content);
              const relativePath = path.relative(scriptDir, filePath);
              console.log(
                `[${chalk.bold.blue(scriptName)}] File changed: [${hash}]${relativePath}`
              )
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
          const relativePath = path.relative(scriptDir, filePath);
          socket.emit('deleteFile', {
            scriptName,
            filePath: relativePath,
          });
        })
        .on('unlinkDir', (filePath) => {
          const relativePath = path.relative(scriptDir, filePath);
          socket.emit('deleteFile', {
            scriptName,
            filePath: relativePath,
          });
        })
        .on('error', error => console.log(chalk.bgRed(`Watcher error: ${error}`)))
        .on('ready', () => console.log(`[${chalk.bold.blue(scriptName)}] Watching files for changes`));
    };

    socket.on('syncScriptFromClient', async (data: {
      'global.d.ts': string,
      'scripting.d.ts': string,
      scriptName: string
      scriptFiles: Record<string, string>
    }, ack: Function) => {

      try {
        if (data.scriptName === scriptName) {
          ack({
            error: `Script [${data.scriptName}] is already initialized`,
          });
          return;
        }

        if (scriptName != null) {
          console.log(`Received new script, closing previous watcher`);
          watcher?.close();
          watcher = null;
        }

        await writeDtsFiles({
          "global.d.ts": data["global.d.ts"],
          "scripting.d.ts": data["scripting.d.ts"],
        });

        scriptName = data.scriptName;

        const scriptDir = getPath(data.scriptName);

        const tsconfig = require(getPath('tsconfig.json'));

        if (!tsconfig.include.includes(scriptName)) {
          tsconfig.include.push(scriptName);
          await fs.promises.writeFile(getPath('tsconfig.json'), JSON.stringify(tsconfig, null, 2))
        }

        ensureDirectoryExistence(scriptDir);

        await Promise.all(
          Object.entries(data.scriptFiles).map(async ([filename, content]) => {
            const filePath = path.join(scriptDir, filename);
            ensureDirectoryExistence(filePath);
            await fs.promises.writeFile(filePath, content);
          })
        );

        console.log(chalk.green('global.d.ts and scripting.d.ts and other script files saved.'));

        createWatcher(data.scriptName);

        ack({
          success: true,
        });

        const entryFilePath = path.join(scriptDir, "index.tsx")
        tryOpenFileInVSCode(entryFilePath);

      } catch (e) {
        console.log(chalk.red(`Error: ${e}`));
        ack({
          error: `Failed to init and sync script files.\n${e}`,
        })
      }

    });

    socket.on("syncScriptFromServer", async (data: {
      'global.d.ts': string,
      'scripting.d.ts': string,
      scriptName: string,
    }, ack: Function) => {
      try {
        if (scriptName === data.scriptName) {
          ack({
            error: `Script ${data.scriptName} is already initialized`,
          });
          return;
        }
        if (scriptName != null) {
          console.log(`Received new script [${chalk.bold.blue(data.scriptName)}], closing previous watcher`);
          watcher?.close();
          watcher = null;
        }

        await writeDtsFiles({
          "global.d.ts": data["global.d.ts"],
          "scripting.d.ts": data["scripting.d.ts"],
        });

        const scriptDir = getPath(data.scriptName);

        if (!fs.existsSync(scriptDir)) {
          ack({
            error: `Script directory ${scriptDir} does not exist`,
          });
          return;
        }

        const scriptFiles: Record<string, {
          hash: string
          content: string
        }> = {};

        const readDir = async (dir: string) => {
          const files = await fs.promises.readdir(dir, { withFileTypes: true });
          await Promise.all(
            files.map(async (file) => {
              if (file.isFile()) {
                const filePath = path.join(dir, file.name);
                const relativePath = path.relative(scriptDir, filePath);
                const content = await fs.promises.readFile(filePath, 'utf-8').catch((err) => {
                  console.log(chalk.red(`Error reading file: ${err}`));
                });
                if (typeof content === "string") {
                  scriptFiles[relativePath] = {
                    hash: md5(content),
                    content,
                  };
                }
              } else if (file.isDirectory()) {
                await readDir(path.join(dir, file.name));
              }
            })
          );
        };

        await readDir(scriptDir);

        scriptName = data.scriptName;

        ack({
          scriptFiles,
        });

        createWatcher(data.scriptName);

        const entryFilePath = path.join(scriptDir, "index.tsx")
        tryOpenFileInVSCode(entryFilePath);

      } catch (e) {
        ack({
          error: `Failed to init and pull script files.\n${e}`,
        });
      }
    });

    socket.on('stopDebugScript', (data: string, ack: Function) => {
      if (data === scriptName) {
        console.log(`[${chalk.bold.blue(scriptName)}] Stop debug script`);
        watcher?.close();
        watcher = null;
        scriptName = "";
        ack(true);
      } else {
        ack(false);
      }
    });

    socket.on("getFileContent", async (data: {
      scriptName: string,
      relativePath: string
    }, ack: Function) => {
      if (scriptName !== data.scriptName) {
        ack({
          error: `Script ${data.scriptName} is not initialized`,
        });
        return;
      }

      const filePath = path.join(getPath(data.scriptName), data.relativePath);
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        ack({
          content,
        });
      } catch (e) {
        ack({
          error: `Failed to get file content.\n${e}`,
        });
      }
    });

    socket.on("log", (data: {
      scriptName: string
      content: string
      isError: boolean
    }) => {
      if (data.scriptName !== scriptName) {
        return;
      }
      console.log(`[${chalk.bold.blue(scriptName)}][${data.isError ? chalk.red("ERROR") : "LOG"
        }][${new Date().toLocaleTimeString()}] ${data.content}`);
    });

    socket.on("openFile", async (data: {
      scriptName: string
      relativePath: string
    }) => {
      if (data.scriptName !== scriptName) {
        return;
      }

      const filePath = path.join(getPath(scriptName), data.relativePath)

      if (fs.existsSync(filePath)) {
        tryOpenFileInVSCode(filePath)
      }

    })

    socket.on('disconnect', () => {
      console.log(chalk.gray(`Client [${socket.id}] disconnected`));
      watcher?.close();
      watcher = null;
    });

    const serverScriptNames = fs.readdirSync(process.cwd())
      .filter((filename) =>
        fs.statSync(filename).isDirectory()
        &&
        filename !== '.vscode'
      )

    // console.log(serverScriptNames)

    socket.emit("serverScripts", serverScriptNames);
  });

  server.listen(PORT, () => {
    createTsConfig(); // Create tsconfig.json when the server starts
    createVSCodeSettings(); // Create vscode settings.json when the server starts

    const ipAddress = ip.address()
    const address = `http://${ipAddress}:${PORT}`;

    console.log(`Server listening on ${chalk.blue(address)}\nYou can select this server in the Scripting app to connect.`);

    bonjour.publish({ name: 'Scripting-service', type: 'http', port: PORT });

    process.on('SIGINT', () => {
      bonjour.unpublishAll(() => {
        console.log('Server stopped');
        process.exit();
      });
    });

  });
}

if (require.main === module) {
  startServer();
}
