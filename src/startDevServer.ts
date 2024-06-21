import http from 'node:http'
import path from 'node:path'
import { readFile, } from 'node:fs/promises'
import chalk from 'chalk'
import express from 'express'
import minimist from 'minimist'
import qrcode from 'qrcode-terminal'

import { Server, Socket } from 'socket.io'

import * as utils from './utils'

import Webpack from "webpack"
import getConfig from './config/webpack.config'

export function startDevServer() {
  const args = minimist(process.argv.slice(2))

  const ipAddress = utils.getIpAddress()
  const port = args['port'] || 8000

  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)


  let isStarted = false
  let connectedSockets: Socket[] = []

  const webpackConfig = getConfig()

  webpackConfig.mode = 'development'

  const compiler = Webpack(webpackConfig)

  console.log(
    'Start running webpack compiler in watch mode...'
  )

  compiler.watch({}, (err, stats) => {
    utils.clearConsole()
    if (err) {
      console.log(
        chalk.red(' ✖️ webpack compile error: \n') + err
      )
    } else {
      console.log(stats?.toString({
        chunks: false,
        colors: true,
      }))

      if (stats?.toJson().errorsCount === 0) {
        onCompileDone()
      }
    }
  })

  async function onCompileDone() {
    if (isStarted) {
      printDevServerAddress()

      console.log(
        chalk.gray(` ~ Sent update event to ${connectedSockets.length} client(s)`)
      )

      const scriptJson = await readFile(
        path.resolve(
          process.cwd(),
          'build/script.json'
        ),
        'utf-8'
      )

      for (const socket of connectedSockets) {
        socket.emit('update', scriptJson)
      }
    } else {
      start()
    }
  }

  function printDevServerAddress() {
    console.log(`Server running at ${chalk.bold(
      chalk.green(
        `http://${ipAddress}:${port}`
      ),
    )}`)
    console.log(`Use the Scripting app to scan the QR code below:`)
    qrcode.generate(`http://${ipAddress}:${port}`, { small: true })
  }

  function start() {
    if (isStarted) {
      return
    }

    app.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
      next()
    })

    app.use(
      '/',
      express.static(
        path.resolve(process.cwd(), 'build')
      )
    )

    //有新的客户端连接时触发
    io.on('connection', function (socket) {
      console.log(
        chalk.green(
          ` + A client(${socket.id}) connected.`
        )
      )
      connectedSockets.push(socket)

      socket.on('error', function (err) {
        console.log(
          chalk.red(
            ' ✖️ Server Error: ', err
          )
        )
      })

      socket.on('disconnect', function () {
        var index = connectedSockets.indexOf(socket)
        if (index > -1) {
          connectedSockets.splice(index, 1)
          console.log(
            chalk.gray(
              ` - A client(${socket.id}) disconnected.`
            )
          )
        }
      })
    })

    server.listen(port)
    printDevServerAddress()
    isStarted = true
  }

}

