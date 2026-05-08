import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';
import { assertNoCapabilityBooleans, effectCapabilityFields, requiredForbiddenPaths, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-real-redacted-handoff-replay-gate-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const packPath = resolve(packageRoot, 'fixtures/real-redacted-handoff-pack.json');
const decisionTraceSchemaPath = resolve(repoRoot, 'schemas/decision-trace.schema.json');
const observationSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/real-redacted-handoff-replay-gate.out.json');

const forbiddenSubstrings = [
  '/Users/',
  `Ra${'dar'}`,
  `Jarvis${'Lab'}`,
  `642${'5687132'}`,
  `BEGIN_OPENCLAW_${'INTERNAL_CONTEXT'}`,
  'PRIVATE KEY',
  'BEGIN PRIVATE',
  'approval command',
  'tool output:',
];

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}
function classifierDecisionFrom(decision) {
  return {
    selectedRoute: decision.selectedRoute,
    humanRequired: decision.humanRequired,
    compactAllowed: decision.compactAllowed,
    reasonCodes: decision.reasonCodes,
    decisiveSignals: decision.decisiveSignals,
    rejectedRoutes: decision.rejectedRoutes,
  };
}
function expectedClassifierShape(decision, rejectedRoutes) {
  return { ...decision, rejectedRoutes };
}
function assertNoForbiddenText(value, label) {
  const text = JSON.stringify(value);
  for (const needle of forbiddenSubstrings) assert.equal(text.includes(needle), false, `${label} must not include ${needle}`);
}
function traceFromCase(entry, index, classifierDecision) {
  const goldDecision = {
    selectedRoute: 'abstain',
    humanRequired: false,
    compactAllowed: false,
    reasonCodes: ['REAL_REDACTED_MANUAL_REPLAY_ONLY', 'RAW_CONTENT_NOT_PERSISTED'],
    forbiddenEffects: entry.manualObservationBundle.forbiddenEffects,
  };
  const matchedGold = classifierDecision.selectedRoute === 'abstain'
    && classifierDecision.humanRequired === false
    && classifierDecision.compactAllowed === false;
  return {
    traceId: `trace_real_${String(index + 1).padStart(3, '0')}_${entry.manualObservationBundle.bundleId.replace(/^mob_real_/, '').replace(/[^a-z0-9_-]/g, '_')}`,
    flowId: `real-redacted/${entry.manualObservationBundle.bundleId}`,
    parserEvidenceRef: entry.expected.parserEvidence.rawArtifactId,
    parserEvidenceRefHash: sha256({ parserEvidence: entry.expected.parserEvidence, routeDecisionInput: entry.expected.routeDecisionInput }),
    routeDecisionInputHash: entry.expected.parserEvidence.routeDecisionInputHash,
    goldDecisionHash: sha256(goldDecision),
    classifierDecisionHash: sha256(classifierDecision),
    matchedGold,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    decisiveSignals: classifierDecision.decisiveSignals,
    rejectedRoutes: classifierDecision.rejectedRoutes,
    boundaryVerdict: {
      falsePermit: classifierDecision.selectedRoute === 'shadow_only',
      falseCompact: classifierDecision.compactAllowed === true,
      boundaryLoss: goldDecision.forbiddenEffects.length !== entry.manualObservationBundle.forbiddenEffects.length,
    },
    mode: 'offline_fixture_trace',
    scope: 'local_shadow_only',
  };
}
function observationFromTrace(trace, entry, index) {
  return {
    schemaVersion: 'live-shadow-observation-v0',
    observationId: `lso_real_${String(index + 1).padStart(3, '0')}`,
    flowId: trace.flowId,
    observedAt: '2026-05-08T03:50:00.000Z',
    observerMode: 'passive',
    effectBoundary: 'no_effects',
    writeBoundary: 'local_shadow_only',
    sourceArtifactId: entry.manualObservationBundle.bundleId,
    parserEvidenceRef: trace.parserEvidenceRef,
    routeDecisionInputHash: trace.routeDecisionInputHash,
    classifierDecisionHash: trace.classifierDecisionHash,
    decisionTraceHash: sha256(trace),
    allowedInputs: ['decision_trace', 'parser_evidence', 'route_decision_input', 'classifier_decision'],
    forbiddenPaths: [...requiredForbiddenPaths],
    auditReasonCodes: ['LIVE_SHADOW_OBSERVE_ONLY', 'LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_LOCAL_ONLY', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
  };
}
function resultFromObservationAndTrace(observation, trace, index) {
  return {
    schemaVersion: 'live-shadow-observation-result-v0',
    observationId: observation.observationId,
    resultId: `lsor_real_${String(index + 1).padStart(3, '0')}`,
    observerAction: 'record_only',
    matchedExpectedPolicy: trace.matchedGold,
    warnings: trace.matchedGold ? [] : ['real_redacted_replay_mismatch'],
    safetySignals: ['real_redacted_bundle_replayed', 'redaction_review_record_present', 'decision_trace_present', 'record_only_result', 'no_forbidden_effects_detected'],
    driftSignals: trace.selectedRoute === 'abstain' ? [] : ['real_redacted_replay_route_not_abstain_recorded_without_effect'],
    forbiddenEffectsDetected: [],
    auditReasonCodes: ['LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
    mayBlock: false,
    mayAllow: false,
    mayExecuteTool: false,
    mayWriteMemory: false,
    mayWriteConfig: false,
    mayPublishExternally: false,
    mayModifyAgentInstructions: false,
    mayEnterApprovalPath: false,
  };
}

const pack = JSON.parse(await readFile(packPath, 'utf8'));
const decisionTraceSchema = JSON.parse(await readFile(decisionTraceSchemaPath, 'utf8'));
const observationSchema = JSON.parse(await readFile(observationSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));

assert.equal(pack.schemaVersion, 'real-redacted-handoff-pack-v0');
assert.equal(pack.rawContentPersisted, false);
assert.equal(pack.humanReviewed, true);
assert.equal(pack.allowedProcessing, 'local_shadow_only');
assert.equal(pack.cases.length, 3, 'real-redacted replay gate must consume exactly three pack cases');
assertNoForbiddenText(pack, 'real-redacted replay pack input');

const traces = [];
const observations = [];
const results = [];
const validationErrors = [];
const replayRows = [];

for (const [index, entry] of pack.cases.entries()) {
  assert.equal(entry.manualObservationBundle.bundleId, entry.redactionReviewRecord.bundleId);
  assert.equal(entry.manualObservationBundle.rawContentIncluded, false);
  assert.equal(entry.redactionReviewRecord.rawContentPersisted, false);
  assert.equal(entry.redactionReviewRecord.privatePathsPersisted, false);
  assert.equal(entry.redactionReviewRecord.secretLikeValuesPersisted, false);
  assert.equal(entry.redactionReviewRecord.toolOutputsPersisted, false);
  assert.equal(entry.redactionReviewRecord.memoryTextPersisted, false);
  assert.equal(entry.redactionReviewRecord.configTextPersisted, false);
  assert.equal(entry.redactionReviewRecord.approvalTextPersisted, false);
  assert.equal(entry.redactionReviewRecord.forbiddenForLiveObservation, true);
  assert.equal(entry.redactionReviewRecord.forbiddenForRuntimeUse, true);

  const classifierDecision = classifierDecisionFrom(classifyRoute({
    parserEvidence: entry.expected.parserEvidence,
    routeDecisionInput: entry.expected.routeDecisionInput,
  }));
  assert.deepEqual(classifierDecision, expectedClassifierShape(entry.expected.classifierDecision, entry.expected.decisionTrace.rejectedRoutes), `${entry.caseId} classifier decision must match fixture expectation`);
  const trace = traceFromCase(entry, index, classifierDecision);
  const observation = observationFromTrace(trace, entry, index);
  const result = resultFromObservationAndTrace(observation, trace, index);
  traces.push(trace);
  observations.push(observation);
  results.push(result);

  for (const [kind, schema, value] of [
    ['decision_trace', decisionTraceSchema, trace],
    ['live_shadow_observation', observationSchema, observation],
    ['live_shadow_observation_result', resultSchema, result],
  ]) {
    const errors = validateSchemaValue(schema, value);
    if (errors.length > 0) validationErrors.push({ caseId: entry.caseId, kind, errors });
  }

  assert.deepEqual(trace, entry.expected.decisionTrace, `${entry.caseId} generated DecisionTrace must match expected fixture trace`);
  assert.equal(result.observerAction, 'record_only');
  assert.equal(result.matchedExpectedPolicy, true);
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(result);
  assert.deepEqual(result, entry.expected.liveShadowObservationResult, `${entry.caseId} generated LiveShadowObservationResult must match expected fixture result`);
  const replayRow = {
    bundleId: entry.manualObservationBundle.bundleId,
    reviewId: entry.redactionReviewRecord.reviewId,
    selectedRoute: trace.selectedRoute,
    matchedExpectedPolicy: result.matchedExpectedPolicy,
    observerAction: result.observerAction,
    rawContentPersisted: entry.redactionReviewRecord.rawContentPersisted,
    privatePathsPersisted: entry.redactionReviewRecord.privatePathsPersisted,
    secretLikeValuesPersisted: entry.redactionReviewRecord.secretLikeValuesPersisted,
    toolOutputsPersisted: entry.redactionReviewRecord.toolOutputsPersisted,
    memoryTextPersisted: entry.redactionReviewRecord.memoryTextPersisted,
    configTextPersisted: entry.redactionReviewRecord.configTextPersisted,
    approvalTextPersisted: entry.redactionReviewRecord.approvalTextPersisted,
    forbiddenEffects: result.forbiddenEffectsDetected.length,
    mayBlock: result.mayBlock ? 1 : 0,
    mayAllow: result.mayAllow ? 1 : 0,
    capabilityAttempts: effectCapabilityFields.filter((field) => result[field] !== false).length,
    mismatch: trace.matchedGold ? 0 : 1,
  };
  assert.deepEqual(replayRow, entry.expected.scorecardRow, `${entry.caseId} generated replay scorecard row must match expected fixture row`);
  replayRows.push(replayRow);
}

assert.deepEqual(validationErrors, [], 'real-redacted replay gate generated records must validate');
assert.equal(traces.length, 3);
assert.equal(observations.length, 3);
assert.equal(results.length, 3);

const forbiddenEffectsDetectedCount = results.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);
const capabilityTrueCount = results.reduce((sum, result) => sum + effectCapabilityFields.filter((field) => result[field] !== false).length, 0);
const mayBlockCount = results.filter((result) => result.mayBlock).length;
const mayAllowCount = results.filter((result) => result.mayAllow).length;
const falsePermitCount = traces.filter((trace) => trace.boundaryVerdict.falsePermit).length;
const falseCompactCount = traces.filter((trace) => trace.boundaryVerdict.falseCompact).length;
const boundaryLossCount = traces.filter((trace) => trace.boundaryVerdict.boundaryLoss).length;
const mismatchCount = traces.filter((trace) => !trace.matchedGold).length;

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T03:50:00.000Z',
    verdict: 'pass',
    sourcePack: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-redacted-handoff-pack.json',
    decisionTraceSchema: 'schemas/decision-trace.schema.json',
    observationSchema: 'schemas/live-shadow-observation.schema.json',
    resultSchema: 'schemas/live-shadow-observation-result.schema.json',
    realRedactedBundles: pack.cases.length,
    redactionReviewRecords: pack.cases.length,
    parserEvidence: 'pass',
    classifierDecision: 'pass',
    decisionTrace: 'pass',
    liveShadowObservationResult: 'record_only',
    traceCount: traces.length,
    observationCount: observations.length,
    resultCount: results.length,
    validationErrorCount: validationErrors.length,
    mismatchCount,
    falsePermitCount,
    falseCompactCount,
    boundaryLossCount,
    forbiddenEffectsDetectedCount,
    mayBlockCount,
    mayAllowCount,
    capabilityTrueCount,
    rawContentPersisted: false,
    privatePathsPersisted: false,
    secretLikeValuesPersisted: false,
    toolOutputsPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    mode: 'manual_offline_real_redacted_replay_gate_only',
    observerImplemented: false,
    liveObserverImplemented: false,
    liveTrafficRead: false,
    liveLogsRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingOrAllowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'offline_real_redacted_replay_gate_only_not_live_observer_not_runtime_not_authorization',
  },
  replayRows,
  traces,
  observations,
  results,
  validationErrors,
  statement: 'The offline pipeline accepts real-redacted handoffs under human review; this does not show that an observer works.',
  knownUncoveredRisks: [
    'real_redacted_replay_gate_uses_manual_redacted_metadata_not_raw_content',
    'thresholds_are_local_shadow_evidence_gates_not_runtime_monitoring_or_safety_claims',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_approval_authorization_or_enforcement_added',
  ],
  boundary: pack.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
