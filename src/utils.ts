
import os from 'node:os'

export function getIpAddress() {
  const interfaces = os.networkInterfaces()

  for (const devName in interfaces) {
    const iface = interfaces[devName]

    if (iface == null) {
      continue
    }

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]
      if (alias.family === 'IPv4'
        && alias.address !== '127.0.0.1'
        && !alias.internal
      ) {
        return alias.address
      }
    }
  }
}

export function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  )
}