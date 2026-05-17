import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveObservationRepeatability } from '../src/passive-observation-repeatability-scorecard.mjs';
import { writePassiveObservationRepeatabilityWindowFixtures } from './passive-observation-repeatability-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const windows = await writePassiveObservationRepeatabilityWindowFixtures();
const scorecard = scorePassiveObservationRepeatability({ windows });
assert.equal(windows.length, 4);
assert.equal(scorecard.metrics.totalWindows, 4);
assert.equal(scorecard.metrics.completedWindows, 3);
assert.equal(scorecard.metrics.degradedWindows, 1);
assert.equal(scorecard.windowSummaries.some((window) => window.degraded && window.degradationCause.length > 0), true);
assert.equal(scorecard.policyDecision, null);
await writeFile(resolve('evidence/passive-observation-repeatability-scorecard-windows-v0.27.1.out.json'), JSON.stringify({ metrics: scorecard.metrics, windowSummaries: scorecard.windowSummaries, policyDecision: scorecard.policyDecision }, null, 2) + '\n');
console.log(JSON.stringify(scorecard.metrics, null, 2));
