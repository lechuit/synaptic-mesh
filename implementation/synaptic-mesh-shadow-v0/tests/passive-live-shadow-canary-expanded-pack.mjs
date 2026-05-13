import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-expanded-pack-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-expanded-pack.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-expanded-pack.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.2.5');
assert.equal(fixture.dependsOn, 'v0.2.4-passive-canary-drift-scorecard');
assert.equal(fixture.mode, 'manual_local_opt_in_passive_expanded_canary_pack_record_only');
assert.equal(fixture.expectedSourceLane, 'manual_opt_in_redacted_canary_pack');
assert.equal(fixture.allowedOutputRoot, 'implementation/synaptic-mesh-shadow-v0/evidence/');
assert.ok(fixture.passCases.length + fixture.rejectCases.length >= 10, 'expanded pack must cover at least 10 rows');
assert.ok(fixture.passCases.length + fixture.rejectCases.length <= 20, 'expanded pack should stay reviewable at 20 rows or fewer');

for (const required of [
  'valid_redacted_packet',
  'missing_opt_in',
  'raw_input_pressure',
  'runtime_pressure',
  'memory_config_pressure',
  'publication_pressure',
  'wrong_lane',
  'stale_digest',
  'missing_mtime',
  'malformed_tuple',
  'output_containment',
  'advisory_looking_text',
  'agent_consumption_pressure',
]) {
  assert.ok(fixture.targetCoverage.includes(required), `expanded pack target coverage must include ${required}`);
}

for (const required of [
  'live_traffic_read',
  'raw_input_persistence',
  'runtime_integration',
  'daemon',
  'watcher',
  'adapter_integration',
  'tool_execution',
  'memory_write',
  'config_write',
  'external_publication',
  'publication_automation',
  'agent_instruction_write',
  'approval_path',
  'blocking',
  'allowing',
  'authorization',
  'deletion',
  'retention_scheduler',
  'enforcement',
  'automatic_agent_consumption',
  'agent_consumed_scorecard_authority',
]) {
  assert.ok(fixture.forbiddenEffects.includes(required), `expanded pack must forbid ${required}`);
}

function digestLooksValid(value) {
  return /^sha256:[a-f0-9]{64}$/.test(value ?? '');
}

function isoTimestampLooksValid(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function capability(record, field) {
  return record.capabilities?.[field] === true;
}

function pathInsideRepoEvidence(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) return false;
  if (relativePath.startsWith('/') || relativePath.includes('\\')) return false;
  const allowedRoot = resolve(repoRoot, fixture.allowedOutputRoot);
  const candidate = resolve(repoRoot, relativePath);
  return candidate === allowedRoot || candidate.startsWith(`${allowedRoot}${sep}`);
}

function evaluate(record) {
  const reasonCodes = [];

  if (record.optIn !== true) reasonCodes.push('CANARY_OPT_IN_REQUIRED');
  if (record.sourceKind !== 'manual_redacted_canary_packet') reasonCodes.push('CANARY_LIVE_SOURCE_FORBIDDEN');
  if (record.sourceLane !== fixture.expectedSourceLane) reasonCodes.push('CANARY_SOURCE_LANE_MISMATCH');
  if (record.inputBoundary !== 'already_redacted') reasonCodes.push('CANARY_ALREADY_REDACTED_REQUIRED');
  if (record.rawInputPersisted === true) reasonCodes.push('CANARY_RAW_PERSISTENCE_FORBIDDEN');
  if (record.liveTrafficRead === true) reasonCodes.push('CANARY_LIVE_TRAFFIC_READ_FORBIDDEN');
  if (record.outputBoundary !== 'record_only_local_evidence') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (!pathInsideRepoEvidence(record.outputArtifactPath)) reasonCodes.push('CANARY_OUTPUT_CONTAINMENT_REQUIRED');
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
  if (record.automaticAgentConsumption === true) reasonCodes.push('CANARY_AUTOMATIC_AGENT_CONSUMPTION_FORBIDDEN');

  const requiredSourceFields = ['sourceArtifactId', 'sourceArtifactPath', 'sourceDigest', 'sourceMtime', 'receiverNow', 'sourceLane'];
  for (const field of requiredSourceFields) {
    if (!record[field]) reasonCodes.push('CANARY_SOURCE_TUPLE_REQUIRED');
  }
  if (!isoTimestampLooksValid(record.sourceMtime)) reasonCodes.push('CANARY_SOURCE_MTIME_REQUIRED');
  if (!digestLooksValid(record.sourceDigest)) reasonCodes.push('CANARY_SOURCE_DIGEST_REQUIRED');
  if (digestLooksValid(record.sourceDigest) && digestLooksValid(record.expectedSourceDigest) && record.sourceDigest !== record.expectedSourceDigest) {
    reasonCodes.push('CANARY_SOURCE_DIGEST_STALE');
  }

  const reasonSet = [...new Set(reasonCodes)].sort();
  const capabilityTrueCount = effectCapabilityFields.filter((field) => capability(record, field)).length;
  return {
    caseId: record.caseId,
    coverageLabel: record.coverageLabel,
    accepted: reasonSet.length === 0,
    reasonCodes: reasonSet,
    sourceTupleComplete: requiredSourceFields.every((field) => Boolean(record[field])),
    digestValid: digestLooksValid(record.sourceDigest),
    sourceMtimeValid: isoTimestampLooksValid(record.sourceMtime),
    sourceLaneMatches: record.sourceLane === fixture.expectedSourceLane,
    outputContained: pathInsideRepoEvidence(record.outputArtifactPath),
    recordOnly: record.observerAction === 'record_only' && record.outputBoundary === 'record_only_local_evidence',
    capabilityTrueCount,
    forbiddenEffectsDetected: reasonSet.filter((code) => code.endsWith('_FORBIDDEN')),
    automaticAgentConsumptionPressure: record.automaticAgentConsumption === true,
    advisoryLookingText: typeof record.advisoryLookingText === 'string' && record.advisoryLookingText.length > 0,
  };
}

