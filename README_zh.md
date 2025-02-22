# Scripting app 命令行工具

欢迎使用 `scripting-cli` 命令行工具，它用于与 Scripting 应用程序进行集成。通过该工具，您可以在开发脚本时，实现代码的实时同步和预览，方便您使用喜欢的桌面编辑器（例如 VSCode）进行开发。

[English Version](./README.md)。

## 前置条件

在使用 `scripting-cli` 之前，请确保满足以下条件：

1. **Node.js**：请确保您已安装v20+版本的 Node.js。可以通过以下命令检查您的 Node.js 版本：
   ```bash
   node -v
   ```

2. **Scripting 应用程序**：必须安装 Scripting 应用程序，以便与 `scripting-cli` 运行的本地服务进行连接。

## 安装

使用 `npx` 命令即可直接使用 `scripting-cli`，无需全局安装。

## 使用方法

### 1. 创建工作目录

在您的机器上创建一个存放 Scripting 脚本的目录。例如：
```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. 启动本地服务

在工作目录中，运行以下命令启动本地服务：

```bash
npx scripting-cli start
```

默认情况下，本地服务将启动在端口 `3000`。如果需要指定其他端口，可以使用 `--port` 参数：

```bash
npx scripting-cli start --port=<port>
```

请将 `<port>` 替换为您需要的端口号。例如：
```bash
npx scripting-cli start --port=4000
```

### 3. 连接 Scripting 应用

本地服务启动后，打开 **Scripting 应用程序** 并选择您刚才启动的本地服务。这将建立 Scripting 应用与本地目录之间的连接。

### 4. 调试和同步代码

连接成功后，选择您要调试的脚本项目。Scripting 应用将自动将该项目的代码同步到您的工作目录。

### 5. 实时同步代码

当您在桌面编辑器（例如 VSCode）中编写并保存脚本时，更新后的代码将自动同步到 Scripting 应用并立即执行。这样，脚本开发和调试变得更加高效和便捷。

## 示例工作流程

1. 启动本地服务：
   ```bash
   npx scripting-cli start
   ```

2. 打开桌面编辑器并编写脚本。

3. 保存脚本文件。

4. 代码会自动同步到 Scripting 应用并执行。

## 其他信息

- 服务的默认端口是 `3000`，如果该端口已被占用，您可以使用 `--port` 参数指定其他端口。
- 该工具适用于喜欢使用桌面编辑器（如 VSCode）并希望与 Scripting 应用进行无缝集成的用户，以便进行代码同步和调试。

## 故障排除

如果遇到问题，请确保：

- 您安装了 v20+版本的Node.js。
- 您的 Scripting 应用已正确连接到本地服务。
- 您选择的端口没有被其他进程占用。

---

感谢使用 `scripting-cli`，希望它能为您的 Scripting 应用开发流程带来便利！祝编程愉快！