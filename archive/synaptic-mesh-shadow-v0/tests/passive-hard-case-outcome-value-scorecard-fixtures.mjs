import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { canonicalReceiverOutcomes } from '../src/passive-hard-case-outcome-value-scorecard.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalHardCaseArtifactPath = path.join(packageRoot, 'evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json');
export function canonicalHardCaseArtifact(){ return JSON.parse(readFileSync(canonicalHardCaseArtifactPath, 'utf8')); }
export function canonicalInput(){ const raw = readFileSync(canonicalHardCaseArtifactPath, 'utf8'); return { hardCaseArtifact: JSON.parse(raw), hardCaseArtifactPath: 'evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json', hardCaseArtifactSha256: createHash('sha256').update(raw).digest('hex'), receiverOutcomes: canonicalReceiverOutcomes() }; }
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
