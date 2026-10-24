import crypto from 'crypto';
export declare const PROTOCOL_VERSION = 1;
export declare const MAX_SOURCE_BYTES: number;
export declare const MAX_FILES = 2000;
export declare const MAX_IMAGE_BYTES: number;
export declare const widgetFamilies: string[];
export declare class AgentError extends Error {
    code: string;
    constructor(code: string, message: string);
}
export declare const hash: (bytes: crypto.BinaryLike) => string;
export interface SourceFile {
    path: string;
    sha256: string;
    data: string;
}
export interface SourceSnapshot {
    revision: string;
    files: SourceFile[];
    ignore: string[];
}
export interface AgentOptions {
    timeout?: number;
    screenshot?: boolean;
    captureAfter?: number;
    family?: string;
    parameter?: string;
    noSync?: boolean;
    queryParameters?: Record<string, unknown>;
}
export interface AgentCommand {
    method: string;
    device?: string;
    project?: string;
    options?: AgentOptions;
    query?: string;
    docId?: string;
    symbol?: string;
    lang?: string;
    limit?: number;
    requestId?: string;
}
export declare const methods: string[];
export declare function validateCommand(value: any): AgentCommand;
export declare function safeRelativePath(value: string): boolean;
export declare function revisionForFiles(files: Pick<SourceFile, 'path' | 'sha256'>[]): string;
export declare function snapshotProject(workspace: string, project: string, ignore: string[]): Promise<SourceSnapshot>;
export declare function failure(error: unknown): {
    code: string;
    message: string;
};
/** A delayed watcher notification for bytes already applied by this job must
 * not trigger a second automatic run. Changes made after the snapshot remain. */
export declare function isAcknowledgedChange(workspace: string, project: string, relative: string, snapshot: SourceSnapshot): boolean;
