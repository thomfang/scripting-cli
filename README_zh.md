# Scripting 应用命令行工具

欢迎使用 `scripting-cli` 命令行工具，它旨在与 Scripting 应用集成。该工具允许您在使用喜爱的桌面编辑器（VSCode、Cursor、Windsurf、Zed、WebStorm、Vim 等）开发脚本时，实现实时同步和预览。

[English](./README.md) | [日本語](./README_ja.md) | [Deutsch](./README_de.md) | [Français](./README_fr.md) | [Italiano](./README_it.md)

## 先决条件

在使用 `scripting-cli` 之前，请确保满足以下要求：

1. **Node.js**：确保已安装最新版本的 Node.js。您可以通过运行以下命令检查当前版本：

   ```bash
   node -v
   ```

2. **Scripting 应用**：必须安装 Scripting 应用，以便连接由 `scripting-cli` 启动的本地服务。

## 安装

无需全局安装 `scripting-cli`，只需使用 `npx` 运行即可：

```bash
npx scripting-cli <command>
```

## 使用方法

### 1. 创建工作目录

首先创建一个目录，用于存放您的 Scripting 应用脚本。例如：

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. 启动本地服务

在工作目录中，运行以下命令启动本地开发服务：

```bash
npx scripting-cli start
```

默认情况下，服务将在端口 `3000` 上启动。如需指定其他端口，请使用 `--port` 选项：

```bash
npx scripting-cli start --port=4000
```

要启用 Bonjour 支持，使 Scripting 应用自动检测本地服务，请添加 `--bonjour` 标志：

```bash
npx scripting-cli start --bonjour
```

### 3. 连接 Scripting 应用

服务运行后，打开 **Scripting 应用** 并连接您刚刚启动的本地服务。这将建立应用与工作目录之间的连接。

### 4. 调试和同步代码

连接后，选择要调试的脚本项目。Scripting 应用将自动将该项目的代码同步到您的工作目录。

### 5. 实时代码同步

在桌面编辑器（如 VSCode）中编写并保存脚本时，更新的代码将自动同步到 Scripting 应用并实时执行，使开发和调试更加顺畅。

## 编辑器选择与配置文件

`scripting-cli` 不再绑定 VSCode。首次运行 `npx scripting-cli start` 时，会提示您选择实际使用的编辑器。选择会保存到项目根目录的 `scripting.config.json`，下次启动不再询问。

### 支持的编辑器

VSCode、VSCode Insiders、VSCodium、Cursor、Windsurf、Trae、Zed、WebStorm、IntelliJ IDEA、Fleet、Sublime Text、Nova、Vim、Neovim、Emacs，以及 `custom`（任意命令）和 `none`（禁用自动打开）。

在 `PATH` 中检测到的编辑器会标记 ✓ 并排在前面。

### 单次覆盖

```bash
# 仅本次使用 Cursor（不修改 scripting.config.json）
npx scripting-cli start --editor=cursor

# 重新走交互式编辑器选择并覆盖已保存的选择
npx scripting-cli start --reconfigure
```

### 配置文件

`scripting-cli` 按以下顺序查找第一个存在的配置文件：

```
scripting.config.ts
scripting.config.mts
scripting.config.cts
scripting.config.js
scripting.config.mjs
scripting.config.cjs
scripting.config.json
```

默认生成的是 JSON，让 npx 流程保持零安装。TypeScript / JavaScript 文件通过 [jiti](https://github.com/unjs/jiti) 加载。

```jsonc
// scripting.config.json
{
  "editor": "cursor",          // 见上方支持的编辑器
  "editorCommand": "cursor",   // 可选，覆盖默认命令
  "editorArgs": [],            // 可选，额外的 CLI 参数
  "port": 3000,
  "autoOpen": true,
  "generateTsConfig": true,    // 若您自行维护 tsconfig.json，可设为 false
  "logLevel": "info",          // "silent" | "error" | "warn" | "info" | "debug"
  "ignore": ["*.log", "dist", "assets/large.mp4"]  // 额外排除、不参与同步的文件
}
```

CLI 参数优先级高于配置文件。

### 排除文件（`ignore`）

同步会覆盖脚本目录下的**所有**文件——源代码，以及图片、字体等任意资源——且为双向（App ⇄ 桌面）。
文本文件带变更追踪同步，其余文件以原始字节传输。

点文件 / 点目录（如 `.git`、`.vscode`、`.DS_Store`）与 `node_modules` **默认始终排除**。
通过 `ignore` 可排除更多文件：

```jsonc
{
  "ignore": [
    "*.log",            // 扩展名通配 —— 匹配任意以 .log 结尾的文件
    "dist",             // 名称 —— 匹配任意层级下名为 "dist" 的文件或目录
    "assets/big.mp4"    // 路径 —— 匹配相对脚本根目录的该文件
  ]
}
```

每一项按以下三种形式之一匹配：

- `*.ext` —— 按扩展名匹配文件。
- 纯名称（不含 `/`）—— 匹配任意路径段（文件或目录）为该名称。
- 含 `/` 的路径 —— 匹配该脚本相对路径（精确匹配或作为目录前缀）。

`ignore` 对两个同步方向均生效。

### 类型补全（TypeScript 配置）

如需在 `scripting.config.ts` 中获得自动补全，请将 scripting-cli 安装为开发依赖：

```bash
npm i -D scripting-cli
```

然后：

```ts
// scripting.config.ts
import { defineConfig } from 'scripting-cli'

export default defineConfig({
  editor: 'cursor',
  port: 4000,
})
```

不安装包也可以使用 `.ts`——`npx scripting-cli start` 仍会通过 `jiti` 加载，只是 IDE 无类型提示。

## 示例工作流程

1. 启动本地服务：

   ```bash
   npx scripting-cli start
   ```

2. 打开编辑器并编写脚本。

3. 保存脚本文件。

4. 更新的代码将自动同步到 Scripting 应用并执行。

## 附加信息

* 默认端口为 `3000`。如果该端口已被占用，可使用 `--port` 选项指定其他端口。
* 使用 `--no-auto-open` 标志可防止工具自动打开 `index.tsx` 或 `widget.tsx` 文件：

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* 使用 `--editor=<key>` 可临时覆盖配置中的编辑器，使用 `--reconfigure` 可重新进入交互式编辑器选择。
* 要使用 Bonjour 服务，请确保系统支持该功能。在 Windows 上，可能需要手动安装 Bonjour。然后，使用 `--bonjour` 选项启用该服务。
* 该工具兼容任意桌面编辑器，能与 Scripting 应用实现无缝代码同步和调试。

## 故障排除

如果遇到问题，请确保：

* 使用的是 Node.js 版本 20 或更高。
* Scripting 应用已正确连接到本地服务。
* 所选端口未被其他进程占用。
* 始终使用 `npx scripting-cli <command>` 运行工具，并确保软件包是最新的。

---

祝您在 Scripting 应用的开发工作中使用 `scripting-cli` 顺利！编码愉快！
