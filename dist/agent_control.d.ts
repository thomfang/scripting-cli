import { AgentBroker } from './agent_broker';
export interface ControlState {
    protocolVersion: 1;
    port: number;
    token: string;
    instanceId: string;
    workspace: string;
}
export declare function statePath(workspace: string): string;
export declare function loadControl(workspace: string): ControlState;
export declare function controlRequest(state: ControlState, route: string, body?: unknown): Promise<any>;
export declare function startAgentControl(broker: AgentBroker): Promise<{
    state: ControlState;
    close: () => Promise<void>;
}>;
export declare function materializeArtifacts(result: any, runId: string, output: string): any;