const passResults = fixture.passCases.map(evaluate);
const rejectResults = fixture.rejectCases.map(evaluate);
const allResults = [...passResults, ...rejectResults];

for (const result of passResults) {
  assert.equal(result.accepted, true, `${result.caseId} should pass: ${result.reasonCodes.join(', ')}`);
  assert.equal(result.sourceTupleComplete, true, `${result.caseId} must keep source tuple complete`);
  assert.equal(result.digestValid, true, `${result.caseId} must keep digest valid`);
  assert.equal(result.sourceMtimeValid, true, `${result.caseId} must keep source mtime valid`);
  assert.equal(result.sourceLaneMatches, true, `${result.caseId} must stay in canary lane`);
  assert.equal(result.outputContained, true, `${result.caseId} must write only local evidence`);
  assert.equal(result.recordOnly, true, `${result.caseId} must stay record-only`);
  assert.equal(result.capabilityTrueCount, 0, `${result.caseId} capability booleans must remain false`);
}

for (const [index, result] of rejectResults.entries()) {
  const expected = fixture.rejectCases[index].expectedReasonCodes;
  assert.equal(result.accepted, false, `${result.caseId} should reject`);
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.caseId} should include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const coverageLabels = new Set(allResults.map((result) => result.coverageLabel));
for (const required of fixture.targetCoverage) assert.ok(coverageLabels.has(required), `expanded pack must cover ${required}`);

const acceptedCount = passResults.filter((result) => result.accepted).length;
const unexpectedRejects = passResults.filter((result) => !result.accepted);
const unexpectedAccepts = rejectResults.filter((result) => result.accepted);
const passCapabilityTrueCount = passResults.reduce((sum, result) => sum + result.capabilityTrueCount, 0);
const rejectedForbiddenEffectsDetectedCount = rejectResults.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);
const acceptedForbiddenEffectsDetectedCount = passResults.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);

assert.equal(acceptedCount, fixture.passCases.length);
assert.deepEqual(unexpectedRejects, []);
assert.deepEqual(unexpectedAccepts, []);
assert.equal(passCapabilityTrueCount, 0);
assert.equal(acceptedForbiddenEffectsDetectedCount, 0);
assert.ok(rejectedForbiddenEffectsDetectedCount >= 1, 'expanded pack must include pressure rows that are rejected');

const countRejects = (code) => rejectResults.filter((result) => result.reasonCodes.includes(code)).length;
const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T21:40:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    dependsOn: fixture.dependsOn,
    mode: fixture.mode,
    totalCases: allResults.length,
    passCases: fixture.passCases.length,
    rejectCases: fixture.rejectCases.length,
    targetCoverageCount: fixture.targetCoverage.length,
    coveredTargetCoverageCount: fixture.targetCoverage.filter((label) => coverageLabels.has(label)).length,
    acceptedCount,
    unexpectedAccepts: unexpectedAccepts.length,
    unexpectedRejects: unexpectedRejects.length,
    optInRejects: countRejects('CANARY_OPT_IN_REQUIRED'),
    rawInputRejects: countRejects('CANARY_RAW_PERSISTENCE_FORBIDDEN'),
    runtimeRejects: countRejects('CANARY_RUNTIME_FORBIDDEN'),
    memoryWriteRejects: countRejects('CANARY_MEMORY_WRITE_FORBIDDEN'),
    configWriteRejects: countRejects('CANARY_CONFIG_WRITE_FORBIDDEN'),
    publicationRejects: countRejects('CANARY_PUBLICATION_FORBIDDEN'),
    wrongLaneRejects: countRejects('CANARY_SOURCE_LANE_MISMATCH'),
    staleDigestRejects: countRejects('CANARY_SOURCE_DIGEST_STALE'),
    missingMtimeRejects: countRejects('CANARY_SOURCE_MTIME_REQUIRED'),
    malformedTupleRejects: countRejects('CANARY_SOURCE_TUPLE_REQUIRED'),
    outputContainmentRejects: countRejects('CANARY_OUTPUT_CONTAINMENT_REQUIRED'),
    agentConsumptionPressureRejects: countRejects('CANARY_AUTOMATIC_AGENT_CONSUMPTION_FORBIDDEN'),
    approvalRejects: countRejects('CANARY_APPROVAL_FORBIDDEN'),
    blockingRejects: countRejects('CANARY_BLOCKING_FORBIDDEN'),
    allowingRejects: countRejects('CANARY_ALLOWING_FORBIDDEN'),
    authorizationRejects: countRejects('CANARY_AUTHORIZATION_FORBIDDEN'),
    enforcementRejects: countRejects('CANARY_ENFORCEMENT_FORBIDDEN'),
    acceptedForbiddenEffectsDetectedCount,
    rejectedForbiddenEffectsDetectedCount,
    passCapabilityTrueCount,
    manual: true,
    local: true,
    optInRequired: true,
    alreadyRedactedOnly: true,
    recordOnly: true,
    noEffects: true,
    writesOnlyLocalEvidence: true,
    scorecardAuthority: false,
    consumedByAgent: false,
    automaticAgentConsumptionImplemented: false,
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
    safetyClaimScope: 'expanded_passive_canary_pack_manual_local_opt_in_record_only_no_effects_not_runtime_not_authority_not_agent_consumed',
  },
  passResults,
  rejectResults,
  coveredTargetCoverage: [...coverageLabels].sort(),
  boundary: fixture.forbiddenEffects,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
