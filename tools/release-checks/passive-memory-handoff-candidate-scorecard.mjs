import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveMemoryHandoffCandidateScorecardScripts = Object.freeze([
  'test:passive-memory-handoff-candidate-scorecard-protocol',
  'test:passive-memory-handoff-candidate-scorecard-candidates',
  'test:passive-memory-handoff-candidate-scorecard-metrics',
  'test:passive-memory-handoff-candidate-scorecard-negative-controls',
  'test:passive-memory-handoff-candidate-scorecard-output-boundary',
  'test:passive-memory-handoff-candidate-scorecard-reviewer-package'
]);

export const passiveMemoryHandoffCandidateScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-memory-handoff-candidate-scorecard.mjs',
  'docs/passive-memory-handoff-candidate-scorecard-protocol-v0.29.0-alpha.md',
  'docs/passive-memory-handoff-candidate-scorecard-candidates-v0.29.1.md',
  'docs/passive-memory-handoff-candidate-scorecard-metrics-v0.29.2.md',
  'docs/passive-memory-handoff-candidate-scorecard-negative-controls-v0.29.3.md',
  'docs/passive-memory-handoff-candidate-scorecard-output-boundary-v0.29.4.md',
  'docs/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.md',
  'docs/passive-memory-handoff-candidate-scorecard-local-review-notes-v0.29.5.md',
  'docs/status-v0.29.0-alpha.md',
  'docs/status-v0.29.1.md',
  'docs/status-v0.29.2.md',
  'docs/status-v0.29.3.md',
  'docs/status-v0.29.4.md',
  'docs/status-v0.29.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-memory-handoff-candidate-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-memory-handoff-candidate-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-protocol-v0.29.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-candidates-v0.29.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-metrics-v0.29.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-negative-controls-v0.29.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-output-boundary-v0.29.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-protocol-v0.29.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-candidates-v0.29.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-metrics-v0.29.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-negative-controls-v0.29.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-output-boundary-v0.29.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-handoff-candidate-scorecard-report-v0.29.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPassiveMemoryHandoffCandidateScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.29.5') return;
  all(manifest.reproducibility, ['v0.29.5','passive_memory_handoff_candidate_scorecard','MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE','candidateCount_4','carryForwardCandidateCount_2','contradictionCandidateCount_1','staleCautionCandidateCount_1','sourceBoundCandidateRatio_1','contradictionFlagRatio_1','staleCautionRatio_1','noiseSuppressedCount_1','noiseSuppressionRatio_1','humanReviewCandidateRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.29.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_completed_redacted_recall_artifact_only','human_review_handoff_candidates','source_bound','contradiction_aware','stale_aware','noise_suppressed','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPassiveMemoryHandoffCandidateScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.29.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.out.json'));
  assert(phase?.handoffStatus === 'MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE', 'v0.29.5 handoff scorecard must complete');
  assert(phase?.metrics?.candidateCount === 4, 'v0.29.5 must include four handoff candidates');
  assert(phase?.metrics?.carryForwardCandidateCount === 2, 'v0.29.5 must include two carry-forward candidates');
  assert(phase?.metrics?.contradictionCandidateCount === 1, 'v0.29.5 must include one contradiction candidate');
  assert(phase?.metrics?.staleCautionCandidateCount === 1, 'v0.29.5 must include one stale caution candidate');
  assert(phase?.metrics?.sourceBoundCandidateRatio === 1, 'v0.29.5 source-bound candidate ratio must be pinned');
  assert(phase?.metrics?.contradictionFlagRatio === 1, 'v0.29.5 contradiction flag ratio must be pinned');
  assert(phase?.metrics?.staleCautionRatio === 1, 'v0.29.5 stale caution ratio must be pinned');
  assert(phase?.metrics?.noiseSuppressedCount === 1, 'v0.29.5 must suppress one noise evidence item');
  assert(phase?.metrics?.noiseSuppressionRatio === 1, 'v0.29.5 noise suppression ratio must be pinned');
  assert(phase?.metrics?.humanReviewCandidateRatio === 1, 'v0.29.5 human review candidate ratio must be pinned');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.29.5 boundary violations must be zero');
  assert(phase?.recommendation === 'ADVANCE_OBSERVATION_ONLY', 'v0.29.5 recommendation must remain observation-only');
  assert(phase?.recommendationIsAuthority === false, 'v0.29.5 recommendation must not be authority');
  assert(phase?.agentConsumedOutput === false, 'v0.29.5 must not be agent-consumed output');
  assert(phase?.notRuntimeInstruction === true, 'v0.29.5 must not be a runtime instruction');
  assert(phase?.policyDecision === null, 'v0.29.5 policyDecision must be null');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-memory-handoff-candidate-scorecard-negative-controls-v0.29.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 20, 'v0.29.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-memory-handoff-candidate-scorecard-report-v0.29.5.out.md'), 'utf8');
  all(report, ['Passive Memory Handoff Candidate Scorecard v0.29.5','MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE','candidateCount=4','carryForwardCandidateCount=2','contradictionCandidateCount=1','staleCautionCandidateCount=1','sourceBoundCandidateRatio=1','contradictionFlagRatio=1','staleCautionRatio=1','noiseSuppressedCount=1','noiseSuppressionRatio=1','humanReviewCandidateRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'handoff scorecard report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive memory handoff candidate scorecard','handoffStatus: MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE','candidateCount: 4','carryForwardCandidateCount: 2','contradictionCandidateCount: 1','staleCautionCandidateCount: 1','sourceBoundCandidateRatio: 1','contradictionFlagRatio: 1','staleCautionRatio: 1','noiseSuppressedCount: 1','noiseSuppressionRatio: 1','humanReviewCandidateRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive memory handoff candidate scorecard','handoffStatus: MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE','candidateCount: 4','carryForwardCandidateCount: 2','contradictionCandidateCount: 1','staleCautionCandidateCount: 1','sourceBoundCandidateRatio: 1','contradictionFlagRatio: 1','staleCautionRatio: 1','noiseSuppressedCount: 1','noiseSuppressionRatio: 1','humanReviewCandidateRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}

export const passiveMemoryHandoffCandidateScorecardSuite = Object.freeze({
  name: 'passive-memory-handoff-candidate-scorecard',
  gatePhase: 'post-real-redacted',
  gateScripts: passiveMemoryHandoffCandidateScorecardScripts,
  requiredManifestPaths: passiveMemoryHandoffCandidateScorecardRequiredManifestPaths,
  assertManifestMetadata: assertPassiveMemoryHandoffCandidateScorecardManifestMetadata,
  assertRelease: assertPassiveMemoryHandoffCandidateScorecardRelease
});
