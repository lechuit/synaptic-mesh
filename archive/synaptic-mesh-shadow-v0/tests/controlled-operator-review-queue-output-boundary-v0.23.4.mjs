import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const queue = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard());
assert.equal(queue.capabilityTokenViolations.length, 0);
assert.equal(queue.machineReadablePolicyDecision, false);
assert.equal(queue.agentConsumedOutput, false);
assert.equal(queue.rawPersisted, false);
assert.equal(queue.rawOutput, false);
assert.equal(queue.reportMarkdown.includes('READY_FOR_OPERATOR_REVIEW'), true);
assert.equal(queue.reportMarkdown.includes('not authority'), true);
for (const item of queue.queueItems) {
  assert.equal(item.queueStatus.includes('ALLOW'), false);
  assert.equal(item.queueStatus.includes('APPROVE'), false);
  assert.equal(item.queueStatus.includes('BLOCK'), false);
  assert.equal(item.redactedSummary.includes('raw'), false);
}
await writeFile(resolve('evidence/controlled-operator-review-queue-output-boundary-v0.23.4.out.json'), JSON.stringify({ ok: true, queueStatus: queue.queueStatus, capabilityTokenViolations: queue.capabilityTokenViolations }, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, queueStatus: queue.queueStatus }, null, 2));
