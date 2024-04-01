import chalk from 'chalk'
import Webpack from "webpack"
import { zip } from 'cross-zip'
import qrcode from 'qrcode-terminal'

import path from 'node:path'
import http from 'node:http'
import express from 'express'

import getConfig from './config/webpack.config'
import * as utils from './utils'
import minimist from 'minimist'

export function buildApp() {
  const webpackConfig = getConfig()

  const appName = Object.keys(webpackConfig.entry as any)[0]
  const appFile = `${appName}.zip`

  const outputDir = path.resolve(process.cwd(), appName)

  webpackConfig.output!.path = outputDir

  const compiler = Webpack(webpackConfig)

  console.log(
    'Start running build...\n'
    // +
    // chalk.green(
    //   Object.keys(webpackConfig.entry).map(e => `  - ${e}`).join('\n')
    // )
    // +
    // '\n'
  )

  compiler.run((err, stats) => {
    if (err) {
      console.log(
        chalk.red('Webpack compile error: \n') + err
      )
    } else {
      console.log(stats?.toString({
        chunks: false,
        colors: false,
      }))

      createAppFile()
    }
  })



  function createAppFile() {
    console.log(
      ` ~ Creating ${appFile}....`
    )

    zip(
      outputDir,
      path.resolve(outputDir, appFile),
      (error) => {
        if (error != null) {
          console.log(
            chalk.red('Error zipping app files: \n') + error
          )
        } else {
          console.log(
            chalk.green(` ✔️ ${appFile} created.`)
          )

          startServer()
        }
      }
    )
  }

  function startServer() {
    const app = express()
    const server = http.createServer(app)

    const args = minimist(process.argv.slice(2))
    const ipAddress = utils.getIpAddress()
    const port = args['port'] || 8000

    app.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
      next()
    })

    app.use(
      '/',
      express.static(
        outputDir
      )
    )

    server.listen(port)

    console.log(`Server running at ${chalk.bold(
      chalk.green(
        `http://${ipAddress}:${port}`
      ),
    )}`)
    console.log(`Use the Scripting app to scan the QR code below to install:`)
    qrcode.generate(`http://${ipAddress}:${port}`, { small: true })
  }

}