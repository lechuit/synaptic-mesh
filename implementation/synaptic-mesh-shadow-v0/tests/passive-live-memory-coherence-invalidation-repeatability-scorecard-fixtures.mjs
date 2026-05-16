import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function clone(value){ return JSON.parse(JSON.stringify(value)); }

export function canonicalInput(){
  const path = 'evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json';
  const raw = readFileSync(path, 'utf8');
  return {
    invalidationArtifact: JSON.parse(raw),
    invalidationArtifactPath: path,
    invalidationArtifactSha256: createHash('sha256').update(raw).digest('hex'),
  };
}
