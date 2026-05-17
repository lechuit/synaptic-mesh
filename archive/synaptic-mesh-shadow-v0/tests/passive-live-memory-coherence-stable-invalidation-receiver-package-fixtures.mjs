import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const repeatabilityArtifactPathV041 = 'evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json';
export const repeatabilityArtifactV041 = JSON.parse(readFileSync(repeatabilityArtifactPathV041, 'utf8'));
export const repeatabilityArtifactSha256V041 = createHash('sha256').update(readFileSync(repeatabilityArtifactPathV041, 'utf8')).digest('hex');

export function stableInvalidationReceiverPackageInputV041(overrides = {}){
  return {
    repeatabilityArtifact: JSON.parse(JSON.stringify(repeatabilityArtifactV041)),
    repeatabilityArtifactPath: repeatabilityArtifactPathV041,
    repeatabilityArtifactSha256: repeatabilityArtifactSha256V041,
    ...overrides,
  };
}
