import { Socket } from 'socket.io';
import { SourceSnapshot } from './agent_protocol';
export declare function skillIgnores(ignore: string[]): string[];
export declare function validateSkillSnapshot(raw: any): SourceSnapshot;
export declare function snapshotSkill(workspace: string, name: string, ignore: string[]): Promise<SourceSnapshot>;
export declare function inspectSkill(workspace: string, name: string, ignore: string[]): Promise<SourceSnapshot | undefined>;
export declare function applySkillSnapshot(workspace: string, name: string, raw: unknown, expected: string | null): Promise<SourceSnapshot>;
export declare class SkillSyncController {
    private socket;
    private workspace;
    private ignore;
    private beforeBind;
    private binding?;
    private watcher?;
    private catalog?;
    private timer?;
    private catalogTimer?;
    private tail;
    private pauses;
    private closed;
    constructor(socket: Socket, workspace: string, ignore: string[], beforeBind: () => Promise<void>);
    private serial;
    selected(): {
        name: string;
        bindingId: string;
        revision: string;
    } | null;
    drain(): Promise<void>;
    pause(): void;
    resume(snapshot?: SourceSnapshot): void;
    stop(): Promise<void>;
    close(): Promise<void>;
    private names;
    private watchCatalog;
    private request;
    private schedule;
    private block;
    private pump;
}
