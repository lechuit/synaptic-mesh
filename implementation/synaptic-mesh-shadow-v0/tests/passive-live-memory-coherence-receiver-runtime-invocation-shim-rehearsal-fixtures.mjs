import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverRuntimeInvocationShimRehearsalSourcePathV051 = 'evidence/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-reviewer-package-v0.50.5.out.json';
export const receiverRuntimeInvocationShimRehearsalSourceReportPathV051 = 'evidence/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-report-v0.50.5.out.md';
export const receiverRuntimeInvocationShimRehearsalSourceArtifactV051 = JSON.parse(readFileSync(receiverRuntimeInvocationShimRehearsalSourcePathV051, 'utf8'));
export const receiverRuntimeInvocationShimRehearsalSourceReportV051 = readFileSync(receiverRuntimeInvocationShimRehearsalSourceReportPathV051, 'utf8');
export const receiverRuntimeInvocationShimRehearsalSourceSha256V051 = createHash('sha256').update(readFileSync(receiverRuntimeInvocationShimRehearsalSourcePathV051, 'utf8')).digest('hex');
export const receiverRuntimeInvocationShimRehearsalSourceReportSha256V051 = createHash('sha256').update(receiverRuntimeInvocationShimRehearsalSourceReportV051).digest('hex');

export function receiverRuntimeInvocationShimRehearsalInputV051(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverRuntimeInvocationShimRehearsalSourceArtifactV051)),
    sourceArtifactPath: receiverRuntimeInvocationShimRehearsalSourcePathV051,
    sourceArtifactSha256: receiverRuntimeInvocationShimRehearsalSourceSha256V051,
    sourceReport: receiverRuntimeInvocationShimRehearsalSourceReportV051,
    sourceReportPath: receiverRuntimeInvocationShimRehearsalSourceReportPathV051,
    sourceReportSha256: receiverRuntimeInvocationShimRehearsalSourceReportSha256V051,
    ...overrides,
  };
}
