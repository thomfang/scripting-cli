
import chokidar, { FSWatcher } from 'chokidar';
import { Socket } from 'socket.io';
import { ensureDirectoryExistence, getRelativePath, getScriptPath, md5, tryOpenFileInVSCode, writeDtsFiles } from './util';
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { globalDtsFileName, scriptingDtsFileName } from './const';

export class Controller {

  private static instances: Map<string, Controller> = new Map();

  static create(socket: Socket, noAutoOpen: boolean | undefined) {
    const ctrl = new Controller(socket, noAutoOpen);
    Controller.instances.set(socket.id, ctrl);
    return ctrl;
  }

  static get(socketId: string) {
    return Controller.instances.get(socketId);
  }

  watcher: FSWatcher | null = null;
  scriptName: string | null = null;
  socket: Socket | null = null;
  noAutoOpen: boolean | undefined;

  constructor(socket: Socket, noAutoOpen: boolean | undefined) {
    this.noAutoOpen = noAutoOpen;
    this.socket = socket;

    socket.emit("socketId", socket.id);

    socket.on('syncScriptFromClient', this.handleSyncScriptFromClient);

    socket.on("syncScriptFromServer", this.handleSyncScriptFromClient);

    socket.on('stopDebugScript', this.handleStopDebugScript);

    socket.on("getFileContent", this.handleGetFileContent);

    socket.on("log", this.handleLog);

    socket.on("openFile", this.handleOpenFile)

    socket.on('disconnect', (reason) => {
      console.log(chalk.gray(`Client [${socket.id}] disconnected: ${reason}`));
      this.watcher?.close();
      this.watcher = null;
      this.scriptName = null;
      Controller.instances.delete(socket.id);
      socket.removeAllListeners();
    });

    fs.promises.readdir(getScriptPath()).then((files) => {
      const serverScriptNames = files.filter((filename) =>
        fs.statSync(getScriptPath(filename)).isDirectory()
        && !filename.startsWith('.')
        && filename !== 'dts'
      )
      socket.emit("serverScripts", serverScriptNames);
    })
  }

