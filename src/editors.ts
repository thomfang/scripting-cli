import childProcess from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';
import { EditorDescriptor, EditorKey, ResolvedConfig } from './types';
import { ensureDirectoryExistence, getPath } from './util';

export const EDITORS: EditorDescriptor[] = [
  { key: 'vscode',          displayName: 'Visual Studio Code',   command: 'code',          macAppName: 'Visual Studio Code.app',            settingsTarget: 'vscode' },
  { key: 'vscode-insiders', displayName: 'VSCode Insiders',      command: 'code-insiders', macAppName: 'Visual Studio Code - Insiders.app', settingsTarget: 'vscode' },
  { key: 'vscodium',        displayName: 'VSCodium',             command: 'codium',        macAppName: 'VSCodium.app',                      settingsTarget: 'vscode' },
  { key: 'cursor',          displayName: 'Cursor',               command: 'cursor',        macAppName: 'Cursor.app',                        settingsTarget: 'vscode' },
  { key: 'windsurf',        displayName: 'Windsurf',             command: 'windsurf',      macAppName: 'Windsurf.app',                      settingsTarget: 'vscode' },
  { key: 'trae',            displayName: 'Trae',                 command: 'trae',          macAppName: 'Trae.app',                          settingsTarget: 'vscode' },
  { key: 'zed',             displayName: 'Zed',                  command: 'zed',           macAppName: 'Zed.app',                           settingsTarget: 'zed' },
  { key: 'webstorm',        displayName: 'WebStorm',             command: 'webstorm',      macAppName: 'WebStorm.app',                      settingsTarget: 'idea' },
  { key: 'idea',            displayName: 'IntelliJ IDEA',        command: 'idea',          macAppName: 'IntelliJ IDEA.app',                 settingsTarget: 'idea' },
  { key: 'fleet',           displayName: 'Fleet',                command: 'fleet',         macAppName: 'Fleet.app',                         settingsTarget: null },
  { key: 'sublime',         displayName: 'Sublime Text',         command: 'subl',          macAppName: 'Sublime Text.app',                  settingsTarget: null },
  { key: 'nova',            displayName: 'Nova',                 command: 'nova',          macAppName: 'Nova.app',                          settingsTarget: null },
  { key: 'vim',             displayName: 'Vim (terminal)',       command: 'vim',                                                            settingsTarget: null, terminalApp: true },
  { key: 'nvim',            displayName: 'Neovim (terminal)',    command: 'nvim',                                                           settingsTarget: null, terminalApp: true },
  { key: 'emacs',           displayName: 'Emacs',                command: 'emacs',                                                          settingsTarget: null, terminalApp: true },
  { key: 'custom',          displayName: 'Custom command',       command: null,                                                             settingsTarget: null },
  { key: 'none',            displayName: 'Do not open files',    command: null,                                                             settingsTarget: null },
];

export function getEditor(key: EditorKey): EditorDescriptor | undefined {
  return EDITORS.find(e => e.key === key);
}

const detectionCache = new Map<string, boolean>();

function commandExists(command: string): boolean {
  if (detectionCache.has(command)) {
    return detectionCache.get(command)!;
  }

  const isWin = os.platform() === 'win32';
  const probe = isWin ? `where ${command}` : `command -v ${command}`;

  try {
    childProcess.execSync(probe, { stdio: 'ignore', shell: isWin ? undefined : process.env.SHELL });
    detectionCache.set(command, true);
    return true;
  } catch {
    detectionCache.set(command, false);
    return false;
  }
}

function macAppExists(appName: string): boolean {
  const candidates = [
    path.join('/Applications', appName),
    path.join(os.homedir(), 'Applications', appName),
  ];
  return candidates.some(p => fs.existsSync(p));
}

/**
 * Whether this editor should be marked as "detected" in the picker.
 *
 * Intentionally returns false for:
 *   - "custom" / "none": meta options, not real editors
 *   - terminal editors (vim/nvim/emacs): typically system-bundled on macOS/Linux,
 *     so detection is meaningless — listing them as detected would mislead users
 *     into thinking they're their primary editor.
 *
 * GUI editors are detected via PATH command first, then macOS app bundle as fallback.
 */
export function isEditorAvailable(editor: EditorDescriptor): boolean {
  if (editor.key === 'custom' || editor.key === 'none') return false;
  if (editor.terminalApp) return false;
  if (editor.command && commandExists(editor.command)) return true;
  if (os.platform() === 'darwin' && editor.macAppName && macAppExists(editor.macAppName)) return true;
  return false;
}

export function detectAvailableEditors(): Set<EditorKey> {
  const set = new Set<EditorKey>();
  for (const e of EDITORS) {
    if (isEditorAvailable(e)) set.add(e.key);
  }
  return set;
}

export function openFileInEditor(filePath: string, config: ResolvedConfig): void {
  const editor = getEditor(config.editor);
  if (!editor || editor.key === 'none') return;

  const command = config.editorCommand ?? editor.command;
  const args = config.editorArgs ?? [];

  if (!command) {
    if (editor.key === 'custom') {
      console.log(chalk.yellow(`[editor] "custom" requires editorCommand to be set in scripting.config.*`));
    }
    return;
  }

  if (editor.terminalApp) {
    // Don't hijack the server TTY with a terminal editor
    console.log(chalk.gray(`[editor] Skipping auto-open for terminal editor "${editor.displayName}". File: ${filePath}`));
    return;
  }

  try {
    const platform = os.platform();
    if (platform === 'win32') {
      childProcess.spawn('cmd.exe', ['/c', command, ...args, filePath], { stdio: 'ignore', detached: true }).unref();
      return;
    }

    // Try the CLI command first
    if (commandExists(command)) {
      childProcess.spawn(command, [...args, filePath], { stdio: 'ignore', detached: true }).unref();
      return;
    }

    // macOS fallback: open -a "App Name"
    if (platform === 'darwin' && editor.macAppName) {
      childProcess.spawn('open', ['-a', editor.macAppName, filePath], { stdio: 'ignore', detached: true }).unref();
      return;
    }

    console.log(chalk.yellow(`[editor] Command "${command}" not found in PATH. Cannot open ${filePath}.`));
  } catch (err) {
    console.log(chalk.red(`[editor] Failed to open file: ${err}`));
  }
}

const VSCODE_SETTINGS = `{
  "typescript.format.semicolons": "remove",
  "typescript.preferences.jsxAttributeCompletionStyle": "braces"
}`;

const ZED_SETTINGS = `{
  "languages": {
    "TypeScript": {
      "format_on_save": "on"
    },
    "TSX": {
      "format_on_save": "on"
    }
  }
}`;

export function writeEditorSettings(config: ResolvedConfig): void {
  const editor = getEditor(config.editor);
  if (!editor || !editor.settingsTarget) return;

  if (editor.settingsTarget === 'vscode') {
    writeIfAbsent('.vscode/settings.json', VSCODE_SETTINGS);
  } else if (editor.settingsTarget === 'zed') {
    writeIfAbsent('.zed/settings.json', ZED_SETTINGS);
  } else if (editor.settingsTarget === 'idea') {
    // JetBrains projects need full .idea/ structure (IDE generates it on first open).
    // We intentionally don't seed it here.
  }
}

function writeIfAbsent(relative: string, content: string): void {
  const filePath = getPath(relative);
  ensureDirectoryExistence(filePath);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`${relative} created.`));
  } else {
    console.log(chalk.gray(`${relative} already exists.`));
  }
}
