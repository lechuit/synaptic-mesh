import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  assertPassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInputPathPinned,
  validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput,
  validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalArtifact,
  scorePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsal,
} from '../src/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal.mjs';
import { receiverRuntimeInvocationShimRehearsalInputV051 } from './passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-fixtures.mjs';

assert.throws(()=>assertPassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInputPathPinned('/tmp/source.json'));
assert.throws(()=>assertPassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInputPathPinned('../source.json'));
const base = receiverRuntimeInvocationShimRehearsalInputV051();
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifactSha256: '0'.repeat(64) }).includes('input.source_artifact_digest_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceReportSha256: '0'.repeat(64) }).includes('input.source_report_digest_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, rehearsalStatus: 'DRIFT' } }).some((i)=>i.includes('status_not_complete')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, metrics: { ...base.sourceArtifact.metrics, consumedContextBlockCount: 3 } } }).some((i)=>i.includes('consumedContextBlockCount')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, consumedContextBlocks: [{ ...base.sourceArtifact.consumedContextBlocks[0], sourceSha256: 'tampered' }] } }).some((i)=>/digest|source|boundary|unexpected|invalid/i.test(i)));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, extra: true }).includes('input.unknown_field:extra'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, protocol: { ...base.sourceArtifact.protocol, ['policy'+'Decision']: null } } }).some((i)=>i.includes('protocol_repeats_compat_sentinel') || i.includes('nested_compat_sentinel')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, rawOutput: 'leak' } }).some((i)=>i.includes('rawOutput')));
for (const field of ['toolExecution','networkFetch','memoryWrite','configWrite','externalEffects','runtimeIntegration','authorization','enforcement','allowed']) {
  assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, [field]: true } }).some((i)=>i.includes(field)), field);
}
const artifact = scorePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsal(base);
function assertArtifactIssue(mutator, expectedPattern){
  const mutated = structuredClone(artifact);
  mutator(mutated);
  const issues = validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalArtifact(mutated);
  assert(issues.some((i)=>expectedPattern.test(i)), `${expectedPattern} missing in ${issues.join(',')}`);
}
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalArtifact({ ...artifact, recommendationIsAuthority: true }).some((i)=>i.includes('authority')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalArtifact({ ...artifact, sourceArtifactPath: 'evidence/evil.json' }).includes('artifact.source_artifact_path_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeInvocationShimRehearsalArtifact({ ...artifact, sourceReportPath: '../report.md' }).includes('artifact.source_report_path_not_pinned'));
for (const flag of ['noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects','noRuntimeAuthority','notRuntimeInstruction','nonAuthoritative','localOnly','rehearsalOnly','readOnly']) {
  assertArtifactIssue((a)=>{ a[flag] = false; }, new RegExp(`artifact\\.${flag}_not_true`));
  if (flag in artifact.protocol) assertArtifactIssue((a)=>{ a.protocol[flag] = false; }, new RegExp(`artifact\\.protocol\\.${flag}_not_true`));
}
for (const flag of ['rawPersisted','recommendationIsAuthority','agentConsumedOutput']) {
  assertArtifactIssue((a)=>{ a[flag] = true; }, new RegExp(`artifact\\.${flag}_not_false|authority|agent_consumed|raw_persisted`));
  if (flag in artifact.protocol) assertArtifactIssue((a)=>{ a.protocol[flag] = true; }, new RegExp(`artifact\\.protocol\\.${flag}_not_false|authority|agent_consumed|raw_persisted`));
}
assertArtifactIssue((a)=>{ a.shimInputEnvelope.localOnly = false; }, /shimInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.shimInputEnvelope.rehearsalOnly = false; }, /shimInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.shimInputEnvelope.notRuntimeInstruction = false; }, /shimInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.shimInputEnvelope.effectDisposition = 'effects_allowed'; }, /shimInputEnvelope\.effectDisposition_unexpected/);
assertArtifactIssue((a)=>{ a.shimInputEnvelope.invokeMode = 'runtime_context'; }, /shimInputEnvelope\.invokeMode_unexpected/);
assertArtifactIssue((a)=>{ a.shimInvocationTrace[0].effectBlocked = false; }, /shimInvocationTrace\[0\]\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.shimInvocationTrace[0].shimFunction = 'executeRuntime'; }, /shimInvocationTrace\[0\]\.shimFunction_unexpected/);
assertArtifactIssue((a)=>{ a.shimOutputs[0].nonAuthoritative = false; }, /shimOutputs\[0\]\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.shimOutputs[0].result = 'execute_tool'; }, /shimOutputs\[0\]\.result_unexpected/);
assertArtifactIssue((a)=>{ a.contextHandoffResult.agentConsumedOutput = true; }, /contextHandoffResult\.boundary_flags_unexpected|agent_consumed_output_true/);
assertArtifactIssue((a)=>{ a.blockedEffects[0].status = 'allowed_now'; }, /blockedEffects\[0\]\.status_unexpected/);
assertArtifactIssue((a)=>{ a.blockedEffects[0].effectKind = 'unexpected_effect'; }, /blockedEffects\[0\]\.effectKind_unexpected/);
assertArtifactIssue((a)=>{ a.reportMarkdown += '\nrawOutput: secret\nruntimeAuthority: true\nagentConsumedOutput: true'; }, /reportMarkdown_not_canonical/);
const defaultBinRun = spawnSync(process.execPath, ['bin/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal.mjs'], { cwd: process.cwd(), encoding: 'utf8' });
assert.equal(defaultBinRun.status, 0, defaultBinRun.stderr || defaultBinRun.stdout);
const defaultBinStdout = JSON.parse(defaultBinRun.stdout);
assert.equal(defaultBinStdout.localShimInvocationCount, 4);
assert.equal(defaultBinStdout.shimOutputCount, 4);
assert(!Object.prototype.hasOwnProperty.call(defaultBinStdout, 'policy' + 'Decision'));
console.log(JSON.stringify({ negativeControls: 'passed', defaultBinPathResolution: 'passed', artifactPathSpoofRejected: true, artifactSemanticSpoofRejected: true, reportMarkdownSmugglingRejected: true }));
