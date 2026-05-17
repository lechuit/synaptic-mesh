import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalAssemblyArtifactPath = path.join(packageRoot, 'evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json');
export function canonicalAssemblyArtifact(){ return JSON.parse(readFileSync(canonicalAssemblyArtifactPath, 'utf8')); }
export function canonicalInput(){ const raw = readFileSync(canonicalAssemblyArtifactPath, 'utf8'); return { contextAssemblyArtifact: JSON.parse(raw), contextAssemblyArtifactPath: 'evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json', contextAssemblyArtifactSha256: createHash('sha256').update(raw).digest('hex') }; }
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
