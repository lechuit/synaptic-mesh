import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.2.1');
assert.equal(fixture.dependsOn, 'v0.1.22-passive-live-shadow-simulator');
assert.equal(fixture.canaryMode, 'manual_local_opt_in_passive');
assert.equal(fixture.inputBoundary, 'already_redacted_local_canary_packet_only');
assert.equal(fixture.observerMode, 'passive');
assert.equal(fixture.observerAction, 'record_only');
assert.equal(fixture.effectBoundary, 'no_effects');
assert.equal(fixture.writeBoundary, 'local_evidence_only');
assert.equal(fixture.optInRequired, true);
for (const required of [
  'live_traffic_read',
  'raw_input_persistence',
  'live_observer_daemon',
  'runtime_integration',
  'watcher',
  'adapter_integration',
  'tool_execution',
  'memory_write',
  'config_write',
  'external_publication',
  'approval_path',
  'blocking',
  'allowing',
  'authorization',
  'deletion',
  'retention_scheduler',
  'enforcement',
]) {
  assert.ok(fixture.forbiddenEffects.includes(required), `canary must forbid ${required}`);
}

function digestLooksValid(value) {
  return /^sha256:[a-f0-9]{64}$/.test(value ?? '');
}

function capability(record, field) {
  return record.capabilities?.[field] === true;
}

function evaluate(record) {
  const reasonCodes = [];
  if (record.optIn !== true) reasonCodes.push('CANARY_OPT_IN_REQUIRED');
  if (record.sourceKind !== 'manual_redacted_canary_packet') reasonCodes.push('CANARY_LIVE_SOURCE_FORBIDDEN');
  if (record.inputBoundary !== 'already_redacted') reasonCodes.push('CANARY_ALREADY_REDACTED_REQUIRED');
  if (record.rawInputPersisted === true) reasonCodes.push('CANARY_RAW_PERSISTENCE_FORBIDDEN');
  if (record.liveTrafficRead === true) reasonCodes.push('CANARY_LIVE_TRAFFIC_READ_FORBIDDEN');
  if (record.outputBoundary !== 'record_only_local_evidence') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.observerMode !== 'passive') reasonCodes.push('CANARY_PASSIVE_MODE_REQUIRED');
  if (record.observerAction !== 'record_only') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.effectBoundary !== 'no_effects') reasonCodes.push('CANARY_NO_EFFECTS_REQUIRED');
  if (record.runtimeIntegration === true) reasonCodes.push('CANARY_RUNTIME_FORBIDDEN');
  if (record.daemonStarted === true) reasonCodes.push('CANARY_DAEMON_FORBIDDEN');
  if (record.watcherStarted === true) reasonCodes.push('CANARY_WATCHER_FORBIDDEN');
  if (record.adapterIntegrated === true) reasonCodes.push('CANARY_ADAPTER_FORBIDDEN');
  if (record.toolExecuted === true || capability(record, 'mayExecuteTool')) reasonCodes.push('CANARY_TOOL_EXECUTION_FORBIDDEN');
  if (record.memoryWritten === true || capability(record, 'mayWriteMemory')) reasonCodes.push('CANARY_MEMORY_WRITE_FORBIDDEN');
  if (record.configWritten === true || capability(record, 'mayWriteConfig')) reasonCodes.push('CANARY_CONFIG_WRITE_FORBIDDEN');
  if (record.publishedExternally === true || capability(record, 'mayPublishExternally')) reasonCodes.push('CANARY_PUBLICATION_FORBIDDEN');
  if (record.publicationAutomation === true) reasonCodes.push('CANARY_PUBLICATION_AUTOMATION_FORBIDDEN');
  if (record.agentInstructionWritten === true || capability(record, 'mayModifyAgentInstructions')) reasonCodes.push('CANARY_AGENT_INSTRUCTION_WRITE_FORBIDDEN');
  if (record.approvalEntered === true || capability(record, 'mayEnterApprovalPath')) reasonCodes.push('CANARY_APPROVAL_FORBIDDEN');
  if (record.blocked === true || capability(record, 'mayBlock')) reasonCodes.push('CANARY_BLOCKING_FORBIDDEN');
  if (record.allowed === true || capability(record, 'mayAllow')) reasonCodes.push('CANARY_ALLOWING_FORBIDDEN');
  if (record.authorizesAction === true) reasonCodes.push('CANARY_AUTHORIZATION_FORBIDDEN');
  if (record.deleted === true) reasonCodes.push('CANARY_DELETION_FORBIDDEN');
  if (record.retentionSchedulerStarted === true) reasonCodes.push('CANARY_RETENTION_SCHEDULER_FORBIDDEN');
  if (record.enforced === true) reasonCodes.push('CANARY_ENFORCEMENT_FORBIDDEN');

  const requiredSourceFields = ['sourceArtifactId', 'sourceArtifactPath', 'sourceDigest', 'sourceMtime', 'receiverNow'];
  for (const field of requiredSourceFields) {
    if (!record[field]) reasonCodes.push('CANARY_SOURCE_TUPLE_REQUIRED');
  }
  if (record.sourceDigest && !digestLooksValid(record.sourceDigest)) reasonCodes.push('CANARY_SOURCE_DIGEST_REQUIRED');

  return {
    caseId: record.caseId,
    accepted: reasonCodes.length === 0,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    recordOnly: record.observerAction === 'record_only' && record.outputBoundary === 'record_only_local_evidence',
    forbiddenEffectsDetected: reasonCodes.filter((code) => code.endsWith('_FORBIDDEN')),
    capabilityTrueCount: effectCapabilityFields.filter((field) => capability(record, field)).length,
  };
}

