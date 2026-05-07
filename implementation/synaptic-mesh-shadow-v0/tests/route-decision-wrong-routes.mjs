import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-route-decision-wrong-routes-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/route-decision-wrong-routes.json');
const schemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/route-decision-wrong-routes.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const stableSnakePattern = /^[a-z0-9_]+$/;
const runtimeClaimPattern = /\b(enforces?|protects?|guarantees?|authorizes?|allows?|runtime classifier|production safe|security certification)\b/i;

const requiredCoverageAreas = [
  'malicious_external_document_semantic_parsing',
  'folded_index_hidden_promotion_interaction',
  'live_stale_policy_hot_swap',
  'nested_authority_resolution',
  'memory_claim_to_permission_claim_laundering',
  'free_text_next_allowed_action_change',
  'stale_replayed_receipt',
  'ambiguous_verb_inside_prose',
  'missing_policy_checksum_or_stale_policy_window',
];

const highPriorityCaseIds = [
  'WR-RD-005-memory-claim-permission-claim-laundering',
  'WR-RD-001-malicious-external-document-prose-authority',
  'WR-RD-002-folded-index-hidden-permanent-memory',
];

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  assert.equal(new Set(values).size, values.length, `schema enum for ${propertyName} must be unique`);
  return new Set(values);
}

function assertUniqueArray(values, label) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  assert.ok(values.length > 0, `${label} must not be empty`);
  assert.equal(new Set(values).size, values.length, `${label} must not contain duplicates`);
}

