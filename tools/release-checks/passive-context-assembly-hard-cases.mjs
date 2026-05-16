import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveContextAssemblyHardCasesScripts = Object.freeze([
  'test:passive-context-assembly-hard-cases-protocol',
  'test:passive-context-assembly-hard-cases-cases',
  'test:passive-context-assembly-hard-cases-metrics',
  'test:passive-context-assembly-hard-cases-negative-controls',
  'test:passive-context-assembly-hard-cases-output-boundary',
  'test:passive-context-assembly-hard-cases-reviewer-package',
]);
export const passiveContextAssemblyHardCasesRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-context-assembly-hard-cases.mjs',
  'docs/passive-context-assembly-hard-cases-protocol-v0.33.0-alpha.md','docs/passive-context-assembly-hard-cases-cases-v0.33.1.md','docs/passive-context-assembly-hard-cases-metrics-v0.33.2.md','docs/passive-context-assembly-hard-cases-negative-controls-v0.33.3.md','docs/passive-context-assembly-hard-cases-output-boundary-v0.33.4.md','docs/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.md','docs/passive-context-assembly-hard-cases-local-review-notes-v0.33.5.md',
  'docs/status-v0.33.0-alpha.md','docs/status-v0.33.1.md','docs/status-v0.33.2.md','docs/status-v0.33.3.md','docs/status-v0.33.4.md','docs/status-v0.33.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-context-assembly-hard-cases.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-context-assembly-hard-cases.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-protocol-v0.33.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-cases-v0.33.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-metrics-v0.33.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-negative-controls-v0.33.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-output-boundary-v0.33.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-protocol-v0.33.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-cases-v0.33.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-metrics-v0.33.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-negative-controls-v0.33.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-output-boundary-v0.33.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-report-v0.33.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveContextAssemblyHardCasesManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.33.5') return;
  all(manifest.reproducibility, ['v0.33.5','passive_context_assembly_hard_cases','PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE','hardCaseCount_5','activeRulePreferredCount_1','partialContradictionFlagCount_1','sourceBoundDecisionCarryForwardCount_1','staleCautionPreservedCount_1','temptingNoiseSuppressedCount_1','sourceBoundHardCaseRatio_1','hardCaseCoverageRatio_1','humanReviewOnlyRatio_1','minimalContextRatio_1','noPromotionWithoutHumanRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.33.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_context_assembly_artifact_only','human_hard_case_context_scorecard_only','active_rule_vs_old_context','partial_contradiction_flagged','source_bound_decision_carried_forward','stale_caution_preserved','tempting_noise_suppressed','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveContextAssemblyHardCasesRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.33.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json'));
  assert(phase?.hardCaseStatus === 'PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE', 'v0.33.5 hard-case scorecard must complete');
  assert(phase?.metrics?.hardCaseCount === 5, 'v0.33.5 must include five hard cases');
  assert(phase?.metrics?.activeRulePreferredCount === 1, 'v0.33.5 must prefer one active rule');
  assert(phase?.metrics?.partialContradictionFlagCount === 1, 'v0.33.5 must flag one partial contradiction');
  assert(phase?.metrics?.sourceBoundDecisionCarryForwardCount === 1, 'v0.33.5 must carry forward one source-bound decision');
  assert(phase?.metrics?.staleCautionPreservedCount === 1, 'v0.33.5 must preserve one stale caution');
  assert(phase?.metrics?.temptingNoiseSuppressedCount === 1, 'v0.33.5 must suppress one tempting noise case');
  assert(phase?.metrics?.sourceBoundHardCaseRatio === 1, 'v0.33.5 source-bound hard-case ratio must be pinned');
  assert(phase?.metrics?.hardCaseCoverageRatio === 1, 'v0.33.5 hard-case coverage ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRatio === 1, 'v0.33.5 human review ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.33.5 must not promote memory without human review');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.33.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.33.5 policyDecision must be null');
  assert((phase?.hardCases ?? []).every((item) => item.promoteToMemory === false && item.precedenceSuggestionIsAuthority === false), 'v0.33.5 hard cases must remain non-authoritative and not promote memory');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-context-assembly-hard-cases-negative-controls-v0.33.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 30, 'v0.33.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-context-assembly-hard-cases-report-v0.33.5.out.md'), 'utf8');
  all(report, ['Passive Context Assembly Hard Cases Scorecard v0.33.5','PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE','hardCaseCount=5','activeRulePreferredCount=1','partialContradictionFlagCount=1','sourceBoundDecisionCarryForwardCount=1','staleCautionPreservedCount=1','temptingNoiseSuppressedCount=1','sourceBoundHardCaseRatio=1','hardCaseCoverageRatio=1','humanReviewOnlyRatio=1','noPromotionWithoutHumanRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'hard-case report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive context assembly hard cases scorecard','hardCaseStatus: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE','hardCaseCount: 5','activeRulePreferredCount: 1','partialContradictionFlagCount: 1','sourceBoundDecisionCarryForwardCount: 1','staleCautionPreservedCount: 1','temptingNoiseSuppressedCount: 1','sourceBoundHardCaseRatio: 1','hardCaseCoverageRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive context assembly hard cases scorecard','hardCaseStatus: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE','hardCaseCount: 5','activeRulePreferredCount: 1','partialContradictionFlagCount: 1','sourceBoundDecisionCarryForwardCount: 1','staleCautionPreservedCount: 1','temptingNoiseSuppressedCount: 1','sourceBoundHardCaseRatio: 1','hardCaseCoverageRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveContextAssemblyHardCasesSuite = Object.freeze({ name:'passive-context-assembly-hard-cases', gatePhase:'post-real-redacted', gateScripts:passiveContextAssemblyHardCasesScripts, requiredManifestPaths:passiveContextAssemblyHardCasesRequiredManifestPaths, assertManifestMetadata:assertPassiveContextAssemblyHardCasesManifestMetadata, assertRelease:assertPassiveContextAssemblyHardCasesRelease });
