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
export interface WidgetCase {
    id: string;
    family: string;
    parameter?: string;
    screenshot: boolean;
}
export interface AgentOptions {
    check?: boolean;
    events?: boolean;
    readyLog?: string;
    cases?: WidgetCase[];
    replace?: boolean;
    expectedRevision?: string;
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
    script?: string; /** @deprecated Compatibility input for protocol-v1 clients. */
    project?: string;
    skill?: string;
    entry?: string;
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
export declare function validPackageName(value: unknown): value is string;
export declare function safeRelativePath(value: string): boolean;
export declare function revisionForFiles(files: Pick<SourceFile, 'path' | 'sha256'>[]): string;
export declare function snapshotSource(workspace: string, name: string, ignore: string[], kind?: 'scripts' | 'skills'): Promise<SourceSnapshot>;
export declare const snapshotScript: typeof snapshotSource;
/** @deprecated Protocol-v1 compatibility exports. */
export declare const snapshotProject: typeof snapshotSource;
export declare const validProjectName: typeof validPackageName;
export declare function failure(error: unknown): any;
/** A delayed watcher notification for bytes already applied by this job must
 * not trigger a second automatic run. Changes made after the snapshot remain. */
export declare function isAcknowledgedChange(workspace: string, script: string, relative: string, snapshot: SourceSnapshot): boolean;
