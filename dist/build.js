"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = void 0;
const chalk_1 = __importDefault(require("chalk"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_config_1 = __importDefault(require("./config/webpack.config"));
const cross_zip_1 = require("cross-zip");
const node_path_1 = __importDefault(require("node:path"));
function buildApp() {
    const compiler = (0, webpack_1.default)(webpack_config_1.default);
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
}
exports.buildApp = buildApp;
function createAppFile() {
    const appFile = `${Object.keys(webpack_config_1.default.entry)[0]}.zip`;
    console.log(` ~ Creating ${appFile}....`);
    (0, cross_zip_1.zip)(node_path_1.default.resolve(process.cwd(), './build'), node_path_1.default.resolve(process.cwd(), `./build/${appFile}`), (error) => {
        if (error != null) {
            console.log(chalk_1.default.red('Error zipping app files: \n') + error);
        }
        else {
            console.log(chalk_1.default.green(` ✔️ ${appFile} created.`));
        }
    });
}
