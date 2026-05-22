import prompts from 'prompts';
import chalk from 'chalk';
import { EDITORS, detectAvailableEditors } from './editors';
import { EditorKey, ScriptingConfig } from './types';

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

interface EditorAnswers {
  editor: EditorKey;
  editorCommand?: string;
}

export async function promptForEditor(): Promise<EditorAnswers | null> {
  if (!isInteractive()) {
    console.log(chalk.yellow('[config] Non-interactive environment detected. Defaulting editor to "none". Edit scripting.config.json to change.'));
    return { editor: 'none' };
  }

  const available = detectAvailableEditors();

  const choices = [...EDITORS]
    .sort((a, b) => {
      const ax = available.has(a.key) ? 0 : 1;
      const bx = available.has(b.key) ? 0 : 1;
      return ax - bx;
    })
    .map(e => ({
      title: `${available.has(e.key) ? chalk.green('✓') : ' '} ${e.displayName}`,
      description: e.command ? `command: ${e.command}` : undefined,
      value: e.key,
    }));

  const { editor } = await prompts({
    type: 'select',
    name: 'editor',
    message: 'Which editor do you use?',
    choices,
    initial: 0,
  }, { onCancel: () => process.exit(0) });

  if (!editor) return null;

  if (editor === 'custom') {
    const { editorCommand } = await prompts({
      type: 'text',
      name: 'editorCommand',
      message: 'Enter the command to open files (e.g. "myeditor"):',
      validate: v => v && v.trim().length > 0 ? true : 'command is required',
    }, { onCancel: () => process.exit(0) });
    if (!editorCommand) return null;
    return { editor, editorCommand: editorCommand.trim() };
  }

  return { editor };
}

export type PromptedConfig = Partial<ScriptingConfig>;
