import { EditorKey, ScriptingConfig } from './types';
export declare function isInteractive(): boolean;
interface EditorAnswers {
    editor: EditorKey;
    editorCommand?: string;
}
export declare function promptForEditor(): Promise<EditorAnswers | null>;
export type PromptedConfig = Partial<ScriptingConfig>;
export {};
