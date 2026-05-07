import assert from 'node:assert/strict';
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

function assertFlow(flow, routeEnums, parserEvidenceIds) {
  assert.equal(typeof flow.flowId, 'string', 'flowId must be string');
  assert.equal(typeof flow.sourceKind, 'string', `${flow.flowId} sourceKind must be string`);
  assert.equal(typeof flow.rawArtifact, 'string', `${flow.flowId} rawArtifact must be string`);
  assert.ok(flow.rawArtifact.length > 0, `${flow.flowId} rawArtifact must not be empty`);
  assert.ok(parserEvidenceIds.has(flow.parserEvidenceRef), `${flow.flowId} parserEvidenceRef must point to parser normalization fixture`);

  const gold = flow.goldLabel;
  const observed = flow.observedDecision;
  assert.ok(gold && typeof gold === 'object', `${flow.flowId} goldLabel must exist`);
  assert.ok(observed && typeof observed === 'object', `${flow.flowId} observedDecision must exist`);
  assert.ok(routeEnums.routes.has(gold.expectedRoute), `${flow.flowId} gold expectedRoute must be canonical`);
  assert.ok(routeEnums.routes.has(observed.selectedRoute), `${flow.flowId} observed selectedRoute must be canonical`);
  assert.equal(typeof gold.expectedHumanRequired, 'boolean', `${flow.flowId} expectedHumanRequired must be boolean`);
  assert.equal(typeof gold.expectedCompactAllowed, 'boolean', `${flow.flowId} expectedCompactAllowed must be boolean`);
  assert.equal(typeof observed.humanRequired, 'boolean', `${flow.flowId} observed humanRequired must be boolean`);
  assert.equal(typeof observed.compactAllowed, 'boolean', `${flow.flowId} observed compactAllowed must be boolean`);
  assertStableCodes(gold.expectedReasonCodes, `${flow.flowId} expectedReasonCodes`);
  assertStableCodes(observed.reasonCodes, `${flow.flowId} observed reasonCodes`);
  assertStableCodes(observed.decisiveSignals, `${flow.flowId} decisiveSignals`);
  assert.ok(Array.isArray(gold.forbiddenEffects), `${flow.flowId} forbiddenEffects must be array`);
  assert.ok(gold.forbiddenEffects.length > 0, `${flow.flowId} forbiddenEffects must not be empty`);

  assert.equal(observed.selectedRoute, gold.expectedRoute, `${flow.flowId} selectedRoute must match gold label`);
  assert.equal(observed.humanRequired, gold.expectedHumanRequired, `${flow.flowId} humanRequired must match gold label`);
  assert.equal(observed.compactAllowed, gold.expectedCompactAllowed, `${flow.flowId} compactAllowed must match gold label`);
  for (const code of gold.expectedReasonCodes) assert.ok(observed.reasonCodes.includes(code), `${flow.flowId} missing expected reason ${code}`);

  if (compactForbiddenRoutes.has(observed.selectedRoute)) assert.equal(observed.compactAllowed, false, `${flow.flowId} ${observed.selectedRoute} must not compact`);
  if (observed.selectedRoute === 'ask_human') assert.equal(observed.humanRequired, true, `${flow.flowId} ask_human must require human`);
  if (['fetch_source', 'request_full_receipt', 'block'].includes(observed.selectedRoute)) assert.equal(observed.humanRequired, false, `${flow.flowId} ${observed.selectedRoute} must not require human by default`);

  assert.ok(observed.rejectedRoutes && typeof observed.rejectedRoutes === 'object' && !Array.isArray(observed.rejectedRoutes), `${flow.flowId} rejectedRoutes must be object`);
  for (const [route, reasons] of Object.entries(observed.rejectedRoutes)) {
    assert.ok(routeEnums.routes.has(route), `${flow.flowId} rejected route ${route} must be canonical`);
    assert.notEqual(route, observed.selectedRoute, `${flow.flowId} must not reject selected route`);
    assertStableCodes(Array.isArray(reasons) ? reasons : [reasons], `${flow.flowId} rejected ${route} reasons`);
  }
}

