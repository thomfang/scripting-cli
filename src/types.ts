export type EditorKey =
  | 'vscode'
  | 'vscode-insiders'
  | 'vscodium'
  | 'cursor'
  | 'windsurf'
  | 'trae'
  | 'zed'
  | 'webstorm'
  | 'idea'
  | 'fleet'
  | 'sublime'
  | 'nova'
  | 'vim'
  | 'nvim'
  | 'emacs'
  | 'custom'
  | 'none';

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface ScriptingConfig {
  editor?: EditorKey;
  editorCommand?: string;
  editorArgs?: string[];
  port?: number;
  autoOpen?: boolean;
  generateTsConfig?: boolean;
  logLevel?: LogLevel;
}

export type ResolvedConfig = Required<Omit<ScriptingConfig, 'editorCommand' | 'editorArgs'>> & {
  editorCommand?: string;
  editorArgs: string[];
};

export interface EditorDescriptor {
  key: EditorKey;
  displayName: string;
  command: string | null;
  macAppName?: string;
  settingsTarget?: 'vscode' | 'zed' | 'idea' | null;
  terminalApp?: boolean;
}
