import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveHardCaseOutcomeValueScorecardScripts = Object.freeze([
  'test:passive-hard-case-outcome-value-scorecard-protocol',
  'test:passive-hard-case-outcome-value-scorecard-outcomes',
  'test:passive-hard-case-outcome-value-scorecard-metrics',
  'test:passive-hard-case-outcome-value-scorecard-negative-controls',
  'test:passive-hard-case-outcome-value-scorecard-output-boundary',
  'test:passive-hard-case-outcome-value-scorecard-reviewer-package',
]);
export const passiveHardCaseOutcomeValueScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-hard-case-outcome-value-scorecard.mjs',
  'docs/passive-hard-case-outcome-value-scorecard-protocol-v0.34.0-alpha.md','docs/passive-hard-case-outcome-value-scorecard-outcomes-v0.34.1.md','docs/passive-hard-case-outcome-value-scorecard-metrics-v0.34.2.md','docs/passive-hard-case-outcome-value-scorecard-negative-controls-v0.34.3.md','docs/passive-hard-case-outcome-value-scorecard-output-boundary-v0.34.4.md','docs/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.md','docs/passive-hard-case-outcome-value-scorecard-local-review-notes-v0.34.5.md',
  'docs/status-v0.34.0-alpha.md','docs/status-v0.34.1.md','docs/status-v0.34.2.md','docs/status-v0.34.3.md','docs/status-v0.34.4.md','docs/status-v0.34.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-hard-case-outcome-value-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-hard-case-outcome-value-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-protocol-v0.34.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-outcomes-v0.34.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-metrics-v0.34.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-negative-controls-v0.34.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-output-boundary-v0.34.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-protocol-v0.34.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-outcomes-v0.34.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-metrics-v0.34.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-negative-controls-v0.34.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-output-boundary-v0.34.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-report-v0.34.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveHardCaseOutcomeValueScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.34.5') return;
  all(manifest.reproducibility, ['v0.34.5','passive_hard_case_outcome_value_scorecard','PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE','outcomeCount_5','usefulOutcomeCount_3','noiseOutcomeCount_1','evidenceGapOutcomeCount_1','usefulOutcomeRatio_0.6','noiseOutcomeRatio_0.2','evidenceGapRatio_0.2','sourceBoundOutcomeRatio_1','humanReviewOnlyRatio_1','minimalContextRatio_1','noPromotionWithoutHumanRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.34.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_hard_case_artifact_only','receiver_outcome_value_scorecard_only','usefulness_noise_evidence_gap_measurement','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveHardCaseOutcomeValueScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.34.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json'));
  assert(phase?.outcomeValueStatus === 'PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE', 'v0.34.5 outcome value scorecard must complete');
  assert(phase?.metrics?.outcomeCount === 5, 'v0.34.5 must include five receiver outcomes');
  assert(phase?.metrics?.usefulOutcomeCount === 3, 'v0.34.5 useful outcome count must be pinned');
  assert(phase?.metrics?.noiseOutcomeCount === 1, 'v0.34.5 noise outcome count must be pinned');
  assert(phase?.metrics?.evidenceGapOutcomeCount === 1, 'v0.34.5 evidence gap outcome count must be pinned');
  assert(phase?.metrics?.usefulOutcomeRatio === 0.6, 'v0.34.5 useful ratio must be pinned');
  assert(phase?.metrics?.noiseOutcomeRatio === 0.2, 'v0.34.5 noise ratio must be pinned');
  assert(phase?.metrics?.evidenceGapRatio === 0.2, 'v0.34.5 evidence gap ratio must be pinned');
  assert(phase?.metrics?.sourceBoundOutcomeRatio === 1, 'v0.34.5 source-bound outcome ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRatio === 1, 'v0.34.5 human review ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.34.5 must not promote memory without human review');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.34.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.34.5 policyDecision must be null');
  assert((phase?.outcomeItems ?? []).every((item) => item.promoteToMemory === false && item.agentConsumedOutput === false), 'v0.34.5 outcome items must not promote memory or be agent-consumed');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-hard-case-outcome-value-scorecard-negative-controls-v0.34.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 30, 'v0.34.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-hard-case-outcome-value-scorecard-report-v0.34.5.out.md'), 'utf8');
  all(report, ['Passive Hard-Case Outcome Value Scorecard v0.34.5','PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE','outcomeCount=5','usefulOutcomeCount=3','noiseOutcomeCount=1','evidenceGapOutcomeCount=1','usefulOutcomeRatio=0.6','noiseOutcomeRatio=0.2','evidenceGapRatio=0.2','sourceBoundOutcomeRatio=1','humanReviewOnlyRatio=1','noPromotionWithoutHumanRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'outcome value report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive hard-case outcome value scorecard','outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE','outcomeCount: 5','usefulOutcomeCount: 3','noiseOutcomeCount: 1','evidenceGapOutcomeCount: 1','usefulOutcomeRatio: 0.6','noiseOutcomeRatio: 0.2','evidenceGapRatio: 0.2','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive hard-case outcome value scorecard','outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE','outcomeCount: 5','usefulOutcomeCount: 3','noiseOutcomeCount: 1','evidenceGapOutcomeCount: 1','usefulOutcomeRatio: 0.6','noiseOutcomeRatio: 0.2','evidenceGapRatio: 0.2','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveHardCaseOutcomeValueScorecardSuite = Object.freeze({ name:'passive-hard-case-outcome-value-scorecard', gatePhase:'post-real-redacted', gateScripts:passiveHardCaseOutcomeValueScorecardScripts, requiredManifestPaths:passiveHardCaseOutcomeValueScorecardRequiredManifestPaths, assertManifestMetadata:assertPassiveHardCaseOutcomeValueScorecardManifestMetadata, assertRelease:assertPassiveHardCaseOutcomeValueScorecardRelease });
