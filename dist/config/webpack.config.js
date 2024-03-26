"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const AppJsonPlugin_1 = __importDefault(require("./AppJsonPlugin"));
const baseDir = path_1.default.resolve(__dirname, '..');
const srcDir = path_1.default.resolve(baseDir, 'src');
const buildDir = path_1.default.resolve(baseDir, 'build');
const config = {
    mode: 'production',
    entry: path_1.default.join(srcDir, 'index.tsx'),
    optimization: {
        moduleIds: 'deterministic',
        chunkIds: 'named',
        minimizer: [
            new terser_webpack_plugin_1.default({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][contenthash:8].[ext]',
                    outputPath: (url, resourcePath, context) => {
                        // if (url.startsWith('src/app/')) {
                        //   return url.replace('src/app/', '')
                        // }
                        return url.replace('src/', '');
                        // return url.replace(/src\/([^/]+)\//, '')
                    },
                    publicPath: (url, resourcePath, context) => {
                        // console.log([url, resourcePath])
                        // return url.replace(/.*src\/app\/(\w+\/)?/, '')
                        // if (url.startsWith('src/app/')) {
                        //   return url.replace('src/app/', '')
                        // }
                        return url.replace('src/', '');
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: ['node_modules', srcDir,],
        alias: {
            '@': srcDir,
        }
    },
    output: {
        // filename: 'index.js',
        // filename: '[name]/index.js',
        filename: '[name]/[contenthash:8].js',
        path: buildDir,
        clean: true,
    },
    plugins: [
        new AppJsonPlugin_1.default(),
    ],
    devtool: false,
};
exports.default = config;
