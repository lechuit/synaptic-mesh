import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const queue = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard());
assert.equal(queue.queueStatus, 'READY_FOR_OPERATOR_REVIEW');
assert.equal(queue.notDecisionApprovalQueue, true);
assert.equal(queue.nonAuthoritative, true);
assert.equal(queue.policyDecision, null);
assert.equal(queue.queueItems.length, 3);
assert.deepEqual(queue.queueItems.map((item) => item.sourceCaseId), ['source-failure-allowed-explicit-threshold','useful-valid-pass-a','useful-valid-pass-b']);
assert.deepEqual(queue.queueItems.map((item) => item.priority), [1, 2, 2]);
for (const item of queue.queueItems) {
  assert.equal(item.queueStatus, 'READY_FOR_OPERATOR_REVIEW');
  assert.equal(item.policyDecision, null);
  assert.equal(item.authorization, false);
  assert.equal(item.enforcement, false);
  assert.equal(item.toolExecution, false);
  assert.equal(item.externalEffects, false);
  assert.equal(item.rawPersisted, false);
  assert.equal(item.rawOutput, false);
  assert.match(item.redactedSummary, /caseType=/);
}
await writeFile(resolve('evidence/controlled-operator-review-queue-items-v0.23.1.out.json'), JSON.stringify(queue, null, 2) + '\n');
console.log(queue.reportMarkdown);
