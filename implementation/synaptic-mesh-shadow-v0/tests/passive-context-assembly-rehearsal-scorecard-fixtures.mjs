import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalConflictArtifactPath = path.join(packageRoot, 'evidence/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.out.json');
export function canonicalConflictArtifact(){ return JSON.parse(readFileSync(canonicalConflictArtifactPath, 'utf8')); }
export function canonicalInput(){ const raw = readFileSync(canonicalConflictArtifactPath, 'utf8'); return { conflictArtifact: JSON.parse(raw), conflictArtifactPath: 'evidence/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.out.json', conflictArtifactSha256: createHash('sha256').update(raw).digest('hex') }; }
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
