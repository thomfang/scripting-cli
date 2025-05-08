# Scripting App Command-Line Tool

Welcome to the `scripting-cli`, the command-line tool designed for integrating with the Scripting app. This tool allows you to synchronize and preview your scripts in real-time as you develop them using your favorite desktop editor, such as VSCode.

[中文](./README_zh.md) | [日本語](./README_ja.md) | [Deutsch](./README_de.md) | [Français](./README_fr.md) | [Italiano](./README_it.md)

## Prerequisites

Before using `scripting-cli`, ensure the following requirements are met:

1. **Node.js**: Make sure you have a recent version of Node.js installed. To check your current version, run:

   ```bash
   node -v
   ```

2. **Scripting App**: The Scripting app must be installed in order to connect with the local service started by `scripting-cli`.

## Installation

There’s no need to install `scripting-cli` globally. Simply run it using `npx`:

```bash
npx scripting-cli <command>
```

## Usage

### 1. Create a Working Directory

Start by creating a directory where your Scripting app scripts will reside. For example:

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. Start the Local Service

In your working directory, run the following command to start the local development service:

```bash
npx scripting-cli start
```

By default, this starts the service on port `3000`. To specify a different port, use the `--port` option:

```bash
npx scripting-cli start --port=4000
```

To enable Bonjour support—allowing the Scripting app to automatically detect the local service—add the `--bonjour` flag:

```bash
npx scripting-cli start --bonjour
```

### 3. Connect the Scripting App

Once the service is running, open the **Scripting app** and connect to the local service you just started. This establishes a connection between the app and your working directory.

### 4. Debug and Synchronize Your Code

After connecting, select the script project you want to debug. The Scripting app will automatically sync the project’s code with your working directory.

### 5. Real-Time Code Synchronization

As you write and save scripts using your desktop editor (e.g., VSCode), the changes will automatically sync with the Scripting app and be executed in real-time—making development and debugging much smoother.

## Example Workflow

1. Start the local service:

   ```bash
   npx scripting-cli start
   ```

2. Open your editor and write your script.

3. Save the script file.

4. The updated code is automatically synchronized with the Scripting app and executed.

## Additional Information

* The default port is `3000`. If it’s already in use, specify a different one with the `--port` option.
* Use the `--no-auto-open` flag to prevent the tool from opening `index.tsx` or `widget.tsx` automatically:

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* To use the Bonjour service, ensure your system supports it. On Windows, you may need to install Bonjour manually. Then, use the `--bonjour` option to enable it.
* This tool is ideal for users who prefer desktop editors like VSCode and want seamless code synchronization and debugging with the Scripting app.

## Troubleshooting

If you encounter issues:

* Ensure you're using Node.js version 20 or higher.
* Verify the Scripting app is properly connected to the local service.
* Make sure no other process is occupying your chosen port.
* Always run the tool using `npx scripting-cli <command>`, and check that the package is up to date.

---

Enjoy using `scripting-cli` in your Scripting app development workflow. Happy coding!