import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { canonicalRepeatabilityRuns } from '../src/passive-hard-case-outcome-repeatability-scorecard.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalOutcomeValueArtifactPath = path.join(packageRoot, 'evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json');
export function canonicalOutcomeValueArtifact(){ return JSON.parse(readFileSync(canonicalOutcomeValueArtifactPath, 'utf8')); }
export function canonicalInput(){ const raw = readFileSync(canonicalOutcomeValueArtifactPath, 'utf8'); return { outcomeValueArtifact: JSON.parse(raw), outcomeValueArtifactPath: 'evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json', outcomeValueArtifactSha256: createHash('sha256').update(raw).digest('hex'), repeatabilityRuns: canonicalRepeatabilityRuns() }; }
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
