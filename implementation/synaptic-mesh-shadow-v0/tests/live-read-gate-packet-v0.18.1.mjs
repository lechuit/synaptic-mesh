import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runLiveReadGate } from '../src/live-read-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runLiveReadGate({ source: 'README.md', records: 6, stdout: true }));
assert.equal(packet.summary.liveReadBarrierCrossed, true);
assert.equal(packet.summary.liveInputIngestionReadGate, true);
assert.equal(packet.summary.policyDecision, null);
assert.equal(packet.summary.rawPersisted, false);
assert.equal(packet.summary.rawOutput, false);
assert.equal(packet.summary.agentConsumedOutput, false);
assert.equal(packet.summary.recordsRead <= 6, true);
assert.equal(packet.retention.semanticDecisionTokenPersisted, false);
assert.equal(packet.usefulnessScorecard.crossedLiveInputIngestionBarrier, true);
assert.equal(packet.usefulnessScorecard.usedRealRepoLocalSource, true);
await writeFile(resolve('evidence/live-read-gate-packet-v0.18.1.out.json'), JSON.stringify(packet, null, 2) + '\n');
console.log(JSON.stringify(packet.summary, null, 2));
