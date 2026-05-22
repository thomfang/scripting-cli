"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteractive = isInteractive;
exports.promptForEditor = promptForEditor;
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
const editors_1 = require("./editors");
function isInteractive() {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
async function promptForEditor() {
    if (!isInteractive()) {
        console.log(chalk_1.default.yellow('[config] Non-interactive environment detected. Defaulting editor to "none". Edit scripting.config.json to change.'));
        return { editor: 'none' };
    }
    const available = (0, editors_1.detectAvailableEditors)();
    const choices = [...editors_1.EDITORS]
        .sort((a, b) => {
        const ax = available.has(a.key) ? 0 : 1;
        const bx = available.has(b.key) ? 0 : 1;
        return ax - bx;
    })
        .map(e => ({
        title: `${available.has(e.key) ? chalk_1.default.green('✓') : ' '} ${e.displayName}`,
        description: e.command ? `command: ${e.command}` : undefined,
        value: e.key,
    }));
    const { editor } = await (0, prompts_1.default)({
        type: 'select',
        name: 'editor',
        message: 'Which editor do you use?',
        choices,
        initial: 0,
    }, { onCancel: () => process.exit(0) });
    if (!editor)
        return null;
    if (editor === 'custom') {
        const { editorCommand } = await (0, prompts_1.default)({
            type: 'text',
            name: 'editorCommand',
            message: 'Enter the command to open files (e.g. "myeditor"):',
            validate: v => v && v.trim().length > 0 ? true : 'command is required',
        }, { onCancel: () => process.exit(0) });
        if (!editorCommand)
            return null;
        return { editor, editorCommand: editorCommand.trim() };
    }
    return { editor };
}
