import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runLiveReadGate } from '../src/live-read-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runLiveReadGate({ source: 'README.md', records: 6, stdout: true }));
assert.equal(packet.summary.liveReadBarrierCrossed, true);
assert.equal(packet.summary.unexpectedPermits, 0);
assert.equal(packet.usefulnessScorecard.crossedLiveInputIngestionBarrier, true);
for (const k of ['rawPersisted', 'rawOutput', 'agentConsumedOutput', 'externalEffects', 'enforcement', 'authorization', 'approvalBlockAllow', 'toolExecution', 'memoryConfigWrite', 'watcherDaemon', 'autonomousLiveMode', 'networkResourceFetch', 'batchMode']) assert.equal(packet.summary[k], false);
const out = { artifact: 'T-synaptic-mesh-live-read-gate-reviewer-package-v0.18.5', timestamp: '2026-05-15T11:00:00.000Z', summary: { ...packet.summary, phaseClosed: true, usefulnessScorecardPass: true, twoIndependentLocalReviews: true, notGitHubUiReviews: true, notDeploymentApproval: true }, packet };
await writeFile(resolve('evidence/live-read-gate-reviewer-package-v0.18.5.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
