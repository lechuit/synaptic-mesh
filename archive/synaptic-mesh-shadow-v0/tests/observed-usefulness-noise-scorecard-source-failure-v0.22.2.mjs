import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { observedUsefulnessNoiseCases } from './observed-usefulness-noise-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const cases = await observedUsefulnessNoiseCases();
const allowed = cases.find((entry) => entry.id === 'source-failure-allowed-explicit-threshold');
const rejected = cases.find((entry) => entry.id === 'source-failure-default-reject');
assert.equal(allowed.output.positiveUtilityGatePassed, true);
assert.equal(allowed.output.evaluatedInput.maxIsolatedSourceFailures, 1);
assert.equal(allowed.output.summary.sourceFailuresAccepted, 1);
assert.equal(rejected.output.positiveUtilityGatePassed, false);
assert(rejected.output.rejectionReasons.includes('source_failures_exceed_positive_gate_threshold'));
const out = { allowed: allowed.output, rejected: rejected.output };
await writeFile(resolve('evidence/observed-usefulness-noise-scorecard-source-failure-v0.22.2.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ allowed: true, defaultRejected: true }, null, 2));
