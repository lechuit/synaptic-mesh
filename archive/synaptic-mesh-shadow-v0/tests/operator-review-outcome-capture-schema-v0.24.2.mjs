import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildOperatorReviewOutcomeCapture } from '../src/operator-review-outcome-capture.mjs';
import { operatorReviewQueueFixture, operatorOutcomesFixture } from './operator-review-outcome-capture-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const queue = await operatorReviewQueueFixture();
const outcomes = await operatorOutcomesFixture();
const malformedQueue = buildOperatorReviewOutcomeCapture({ ...queue, schemaVersion: 'wrong' }, outcomes);
assert.equal(malformedQueue.captureStatus, 'DEGRADED_NO_OUTCOME_CAPTURE');
assert.equal(malformedQueue.validationIssues.includes('queue.schema_version_not_v0.23'), true);
const malformedOutcomes = buildOperatorReviewOutcomeCapture(queue, { ...outcomes, schemaVersion: 'wrong' });
assert.equal(malformedOutcomes.captureStatus, 'DEGRADED_NO_OUTCOME_CAPTURE');
assert.equal(malformedOutcomes.validationIssues.includes('outcomes.schema_version_invalid'), true);
const invalidBounds = buildOperatorReviewOutcomeCapture({ ...queue, queueItems: [...queue.queueItems, { ...queue.queueItems[0], queueItemId: 'extra' }] }, outcomes);
assert.equal(invalidBounds.validationIssues.includes('queue.item_count_out_of_bounds'), true);
await writeFile(resolve('evidence/operator-review-outcome-capture-schema-v0.24.2.out.json'), JSON.stringify({ rejectedMalformedQueue: malformedQueue.validationIssues, rejectedMalformedOutcomes: malformedOutcomes.validationIssues, rejectedInvalidBounds: invalidBounds.validationIssues }, null, 2) + '\n');
console.log(JSON.stringify({ schemaValidation: 'ok' }, null, 2));
