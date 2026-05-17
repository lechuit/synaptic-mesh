import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function clone(value){ return JSON.parse(JSON.stringify(value)); }

export function canonicalInput(){
  const path = 'evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json';
  const raw = readFileSync(path, 'utf8');
  return {
    usefulnessArtifact: JSON.parse(raw),
    usefulnessArtifactPath: path,
    usefulnessArtifactSha256: createHash('sha256').update(raw).digest('hex'),
  };
}
