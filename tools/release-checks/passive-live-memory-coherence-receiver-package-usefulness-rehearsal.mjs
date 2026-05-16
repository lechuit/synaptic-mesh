import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalScripts = Object.freeze([
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-protocol',
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-comparisons',
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-metrics',
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-negative-controls',
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-output-boundary',
  'test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package',
]);
export const passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs',
  'docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-protocol-v0.42.0-alpha.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-comparisons-v0.42.1.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-metrics-v0.42.2.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-negative-controls-v0.42.3.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-output-boundary-v0.42.4.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.md','docs/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-local-review-notes-v0.42.5.md',
  'docs/status-v0.42.0-alpha.md','docs/status-v0.42.1.md','docs/status-v0.42.2.md','docs/status-v0.42.3.md','docs/status-v0.42.4.md','docs/status-v0.42.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-protocol-v0.42.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-comparisons-v0.42.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-metrics-v0.42.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-negative-controls-v0.42.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-output-boundary-v0.42.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-report-v0.42.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.42.5') return;
  all(manifest.reproducibility, ['v0.42.5','passive_live_memory_coherence_receiver_package_usefulness_rehearsal','PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE','rehearsalWindowCount_1','comparisonModeCount_3','receiverUsefulHandoffItemCount_4','receiverNoisyHandoffItemCount_0','rawSignalUsefulnessRatio_0.6','scorecardUsefulnessRatio_0.6','receiverUsefulnessRatio_1','receiverImprovesOverRawSignals_true','receiverImprovesOverScorecard_true','staleSuppressionUsefulRatio_1','contradictionCautionUsefulRatio_1','preReadPathPinned_true','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.42.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_receiver_package_artifact_only','pre_read_path_pinned','usefulness_rehearsal_only','compares_receiver_package_to_raw_signals_and_scorecard','redacted_before_persist','raw_source_cache_excluded','raw_persisted_false','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.42.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'));
  assert(phase?.rehearsalStatus === 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE', 'v0.42.5 rehearsal must complete');
  assert(phase?.metrics?.receiverPackageItemCount === 5, 'v0.42.5 item count must be pinned');
  assert(phase?.metrics?.receiverUsefulHandoffItemCount === 4, 'v0.42.5 receiver useful count must be pinned');
  assert(phase?.metrics?.receiverNoisyHandoffItemCount === 0, 'v0.42.5 receiver noisy count must be zero');
  assert(phase?.metrics?.rawSignalNoisyHandoffItemCount === 2, 'v0.42.5 raw noisy count must be pinned');
  assert(phase?.metrics?.scorecardNoisyHandoffItemCount === 2, 'v0.42.5 scorecard noisy count must be pinned');
  assert(phase?.metrics?.receiverUsefulnessRatio === 1, 'v0.42.5 receiver usefulness must be 1');
  assert(phase?.metrics?.rawSignalUsefulnessRatio === 0.6, 'v0.42.5 raw usefulness must be 0.6');
  assert(phase?.metrics?.scorecardUsefulnessRatio === 0.6, 'v0.42.5 scorecard usefulness must be 0.6');
  assert(phase?.metrics?.receiverImprovesOverRawSignals === true, 'v0.42.5 receiver must improve over raw signals');
  assert(phase?.metrics?.receiverImprovesOverScorecard === true, 'v0.42.5 receiver must improve over scorecard');
  assert(phase?.metrics?.preReadPathPinned === true, 'v0.42.5 must pre-read path pin inputs');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.42.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.42.5 policyDecision must be null');
  assert((phase?.usefulnessJudgements ?? []).every((item) => item.promoteToMemory === false && item.agentConsumedOutput === false && item.rawPersisted === false), 'v0.42.5 judgements must not promote memory, persist raw content, or be agent-consumed');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-report-v0.42.5.out.md'), 'utf8');
  all(report, ['Passive Live Memory Coherence Receiver Package Usefulness Rehearsal v0.42.5','PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE','receiverUsefulHandoffItemCount=4','receiverNoisyHandoffItemCount=0','rawSignalUsefulnessRatio=0.6','scorecardUsefulnessRatio=0.6','receiverUsefulnessRatio=1','receiverImprovesOverRawSignals=true','receiverImprovesOverScorecard=true','staleSuppressionUsefulRatio=1','contradictionCautionUsefulRatio=1','preReadPathPinned=true','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'memory coherence receiver package usefulness report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive live memory/coherence receiver package usefulness rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE','receiverUsefulnessRatio: 1','rawSignalUsefulnessRatio: 0.6','scorecardUsefulnessRatio: 0.6','receiverImprovesOverRawSignals: true','receiverImprovesOverScorecard: true','preReadPathPinned: true','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive live memory/coherence receiver package usefulness rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE','receiverUsefulnessRatio: 1','rawSignalUsefulnessRatio: 0.6','scorecardUsefulnessRatio: 0.6','receiverImprovesOverRawSignals: true','receiverImprovesOverScorecard: true','policyDecision: null'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalSuite = Object.freeze({ name:'passive-live-memory-coherence-receiver-package-usefulness-rehearsal', gatePhase:'post-real-redacted', gateScripts:passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalScripts, requiredManifestPaths:passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalManifestMetadata, assertRelease:assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalRelease });
