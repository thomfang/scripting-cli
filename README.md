# Scripting app command-line tool

Welcome to the `scripting-cli` command-line tool for Scripting app integration. This tool helps you synchronize and preview your scripts in real-time while you develop them using your favorite desktop editor, such as VSCode.

[查看中文](./README_zh.md)。

## Prerequisites

Before using `scripting-cli`, make sure you have the following:

1. **Node.js**: Ensure you have a recent version of Node.js installed. You can check your Node.js version by running:
   ```bash
   node -v
   ```

2. **Scripting App**: The Scripting app must be installed to connect with the local service that `scripting-cli` runs.

## Installation

To use the `scripting-cli`, simply use it via `npx`. There is no need for a global installation.

## Usage

### 1. Create a Working Directory

Create a directory on your machine where you will store your Scripting scripts. For example:
```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. Start the Local Service

In your working directory, run the following command to start the local service:

```bash
npx scripting-cli start
```

By default, this will start the service on port `3000`. If you need to specify a different port, you can use the `--port` option:

```bash
npx scripting-cli start --port=<port>
```

Replace `<port>` with your desired port number. For example:
```bash
npx scripting-cli start --port=4000
```

### 3. Connect the Scripting App

Once the service is running, open the **Scripting app** and select the local service you've just started. This will establish the connection between the Scripting app and your local directory.

### 4. Debug and Synchronize Code

After connecting, choose the script project you want to debug. The Scripting app will automatically sync the code of this project to your working directory.

### 5. Real-Time Code Synchronization

As you write and save scripts in your desktop editor (e.g., VSCode), the updated code will automatically sync to the Scripting app and be executed in real-time. This makes script development and debugging much more convenient.

## Example Workflow

1. Start the local service:
   ```bash
   npx scripting-cli start
   ```

2. Open your desktop editor and write your script.

3. Save the script file.

4. The code automatically syncs to the Scripting app and is executed.

## Additional Information

- The default port for the service is `3000`. If that port is already in use, specify a different one using the `--port` option.
- The tool is intended for users who prefer using desktop editors like VSCode and want seamless integration with the Scripting app for code synchronization and debugging.

## Troubleshooting

If you encounter any issues, make sure:

- Node.js v20+ is required.
- Your Scripting app is correctly connected to the local service.
- No other processes are using the port you wish to use.

---

Enjoy using `scripting-cli` for your Scripting app workflow! Happy coding!