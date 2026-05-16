import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveContextAssemblyRehearsalScorecardScripts = Object.freeze([
  'test:passive-context-assembly-rehearsal-scorecard-protocol',
  'test:passive-context-assembly-rehearsal-scorecard-assembly',
  'test:passive-context-assembly-rehearsal-scorecard-metrics',
  'test:passive-context-assembly-rehearsal-scorecard-negative-controls',
  'test:passive-context-assembly-rehearsal-scorecard-output-boundary',
  'test:passive-context-assembly-rehearsal-scorecard-reviewer-package'
]);
export const passiveContextAssemblyRehearsalScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-context-assembly-rehearsal-scorecard.mjs',
  'docs/passive-context-assembly-rehearsal-scorecard-protocol-v0.32.0-alpha.md','docs/passive-context-assembly-rehearsal-scorecard-assembly-v0.32.1.md','docs/passive-context-assembly-rehearsal-scorecard-metrics-v0.32.2.md','docs/passive-context-assembly-rehearsal-scorecard-negative-controls-v0.32.3.md','docs/passive-context-assembly-rehearsal-scorecard-output-boundary-v0.32.4.md','docs/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.md','docs/passive-context-assembly-rehearsal-scorecard-local-review-notes-v0.32.5.md',
  'docs/status-v0.32.0-alpha.md','docs/status-v0.32.1.md','docs/status-v0.32.2.md','docs/status-v0.32.3.md','docs/status-v0.32.4.md','docs/status-v0.32.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-context-assembly-rehearsal-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-context-assembly-rehearsal-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-protocol-v0.32.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-assembly-v0.32.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-metrics-v0.32.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-negative-controls-v0.32.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-output-boundary-v0.32.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-protocol-v0.32.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-assembly-v0.32.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-metrics-v0.32.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-negative-controls-v0.32.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-output-boundary-v0.32.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-report-v0.32.5.out.md'
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveContextAssemblyRehearsalScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.32.5') return;
  all(manifest.reproducibility, ['v0.32.5','passive_context_assembly_rehearsal_scorecard','PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE','assemblyItemCount_4','includeForHumanContextCount_2','conflictReviewCount_1','staleCautionCount_1','sourceBoundAssemblyRatio_1','minimalContextRatio_1','noiseSuppressionRatio_1','humanReviewOnlyRatio_1','noPromotionWithoutHumanRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.32.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_conflict_scorecard_only','human_context_assembly_rehearsal_only','minimal_context_package','conflict_review_flagged','stale_caution_preserved','noise_suppressed','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveContextAssemblyRehearsalScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.32.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json'));
  assert(phase?.assemblyStatus === 'PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE', 'v0.32.5 context assembly rehearsal must complete');
  assert(phase?.metrics?.assemblyItemCount === 4, 'v0.32.5 must include four assembly items');
  assert(phase?.metrics?.includeForHumanContextCount === 2, 'v0.32.5 must include two core context items');
  assert(phase?.metrics?.conflictReviewCount === 1, 'v0.32.5 must flag one conflict');
  assert(phase?.metrics?.staleCautionCount === 1, 'v0.32.5 must preserve one stale caution');
  assert(phase?.metrics?.sourceBoundAssemblyRatio === 1, 'v0.32.5 source-bound assembly ratio must be pinned');
  assert(phase?.metrics?.minimalContextRatio === 1, 'v0.32.5 minimal context ratio must be pinned');
  assert(phase?.metrics?.noiseSuppressionRatio === 1, 'v0.32.5 noise suppression ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRatio === 1, 'v0.32.5 human review ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.32.5 must not promote memory without human review');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.32.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.32.5 policyDecision must be null');
  assert((phase?.assemblyItems ?? []).every((item) => item.promoteToMemory === false && item.precedenceSuggestionIsAuthority === false), 'v0.32.5 assembly items must remain non-authoritative and not promote memory');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-context-assembly-rehearsal-scorecard-negative-controls-v0.32.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 25, 'v0.32.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-context-assembly-rehearsal-scorecard-report-v0.32.5.out.md'), 'utf8');
  all(report, ['Passive Context Assembly Rehearsal Scorecard v0.32.5','PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE','assemblyItemCount=4','includeForHumanContextCount=2','conflictReviewCount=1','staleCautionCount=1','sourceBoundAssemblyRatio=1','minimalContextRatio=1','noiseSuppressionRatio=1','humanReviewOnlyRatio=1','noPromotionWithoutHumanRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'context assembly report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive context assembly rehearsal scorecard','assemblyStatus: PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE','assemblyItemCount: 4','includeForHumanContextCount: 2','conflictReviewCount: 1','staleCautionCount: 1','sourceBoundAssemblyRatio: 1','minimalContextRatio: 1','noiseSuppressionRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive context assembly rehearsal scorecard','assemblyStatus: PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE','assemblyItemCount: 4','includeForHumanContextCount: 2','conflictReviewCount: 1','staleCautionCount: 1','sourceBoundAssemblyRatio: 1','minimalContextRatio: 1','noiseSuppressionRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveContextAssemblyRehearsalScorecardSuite = Object.freeze({ name:'passive-context-assembly-rehearsal-scorecard', gatePhase:'post-real-redacted', gateScripts:passiveContextAssemblyRehearsalScorecardScripts, requiredManifestPaths:passiveContextAssemblyRehearsalScorecardRequiredManifestPaths, assertManifestMetadata:assertPassiveContextAssemblyRehearsalScorecardManifestMetadata, assertRelease:assertPassiveContextAssemblyRehearsalScorecardRelease });
