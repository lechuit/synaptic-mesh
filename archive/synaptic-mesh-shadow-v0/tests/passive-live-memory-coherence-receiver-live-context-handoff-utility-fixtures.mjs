import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverLiveContextHandoffUtilitySourcePathV046 = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json';
export const receiverLiveContextHandoffUtilitySourceArtifactV046 = JSON.parse(readFileSync(receiverLiveContextHandoffUtilitySourcePathV046, 'utf8'));
export const receiverLiveContextHandoffUtilitySourceSha256V046 = createHash('sha256').update(readFileSync(receiverLiveContextHandoffUtilitySourcePathV046, 'utf8')).digest('hex');

export function receiverLiveContextHandoffUtilityInputV046(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverLiveContextHandoffUtilitySourceArtifactV046)),
    sourceArtifactPath: receiverLiveContextHandoffUtilitySourcePathV046,
    sourceArtifactSha256: receiverLiveContextHandoffUtilitySourceSha256V046,
    ...overrides,
  };
}
