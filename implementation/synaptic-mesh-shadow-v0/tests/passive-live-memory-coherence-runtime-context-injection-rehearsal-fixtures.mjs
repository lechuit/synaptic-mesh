import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const runtimeContextInjectionRehearsalSourcePathV049 = 'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json';
export const runtimeContextInjectionRehearsalSourceReportPathV049 = 'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md';
export const runtimeContextInjectionRehearsalSourceArtifactV049 = JSON.parse(readFileSync(runtimeContextInjectionRehearsalSourcePathV049, 'utf8'));
export const runtimeContextInjectionRehearsalSourceReportV049 = readFileSync(runtimeContextInjectionRehearsalSourceReportPathV049, 'utf8');
export const runtimeContextInjectionRehearsalSourceSha256V049 = createHash('sha256').update(readFileSync(runtimeContextInjectionRehearsalSourcePathV049, 'utf8')).digest('hex');
export const runtimeContextInjectionRehearsalSourceReportSha256V049 = createHash('sha256').update(runtimeContextInjectionRehearsalSourceReportV049).digest('hex');

export function runtimeContextInjectionRehearsalInputV049(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(runtimeContextInjectionRehearsalSourceArtifactV049)),
    sourceArtifactPath: runtimeContextInjectionRehearsalSourcePathV049,
    sourceArtifactSha256: runtimeContextInjectionRehearsalSourceSha256V049,
    sourceReport: runtimeContextInjectionRehearsalSourceReportV049,
    sourceReportPath: runtimeContextInjectionRehearsalSourceReportPathV049,
    sourceReportSha256: runtimeContextInjectionRehearsalSourceReportSha256V049,
    ...overrides,
  };
}
