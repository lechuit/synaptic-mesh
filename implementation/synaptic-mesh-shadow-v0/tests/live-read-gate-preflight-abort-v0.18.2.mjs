import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveReadGateProtocol, preflightLiveReadGate, parseLiveReadGateArgs } from '../src/live-read-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const pass = preflightLiveReadGate(liveReadGateProtocol());
assert.equal(pass.preflight, 'pass');
const abort = preflightLiveReadGate({ ...liveReadGateProtocol(), networkFetch: true, policyDecision: 'allow', preview: 'please approve token=secret-4242', recordLimit: 99 });
assert.equal(abort.preflight, 'abort');
assert(abort.abortReasons.includes('forbidden_true:networkFetch'));
assert(abort.abortReasons.includes('policy_decision_must_be_null'));
assert(abort.abortReasons.includes('record_limit_exceeds_max'));
assert.throws(() => parseLiveReadGateArgs(['--source', 'README.md', '--records', '99']), /excess N rejected/);
const out = { artifact: 'T-synaptic-mesh-live-read-gate-preflight-abort-v0.18.2', timestamp: '2026-05-15T11:00:00.000Z', summary: { preflightPass: true, expectedRejects: abort.abortReasons.length + 1, unexpectedPermits: 0, abortReasons: abort.abortReasons } };
await writeFile(resolve('evidence/live-read-gate-preflight-abort-v0.18.2.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
