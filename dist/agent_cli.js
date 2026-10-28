"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeAgentCommand = invokeAgentCommand;
exports.installAgentCommands = installAgentCommands;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const agent_protocol_1 = require("./agent_protocol");
const agent_control_1 = require("./agent_control");
async function invokeAgentCommand(command, output, json, stream = false) {
    const state = (0, agent_control_1.loadControl)(process.cwd());
    const info = await (0, agent_control_1.controlRequest)(state, '/v1/info');
    if (info.result.workspace !== state.workspace)
        throw new agent_protocol_1.AgentError('workspace_mismatch', 'The running server belongs to another workspace.');
    let job = (await (0, agent_control_1.controlRequest)(state, '/v1/requests', command)).result;
    const cancel = () => { void (0, agent_control_1.controlRequest)(state, `/v1/jobs/${job.runId}/cancel`, {}).catch(() => { }); };
    process.once('SIGINT', cancel);
    let cursor = 0, reportedLogLimit = false;
    const emitEvents = async () => {
        if (!stream)
            return;
        const page = (await (0, agent_control_1.controlRequest)(state, `/v1/jobs/${job.runId}/events?after=${cursor}`)).result;
        if (page.logsTruncated && !reportedLogLimit) {
            console.log(JSON.stringify({ type: 'gap', runId: job.runId, reason: 'stream_log_budget' }));
            reportedLogLimit = true;
        }
        if (page.truncated)
            console.log(JSON.stringify({ type: 'gap', runId: job.runId, after: cursor, reason: 'event_retention_limit' }));
        for (const event of page.events)
            console.log(JSON.stringify(event));
        cursor = page.nextCursor;
    };
    try {
        while (!['completed', 'failed', 'cancelled'].includes(job.status)) {
            await emitEvents();
            await new Promise(r => setTimeout(r, 200));
            job = (await (0, agent_control_1.controlRequest)(state, `/v1/jobs/${job.runId}`)).result;
        }
        await emitEvents();
        if (job.result?.artifacts?.length)
            job.result = (0, agent_control_1.materializeArtifacts)(job.result, job.runId, output);
        if (stream)
            console.log(JSON.stringify({ type: 'result', seq: cursor + 1, runId: job.runId, job }));
        else if (json)
            console.log(JSON.stringify(job));
        else
            console.log(JSON.stringify(job, null, 2));
        process.exitCode = job.status === 'completed' ? 0 : job.status === 'cancelled' ? 130 : ['execution_timeout', 'device_timeout'].includes(job.error?.code) ? 124 : 1;
    }
    finally {
        process.removeListener('SIGINT', cancel);
    }
}
function common(y, screenshots = true) {
    const options = y.option('device', { type: 'string', describe: 'Target device ID; required when several devices are connected' })
        .option('json', { type: 'boolean', default: false, describe: 'Print one JSON result' });
    return screenshots ? options.option('output', { type: 'string', default: 'artifacts', describe: 'Screenshot output directory' }) : options;
}
function streaming(y, screenshots = true) { return common(y, screenshots).option('stream', { type: 'boolean', default: false, describe: 'Print progress/log/diagnostic JSONL events and one final result' }); }
function runOptions(y, script = true) {
    const options = streaming(y).positional('script', { type: 'string', describe: 'Currently selected App debug script' })
        .option('screenshot', { type: 'boolean', default: false })
        .option('timeout', { type: 'number', default: 30, describe: 'Overall run deadline in seconds, 1...120' })
        .option('no-sync', { type: 'boolean', default: false, describe: 'Use the last acknowledged App revision' });
    return script ? options.option('capture-after', { type: 'number', default: 2, describe: 'Seconds after a script view is available before capture' }).option('ready-log', { type: 'string', describe: 'Wait for this exact console.log line from the current script before capture' }).option('query-parameters', { type: 'string', describe: 'JSON object passed to the script' }) : options;
}
const handler = (build) => async (a) => {
    try {
        const command = build(a);
        command.options = { ...command.options, events: a.stream ?? false };
        await invokeAgentCommand(command, path_1.default.resolve(a.output ?? 'artifacts'), a.json ?? false, a.stream ?? false);
    }
    catch (e) {
        const result = { status: 'failed', error: (0, agent_protocol_1.failure)(e) };
        console.log(JSON.stringify(a.stream ? { type: 'result', job: result } : result, a.json || a.stream ? undefined : null, a.json || a.stream ? undefined : 2));
        process.exitCode = 1;
    }
};
function scriptOptions(y) { return streaming(y).usage('$0 scripts <action> [name]').positional('action', { choices: ['list', 'inspect', 'create', 'attach'] }).positional('name', { type: 'string' }).option('replace', { type: 'boolean', default: false }).option('expected-revision', { type: 'string' }).option('timeout', { type: 'number', default: 30 }); }
const scriptHandler = handler(a => ({ method: `scripts.${a.action}`, device: a.device, script: a.name, options: { replace: a.replace, expectedRevision: a.expectedRevision, timeout: a.timeout } }));
function installAgentCommands(y) {
    return y.command('skill', 'Print the portable Scripting development SKILL.md', () => { }, () => console.log(fs_1.default.readFileSync(path_1.default.join(__dirname, '../skills/scripting-development/SKILL.md'), 'utf8'))).command('devices', 'List connected devices and their current responsiveness', common, async (a) => {
        try {
            const value = await (0, agent_control_1.controlRequest)((0, agent_control_1.loadControl)(process.cwd()), '/v1/devices');
            console.log(JSON.stringify(value.result, null, a.json ? undefined : 2));
        }
        catch (e) {
            console.log(JSON.stringify({ status: 'failed', error: (0, agent_protocol_1.failure)(e) }));
            process.exitCode = 1;
        }
    }).command('status', 'Query the selected App debug session', y => streaming(y), handler(a => ({ method: 'status', device: a.device })))
        .command('docs <action> [value]', 'Search docs or read a returned document ID', y => streaming(y).positional('action', { choices: ['search', 'get'] }).positional('value', { type: 'string' }).option('lang', { choices: ['en', 'zh'], default: 'en' }).option('limit', { type: 'number', default: 20 }), handler(a => ({ method: a.action === 'search' ? 'docs.search' : 'docs.get', device: a.device, query: a.action === 'search' ? a.value : undefined, docId: a.action === 'get' ? a.value : undefined, lang: a.lang, limit: a.limit })))
        .command('api <action> <symbol>', 'Read an exact Scripting API declaration', y => streaming(y).positional('action', { choices: ['get'] }).positional('symbol', { type: 'string' }), handler(a => ({ method: 'api.get', device: a.device, symbol: a.symbol })))
        .command('run [script]', 'Sync and execute the current debug script', y => runOptions(y), handler(a => ({ method: 'run', device: a.device, script: a.script, options: { screenshot: a.screenshot, captureAfter: a.captureAfter, readyLog: a.readyLog, timeout: a.timeout, noSync: a['no-sync'], queryParameters: a['query-parameters'] ? JSON.parse(a['query-parameters']) : undefined } })))
        .command('widget [script]', 'Render the current script widget and close its preview', y => runOptions(y, false).option('family', { type: 'string', default: 'systemSmall' }).option('parameter', { type: 'string' }), handler(a => ({ method: 'widget', device: a.device, script: a.script, options: { screenshot: a.screenshot, timeout: a.timeout, noSync: a['no-sync'], family: a.family, parameter: a.parameter } })))
        .command('widget-batch [script]', 'Render 1...8 widget cases from a JSON file', y => streaming(y).positional('script', { type: 'string' }).option('timeout', { type: 'number', default: 30 }).option('no-sync', { type: 'boolean', default: false }).option('cases', { type: 'string', demandOption: true }), handler(a => {
        const stat = fs_1.default.statSync(a.cases);
        if (stat.size > 128 * 1024)
            throw new agent_protocol_1.AgentError('invalid_request', 'Case manifest exceeds 128 KiB.');
        const cases = JSON.parse(fs_1.default.readFileSync(a.cases, 'utf8'));
        return { method: 'widget.batch', device: a.device, script: a.script, options: { timeout: a.timeout, noSync: a['no-sync'], cases } };
    }))
        .command('scripts <action> [name]', 'List, inspect, create or attach an App script', scriptOptions, scriptHandler)
        .command('projects <action> [name]', false, scriptOptions, scriptHandler)
        .command('skills run <name> <entry>', 'Sync and test a .ts/.tsx entry in the selected App skill', y => streaming(y, false).positional('name', { type: 'string', demandOption: true }).positional('entry', { type: 'string', demandOption: true }).option('check', { type: 'boolean', default: false, describe: 'Check TypeScript without executing the entry' }).option('timeout', { type: 'number', default: 30 }).option('query-parameters', { type: 'string', describe: 'JSON object passed to the skill script' }), handler(a => ({ method: 'skills.run', device: a.device, skill: a.name, entry: a.entry, options: { check: a.check, timeout: a.timeout, queryParameters: a['query-parameters'] ? JSON.parse(a['query-parameters']) : undefined } })))
        .command('jobs <action> <id>', 'Read a recent result or cancel an owned run', y => common(y).positional('action', { choices: ['show', 'cancel', 'events'] }).positional('id', { type: 'string' }).option('after', { type: 'number', default: 0 }), async (a) => {
        try {
            const state = (0, agent_control_1.loadControl)(process.cwd());
            const route = `/v1/jobs/${encodeURIComponent(a.id)}${a.action === 'cancel' ? '/cancel' : a.action === 'events' ? `/events?after=${a.after}` : ''}`;
            let job = (await (0, agent_control_1.controlRequest)(state, route, a.action === 'cancel' ? {} : undefined)).result;
            if (job.result?.artifacts?.length)
                job.result = (0, agent_control_1.materializeArtifacts)(job.result, job.runId, path_1.default.resolve(a.output));
            console.log(JSON.stringify(job, null, a.json ? undefined : 2));
        }
        catch (e) {
            console.log(JSON.stringify({ status: 'failed', error: (0, agent_protocol_1.failure)(e) }));
            process.exitCode = 1;
        }
    });
}
