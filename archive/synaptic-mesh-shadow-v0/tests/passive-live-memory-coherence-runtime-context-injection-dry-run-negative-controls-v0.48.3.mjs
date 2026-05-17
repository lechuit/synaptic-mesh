import assert from 'node:assert/strict';
import { validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput, assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInputPathPinned } from '../src/passive-live-memory-coherence-runtime-context-injection-dry-run.mjs';
import { runtimeContextInjectionDryRunInputV048 } from './passive-live-memory-coherence-runtime-context-injection-dry-run-fixtures.mjs';
function rejects(mutator, expected){
  const input = runtimeContextInjectionDryRunInputV048();
  mutator(input);
  const issues = validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput(input);
  assert(issues.some((i) => i.includes(expected)), `${expected} missing in ${issues.join(',')}`);
}
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInputPathPinned('../evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInputPathPinned('/tmp/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json'), /path_not_pinned_pre_read/);
const cases = [
  [(i)=>{ i.sourceArtifactPath = '../evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactPath = '/tmp/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactSha256 = 'bad'; }, 'digest_not_pinned'],
  [(i)=>{ i.sourceArtifact.artifact = 'spoof'; }, 'artifact_not_expected'],
  [(i)=>{ i.sourceArtifact.metrics.stableHandoffItemCount = 4; }, 'stableHandoffItemCount_not_expected'],
  [(i)=>{ i.sourceArtifact.stableHandoffUtilityJudgements[0].sourceBound = false; }, 'boundary_or_source_invalid'],
  [(i)=>{ i.sourceArtifact.stableHandoffUtilityJudgements.pop(); }, 'not_exact_expected_count'],
  [(i)=>{ i.extra = true; }, 'unknown_field'],
  [(i)=>{ i.networkFetch = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.configWrite = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.memoryWrite = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.toolExecution = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.runtimeIntegration = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.policyDecision = 'ALLOW'; }, 'policyDecision_non_null'],
  [(i)=>{ i.recommendationIsAuthority = true; }, 'recommendation_treated_as_authority'],
  [(i)=>{ i.agentConsumedOutput = true; }, 'agent_consumed_output_true'],
];
for (const [mutator, expected] of cases) rejects(mutator, expected);
console.log(JSON.stringify({ rejectedNegativeControls: cases.length, preReadPathPinningControls: 2 }));
