
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ip from 'ip';
import Bonjour from 'bonjour';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { createTsConfig, createVSCodeSettings, ensureScriptsDirectory, migrateOldFiles, } from './util';
import { Controller } from './controller';
import { initHttpRouter } from './http_router';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const bonjour = Bonjour();

export function startServer({ port, noAutoOpen, startBonjourService }: {
  port: number | undefined
  noAutoOpen: boolean | undefined
  startBonjourService: boolean | undefined
}) {

  // console.log("port", port, "noAutoOpen", noAutoOpen);

  const PORT = port ?? 3000;

  initHttpRouter(app);

  io.on('connection', (socket) => {
    Controller.create(socket, noAutoOpen);
    console.log(chalk.blue(`Client [${socket.id}] connected`));
  });

  server.listen(PORT, async () => {
    createTsConfig(); // Create tsconfig.json when the server starts
    createVSCodeSettings(); // Create vscode settings.json when the server starts
    ensureScriptsDirectory(); // Ensure the scripts directory exists
    await migrateOldFiles(); // Migrate old files to the scripts directory

    const ipAddress = ip.address()
    const address = `http://${ipAddress}:${PORT}`;

    if (startBonjourService) {
      console.log(`Server listening on ${chalk.bold.blue(address)}\n\n${chalk.yellow('You can select this server in the Scripting app to connect')}.\n`);

      console.log(`Alternatively, you can ${chalk.green.bold("use the Scripting app to scan")} the QR code and connect: `);
    } else {
      console.log(chalk.yellow.italic(`The bonjour service is not started, you can use \`--bonjour\` option to start it.`));
      console.log(`Server listening on ${chalk.bold.blue(address)}\nYou can ${chalk.green.bold("use the Scripting app to scan")} the QR code and connect: `);
    }

    qrcode.generate(address, { small: true });

    if (startBonjourService) {

      function gracefulShutdown() {
        console.log('Shutting down Bonjour…');
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

      ['SIGINT', 'SIGTERM'].forEach(sig =>
        process.once(sig, gracefulShutdown)
      );

      // Handle uncaught exceptions
      process.on('uncaughtException', err => {
        console.error('Uncaught exception:', err);
        gracefulShutdown();
      });
    }

  });
}
