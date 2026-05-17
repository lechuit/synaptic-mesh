import assert from 'node:assert/strict';
import { validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput, assertPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInputPathPinned } from '../src/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard.mjs';
import { receiverUsefulnessRepeatabilityInputV043 } from './passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-fixtures.mjs';
function rejects(mutator, expected){
  const input = receiverUsefulnessRepeatabilityInputV043();
  mutator(input);
  const issues = validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput(input);
  assert(issues.some((i) => i.includes(expected)), `${expected} missing in ${issues.join(',')}`);
}
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInputPathPinned('../evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInputPathPinned('../../implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'), /path_not_pinned_pre_read/);
const cases = [
  [(i)=>{ i.sourceArtifactPath = '../evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactSha256 = 'bad'; }, 'digest_not_pinned'],
  [(i)=>{ i.sourceArtifact.artifact = 'spoof'; }, 'artifact_not_expected'],
  [(i)=>{ i.sourceArtifact.reportMarkdown = 'changed'; }, 'reportMarkdown_digest_not_expected'],
  [(i)=>{ i.sourceArtifact.metrics.receiverUsefulnessRatio = 0.8; }, 'metrics.receiverUsefulnessRatio_not_expected'],
  [(i)=>{ i.sourceArtifact.usefulnessJudgements[0].sourceBound = false; }, 'sourceArtifact.artifact.judgement'],
  [(i)=>{ i.sourceArtifact.usefulnessJudgements.pop(); }, 'usefulnessJudgements_not_exact_expected_count'],
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
