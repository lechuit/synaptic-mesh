import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveLiveMemoryCoherenceObservationRehearsalScripts = Object.freeze([
  'test:passive-live-memory-coherence-observation-rehearsal-protocol',
  'test:passive-live-memory-coherence-observation-rehearsal-sources',
  'test:passive-live-memory-coherence-observation-rehearsal-metrics',
  'test:passive-live-memory-coherence-observation-rehearsal-negative-controls',
  'test:passive-live-memory-coherence-observation-rehearsal-output-boundary',
  'test:passive-live-memory-coherence-observation-rehearsal-reviewer-package',
]);
export const passiveLiveMemoryCoherenceObservationRehearsalRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-memory-coherence-observation-rehearsal.mjs',
  'docs/passive-live-memory-coherence-observation-rehearsal-protocol-v0.36.0-alpha.md','docs/passive-live-memory-coherence-observation-rehearsal-sources-v0.36.1.md','docs/passive-live-memory-coherence-observation-rehearsal-metrics-v0.36.2.md','docs/passive-live-memory-coherence-observation-rehearsal-negative-controls-v0.36.3.md','docs/passive-live-memory-coherence-observation-rehearsal-output-boundary-v0.36.4.md','docs/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.md','docs/passive-live-memory-coherence-observation-rehearsal-local-review-notes-v0.36.5.md',
  'docs/status-v0.36.0-alpha.md','docs/status-v0.36.1.md','docs/status-v0.36.2.md','docs/status-v0.36.3.md','docs/status-v0.36.4.md','docs/status-v0.36.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-memory-coherence-observation-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-live-memory-coherence-observation-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-protocol-v0.36.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-sources-v0.36.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-metrics-v0.36.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-negative-controls-v0.36.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-output-boundary-v0.36.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-protocol-v0.36.0-alpha.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-sources-v0.36.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-metrics-v0.36.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-negative-controls-v0.36.3.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-output-boundary-v0.36.4.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-report-v0.36.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveMemoryCoherenceObservationRehearsalManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.36.5') return;
  all(manifest.reproducibility, ['v0.36.5','passive_live_memory_coherence_observation_rehearsal','PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE','explicitRepoLocalSourceCount_4','observationItemCount_4','sourceBoundObservationCount_4','includeForHumanContextCount_3','hardeningCautionCount_1','redactedBeforePersistRatio_1','rawPersistedFalseRatio_1','humanReviewOnlyRatio_1','noPromotionWithoutHumanRatio_1','agentConsumedOutputFalseRatio_1','sourceBoundObservationRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.36.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_repo_local_sources_only','pinned_completed_repeatability_artifact_only','redacted_before_persist','raw_source_cache_excluded','raw_persisted_false','memory_coherence_observation_only','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveMemoryCoherenceObservationRehearsalRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.36.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json'));
  assert(phase?.rehearsalStatus === 'PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE', 'v0.36.5 rehearsal must complete');
  assert(phase?.metrics?.explicitRepoLocalSourceCount === 4, 'v0.36.5 must include four explicit repo-local sources');
  assert(phase?.metrics?.observationItemCount === 4, 'v0.36.5 observation item count must be pinned');
  assert(phase?.metrics?.sourceBoundObservationCount === 4, 'v0.36.5 source-bound observation count must be pinned');
  assert(phase?.metrics?.includeForHumanContextCount === 3, 'v0.36.5 include count must be pinned');
  assert(phase?.metrics?.hardeningCautionCount === 1, 'v0.36.5 hardening caution count must be pinned');
  assert(phase?.metrics?.redactedBeforePersistRatio === 1, 'v0.36.5 redaction ratio must be pinned');
  assert(phase?.metrics?.rawPersistedFalseRatio === 1, 'v0.36.5 raw persisted false ratio must be pinned');
  assert(phase?.metrics?.humanReviewOnlyRatio === 1, 'v0.36.5 human review ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.36.5 no promotion ratio must be pinned');
  assert(phase?.metrics?.agentConsumedOutputFalseRatio === 1, 'v0.36.5 must not be agent consumed');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.36.5 boundary violations must be zero');
  assert(phase?.policyDecision === null, 'v0.36.5 policyDecision must be null');
  assert((phase?.observationItems ?? []).every((item) => item.promoteToMemory === false && item.agentConsumedOutput === false && item.rawPersisted === false), 'v0.36.5 observation items must not promote memory, persist raw content, or be agent-consumed');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-observation-rehearsal-negative-controls-v0.36.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 35, 'v0.36.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-live-memory-coherence-observation-rehearsal-report-v0.36.5.out.md'), 'utf8');
  all(report, ['Passive Live Memory Coherence Observation Rehearsal v0.36.5','PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE','explicitRepoLocalSourceCount=4','observationItemCount=4','sourceBoundObservationCount=4','includeForHumanContextCount=3','hardeningCautionCount=1','redactedBeforePersistRatio=1','rawPersistedFalseRatio=1','humanReviewOnlyRatio=1','noPromotionWithoutHumanRatio=1','agentConsumedOutputFalseRatio=1','sourceBoundObservationRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'memory coherence observation report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive live memory/coherence observation rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE','explicitRepoLocalSourceCount: 4','observationItemCount: 4','sourceBoundObservationCount: 4','includeForHumanContextCount: 3','hardeningCautionCount: 1','redactedBeforePersistRatio: 1','rawPersistedFalseRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive live memory/coherence observation rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE','explicitRepoLocalSourceCount: 4','observationItemCount: 4','sourceBoundObservationCount: 4','includeForHumanContextCount: 3','hardeningCautionCount: 1','redactedBeforePersistRatio: 1','rawPersistedFalseRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveMemoryCoherenceObservationRehearsalSuite = Object.freeze({ name:'passive-live-memory-coherence-observation-rehearsal', gatePhase:'post-real-redacted', gateScripts:passiveLiveMemoryCoherenceObservationRehearsalScripts, requiredManifestPaths:passiveLiveMemoryCoherenceObservationRehearsalRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveMemoryCoherenceObservationRehearsalManifestMetadata, assertRelease:assertPassiveLiveMemoryCoherenceObservationRehearsalRelease });
