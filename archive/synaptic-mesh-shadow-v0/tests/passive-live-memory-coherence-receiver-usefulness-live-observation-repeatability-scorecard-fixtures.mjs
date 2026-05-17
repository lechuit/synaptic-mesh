import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverUsefulnessLiveObservationRepeatabilitySourcePathV045 = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json';
export const receiverUsefulnessLiveObservationRepeatabilitySourceArtifactV045 = JSON.parse(readFileSync(receiverUsefulnessLiveObservationRepeatabilitySourcePathV045, 'utf8'));
export const receiverUsefulnessLiveObservationRepeatabilitySourceSha256V045 = createHash('sha256').update(readFileSync(receiverUsefulnessLiveObservationRepeatabilitySourcePathV045, 'utf8')).digest('hex');

export function receiverUsefulnessLiveObservationRepeatabilityInputV045(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(receiverUsefulnessLiveObservationRepeatabilitySourceArtifactV045)),
    sourceArtifactPath: receiverUsefulnessLiveObservationRepeatabilitySourcePathV045,
    sourceArtifactSha256: receiverUsefulnessLiveObservationRepeatabilitySourceSha256V045,
    ...overrides,
  };
}