function assertMinimumCoverage(flows) {
  const routeCounts = new Map();
  for (const flow of flows) routeCounts.set(flow.observedDecision.selectedRoute, (routeCounts.get(flow.observedDecision.selectedRoute) ?? 0) + 1);
  for (const route of ['shadow_only', 'ask_human', 'fetch_source', 'request_full_receipt']) {
    assert.ok((routeCounts.get(route) ?? 0) > 0, `real-flow replay must cover route ${route}`);
  }
  assert.ok(flows.some((flow) => flow.goldLabel.forbiddenEffects.includes('memory')), 'must include memory boundary replay');
  assert.ok(flows.some((flow) => flow.goldLabel.forbiddenEffects.includes('config')), 'must include config boundary replay');
  assert.ok(flows.some((flow) => flow.goldLabel.forbiddenEffects.includes('runtime') || flow.goldLabel.forbiddenEffects.includes('tool_execution')), 'must include runtime/tool boundary replay');
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const parserFixture = JSON.parse(await readFile(parserFixturePath, 'utf8'));
const routeDecisionSchema = JSON.parse(await readFile(routeDecisionSchemaPath, 'utf8'));
const routeEnums = { routes: enumValues(routeDecisionSchema, 'selectedRoute') };
const parserEvidenceIds = new Set(parserFixture.fixtures.map((record) => record.id));

assert.equal(fixture.artifact, artifact);
assert.match(fixture.status, /offline_naturalistic_replay/);
for (const boundary of ['local_shadow_only', 'offline_replay_only', 'gold_labels_required', 'not_live_shadow_observer', 'not_classifier', 'not_runtime_enforcement', 'not_tool_execution', 'not_config', 'not_memory_write', 'not_external_publication']) {
  assert.ok(fixture.boundary.includes(boundary), `fixture boundary must include ${boundary}`);
}
assert.deepEqual([...new Set(fixture.routeVocabulary)].sort(), [...routeEnums.routes].sort(), 'fixture route vocabulary must match RouteDecision schema');
assert.ok(Array.isArray(fixture.flows) && fixture.flows.length > 0, 'flows must not be empty');

const validationErrors = [];
const routeCounts = Object.fromEntries([...routeEnums.routes].map((route) => [route, 0]));
const falsePermitFlows = [];
const falseCompactFlows = [];
const falseHumanEscalationFlows = [];
const boundaryLossFlows = [];
const wrongRouteFlows = [];
const reasonCodeSet = new Set();

for (const flow of fixture.flows) {
  try {
    assertFlow(flow, routeEnums, parserEvidenceIds);
    routeCounts[flow.observedDecision.selectedRoute] += 1;
    for (const code of flow.observedDecision.reasonCodes) reasonCodeSet.add(code);
    const expectedNonPermit = flow.goldLabel.expectedRoute !== 'shadow_only' || flow.goldLabel.expectedHumanRequired || flow.goldLabel.expectedCompactAllowed === false;
    if (expectedNonPermit && flow.observedDecision.selectedRoute === 'shadow_only') falsePermitFlows.push(flow.flowId);
    if (!flow.goldLabel.expectedCompactAllowed && flow.observedDecision.compactAllowed) falseCompactFlows.push(flow.flowId);
    if (!flow.goldLabel.expectedHumanRequired && flow.observedDecision.humanRequired) falseHumanEscalationFlows.push(flow.flowId);
    if (!Array.isArray(flow.goldLabel.forbiddenEffects) || flow.goldLabel.forbiddenEffects.length === 0) boundaryLossFlows.push(flow.flowId);
    if (flow.observedDecision.selectedRoute !== flow.goldLabel.expectedRoute) wrongRouteFlows.push(flow.flowId);
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
assert.deepEqual(falsePermitFlows, [], 'falsePermitRate must be zero for replay fixtures');
assert.deepEqual(falseCompactFlows, [], 'falseCompactRate must be zero for replay fixtures');
assert.deepEqual(boundaryLossFlows, [], 'boundaryLossRate must be zero for replay fixtures');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T23:05:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    flowCount: fixture.flows.length,
    validCount: fixture.flows.length - validationErrors.length,
    matchedGoldLabels: fixture.flows.length - wrongRouteFlows.length,
    routesCovered: Object.fromEntries(Object.entries(routeCounts).filter(([, count]) => count > 0)),
    reasonCodesValidated: reasonCodeSet.size,
    falsePermitRate: falsePermitFlows.length / fixture.flows.length,
    falseCompactRate: falseCompactFlows.length / fixture.flows.length,
    falseHumanEscalationRate: falseHumanEscalationFlows.length / fixture.flows.length,
    boundaryLossRate: boundaryLossFlows.length / fixture.flows.length,
    wrongRouteRate: wrongRouteFlows.length / fixture.flows.length,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    safetyClaimScope: 'offline_naturalistic_replay_with_gold_labels_only_not_live_observer_not_classifier_not_runtime_authorization',
  },
  scorecard: {
    falsePermitFlows,
    falseCompactFlows,
    falseHumanEscalationFlows,
    boundaryLossFlows,
    wrongRouteFlows,
  },
  auditLog: fixture.flows.map((flow) => ({
    flowId: flow.flowId,
    sourceKind: flow.sourceKind,
    parserEvidenceRef: flow.parserEvidenceRef,
    expectedRoute: flow.goldLabel.expectedRoute,
    selectedRoute: flow.observedDecision.selectedRoute,
    matched: flow.goldLabel.expectedRoute === flow.observedDecision.selectedRoute,
    compactAllowed: flow.observedDecision.compactAllowed,
    humanRequired: flow.observedDecision.humanRequired,
    reasonCodes: flow.observedDecision.reasonCodes,
    decisiveSignals: flow.observedDecision.decisiveSignals,
    rejectedRoutes: flow.observedDecision.rejectedRoutes,
  })),
  knownUncoveredRisks: [
    'replay_flows_are_hand_authored_naturalistic_examples_not_live_traffic',
    'gold_labels_are_fixture_expectations_not_human_adjudication_dataset',
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
