import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const runtimeContextInjectionDryRunSourcePathV048 = 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json';
export const runtimeContextInjectionDryRunSourceArtifactV048 = JSON.parse(readFileSync(runtimeContextInjectionDryRunSourcePathV048, 'utf8'));
export const runtimeContextInjectionDryRunSourceSha256V048 = createHash('sha256').update(readFileSync(runtimeContextInjectionDryRunSourcePathV048, 'utf8')).digest('hex');

export function runtimeContextInjectionDryRunInputV048(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(runtimeContextInjectionDryRunSourceArtifactV048)),
    sourceArtifactPath: runtimeContextInjectionDryRunSourcePathV048,
    sourceArtifactSha256: runtimeContextInjectionDryRunSourceSha256V048,
    ...overrides,
  };
}
