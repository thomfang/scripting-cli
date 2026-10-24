import { Argv } from 'yargs';
import { AgentCommand } from './agent_protocol';
export declare function invokeAgentCommand(command: AgentCommand, output: string, json: boolean, stream?: boolean): Promise<void>;
export declare function installAgentCommands(y: Argv): Argv;
