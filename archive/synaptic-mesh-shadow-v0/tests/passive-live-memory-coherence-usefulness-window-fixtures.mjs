import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalRepeatabilityArtifactPath = path.join(packageRoot, 'evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json');
export function canonicalInput(){
  const raw = readFileSync(canonicalRepeatabilityArtifactPath, 'utf8');
  return { repeatabilityArtifact: JSON.parse(raw), repeatabilityArtifactPath: 'evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json', repeatabilityArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
