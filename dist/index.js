#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const startDevServer_1 = require("./startDevServer");
// import { buildApp } from './build'
const createScript_1 = require("./createScript");
function run() {
    const args = (0, minimist_1.default)(process.argv.slice(2));
    if (args['create'] != null) {
        (0, createScript_1.createScript)(args['create']);
    }
    else if (args._.includes('dev')) {
        (0, startDevServer_1.startDevServer)();
    }
    //  else if (args._.includes('build')) {
    //   buildApp()
    // }
}
run();
