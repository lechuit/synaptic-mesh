import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-real-flow-replay-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/real-flow-replay.json');
const parserFixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const routeDecisionSchemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/real-flow-replay.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const compactForbiddenRoutes = new Set(['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'abstain']);

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

function parserEvidenceReplayHash(parserRecord) {
  return sha256({
    parserEvidence: parserRecord.parserEvidence,
    routeDecisionInput: parserRecord.routeDecisionInput,
  });
}

function decisionHash(decision) {
  return sha256(decision);
}

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  return new Set(values);
}

function assertStableCodes(values, label, { allowEmpty = false } = {}) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  if (!allowEmpty) assert.ok(values.length > 0, `${label} must not be empty`);
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function assertFlow(flow, routeEnums, parserEvidenceById) {
  assert.equal(typeof flow.flowId, 'string', 'flowId must be string');
  assert.equal(typeof flow.sourceKind, 'string', `${flow.flowId} sourceKind must be string`);
  assert.equal(typeof flow.rawArtifact, 'string', `${flow.flowId} rawArtifact must be string`);
  assert.ok(flow.rawArtifact.length > 0, `${flow.flowId} rawArtifact must not be empty`);
  const parserRecord = parserEvidenceById.get(flow.parserEvidenceRef);
  assert.ok(parserRecord, `${flow.flowId} parserEvidenceRef must point to parser normalization fixture`);
  assert.match(flow.parserEvidenceRefHash, /^sha256:[a-f0-9]{64}$/, `${flow.flowId} parserEvidenceRefHash must be sha256`);
  assert.equal(flow.parserEvidenceRefHash, parserEvidenceReplayHash(parserRecord), `${flow.flowId} parserEvidenceRefHash must match linked parserEvidence + routeDecisionInput`);

  const gold = flow.goldDecision;
  assert.ok(gold && typeof gold === 'object', `${flow.flowId} goldDecision must exist`);
  assert.ok(routeEnums.routes.has(gold.selectedRoute), `${flow.flowId} goldDecision selectedRoute must be canonical`);
  assert.equal(typeof gold.humanRequired, 'boolean', `${flow.flowId} goldDecision humanRequired must be boolean`);
  assert.equal(typeof gold.compactAllowed, 'boolean', `${flow.flowId} goldDecision compactAllowed must be boolean`);
  assertStableCodes(gold.reasonCodes, `${flow.flowId} goldDecision reasonCodes`);
  assertStableCodes(gold.decisiveSignals, `${flow.flowId} goldDecision decisiveSignals`);
  assert.ok(Array.isArray(gold.forbiddenEffects), `${flow.flowId} forbiddenEffects must be array`);
  assert.ok(gold.forbiddenEffects.length > 0, `${flow.flowId} forbiddenEffects must not be empty`);

  if (compactForbiddenRoutes.has(gold.selectedRoute)) assert.equal(gold.compactAllowed, false, `${flow.flowId} ${gold.selectedRoute} must not compact`);
  if (gold.selectedRoute === 'ask_human') assert.equal(gold.humanRequired, true, `${flow.flowId} ask_human must require human`);
  if (['fetch_source', 'request_full_receipt', 'block'].includes(gold.selectedRoute)) assert.equal(gold.humanRequired, false, `${flow.flowId} ${gold.selectedRoute} must not require human by default`);

  assert.ok(gold.rejectedRoutes && typeof gold.rejectedRoutes === 'object' && !Array.isArray(gold.rejectedRoutes), `${flow.flowId} rejectedRoutes must be object`);
  for (const [route, reasons] of Object.entries(gold.rejectedRoutes)) {
    assert.ok(routeEnums.routes.has(route), `${flow.flowId} rejected route ${route} must be canonical`);
    assert.notEqual(route, gold.selectedRoute, `${flow.flowId} must not reject selected route`);
    assertStableCodes(Array.isArray(reasons) ? reasons : [reasons], `${flow.flowId} rejected ${route} reasons`);
  }

  if (flow.observedDecision !== undefined) {
    assert.deepEqual(flow.observedDecision, {
      deprecated: true,
      replacement: 'goldDecision',
      note: 'legacy fixture oracle only; scorecards must not consume this field',
    }, `${flow.flowId} observedDecision must be deprecated metadata only`);
  }
}

function assertMinimumCoverage(flows) {
  const routeCounts = new Map();
  for (const flow of flows) routeCounts.set(flow.goldDecision.selectedRoute, (routeCounts.get(flow.goldDecision.selectedRoute) ?? 0) + 1);
  for (const route of ['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'shadow_only', 'abstain']) {
    assert.ok((routeCounts.get(route) ?? 0) > 0, `real-flow replay must cover route ${route}`);
  }
  assert.ok(flows.some((flow) => flow.goldDecision.forbiddenEffects.includes('memory')), 'must include memory boundary replay');
  assert.ok(flows.some((flow) => flow.goldDecision.forbiddenEffects.includes('config')), 'must include config boundary replay');
  assert.ok(flows.some((flow) => flow.goldDecision.forbiddenEffects.includes('runtime') || flow.goldDecision.forbiddenEffects.includes('tool_execution')), 'must include runtime/tool boundary replay');
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const parserFixture = JSON.parse(await readFile(parserFixturePath, 'utf8'));
const routeDecisionSchema = JSON.parse(await readFile(routeDecisionSchemaPath, 'utf8'));
const routeEnums = { routes: enumValues(routeDecisionSchema, 'selectedRoute') };
const parserEvidenceById = new Map(parserFixture.fixtures.map((record) => [record.id, record]));

assert.equal(fixture.artifact, artifact);
assert.match(fixture.status, /offline_naturalistic_replay/);
for (const boundary of ['local_shadow_only', 'offline_replay_only', 'gold_labels_required', 'not_live_shadow_observer', 'not_classifier', 'not_runtime_enforcement', 'not_tool_execution', 'not_config', 'not_memory_write', 'not_external_publication']) {
  assert.ok(fixture.boundary.includes(boundary), `fixture boundary must include ${boundary}`);
}
assert.deepEqual([...new Set(fixture.routeVocabulary)].sort(), [...routeEnums.routes].sort(), 'fixture route vocabulary must match RouteDecision schema');
assert.ok(Array.isArray(fixture.flows) && fixture.flows.length > 0, 'flows must not be empty');

const validationErrors = [];
const routeCounts = Object.fromEntries([...routeEnums.routes].map((route) => [route, 0]));
const boundaryLossFlows = [];
const reasonCodeSet = new Set();

for (const flow of fixture.flows) {
  try {
    assertFlow(flow, routeEnums, parserEvidenceById);
    routeCounts[flow.goldDecision.selectedRoute] += 1;
    for (const code of flow.goldDecision.reasonCodes) reasonCodeSet.add(code);
    if (!Array.isArray(flow.goldDecision.forbiddenEffects) || flow.goldDecision.forbiddenEffects.length === 0) boundaryLossFlows.push(flow.flowId);
  } catch (error) {
    validationErrors.push({ id: flow.flowId ?? 'unknown', error: error.message });
  }
}

try {
  assertMinimumCoverage(fixture.flows);
} catch (error) {
  validationErrors.push({ id: 'minimum-real-flow-replay-coverage', error: error.message });
}

assert.deepEqual(validationErrors, [], 'all real-flow replay fixtures should validate');
assert.deepEqual(boundaryLossFlows, [], 'boundaryLossRate must be zero for replay fixtures');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-08T00:00:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    flowCount: fixture.flows.length,
    validCount: fixture.flows.length - validationErrors.length,
    goldDecisionCount: fixture.flows.length,
    observedDecisionDeprecated: true,
    scorecardsConsumeObservedDecision: false,
    routesCovered: Object.fromEntries(Object.entries(routeCounts).filter(([, count]) => count > 0)),
    reasonCodesValidated: reasonCodeSet.size,
    boundaryLossRate: boundaryLossFlows.length / fixture.flows.length,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    safetyClaimScope: 'offline_naturalistic_replay_with_gold_decisions_only_not_live_observer_not_classifier_not_runtime_authorization',
  },
  scorecard: {
    boundaryLossFlows,
  },
  auditLog: fixture.flows.map((flow) => ({
    flowId: flow.flowId,
    sourceKind: flow.sourceKind,
    parserEvidenceRef: flow.parserEvidenceRef,
    parserEvidenceRefHash: flow.parserEvidenceRefHash,
    goldDecisionHash: decisionHash(flow.goldDecision),
    goldDecision: flow.goldDecision,
  })),
  knownUncoveredRisks: [
    'replay_flows_are_hand_authored_naturalistic_examples_not_live_traffic',
    'gold_decisions_are_fixture_expectations_not_human_adjudication_dataset',
    'observed_decision_is_deprecated_metadata_only_not_receiver_classifier_output',
    'no_classifier_runtime_enforcement_or_tool_authorization_added',
    'live_shadow_observer_is_not_implemented_yet',
  ],
  validationErrors,
  boundary: [
    'local_shadow_only',
    'offline_replay_only',
    'not_live_shadow_observer',
    'not_classifier',
    'not_runtime_integration',
    'not_tool_execution',
    'not_memory_write',
    'not_external_publication',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
