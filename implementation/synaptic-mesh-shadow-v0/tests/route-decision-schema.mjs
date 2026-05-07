import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-route-decision-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-claim-routes.json');
const schemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/route-decision-schema.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const stableSnakePattern = /^[a-z0-9_]+$/;

function assertUniqueArray(values, label) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  assert.ok(values.length > 0, `${label} must not be empty`);
  assert.equal(new Set(values).size, values.length, `${label} must not contain duplicates`);
}

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  assert.equal(new Set(values).size, values.length, `schema enum for ${propertyName} must be unique`);
  return new Set(values);
}

function validateStableCodes(values, label) {
  assertUniqueArray(values, label);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function validateRejectedRoutes(record, routeValues) {
  assert.ok(record.rejectedRoutes && typeof record.rejectedRoutes === 'object' && !Array.isArray(record.rejectedRoutes), `${record.id} rejectedRoutes must be an object`);
  const rejectedEntries = Object.entries(record.rejectedRoutes);
  assert.ok(rejectedEntries.length > 0, `${record.id} rejectedRoutes must not be empty`);

  for (const [route, reasons] of rejectedEntries) {
    assert.ok(routeValues.has(route), `${record.id} rejects unknown route ${route}`);
    assert.notEqual(route, record.selectedRoute, `${record.id} rejectedRoutes must not reject the selected route`);
    const reasonList = Array.isArray(reasons) ? reasons : [reasons];
    assert.ok(reasonList.length > 0, `${record.id} rejected route ${route} must include a reason`);
    for (const reason of reasonList) assert.match(reason, stableCodePattern, `${record.id} rejected route ${route} has unstable reason ${reason}`);
  }
}

function normalizeRouteDecisionRecord(testCase) {
  const decision = testCase.routeDecision ?? {};
  return {
    id: testCase.id,
    selectedRoute: decision.selectedRoute,
    humanRequired: testCase.humanRequired,
    reasonCodes: decision.reasonCodes,
    rejectedRoutes: decision.rejectedRoutes,
    decisiveSignals: decision.decisiveSignals,
    actionIntent: testCase.actionIntent,
    actionEffect: testCase.actionEffect,
    authorityLevel: testCase.authorityLevel,
    boundaryCoverage: testCase.boundaryCoverage,
    verificationFailureMode: testCase.verificationFailureMode,
    humanReason: decision.humanReason,
  };
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(schema.title, 'RouteDecision evidence record');
assert.match(schema.description, /Local shadow-only/);
assert.match(schema.description, /not semantic classifier correctness/);
assert.equal(schema.additionalProperties, false);
for (const required of ['selectedRoute', 'humanRequired', 'reasonCodes', 'rejectedRoutes', 'decisiveSignals', 'actionIntent', 'actionEffect', 'authorityLevel', 'boundaryCoverage']) {
  assert.ok(schema.required.includes(required), `schema must require ${required}`);
}

const routeValues = enumValues(schema, 'selectedRoute');
const actionEffectValues = enumValues(schema, 'actionEffect');
const authorityLevelValues = enumValues(schema, 'authorityLevel');
const boundaryCoverageValues = enumValues(schema, 'boundaryCoverage');
const fixtureRouteValues = new Set(fixture.routes.map((route) => route.id));
const boundaryTaxonomyValues = new Set(fixture.boundaryTaxonomy.map((entry) => entry.boundary));

assert.deepEqual([...routeValues].sort(), [...fixtureRouteValues].sort(), 'schema routes must match authority-route fixture vocabulary');
assert.deepEqual([...authorityLevelValues].sort(), [...boundaryTaxonomyValues].sort(), 'schema authority levels must match boundary taxonomy');

const records = fixture.fixtures.map(normalizeRouteDecisionRecord);
const routeCounts = Object.fromEntries([...routeValues].map((route) => [route, 0]));
const authorityLevelCounts = Object.fromEntries([...authorityLevelValues].map((level) => [level, 0]));
const boundaryCoverageCounts = Object.fromEntries([...boundaryCoverageValues].map((coverage) => [coverage, 0]));
const reasonCodeSet = new Set();
const rejectedRouteSet = new Set();
const decisiveSignalSet = new Set();
const validationErrors = [];

for (const record of records) {
  try {
    assert.ok(routeValues.has(record.selectedRoute), `${record.id} selectedRoute must be known`);
    assert.equal(typeof record.humanRequired, 'boolean', `${record.id} humanRequired must be boolean`);
    validateStableCodes(record.reasonCodes, `${record.id} reasonCodes`);
    validateStableCodes(record.decisiveSignals, `${record.id} decisiveSignals`);
    validateRejectedRoutes(record, routeValues);
    assert.equal(typeof record.actionIntent, 'string', `${record.id} actionIntent must be string`);
    assert.match(record.actionIntent, stableSnakePattern, `${record.id} actionIntent must be stable snake_case`);
    assert.ok(actionEffectValues.has(record.actionEffect), `${record.id} actionEffect must be known`);
    assert.ok(authorityLevelValues.has(record.authorityLevel), `${record.id} authorityLevel must be known`);
    assert.ok(boundaryCoverageValues.has(record.boundaryCoverage), `${record.id} boundaryCoverage must be known`);
    assert.equal(record.selectedRoute, fixture.fixtures.find((testCase) => testCase.id === record.id).selectedRoute, `${record.id} nested routeDecision must match fixture selectedRoute`);

    routeCounts[record.selectedRoute] += 1;
    authorityLevelCounts[record.authorityLevel] += 1;
    boundaryCoverageCounts[record.boundaryCoverage] += 1;
    for (const code of record.reasonCodes) reasonCodeSet.add(code);
    for (const code of record.decisiveSignals) decisiveSignalSet.add(code);
    for (const route of Object.keys(record.rejectedRoutes)) rejectedRouteSet.add(route);
  } catch (error) {
    validationErrors.push({ id: record.id, error: error.message });
  }
}

assert.deepEqual(validationErrors, [], 'all RouteDecision records should validate');
for (const route of routeValues) assert.ok(routeCounts[route] > 0, `schema evidence must cover route ${route}`);
for (const level of authorityLevelValues) assert.ok(authorityLevelCounts[level] > 0, `schema evidence must cover authority level ${level}`);
for (const coverage of boundaryCoverageValues) assert.ok(boundaryCoverageCounts[coverage] > 0, `schema evidence must cover boundaryCoverage ${coverage}`);

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T19:25:00.000Z',
    verdict: 'pass',
    schema: 'schemas/route-decision.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/authority-claim-routes.json',
    fixtureCount: records.length,
    validCount: records.length - validationErrors.length,
    routeCount: routeValues.size,
    reasonCodesValidated: reasonCodeSet.size,
    rejectedRoutesValidated: rejectedRouteSet.size,
    decisiveSignalsValidated: decisiveSignalSet.size,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    safetyClaimScope: 'local_shadow_schema_shape_validation_only_not_semantic_correctness_not_runtime_authorization',
  },
  routeCounts,
  coverageAreas: {
    selectedRoutes: Object.keys(routeCounts).filter((route) => routeCounts[route] > 0),
    authorityLevels: Object.keys(authorityLevelCounts).filter((level) => authorityLevelCounts[level] > 0),
    boundaryCoverage: Object.keys(boundaryCoverageCounts).filter((coverage) => boundaryCoverageCounts[coverage] > 0),
    actionEffects: [...new Set(records.map((record) => record.actionEffect))].sort(),
  },
  knownUncoveredRisks: [
    'schema_validation_checks_shape_not_route_semantics',
    'no_runtime_classifier_or_enforcement_added',
    'fixtures_are_local_shadow_examples_not_production_safety_claims',
    'verificationFailureMode_is_optional_until_dedicated_failure_fixtures_exist'
  ],
  validationErrors,
  boundary: [
    'local_shadow_only',
    'schema_shape_validation_only',
    'not_runtime_integration',
    'not_tool_authorization',
    'not_external_publication'
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
