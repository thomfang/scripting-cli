import path from 'path'

import TerserPlugin from 'terser-webpack-plugin'
import webpack from 'webpack'

import AppJsonPlugin from './AppJsonPlugin'

const baseDir = path.resolve(__dirname, '..')
const srcDir = path.resolve(baseDir, 'src')
const buildDir = path.resolve(baseDir, 'build')

const config: webpack.Configuration = {
  mode: 'production',
  entry: path.join(srcDir, 'index.tsx'),
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
    new AppJsonPlugin(),
  ],
  devtool: false,
}

export default config