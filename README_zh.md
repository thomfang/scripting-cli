# Scripting 应用命令行工具

欢迎使用 `scripting-cli` 命令行工具，它旨在与 Scripting 应用集成。该工具允许您在使用喜爱的桌面编辑器（如 VSCode）开发脚本时，实现实时同步和预览。

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
* 要使用 Bonjour 服务，请确保系统支持该功能。在 Windows 上，可能需要手动安装 Bonjour。然后，使用 `--bonjour` 选项启用该服务。
* 该工具适用于喜欢使用 VSCode 等桌面编辑器，并希望与 Scripting 应用实现无缝代码同步和调试的用户。

## 故障排除

如果遇到问题，请确保：

* 使用的是 Node.js 版本 20 或更高。
* Scripting 应用已正确连接到本地服务。
* 所选端口未被其他进程占用。
* 始终使用 `npx scripting-cli <command>` 运行工具，并确保软件包是最新的。

---

祝您在 Scripting 应用的开发工作中使用 `scripting-cli` 顺利！编码愉快！
