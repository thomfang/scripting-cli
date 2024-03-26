import http from 'node:http'
import path from 'node:path'
import chalk from 'chalk'
import express from 'express'
import minimist from 'minimist'

import { Server, Socket } from 'socket.io'

import * as utils from './utils'

import Webpack from "webpack"
import webpackConfig from './config/webpack.config'

export function startDevServer() {
  const args = minimist(process.argv.slice(2))

  const ipAddress = utils.getIpAddress()
  const port = args['port'] || 8000

  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)

  let isStarted = false
  let connectedSockets: Socket[] = []

  webpackConfig.mode = 'development'

  const compiler = Webpack(webpackConfig)

  console.log(
    'Start running webpack compiler in watch mode...'
  )

  compiler.watch(
    {

    },
    (err, stats) => {
      utils.clearConsole()
      if (err) {
        console.log(
          chalk.red('[DevServer] webpack compile error: \n') + err
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
    }
  )

  function onCompileDone() {
    if (isStarted) {
      printDevServerAddress()
      console.log(
        chalk.gray(`[DevServer] Sent update event to ${connectedSockets.length} client(s)`)
      )
      connectedSockets.forEach(socket => {
        socket.emit('update')
      })
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
  }

  function start() {
    if (isStarted) {
      return
    }

    app.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', '*')
      // res.header('Content-Type', 'application/jsoncharset=utf-8')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
      next()
    })

    app.use(
      '/',
      express.static(
        path.resolve(__dirname, '../build')
      )
    )

    //有新的客户端连接时触发
    io.on('connection', function (socket) {
      console.log(
        chalk.green(
          '[DevServer] A client connected.'
        )
      )
      connectedSockets.push(socket)

      socket.on('error', function (err) {
        console.log(
          chalk.red(
            '[DevServer] Error: ', err
          )
        )
      })

      socket.on('disconnect', function () {
        var index = connectedSockets.indexOf(socket)
        if (index > -1) {
          connectedSockets.splice(index, 1)
          console.log(
            chalk.gray(
              '[DevServer] A client disconnected.'
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

