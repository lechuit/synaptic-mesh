import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveSourceAuthorityConflictScorecardScripts = Object.freeze([
  'test:passive-source-authority-conflict-scorecard-protocol',
  'test:passive-source-authority-conflict-scorecard-conflicts',
  'test:passive-source-authority-conflict-scorecard-metrics',
  'test:passive-source-authority-conflict-scorecard-negative-controls',
  'test:passive-source-authority-conflict-scorecard-output-boundary',
  'test:passive-source-authority-conflict-scorecard-reviewer-package'
]);

export const passiveSourceAuthorityConflictScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-source-authority-conflict-scorecard.mjs',
  'docs/passive-source-authority-conflict-scorecard-protocol-v0.31.0-alpha.md',
  'docs/passive-source-authority-conflict-scorecard-conflicts-v0.31.1.md',
  'docs/passive-source-authority-conflict-scorecard-metrics-v0.31.2.md',
  'docs/passive-source-authority-conflict-scorecard-negative-controls-v0.31.3.md',
  'docs/passive-source-authority-conflict-scorecard-output-boundary-v0.31.4.md',
  'docs/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.md',
  'docs/passive-source-authority-conflict-scorecard-local-review-notes-v0.31.5.md',
  'docs/status-v0.31.0-alpha.md','docs/status-v0.31.1.md','docs/status-v0.31.2.md','docs/status-v0.31.3.md','docs/status-v0.31.4.md','docs/status-v0.31.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-source-authority-conflict-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-source-authority-conflict-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-protocol-v0.31.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-conflicts-v0.31.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-metrics-v0.31.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-negative-controls-v0.31.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-output-boundary-v0.31.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-protocol-v0.31.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-conflicts-v0.31.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-metrics-v0.31.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-negative-controls-v0.31.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-output-boundary-v0.31.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-source-authority-conflict-scorecard-report-v0.31.5.out.md'
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveSourceAuthorityConflictScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.31.5') return;
  all(manifest.reproducibility, ['v0.31.5','passive_source_authority_conflict_scorecard','PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE','conflictCaseCount_4','sourceBoundConflictRatio_1','authorityConflictSurfacedRatio_1','newerSourcePreferredRatio_1','contradictionConflictSurfacedRatio_1','staleInvalidationCautionRatio_1','humanReviewOnlyRatio_1','noPromotionWithoutHumanRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.31.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_receiver_artifact_only','human_conflict_scorecard_only','source_authority_conflicts','newer_source_precedence_suggested','contradiction_surfaced','stale_invalidation_caution','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveSourceAuthorityConflictScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.31.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-source-authority-conflict-scorecard-reviewer-package-v0.31.5.out.json'));
  assert(phase?.conflictStatus === 'PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE', 'v0.31.5 conflict scorecard must complete');
  assert(phase?.metrics?.conflictCaseCount === 4, 'v0.31.5 must include four conflict cases');
  assert(phase?.metrics?.sourceBoundConflictRatio === 1, 'v0.31.5 source-bound conflict ratio must be pinned');
  assert(phase?.metrics?.authorityConflictSurfacedRatio === 1, 'v0.31.5 authority conflict ratio must be pinned');
  assert(phase?.metrics?.newerSourcePreferredRatio === 1, 'v0.31.5 newer source preferred ratio must be pinned');
  assert(phase?.metrics?.contradictionConflictSurfacedRatio === 1, 'v0.31.5 contradiction conflict ratio must be pinned');
  assert(phase?.metrics?.staleInvalidationCautionRatio === 1, 'v0.31.5 stale invalidation ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRatio === 1, 'v0.31.5 human-review-only ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.31.5 must not promote memory without human review');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.31.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.31.5 policyDecision must be null');
  assert((phase?.conflictItems ?? []).every((item) => item.promoteToMemory === false && item.precedenceSuggestionIsAuthority === false), 'v0.31.5 conflict items must remain non-authoritative and not promote memory');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-source-authority-conflict-scorecard-negative-controls-v0.31.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 25, 'v0.31.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-source-authority-conflict-scorecard-report-v0.31.5.out.md'), 'utf8');
  all(report, ['Passive Source Authority Conflict Scorecard v0.31.5','PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE','conflictCaseCount=4','sourceBoundConflictRatio=1','authorityConflictSurfacedRatio=1','newerSourcePreferredRatio=1','contradictionConflictSurfacedRatio=1','staleInvalidationCautionRatio=1','humanReviewOnlyRatio=1','noPromotionWithoutHumanRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'conflict scorecard report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive source authority conflict scorecard','conflictStatus: PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE','conflictCaseCount: 4','sourceBoundConflictRatio: 1','authorityConflictSurfacedRatio: 1','newerSourcePreferredRatio: 1','contradictionConflictSurfacedRatio: 1','staleInvalidationCautionRatio: 1','humanReviewOnlyRatio: 1','noPromotionWithoutHumanRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive source authority conflict scorecard','conflictStatus: PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE','conflictCaseCount: 4','sourceBoundConflictRatio: 1','authorityConflictSurfacedRatio: 1','newerSourcePreferredRatio: 1','contradictionConflictSurfacedRatio: 1','staleInvalidationCautionRatio: 1','humanReviewOnlyRatio: 1','noPromotionWithoutHumanRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveSourceAuthorityConflictScorecardSuite = Object.freeze({ name:'passive-source-authority-conflict-scorecard', gatePhase:'post-real-redacted', gateScripts:passiveSourceAuthorityConflictScorecardScripts, requiredManifestPaths:passiveSourceAuthorityConflictScorecardRequiredManifestPaths, assertManifestMetadata:assertPassiveSourceAuthorityConflictScorecardManifestMetadata, assertRelease:assertPassiveSourceAuthorityConflictScorecardRelease });
