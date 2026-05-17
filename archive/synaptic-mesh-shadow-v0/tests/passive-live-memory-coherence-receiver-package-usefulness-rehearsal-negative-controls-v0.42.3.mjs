import assert from 'node:assert/strict';
import { validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput, assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInputPathPinned } from '../src/passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs';
import { receiverPackageUsefulnessRehearsalInputV042 } from './passive-live-memory-coherence-receiver-package-usefulness-rehearsal-fixtures.mjs';
function rejects(mutator, expected){
  const input = receiverPackageUsefulnessRehearsalInputV042();
  mutator(input);
  const issues = validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput(input);
  assert(issues.some((i) => i.includes(expected)), `${expected} missing in ${issues.join(',')}`);
}
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInputPathPinned('../evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInputPathPinned('../../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json'), /path_not_pinned_pre_read/);
const cases = [
  [(i)=>{ i.receiverPackageArtifactPath = '../evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.receiverPackageArtifactSha256 = 'bad'; }, 'digest_not_pinned'],
  [(i)=>{ i.receiverPackageArtifact.artifact = 'spoof'; }, 'artifact_not_expected'],
  [(i)=>{ i.receiverPackageArtifact.reportMarkdown = 'changed'; }, 'reportMarkdown_digest_not_expected'],
  [(i)=>{ i.receiverPackageArtifact.metrics.receiverPackageItemCount = 4; }, 'metrics.receiverPackageItemCount_not_expected'],
  [(i)=>{ i.receiverPackageArtifact.receiverPackageItems[0].sourceBound = false; }, 'boundary_flags_invalid'],
  [(i)=>{ i.receiverPackageArtifact.receiverPackageItems[3].packageLane = 'stable_carry_forward'; }, 'lane_not_expected'],
  [(i)=>{ i.extra = true; }, 'unknown_field'],
  [(i)=>{ i.memoryWrite = true; }, 'memory_or_config_write_requested'],
  [(i)=>{ i.runtimeIntegration = true; }, 'runtime_or_daemon_requested'],
  [(i)=>{ i.toolExecution = true; }, 'external_or_tool_effect_requested'],
  [(i)=>{ i.rawOutput = true; }, 'raw_persistence_or_output_requested'],
  [(i)=>{ i.policyDecision = 'ALLOW'; }, 'policyDecision_non_null'],
  [(i)=>{ i.recommendationIsAuthority = true; }, 'recommendation_treated_as_authority'],
  [(i)=>{ i.agentConsumedOutput = true; }, 'agent_consumed_output_true'],
  [(i)=>{ i.promoteToMemory = true; }, 'forbidden_boundary_field_set'],
];
for (const [mutator, expected] of cases) rejects(mutator, expected);
console.log(JSON.stringify({ rejectedNegativeControls: cases.length, preReadPathPinningControls: 2 }));
