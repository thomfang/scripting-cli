import { ResolvedConfig, ScriptingConfig } from './types';
export declare function findConfigFile(cwd?: string): string | null;
export declare function loadConfigFile(filePath: string): Promise<ScriptingConfig>;
export declare function saveJsonConfig(config: ScriptingConfig, cwd?: string): string;
export interface ResolveOptions {
    port?: number;
    noAutoOpen?: boolean;
    editorOverride?: string;
    reconfigure?: boolean;
}
export declare function resolveConfig(opts: ResolveOptions): Promise<ResolvedConfig>;
