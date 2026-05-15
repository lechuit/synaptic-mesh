import { buildOperatorReviewOutcomeCapture } from '../src/operator-review-outcome-capture.mjs';
import { operatorReviewQueueFixture, operatorOutcomesFixture } from './operator-review-outcome-capture-fixtures.mjs';

export async function operatorOutcomeCaptureFixture(outcomeLabels = ['USEFUL_FOR_REVIEW', 'USEFUL_FOR_REVIEW', 'NOT_USEFUL_NOISE'], overrides = {}) {
  const queue = await operatorReviewQueueFixture();
  const outcomes = await operatorOutcomesFixture({
    outcomes: queue.queueItems.map((item, index) => ({
      queueItemId: item.queueItemId,
      outcomeLabel: outcomeLabels[index] ?? 'ABSTAIN_OPERATOR_UNCERTAIN',
      operatorNote: index === 0 ? 'Useful and redacted person@example.com.' : index === 1 ? 'Useful second sample.' : 'Noisy but bounded.',
      reasonCodes: index === 2 ? ['LOW_SIGNAL'] : ['CLEAR_VALUE']
    }))
  });
  return { ...buildOperatorReviewOutcomeCapture(queue, outcomes), ...overrides };
}
