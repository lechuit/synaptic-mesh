import assert from 'node:assert/strict';
import { assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned, validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput, scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';
import { stableInvalidationReceiverPackageInputV041 } from './passive-live-memory-coherence-stable-invalidation-receiver-package-fixtures.mjs';

function mutated(fn){ const input = stableInvalidationReceiverPackageInputV041(); fn(input); return input; }
function reject(label, input, expected){
  const issues = validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput(input);
  assert(issues.some((issue)=>issue.includes(expected)), `${label} expected ${expected}; got ${issues.join(',')}`);
  const artifact = scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(input);
  assert.equal(artifact.receiverPackageStatus, 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_REJECTED');
  return { label, issues };
}
const rejectedNegativeControls = [];
const cases = [
  ['path-traversal-pre-read', () => assert.throws(()=>assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned('../evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json'), /path_not_pinned_pre_read/)],
  ['path-implementation-traversal-pre-read', () => assert.throws(()=>assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned('../../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json'), /path_not_pinned_pre_read/)],
  ['input-unknown-field', () => rejectedNegativeControls.push(reject('input-unknown-field', mutated((i)=>{ i.extra = true; }), 'unknown_field'))],
  ['input-digest-drift', () => rejectedNegativeControls.push(reject('input-digest-drift', mutated((i)=>{ i.repeatabilityArtifactSha256 = '0'.repeat(64); }), 'digest_not_pinned'))],
  ['object-digest-drift', () => rejectedNegativeControls.push(reject('object-digest-drift', mutated((i)=>{ i.repeatabilityArtifact.metrics.candidateSignalCount = 4; }), 'object_digest_not_pinned'))],
  ['artifact-id-spoof', () => rejectedNegativeControls.push(reject('artifact-id-spoof', mutated((i)=>{ i.repeatabilityArtifact.artifact = 'spoof'; }), 'artifact_not_expected'))],
  ['status-incomplete', () => rejectedNegativeControls.push(reject('status-incomplete', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityStatus = 'INCOMPLETE'; }), 'status_not_complete'))],
  ['report-digest-drift', () => rejectedNegativeControls.push(reject('report-digest-drift', mutated((i)=>{ i.repeatabilityArtifact.reportMarkdown += '\\nchanged'; }), 'reportMarkdown_digest_not_expected'))],
  ['metric-run-count-drift', () => rejectedNegativeControls.push(reject('metric-run-count-drift', mutated((i)=>{ i.repeatabilityArtifact.metrics.repeatabilityRunCount = 2; }), 'repeatabilityRunCount_not_expected'))],
  ['unstable-candidate-count', () => rejectedNegativeControls.push(reject('unstable-candidate-count', mutated((i)=>{ i.repeatabilityArtifact.metrics.unstableCandidateCount = 1; }), 'unstableCandidateCount_not_expected'))],
  ['carry-forward-count-drift', () => rejectedNegativeControls.push(reject('carry-forward-count-drift', mutated((i)=>{ i.repeatabilityArtifact.metrics.stableValidCarryForwardCount = 2; }), 'stableValidCarryForwardCount_not_expected'))],
  ['stale-count-drift', () => rejectedNegativeControls.push(reject('stale-count-drift', mutated((i)=>{ i.repeatabilityArtifact.metrics.stableStaleInvalidatedCount = 0; }), 'stableStaleInvalidatedCount_not_expected'))],
  ['contradiction-count-drift', () => rejectedNegativeControls.push(reject('contradiction-count-drift', mutated((i)=>{ i.repeatabilityArtifact.metrics.stableContradictionCautionCount = 0; }), 'stableContradictionCautionCount_not_expected'))],
  ['candidate-missing', () => rejectedNegativeControls.push(reject('candidate-missing', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems.pop(); }), 'items_not_exact_expected_count'))],
  ['carry-forward-treatment-drift', () => rejectedNegativeControls.push(reject('carry-forward-treatment-drift', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].invalidationTreatment = 'invalidate_as_stale'; }), 'invalidation_treatment_not_expected'))],
  ['stale-not-invalidated', () => rejectedNegativeControls.push(reject('stale-not-invalidated', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems.find((x)=>x.candidateId === 'candidate-stale-prior-release-anchor').invalidationTreatment = 'carry_forward_valid'; }), 'invalidation_treatment_not_expected'))],
  ['contradiction-not-cautioned', () => rejectedNegativeControls.push(reject('contradiction-not-cautioned', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems.find((x)=>x.candidateId === 'candidate-contradictory-boundary-claim').humanTreatment = 'include_for_human_handoff'; }), 'human_treatment_not_expected'))],
  ['source-bound-false', () => rejectedNegativeControls.push(reject('source-bound-false', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].sourceBoundAcrossRuns = false; }), 'stable_boundary_flags_invalid'))],
  ['redaction-false', () => rejectedNegativeControls.push(reject('redaction-false', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].redactedBeforePersistAcrossRuns = false; }), 'stable_boundary_flags_invalid'))],
  ['raw-persisted', () => rejectedNegativeControls.push(reject('raw-persisted', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].rawPersisted = true; }), 'stable_boundary_flags_invalid'))],
  ['promote-to-memory', () => rejectedNegativeControls.push(reject('promote-to-memory', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].promoteToMemory = true; }), 'stable_boundary_flags_invalid'))],
  ['agent-consumed-output', () => rejectedNegativeControls.push(reject('agent-consumed-output', mutated((i)=>{ i.repeatabilityArtifact.repeatabilityItems[0].agentConsumedOutput = true; }), 'stable_boundary_flags_invalid'))],
  ['policy-decision-non-null', () => rejectedNegativeControls.push(reject('policy-decision-non-null', mutated((i)=>{ i.repeatabilityArtifact.policyDecision = 'allow'; }), 'policyDecision_non_null'))],
  ['recommendation-authority', () => rejectedNegativeControls.push(reject('recommendation-authority', mutated((i)=>{ i.repeatabilityArtifact.recommendationIsAuthority = true; }), 'recommendation_treated_as_authority'))],
  ['runtime-integration-request', () => rejectedNegativeControls.push(reject('runtime-integration-request', mutated((i)=>{ i.runtimeIntegration = true; }), 'runtime_or_daemon_requested'))],
  ['memory-write-request', () => rejectedNegativeControls.push(reject('memory-write-request', mutated((i)=>{ i.memoryWrite = true; }), 'memory_or_config_write_requested'))],
  ['tool-execution-request', () => rejectedNegativeControls.push(reject('tool-execution-request', mutated((i)=>{ i.toolExecution = true; }), 'external_or_tool_effect_requested'))],
  ['raw-output-request', () => rejectedNegativeControls.push(reject('raw-output-request', mutated((i)=>{ i.rawOutput = true; }), 'raw_persistence_or_output_requested'))],
];
for (const [, run] of cases) run();
assert(rejectedNegativeControls.length >= 26);
console.log(JSON.stringify({ rejectedNegativeControls: rejectedNegativeControls.length, preReadPathPinningControls: 2 }));
