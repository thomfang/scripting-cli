import chalk from 'chalk'
import Webpack from "webpack"
import webpackConfig from './config/webpack.config'

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
    }
  })

}