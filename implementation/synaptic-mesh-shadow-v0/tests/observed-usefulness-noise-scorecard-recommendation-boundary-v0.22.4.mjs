import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scoreObservedUsefulnessNoise } from '../src/observed-usefulness-noise-scorecard.mjs';
import { observedUsefulnessNoiseCases } from './observed-usefulness-noise-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const scorecard = scoreObservedUsefulnessNoise(await observedUsefulnessNoiseCases());
assert.equal(scorecard.recommendation, 'advance');
assert.equal(scorecard.recommendationIsAuthority, false);
assert.equal(scorecard.policyDecision, null);
for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert.equal(scorecard[key], false, key);
assert(!/allow|block|approve|authorize|enforce|policyDecision/i.test(scorecard.recommendation));
assert(scorecard.reportMarkdown.includes('human-readable signal only; not authority'));
const out = { recommendation: scorecard.recommendation, recommendationIsAuthority: scorecard.recommendationIsAuthority, policyDecision: scorecard.policyDecision };
await writeFile(resolve('evidence/observed-usefulness-noise-scorecard-recommendation-boundary-v0.22.4.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
