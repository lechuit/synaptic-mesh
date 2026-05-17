import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-live-input-source-boundary-contracts-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/live-input-source-boundary-contracts.json');
const evidencePath = resolve(packageRoot, 'evidence/live-input-source-boundary-contracts.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

const allowedSourceKinds = new Set(['manual_redacted_bundle', 'manual_control_message']);
const requiredForbiddenEffects = [
  'live_traffic_read',
  'raw_input_persistence',
  'live_observer',
  'runtime_integration',
  'daemon',
  'watcher',
  'adapter_integration',
  'tool_execution',
  'memory_write',
  'config_write',
  'external_publication',
  'publication_automation',
  'approval_path',
  'blocking',
  'allowing',
  'authorization',
  'deletion',
  'retention_scheduler',
  'enforcement',
];
const requiredBoundary = [
  'manual_offline_only',
  'committed_fixtures_only',
  'already_redacted_input_only',
  'explicit_source_tuple_required',
  'local_evidence_output_only',
  'record_only',
  'no_live_traffic_read',
  'no_raw_input_persistence',
  'no_live_observation',
  'no_runtime',
  'no_daemon',
  'no_watcher',
  'no_adapter_integration',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_external_publication',
  'no_publication_automation',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_deletion',
  'no_retention_scheduler',
  'no_enforcement',
];

assert.equal(fixture.schemaVersion, 'live-input-source-boundary-contracts-v0');
assert.equal(fixture.mode, 'manual_offline_live_input_source_boundary_contract_only');
assert.match(fixture.description, /local and already-redacted/);
assert.match(fixture.description, /do not read live traffic/);
assert.match(fixture.description, /persist raw input/);
assert.match(fixture.description, /schedule retention\/deletion/);
for (const boundaryLabel of requiredBoundary) assert.ok(fixture.boundary.includes(boundaryLabel), `fixture boundary must include ${boundaryLabel}`);

function isSha256(value) {
  return /^sha256:[a-f0-9]{64}$/i.test(String(value ?? ''));
}

function isTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function evaluateBoundary(row) {
  const reasonCodes = [];
  if (!allowedSourceKinds.has(row.sourceKind)) reasonCodes.push('LIVE_INPUT_SOURCE_KIND_FORBIDDEN');
  if (row.inputBoundary !== 'already_redacted') reasonCodes.push('LIVE_INPUT_ALREADY_REDACTED_REQUIRED');
  if (row.rawInputPersisted === true) reasonCodes.push('LIVE_INPUT_RAW_PERSISTENCE_FORBIDDEN');
  if (!row.sourceArtifactId) reasonCodes.push('SOURCE_ARTIFACT_ID_REQUIRED');
  if (!row.sourceArtifactPath) reasonCodes.push('SOURCE_ARTIFACT_PATH_REQUIRED');
  if (!isSha256(row.sourceDigest)) reasonCodes.push('SOURCE_DIGEST_REQUIRED');
  if (!isTimestamp(row.sourceMtime)) reasonCodes.push('SOURCE_MTIME_REQUIRED');
  if (!row.sourceRunId) reasonCodes.push('SOURCE_RUN_ID_REQUIRED');
  if (!isTimestamp(row.receiverNow)) reasonCodes.push('RECEIVER_NOW_REQUIRED');
  if (row.outputBoundary !== 'record_only_local_evidence') reasonCodes.push('LIVE_OUTPUT_RECORD_ONLY_REQUIRED');

  const forbiddenEffects = new Set(row.forbiddenEffects ?? []);
  const missingForbiddenEffects = requiredForbiddenEffects.filter((effect) => !forbiddenEffects.has(effect));
  if (missingForbiddenEffects.length > 0) reasonCodes.push('FORBIDDEN_EFFECT_TUPLE_INCOMPLETE');
  if (row.liveObserverImplemented === true) reasonCodes.push('LIVE_OBSERVER_FORBIDDEN');
  if (row.runtimeIntegrationImplemented === true) reasonCodes.push('RUNTIME_INTEGRATION_FORBIDDEN');
  if (row.daemonImplemented === true) reasonCodes.push('DAEMON_FORBIDDEN');
  if (row.watcherImplemented === true) reasonCodes.push('WATCHER_FORBIDDEN');
  if (row.adapterIntegrationImplemented === true) reasonCodes.push('ADAPTER_INTEGRATION_FORBIDDEN');
  if (row.toolExecutionImplemented === true) reasonCodes.push('TOOL_EXECUTION_FORBIDDEN');
  if (row.memoryWriteImplemented === true) reasonCodes.push('MEMORY_WRITE_FORBIDDEN');
  if (row.configWriteImplemented === true) reasonCodes.push('CONFIG_WRITE_FORBIDDEN');
  if (row.externalPublicationImplemented === true) reasonCodes.push('EXTERNAL_PUBLICATION_FORBIDDEN');
  if (row.publicationAutomationImplemented === true) reasonCodes.push('PUBLICATION_AUTOMATION_FORBIDDEN');
  if (row.approvalPathImplemented === true) reasonCodes.push('APPROVAL_PATH_FORBIDDEN');
  if (row.blockingImplemented === true) reasonCodes.push('BLOCKING_FORBIDDEN');
  if (row.allowingImplemented === true) reasonCodes.push('ALLOWING_FORBIDDEN');
  if (row.authorizationImplemented === true) reasonCodes.push('AUTHORIZATION_FORBIDDEN');
  if (row.deletionImplemented === true) reasonCodes.push('DELETION_FORBIDDEN');
  if (row.retentionSchedulerImplemented === true) reasonCodes.push('RETENTION_SCHEDULER_FORBIDDEN');
  if (row.enforcementImplemented === true) reasonCodes.push('ENFORCEMENT_FORBIDDEN');

  return {
    caseId: row.caseId,
    boundaryGate: reasonCodes.length === 0 ? 'pass' : 'reject',
    reasonCodes: [...new Set(reasonCodes)].sort(),
    missingForbiddenEffects,
    sourceKind: row.sourceKind,
    inputBoundary: row.inputBoundary,
    outputBoundary: row.outputBoundary,
    sourceTupleComplete: Boolean(row.sourceArtifactId && row.sourceArtifactPath && isSha256(row.sourceDigest) && isTimestamp(row.sourceMtime) && row.sourceRunId && isTimestamp(row.receiverNow)),
    boundary: 'manual_offline_live_input_source_boundary_contract_only',
  };
}

const passResults = fixture.passCases.map(evaluateBoundary);
const rejectResults = fixture.rejectCases.map(evaluateBoundary);

for (const result of passResults) {
  assert.equal(result.boundaryGate, 'pass', `${result.caseId} boundary gate must pass`);
  assert.deepEqual(result.reasonCodes, [], `${result.caseId} must have no reason codes`);
  assert.equal(result.sourceTupleComplete, true, `${result.caseId} must have complete source tuple`);
}

for (const [index, result] of rejectResults.entries()) {
  const expectedReasonCodes = fixture.rejectCases[index].expectedReasonCodes;
  assert.equal(result.boundaryGate, 'reject', `${result.caseId} boundary gate must reject`);
  for (const expectedReasonCode of expectedReasonCodes) {
    assert.ok(result.reasonCodes.includes(expectedReasonCode), `${result.caseId} must include ${expectedReasonCode}; got ${result.reasonCodes.join(', ')}`);
  }
}

const unexpectedPasses = rejectResults.filter((result) => result.boundaryGate !== 'reject');
const unexpectedRejects = passResults.filter((result) => result.boundaryGate !== 'pass');
const coveredReasonCodes = [...new Set(rejectResults.flatMap((result) => result.reasonCodes))].sort();

assert.equal(passResults.length, 2, 'fixture must keep two positive controls');
assert.equal(rejectResults.length, 9, 'fixture must keep nine expected rejects');
assert.deepEqual(unexpectedPasses, [], 'reject cases must not pass');
assert.deepEqual(unexpectedRejects, [], 'pass cases must not reject');
for (const reasonCode of [
  'LIVE_INPUT_SOURCE_KIND_FORBIDDEN',
  'LIVE_INPUT_ALREADY_REDACTED_REQUIRED',
  'LIVE_INPUT_RAW_PERSISTENCE_FORBIDDEN',
  'SOURCE_DIGEST_REQUIRED',
  'SOURCE_MTIME_REQUIRED',
  'LIVE_OUTPUT_RECORD_ONLY_REQUIRED',
  'FORBIDDEN_EFFECT_TUPLE_INCOMPLETE',
  'LIVE_OBSERVER_FORBIDDEN',
  'RUNTIME_INTEGRATION_FORBIDDEN',
  'DAEMON_FORBIDDEN',
  'WATCHER_FORBIDDEN',
  'PUBLICATION_AUTOMATION_FORBIDDEN',
  'DELETION_FORBIDDEN',
  'RETENTION_SCHEDULER_FORBIDDEN',
]) {
  assert.ok(coveredReasonCodes.includes(reasonCode), `fixture must cover ${reasonCode}`);
}

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T04:35:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/live-input-source-boundary-contracts.json',
    passCases: passResults.length,
    expectedRejects: rejectResults.length,
    unexpectedPasses: unexpectedPasses.length,
    unexpectedRejects: unexpectedRejects.length,
    requiredTuple: fixture.requiredTuple,
    coveredReasonCodes,
    mode: 'manual_offline_live_input_source_boundary_contract_only',
    liveInputRead: false,
    rawInputPersisted: false,
    liveObserverImplemented: false,
    runtimeIntegrationImplemented: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    publicationAutomationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    deletionImplemented: false,
    retentionSchedulerImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'live_input_source_boundary_contracts_over_committed_already_redacted_fixtures_only_no_live_traffic_no_raw_input_persistence_no_live_observer_no_runtime_no_daemon_no_watcher_no_adapter_no_tool_execution_no_memory_write_no_config_write_no_publication_automation_no_approval_no_blocking_no_allowing_no_authorization_no_deletion_no_retention_scheduler_no_enforcement',
  },
  passResults,
  rejectResults,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
