import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverRuntimeTestHarnessConsumptionRehearsalSourcePathV050 = 'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json';
export const receiverRuntimeTestHarnessConsumptionRehearsalSourceReportPathV050 = 'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md';
export const receiverRuntimeTestHarnessConsumptionRehearsalSourceArtifactV050 = JSON.parse(readFileSync(receiverRuntimeTestHarnessConsumptionRehearsalSourcePathV050, 'utf8'));
export const receiverRuntimeTestHarnessConsumptionRehearsalSourceReportV050 = readFileSync(receiverRuntimeTestHarnessConsumptionRehearsalSourceReportPathV050, 'utf8');
export const receiverRuntimeTestHarnessConsumptionRehearsalSourceSha256V050 = createHash('sha256').update(readFileSync(receiverRuntimeTestHarnessConsumptionRehearsalSourcePathV050, 'utf8')).digest('hex');
export const receiverRuntimeTestHarnessConsumptionRehearsalSourceReportSha256V050 = createHash('sha256').update(receiverRuntimeTestHarnessConsumptionRehearsalSourceReportV050).digest('hex');

export function receiverRuntimeTestHarnessConsumptionRehearsalInputV050(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverRuntimeTestHarnessConsumptionRehearsalSourceArtifactV050)),
    sourceArtifactPath: receiverRuntimeTestHarnessConsumptionRehearsalSourcePathV050,
    sourceArtifactSha256: receiverRuntimeTestHarnessConsumptionRehearsalSourceSha256V050,
    sourceReport: receiverRuntimeTestHarnessConsumptionRehearsalSourceReportV050,
    sourceReportPath: receiverRuntimeTestHarnessConsumptionRehearsalSourceReportPathV050,
    sourceReportSha256: receiverRuntimeTestHarnessConsumptionRehearsalSourceReportSha256V050,
    ...overrides,
  };
}
