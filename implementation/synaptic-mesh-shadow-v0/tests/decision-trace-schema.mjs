import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';

const artifact = 'T-synaptic-mesh-decision-trace-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/decision-trace.schema.json');
const realFlowFixturePath = resolve(packageRoot, 'fixtures/real-flow-replay.json');
const parserFixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const evidencePath = resolve(packageRoot, 'evidence/decision-trace-schema.out.json');

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function validateSchemaValue(schema, value, path = '$') {
  const errors = [];
  const actualType = typeOf(value);
  if (schema.type && actualType !== schema.type) return [`${path}: expected ${schema.type}, got ${actualType}`];
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: enum mismatch`);
  if (schema.pattern && typeof value === 'string' && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}: pattern mismatch`);
  if (schema.type === 'object') {
    for (const field of schema.required ?? []) if (!Object.hasOwn(value, field)) errors.push(`${path}: missing required field ${field}`);
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
  if (schema.oneOf) {
    const passCount = schema.oneOf.filter((candidate) => validateSchemaValue(candidate, value, path).length === 0).length;
    if (passCount !== 1) errors.push(`${path}: oneOf mismatch`);
  }
  if (schema.type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: duplicate items`);
    }
    if (schema.items) for (const [index, item] of value.entries()) errors.push(...validateSchemaValue(schema.items, item, `${path}[${index}]`));
  }
  return errors;
}

function parserEvidenceReplayHash(parserRecord) {
  return sha256({ parserEvidence: parserRecord.parserEvidence, routeDecisionInput: parserRecord.routeDecisionInput });
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

function traceFor(flow, parserRecord) {
  const classifierDecision = classifierDecisionFrom(classifyRoute({
    parserEvidence: parserRecord.parserEvidence,
    routeDecisionInput: parserRecord.routeDecisionInput,
  }));
  const goldDecision = flow.goldDecision;
  const matchedGold = classifierDecision.selectedRoute === goldDecision.selectedRoute
    && classifierDecision.humanRequired === goldDecision.humanRequired
    && classifierDecision.compactAllowed === goldDecision.compactAllowed;
  return {
    traceId: `trace_${flow.flowId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    flowId: flow.flowId,
    parserEvidenceRef: flow.parserEvidenceRef,
    parserEvidenceRefHash: flow.parserEvidenceRefHash,
    routeDecisionInputHash: parserRecord.parserEvidence.routeDecisionInputHash,
    goldDecisionHash: sha256(goldDecision),
    classifierDecisionHash: sha256(classifierDecision),
    matchedGold,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    decisiveSignals: classifierDecision.decisiveSignals,
    rejectedRoutes: classifierDecision.rejectedRoutes,
    boundaryVerdict: {
      falsePermit: goldDecision.selectedRoute !== 'shadow_only' && classifierDecision.selectedRoute === 'shadow_only',
      falseCompact: goldDecision.compactAllowed === false && classifierDecision.compactAllowed === true,
      boundaryLoss: !Array.isArray(goldDecision.forbiddenEffects) || goldDecision.forbiddenEffects.length === 0,
    },
    mode: 'offline_fixture_trace',
    scope: 'local_shadow_only',
  };
}

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const realFlowFixture = JSON.parse(await readFile(realFlowFixturePath, 'utf8'));
const parserFixture = JSON.parse(await readFile(parserFixturePath, 'utf8'));
const parserEvidenceById = new Map(parserFixture.fixtures.map((record) => [record.id, record]));

assert.equal(schema.title, 'DecisionTrace evidence record');
assert.match(schema.description, /Local shadow-only/);
assert.match(schema.description, /not live observation/);
for (const required of ['traceId', 'flowId', 'parserEvidenceRef', 'parserEvidenceRefHash', 'routeDecisionInputHash', 'goldDecisionHash', 'classifierDecisionHash', 'matchedGold', 'selectedRoute', 'reasonCodes', 'decisiveSignals', 'rejectedRoutes', 'boundaryVerdict', 'mode', 'scope']) {
  assert.ok(schema.required.includes(required), `schema must require ${required}`);
}

const traces = [];
const validationErrors = [];
for (const flow of realFlowFixture.flows) {
  const parserRecord = parserEvidenceById.get(flow.parserEvidenceRef);
  assert.ok(parserRecord, `${flow.flowId} parserEvidenceRef must resolve`);
  assert.equal(flow.parserEvidenceRefHash, parserEvidenceReplayHash(parserRecord), `${flow.flowId} parserEvidenceRefHash must remain hash-bound`);
  const trace = traceFor(flow, parserRecord);
  traces.push(trace);
  const errors = validateSchemaValue(schema, trace);
  if (errors.length > 0) validationErrors.push({ traceId: trace.traceId, errors });
}

const falsePermitTraces = traces.filter((trace) => trace.boundaryVerdict.falsePermit).map((trace) => trace.traceId);
const falseCompactTraces = traces.filter((trace) => trace.boundaryVerdict.falseCompact).map((trace) => trace.traceId);
const boundaryLossTraces = traces.filter((trace) => trace.boundaryVerdict.boundaryLoss).map((trace) => trace.traceId);
const mismatchTraces = traces.filter((trace) => !trace.matchedGold).map((trace) => trace.traceId);

assert.ok(traces.length >= 20 && traces.length <= 30, 'DecisionTrace gate must cover 20–30 real-flow traces');
assert.deepEqual(validationErrors, [], 'all decision traces must validate against schema');
assert.deepEqual(falsePermitTraces, [], 'DecisionTrace falsePermit must be zero');
assert.deepEqual(falseCompactTraces, [], 'DecisionTrace falseCompact must be zero');
assert.deepEqual(boundaryLossTraces, [], 'DecisionTrace boundaryLoss must be zero');
assert.deepEqual(mismatchTraces, [], 'DecisionTrace matchedGold must be true for all current traces');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-08T00:15:00.000Z',
    verdict: 'pass',
    schema: 'schemas/decision-trace.schema.json',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    traceCount: traces.length,
    validTraceCount: traces.length - validationErrors.length,
    matchedGoldCount: traces.length - mismatchTraces.length,
    mismatchCount: mismatchTraces.length,
    falsePermitRate: falsePermitTraces.length / traces.length,
    falseCompactRate: falseCompactTraces.length / traces.length,
    boundaryLossRate: boundaryLossTraces.length / traces.length,
    parserEvidenceHashBound: true,
    routeDecisionInputHashBound: true,
    goldDecisionHashBound: true,
    classifierDecisionHashBound: true,
    mode: 'offline_fixture_trace',
    scope: 'local_shadow_only',
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    toolAuthorizationImplemented: false,
    memoryWriteImplemented: false,
    configChangeImplemented: false,
    externalPublicationImplemented: false,
    safetyClaimScope: 'decision_trace_schema_and_offline_fixture_traces_only_not_live_observer_not_runtime_not_authorization',
  },
  traces,
  validationErrors,
  scorecard: { falsePermitTraces, falseCompactTraces, boundaryLossTraces, mismatchTraces },
  knownUncoveredRisks: [
    'decision_traces_are_offline_fixture_outputs_not_live_observer_events',
    'trace_schema_validates_shape_and_hash_bindings_not_raw_parser_robustness',
    'classifier_decision_is_computed_from_normalized_parser_evidence_not_raw_input',
    'no_runtime_enforcement_tool_authorization_memory_write_config_change_or_publication_added',
  ],
  boundary: [
    'local_shadow_only',
    'offline_fixture_trace_only',
    'not_live_observer',
    'not_runtime_enforcement',
    'not_tool_authorization',
    'not_memory_write',
    'not_config',
    'not_external_publication',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
