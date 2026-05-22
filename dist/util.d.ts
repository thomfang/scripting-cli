export declare function md5(content: string): string;
export declare function getPath(filename: string): string;
export declare function getScriptPath(filename?: string): string;
export declare function createTsConfig(): void;
export declare function ensureScriptsDirectory(): void;
export declare function ensureDirectoryExistence(filePath: string): void;
export declare function writeDtsFiles(files: Record<string, string>): Promise<void>;
export declare function getRelativePath(from: string, to: string): string;
export declare function migrateOldFiles(): Promise<void>;
