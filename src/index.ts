#!/usr/bin/env node

import minimist from "minimist"
import { startDevServer } from './startDevServer'
// import { buildApp } from './build'
import { createScript } from './createScript'

function run() {
  const args = minimist(process.argv.slice(2))

  if (args['create'] != null) {
    createScript(args['create'])
  } else if (args._.includes('dev')) {
    startDevServer()
  }
  //  else if (args._.includes('build')) {
  //   buildApp()
  // }

}

run()