import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createJiti } from 'jiti';
import { EditorKey, ResolvedConfig, ScriptingConfig } from './types';
import { getEditor } from './editors';
import { promptForEditor } from './prompt';

const CONFIG_FILENAMES = [
  'scripting.config.ts',
  'scripting.config.mts',
  'scripting.config.cts',
  'scripting.config.js',
  'scripting.config.mjs',
  'scripting.config.cjs',
  'scripting.config.json',
];

const DEFAULTS: Required<Omit<ScriptingConfig, 'editorCommand' | 'editorArgs' | 'editor'>> & {
  editor: EditorKey;
  editorArgs: string[];
} = {
  editor: 'none',
  editorArgs: [],
  port: 3000,
  autoOpen: true,
  generateTsConfig: true,
  logLevel: 'info',
  ignore: [],
};

export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const name of CONFIG_FILENAMES) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function loadConfigFile(filePath: string): Promise<ScriptingConfig> {
  if (filePath.endsWith('.json')) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(raw) as ScriptingConfig;
    } catch (e) {
      console.log(chalk.red(`[config] Failed to parse ${path.basename(filePath)}: ${e}`));
      return {};
    }
  }

  try {
    const jiti = createJiti(__filename, { interopDefault: true });
    const mod = await jiti.import<ScriptingConfig | { default?: ScriptingConfig }>(filePath, { default: true });
    if (mod && typeof mod === 'object') {
      // jiti returns the default export directly when interopDefault is true
      return (mod as ScriptingConfig);
    }
    return {};
  } catch (e) {
    console.log(chalk.red(`[config] Failed to load ${path.basename(filePath)}: ${e}`));
    return {};
  }
}

export function saveJsonConfig(config: ScriptingConfig, cwd: string = process.cwd()): string {
  const filePath = path.join(cwd, 'scripting.config.json');
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
  console.log(chalk.green(`scripting.config.json created.`));
  return filePath;
}

function mergeConfig(base: ScriptingConfig, override: ScriptingConfig): ScriptingConfig {
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

function resolveDefaults(config: ScriptingConfig): ResolvedConfig {
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

export interface ResolveOptions {
  port?: number;
  noAutoOpen?: boolean;
  editorOverride?: string;
  reconfigure?: boolean;
}

export async function resolveConfig(opts: ResolveOptions): Promise<ResolvedConfig> {
  const cwd = process.cwd();
  const existing = findConfigFile(cwd);

  let fileConfig: ScriptingConfig = {};
  if (existing && !opts.reconfigure) {
    fileConfig = await loadConfigFile(existing);
    console.log(chalk.gray(`Loaded config from ${path.basename(existing)}`));
  }

  // First-run or --reconfigure: ask the user.
  // Skip the prompt when --editor is provided non-interactively, or when a config already specifies an editor.
  const needPrompt =
    opts.reconfigure ||
    (!fileConfig.editor && !opts.editorOverride);

  if (needPrompt) {
    const answers = await promptForEditor();
    if (answers) {
      fileConfig = { ...fileConfig, ...answers };
      // Persist as JSON for npx-friendliness
      saveJsonConfig(fileConfig, cwd);
    }
  }

  const cliOverride: ScriptingConfig = {};
  if (opts.editorOverride) cliOverride.editor = validateEditorKey(opts.editorOverride);
  if (opts.port != null) cliOverride.port = opts.port;
  if (opts.noAutoOpen) cliOverride.autoOpen = false;

  const merged = mergeConfig(fileConfig, cliOverride);
  return resolveDefaults(merged);
}

function validateEditorKey(value: string): EditorKey {
  const editor = getEditor(value as EditorKey);
  if (!editor) {
    console.log(chalk.yellow(`[config] Unknown editor "${value}". Falling back to "none".`));
    return 'none';
  }
  return editor.key;
}
