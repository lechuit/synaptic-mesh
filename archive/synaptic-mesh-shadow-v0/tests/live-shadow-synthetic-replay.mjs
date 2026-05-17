import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoCapabilityBooleans, effectCapabilityFields, requiredForbiddenPaths, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-live-shadow-synthetic-replay-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const replayPlanPath = resolve(packageRoot, 'fixtures/live-shadow-synthetic-replay.json');
const decisionTraceEvidencePath = resolve(packageRoot, 'evidence/decision-trace-schema.out.json');
const observationSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/live-shadow-synthetic-replay.out.json');

const replayPlan = JSON.parse(await readFile(replayPlanPath, 'utf8'));
const decisionTraceEvidence = JSON.parse(await readFile(decisionTraceEvidencePath, 'utf8'));
const observationSchema = JSON.parse(await readFile(observationSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));

assert.equal(replayPlan.replayMode, 'synthetic_offline_only');
assert.equal(replayPlan.observerMode, 'passive');
assert.equal(replayPlan.observerAction, 'record_only');
assert.equal(replayPlan.effectBoundary, 'no_effects');
assert.equal(replayPlan.writeBoundary, 'local_shadow_only');
assert.match(replayPlan.description, /Offline replay plan only/);
assert.match(replayPlan.description, /without reading live traffic or implementing an observer/);
for (const pathName of requiredForbiddenPaths) assert.ok(replayPlan.forbiddenPaths.includes(pathName), `replay plan must forbid ${pathName}`);
for (const field of effectCapabilityFields) assert.ok(replayPlan.mustRemainFalse.includes(field), `replay plan must freeze ${field}`);

const traces = decisionTraceEvidence.traces ?? [];
assert.ok(traces.length >= 20 && traces.length <= 30, 'synthetic replay must consume the current 20-30 offline DecisionTrace records');
assert.equal(decisionTraceEvidence.summary?.verdict, 'pass', 'source DecisionTrace evidence must be passing');
assert.equal(decisionTraceEvidence.summary?.liveShadowObserverImplemented, false, 'source evidence must not implement a live observer');

function observationFromTrace(trace, index) {
  return {
    schemaVersion: 'live-shadow-observation-v0',
    observationId: `lso_synthetic_${String(index + 1).padStart(3, '0')}`,
    flowId: trace.flowId,
    observedAt: '2026-05-08T01:10:00.000Z',
    observerMode: 'passive',
    effectBoundary: 'no_effects',
    writeBoundary: 'local_shadow_only',
    sourceArtifactId: trace.traceId,
    parserEvidenceRef: trace.parserEvidenceRef,
    routeDecisionInputHash: trace.routeDecisionInputHash,
    classifierDecisionHash: trace.classifierDecisionHash,
    decisionTraceHash: trace.goldDecisionHash,
    allowedInputs: ['decision_trace', 'parser_evidence', 'route_decision_input', 'classifier_decision'],
    forbiddenPaths: [...requiredForbiddenPaths],
    auditReasonCodes: ['LIVE_SHADOW_OBSERVE_ONLY', 'LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_LOCAL_ONLY', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
  };
}

function resultFromObservationAndTrace(observation, trace, index) {
  const warnings = trace.matchedGold ? [] : ['source_decision_trace_mismatch'];
  const driftSignals = trace.selectedRoute === 'shadow_only' ? [] : ['classifier_decision_not_shadow_only_recorded_without_effect'];
  return {
    schemaVersion: 'live-shadow-observation-result-v0',
    observationId: observation.observationId,
    resultId: `lsor_synthetic_${String(index + 1).padStart(3, '0')}`,
    observerAction: 'record_only',
    matchedExpectedPolicy: trace.matchedGold === true,
    warnings,
    safetySignals: ['decision_trace_present', 'record_only_result', 'no_forbidden_effects_detected'],
    driftSignals,
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

const observations = [];
const results = [];
const validationErrors = [];
for (const [index, trace] of traces.entries()) {
  const observation = observationFromTrace(trace, index);
  const result = resultFromObservationAndTrace(observation, trace, index);
  observations.push(observation);
  results.push(result);
  const observationErrors = validateSchemaValue(observationSchema, observation);
  const resultErrors = validateSchemaValue(resultSchema, result);
  if (observationErrors.length > 0) validationErrors.push({ id: observation.observationId, kind: 'observation', errors: observationErrors });
  if (resultErrors.length > 0) validationErrors.push({ id: result.resultId, kind: 'result', errors: resultErrors });
  assert.equal(observation.observerMode, 'passive');
  assert.equal(observation.effectBoundary, 'no_effects');
  assert.equal(observation.writeBoundary, 'local_shadow_only');
  assert.equal(result.observerAction, 'record_only');
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(result);
}
assert.deepEqual(validationErrors, [], 'synthetic replay observations and results must validate');

const forbiddenEffectsDetectedCount = results.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0);
const mayBlockCount = results.filter((result) => result.mayBlock).length;
const mayAllowCount = results.filter((result) => result.mayAllow).length;
const capabilityTrueCount = results.reduce((sum, result) => sum + effectCapabilityFields.filter((field) => result[field] !== false).length, 0);
assert.equal(forbiddenEffectsDetectedCount, 0, 'synthetic replay must detect zero forbidden effects');
assert.equal(mayBlockCount, 0, 'synthetic replay must never block');
assert.equal(mayAllowCount, 0, 'synthetic replay must never allow');
assert.equal(capabilityTrueCount, 0, 'synthetic replay must never set capability fields true');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T01:10:00.000Z',
    verdict: 'pass',
    replayPlan: 'implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-synthetic-replay.json',
    sourceEvidence: 'implementation/synaptic-mesh-shadow-v0/evidence/decision-trace-schema.out.json',
    observationSchema: 'schemas/live-shadow-observation.schema.json',
    resultSchema: 'schemas/live-shadow-observation-result.schema.json',
    traceCount: traces.length,
    observationCount: observations.length,
    resultCount: results.length,
    validRecordCount: observations.length + results.length - validationErrors.length,
    validationErrorCount: validationErrors.length,
    recordOnlyResultCount: results.filter((result) => result.observerAction === 'record_only').length,
    forbiddenEffectsDetectedCount,
    mayBlockCount,
    mayAllowCount,
    capabilityTrueCount,
    mode: 'synthetic_offline_replay_only',
    observerImplemented: false,
    liveTrafficRead: false,
    liveLogsRead: false,
    daemonImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    agentInstructionWriteImplemented: false,
    approvalPathImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'synthetic_live_shadow_replay_shape_only_not_live_observer_not_runtime_not_authorization',
  },
  observations,
  results,
  validationErrors,
  knownUncoveredRisks: [
    'replay_consumes_tracked_decision_trace_evidence_not_live_traffic',
    'observation_records_are_synthetically_derived_not_runtime_events',
    'result_records_are_record_only_and_cannot_authorize_routes',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_or_enforcement_added',
  ],
  boundary: replayPlan.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
