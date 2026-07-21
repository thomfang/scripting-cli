import { FSWatcher } from 'chokidar';
import { Socket } from 'socket.io';
import { globalDtsFileName, scriptingDtsFileName } from './const';
import { ResolvedConfig } from './types';
export declare class Controller {
    private static instances;
    static create(socket: Socket, config: ResolvedConfig): Controller;
    static get(socketId: string): Controller | undefined;
    watcher: FSWatcher | null;
    scriptName: string | null;
    socket: Socket | null;
    config: ResolvedConfig;
    constructor(socket: Socket, config: ResolvedConfig);
    createWatcher(scriptName: string): void;
    handleSyncScriptFromClient: (data: {
        [globalDtsFileName]: string;
        [scriptingDtsFileName]: string;
        extraDtsFiles?: Record<string, string>;
        scriptName: string;
        scriptFiles: Record<string, string>;
    }, ack: (result: {
        error?: string;
        success?: boolean;
    }) => void) => Promise<void>;
    handleSyncScriptFromServer: (data: {
        "global.d.ts": string;
        "scripting.d.ts": string;
        extraDtsFiles?: Record<string, string>;
        scriptName: string;
    }, ack: (result: {
        error?: string;
        scriptFiles?: Record<string, {
            hash: string;
            content: string;
        }>;
        otherFiles?: string[];
    }) => void) => Promise<void>;
    handleLog: (data: {
        scriptName: string;
        content: string;
        isError: boolean;
    }) => void;
    handleOpenFile: (data: {
        scriptName: string;
        relativePath: string;
    }) => Promise<void>;
    handleStopDebugScript: (data: string, ack: (result: boolean) => void) => void;
    handleGetFileContent: (data: {
        scriptName: string;
        relativePath: string;
    }, ack: (result: {
        error?: string;
        content?: string;
    }) => void) => Promise<void>;
    handlePutFileData: (data: {
        scriptName: string;
        relativePath: string;
        data: Buffer;
    }, ack: (result: {
        error?: string;
        success?: boolean;
    }) => void) => Promise<void>;
    handleGetFilePath: (data: {
        scriptName: string;
        relativePath: string;
    }, ack: (result: {
        error?: string;
        filePath?: string;
    }) => void) => Promise<void>;
}
