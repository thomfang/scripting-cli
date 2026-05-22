import type { ScriptingConfig } from './types';

export type {
  ScriptingConfig,
  EditorKey,
  LogLevel,
  EditorDescriptor,
  ResolvedConfig,
} from './types';

export function defineConfig(config: ScriptingConfig): ScriptingConfig {
  return config;
}