const passResults = fixture.passCases.map(evaluate);
const rejectResults = fixture.rejectCases.map(evaluate);

for (const result of passResults) {
  assert.equal(result.accepted, true, `${result.caseId} should pass: ${result.reasonCodes.join(', ')}`);
  assert.equal(result.capabilityTrueCount, 0, `${result.caseId} capability booleans must remain false`);
}
for (const [index, result] of rejectResults.entries()) {
  const expected = fixture.rejectCases[index].expectedReasonCodes;
  assert.equal(result.accepted, false, `${result.caseId} should reject`);
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.caseId} should include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const acceptedCount = passResults.filter((result) => result.accepted).length;
const unexpectedRejects = passResults.filter((result) => !result.accepted);
const unexpectedAccepts = rejectResults.filter((result) => result.accepted);
const forbiddenEffectsDetectedCount = [...passResults, ...rejectResults].reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);
const capabilityTrueCount = passResults.reduce((sum, result) => sum + result.capabilityTrueCount, 0);

assert.equal(acceptedCount, fixture.passCases.length);
assert.deepEqual(unexpectedRejects, []);
assert.deepEqual(unexpectedAccepts, []);
assert.equal(capabilityTrueCount, 0, 'passing canary cases must keep capability booleans false');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T12:00:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    dependsOn: fixture.dependsOn,
    canaryMode: fixture.canaryMode,
    passCases: fixture.passCases.length,
    rejectCases: fixture.rejectCases.length,
    acceptedCount,
    unexpectedAccepts: unexpectedAccepts.length,
    unexpectedRejects: unexpectedRejects.length,
    forbiddenEffectsDetectedCount,
    passCapabilityTrueCount: capabilityTrueCount,
    manual: true,
    local: true,
    optInRequired: true,
    recordOnly: true,
    noEffects: true,
    liveTrafficRead: false,
    rawInputPersisted: false,
    publicationAutomationImplemented: false,
    agentInstructionWriteImplemented: false,
    runtimeIntegrated: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrated: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    deletionImplemented: false,
    retentionSchedulerImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'first_passive_live_shadow_canary_contract_manual_local_opt_in_record_only_no_effects_not_runtime_not_live_daemon_not_authorization',
  },
  passResults,
  rejectResults,
  boundary: fixture.forbiddenEffects,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
