import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-drift-scorecard-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-drift-scorecard.json');
const sourceFixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-source-boundary-stress.json');
const sourceEvidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-source-boundary-stress.out.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-drift-scorecard.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const sourceFixture = JSON.parse(await readFile(sourceFixturePath, 'utf8'));
const sourceEvidence = JSON.parse(await readFile(sourceEvidencePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.2.4');
assert.equal(fixture.dependsOn, 'v0.2.3-canary-source-boundary-stress');
assert.equal(fixture.mode, 'manual_local_opt_in_passive_drift_scorecard_record_only');
assert.equal(fixture.requiredInvariants.mayBlockCount, 0);
assert.equal(fixture.requiredInvariants.mayAllowCount, 0);
assert.equal(fixture.requiredInvariants.capabilityTrueCount, 0);
assert.equal(fixture.requiredInvariants.forbiddenEffects, 0);
assert.equal(fixture.requiredInvariants.automaticAgentConsumptionImplemented, false);
assert.equal(sourceFixture.releaseLayer, 'v0.2.3');
assert.equal(sourceEvidence.summary?.verdict, 'pass');
assert.equal(sourceEvidence.summary?.automaticAgentConsumptionImplemented, false);

for (const metric of [
  'routeDriftCount',
  'reasonCodeDriftCount',
  'boundaryVerdictDriftCount',
  'scorecardDriftCount',
  'traceHashDriftCount',
  'normalizedOutputMismatchCount',
]) {
  assert.ok(fixture.metrics.includes(metric), `drift scorecard fixture must include ${metric}`);
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
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
  const allowedRoot = resolve(repoRoot, sourceFixture.allowedOutputRoot);
  const candidate = resolve(repoRoot, relativePath);
  return candidate === allowedRoot || candidate.startsWith(`${allowedRoot}${sep}`);
}

function reasonSetFor(record) {
  const reasonCodes = [];

  if (record.optIn !== true) reasonCodes.push('CANARY_OPT_IN_REQUIRED');
  if (record.sourceKind !== 'manual_redacted_canary_packet') reasonCodes.push('CANARY_LIVE_SOURCE_FORBIDDEN');
  if (record.sourceLane !== sourceFixture.expectedSourceLane) reasonCodes.push('CANARY_SOURCE_LANE_MISMATCH');
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
  for (const field of requiredSourceFields) if (!record[field]) reasonCodes.push('CANARY_SOURCE_TUPLE_REQUIRED');
  if (!isoTimestampLooksValid(record.sourceMtime)) reasonCodes.push('CANARY_SOURCE_MTIME_REQUIRED');
  if (!digestLooksValid(record.sourceDigest)) reasonCodes.push('CANARY_SOURCE_DIGEST_REQUIRED');
  if (digestLooksValid(record.sourceDigest) && digestLooksValid(record.expectedSourceDigest) && record.sourceDigest !== record.expectedSourceDigest) {
    reasonCodes.push('CANARY_SOURCE_DIGEST_STALE');
  }

  return [...new Set(reasonCodes)].sort();
}

function normalizeInput(record) {
  return {
    caseId: record.caseId,
    optIn: record.optIn === true,
    sourceKind: record.sourceKind ?? null,
    sourceLane: record.sourceLane ?? null,
    sourceArtifactId: record.sourceArtifactId ?? null,
    sourceArtifactPath: record.sourceArtifactPath ?? null,
    sourceDigest: record.sourceDigest ?? null,
    expectedSourceDigest: record.expectedSourceDigest ?? null,
    sourceMtime: record.sourceMtime ?? null,
    receiverNow: record.receiverNow ?? null,
    inputBoundary: record.inputBoundary ?? null,
    outputBoundary: record.outputBoundary ?? null,
    outputArtifactPath: record.outputArtifactPath ?? null,
    observerMode: record.observerMode ?? null,
    observerAction: record.observerAction ?? null,
    effectBoundary: record.effectBoundary ?? null,
    capabilities: Object.fromEntries(effectCapabilityFields.map((field) => [field, capability(record, field)])),
    effectFlags: {
      rawInputPersisted: record.rawInputPersisted === true,
      liveTrafficRead: record.liveTrafficRead === true,
      runtimeIntegration: record.runtimeIntegration === true,
      daemonStarted: record.daemonStarted === true,
      watcherStarted: record.watcherStarted === true,
      adapterIntegrated: record.adapterIntegrated === true,
      toolExecuted: record.toolExecuted === true,
      memoryWritten: record.memoryWritten === true,
      configWritten: record.configWritten === true,
      publishedExternally: record.publishedExternally === true,
      approvalEntered: record.approvalEntered === true,
      blocked: record.blocked === true,
      allowed: record.allowed === true,
      authorizesAction: record.authorizesAction === true,
      deleted: record.deleted === true,
      retentionSchedulerStarted: record.retentionSchedulerStarted === true,
      enforced: record.enforced === true,
      automaticAgentConsumption: record.automaticAgentConsumption === true,
    },
  };
}

function evaluate(record, runLabel) {
  const normalizedInput = normalizeInput(record);
  const reasonCodes = reasonSetFor(record);
  const accepted = reasonCodes.length === 0;
  const route = accepted ? 'passive_canary_record_only_accept' : 'passive_canary_reject_no_effects_boundary';
  const boundaryVerdict = accepted ? 'accept_record_only_local_evidence' : 'reject_no_effects_boundary';
  const capabilityTrueCount = effectCapabilityFields.filter((field) => capability(record, field)).length;
  const forbiddenEffects = reasonCodes.filter((code) => code.endsWith('_FORBIDDEN')).length;
  const traceHash = `sha256:${digest(normalizedInput)}`;
  const normalizedOutput = {
    accepted,
    route,
    reasonCodes,
    boundaryVerdict,
    traceHash,
    recordOnly: record.observerAction === 'record_only' && record.outputBoundary === 'record_only_local_evidence',
    capabilityTrueCount,
    forbiddenEffects,
    mayBlock: capability(record, 'mayBlock'),
    mayAllow: capability(record, 'mayAllow'),
  };
  const scorecard = {
    caseId: record.caseId,
    route,
    reasonCodes,
    boundaryVerdict,
    traceHash,
    normalizedOutputDigest: `sha256:${digest(normalizedOutput)}`,
    capabilityTrueCount,
    forbiddenEffects,
    mayBlock: false,
    mayAllow: false,
    consumedByAgent: false,
    automaticAgentConsumption: false,
  };
  return { caseId: record.caseId, runLabel, normalizedInput, normalizedOutput, scorecard };
}

function runCanary(runLabel) {
  const records = [...sourceFixture.passCases, ...sourceFixture.rejectCases];
  return records.map((record) => evaluate(record, runLabel));
}

const baseline = runCanary('baseline');
const replay = runCanary('replay');
const baselineById = new Map(baseline.map((row) => [row.caseId, row]));

const authorizingScorecardTermPattern = /(?:^|_)(?:allow|allowing|block|blocking|authorize|authorization|enforce|enforcement)(?:_|$)/;
for (const row of replay) {
  for (const [field, value] of [
    ['normalizedOutput.route', row.normalizedOutput.route],
    ['normalizedOutput.boundaryVerdict', row.normalizedOutput.boundaryVerdict],
    ['scorecard.route', row.scorecard.route],
    ['scorecard.boundaryVerdict', row.scorecard.boundaryVerdict],
  ]) {
    assert.equal(
      authorizingScorecardTermPattern.test(value),
      false,
      `${row.caseId} ${field} must avoid allow/block/authorize/enforce terminology: ${value}`,
    );
  }
}

const driftRows = [];
for (const candidate of replay) {
  const base = baselineById.get(candidate.caseId);
  assert.ok(base, `${candidate.caseId} must exist in baseline`);
  const drift = {
    caseId: candidate.caseId,
    normalizedInputDigest: `sha256:${digest(candidate.normalizedInput)}`,
    routeDrift: base.normalizedOutput.route !== candidate.normalizedOutput.route,
    reasonCodeDrift: digest(base.normalizedOutput.reasonCodes) !== digest(candidate.normalizedOutput.reasonCodes),
    boundaryVerdictDrift: base.normalizedOutput.boundaryVerdict !== candidate.normalizedOutput.boundaryVerdict,
    scorecardDrift: digest(base.scorecard) !== digest(candidate.scorecard),
    traceHashDrift: base.normalizedOutput.traceHash !== candidate.normalizedOutput.traceHash,
    normalizedOutputMismatch: digest(base.normalizedOutput) !== digest(candidate.normalizedOutput),
  };
  driftRows.push(drift);
}

const driftCounts = {
  routeDriftCount: driftRows.filter((row) => row.routeDrift).length,
  reasonCodeDriftCount: driftRows.filter((row) => row.reasonCodeDrift).length,
  boundaryVerdictDriftCount: driftRows.filter((row) => row.boundaryVerdictDrift).length,
  scorecardDriftCount: driftRows.filter((row) => row.scorecardDrift).length,
  traceHashDriftCount: driftRows.filter((row) => row.traceHashDrift).length,
  normalizedOutputMismatchCount: driftRows.filter((row) => row.normalizedOutputMismatch).length,
};

const capabilitySummary = {
  mayBlockCount: replay.filter((row) => row.normalizedOutput.mayBlock !== false).length,
  mayAllowCount: replay.filter((row) => row.normalizedOutput.mayAllow !== false).length,
  capabilityTrueCount: replay.reduce((sum, row) => sum + row.normalizedOutput.capabilityTrueCount, 0),
  forbiddenEffects: replay.reduce((sum, row) => sum + row.normalizedOutput.forbiddenEffects, 0),
};

for (const [metric, value] of Object.entries(driftCounts)) assert.equal(value, 0, `${metric} must remain zero for unchanged normalized inputs`);
assert.deepEqual(capabilitySummary, {
  mayBlockCount: 0,
  mayAllowCount: 0,
  capabilityTrueCount: 0,
  forbiddenEffects: 0,
});

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T15:10:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    dependsOn: fixture.dependsOn,
    mode: fixture.mode,
    sourceFixture: fixture.sourceFixture,
    sourceEvidence: fixture.sourceEvidence,
    comparedRows: replay.length,
    ...driftCounts,
    ...capabilitySummary,
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
    enforcementImplemented: false,
    safetyClaimScope: 'passive_canary_drift_scorecard_local_deterministic_record_only_not_authority_not_runtime_not_agent_consumed',
  },
  driftRows,
  scorecard: replay.map((row) => row.scorecard),
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
