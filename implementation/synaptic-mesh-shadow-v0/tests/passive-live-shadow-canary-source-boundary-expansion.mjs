import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-source-boundary-expansion-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-source-boundary-expansion.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-source-boundary-expansion.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.2.6');
assert.equal(fixture.dependsOn, 'v0.2.5-expanded-passive-canary-pack');
assert.equal(fixture.mode, 'manual_local_opt_in_passive_record_only_source_boundary_expansion');
assert.equal(fixture.expectedSourceLane, 'manual_opt_in_redacted_canary_pack');
assert.equal(fixture.allowedSourceRoot, 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-inputs/');
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

function hasTraversal(relativePath) {
  return typeof relativePath === 'string' && relativePath.split(/[\\/]+/).includes('..');
}

function hasForbiddenUnicodeControl(value) {
  return /[\u202a-\u202e\u2066-\u2069\u200b\u200c\u200d\ufeff]/u.test(value ?? '');
}

function pathInside(relativePath, rootPath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) return false;
  if (relativePath.startsWith('/') || relativePath.includes('\\')) return false;
  if (hasTraversal(relativePath)) return false;
  const allowedRoot = resolve(repoRoot, rootPath);
  const candidate = resolve(repoRoot, relativePath);
  return candidate === allowedRoot || candidate.startsWith(`${allowedRoot}${sep}`);
}

const allRecords = [...fixture.passCases, ...fixture.rejectCases];
const sourceArtifactIdCounts = new Map();
for (const record of allRecords) {
  if (!record.sourceArtifactId) continue;
  sourceArtifactIdCounts.set(record.sourceArtifactId, (sourceArtifactIdCounts.get(record.sourceArtifactId) ?? 0) + 1);
}

