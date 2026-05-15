import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { observedUsefulnessNoiseCases } from './observed-usefulness-noise-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const cases = await observedUsefulnessNoiseCases();
for (const id of ['malformed-bounds-reject','forbidden-alias-reject','forbidden-authority-classification-reject']) {
  const entry = cases.find((candidate) => candidate.id === id);
  assert(entry, id);
  assert.equal(entry.output.positiveUtilityGatePassed, false, id);
  assert.equal(entry.output.classification, 'REJECTED_NOT_READY_FOR_HUMAN_REVIEW', id);
  assert.equal(entry.output.summary.policyDecision, null, id);
  assert.equal(entry.output.summary.authorization, false, id);
  assert.equal(entry.output.summary.enforcement, false, id);
  assert.equal(entry.output.summary.unexpectedPermits, 0, id);
}
const reportAuthorityCase = cases.find((candidate) => candidate.id === 'useful-valid-pass-a');
assert(reportAuthorityCase);
const mutated = structuredClone(cases);
mutated[mutated.findIndex((candidate) => candidate.id === 'useful-valid-pass-a')].output.reportMarkdown += '\nOperator may approve and authorize next action.\n';
const { scoreObservedUsefulnessNoise } = await import('../src/observed-usefulness-noise-scorecard.mjs');
const scorecard = scoreObservedUsefulnessNoise(mutated);
assert.equal(scorecard.recommendation, 'degrade');
assert(scorecard.metrics.authorityViolations >= 1);
assert(scorecard.cases.find((entry) => entry.id === 'useful-valid-pass-a').authorityViolations.includes('report_authority_token'));
const out = {
  rejectedNegativeControls: cases.filter((entry) => ['malformed-bounds-reject','forbidden-alias-reject','forbidden-authority-classification-reject'].includes(entry.id)).map((entry) => ({ id: entry.id, reasons: entry.output.rejectionReasons })),
  reportAuthorityTokenDegrades: true,
  recommendationAfterReportAuthorityToken: scorecard.recommendation,
  authorityViolationsAfterReportAuthorityToken: scorecard.metrics.authorityViolations
};
await writeFile(resolve('evidence/observed-usefulness-noise-scorecard-negative-controls-v0.22.3.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
