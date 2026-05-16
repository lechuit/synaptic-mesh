import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const receiverPackageArtifactPathV042 = 'evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json';
export const receiverPackageArtifactV042 = JSON.parse(readFileSync(receiverPackageArtifactPathV042, 'utf8'));
export const receiverPackageArtifactSha256V042 = createHash('sha256').update(readFileSync(receiverPackageArtifactPathV042, 'utf8')).digest('hex');

export function receiverPackageUsefulnessRehearsalInputV042(overrides = {}){
  return {
    receiverPackageArtifact: JSON.parse(JSON.stringify(receiverPackageArtifactV042)),
    receiverPackageArtifactPath: receiverPackageArtifactPathV042,
    receiverPackageArtifactSha256: receiverPackageArtifactSha256V042,
    ...overrides,
  };
}
