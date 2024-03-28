import chalk from 'chalk'
import Webpack from "webpack"
import webpackConfig from './config/webpack.config'
import { zip } from 'cross-zip'
import path from 'node:path'

export function buildApp() {
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

}

function createAppFile() {
  const appFile = `${Object.keys(webpackConfig.entry as any)[0]}.zip`

  console.log(
    ` ~ Creating ${appFile}....`
  )

  zip(
    path.resolve(process.cwd(), './build'),
    path.resolve(process.cwd(), `./build/${appFile}`),
    (error) => {
      if (error != null) {
        console.log(
          chalk.red('Error zipping app files: \n') + error
        )
      } else {
        console.log(
          chalk.green(` ✔️ ${appFile} created.`)
        )
      }
    }
  )
}