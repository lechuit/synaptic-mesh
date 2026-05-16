import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverLiveContextHandoffUtilityRepeatabilitySourcePathV047 = 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json';
export const receiverLiveContextHandoffUtilityRepeatabilitySourceArtifactV047 = JSON.parse(readFileSync(receiverLiveContextHandoffUtilityRepeatabilitySourcePathV047, 'utf8'));
export const receiverLiveContextHandoffUtilityRepeatabilitySourceSha256V047 = createHash('sha256').update(readFileSync(receiverLiveContextHandoffUtilityRepeatabilitySourcePathV047, 'utf8')).digest('hex');

export function receiverLiveContextHandoffUtilityRepeatabilityInputV047(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverLiveContextHandoffUtilityRepeatabilitySourceArtifactV047)),
    sourceArtifactPath: receiverLiveContextHandoffUtilityRepeatabilitySourcePathV047,
    sourceArtifactSha256: receiverLiveContextHandoffUtilityRepeatabilitySourceSha256V047,
    ...overrides,
  };
}
