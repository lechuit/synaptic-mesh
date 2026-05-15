import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scoreOperatorOutcomeValue } from '../src/operator-outcome-value-scorecard.mjs';
import { operatorOutcomeCaptureFixture } from './operator-outcome-value-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const cases = [
  { name: 'advance_observation_only', labels: ['USEFUL_FOR_REVIEW','USEFUL_FOR_REVIEW','NOT_USEFUL_NOISE'], expected: 'ADVANCE_OBSERVATION_ONLY' },
  { name: 'hold_needs_more_evidence', labels: ['USEFUL_FOR_REVIEW','NEEDS_MORE_EVIDENCE','USEFUL_FOR_REVIEW'], expected: 'HOLD_FOR_MORE_EVIDENCE' },
  { name: 'hold_abstain_uncertain', labels: ['USEFUL_FOR_REVIEW','ABSTAIN_OPERATOR_UNCERTAIN','USEFUL_FOR_REVIEW'], expected: 'HOLD_FOR_MORE_EVIDENCE' },
  { name: 'degrade_noise_signal', labels: ['NOT_USEFUL_NOISE','NOT_USEFUL_NOISE','USEFUL_FOR_REVIEW'], expected: 'DEGRADE_QUEUE_SIGNAL' },
  { name: 'hold_insufficient_sample', labels: ['USEFUL_FOR_REVIEW','USEFUL_FOR_REVIEW','USEFUL_FOR_REVIEW'], mutate: (capture) => ({ ...capture, capturedOutcomes: capture.capturedOutcomes.slice(0, 2), capturedOutcomeCount: 2 }), expected: 'HOLD_FOR_MORE_EVIDENCE' }
];
const results = [];
for (const entry of cases) {
  const capture = entry.mutate ? entry.mutate(await operatorOutcomeCaptureFixture(entry.labels)) : await operatorOutcomeCaptureFixture(entry.labels);
  const scorecard = scoreOperatorOutcomeValue(capture);
  assert.equal(scorecard.recommendation, entry.expected, entry.name);
  assert.equal(['ADVANCE_OBSERVATION_ONLY','HOLD_FOR_MORE_EVIDENCE','DEGRADE_QUEUE_SIGNAL'].includes(scorecard.recommendation), true);
  assert.equal(scorecard.recommendationIsAuthority, false);
  results.push({ name: entry.name, metrics: scorecard.metrics, recommendation: scorecard.recommendation, status: scorecard.scorecardStatus });
}
await writeFile(resolve('evidence/operator-outcome-value-scorecard-recommendations-v0.25.2.out.json'), JSON.stringify({ cases: results }, null, 2) + '\n');
console.log(JSON.stringify({ cases: results.length }, null, 2));
