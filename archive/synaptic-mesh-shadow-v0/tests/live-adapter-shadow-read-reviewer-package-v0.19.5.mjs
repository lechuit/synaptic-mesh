import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runLiveAdapterShadowRead } from '../src/live-adapter-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runLiveAdapterShadowRead({ source: 'README.md', records: 6 }));
assert.equal(packet.summary.liveAdapterShadowReadBarrierCrossed, true);
assert.equal(packet.summary.unexpectedPermits, 0);
assert.equal(packet.summary.policyDecision, null);
assert.equal(packet.summary.agentConsumedOutput, false);
assert.equal(packet.usefulnessScorecard.crossedLocalAdapterShadowReadBarrier, true);
assert.equal(packet.usefulnessScorecard.readinessTheaterAvoided, true);
for (const k of ['rawPersisted', 'rawOutput', 'agentConsumedOutput', 'externalEffects', 'enforcement', 'authorization', 'approvalBlockAllow', 'toolExecution', 'memoryConfigWrite', 'watcherDaemon', 'autonomousLiveMode', 'networkResourceFetch', 'batchMode']) assert.equal(packet.summary[k], false);
const out = { artifact: 'T-synaptic-mesh-live-adapter-shadow-read-reviewer-package-v0.19.5', timestamp: '2026-05-15T12:05:00.000Z', summary: { ...packet.summary, phaseClosed: true, usefulnessScorecardPass: true, twoIndependentLocalReviews: true, notGitHubUiReviews: true, notDeploymentApproval: true }, packet };
await writeFile(resolve('evidence/live-adapter-shadow-read-reviewer-package-v0.19.5.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
