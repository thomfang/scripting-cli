import path from 'node:path'
import fs from 'node:fs'

import chalk from 'chalk'

import TerserPlugin from 'terser-webpack-plugin'
import webpack from 'webpack'

import AppJsonPlugin from './AppJsonPlugin'

const baseDir = process.cwd()
const srcDir = path.resolve(baseDir, 'src')
const buildDir = path.resolve(baseDir, 'build')

const pkgPath = path.resolve(baseDir, 'package.json')

if (!fs.existsSync(pkgPath)) {
  console.log(
    chalk.red('✖️ package.json not found.')
  )
  process.exit(404)
}

const pkg = JSON.parse(
  fs.readFileSync(
    pkgPath,
    'utf8'
  )
)

const entry = {
  [pkg.name]: path.join(srcDir, 'index.tsx'),
}

const config: webpack.Configuration = {
  mode: 'production',
  entry,
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'named',
    minimizer: [
      new TerserPlugin({
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
          outputPath: (url: string, resourcePath: string, context: any) => {
            // if (url.startsWith('src/app/')) {
            //   return url.replace('src/app/', '')
            // }
            return url.replace('src/', '')
            // return url.replace(/src\/([^/]+)\//, '')
          },
          publicPath: (url: string, resourcePath: string, context: any) => {
            // console.log([url, resourcePath])
            // return url.replace(/.*src\/app\/(\w+\/)?/, '')
            // if (url.startsWith('src/app/')) {
            //   return url.replace('src/app/', '')
            // }
            return url.replace('src/', '')
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
    path: buildDir,
    clean: true,
  },
  plugins: [
    new AppJsonPlugin(),
  ],
  devtool: false,
  externals: {
    'scripting': 'Scripting',
  }
}

export default config