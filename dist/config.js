"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConfigFile = findConfigFile;
exports.loadConfigFile = loadConfigFile;
exports.saveJsonConfig = saveJsonConfig;
exports.resolveConfig = resolveConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const jiti_1 = require("jiti");
const editors_1 = require("./editors");
const prompt_1 = require("./prompt");
const CONFIG_FILENAMES = [
    'scripting.config.ts',
    'scripting.config.mts',
    'scripting.config.cts',
    'scripting.config.js',
    'scripting.config.mjs',
    'scripting.config.cjs',
    'scripting.config.json',
];
const DEFAULTS = {
    editor: 'none',
    editorArgs: [],
    port: 3000,
    autoOpen: true,
    generateTsConfig: true,
    logLevel: 'info',
    ignore: [],
};
function findConfigFile(cwd = process.cwd()) {
    for (const name of CONFIG_FILENAMES) {
        const p = path_1.default.join(cwd, name);
        if (fs_1.default.existsSync(p))
            return p;
    }
    return null;
}
async function loadConfigFile(filePath) {
    if (filePath.endsWith('.json')) {
        const raw = fs_1.default.readFileSync(filePath, 'utf-8');
        try {
            return JSON.parse(raw);
        }
        catch (e) {
            console.log(chalk_1.default.red(`[config] Failed to parse ${path_1.default.basename(filePath)}: ${e}`));
            return {};
        }
    }
    try {
        const jiti = (0, jiti_1.createJiti)(__filename, { interopDefault: true });
        const mod = await jiti.import(filePath, { default: true });
        if (mod && typeof mod === 'object') {
            // jiti returns the default export directly when interopDefault is true
            return mod;
        }
        return {};
    }
    catch (e) {
        console.log(chalk_1.default.red(`[config] Failed to load ${path_1.default.basename(filePath)}: ${e}`));
        return {};
    }
}
function saveJsonConfig(config, cwd = process.cwd()) {
    const filePath = path_1.default.join(cwd, 'scripting.config.json');
    fs_1.default.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
    console.log(chalk_1.default.green(`scripting.config.json created.`));
    return filePath;
}
function mergeConfig(base, override) {
    return {
        editor: override.editor ?? base.editor,
        editorCommand: override.editorCommand ?? base.editorCommand,
        editorArgs: override.editorArgs ?? base.editorArgs,
        port: override.port ?? base.port,
        autoOpen: override.autoOpen ?? base.autoOpen,
        generateTsConfig: override.generateTsConfig ?? base.generateTsConfig,
        logLevel: override.logLevel ?? base.logLevel,
        ignore: override.ignore ?? base.ignore,
    };
}
function resolveDefaults(config) {
    return {
        editor: config.editor ?? DEFAULTS.editor,
        editorCommand: config.editorCommand,
        editorArgs: config.editorArgs ?? DEFAULTS.editorArgs,
        port: config.port ?? DEFAULTS.port,
        autoOpen: config.autoOpen ?? DEFAULTS.autoOpen,
        generateTsConfig: config.generateTsConfig ?? DEFAULTS.generateTsConfig,
        logLevel: config.logLevel ?? DEFAULTS.logLevel,
        ignore: config.ignore ?? DEFAULTS.ignore,
    };
}
async function resolveConfig(opts) {
    const cwd = process.cwd();
    const existing = findConfigFile(cwd);
    let fileConfig = {};
    if (existing && !opts.reconfigure) {
        fileConfig = await loadConfigFile(existing);
        console.log(chalk_1.default.gray(`Loaded config from ${path_1.default.basename(existing)}`));
    }
    // First-run or --reconfigure: ask the user.
    // Skip the prompt when --editor is provided non-interactively, or when a config already specifies an editor.
    const needPrompt = opts.reconfigure ||
        (!fileConfig.editor && !opts.editorOverride);
    if (needPrompt) {
        const answers = await (0, prompt_1.promptForEditor)();
        if (answers) {
            fileConfig = { ...fileConfig, ...answers };
            // Persist as JSON for npx-friendliness
            saveJsonConfig(fileConfig, cwd);
        }
    }
    const cliOverride = {};
    if (opts.editorOverride)
        cliOverride.editor = validateEditorKey(opts.editorOverride);
    if (opts.port != null)
        cliOverride.port = opts.port;
    if (opts.noAutoOpen)
        cliOverride.autoOpen = false;
    const merged = mergeConfig(fileConfig, cliOverride);
    return resolveDefaults(merged);
}
function validateEditorKey(value) {
    const editor = (0, editors_1.getEditor)(value);
    if (!editor) {
        console.log(chalk_1.default.yellow(`[config] Unknown editor "${value}". Falling back to "none".`));
        return 'none';
    }
    return editor.key;
}
