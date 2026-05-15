import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { scoreObservedUsefulnessNoise } from '../src/observed-usefulness-noise-scorecard.mjs';
import { evaluatePositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';

export const passiveObservationWindowSources = Object.freeze([
  'positive-utility-samples/source-a.md',
  'positive-utility-samples/source-b.md'
]);

export async function passiveObservationWindowQueue() {
  const packet = JSON.parse(await runBoundedMultisourceShadowRead({ sources: passiveObservationWindowSources, recordsPerSource: 2, totalRecords: 4 }));
  const privatePacket = structuredClone(packet);
  privatePacket.redactedRecords[0].privatePatternDetected = true;
  const boundsPacket = structuredClone(packet);
  boundsPacket.summary.recordsPerSourceLimit = 99;
  const capabilityPacket = structuredClone(packet);
  capabilityPacket.summary.networkFetch = true;
  const insufficientPacket = structuredClone(packet);
  insufficientPacket.summary.recordsRead = 1;
  insufficientPacket.redactedRecords = insufficientPacket.redactedRecords.slice(0, 1);
  const scorecard = scoreObservedUsefulnessNoise([
    { id: 'window-useful-pass', caseType: 'useful_valid_pass', expectedUsefulness: true, expectedNoise: false, output: evaluatePositiveUtilityPassGate(packet) },
    { id: 'window-noisy-private-reject', caseType: 'noisy_safe_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(privatePacket) },
    { id: 'window-malformed-bounds-reject', caseType: 'malformed_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(boundsPacket) },
    { id: 'window-forbidden-capability-reject', caseType: 'forbidden_alias_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(capabilityPacket) },
    { id: 'window-insufficient-records-reject', caseType: 'borderline_insufficient_records_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(insufficientPacket) }
  ]);
  return buildControlledOperatorReviewQueue(scorecard);
}

export async function passiveObservationWindowOutcomes(labels = ['USEFUL_FOR_REVIEW']) {
  const queue = await passiveObservationWindowQueue();
  return {
    schemaVersion: 'operator-review-outcomes-v0.24.0-alpha',
    localFixtureOnly: true,
    manualLocalInputOnly: true,
    nonAuthoritative: true,
    humanReadableOnly: true,
    policyDecision: null,
    outcomes: queue.queueItems.map((item, index) => ({
      queueItemId: item.queueItemId,
      outcomeLabel: labels[index] ?? 'USEFUL_FOR_REVIEW',
      operatorNote: 'Local fixture/manual observation note for human review signal only.',
      reasonCodes: ['CLEAR_VALUE']
    }))
  };
}

export async function passiveObservationWindowInput(overrides = {}) {
  return {
    sources: [...passiveObservationWindowSources],
    recordsPerSource: 2,
    totalRecords: 4,
    outcomes: await passiveObservationWindowOutcomes(),
    ...overrides
  };
}
