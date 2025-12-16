
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import os from 'os';
import ip from 'ip';
import Bonjour from 'bonjour';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { createTsConfig, createVSCodeSettings, ensureScriptsDirectory, } from './util';
import { Controller } from './controller';
import { initHttpRouter } from './http_router';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const bonjour = Bonjour();

// Keywords to identify VPN/virtual network adapters that should be excluded
const VIRTUAL_ADAPTER_KEYWORDS = [
  'virtual',
  'vpn',
  'vethernet',
  'vmware',
  'vmnet',
  'vbox',
  'virtualbox',
  'docker',
  'wsl',
  'loopback',
  'hamachi',
  'tunngle',
  'cloudflare',
  'warp',
  'tailscale',
  'zerotier'
];

// Preferred adapter names for real network interfaces
const PREFERRED_ADAPTER_KEYWORDS = [
  'ethernet',
  'eth',
  'wi-fi',
  'wifi',
  'wlan',
  'en0',
  'en1'
];

/**
 * Get the local network IP address, filtering out VPN and virtual adapters.
 * Prioritizes real network adapters (Ethernet, Wi-Fi) over virtual ones.
 */
function getLocalNetworkIP(): string | null {
  const interfaces = os.networkInterfaces();
  const results: { name: string; address: string; priority: number }[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    const lowerName = name.toLowerCase();

    // Skip virtual/VPN adapters
    if (VIRTUAL_ADAPTER_KEYWORDS.some(keyword => lowerName.includes(keyword))) {
      continue;
    }

    for (const addr of addrs) {
      // Only consider non-internal IPv4 addresses
      if (addr.family === 'IPv4' && !addr.internal) {
        // Skip certain IP ranges typically used by VPNs
        // 198.18.0.0/15 is reserved for network benchmark testing (Cloudflare WARP uses this)
        // 100.64.0.0/10 is Carrier-grade NAT (Tailscale uses this)
        const ip = addr.address;
        const firstOctet = parseInt(ip.split('.')[0], 10);
        const secondOctet = parseInt(ip.split('.')[1], 10);

        if (firstOctet === 198 && (secondOctet === 18 || secondOctet === 19)) {
          continue; // Skip 198.18.0.0/15
        }
        if (firstOctet === 100 && secondOctet >= 64 && secondOctet <= 127) {
          continue; // Skip 100.64.0.0/10
        }

        // Determine priority (lower is better)
        let priority = 10;
        if (PREFERRED_ADAPTER_KEYWORDS.some(keyword => lowerName.includes(keyword))) {
          priority = 1;
        }

        results.push({ name, address: ip, priority });
      }
    }
  }

  // Sort by priority and return the best match
  results.sort((a, b) => a.priority - b.priority);
  return results.length > 0 ? results[0].address : null;
}

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

    // await migrateOldFiles(); // Migrate old files to the scripts directory

    const ipAddress = getLocalNetworkIP() ?? ip.address();
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
        console.log('Shutting down Bonjour...');
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
