import minimist from "minimist"
import { startDevServer } from './startDevServer'
import { buildApp } from './build'
import { createApp } from './createApp'

function run() {
  const args = minimist(process.argv.slice(2))

  console.log(args)
  if (args['create'] != null) {
    createApp(args['create'])
  } else if (args._.includes('dev')) {
    startDevServer()
  } else if (args._.includes('build')) {
    buildApp()
  }

}

run()