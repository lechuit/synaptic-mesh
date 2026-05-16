import assert from 'node:assert/strict';
import { validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInput, assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInputPathPinned, assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReportPathPinned } from '../src/passive-live-memory-coherence-runtime-context-injection-rehearsal.mjs';
import { runtimeContextInjectionRehearsalInputV049 } from './passive-live-memory-coherence-runtime-context-injection-rehearsal-fixtures.mjs';
function rejects(mutator, expected){
  const input = runtimeContextInjectionRehearsalInputV049();
  mutator(input);
  const issues = validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInput(input);
  assert(issues.some((i) => i.includes(expected)), `${expected} missing in ${issues.join(',')}`);
}
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInputPathPinned('../evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInputPathPinned('/tmp/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReportPathPinned('../evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md'), /path_not_pinned_pre_read/);
assert.throws(() => assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReportPathPinned('/tmp/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md'), /path_not_pinned_pre_read/);
const cases = [
  [(i)=>{ i.sourceArtifactPath = '../evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactPath = '/tmp/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'; }, 'path_not_pinned'],
  [(i)=>{ i.sourceArtifactSha256 = 'bad'; }, 'digest_not_pinned'],
  [(i)=>{ i.sourceReportPath = '../evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md'; }, 'source_report_path_not_pinned'],
  [(i)=>{ i.sourceReportSha256 = 'bad'; }, 'source_report_digest_not_pinned'],
  [(i)=>{ i.sourceReport += 'drift'; }, 'source_report_content_digest_not_expected'],
  [(i)=>{ i.sourceArtifact.reportMarkdown += 'drift'; }, 'reportMarkdown_digest_not_expected'],
  [(i)=>{ i.sourceArtifact.artifact = 'spoof'; }, 'artifact_not_expected'],
  [(i)=>{ i.sourceArtifact.dryRunStatus = 'INCOMPLETE'; }, 'status_not_complete'],
  [(i)=>{ i.sourceArtifact.metrics.runtimeContextCardCount = 4; }, 'runtimeContextCardCount_not_expected'],
  [(i)=>{ i.sourceArtifact.runtimeContextCards[0].sourceBound = false; }, 'boundary_or_source_invalid'],
  [(i)=>{ i.sourceArtifact.runtimeContextCards.pop(); }, 'runtimeContextCards_not_exact_expected_count'],
  [(i)=>{ i.extra = true; }, 'unknown_field'],
  [(i)=>{ i.sourceArtifact.protocol = { ...(i.sourceArtifact.protocol ?? {}), ['policy' + 'Decision']: null }; }, 'protocol_repeats_compat_sentinel'],
  [(i)=>{ i.rawOutput = 'raw'; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.networkFetch = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.resourceFetch = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.configWrite = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.memoryWrite = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.toolExecution = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.runtimeIntegration = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.externalEffects = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.authorization = true; }, 'forbidden_boundary_field_set'],
  [(i)=>{ i.recommendationIsAuthority = true; }, 'recommendation_treated_as_authority'],
  [(i)=>{ i.agentConsumedOutput = true; }, 'agent_consumed_output_true'],
];
for (const [mutator, expected] of cases) rejects(mutator, expected);
console.log(JSON.stringify({ rejectedNegativeControls: cases.length, preReadPathPinningControls: 2 }));
