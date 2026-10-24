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


## 桌面 Agent 命令

Codex、Claude Code 等桌面 Agent 可通过当前开发连接查询 App 文档、同步项目、执行脚本和获取截图。需要支持 Desktop Agent 协议 v1 的 Scripting App；旧版 App 仍可使用原有文件同步。

先在工作区运行 `scripting-cli start`，在 App 连接服务并选定脚本进入调试页。随后在同一工作区执行：

```sh
scripting-cli devices --json
scripting-cli status --json
scripting-cli docs search "Navigation" --json
scripting-cli docs get <搜索返回的文档ID> --lang zh --json
scripting-cli api get Navigation.present --json
scripting-cli run "MyScript" --query-parameters '{"sample":true}' --json
scripting-cli run "MyScript" --screenshot --capture-after 2 --output ./artifacts --json
scripting-cli widget "MyScript" --family systemMedium --json
scripting-cli widget "MyScript" --family systemMedium --parameter demo --screenshot --output ./artifacts --json
scripting-cli jobs show <run-id> --json
scripting-cli jobs cancel <run-id> --json
```

- 首版只操作 App 当前选中的调试项目，不会根据目录名称创建或切换项目。多设备时必须通过 `--device <设备ID>` 指定目标。`devices` 的 `responsive` 来自实际响应；`status` 返回前后台、项目、版本、`activeRunId` 和保活状态。
- 文档和 API 声明来自连接中的 App，结果带 App 版本；不静默退回旧版离线资料。先搜索，再用返回的文档 ID 读取正文。
- `run` 和 `widget` 先取得当前项目的完整源码快照，App 校验并应用后再执行。默认整体超时 30 秒，`--timeout` 可设置 1–120 秒。普通脚本应调用 `Script.exit(result)` 返回结果并结束；授权仍使用项目原有权限。
- `run --screenshot` 需要 App 在前台。等待本次视图就绪后，再等待 `--capture-after` 秒（默认 2，范围 0–10），截图并结束本次运行，返回 `completionReason: preview_capture`。这不表示远程内容已全部加载。没有可捕获视图时明确失败，不返回空白成功图。
- 两种 `widget` 命令都在前台渲染 `widget.tsx`，完成后自动收起。不带 `--screenshot` 时不生成图片。family 和 parameter 不覆盖平时预览偏好；结果不代表已安装系统桌面小组件或更新 WidgetKit 时间线。
- `--no-sync` 仅使用 App 上次确认的源码版本；版本未知或被后续更新失效时拒绝执行。已有手动运行或预览返回 `busy`，不会自动停止用户脚本。
- Ctrl-C 只请求取消本次命令。发送后保持 `cancelling`，收到 App 确认才变为 `cancelled`；缺少确认是失败，不表示已停止。断连不自动重放运行。

`--json` 的 stdout 只有一个 JSON 值：`devices` 返回设备数组，其余返回任务记录。结果包含 runId、requestId、deviceId、sessionId、project、requestedRevision、revision、status 以及 result 或 error。requestedRevision 是桌面快照，revision 是 App 已应用版本，前置条件失败不会冒充已发布源码。脚本值在 `result.value`，日志在 `result.stdout` / `result.stderr`，截图在 `result.artifacts`；PNG 保存为 `<output>/<run-id>/screenshot.png`，不在终端打印 base64。

退出码：0 成功，1 命令失败，2 参数用法错误，124 执行或设备超时，130 取消。常见错误包括 `device_ambiguous`、`project_mismatch`、`debug_session_required`、`busy`、`needs_foreground`、`sync_failed`、`missing_entry`、`screenshot_unavailable`、`unsupported_capability`。请以实际结果为准，不把连接成功或预览弹出视为执行完成。

快照最多 8 MiB、2000 个普通文件，沿用 ignore 规则，拒绝符号链接和不安全路径；保留被排除文件和项目身份。截图最多 8 MiB、1600 万像素。单独的本机认证控制接口负责命令，凭据放在用户私有的系统临时目录中，不写入项目或终端。原局域网/Tailscale 文件同步端口保持可用。服务最多保留 64 项任务、8 项图片结果，15 分钟过期，退出时清理私有临时产物；用户输出目录由用户保留。

`npm test` 构建 TypeScript 并运行仓库内 Node 测试，覆盖源码字节与版本、路径与符号链接拒绝、会话/项目/设备选择、重复请求、取消、断连、本机 HTTP 认证和产物交付。测试使用自有临时夹具并自动清理；模拟设备消息不能替代 App 实际执行和渲染验收。