function evaluate(record) {
  const reasonCodes = [];

  if (record.optIn !== true) reasonCodes.push('CANARY_OPT_IN_REQUIRED');
  if (record.sourceKind !== 'manual_redacted_canary_packet') reasonCodes.push('CANARY_LIVE_SOURCE_FORBIDDEN');
  if (record.sourceLane !== fixture.expectedSourceLane) reasonCodes.push('CANARY_SOURCE_LANE_MISMATCH');
  if (typeof record.sourceLane === 'string' && record.sourceLane.startsWith(fixture.expectedSourceLane) && record.sourceLane !== fixture.expectedSourceLane) {
    reasonCodes.push('CANARY_SOURCE_LANE_ALIAS_FORBIDDEN');
  }
  if (record.inputBoundary !== 'already_redacted') reasonCodes.push('CANARY_ALREADY_REDACTED_REQUIRED');
  if (record.rawInputPersisted === true) reasonCodes.push('CANARY_RAW_PERSISTENCE_FORBIDDEN');
  if (record.liveTrafficRead === true) reasonCodes.push('CANARY_LIVE_TRAFFIC_READ_FORBIDDEN');
  if (record.outputBoundary !== 'record_only_local_evidence') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.observerMode !== 'passive') reasonCodes.push('CANARY_PASSIVE_MODE_REQUIRED');
  if (record.observerAction !== 'record_only') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.effectBoundary !== 'no_effects') reasonCodes.push('CANARY_NO_EFFECTS_REQUIRED');

  if (!pathInside(record.sourceArtifactPath, fixture.allowedSourceRoot)) reasonCodes.push('CANARY_SOURCE_PATH_CONTAINMENT_REQUIRED');
  if (hasTraversal(record.sourceArtifactPath)) reasonCodes.push('CANARY_SOURCE_PATH_TRAVERSAL');
  if (record.sourcePathKind === 'symlink') reasonCodes.push('CANARY_SOURCE_SYMLINK_FORBIDDEN');
  if (hasForbiddenUnicodeControl(record.sourceArtifactPath) || (record.sourcePathSimulatedForbiddenCodePoints ?? []).length > 0) reasonCodes.push('CANARY_SOURCE_PATH_UNICODE_CONTROL');
  if ((sourceArtifactIdCounts.get(record.sourceArtifactId) ?? 0) > 1) reasonCodes.push('CANARY_SOURCE_ARTIFACT_ID_DUPLICATE');

  if (!pathInside(record.outputArtifactPath, fixture.allowedOutputRoot)) reasonCodes.push('CANARY_OUTPUT_CONTAINMENT_REQUIRED');
  if (record.outputPathKind === 'symlink') reasonCodes.push('CANARY_OUTPUT_SYMLINK_FORBIDDEN');

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
  if (isoTimestampLooksValid(record.sourceMtime) && isoTimestampLooksValid(record.receiverNow) && Date.parse(record.sourceMtime) > Date.parse(record.receiverNow)) {
    reasonCodes.push('CANARY_SOURCE_MTIME_FUTURE');
  }
  if (!digestLooksValid(record.sourceDigest)) reasonCodes.push('CANARY_SOURCE_DIGEST_REQUIRED');
  if (digestLooksValid(record.sourceDigest) && digestLooksValid(record.expectedSourceDigest) && record.sourceDigest !== record.expectedSourceDigest) {
    reasonCodes.push('CANARY_SOURCE_DIGEST_STALE');
  }
  if (digestLooksValid(record.sourceDigest) && digestLooksValid(record.computedSourceDigest) && record.sourceDigest !== record.computedSourceDigest) {
    reasonCodes.push('CANARY_SOURCE_DIGEST_BINDING_MISMATCH');
  }

  const reasonSet = [...new Set(reasonCodes)].sort();
  return {
    caseId: record.caseId,
    coverageLabel: record.coverageLabel,
    accepted: reasonSet.length === 0,
    reasonCodes: reasonSet,
    sourceTupleComplete: requiredSourceFields.every((field) => Boolean(record[field])),
    digestValid: digestLooksValid(record.sourceDigest),
    digestBindingMismatch: reasonSet.includes('CANARY_SOURCE_DIGEST_BINDING_MISMATCH'),
    staleDigest: reasonSet.includes('CANARY_SOURCE_DIGEST_STALE'),
    sourceLaneMatches: record.sourceLane === fixture.expectedSourceLane,
    sourceContained: pathInside(record.sourceArtifactPath, fixture.allowedSourceRoot),
    outputContained: pathInside(record.outputArtifactPath, fixture.allowedOutputRoot),
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
  assert.equal(result.digestBindingMismatch, false, `${result.caseId} must keep digest bound`);
  assert.equal(result.staleDigest, false, `${result.caseId} must not drift digest`);
  assert.equal(result.sourceLaneMatches, true, `${result.caseId} must stay in manual canary lane`);
  assert.equal(result.sourceContained, true, `${result.caseId} must read only local committed fixture metadata paths`);
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
const coveredTargetCoverage = [...new Set(rejectResults.map((result) => result.coverageLabel).filter((label) => fixture.targetCoverage.includes(label)))].sort();

const countRejects = (code) => rejectResults.filter((result) => result.reasonCodes.includes(code)).length;

assert.equal(acceptedCount, fixture.passCases.length);
assert.deepEqual(unexpectedRejects, []);
assert.deepEqual(unexpectedAccepts, []);
assert.equal(coveredTargetCoverage.length, fixture.targetCoverage.length);
assert.equal(passCapabilityTrueCount, 0);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-13T02:30:00.000Z',
    verdict: 'pass',
    releaseLayer: fixture.releaseLayer,
    dependsOn: fixture.dependsOn,
    mode: fixture.mode,
    passCases: fixture.passCases.length,
    rejectCases: fixture.rejectCases.length,
    targetCoverageCount: fixture.targetCoverage.length,
    coveredTargetCoverageCount: coveredTargetCoverage.length,
    acceptedCount,
    unexpectedAccepts: unexpectedAccepts.length,
    unexpectedRejects: unexpectedRejects.length,
    digestBindingMismatchRejects: countRejects('CANARY_SOURCE_DIGEST_BINDING_MISMATCH'),
    futureMtimeRejects: countRejects('CANARY_SOURCE_MTIME_FUTURE'),
    invalidMtimeRejects: countRejects('CANARY_SOURCE_MTIME_REQUIRED'),
    sourcePathTraversalRejects: countRejects('CANARY_SOURCE_PATH_TRAVERSAL'),
    sourcePathContainmentRejects: countRejects('CANARY_SOURCE_PATH_CONTAINMENT_REQUIRED'),
    sourceSymlinkRejects: countRejects('CANARY_SOURCE_SYMLINK_FORBIDDEN'),
    sourceUnicodeControlRejects: countRejects('CANARY_SOURCE_PATH_UNICODE_CONTROL'),
    sourceLaneAliasRejects: countRejects('CANARY_SOURCE_LANE_ALIAS_FORBIDDEN'),
    duplicateSourceArtifactIdRejects: countRejects('CANARY_SOURCE_ARTIFACT_ID_DUPLICATE'),
    wrongLaneRejects: countRejects('CANARY_SOURCE_LANE_MISMATCH'),
    outputSymlinkRejects: countRejects('CANARY_OUTPUT_SYMLINK_FORBIDDEN'),
    outputContainmentRejects: countRejects('CANARY_OUTPUT_CONTAINMENT_REQUIRED'),
    passCapabilityTrueCount,
    manual: true,
    local: true,
    optInRequired: true,
    alreadyRedactedOnly: true,
    recordOnly: true,
    noEffects: true,
    writesOnlyLocalEvidence: true,
    readsLiveTraffic: false,
    followsSourceSymlinkForAuthority: false,
    followsOutputSymlinkForAuthority: false,
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
    automaticAgentConsumptionImplemented: false,
    safetyClaimScope: 'source_boundary_expansion_for_manual_local_opt_in_passive_canary_only_not_runtime_not_authority_not_agent_consumed',
  },
  passResults,
  rejectResults,
  coveredTargetCoverage,
  boundary: fixture.forbiddenEffects,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (output.summary.verdict !== 'pass') process.exit(1);
