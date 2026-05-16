import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveLiveMemoryCoherenceUsefulnessWindowScripts = Object.freeze([
  'test:passive-live-memory-coherence-usefulness-window-protocol',
  'test:passive-live-memory-coherence-usefulness-window-handoff',
  'test:passive-live-memory-coherence-usefulness-window-metrics',
  'test:passive-live-memory-coherence-usefulness-window-negative-controls',
  'test:passive-live-memory-coherence-usefulness-window-output-boundary',
  'test:passive-live-memory-coherence-usefulness-window-reviewer-package',
]);
export const passiveLiveMemoryCoherenceUsefulnessWindowRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-memory-coherence-usefulness-window.mjs',
  'docs/passive-live-memory-coherence-usefulness-window-protocol-v0.38.0-alpha.md','docs/passive-live-memory-coherence-usefulness-window-handoff-v0.38.1.md','docs/passive-live-memory-coherence-usefulness-window-metrics-v0.38.2.md','docs/passive-live-memory-coherence-usefulness-window-negative-controls-v0.38.3.md','docs/passive-live-memory-coherence-usefulness-window-output-boundary-v0.38.4.md','docs/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.md','docs/passive-live-memory-coherence-usefulness-window-local-review-notes-v0.38.5.md',
  'docs/status-v0.38.0-alpha.md','docs/status-v0.38.1.md','docs/status-v0.38.2.md','docs/status-v0.38.3.md','docs/status-v0.38.4.md','docs/status-v0.38.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-memory-coherence-usefulness-window.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-live-memory-coherence-usefulness-window.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-protocol-v0.38.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-handoff-v0.38.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-metrics-v0.38.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-negative-controls-v0.38.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-output-boundary-v0.38.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-protocol-v0.38.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-handoff-v0.38.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-metrics-v0.38.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-negative-controls-v0.38.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-output-boundary-v0.38.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-report-v0.38.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveMemoryCoherenceUsefulnessWindowManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.38.5') return;
  all(manifest.reproducibility, ['v0.38.5','bounded_passive_live_memory_coherence_usefulness_window','PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE','usefulnessWindowCount_1','handoffItemCount_4','usefulHandoffItemCount_4','noisyHandoffItemCount_0','includeForHumanHandoffCount_3','cautionOnlyCount_1','sourceBoundHandoffRatio_1','stableSignalCarryForwardRatio_1','usefulHandoffRatio_1','redactedBeforePersistRatio_1','rawPersistedFalseRatio_1','humanReviewOnlyRatio_1','noPromotionWithoutHumanRatio_1','agentConsumedOutputFalseRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.38.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_repeatability_artifact_only','bounded_human_handoff_usefulness_window_only','redacted_before_persist','raw_source_cache_excluded','raw_persisted_false','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveMemoryCoherenceUsefulnessWindowRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.38.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json'));
  assert(phase?.usefulnessWindowStatus === 'PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE', 'v0.38.5 usefulness window must complete');
  assert(phase?.metrics?.usefulnessWindowCount === 1, 'v0.38.5 usefulness window count must be pinned');
  assert(phase?.metrics?.handoffItemCount === 4, 'v0.38.5 handoff item count must be pinned');
  assert(phase?.metrics?.usefulHandoffItemCount === 4, 'v0.38.5 useful item count must be pinned');
  assert(phase?.metrics?.noisyHandoffItemCount === 0, 'v0.38.5 noisy item count must be zero');
  assert(phase?.metrics?.includeForHumanHandoffCount === 3, 'v0.38.5 include count must be pinned');
  assert(phase?.metrics?.cautionOnlyCount === 1, 'v0.38.5 caution count must be pinned');
  assert(phase?.metrics?.sourceBoundHandoffRatio === 1, 'v0.38.5 source-bound handoff ratio must be pinned');
  assert(phase?.metrics?.stableSignalCarryForwardRatio === 1, 'v0.38.5 stable signal carry-forward ratio must be pinned');
  assert(phase?.metrics?.usefulHandoffRatio === 1, 'v0.38.5 useful handoff ratio must be pinned');
  assert(phase?.metrics?.redactedBeforePersistRatio === 1, 'v0.38.5 redaction ratio must be pinned');
  assert(phase?.metrics?.rawPersistedFalseRatio === 1, 'v0.38.5 raw persisted false ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.38.5 no promotion ratio must be pinned');
  assert(phase?.metrics?.agentConsumedOutputFalseRatio === 1, 'v0.38.5 must not be agent consumed');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.38.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.38.5 policyDecision must be null');
  assert((phase?.handoffItems ?? []).every((item) => item.promoteToMemory === false && item.agentConsumedOutput === false && item.rawPersisted === false), 'v0.38.5 handoff items must not promote memory, persist raw content, or be agent-consumed');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-usefulness-window-negative-controls-v0.38.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 34, 'v0.38.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-live-memory-coherence-usefulness-window-report-v0.38.5.out.md'), 'utf8');
  all(report, ['Passive Live Memory Coherence Usefulness Window v0.38.5','PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE','usefulnessWindowCount=1','handoffItemCount=4','usefulHandoffItemCount=4','noisyHandoffItemCount=0','includeForHumanHandoffCount=3','cautionOnlyCount=1','sourceBoundHandoffRatio=1','stableSignalCarryForwardRatio=1','usefulHandoffRatio=1','redactedBeforePersistRatio=1','rawPersistedFalseRatio=1','noPromotionWithoutHumanRatio=1','agentConsumedOutputFalseRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'memory coherence usefulness report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['bounded passive live memory/coherence usefulness window','usefulnessWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE','usefulnessWindowCount: 1','handoffItemCount: 4','usefulHandoffItemCount: 4','noisyHandoffItemCount: 0','includeForHumanHandoffCount: 3','cautionOnlyCount: 1','sourceBoundHandoffRatio: 1','stableSignalCarryForwardRatio: 1','usefulHandoffRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'bounded passive live memory/coherence usefulness window','usefulnessWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE','usefulnessWindowCount: 1','handoffItemCount: 4','usefulHandoffItemCount: 4','noisyHandoffItemCount: 0','includeForHumanHandoffCount: 3','cautionOnlyCount: 1','sourceBoundHandoffRatio: 1','stableSignalCarryForwardRatio: 1','usefulHandoffRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveMemoryCoherenceUsefulnessWindowSuite = Object.freeze({ name:'passive-live-memory-coherence-usefulness-window', gatePhase:'post-real-redacted', gateScripts:passiveLiveMemoryCoherenceUsefulnessWindowScripts, requiredManifestPaths:passiveLiveMemoryCoherenceUsefulnessWindowRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveMemoryCoherenceUsefulnessWindowManifestMetadata, assertRelease:assertPassiveLiveMemoryCoherenceUsefulnessWindowRelease });
