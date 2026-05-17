import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';
import { passiveObservationWindowInput } from './passive-observation-window-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = await runPassiveObservationWindow(await passiveObservationWindowInput());
const stages = Object.fromEntries(artifact.stageSummaries.map((stage) => [stage.stage, stage]));
assert.equal(artifact.windowStatus, 'OBSERVATION_WINDOW_COMPLETE');
assert.equal(stages.explicit_repo_local_multisource_read.status, 'COMPLETE');
assert.equal(stages.positive_pass_gate.status, 'PASS');
assert.equal(stages.operator_review_queue.status, 'READY_FOR_OPERATOR_REVIEW');
assert.equal(stages.manual_local_outcome_capture.status, 'OUTCOME_CAPTURE_COMPLETE');
assert.equal(stages.value_scorecard.status, 'VALUE_SCORECARD_COMPLETE');
assert.equal(stages.value_scorecard.recommendationIsAuthority, false);
for (const stage of artifact.stageSummaries) assert.equal(stage.policyDecision, null, stage.stage);
await writeFile(resolve('evidence/passive-observation-window-chain-v0.26.2.out.json'), JSON.stringify({ windowStatus: artifact.windowStatus, stageSummaries: artifact.stageSummaries }, null, 2) + '\n');
console.log(JSON.stringify({ stages: artifact.stageSummaries.length }, null, 2));
