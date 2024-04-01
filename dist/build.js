"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const chalk_1 = __importDefault(require("chalk"));
const webpack_1 = __importDefault(require("webpack"));
const cross_zip_1 = require("cross-zip");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const node_path_1 = __importDefault(require("node:path"));
const node_http_1 = __importDefault(require("node:http"));
const express_1 = __importDefault(require("express"));
const webpack_config_1 = __importDefault(require("./config/webpack.config"));
const utils = __importStar(require("./utils"));
const minimist_1 = __importDefault(require("minimist"));
function buildApp() {
    const webpackConfig = (0, webpack_config_1.default)();
    const appName = Object.keys(webpackConfig.entry)[0];
    const appFile = `${appName}.zip`;
    const outputDir = node_path_1.default.resolve(process.cwd(), appName);
    webpackConfig.output.path = outputDir;
    const compiler = (0, webpack_1.default)(webpackConfig);
    console.log('Start running build...\n'
    // +
    // chalk.green(
    //   Object.keys(webpackConfig.entry).map(e => `  - ${e}`).join('\n')
    // )
    // +
    // '\n'
    );
    compiler.run((err, stats) => {
        if (err) {
            console.log(chalk_1.default.red('Webpack compile error: \n') + err);
        }
        else {
            console.log(stats === null || stats === void 0 ? void 0 : stats.toString({
                chunks: false,
                colors: false,
            }));
            createAppFile();
        }
    });
    function createAppFile() {
        console.log(` ~ Creating ${appFile}....`);
        (0, cross_zip_1.zip)(outputDir, node_path_1.default.resolve(outputDir, appFile), (error) => {
            if (error != null) {
                console.log(chalk_1.default.red('Error zipping app files: \n') + error);
            }
            else {
                console.log(chalk_1.default.green(` ✔️ ${appFile} created.`));
                startServer();
            }
        });
    }
    function startServer() {
        const app = (0, express_1.default)();
        const server = node_http_1.default.createServer(app);
        const args = (0, minimist_1.default)(process.argv.slice(2));
        const ipAddress = utils.getIpAddress();
        const port = args['port'] || 8000;
        app.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, PUT, DELETE');
            next();
        });
        app.use('/', express_1.default.static(outputDir));
        server.listen(port);
        console.log(`Server running at ${chalk_1.default.bold(chalk_1.default.green(`http://${ipAddress}:${port}`))}`);
        console.log(`Use the Scripting app to scan the QR code below to install:`);
        qrcode_terminal_1.default.generate(`http://${ipAddress}:${port}`, { small: true });
    }
}
exports.buildApp = buildApp;