function validateStableCodes(values, label) {
  assertUniqueArray(values, label);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function normalizeReasonList(reasons) {
  return Array.isArray(reasons) ? reasons : [reasons];
}

function validateRejectedRoutes(record, routeValues, label) {
  assert.ok(record.rejectedRoutes && typeof record.rejectedRoutes === 'object' && !Array.isArray(record.rejectedRoutes), `${label} rejectedRoutes must be object`);
  const entries = Object.entries(record.rejectedRoutes);
  assert.ok(entries.length > 0, `${label} rejectedRoutes must not be empty`);
  for (const [route, reasons] of entries) {
    assert.ok(routeValues.has(route), `${label} rejects unknown route ${route}`);
    assert.notEqual(route, record.selectedRoute, `${label} rejectedRoutes must not reject selected route`);
    const reasonList = normalizeReasonList(reasons);
    assert.ok(reasonList.length > 0, `${label} rejected route ${route} must include a reason`);
    for (const reason of reasonList) assert.match(reason, stableCodePattern, `${label} rejected route ${route} has unstable reason ${reason}`);
  }
}

function validateRouteDecision(caseId, decision, schemaSets) {
  assert.ok(decision && typeof decision === 'object' && !Array.isArray(decision), `${caseId} must include correctRouteDecision`);
  assert.ok(schemaSets.routeValues.has(decision.selectedRoute), `${caseId} selectedRoute must be known`);
  assert.equal(typeof decision.humanRequired, 'boolean', `${caseId} humanRequired must be boolean`);
  validateStableCodes(decision.reasonCodes, `${caseId} reasonCodes`);
  validateStableCodes(decision.decisiveSignals, `${caseId} decisiveSignals`);
  validateRejectedRoutes(decision, schemaSets.routeValues, caseId);
  assert.equal(typeof decision.actionIntent, 'string', `${caseId} actionIntent must be string`);
  assert.match(decision.actionIntent, stableSnakePattern, `${caseId} actionIntent must be stable snake_case`);
  assert.ok(schemaSets.actionEffectValues.has(decision.actionEffect), `${caseId} actionEffect must be known`);
  assert.ok(schemaSets.authorityLevelValues.has(decision.authorityLevel), `${caseId} authorityLevel must be known`);
  assert.ok(schemaSets.boundaryCoverageValues.has(decision.boundaryCoverage), `${caseId} boundaryCoverage must be known`);
  if (decision.verificationFailureMode !== undefined) assert.match(decision.verificationFailureMode, stableSnakePattern, `${caseId} verificationFailureMode must be stable snake_case`);
  if (decision.humanReason !== undefined) assert.ok(decision.humanReason.length > 0, `${caseId} humanReason must be non-empty when present`);
}

function validateWrongRoutes(testCase, routeValues) {
  assert.ok(Array.isArray(testCase.wrongRoutes), `${testCase.caseId} wrongRoutes must be array`);
  assert.ok(testCase.wrongRoutes.length >= 2, `${testCase.caseId} must include at least two tempting wrong routes`);
  const wrongRouteIds = new Set();
  const rejectedRoutes = testCase.correctRouteDecision.rejectedRoutes;
  for (const wrongRoute of testCase.wrongRoutes) {
    assert.ok(wrongRoute && typeof wrongRoute === 'object' && !Array.isArray(wrongRoute), `${testCase.caseId} wrongRoutes entries must be objects`);
    assert.ok(routeValues.has(wrongRoute.route), `${testCase.caseId} wrong route ${wrongRoute.route} must be known`);
    assert.notEqual(wrongRoute.route, testCase.correctRouteDecision.selectedRoute, `${testCase.caseId} wrong route must not equal correct selected route`);
    assert.ok(Object.hasOwn(rejectedRoutes, wrongRoute.route), `${testCase.caseId} wrong route ${wrongRoute.route} must be present in correctRouteDecision.rejectedRoutes`);
    validateStableCodes(wrongRoute.reasonCodes, `${testCase.caseId} wrong route ${wrongRoute.route} reasonCodes`);
    const rejectedReasons = new Set(normalizeReasonList(rejectedRoutes[wrongRoute.route]));
    for (const reason of wrongRoute.reasonCodes) assert.ok(rejectedReasons.has(reason), `${testCase.caseId} wrong route ${wrongRoute.route} reason ${reason} must match rejectedRoutes`);
    assert.ok(typeof wrongRoute.temptation === 'string' && wrongRoute.temptation.length > 0, `${testCase.caseId} wrong route ${wrongRoute.route} must explain temptation`);
    wrongRouteIds.add(wrongRoute.route);
  }
  assert.equal(wrongRouteIds.size, testCase.wrongRoutes.length, `${testCase.caseId} wrongRoutes must be unique`);
}

function assertNoRuntimeProtectionClaims(testCase) {
  const text = [
    testCase.inputSummary,
    testCase.prevents,
    testCase.correctRouteDecision?.humanReason,
    ...(testCase.correctRouteDecision?.reasonCodes ?? []),
    ...(testCase.correctRouteDecision?.decisiveSignals ?? []),
    ...(testCase.wrongRoutes ?? []).flatMap((wrongRoute) => [wrongRoute.temptation, ...(wrongRoute.reasonCodes ?? [])]),
  ].filter(Boolean).join(' ');
  assert.ok(!runtimeClaimPattern.test(text), `${testCase.caseId} must not claim runtime/enforcement protection`);
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(fixture.artifact, artifact);
assert.equal(fixture.status, 'local_shadow_oracle_fixtures_only');
assert.match(fixture.description, /not a runtime classifier/i);
for (const nonClaim of ['not_runtime_classifier', 'not_semantic_inference', 'not_enforcement']) assert.ok(fixture.nonClaims.includes(nonClaim), `fixture must declare ${nonClaim}`);
assert.deepEqual(fixture.requiredCoverageAreas, requiredCoverageAreas, 'required coverage areas must remain explicit and stable');
assert.ok(Array.isArray(fixture.knownUncoveredRisks), 'fixture must declare knownUncoveredRisks');
assert.ok(fixture.knownUncoveredRisks.includes('no_runtime_classifier_or_enforcement_added'), 'fixture must state no classifier/runtime enforcement');

const schemaSets = {
  routeValues: enumValues(schema, 'selectedRoute'),
  actionEffectValues: enumValues(schema, 'actionEffect'),
  authorityLevelValues: enumValues(schema, 'authorityLevel'),
  boundaryCoverageValues: enumValues(schema, 'boundaryCoverage'),
};

const cases = fixture.fixtures;
assert.ok(Array.isArray(cases) && cases.length >= requiredCoverageAreas.length, 'must include at least one fixture per required coverage area');
assert.equal(new Set(cases.map((testCase) => testCase.caseId)).size, cases.length, 'caseIds must be unique');

const validationErrors = [];
const coverageCounts = Object.fromEntries(requiredCoverageAreas.map((area) => [area, 0]));
const selectedRouteCounts = Object.fromEntries([...schemaSets.routeValues].map((route) => [route, 0]));
const boundaryCounts = Object.fromEntries([...schemaSets.authorityLevelValues].map((boundary) => [boundary, 0]));
const wrongRouteCounts = Object.fromEntries([...schemaSets.routeValues].map((route) => [route, 0]));
const reasonCodes = new Set();
const decisiveSignals = new Set();

for (const testCase of cases) {
  try {
    assert.match(testCase.caseId, /^WR-RD-\d{3}-[a-z0-9-]+$/, 'caseId must be stable');
    assert.ok(requiredCoverageAreas.includes(testCase.coverageArea), `${testCase.caseId} coverageArea must be known`);
    assert.equal(typeof testCase.inputSummary, 'string', `${testCase.caseId} inputSummary must be string`);
    assert.ok(testCase.envelopeSketch && typeof testCase.envelopeSketch === 'object' && !Array.isArray(testCase.envelopeSketch), `${testCase.caseId} envelopeSketch must be object`);
    assert.equal(typeof testCase.threatActor, 'string', `${testCase.caseId} threatActor must be string`);
    assert.equal(typeof testCase.capability, 'string', `${testCase.caseId} capability must be string`);
    validateRouteDecision(testCase.caseId, testCase.correctRouteDecision, schemaSets);
    validateWrongRoutes(testCase, schemaSets.routeValues);
    validateStableCodes(testCase.decisiveSignalsRequired, `${testCase.caseId} decisiveSignalsRequired`);
    for (const signal of testCase.decisiveSignalsRequired) assert.ok(testCase.correctRouteDecision.decisiveSignals.includes(signal), `${testCase.caseId} required decisive signal ${signal} must appear in correctRouteDecision`);
    assert.equal(testCase.boundaryInvolved, testCase.correctRouteDecision.authorityLevel, `${testCase.caseId} boundaryInvolved must match authorityLevel`);
    assert.ok(typeof testCase.prevents === 'string' && testCase.prevents.length > 0, `${testCase.caseId} must explain laundering/overclaim prevention`);
    assertNoRuntimeProtectionClaims(testCase);

    coverageCounts[testCase.coverageArea] += 1;
    selectedRouteCounts[testCase.correctRouteDecision.selectedRoute] += 1;
    boundaryCounts[testCase.boundaryInvolved] += 1;
    for (const wrongRoute of testCase.wrongRoutes) wrongRouteCounts[wrongRoute.route] += 1;
    for (const code of testCase.correctRouteDecision.reasonCodes) reasonCodes.add(code);
    for (const signal of testCase.correctRouteDecision.decisiveSignals) decisiveSignals.add(signal);
  } catch (error) {
    validationErrors.push({ caseId: testCase.caseId ?? 'unknown', error: error.message });
  }
}

assert.deepEqual(validationErrors, [], 'all wrong-route oracle fixtures should validate');
for (const area of requiredCoverageAreas) assert.ok(coverageCounts[area] > 0, `must cover ${area}`);
const caseIds = new Set(cases.map((testCase) => testCase.caseId));
for (const caseId of highPriorityCaseIds) assert.ok(caseIds.has(caseId), `must include high-priority fixture ${caseId}`);
assert.equal(cases.find((testCase) => testCase.caseId === 'WR-RD-005-memory-claim-permission-claim-laundering').correctRouteDecision.selectedRoute, 'ask_human', 'memory claim laundering must route to ask_human');
assert.ok(cases.find((testCase) => testCase.caseId === 'WR-RD-005-memory-claim-permission-claim-laundering').correctRouteDecision.reasonCodes.includes('MEMORY_CLAIM_NOT_PERMISSION_AUTHORITY'), 'memory laundering fixture must reject memory-as-permission');
assert.ok(cases.some((testCase) => testCase.correctRouteDecision.selectedRoute === 'block'), 'must include a block oracle for tampered nextAllowedAction');
assert.ok(cases.some((testCase) => testCase.correctRouteDecision.selectedRoute === 'fetch_source'), 'must include fetch_source oracle for stale replayed source revalidation');
assert.ok(cases.some((testCase) => testCase.correctRouteDecision.selectedRoute === 'request_policy_refresh'), 'must include policy refresh oracle');
assert.ok(cases.some((testCase) => testCase.correctRouteDecision.selectedRoute === 'abstain'), 'must include abstain oracle');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T20:10:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/route-decision-wrong-routes.json',
    routeDecisionSchema: 'schemas/route-decision.schema.json',
    wrongRouteFixtures: cases.length,
    coverageAreaCount: requiredCoverageAreas.length,
    highPriorityCasesPresent: highPriorityCaseIds.length,
    wrongRoutesValidated: cases.reduce((total, testCase) => total + testCase.wrongRoutes.length, 0),
    reasonCodesValidated: reasonCodes.size,
    decisiveSignalsValidated: decisiveSignals.size,
    classifierImplemented: false,
    runtimeSemanticsImplemented: false,
    runtimeEnforcementImplemented: false,
    safetyClaimScope: 'local_shadow_oracle_fixture_validation_only_not_runtime_classifier_not_semantic_inference_not_authorization',
  },
  coverageAreas: Object.keys(coverageCounts).filter((area) => coverageCounts[area] > 0),
  coverageCounts,
  selectedRouteCounts: Object.fromEntries(Object.entries(selectedRouteCounts).filter(([, count]) => count > 0)),
  wrongRouteCounts: Object.fromEntries(Object.entries(wrongRouteCounts).filter(([, count]) => count > 0)),
  boundaryCounts: Object.fromEntries(Object.entries(boundaryCounts).filter(([, count]) => count > 0)),
  knownUncoveredRisks: [
    ...fixture.knownUncoveredRisks,
    'wrong_route_oracles_do_not_parse_or_classify_arbitrary_adversarial_text',
    'stable_reason_codes_are_fixture_expectations_not_runtime_decision_logic',
  ],
  validationErrors,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
