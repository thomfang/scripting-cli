"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const chalk_1 = __importDefault(require("chalk"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const webpack_1 = __importDefault(require("webpack"));
const AppJsonPlugin_1 = __importDefault(require("./AppJsonPlugin"));
function getConfig() {
    const baseDir = process.cwd();
    const srcDir = node_path_1.default.resolve(baseDir, 'src');
    const outputDir = node_path_1.default.resolve(baseDir, 'build');
    const pkgPath = node_path_1.default.resolve(baseDir, 'package.json');
    if (!node_fs_1.default.existsSync(pkgPath)) {
        console.log(chalk_1.default.red('✖️ package.json not found.'));
        process.exit(404);
    }
    const pkg = JSON.parse(node_fs_1.default.readFileSync(pkgPath, 'utf8'));
    const entry = {
        [pkg.name]: node_path_1.default.join(srcDir, 'index.tsx'),
    };
    const config = {
        mode: 'production',
        entry,
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
            modules: [
                'node_modules',
                srcDir,
            ],
            alias: {
                '@': srcDir,
            }
        },
        output: {
            filename: '[name]/[contenthash:8].js',
            // filename: '[contenthash:8].js',
            path: outputDir,
            clean: true,
        },
        plugins: [
            new AppJsonPlugin_1.default(),
            new webpack_1.default.BannerPlugin({
                banner: 'const Scripting = require("scripting");',
                raw: true
            }),
        ],
        devtool: false,
        externals: {
            'scripting': 'Scripting',
        }
    };
    return config;
}
exports.default = getConfig;
