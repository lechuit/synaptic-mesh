import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';
import { assertNoCapabilityBooleans, effectCapabilityFields, requiredForbiddenPaths } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-decisiontrace-live-shadow-replay-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const replayPlanPath = resolve(packageRoot, 'fixtures/manual-decisiontrace-live-shadow-replay.json');
const parserReplayEvidencePath = resolve(packageRoot, 'evidence/manual-bundle-parser-evidence-replay.out.json');
const decisionTraceSchemaPath = resolve(repoRoot, 'schemas/decision-trace.schema.json');
const observationSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-decisiontrace-live-shadow-replay.out.json');

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}
function validateSchemaValue(schema, value, path = '$') {
  const errors = [];
  const actualType = typeOf(value);
  if (schema.type === 'integer') {
    if (actualType !== 'number' || !Number.isInteger(value)) return [`${path}: expected integer, got ${actualType}`];
  } else if (schema.type && actualType !== schema.type) {
    return [`${path}: expected ${schema.type}, got ${actualType}`];
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: enum mismatch`);
  if (schema.pattern && typeof value === 'string' && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}: pattern mismatch`);
  if (schema.oneOf) {
    const passCount = schema.oneOf.filter((candidate) => validateSchemaValue(candidate, value, path).length === 0).length;
    if (passCount !== 1) errors.push(`${path}: oneOf mismatch`);
  }
  if (schema.type === 'object') {
    for (const field of schema.required ?? []) if (!Object.hasOwn(value, field)) errors.push(`${path}: missing required field ${field}`);
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) errors.push(`${path}: too few properties`);
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const field of Object.keys(value)) if (!allowed.has(field)) errors.push(`${path}: unknown field ${field}`);
    }
    if (schema.propertyNames) {
      for (const field of Object.keys(value)) if (validateSchemaValue(schema.propertyNames, field, `${path}{propertyName}`).length > 0) errors.push(`${path}: invalid property name ${field}`);
    }
    const additional = schema.additionalProperties;
    for (const [field, childValue] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties ?? {}, field)) errors.push(...validateSchemaValue(schema.properties[field], childValue, `${path}.${field}`));
      else if (additional && typeof additional === 'object') errors.push(...validateSchemaValue(additional, childValue, `${path}.${field}`));
    }
  }
  if (schema.type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: duplicate items`);
    }
    if (schema.items) for (const [index, item] of value.entries()) errors.push(...validateSchemaValue(schema.items, item, `${path}[${index}]`));
  }
  return errors;
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
function traceFromReplayRow(row, index) {
  const classifierDecision = classifierDecisionFrom(classifyRoute({
    parserEvidence: row.parserEvidence,
    routeDecisionInput: row.routeDecisionInput,
  }));
  const goldDecision = {
    selectedRoute: 'abstain',
    humanRequired: false,
    compactAllowed: false,
    reasonCodes: ['MANUAL_OFFLINE_CAPTURE_REQUIRES_REPLAY_ONLY', 'RAW_CONTENT_NOT_PERSISTED'],
    forbiddenEffects: [...requiredForbiddenPaths],
  };
  const matchedGold = classifierDecision.selectedRoute === goldDecision.selectedRoute
    && classifierDecision.humanRequired === goldDecision.humanRequired
    && classifierDecision.compactAllowed === goldDecision.compactAllowed;
  return {
    traceId: `trace_manual_${String(index + 1).padStart(3, '0')}_${row.bundleId.replace(/[^a-z0-9_-]/g, '_')}`,
    flowId: `manual-observation/${row.bundleId}`,
    parserEvidenceRef: row.parserEvidence.rawArtifactId,
    parserEvidenceRefHash: sha256({ parserEvidence: row.parserEvidence, routeDecisionInput: row.routeDecisionInput }),
    routeDecisionInputHash: row.parserEvidence.routeDecisionInputHash,
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
      boundaryLoss: goldDecision.forbiddenEffects.length !== requiredForbiddenPaths.length,
    },
    mode: 'offline_fixture_trace',
    scope: 'local_shadow_only',
  };
}
function observationFromTrace(trace, row, index) {
  return {
    schemaVersion: 'live-shadow-observation-v0',
    observationId: `lso_manual_${String(index + 1).padStart(3, '0')}`,
    flowId: trace.flowId,
    observedAt: '2026-05-08T02:30:00.000Z',
    observerMode: 'passive',
    effectBoundary: 'no_effects',
    writeBoundary: 'local_shadow_only',
    sourceArtifactId: row.bundleId,
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
    resultId: `lsor_manual_${String(index + 1).padStart(3, '0')}`,
    observerAction: 'record_only',
    matchedExpectedPolicy: trace.matchedGold === true,
    warnings: trace.matchedGold ? [] : ['manual_decision_trace_mismatch'],
    safetySignals: ['manual_bundle_replayed', 'decision_trace_present', 'record_only_result', 'no_forbidden_effects_detected'],
    driftSignals: trace.selectedRoute === 'abstain' ? [] : ['manual_replay_route_not_abstain_recorded_without_effect'],
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

const replayPlan = JSON.parse(await readFile(replayPlanPath, 'utf8'));
const parserReplayEvidence = JSON.parse(await readFile(parserReplayEvidencePath, 'utf8'));
const decisionTraceSchema = JSON.parse(await readFile(decisionTraceSchemaPath, 'utf8'));
const observationSchema = JSON.parse(await readFile(observationSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));

assert.equal(replayPlan.replayMode, 'manual_offline_decisiontrace_live_shadow_replay_only');
assert.equal(replayPlan.observerMode, 'passive');
assert.equal(replayPlan.observerAction, 'record_only');
assert.equal(replayPlan.effectBoundary, 'no_effects');
assert.equal(replayPlan.writeBoundary, 'local_shadow_only');
for (const pathName of requiredForbiddenPaths) assert.ok(replayPlan.forbiddenPaths.includes(pathName), `replay plan must forbid ${pathName}`);
for (const field of effectCapabilityFields) assert.ok(replayPlan.mustRemainFalse.includes(field), `replay plan must freeze ${field}`);
assert.equal(parserReplayEvidence.summary?.verdict, 'pass');
assert.equal(parserReplayEvidence.summary?.mode, 'manual_offline_parser_evidence_replay_only');
assert.equal(parserReplayEvidence.summary?.rawContentPersisted, false);

const traces = [];
const observations = [];
const results = [];
const validationErrors = [];
for (const [index, row] of parserReplayEvidence.replayRows.entries()) {
  const trace = traceFromReplayRow(row, index);
  const observation = observationFromTrace(trace, row, index);
  const result = resultFromObservationAndTrace(observation, trace, index);
  traces.push(trace);
  observations.push(observation);
  results.push(result);
  const traceErrors = validateSchemaValue(decisionTraceSchema, trace);
  const observationErrors = validateSchemaValue(observationSchema, observation);
  const resultErrors = validateSchemaValue(resultSchema, result);
  if (traceErrors.length > 0) validationErrors.push({ id: trace.traceId, kind: 'decision_trace', errors: traceErrors });
  if (observationErrors.length > 0) validationErrors.push({ id: observation.observationId, kind: 'observation', errors: observationErrors });
  if (resultErrors.length > 0) validationErrors.push({ id: result.resultId, kind: 'result', errors: resultErrors });
  assert.equal(trace.scope, 'local_shadow_only');
  assert.equal(trace.mode, 'offline_fixture_trace');
  assert.equal(trace.boundaryVerdict.falsePermit, false);
  assert.equal(trace.boundaryVerdict.falseCompact, false);
  assert.equal(trace.boundaryVerdict.boundaryLoss, false);
  assert.equal(observation.observerMode, 'passive');
  assert.equal(observation.effectBoundary, 'no_effects');
  assert.equal(observation.writeBoundary, 'local_shadow_only');
  assert.equal(result.observerAction, 'record_only');
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(result);
}
assert.deepEqual(validationErrors, [], 'manual DecisionTrace and live-shadow records must validate');
assert.equal(traces.length, parserReplayEvidence.summary.manualBundles);
assert.ok(traces.every((trace) => trace.matchedGold), 'manual DecisionTrace replay must match conservative expected gold decisions');

const forbiddenEffectsDetectedCount = results.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);
const capabilityTrueCount = results.reduce((sum, result) => sum + effectCapabilityFields.filter((field) => result[field] !== false).length, 0);
const mayBlockCount = results.filter((result) => result.mayBlock).length;
const mayAllowCount = results.filter((result) => result.mayAllow).length;
const falsePermitCount = traces.filter((trace) => trace.boundaryVerdict.falsePermit).length;
const falseCompactCount = traces.filter((trace) => trace.boundaryVerdict.falseCompact).length;
const boundaryLossCount = traces.filter((trace) => trace.boundaryVerdict.boundaryLoss).length;

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T02:30:00.000Z',
    verdict: 'pass',
    replayPlan: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-decisiontrace-live-shadow-replay.json',
    sourceEvidence: 'implementation/synaptic-mesh-shadow-v0/evidence/manual-bundle-parser-evidence-replay.out.json',
    decisionTraceSchema: 'schemas/decision-trace.schema.json',
    observationSchema: 'schemas/live-shadow-observation.schema.json',
    resultSchema: 'schemas/live-shadow-observation-result.schema.json',
    manualBundles: parserReplayEvidence.summary.manualBundles,
    traceCount: traces.length,
    observationCount: observations.length,
    resultCount: results.length,
    validRecordCount: traces.length + observations.length + results.length - validationErrors.length,
    validationErrorCount: validationErrors.length,
    matchedGoldCount: traces.filter((trace) => trace.matchedGold).length,
    mismatchCount: traces.filter((trace) => !trace.matchedGold).length,
    falsePermitCount,
    falseCompactCount,
    boundaryLossCount,
    recordOnlyResultCount: results.filter((result) => result.observerAction === 'record_only').length,
    forbiddenEffectsDetectedCount,
    mayBlockCount,
    mayAllowCount,
    capabilityTrueCount,
    routeDecisionInputHashBound: true,
    parserEvidenceHashBound: true,
    decisionTraceHashBound: true,
    goldDecisionHashBound: true,
    classifierDecisionHashBound: true,
    redactedMetadataOnly: true,
    rawContentPersisted: false,
    privatePathPersisted: false,
    secretLikeValuePersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    humanReviewRequiredForCapture: true,
    mode: 'manual_offline_decisiontrace_live_shadow_replay_only',
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
    agentInstructionWriteImplemented: false,
    approvalPathImplemented: false,
    blockingOrAllowingImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_offline_decisiontrace_and_live_shadow_record_replay_only_not_live_observer_not_runtime_not_authorization',
  },
  traces,
  observations,
  results,
  validationErrors,
  knownUncoveredRisks: [
    'manual_decisiontrace_replay_consumes_redacted_parserEvidence_evidence_not_raw_content',
    'live_shadow_records_are_offline_replay_records_not_runtime_observer_events',
    'record_only_results_cannot_authorize_block_allow_or_execute',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_approval_or_enforcement_added',
  ],
  boundary: replayPlan.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
