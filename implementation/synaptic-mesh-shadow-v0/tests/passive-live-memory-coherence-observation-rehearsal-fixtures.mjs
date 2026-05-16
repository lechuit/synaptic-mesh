import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
export const canonicalRepeatabilityArtifactPath = path.join(packageRoot, 'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json');
export const canonicalSourcePaths = ['docs/status-v0.35.5.md','docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md','docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md','docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md'];
function expectedAnchorPhrases(sourcePath){
  if(sourcePath === 'docs/status-v0.35.5.md') return ['Status v0.35.5','passive hard-case outcome repeatability','policyDecision null'];
  if(sourcePath === 'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md') return ['PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','stableHardCaseCount: 5','policyDecision: null'];
  if(sourcePath === 'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md') return ['stableHardCaseCount: 5','boundaryViolationCount: 0','agentConsumedOutputFalseRatio: 1'];
  return ['Status: approved by two independent local reviews','prevalidar ruta CLI normalizada antes de leer archivo local','No blockers found'];
}
function redactedExcerptFor(sourcePath){
  if(sourcePath === 'docs/status-v0.35.5.md') return 'current release v0.35.5; repeatability complete; policyDecision null; human-readable report only';
  if(sourcePath === 'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md') return 'reviewer package evidence repeats stable labels and zero boundary violations; no runtime authority';
  if(sourcePath === 'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md') return 'metrics evidence confirms stable hard cases and no agent-consumed output';
  return 'local reviews approved; future hardening caution is pre-check normalized CLI path before read';
}
export function canonicalRepeatabilityArtifact(){ return JSON.parse(readFileSync(canonicalRepeatabilityArtifactPath, 'utf8')); }
export function canonicalInput(){
  const raw = readFileSync(canonicalRepeatabilityArtifactPath, 'utf8');
  return {
    repeatabilityArtifact: JSON.parse(raw),
    repeatabilityArtifactPath: 'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json',
    repeatabilityArtifactSha256: createHash('sha256').update(raw).digest('hex'),
    sourcePacks: canonicalSourcePaths.map((sourcePath)=>{ const sourceRaw=readFileSync(path.join(repoRoot, sourcePath)); return { path: sourcePath, sha256: createHash('sha256').update(sourceRaw).digest('hex'), bytes: sourceRaw.length, redactedBeforePersist: true, rawPersisted: false, explicitSource: true, localOnly: true, readOnly: true, anchorPhrases: expectedAnchorPhrases(sourcePath), redactedExcerpt: redactedExcerptFor(sourcePath) }; }),
  };
}
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
