import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

export async function observedUsefulnessNoiseCases() {
  const validPacket = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 4 }));
  const validPacket2 = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-b.md', 'positive-utility-samples/source-c.md'], recordsPerSource: 2, totalRecords: 4 }));
  const failingSourcePacket = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/missing.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 6 }));

  const noisyPrivatePacket = structuredClone(validPacket);
  noisyPrivatePacket.redactedRecords[0].privatePatternDetected = true;
  const malformedBoundsPacket = structuredClone(validPacket);
  malformedBoundsPacket.summary.recordsPerSourceLimit = 99;
  const forbiddenAliasPacket = structuredClone(validPacket);
  forbiddenAliasPacket.summary.networkFetch = true;
  const insufficientPacket = structuredClone(validPacket);
  insufficientPacket.summary.recordsRead = 1;
  insufficientPacket.redactedRecords = insufficientPacket.redactedRecords.slice(0, 1);
  insufficientPacket.reportMarkdown = insufficientPacket.reportMarkdown.replace(/Records read: 4/, 'Records read: 1');
  const forbiddenClassificationPacket = structuredClone(validPacket);
  forbiddenClassificationPacket.classification = 'ALLOW_AND_APPROVE';

  return [
    { id: 'useful-valid-pass-a', label: 'useful valid pass', caseType: 'useful_valid_pass', expectedUsefulness: true, expectedNoise: false, output: evaluatePositiveUtilityPassGate(validPacket) },
    { id: 'useful-valid-pass-b', label: 'second useful valid pass', caseType: 'useful_valid_pass', expectedUsefulness: true, expectedNoise: false, output: evaluatePositiveUtilityPassGate(validPacket2) },
    { id: 'source-failure-allowed-explicit-threshold', label: 'source failure allowed only with explicit threshold', caseType: 'useful_source_failure_allowed_with_explicit_threshold', expectedUsefulness: true, expectedNoise: false, output: evaluatePositiveUtilityPassGate(failingSourcePacket, { maxIsolatedSourceFailures: 1 }) },
    { id: 'noisy-private-reject', label: 'noisy private-pattern reject', caseType: 'noisy_safe_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(noisyPrivatePacket) },
    { id: 'source-failure-default-reject', label: 'source failure reject by default', caseType: 'source_failure_reject_default', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(failingSourcePacket) },
    { id: 'malformed-bounds-reject', label: 'malformed bounds reject', caseType: 'malformed_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(malformedBoundsPacket) },
    { id: 'forbidden-alias-reject', label: 'forbidden alias reject', caseType: 'forbidden_alias_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(forbiddenAliasPacket) },
    { id: 'borderline-insufficient-records-reject', label: 'borderline insufficient records reject', caseType: 'borderline_insufficient_records_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(insufficientPacket) },
    { id: 'forbidden-authority-classification-reject', label: 'forbidden authority classification token reject', caseType: 'malformed_forbidden_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(forbiddenClassificationPacket) }
  ];
}
