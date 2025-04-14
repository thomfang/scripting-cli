
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ip from 'ip';
import Bonjour from 'bonjour';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { createTsConfig, createVSCodeSettings, } from './util';
import { Controller } from './controller';
import { initHttpRouter } from './http_router';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const bonjour = Bonjour();

export function startServer({ port, noAutoOpen }: {
  port: number | undefined
  noAutoOpen: boolean | undefined
}) {

  console.log("port", port, "noAutoOpen", noAutoOpen);

  const PORT = port ?? 3000;

  initHttpRouter(app);

  io.on('connection', (socket) => {
    Controller.create(socket, noAutoOpen);
    console.log(chalk.blue(`Client [${socket.id}] connected`));
  });

  server.listen(PORT, () => {
    createTsConfig(); // Create tsconfig.json when the server starts
    createVSCodeSettings(); // Create vscode settings.json when the server starts

    const ipAddress = ip.address()
    const address = `http://${ipAddress}:${PORT}`;

    console.log(`Server listening on ${chalk.bold.blue(address)}\nYou can select this server in the Scripting app to connect.\n`);

    console.log(`Alternatively, you can ${chalk.green.bold("use the Scripting app to scan")} the QR code and connect: `);
    qrcode.generate(address, { small: true });

    const service = bonjour.publish({
      name: 'Scripting-service',
      type: 'http',
      port: PORT
    });

    process.on('SIGINT', () => {
      service.stop(() => {
        bonjour.unpublishAll(() => {
          bonjour.destroy();
          console.log('Bonjour services have been shut down properly.');
          process.exit(0);
        });
      });
    });

  });
}
