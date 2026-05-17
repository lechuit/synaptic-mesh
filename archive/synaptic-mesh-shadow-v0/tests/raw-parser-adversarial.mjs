import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-raw-parser-adversarial-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/raw-parser-adversarial.json');
const schemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/raw-parser-adversarial.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const stableSnakePattern = /^[a-z0-9_]+$/;
const compactForbiddenRoutes = new Set(['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'abstain']);

function assertNonEmptyArray(values, label) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  assert.ok(values.length > 0, `${label} must not be empty`);
}

function validateStableCodes(values, label) {
  assertNonEmptyArray(values, label);
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  return new Set(values);
}

function assertRouteDecisionShape(testCase, schemaEnums) {
  const decision = testCase.routeDecision ?? {};
  assert.ok(schemaEnums.routes.has(decision.selectedRoute), `${testCase.id} selectedRoute must use canonical route vocabulary`);
  assert.equal(decision.selectedRoute, testCase.expected.selectedRoute, `${testCase.id} expected route must match routeDecision`);
  assert.equal(decision.humanRequired, testCase.expected.humanRequired, `${testCase.id} humanRequired must match expected`);
  assert.equal(typeof decision.humanRequired, 'boolean', `${testCase.id} humanRequired must be boolean`);
  validateStableCodes(decision.reasonCodes, `${testCase.id} reasonCodes`);
  validateStableCodes(decision.decisiveSignals, `${testCase.id} decisiveSignals`);
  for (const code of testCase.expected.reasonCodes) assert.ok(decision.reasonCodes.includes(code), `${testCase.id} missing expected reason code ${code}`);
  assert.ok(decision.rejectedRoutes && typeof decision.rejectedRoutes === 'object' && !Array.isArray(decision.rejectedRoutes), `${testCase.id} rejectedRoutes must be object`);
  assert.ok(Object.keys(decision.rejectedRoutes).length > 0, `${testCase.id} rejectedRoutes must not be empty`);
  for (const [route, reasons] of Object.entries(decision.rejectedRoutes)) {
    assert.ok(schemaEnums.routes.has(route), `${testCase.id} rejected route ${route} must be canonical`);
    assert.notEqual(route, decision.selectedRoute, `${testCase.id} must not reject selected route`);
    const reasonList = Array.isArray(reasons) ? reasons : [reasons];
    validateStableCodes(reasonList, `${testCase.id} rejected ${route} reasons`);
  }
  assert.match(decision.actionIntent, stableSnakePattern, `${testCase.id} actionIntent must be stable snake_case`);
  assert.ok(schemaEnums.actionEffects.has(decision.actionEffect), `${testCase.id} actionEffect must be canonical`);
  assert.ok(schemaEnums.authorityLevels.has(decision.authorityLevel), `${testCase.id} authorityLevel must be canonical`);
  assert.ok(schemaEnums.boundaryCoverage.has(decision.boundaryCoverage), `${testCase.id} boundaryCoverage must be canonical`);
}

function assertParserSignals(testCase) {
  assert.equal(typeof testCase.rawArtifactId, 'string', `${testCase.id} rawArtifactId must be present`);
  assert.ok(testCase.rawArtifactId.length > 0, `${testCase.id} rawArtifactId must not be empty`);
  assert.equal(typeof testCase.rawInput, 'string', `${testCase.id} rawInput must be present`);
  assert.ok(testCase.rawInput.length > 0, `${testCase.id} rawInput must not be empty`);

  const signals = testCase.parserSignals;
  assert.ok(signals && typeof signals === 'object' && !Array.isArray(signals), `${testCase.id} parserSignals must be recorded`);
  assert.equal(typeof signals.rawInputShape, 'string', `${testCase.id} parserSignals.rawInputShape must be recorded`);
  assert.ok(Array.isArray(signals.freeTextAuthorityAttempts), `${testCase.id} freeTextAuthorityAttempts must be recorded`);
  assert.ok(Array.isArray(signals.sensitiveSignals), `${testCase.id} sensitiveSignals must be recorded`);
  assert.ok('foldedIndex' in signals, `${testCase.id} foldedIndex must be recorded, even when null`);
  assert.ok(Array.isArray(signals.receiptCandidates), `${testCase.id} receiptCandidates must be recorded`);
  assert.ok(Array.isArray(signals.annotations), `${testCase.id} annotations must be recorded`);

  for (const code of signals.annotations) assert.match(code, stableCodePattern, `${testCase.id} annotation ${code} must be stable`);
  for (const code of signals.sensitiveSignals) assert.match(code, stableCodePattern, `${testCase.id} sensitive signal ${code} must be stable`);
  for (const code of testCase.expected.reasonCodes) {
    assert.ok(
      signals.annotations.includes(code) || signals.sensitiveSignals.includes(code) || signals.freeTextAuthorityAttempts.includes(code),
      `${testCase.id} expected reason ${code} must be visible in parser signal annotations/sensitive/free-text attempts`,
    );
  }
}

function assertRoutePolicy(testCase) {
  const { selectedRoute, compactAllowed, humanRequired } = testCase.expected;
  assert.equal(testCase.routeDecision.selectedRoute, selectedRoute, `${testCase.id} route mismatch`);
  assert.equal(testCase.routeDecision.humanRequired, humanRequired, `${testCase.id} humanRequired mismatch`);
  assert.equal(typeof compactAllowed, 'boolean', `${testCase.id} compactAllowed must be boolean`);

  if (compactForbiddenRoutes.has(selectedRoute)) {
    assert.equal(compactAllowed, false, `${testCase.id} ${selectedRoute} must not allow compact handoff`);
  }
  if (selectedRoute === 'ask_human') assert.equal(humanRequired, true, `${testCase.id} ask_human must require human`);
  if (['fetch_source', 'request_full_receipt', 'block'].includes(selectedRoute)) assert.equal(humanRequired, false, `${testCase.id} ${selectedRoute} must not require human by default`);
}

function assertMinimumScenarioCoverage(records) {
  const byId = new Map(records.map((record) => [record.id, record]));
  const requiredIds = [
    'external-prose-prompt-injection-blocks-without-boundary',
    'external-prose-runtime-memory-promotion-asks-human',
    'folded-index-clean-hidden-runtime-receipt-asks-human',
    'malformed-plausible-local-shadow-receipt-fetches-source',
    'malformed-plausible-runtime-receipt-asks-human',
    'free-text-next-allowed-action-tamper-asks-human',
    'multiple-valid-receipts-conflict-asks-human',
    'stale-local-shadow-receipt-fetches-source',
    'stale-runtime-receipt-asks-human',
  ];
  for (const id of requiredIds) assert.ok(byId.has(id), `missing minimum scenario ${id}`);

  assert.equal(byId.get('stale-local-shadow-receipt-fetches-source').routeDecision.selectedRoute, 'fetch_source', 'stale local-shadow receipt must fetch_source');
  assert.equal(byId.get('stale-local-shadow-receipt-fetches-source').expected.compactAllowed, false, 'stale local-shadow receipt must not compact');
  assert.equal(byId.get('stale-local-shadow-receipt-fetches-source').expected.humanRequired, false, 'stale local-shadow receipt must not require human');
  for (const code of ['STALE_POLICY_WINDOW', 'SOURCE_REFRESH_REQUIRED']) {
    assert.ok(byId.get('stale-local-shadow-receipt-fetches-source').routeDecision.reasonCodes.includes(code), `stale local-shadow receipt must include ${code}`);
  }
  assert.equal(byId.get('stale-runtime-receipt-asks-human').routeDecision.selectedRoute, 'ask_human', 'stale runtime receipt must ask_human');
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const schemaEnums = {
  routes: enumValues(schema, 'selectedRoute'),
  actionEffects: enumValues(schema, 'actionEffect'),
  authorityLevels: enumValues(schema, 'authorityLevel'),
  boundaryCoverage: enumValues(schema, 'boundaryCoverage'),
};

assert.equal(fixture.artifact, artifact);
assert.match(fixture.status, /not_classifier/);
for (const boundary of ['local_shadow_only', 'not_runtime_enforcement', 'not_tool_execution', 'not_config', 'not_memory_write', 'not_external_publication']) {
  assert.ok(fixture.boundary.includes(boundary), `fixture boundary must include ${boundary}`);
}
assert.deepEqual([...new Set(fixture.routeVocabulary)].sort(), [...schemaEnums.routes].sort(), 'fixture route vocabulary must match RouteDecision schema');
assertNonEmptyArray(fixture.fixtures, 'fixtures');

const validationErrors = [];
const routeCounts = Object.fromEntries([...schemaEnums.routes].map((route) => [route, 0]));
const reasonCodeSet = new Set();
const sensitiveSignalSet = new Set();
const parserSignalCoverage = {
  rawArtifactId: 0,
  rawInput: 0,
  freeTextAuthorityAttempts: 0,
  sensitiveSignals: 0,
  foldedIndexPresent: 0,
  receiptCandidates: 0,
};

for (const testCase of fixture.fixtures) {
  try {
    assert.equal(typeof testCase.id, 'string', 'fixture id must be string');
    assertParserSignals(testCase);
    assertRouteDecisionShape(testCase, schemaEnums);
    assertRoutePolicy(testCase);
    routeCounts[testCase.routeDecision.selectedRoute] += 1;
    if (testCase.rawArtifactId) parserSignalCoverage.rawArtifactId += 1;
    if (testCase.rawInput) parserSignalCoverage.rawInput += 1;
    if (testCase.parserSignals.freeTextAuthorityAttempts.length > 0) parserSignalCoverage.freeTextAuthorityAttempts += 1;
    if (testCase.parserSignals.sensitiveSignals.length > 0) parserSignalCoverage.sensitiveSignals += 1;
    if (testCase.parserSignals.foldedIndex) parserSignalCoverage.foldedIndexPresent += 1;
    if (testCase.parserSignals.receiptCandidates.length > 0) parserSignalCoverage.receiptCandidates += 1;
    for (const code of testCase.routeDecision.reasonCodes) reasonCodeSet.add(code);
    for (const code of testCase.parserSignals.sensitiveSignals) sensitiveSignalSet.add(code);
  } catch (error) {
    validationErrors.push({ id: testCase.id ?? 'unknown', error: error.message });
  }
}

try {
  assertMinimumScenarioCoverage(fixture.fixtures);
} catch (error) {
  validationErrors.push({ id: 'minimum-scenario-coverage', error: error.message });
}

assert.deepEqual(validationErrors, [], 'all raw/parser adversarial fixtures should validate');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T21:35:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/raw-parser-adversarial.json',
    fixtureCount: fixture.fixtures.length,
    validCount: fixture.fixtures.length - validationErrors.length,
    routesCovered: Object.fromEntries(Object.entries(routeCounts).filter(([, count]) => count > 0)),
    reasonCodesValidated: reasonCodeSet.size,
    sensitiveSignalsValidated: sensitiveSignalSet.size,
    parserSignalCoverage,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    parserRobustnessProven: false,
    safetyClaimScope: 'raw_fixture_parser_pressure_only_not_semantic_parser_robustness_not_runtime_safety_not_authorization',
  },
  minimumScenarios: fixture.fixtures.map((testCase) => ({
    id: testCase.id,
    caseType: testCase.caseType,
    selectedRoute: testCase.routeDecision.selectedRoute,
    compactAllowed: testCase.expected.compactAllowed,
    humanRequired: testCase.expected.humanRequired,
    reasonCodes: testCase.routeDecision.reasonCodes,
  })),
  knownUncoveredRisks: [
    'fixture_validator_checks_hand_authored_annotations_not_live_parser_semantics',
    'no_classifier_runtime_enforcement_or_tool_authorization_added',
    'raw_inputs_are_adversarial_examples_not_production_safety_proof',
    'receipt_candidates_are_shape_annotations_not_cryptographic_or_source_verification',
  ],
  validationErrors,
  boundary: [
    'local_shadow_only',
    'raw_fixture_parser_pressure_only',
    'not_runtime_integration',
    'not_tool_execution',
    'not_memory_write',
    'not_external_publication',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
