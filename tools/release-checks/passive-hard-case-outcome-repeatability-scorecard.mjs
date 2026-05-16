import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveHardCaseOutcomeRepeatabilityScorecardScripts = Object.freeze([
  'test:passive-hard-case-outcome-repeatability-scorecard-protocol',
  'test:passive-hard-case-outcome-repeatability-scorecard-runs',
  'test:passive-hard-case-outcome-repeatability-scorecard-metrics',
  'test:passive-hard-case-outcome-repeatability-scorecard-negative-controls',
  'test:passive-hard-case-outcome-repeatability-scorecard-output-boundary',
  'test:passive-hard-case-outcome-repeatability-scorecard-reviewer-package',
]);
export const passiveHardCaseOutcomeRepeatabilityScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-hard-case-outcome-repeatability-scorecard.mjs',
  'docs/passive-hard-case-outcome-repeatability-scorecard-protocol-v0.35.0-alpha.md','docs/passive-hard-case-outcome-repeatability-scorecard-runs-v0.35.1.md','docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md','docs/passive-hard-case-outcome-repeatability-scorecard-negative-controls-v0.35.3.md','docs/passive-hard-case-outcome-repeatability-scorecard-output-boundary-v0.35.4.md','docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md','docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md',
  'docs/status-v0.35.0-alpha.md','docs/status-v0.35.1.md','docs/status-v0.35.2.md','docs/status-v0.35.3.md','docs/status-v0.35.4.md','docs/status-v0.35.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-hard-case-outcome-repeatability-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-hard-case-outcome-repeatability-scorecard.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-protocol-v0.35.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-runs-v0.35.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-negative-controls-v0.35.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-output-boundary-v0.35.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-protocol-v0.35.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-runs-v0.35.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-negative-controls-v0.35.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-output-boundary-v0.35.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-report-v0.35.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveHardCaseOutcomeRepeatabilityScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.35.5') return;
  all(manifest.reproducibility, ['v0.35.5','passive_hard_case_outcome_repeatability_scorecard','PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','repeatabilityRunCount_3','hardCaseCount_5','totalOutcomeJudgementCount_15','stableHardCaseCount_5','unstableHardCaseCount_0','stableUsefulHardCaseCount_3','stableNoiseHardCaseCount_1','stableEvidenceGapHardCaseCount_1','labelAgreementRatio_1','stableHardCaseRatio_1','sourceBoundRepeatabilityRatio_1','humanReviewOnlyRepeatabilityRatio_1','noPromotionWithoutHumanRepeatabilityRatio_1','agentConsumedOutputFalseRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.35.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_outcome_value_artifact_only','outcome_repeatability_scorecard_only','stable_usefulness_noise_evidence_gap_measurement','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveHardCaseOutcomeRepeatabilityScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.35.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json'));
  assert(phase?.repeatabilityStatus === 'PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE', 'v0.35.5 repeatability scorecard must complete');
  assert(phase?.metrics?.repeatabilityRunCount === 3, 'v0.35.5 must include three repeatability runs');
  assert(phase?.metrics?.hardCaseCount === 5, 'v0.35.5 must include five hard cases');
  assert(phase?.metrics?.totalOutcomeJudgementCount === 15, 'v0.35.5 must include fifteen outcome judgements');
  assert(phase?.metrics?.stableHardCaseCount === 5, 'v0.35.5 stable hard-case count must be pinned');
  assert(phase?.metrics?.unstableHardCaseCount === 0, 'v0.35.5 unstable hard-case count must be pinned');
  assert(phase?.metrics?.stableUsefulHardCaseCount === 3, 'v0.35.5 stable useful count must be pinned');
  assert(phase?.metrics?.stableNoiseHardCaseCount === 1, 'v0.35.5 stable noise count must be pinned');
  assert(phase?.metrics?.stableEvidenceGapHardCaseCount === 1, 'v0.35.5 stable evidence-gap count must be pinned');
  assert(phase?.metrics?.labelAgreementRatio === 1, 'v0.35.5 label agreement ratio must be pinned');
  assert(phase?.metrics?.stableHardCaseRatio === 1, 'v0.35.5 stable hard-case ratio must be pinned');
  assert(phase?.metrics?.sourceBoundRepeatabilityRatio === 1, 'v0.35.5 source-bound repeatability ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRepeatabilityRatio === 1, 'v0.35.5 human-review repeatability ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRepeatabilityRatio === 1, 'v0.35.5 must not promote memory without human review');
  assert(phase?.metrics?.agentConsumedOutputFalseRatio === 1, 'v0.35.5 must not be agent consumed');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.35.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.35.5 policyDecision must be null');
  assert((phase?.repeatabilityItems ?? []).every((item) => item.promoteToMemory === false && item.agentConsumedOutput === false), 'v0.35.5 repeatability items must not promote memory or be agent-consumed');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-hard-case-outcome-repeatability-scorecard-negative-controls-v0.35.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 30, 'v0.35.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-hard-case-outcome-repeatability-scorecard-report-v0.35.5.out.md'), 'utf8');
  all(report, ['Passive Hard-Case Outcome Repeatability Scorecard v0.35.5','PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','repeatabilityRunCount=3','hardCaseCount=5','totalOutcomeJudgementCount=15','stableHardCaseCount=5','unstableHardCaseCount=0','stableUsefulHardCaseCount=3','stableNoiseHardCaseCount=1','stableEvidenceGapHardCaseCount=1','labelAgreementRatio=1','stableHardCaseRatio=1','sourceBoundRepeatabilityRatio=1','humanReviewOnlyRepeatabilityRatio=1','noPromotionWithoutHumanRepeatabilityRatio=1','agentConsumedOutputFalseRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'outcome repeatability report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive hard-case outcome repeatability scorecard','repeatabilityStatus: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','repeatabilityRunCount: 3','hardCaseCount: 5','totalOutcomeJudgementCount: 15','stableHardCaseCount: 5','unstableHardCaseCount: 0','labelAgreementRatio: 1','stableHardCaseRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive hard-case outcome repeatability scorecard','repeatabilityStatus: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','repeatabilityRunCount: 3','hardCaseCount: 5','totalOutcomeJudgementCount: 15','stableHardCaseCount: 5','unstableHardCaseCount: 0','labelAgreementRatio: 1','stableHardCaseRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveHardCaseOutcomeRepeatabilityScorecardSuite = Object.freeze({ name:'passive-hard-case-outcome-repeatability-scorecard', gatePhase:'post-real-redacted', gateScripts:passiveHardCaseOutcomeRepeatabilityScorecardScripts, requiredManifestPaths:passiveHardCaseOutcomeRepeatabilityScorecardRequiredManifestPaths, assertManifestMetadata:assertPassiveHardCaseOutcomeRepeatabilityScorecardManifestMetadata, assertRelease:assertPassiveHardCaseOutcomeRepeatabilityScorecardRelease });
