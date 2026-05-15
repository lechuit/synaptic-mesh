import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

export async function operatorReviewQueueFixture(overrides = {}) {
  const queue = buildControlledOperatorReviewQueue(await controlledOperatorReviewQueueScorecard());
  return { ...queue, ...overrides };
}

export async function operatorOutcomesFixture(overrides = {}) {
  const queue = await operatorReviewQueueFixture();
  const labels = ['USEFUL_FOR_REVIEW', 'NOT_USEFUL_NOISE', 'NEEDS_MORE_EVIDENCE'];
  return {
    schemaVersion: 'operator-review-outcomes-v0.24.0-alpha',
    nonAuthoritative: true,
    humanReadableOnly: true,
    valueFeedbackOnly: true,
    policyDecision: null,
    authorization: false,
    enforcement: false,
    approvalBlockAllow: false,
    toolExecution: false,
    memoryConfigWrite: false,
    networkResourceFetch: false,
    externalEffects: false,
    rawPersisted: false,
    rawOutput: false,
    agentConsumedOutput: false,
    machineReadablePolicyDecision: false,
    runtimeAuthority: false,
    outcomes: queue.queueItems.map((item, index) => ({
      queueItemId: item.queueItemId,
      outcomeLabel: labels[index] ?? 'ABSTAIN_OPERATOR_UNCERTAIN',
      operatorNote: index === 0 ? 'Helpful for reviewer triage. Contact me at person@example.com.' : index === 1 ? 'Too noisy for this pass.' : 'Need another source before value judgment.',
      reasonCodes: index === 0 ? ['clear_summary'] : index === 1 ? ['low_signal'] : ['source_gap']
    })),
    ...overrides
  };
}
