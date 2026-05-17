import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const hold = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard({ recommendation: 'hold' }));
const degrade = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard({ recommendation: 'degrade' }));
for (const queue of [hold, degrade]) {
  assert.equal(queue.queueStatus, 'ABSTAIN_REQUIRES_OPERATOR_SOURCE_REVIEW');
  assert.equal(queue.queueItems.length, 0);
  assert.match(queue.abstainReason, /scorecard_recommendation_/);
  assert.equal(queue.policyDecision, null);
  assert.equal(queue.enforcement, false);
}
const evidence = { hold, degrade };
await writeFile(resolve('evidence/controlled-operator-review-queue-abstain-v0.23.2.out.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, hold: hold.queueStatus, degrade: degrade.queueStatus }, null, 2));
