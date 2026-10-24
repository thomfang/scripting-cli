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

## Desktop agent commands

Codex, Claude Code, and other desktop agents can query the connected App's docs,
sync the current debug project, run it, and inspect results without a separate
agent-specific plugin. These commands require a compatible Scripting App with
Desktop Agent protocol v1 support. Older App versions can continue normal file
syncing but do not support the new commands.

1. Run `scripting-cli start` in your workspace.
2. Connect Scripting to that server. Select a script and enter its debug page.
3. The existing sync workflow creates `scripts/<project>/` in the workspace.
4. Run the commands below from that same workspace. The first release only
   operates on the App's currently selected debug project. It never creates or
   switches App projects by guessing a directory name.

```sh
scripting-cli devices --json
scripting-cli status --json
scripting-cli docs search "Navigation" --json
scripting-cli docs get navigation --lang zh --json  # use an ID returned by search
scripting-cli api get Navigation.present --json
scripting-cli run "MyScript" --json
scripting-cli run "MyScript" --query-parameters '{"sample":true}' --json
scripting-cli run "MyScript" --screenshot --capture-after 2 --output ./artifacts --json
scripting-cli widget "MyScript" --family systemMedium --json
scripting-cli widget "MyScript" --family systemMedium --parameter demo --screenshot --output ./artifacts --json
scripting-cli jobs show <run-id> --json
scripting-cli jobs cancel <run-id> --json
```

- With several connected devices, pass `--device <device-id>` from `devices`.
  `devices` makes a fresh request and reports `responsive`; a connected socket
  alone is not proof the App can execute a command. `status` includes foreground
  state, the selected project, current revision, `activeRunId` and background-keeper state.
- Docs and API declarations come from the connected App, with its version in
  the response. Search returns IDs and summaries; `docs get` reads one document.
  There is no silent offline fallback to older docs.
- `run` and `widget` first capture a bounded source snapshot, sync all included
  files, and wait for the App to acknowledge its SHA256 revision. Files changed
  after the snapshot belong to a later update. Delayed notifications for the
  already-applied snapshot do not cause an extra automatic run.
- Ordinary `run` waits for `Script.exit(result)` or failure. The default overall
  deadline is 30 seconds (`--timeout`, 1–120). Forgetting to call `Script.exit`
  can therefore produce a timeout. Request parameters retain the project's
  normal App permission checks.
- `run --screenshot` requires Scripting in the foreground. It waits for this
  run's view, waits `--capture-after` seconds (0–10, default 2), captures the
  view, and ends this run. Its result says `completionReason: preview_capture`;
  this is a finite preview, not proof the script exited itself or that all
  remote content finished loading. No rendered view means an explicit error,
  not a successful blank image.
- Both widget modes render the current project's `widget.tsx` in the App's
  foreground preview and close automatically. Without `--screenshot`, no image
  is generated. These commands do not install a home-screen widget or confirm
  a WidgetKit timeline refresh. The supplied family/parameter do not overwrite
  the user's normal preview preferences.
- `--no-sync` explicitly uses the last acknowledged App revision; it fails if
  the revision is unknown or later file updates invalidated it. Active manual
  runs or previews return `busy`, and commands do not stop them automatically.
- Ctrl-C requests cancellation of this command only. Cancellation, disconnect,
  source failure, execution failure and screenshot failure remain distinct
  results. A cancellation request stays `cancelling` until the App confirms a
  terminal result; a missing confirmation is a failure, not proof execution stopped. Disconnected runs are not automatically replayed.

With `--json`, stdout contains one JSON value (a device array for `devices`, or a
job record for other commands). Jobs contain `runId`, `requestId`, `deviceId`,
`sessionId`, `project`, `requestedRevision`, `revision`, `status`, and `result` or `error`. The requested revision and the App-applied revision are separate; failed
preconditions do not claim that source was applied. Script
values are in `result.value`, logs in `result.stdout` / `result.stderr`, and
screenshots in `result.artifacts`. PNG files are copied to
`<output>/<run-id>/screenshot.png`; base64 image data is never printed to stdout.
Keep user-requested output files as long as needed. The private server retains
at most 64 job records / 8 image results, expires results after 15 minutes, and
removes its temporary results on shutdown.

Exit codes: `0` success, `1` command failure, `2` invalid CLI usage, `124` execution
or device timeout, `130` caller cancellation. Stable error codes include
`device_ambiguous`, `project_mismatch`, `debug_session_required`, `busy`,
`needs_foreground`, `sync_failed`, `missing_entry`, `screenshot_unavailable`, and
`unsupported_capability`. Inspect the result instead of treating a successful
connection or preview presentation as completed execution.

Source snapshots include at most 8 MiB and 2000 regular files, using the existing
ignore rules. Source symlinks and unsafe paths are rejected. Screenshots are
bounded to 8 MiB and 16 megapixels. The App preserves excluded files and the
script's permission identity. A separate authenticated loopback control server
connects desktop commands to the running service; its credentials live in a
private per-user OS temporary directory, not the project or command output.
The existing App-facing LAN / Tailscale server remains available for file sync.

### Tests

`npm test` builds the existing TypeScript sources and runs the checked-in Node
tests. It covers file/byte revisions, traversal and symlink refusals, device and
session selection, duplicate IDs, cancellation, disconnects, local HTTP control
boundaries, artifact delivery, retention, and actual CLI child processes. It
uses only owned temporary fixtures and removes them afterward. Real App
execution and screenshots also require App-side integration evidence; mocked
peers do not substitute for device rendering.
