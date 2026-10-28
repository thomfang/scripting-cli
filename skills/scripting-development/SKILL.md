---
name: scripting-development
description: Develop and debug Scripting App scripts or widgets from a desktop workspace using scripting-cli, connected App documentation, execution results, live logs and rendered screenshots. Use for Scripting scripts and widgets, not unrelated iOS app development.
---

# Scripting development

Use the connected App as the source of API documentation and runtime/rendering evidence. Run commands from the workspace where `scripting-cli start` is already running; its scripts live under `scripts/<script>/`. A local CLI checkout can be invoked with `node /absolute/path/to/scripting-cli/dist/cli.js` instead of a published binary.

## Establish context

- Read the workspace's instructions and the intended script's existing files before changing code.
- Run `scripting-cli devices --json`, select `--device <id>` when several devices exist, then query `status --json`. Inspect `responsive`, capabilities, current script, foreground state and `activeRunId`; connection alone does not prove execution.
- Search with `docs search "<topic>" --json`, read the exact returned ID with `docs get <id> --lang en|zh --json`, and use `api get <symbol> --json` for declarations. Do not invent APIs from a screenshot or substitute stale offline docs for the connected App version.

## Bind a script deliberately

- `scripts list --json` lists App scripts. `scripts inspect "Script" --json` returns source file hashes and the current App revision without modifying it.
- `scripts create "Script" --json` creates from an existing desktop script, or scaffolds a minimal desktop script if absent; App name collisions are rejected. It does not overwrite a colliding App script.
- `scripts attach "Script" --json` syncs the desktop snapshot and selects that App debug script. Matching source needs no replacement flag. If source differs, `script_conflict` returns the current App revision. Inspect both versions and resolve the user's intended source before replacing anything. Only when the user has authorized that overwrite, use `scripts attach "Script" --replace --expected-revision <inspected-App-revision> --json`. A changed revision is a fresh conflict, not a reason to retry blindly.
- Script changes need App foreground and refuse an existing manual run or preview. Do not stop unrelated work, overwrite scripts, install the skill globally, or publish packages merely to make a command succeed.

## Iterate using evidence

- Edit only the requested script. `run "Script" --query-parameters '{"sample":true}' --json` takes a bounded snapshot and executes only after the App confirms its revision. Use `requestedRevision` versus `revision` to distinguish attempted from applied source. Changes after snapshot capture belong to another run.
- Ordinary scripts should call `Script.exit(result)` to finish. Inspect `status`, `error.code`, `result.value`, stdout/stderr and diagnostics; a nonzero result is not success because a page once appeared. Diagnostic paths are script-relative, lines/columns are one-based. Runtime errors and TypeScript diagnostics are distinct evidence.
- Use `--stream` for JSONL stage/log/diagnostic events followed by one `type: result` record. It replaces single-result stdout formatting; never parse the entire stream as one JSON value. A `gap` means retained events were lost; final logs may also report `logsTruncated`.
- Use `run "Script" --screenshot --output ./artifacts --json` for a finite UI preview. The App must be foreground. The screenshot belongs to this run, then the run ends; `preview_capture` does not mean the script called `Script.exit`.
- For asynchronous UI, emit a distinctive exact `console.log("SCREENSHOT_READY")` after the intended data/state is ready and invoke `--screenshot --ready-log SCREENSHOT_READY --capture-after 1`. Only the current run's matching non-error log counts. The marker is the script author's readiness contract, not automatic proof all remote work is complete. Missing signal/view or background transition must remain a failure.
- Open the actual PNG listed in `result.artifacts` using the host's image-viewing tool. Compare the requested layout and content, fix specific discrepancies, and rerun the affected case. A file path alone does not prove rendering correctness. Keep requested final output files; clean only disposable artifacts you created.

## Widgets and batches

`widget "Script" --family systemMedium --parameter demo --screenshot --output ./artifacts --json` renders `widget.tsx` in foreground, captures if requested, then closes. Omit `--screenshot` for render-and-close without an image. This does not install a home-screen widget or verify WidgetKit timeline delivery, and it does not overwrite normal preview preferences.

For multiple sizes or parameters, create a JSON array such as:

```json
[
  {"id":"small-default","family":"systemSmall","parameter":"default","screenshot":true},
  {"id":"medium-empty","family":"systemMedium","parameter":"empty","screenshot":true},
  {"id":"render-only","family":"systemSmall","screenshot":false}
]
```

Invoke `widget-batch "Script" --cases ./cases.json --timeout 60 --output ./artifacts --stream`. At most eight unique safe case IDs run serially from one source snapshot. Inspect each case's status, skipped count, and corresponding `<output>/<run-id>/<case-id>.png`. A failed/cancelled batch may contain earlier completed cases; never claim all cases passed from partial results.

## Failure and cancellation

The overall deadline is finite (`--timeout` 1–120 seconds, default 30). Do not increase timeouts to hide missing completion, failed readiness or a broken fixture. Fix the cause or choose a justified budget before rerunning.

Ctrl-C or `jobs cancel <run-id> --json` requests cancellation of that owned run. `cancelling` is not confirmed termination. Inspect `jobs show <run-id> --json` until a terminal state; a disconnect/timeout is failure with potentially uncertain side effects, so do not replay mutating scripts automatically. `jobs events <run-id> --after <cursor> --json` reads recent events. Results expire; absence is not proof of no execution.

Preserve App permission checks. Handle `needs_foreground`, `busy`, `unsupported_capability`, `script_conflict`, `execution_timeout` and `screenshot_unavailable` according to their actual meaning. Report unavailable device, VoiceOver, long-background, audio interruption or real WidgetKit evidence as pending. Do not claim those from desktop mocks or Simulator success.

## Develop a Skill package

Ask the user to select Skill mode and the intended package in the connected App development page. Work only inside `skills/<name>/`; do not use script commands to attach a Skill. Preserve `SKILL.md` name/description and App-managed `skill.json`. Desktop saves sync the selected package without executing it. Resolve source conflicts by stopping and reselecting the source in the App.

Use `scripting-cli skills run <name> <relative-entry.tsx> --check --json` first, then `scripting-cli skills run <name> <relative-entry.tsx> --stream` for explicit execution and logs. Pass test inputs with `--query-parameters` and finish using `Script.exit(result)`. Runtime identity, storage and permissions are the Skill’s own; do not bypass permission prompts, run unrequested side effects or delete App packages to resolve conflicts. Use the returned source revision, log events and final result as evidence; connection status alone is not test success. Cancel with Ctrl-C or `jobs cancel`; disconnects do not replay execution.
