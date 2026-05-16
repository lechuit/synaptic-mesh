import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInputPathPinned,
  validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput,
  validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact,
  scorePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsal,
} from '../src/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal.mjs';
import { receiverRuntimeTestHarnessConsumptionRehearsalInputV050 } from './passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-fixtures.mjs';

assert.throws(()=>assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInputPathPinned('/tmp/source.json'));
assert.throws(()=>assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInputPathPinned('../source.json'));

const base = receiverRuntimeTestHarnessConsumptionRehearsalInputV050();
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifactSha256: '0'.repeat(64) }).includes('input.source_artifact_digest_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceReportSha256: '0'.repeat(64) }).includes('input.source_report_digest_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, rehearsalStatus: 'DRIFT' } }).some((i)=>i.includes('status_not_complete')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, metrics: { ...base.sourceArtifact.metrics, receiverFacingContextBlockCount: 3 } } }).some((i)=>i.includes('receiverFacingContextBlockCount')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, receiverFacingContextBlocks: [{ ...base.sourceArtifact.receiverFacingContextBlocks[0], sourceSha256: 'tampered' }] } }).some((i)=>/digest|source|boundary|unexpected|invalid/i.test(i)));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, extra: true }).includes('input.unknown_field:extra'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, protocol: { ...base.sourceArtifact.protocol, ['policy'+'Decision']: null } } }).some((i)=>i.includes('protocol_repeats_compat_sentinel') || i.includes('nested_compat_sentinel')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, rawOutput: 'leak' } }).some((i)=>i.includes('rawOutput')));
for (const field of ['toolExecution','networkFetch','memoryWrite','configWrite','externalEffects','runtimeIntegration','authorization','enforcement']) {
  assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput({ ...base, sourceArtifact: { ...base.sourceArtifact, [field]: true } }).some((i)=>i.includes(field)), field);
}
const artifact = scorePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsal(base);
function assertArtifactIssue(mutator, expectedPattern){
  const mutated = structuredClone(artifact);
  mutator(mutated);
  const issues = validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact(mutated);
  assert(issues.some((i)=>expectedPattern.test(i)), `${expectedPattern} missing in ${issues.join(',')}`);
}
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact({ ...artifact, recommendationIsAuthority: true }).some((i)=>i.includes('authority')));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact({ ...artifact, sourceArtifactPath: 'evidence/evil.json' }).includes('artifact.source_artifact_path_not_pinned'));
assert(validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact({ ...artifact, sourceReportPath: '../report.md' }).includes('artifact.source_report_path_not_pinned'));
for (const flag of ['noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects','noRuntimeAuthority','notRuntimeInstruction','nonAuthoritative','localOnly','rehearsalOnly','readOnly']) {
  assertArtifactIssue((a)=>{ a[flag] = false; }, new RegExp(`artifact\\.${flag}_not_true`));
  if (flag in artifact.protocol) assertArtifactIssue((a)=>{ a.protocol[flag] = false; }, new RegExp(`artifact\\.protocol\\.${flag}_not_true`));
}
for (const flag of ['rawPersisted','recommendationIsAuthority','agentConsumedOutput']) {
  assertArtifactIssue((a)=>{ a[flag] = true; }, new RegExp(`artifact\\.${flag}_not_false|authority|agent_consumed|raw_persisted`));
  if (flag in artifact.protocol) assertArtifactIssue((a)=>{ a.protocol[flag] = true; }, new RegExp(`artifact\\.protocol\\.${flag}_not_false|authority|agent_consumed|raw_persisted`));
}
assertArtifactIssue((a)=>{ a.harnessInputEnvelope.localOnly = false; }, /harnessInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.harnessInputEnvelope.rehearsalOnly = false; }, /harnessInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.harnessInputEnvelope.notRuntimeInstruction = false; }, /harnessInputEnvelope\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.harnessInputEnvelope.effectDisposition = 'effects_allowed'; }, /harnessInputEnvelope\.effectDisposition_unexpected/);
assertArtifactIssue((a)=>{ a.harnessInputEnvelope.parseMode = 'runtime_context'; }, /harnessInputEnvelope\.parseMode_unexpected/);
assertArtifactIssue((a)=>{ a.receiverHarnessTrace[0].effectBlocked = false; }, /receiverHarnessTrace\[0\]\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.receiverHarnessTrace[0].operation = 'execute_runtime'; }, /receiverHarnessTrace\[0\]\.operation_unexpected/);
assertArtifactIssue((a)=>{ a.consumptionDecisions[0].nonAuthoritative = false; }, /consumptionDecisions\[0\]\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.consumptionDecisions[0].effect = 'execute_tool'; }, /consumptionDecisions\[0\]\.boundary_flags_unexpected/);
assertArtifactIssue((a)=>{ a.consumptionDecisions[0].decisionKind = 'runtime_decision'; }, /consumptionDecisions\[0\]\.decisionKind_unexpected/);
assertArtifactIssue((a)=>{ a.blockedEffects[0].status = 'allowed_now'; }, /blockedEffects\[0\]\.status_unexpected/);
assertArtifactIssue((a)=>{ a.blockedEffects[0].effectKind = 'unexpected_effect'; }, /blockedEffects\[0\]\.effectKind_unexpected/);
assertArtifactIssue((a)=>{ a.reportMarkdown += '\nrawOutput: secret\nruntimeAuthority: true\nagentConsumedOutput: true'; }, /reportMarkdown_not_canonical/);

const defaultBinRun = spawnSync(process.execPath, ['bin/passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal.mjs'], { cwd: process.cwd(), encoding: 'utf8' });
assert.equal(defaultBinRun.status, 0, defaultBinRun.stderr || defaultBinRun.stdout);
const defaultBinStdout = JSON.parse(defaultBinRun.stdout);
assert.equal(defaultBinStdout.consumedContextBlockCount, 4);
assert.equal(defaultBinStdout.harnessParseSuccessCount, 4);
assert(!Object.prototype.hasOwnProperty.call(defaultBinStdout, 'policy' + 'Decision'));
console.log(JSON.stringify({ negativeControls: 'passed', defaultBinPathResolution: 'passed', artifactPathSpoofRejected: true, artifactSemanticSpoofRejected: true, reportMarkdownSmugglingRejected: true }));
