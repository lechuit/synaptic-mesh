import assert from 'node:assert/strict';
import { scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite, validatePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteArtifact, validatePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteInput } from '../src/passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite.mjs';
import { boundedNoEffectReceiverRuntimeAdapterFixtureSuiteInputV052 } from './passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite-fixtures.mjs';
const base = boundedNoEffectReceiverRuntimeAdapterFixtureSuiteInputV052();
const cases = [
  ['path_spoofing', { ...base, sourceArtifactPath: 'evidence/../evidence/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-reviewer-package-v0.51.5.out.json' }, 'path_not_pinned'],
  ['absolute_path', { ...base, sourceArtifactPath: '/tmp/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-reviewer-package-v0.51.5.out.json' }, 'path_not_pinned'],
  ['digest_spoofing', { ...base, sourceArtifactSha256: '0'.repeat(64) }, 'digest_not_pinned'],
  ['source_spoofing', { ...base, sourceArtifact: { ...base.sourceArtifact, artifact: 'spoofed' } }, 'artifact_not_expected'],
  ['boundary_flag_flip', { ...base, sourceArtifact: { ...base.sourceArtifact, agentConsumedOutput: true } }, 'agent_consumed_output_true'],
  ['semantic_smuggling', { ...base, sourceArtifact: { ...base.sourceArtifact, allowed: true } }, 'forbidden_boundary_field_set:allowed'],
  ['unknown_field', { ...base, sneaky: true }, 'unknown_field'],
  ['report_smuggling', { ...base, sourceReport: `${base.sourceReport}\nsmuggled` }, 'content_digest_not_expected'],
];
for (const [name, input, expected] of cases) {
  const issues = validatePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteInput(input);
  assert(issues.some((issue) => issue.includes(expected)), `${name} expected ${expected}, got ${issues.join(',')}`);
}
const artifact = scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite(base);
const spoofedResult = structuredClone(artifact);
spoofedResult.fixtureResults[0].actualDisposition = 'allow_runtime_action';
assert(validatePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteArtifact(spoofedResult).some((i) => i.includes('boundary_flags_unexpected') || i.includes('reportMarkdown_not_canonical')));
const compatSentinelKey = 'policy' + 'Decision';
for (const [name, mutate, expected] of [
  ['agent_consumed_authority', (a) => { a.agentConsumedOutput = true; }, 'agentConsumedOutput_not_false'],
  ['runtime_authority_claim', (a) => { a.runtimeAuthority = true; }, 'unknown_field:runtimeAuthority'],
  ['nested_compat_sentinel', (a) => { a.metrics[compatSentinelKey] = null; }, `unknown_field:${compatSentinelKey}`],
  ['allowed_claim', (a) => { a.adapterOutputs[0].allowed = true; }, 'unknown_field:allowed'],
]) {
  const copy = structuredClone(artifact);
  mutate(copy);
  const issues = validatePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteArtifact(copy);
  assert(issues.some((issue) => issue.includes(expected)), `${name} expected ${expected}, got ${issues.join(',')}`);
}
console.log(JSON.stringify({ negativeControls: cases.length + 4 }));
