import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalObservationArtifactPath = path.join(packageRoot, 'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json');
export function canonicalObservationArtifact(){ return JSON.parse(readFileSync(canonicalObservationArtifactPath, 'utf8')); }
export function canonicalInput(){
  const raw = readFileSync(canonicalObservationArtifactPath, 'utf8');
  return { observationArtifact: JSON.parse(raw), observationArtifactPath: 'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json', observationArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
