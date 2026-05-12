import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-source-boundary-stress-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-source-boundary-stress.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-source-boundary-stress.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.2.3');
assert.equal(fixture.dependsOn, 'v0.2.1-passive-canary-reproducibility');
assert.equal(fixture.mode, 'manual_local_opt_in_passive_record_only_source_boundary_stress');
assert.equal(fixture.expectedSourceLane, 'manual_opt_in_redacted_canary_pack');
assert.equal(fixture.allowedOutputRoot, 'implementation/synaptic-mesh-shadow-v0/evidence/');

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
  return {
    caseId: record.caseId,
    accepted: reasonSet.length === 0,
    reasonCodes: reasonSet,
    sourceTupleComplete: requiredSourceFields.every((field) => Boolean(record[field])),
    digestValid: digestLooksValid(record.sourceDigest),
    staleDigest: reasonSet.includes('CANARY_SOURCE_DIGEST_STALE'),
    sourceLaneMatches: record.sourceLane === fixture.expectedSourceLane,
    outputContained: pathInsideRepoEvidence(record.outputArtifactPath),
    capabilityTrueCount: effectCapabilityFields.filter((field) => capability(record, field)).length,
    forbiddenEffectsDetected: reasonSet.filter((code) => code.endsWith('_FORBIDDEN')),
  };
}

const passResults = fixture.passCases.map(evaluate);
const rejectResults = fixture.rejectCases.map(evaluate);

for (const result of passResults) {
  assert.equal(result.accepted, true, `${result.caseId} should pass: ${result.reasonCodes.join(', ')}`);
  assert.equal(result.sourceTupleComplete, true, `${result.caseId} must keep source tuple complete`);
  assert.equal(result.digestValid, true, `${result.caseId} must keep digest shape valid`);
  assert.equal(result.staleDigest, false, `${result.caseId} must not drift digest`);
  assert.equal(result.sourceLaneMatches, true, `${result.caseId} must stay in manual canary lane`);
  assert.equal(result.outputContained, true, `${result.caseId} must write only inside local evidence root`);
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
const passCapabilityTrueCount = passResults.reduce((sum, result) => sum + result.capabilityTrueCount, 0);
const outputContainmentRejects = rejectResults.filter((result) => result.reasonCodes.includes('CANARY_OUTPUT_CONTAINMENT_REQUIRED')).length;
const staleDigestRejects = rejectResults.filter((result) => result.reasonCodes.includes('CANARY_SOURCE_DIGEST_STALE')).length;
const missingMtimeRejects = rejectResults.filter((result) => result.reasonCodes.includes('CANARY_SOURCE_MTIME_REQUIRED')).length;
const wrongLaneRejects = rejectResults.filter((result) => result.reasonCodes.includes('CANARY_SOURCE_LANE_MISMATCH')).length;

assert.equal(acceptedCount, fixture.passCases.length);
assert.deepEqual(unexpectedRejects, []);
assert.deepEqual(unexpectedAccepts, []);
assert.equal(outputContainmentRejects, 1);
assert.equal(staleDigestRejects, 1);
assert.equal(missingMtimeRejects, 1);
assert.equal(wrongLaneRejects, 1);
assert.equal(passCapabilityTrueCount, 0);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T13:40:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    passCases: fixture.passCases.length,
    rejectCases: fixture.rejectCases.length,
    acceptedCount,
    unexpectedAccepts: unexpectedAccepts.length,
    unexpectedRejects: unexpectedRejects.length,
    malformedSourceTupleRejects: rejectResults.filter((result) => result.reasonCodes.includes('CANARY_SOURCE_TUPLE_REQUIRED')).length,
    staleDigestRejects,
    missingMtimeRejects,
    wrongLaneRejects,
    outputContainmentRejects,
    passCapabilityTrueCount,
    manual: true,
    local: true,
    optInRequired: true,
    alreadyRedactedOnly: true,
    recordOnly: true,
    noEffects: true,
    writesOnlyLocalEvidence: true,
    runtimeIntegrated: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    automaticAgentConsumptionImplemented: false,
    safetyClaimScope: 'source_boundary_stress_for_manual_local_opt_in_passive_canary_only_not_runtime_not_authorization',
  },
  passResults,
  rejectResults,
  boundary: fixture.forbiddenEffects,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
