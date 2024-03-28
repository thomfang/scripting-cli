import { Compiler, WebpackPluginInstance } from "webpack"

export default class AppJsonPlugin implements WebpackPluginInstance {

  apply(compiler: Compiler) {
    const pluginName = 'AppJsonPlugin'

    // webpack 模块实例，可以通过 compiler 对象访问，
    // 这样确保使用的是模块的正确版本
    // （不要直接 require/import webpack）
    const { webpack } = compiler

    // Compilation 对象提供了对一些有用常量的访问。
    const { Compilation } = webpack

    // RawSource 是其中一种 “源码”("sources") 类型，
    // 用来在 compilation 中表示资源的源码
    const { RawSource } = webpack.sources

    // 绑定到 “thisCompilation” 钩子，
    // 以便进一步绑定到 compilation 过程更早期的阶段
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // 绑定到资源处理流水线(assets processing pipeline)
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          // 用某个靠后的资源处理阶段，
          // 确保所有资源已被插件添加到 compilation
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {

          const appJson: {
            name: string
            index: string
            hash: string
            assets: string[]
          } = {
            name: '',
            index: '',
            hash: '',
            assets: Object.keys(assets),
          }

          const indexJs = appJson.assets.find(filePath => filePath.match(/\.js$/i) != null)

          if (indexJs != null) {
            const [appName, ...others] = indexJs.split('/')
            const filePath = others[others.length - 1]
            appJson.name = appName
            appJson.index = filePath
            appJson.hash = filePath.replace('.js', '')

            const indexJsSource = assets[indexJs]

            appJson.assets = [
              ...appJson.assets.filter(e => e !== indexJs),
              filePath,
            ]

            compilation.deleteAsset(indexJs)
            compilation.emitAsset(filePath, indexJsSource)

          }

          compilation.emitAsset(
            'app.json',
            new RawSource(JSON.stringify(appJson, null, 2))
          )

          // const appMap: {
          //   [appName: string]: {
          //     appName: string
          //     index: string
          //     hash: string
          //   }
          // } = {}


          // Object.keys(assets).forEach(path => {
          //   const [appName, ...others] = path.split('/')
          //   const filePath = others[others.length - 1]

          //   // console.log(appName, filePath)

          //   // if (appMap[appName] == null) {
          //   //   appMap[appName] = {
          //   //     appName,
          //   //     // assets: [],
          //   //   }
          //   // }

          //   if (filePath.match(/\.js$/i)) {
          //     appMap[appName] = {
          //       appName,
          //       index: filePath,
          //       hash: filePath.replace('.js', '')
          //     }
          //     // appMap[appName].index = filePath
          //     // appMap[appName].hash = filePath.replace('.js', '')
          //   }
          //   //  else if (filePath.match(/\.(png|jpe?g|gif|svg)$/i)) {
          //   //   appMap[appName].assets.push(path.replace(appName + '/', ''))
          //   // }
          // })

          // Object.entries(appMap).forEach(([appName, content]) => {
          //   compilation.emitAsset(
          //     appName + '/app.json',
          //     new RawSource(JSON.stringify(content, null, 2))
          //   )
          // })

          // "assets" 是一个包含 compilation 中所有资源(assets)的对象。
          // 该对象的键是资源的路径，
          // 值是文件的源码

          // 遍历所有资源，
          // 生成 Markdown 文件的内容
          // const content =
          //   '# In this build:\n\n' +
          //   Object.keys(assets)
          //     .map((filename) => `- ${filename}`)
          //     .join('\n');

          // // 向 compilation 添加新的资源，
          // // 这样 webpack 就会自动生成并输出到 output 目录
          // compilation.emitAsset(
          //   this.options.outputFile,
          //   new RawSource(content)
          // );
        }
      )
    })
  }
}
