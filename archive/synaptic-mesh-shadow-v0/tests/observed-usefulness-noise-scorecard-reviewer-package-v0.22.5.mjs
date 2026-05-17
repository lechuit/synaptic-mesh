import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scoreObservedUsefulnessNoise } from '../src/observed-usefulness-noise-scorecard.mjs';
import { observedUsefulnessNoiseCases } from './observed-usefulness-noise-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const scorecard = scoreObservedUsefulnessNoise(await observedUsefulnessNoiseCases());
assert.equal(scorecard.artifact, 'T-synaptic-mesh-observed-usefulness-noise-scorecard-v0.22.5');
assert.equal(scorecard.humanReadableOnly, true);
assert.equal(scorecard.scorecardOnly, true);
assert.equal(scorecard.nonAuthoritative, true);
assert.equal(scorecard.metrics.falsePasses, 0);
assert.equal(scorecard.metrics.falseValueWarnings, 0);
assert.equal(scorecard.metrics.reviewBurdenEstimate.qualitative, 'low');
assert.equal(scorecard.reportMarkdown.includes('Observed Usefulness and Noise Scorecard v0.22.5'), true);
await writeFile(resolve('evidence/observed-usefulness-noise-scorecard-reviewer-package-v0.22.5.out.json'), JSON.stringify(scorecard, null, 2) + '\n');
await writeFile(resolve('evidence/observed-usefulness-noise-scorecard-report-v0.22.5.out.md'), scorecard.reportMarkdown);
console.log(scorecard.reportMarkdown);
