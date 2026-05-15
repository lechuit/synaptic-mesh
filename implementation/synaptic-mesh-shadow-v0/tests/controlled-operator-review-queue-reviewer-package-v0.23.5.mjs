import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const queue = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard());
assert.equal(queue.artifact, 'T-synaptic-mesh-controlled-operator-review-queue-v0.23.5');
assert.equal(queue.releaseLayer, 'v0.23.5');
assert.equal(queue.queueStatus, 'READY_FOR_OPERATOR_REVIEW');
assert.equal(queue.queueItems.length, 3);
assert.equal(queue.reviewBurden.qualitative, 'low');
assert.equal(queue.reviewBurden.estimatedMinutes, 21);
assert.equal(queue.reportMarkdown.includes('Controlled Operator Review Queue v0.23.5'), true);
assert.equal(queue.reportMarkdown.includes('not a decision queue'), true);
await writeFile(resolve('evidence/controlled-operator-review-queue-reviewer-package-v0.23.5.out.json'), JSON.stringify(queue, null, 2) + '\n');
await writeFile(resolve('evidence/controlled-operator-review-queue-report-v0.23.5.out.md'), queue.reportMarkdown);
console.log(queue.reportMarkdown);
