import { SourceSnapshot } from './agent_protocol';
type SocketPeer = {
    id: string;
    connected: boolean;
    on: (event: string, cb: (...args: any[]) => void) => unknown;
    emit: (event: string, ...args: any[]) => unknown;
};
interface Peer {
    socket: SocketPeer;
    metadata?: any;
    pending: Map<string, {
        request: any;
        resolve: (reply: any) => void;
        reject: (error: Error) => void;
    }>;
    hooks: {
        project: () => string | null;
        ignore: () => string[];
        pause: () => void;
        resume: (snapshot?: SourceSnapshot) => void;
    };
}
interface Job {
    runId: string;
    requestId: string;
    deviceId: string;
    sessionId: string;
    project?: string;
    requestedRevision?: string;
    revision?: string;
    status: string;
    result?: any;
    error?: {
        code: string;
        message: string;
    };
    createdAt: number;
    cancellationRequested?: boolean;
    fingerprint: string;
    cancel?: () => void;
}
export declare class AgentBroker {
    readonly workspace: string;
    private peers;
    private jobs;
    private activeMutations;
    private artifactDirectory?;
    constructor(workspace: string);
    register(socket: SocketPeer, hooks: Peer['hooks']): void;
    private invalidate;
    private select;
    private call;
    devices(): Promise<any[]>;
    submit(raw: unknown): Job;
    private execute;
    get(id: string): any;
    cancel(id: string): any;
    private publicJob;
    private removeArtifact;
    private statusFields;
    private storeArtifact;
    prune(now?: number): void;
    close(): void;
}
export declare const agentBroker: AgentBroker;
export {};
