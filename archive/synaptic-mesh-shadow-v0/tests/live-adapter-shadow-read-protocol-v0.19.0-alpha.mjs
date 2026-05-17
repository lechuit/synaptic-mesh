import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveAdapterShadowReadProtocol } from '../src/live-adapter-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const protocol = liveAdapterShadowReadProtocol();
assert.equal(protocol.barrierCrossed, 'local_adapter_shadow_read_gate');
for (const key of ['disabledByDefault', 'humanStartedManualOnly', 'operatorRun', 'operatorReviewRequired', 'localOnly', 'passiveOnly', 'readOnly', 'oneShot', 'constrainedLocalReadAdapter', 'singleExplicitLocalSourceOnly', 'boundedWindowAndRecords']) assert.equal(protocol[key], true);
for (const key of ['networkFetch', 'resourceFetch', 'autonomousLiveMode', 'watcherDaemon', 'batchMode', 'toolExecution', 'memoryConfigWrites', 'rawPersisted', 'rawOutput', 'agentConsumedOutput', 'machineReadablePolicyDecision', 'approvalBlockAllowAuthorizationEnforcement', 'externalEffects']) assert.equal(protocol[key], false);
assert.equal(protocol.policyDecision, null);
const out = { artifact: 'T-synaptic-mesh-live-adapter-shadow-read-protocol-v0.19.0-alpha', timestamp: '2026-05-15T12:05:00.000Z', summary: protocol };
await writeFile(resolve('evidence/live-adapter-shadow-read-protocol-v0.19.0-alpha.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
