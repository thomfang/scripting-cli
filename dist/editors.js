"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDITORS = void 0;
exports.getEditor = getEditor;
exports.isEditorAvailable = isEditorAvailable;
exports.detectAvailableEditors = detectAvailableEditors;
exports.openFileInEditor = openFileInEditor;
exports.writeEditorSettings = writeEditorSettings;
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("./util");
exports.EDITORS = [
    { key: 'vscode', displayName: 'Visual Studio Code', command: 'code', macAppName: 'Visual Studio Code.app', settingsTarget: 'vscode' },
    { key: 'vscode-insiders', displayName: 'VSCode Insiders', command: 'code-insiders', macAppName: 'Visual Studio Code - Insiders.app', settingsTarget: 'vscode' },
    { key: 'vscodium', displayName: 'VSCodium', command: 'codium', macAppName: 'VSCodium.app', settingsTarget: 'vscode' },
    { key: 'cursor', displayName: 'Cursor', command: 'cursor', macAppName: 'Cursor.app', settingsTarget: 'vscode' },
    { key: 'windsurf', displayName: 'Windsurf', command: 'windsurf', macAppName: 'Windsurf.app', settingsTarget: 'vscode' },
    { key: 'trae', displayName: 'Trae', command: 'trae', macAppName: 'Trae.app', settingsTarget: 'vscode' },
    { key: 'zed', displayName: 'Zed', command: 'zed', macAppName: 'Zed.app', settingsTarget: 'zed' },
    { key: 'webstorm', displayName: 'WebStorm', command: 'webstorm', macAppName: 'WebStorm.app', settingsTarget: 'idea' },
    { key: 'idea', displayName: 'IntelliJ IDEA', command: 'idea', macAppName: 'IntelliJ IDEA.app', settingsTarget: 'idea' },
    { key: 'fleet', displayName: 'Fleet', command: 'fleet', macAppName: 'Fleet.app', settingsTarget: null },
    { key: 'sublime', displayName: 'Sublime Text', command: 'subl', macAppName: 'Sublime Text.app', settingsTarget: null },
    { key: 'nova', displayName: 'Nova', command: 'nova', macAppName: 'Nova.app', settingsTarget: null },
    { key: 'vim', displayName: 'Vim (terminal)', command: 'vim', settingsTarget: null, terminalApp: true },
    { key: 'nvim', displayName: 'Neovim (terminal)', command: 'nvim', settingsTarget: null, terminalApp: true },
    { key: 'emacs', displayName: 'Emacs', command: 'emacs', settingsTarget: null, terminalApp: true },
    { key: 'custom', displayName: 'Custom command', command: null, settingsTarget: null },
    { key: 'none', displayName: 'Do not open files', command: null, settingsTarget: null },
];
function getEditor(key) {
    return exports.EDITORS.find(e => e.key === key);
}
const detectionCache = new Map();
function commandExists(command) {
    if (detectionCache.has(command)) {
        return detectionCache.get(command);
    }
    const isWin = os_1.default.platform() === 'win32';
    const probe = isWin ? `where ${command}` : `command -v ${command}`;
    try {
        child_process_1.default.execSync(probe, { stdio: 'ignore', shell: isWin ? undefined : process.env.SHELL });
        detectionCache.set(command, true);
        return true;
    }
    catch {
        detectionCache.set(command, false);
        return false;
    }
}
function macAppExists(appName) {
    const candidates = [
        path_1.default.join('/Applications', appName),
        path_1.default.join(os_1.default.homedir(), 'Applications', appName),
    ];
    return candidates.some(p => fs_1.default.existsSync(p));
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
function isEditorAvailable(editor) {
    if (editor.key === 'custom' || editor.key === 'none')
        return false;
    if (editor.terminalApp)
        return false;
    if (editor.command && commandExists(editor.command))
        return true;
    if (os_1.default.platform() === 'darwin' && editor.macAppName && macAppExists(editor.macAppName))
        return true;
    return false;
}
function detectAvailableEditors() {
    const set = new Set();
    for (const e of exports.EDITORS) {
        if (isEditorAvailable(e))
            set.add(e.key);
    }
    return set;
}
function openFileInEditor(filePath, config) {
    const editor = getEditor(config.editor);
    if (!editor || editor.key === 'none')
        return;
    const command = config.editorCommand ?? editor.command;
    const args = config.editorArgs ?? [];
    if (!command) {
        if (editor.key === 'custom') {
            console.log(chalk_1.default.yellow(`[editor] "custom" requires editorCommand to be set in scripting.config.*`));
        }
        return;
    }
    if (editor.terminalApp) {
        // Don't hijack the server TTY with a terminal editor
        console.log(chalk_1.default.gray(`[editor] Skipping auto-open for terminal editor "${editor.displayName}". File: ${filePath}`));
        return;
    }
    try {
        const platform = os_1.default.platform();
        if (platform === 'win32') {
            child_process_1.default.spawn('cmd.exe', ['/c', command, ...args, filePath], { stdio: 'ignore', detached: true }).unref();
            return;
        }
        // Try the CLI command first
        if (commandExists(command)) {
            child_process_1.default.spawn(command, [...args, filePath], { stdio: 'ignore', detached: true }).unref();
            return;
        }
        // macOS fallback: open -a "App Name"
        if (platform === 'darwin' && editor.macAppName) {
            child_process_1.default.spawn('open', ['-a', editor.macAppName, filePath], { stdio: 'ignore', detached: true }).unref();
            return;
        }
        console.log(chalk_1.default.yellow(`[editor] Command "${command}" not found in PATH. Cannot open ${filePath}.`));
    }
    catch (err) {
        console.log(chalk_1.default.red(`[editor] Failed to open file: ${err}`));
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
function writeEditorSettings(config) {
    const editor = getEditor(config.editor);
    if (!editor || !editor.settingsTarget)
        return;
    if (editor.settingsTarget === 'vscode') {
        writeIfAbsent('.vscode/settings.json', VSCODE_SETTINGS);
    }
    else if (editor.settingsTarget === 'zed') {
        writeIfAbsent('.zed/settings.json', ZED_SETTINGS);
    }
    else if (editor.settingsTarget === 'idea') {
        // JetBrains projects need full .idea/ structure (IDE generates it on first open).
        // We intentionally don't seed it here.
    }
}
function writeIfAbsent(relative, content) {
    const filePath = (0, util_1.getPath)(relative);
    (0, util_1.ensureDirectoryExistence)(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, content);
        console.log(chalk_1.default.green(`${relative} created.`));
    }
    else {
        console.log(chalk_1.default.gray(`${relative} already exists.`));
    }
}
