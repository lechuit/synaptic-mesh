import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveObservationRepeatability } from '../src/passive-observation-repeatability-scorecard.mjs';
import { passiveObservationRepeatabilityInput } from './passive-observation-repeatability-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const scorecard = scorePassiveObservationRepeatability(await passiveObservationRepeatabilityInput());
assert.equal(scorecard.scorecardStatus, 'REPEATABILITY_SCORECARD_COMPLETE');
assert.equal(scorecard.metrics.completedWindows, 3);
assert.equal(scorecard.metrics.degradedWindows, 1);
assert.equal(scorecard.metrics.usefulOutcomeRatio, 1);
assert.equal(scorecard.metrics.repeatabilityRatio, 1);
assert.equal(scorecard.metrics.boundaryViolationCount, 0);
assert.equal(scorecard.recommendation, 'ADVANCE_OBSERVATION_ONLY');
assert.equal(scorecard.recommendationIsAuthority, false);
assert.equal(scorecard.policyDecision, null);
await writeFile(resolve('evidence/passive-observation-repeatability-scorecard-metrics-v0.27.2.out.json'), JSON.stringify({ metrics: scorecard.metrics, recommendation: scorecard.recommendation, recommendationIsAuthority: scorecard.recommendationIsAuthority, policyDecision: scorecard.policyDecision }, null, 2) + '\n');
console.log(JSON.stringify({ recommendation: scorecard.recommendation, metrics: scorecard.metrics }, null, 2));
