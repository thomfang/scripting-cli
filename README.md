# Scripting App Command-Line Tool

Welcome to the `scripting-cli`, the command-line tool designed for integrating with the Scripting app. This tool allows you to synchronize and preview your scripts in real-time as you develop them using your favorite desktop editor (VSCode, Cursor, Windsurf, Zed, WebStorm, Vim, and more).

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

## Editor Selection and Config File

`scripting-cli` is no longer tied to VSCode. The first time you run `npx scripting-cli start`, you'll be prompted to choose the editor you actually use. Your choice is saved to `scripting.config.json` in your project root so the prompt won't appear again.

### Supported editors

VSCode, VSCode Insiders, VSCodium, Cursor, Windsurf, Trae, Zed, WebStorm, IntelliJ IDEA, Fleet, Sublime Text, Nova, Vim, Neovim, Emacs, plus `custom` (any other command) and `none` (disable auto-open).

Editors detected on your `PATH` are marked with ✓ and listed first.

### Per-run override

```bash
# Use Cursor for this run only (does not modify scripting.config.json)
npx scripting-cli start --editor=cursor

# Re-run the interactive selection and overwrite the saved choice
npx scripting-cli start --reconfigure
```

### Config file

`scripting-cli` looks for the first config file it finds in this order:

```
scripting.config.ts
scripting.config.mts
scripting.config.cts
scripting.config.js
scripting.config.mjs
scripting.config.cjs
scripting.config.json
```

The default file is JSON so the npx flow stays zero-install. TypeScript and JavaScript files are loaded via [jiti](https://github.com/unjs/jiti).

```jsonc
// scripting.config.json
{
  "editor": "cursor",          // see supported editors above
  "editorCommand": "cursor",   // optional, overrides the default command
  "editorArgs": [],            // optional, extra CLI args
  "port": 3000,
  "autoOpen": true,
  "generateTsConfig": true,    // set to false if you manage tsconfig.json yourself
  "logLevel": "info",          // "silent" | "error" | "warn" | "info" | "debug"
  "ignore": ["*.log", "dist", "assets/large.mp4"]  // extra paths to exclude from sync
}
```

CLI flags take precedence over the config file.

### Excluding files from sync (`ignore`)

Synchronization covers **all** files in a script directory — source code, plus
images, fonts, and any other assets — in both directions (app ⇄ desktop).
Text files sync with change tracking; everything else is transferred as raw bytes.

Dotfiles/dot-directories (such as `.git`, `.vscode`, `.DS_Store`) and `node_modules`
are **always excluded** by default. Use `ignore` to exclude additional files:

```jsonc
{
  "ignore": [
    "*.log",            // extension glob — matches any file ending in .log
    "dist",             // name — matches any file or directory named "dist" at any depth
    "assets/big.mp4"    // path — matches this file relative to the script root
  ]
}
```

Each entry is matched as one of three forms:

- `*.ext` — matches files by extension.
- a plain name (no `/`) — matches any path segment (file or directory) with that name.
- a path containing `/` — matches that script-relative path (exact or as a directory prefix).

`ignore` applies to both sync directions.

### Type completion (TypeScript config)

To get autocomplete in `scripting.config.ts`, install scripting-cli as a dev dependency:

```bash
npm i -D scripting-cli
```

Then:

```ts
// scripting.config.ts
import { defineConfig } from 'scripting-cli'

export default defineConfig({
  editor: 'cursor',
  port: 4000,
})
```

You can also use `.ts` without installing the package — `npx scripting-cli start` still loads it via `jiti`. You just won't get IDE type hints.

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
* Use `--editor=<key>` to override the configured editor for a single run, or `--reconfigure` to re-run the interactive editor selection.
* To use the Bonjour service, ensure your system supports it. On Windows, you may need to install Bonjour manually. Then, use the `--bonjour` option to enable it.
* This tool works with any desktop editor and provides seamless code synchronization and debugging with the Scripting app.

## Troubleshooting

If you encounter issues:

* Ensure you're using Node.js version 20 or higher.
* Verify the Scripting app is properly connected to the local service.
* Make sure no other process is occupying your chosen port.
* Always run the tool using `npx scripting-cli <command>`, and check that the package is up to date.

---

Enjoy using `scripting-cli` in your Scripting app development workflow. Happy coding!