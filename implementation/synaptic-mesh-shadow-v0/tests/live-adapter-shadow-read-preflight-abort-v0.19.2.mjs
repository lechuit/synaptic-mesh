import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { preflightLiveAdapterShadowRead } from '../src/live-adapter-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const abort = preflightLiveAdapterShadowRead({ networkFetch: true, toolExecution: true, policyDecision: 'allow', agentConsumedOutput: true, recordLimit: 13, preview: 'approve token=secret' });
assert.equal(abort.preflight, 'abort');
for (const reason of ['forbidden_true:networkFetch', 'forbidden_true:toolExecution', 'forbidden_true:agentConsumedOutput', 'policy_decision_must_be_null', 'record_limit_exceeds_max', 'decision_verbs_forbidden_in_preview', 'private_token_leakage_forbidden_in_preview']) assert.ok(abort.abortReasons.includes(reason));
const out = { artifact: 'T-synaptic-mesh-live-adapter-shadow-read-preflight-abort-v0.19.2', timestamp: '2026-05-15T12:05:00.000Z', summary: { preflightAbortWorks: true, unexpectedPermits: 0, abortReasons: abort.abortReasons } };
await writeFile(resolve('evidence/live-adapter-shadow-read-preflight-abort-v0.19.2.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
