import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverUsefulnessRepeatabilitySourcePathV043 = 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json';
export const receiverUsefulnessRepeatabilitySourceArtifactV043 = JSON.parse(readFileSync(receiverUsefulnessRepeatabilitySourcePathV043, 'utf8'));
export const receiverUsefulnessRepeatabilitySourceSha256V043 = createHash('sha256').update(readFileSync(receiverUsefulnessRepeatabilitySourcePathV043, 'utf8')).digest('hex');

export function receiverUsefulnessRepeatabilityInputV043(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverUsefulnessRepeatabilitySourceArtifactV043)),
    sourceArtifactPath: receiverUsefulnessRepeatabilitySourcePathV043,
    sourceArtifactSha256: receiverUsefulnessRepeatabilitySourceSha256V043,
    ...overrides,
  };
}