  createWatcher(scriptName: string) {
    const scriptDir = getScriptPath(scriptName)
    this.watcher = chokidar.watch(scriptDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    this.watcher
      .on('change', (filePath) => {
        if (filePath.match(/\.(js(x)?|ts(x)?|json|md|txt)$/)) {
          // send file content md5 hash to client
          // const content = fs.readFileSync(filePath, 'utf-8');
          fs.readFile(filePath, 'utf-8', (err, content) => {
            if (err) {
              console.log(chalk.red(`Error reading file: ${err}`));
              return;
            }
            const hash = md5(content);
            const relativePath = getRelativePath(scriptDir, filePath);
            console.log(
              `[${chalk.bold.blue(scriptName)}] File changed: [${hash}]${relativePath}`
            )
            this.socket?.emit('fileChange', {
              scriptName,
              filePath: relativePath,
              hash,
            });
          });
        }
        // TODO, add support for other file types
      })
      .on('unlink', (filePath) => {
        const relativePath = getRelativePath(scriptDir, filePath);
        this.socket?.emit('deleteFile', {
          scriptName,
          filePath: relativePath,
        });
      })
      .on('unlinkDir', (filePath) => {
        const relativePath = getRelativePath(scriptDir, filePath);
        this.socket?.emit('deleteFile', {
          scriptName,
          filePath: relativePath,
        });
      })
      .on('error', error => console.log(chalk.bgRed(`Watcher error: ${error}`)))
      .on('ready', () => console.log(`[${chalk.bold.blue(scriptName)}] Watching files for changes`));
  }

  handleSyncScriptFromClient = async (data: {
    [globalDtsFileName]: string,
    [scriptingDtsFileName]: string,
    scriptName: string
    scriptFiles: Record<string, string>
  }, ack: (result: {
    error?: string
    success?: boolean
  }) => void) => {

    try {
      if (data.scriptName === this.scriptName) {
        ack({
          error: `Script [${data.scriptName}] is already initialized`,
        });
        return;
      }

      if (this.scriptName != null) {
        console.log(`Received new script, closing previous watcher`);
        this.watcher?.close();
        this.watcher = null;
      }

      await writeDtsFiles({
        [globalDtsFileName]: data[globalDtsFileName],
        [scriptingDtsFileName]: data[scriptingDtsFileName],
      });

      this.scriptName = data.scriptName;

      const scriptDir = getScriptPath(data.scriptName);

      ensureDirectoryExistence(scriptDir);

      await Promise.all(
        Object.entries(data.scriptFiles).map(async ([filename, content]) => {
          const filePath = path.join(scriptDir, filename);
          ensureDirectoryExistence(filePath);
          await fs.promises.writeFile(filePath, content);
        })
      );

      console.log(chalk.green(`${globalDtsFileName} and ${scriptingDtsFileName} and other script files saved.`));

      this.createWatcher(data.scriptName);

      ack({
        success: true,
      });

      if (!this.noAutoOpen) {

        // Open the entry file in VSCode after a delay
        // to ensure the response is sent. Because the open file command
        // may suspend the response and cause the client to not receive the ack.
        setTimeout(() => {
          const entryFilePath = path.join(scriptDir, "index.tsx")
          tryOpenFileInVSCode(entryFilePath);
        }, 1000);
      }

    } catch (e) {
      console.log(chalk.red(`Error: ${e}`));
      ack({
        error: `Failed to init and sync script files.\n${e}`,
      })
    }

  }

  handleSyncScriptFromServer = async (data: {
    'global.d.ts': string,
    'scripting.d.ts': string,
    scriptName: string,
  }, ack: (result: {
    error?: string,
    scriptFiles?: Record<string, {
      hash: string
      content: string
    }>
  }) => void) => {
    try {
      if (this.scriptName === data.scriptName) {
        ack({
          error: `Script ${data.scriptName} is already initialized`,
        });
        return;
      }
      if (this.scriptName != null) {
        console.log(`Received new script [${chalk.bold.blue(data.scriptName)}], closing previous watcher`);
        this.watcher?.close();
        this.watcher = null;
      }

      await writeDtsFiles({
        globalDtsFileName: data[globalDtsFileName],
        scriptingDtsFileName: data[scriptingDtsFileName],
      });

      const scriptDir = getScriptPath(data.scriptName);

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
            // ignore .git and .vscode directories
            if (file.name.startsWith('.git') || file.name.startsWith('.vscode')) {
              return;
            }
            if (file.isFile()) {
              const filePath = path.join(dir, file.name);
              const relativePath = getRelativePath(scriptDir, filePath);
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

      this.scriptName = data.scriptName;

      ack({
        scriptFiles,
      });

      this.createWatcher(data.scriptName);

      if (!this.noAutoOpen) {
        // Open the entry file in VSCode after a delay
        // to ensure the response is sent. Because the open file command
        // may suspend the response and cause the client to not receive the ack.
        setTimeout(() => {
          const entryFilePath = path.join(scriptDir, "index.tsx")
          tryOpenFileInVSCode(entryFilePath);
        }, 1000);
      }
    } catch (e) {
      ack({
        error: `Failed to init and pull script files.\n${e}`,
      });
    }
  }

  handleLog = (data: {
    scriptName: string
    content: string
    isError: boolean
  }) => {
    if (data.scriptName !== this.scriptName) {
      return;
    }
    console.log(`[${chalk.bold.blue(this.scriptName)}][${data.isError ? chalk.red("ERROR") : "LOG"
      }][${new Date().toLocaleTimeString()}] ${data.content}`);
  }

  handleOpenFile = async (data: {
    scriptName: string
    relativePath: string
  }) => {
    if (data.scriptName !== this.scriptName) {
      return;
    }

    const filePath = path.join(getScriptPath(this.scriptName), data.relativePath)

    if (!this.noAutoOpen && fs.existsSync(filePath)) {
      tryOpenFileInVSCode(filePath)
    }

  }

  handleStopDebugScript = (data: string, ack: (result: boolean) => void) => {
    if (data === this.scriptName) {
      console.log(`[${chalk.bold.blue(this.scriptName)}] Stop debug script`);
      this.watcher?.close();
      this.watcher = null;
      this.scriptName = null;
      ack(true);
    } else {
      ack(false);
    }
  }

  handleGetFileContent = async (data: {
    scriptName: string,
    relativePath: string
  }, ack: (result: {
    error?: string,
    content?: string
  }) => void) => {
    if (this.scriptName !== data.scriptName) {
      ack({
        error: `Script ${data.scriptName} is not initialized`,
      });
      return;
    }

    const filePath = path.join(getScriptPath(data.scriptName), data.relativePath);
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
  }
}