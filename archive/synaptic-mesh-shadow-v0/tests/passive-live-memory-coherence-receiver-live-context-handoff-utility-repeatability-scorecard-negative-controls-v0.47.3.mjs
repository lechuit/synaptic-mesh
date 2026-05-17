import assert from 'node:assert/strict';
import { validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput, assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned } from '../src/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard.mjs';
import { receiverLiveContextHandoffUtilityRepeatabilityInputV047 } from './passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-fixtures.mjs';
function rejects(mutator, expected){
  const input = receiverLiveContextHandoffUtilityRepeatabilityInputV047();
  mutator(input);
  const issues = validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput(input);
  assert(issues.some((i) => i.includes(expected)), `${expected} missing in ${issues.join(',')}`);
}
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned('../evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned('../../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned('implementation/../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'), /path_not_pinned_pre_read/);
const cases = [
  [(i)=>{ i.sourceArtifactPath = '../evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactSha256 = 'bad'; }, 'digest_not_pinned'],
  [(i)=>{ i.sourceArtifact.artifact = 'spoof'; }, 'artifact_not_expected'],
  [(i)=>{ i.sourceArtifact.reportMarkdown = 'changed'; }, 'reportMarkdown_digest_not_expected'],
  [(i)=>{ i.sourceArtifact.metrics.receiverUsefulnessRatio = 0.8; }, 'metrics.receiverUsefulnessRatio_not_expected'],
  [(i)=>{ i.sourceArtifact.handoffItems[0].sourceBound = false; }, 'handoffItems_boundary_or_source_invalid'],
  [(i)=>{ i.sourceArtifact.handoffItems.pop(); }, 'handoffItems_not_exact_expected_count'],
  [(i)=>{ i.sourceArtifact.protocol.policyDecision = null; }, 'protocol_repeats_policyDecision'],
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
console.log(JSON.stringify({ rejectedNegativeControls: cases.length, preReadPathPinningControls: 3 }));
