import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-parser-normalization-evidence-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const parserEvidenceSchemaPath = resolve(repoRoot, 'schemas/parser-evidence.schema.json');
const routeDecisionSchemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/parser-normalization-evidence.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const stableSnakePattern = /^[a-z0-9_]+$/;
const hashPattern = /^sha256:[a-f0-9]{64}$/;
const compactForbiddenRoutes = new Set(['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'abstain']);

function sha256Json(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  return new Set(values);
}

function assertStableCodes(values, label, { allowEmpty = true } = {}) {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  if (!allowEmpty) assert.ok(values.length > 0, `${label} must not be empty`);
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function assertParserEvidenceShape(testCase, schema) {
  const evidence = testCase.parserEvidence;
  assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), `${testCase.id} parserEvidence must be object`);
  for (const required of schema.required) assert.ok(required in evidence, `${testCase.id} parserEvidence missing ${required}`);
  assert.equal(evidence.rawArtifactId, testCase.rawArtifactId, `${testCase.id} rawArtifactId must match fixture source`);
  assert.match(evidence.rawInputShape, stableSnakePattern, `${testCase.id} rawInputShape must be snake_case`);
  assert.equal(evidence.receiptCandidatesFound, testCase.receiptCandidates.length, `${testCase.id} receipt candidate count mismatch`);
  assert.equal(evidence.validReceipts + evidence.invalidReceipts, evidence.receiptCandidatesFound, `${testCase.id} valid+invalid must equal candidate count`);
  assert.equal(evidence.validReceipts, testCase.receiptCandidates.filter((candidate) => candidate.validShape === true).length, `${testCase.id} valid receipt count mismatch`);
  assert.equal(evidence.invalidReceipts, testCase.receiptCandidates.filter((candidate) => candidate.validShape === false).length, `${testCase.id} invalid receipt count mismatch`);
  assertStableCodes(evidence.freeTextAuthorityAttempts, `${testCase.id} freeTextAuthorityAttempts`);
  assertStableCodes(evidence.sensitiveSignals, `${testCase.id} sensitiveSignals`);
  assertStableCodes(evidence.normalizationWarnings, `${testCase.id} normalizationWarnings`);
  assert.match(evidence.routeDecisionInputHash, hashPattern, `${testCase.id} routeDecisionInputHash must be stable sha256`);
  assert.equal(evidence.routeDecisionInputHash, sha256Json(testCase.routeDecisionInput), `${testCase.id} routeDecisionInputHash must bind normalized input`);

  if (evidence.foldedIndex !== null) {
    assert.equal(typeof evidence.foldedIndex.present, 'boolean', `${testCase.id} foldedIndex.present must be boolean`);
    assert.equal(typeof evidence.foldedIndex.checksumMatches, 'boolean', `${testCase.id} foldedIndex.checksumMatches must be boolean`);
    assert.equal(typeof evidence.foldedIndex.sensitivePromotionSeen, 'boolean', `${testCase.id} foldedIndex.sensitivePromotionSeen must be boolean`);
  }
}

function assertRouteDecisionInput(testCase, routeEnums) {
  const input = testCase.routeDecisionInput;
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), `${testCase.id} routeDecisionInput must be object`);
  assert.equal(typeof input.normalizedAuthorityLevel, 'string', `${testCase.id} normalizedAuthorityLevel must be string`);
  assert.match(input.normalizedActionEffect, stableSnakePattern, `${testCase.id} normalizedActionEffect must be snake_case`);
  assert.ok(input.candidateSummary && typeof input.candidateSummary === 'object', `${testCase.id} candidateSummary must be object`);
  assert.ok(routeEnums.routes.has(input.recommendedRoute), `${testCase.id} recommendedRoute must use canonical route vocabulary`);
}

function assertExpectedDecision(testCase, routeEnums) {
  const decision = testCase.expectedRouteDecision;
  assert.ok(routeEnums.routes.has(decision.selectedRoute), `${testCase.id} selectedRoute must use canonical route vocabulary`);
  assert.equal(typeof decision.compactAllowed, 'boolean', `${testCase.id} compactAllowed must be boolean`);
  assert.equal(typeof decision.humanRequired, 'boolean', `${testCase.id} humanRequired must be boolean`);
  assertStableCodes(decision.reasonCodes, `${testCase.id} reasonCodes`, { allowEmpty: false });
  if (compactForbiddenRoutes.has(decision.selectedRoute)) assert.equal(decision.compactAllowed, false, `${testCase.id} ${decision.selectedRoute} must not compact`);
  if (decision.selectedRoute === 'ask_human') assert.equal(decision.humanRequired, true, `${testCase.id} ask_human must require human`);
  if (['fetch_source', 'request_full_receipt', 'block'].includes(decision.selectedRoute)) assert.equal(decision.humanRequired, false, `${testCase.id} ${decision.selectedRoute} must not require human by default`);

  const observableSignals = new Set([
    ...testCase.parserEvidence.freeTextAuthorityAttempts,
    ...testCase.parserEvidence.sensitiveSignals,
    ...testCase.parserEvidence.normalizationWarnings,
  ]);
  for (const code of decision.reasonCodes) {
    assert.ok(observableSignals.has(code) || code.startsWith('LOCAL_SHADOW_'), `${testCase.id} reason code ${code} must be visible in parserEvidence or local-shadow allow reason`);
  }
}

function assertMinimumCoverage(records) {
  const byId = new Map(records.map((record) => [record.id, record]));
  for (const id of [
    'raw-flow-valid-local-shadow-normalizes-to-shadow-only',
    'raw-flow-free-text-config-promotion-normalizes-to-ask-human',
    'raw-flow-stale-source-normalizes-to-fetch-source',
    'raw-flow-folded-index-mismatch-normalizes-to-ask-human',
    'raw-flow-malformed-local-receipt-normalizes-to-request-full-receipt',
  ]) assert.ok(byId.has(id), `missing required parser normalization case ${id}`);

  assert.equal(byId.get('raw-flow-free-text-config-promotion-normalizes-to-ask-human').expectedRouteDecision.selectedRoute, 'ask_human');
  assert.equal(byId.get('raw-flow-stale-source-normalizes-to-fetch-source').expectedRouteDecision.selectedRoute, 'fetch_source');
  assert.equal(byId.get('raw-flow-malformed-local-receipt-normalizes-to-request-full-receipt').expectedRouteDecision.selectedRoute, 'request_full_receipt');
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const parserEvidenceSchema = JSON.parse(await readFile(parserEvidenceSchemaPath, 'utf8'));
const routeDecisionSchema = JSON.parse(await readFile(routeDecisionSchemaPath, 'utf8'));
const routeEnums = {
  routes: enumValues(routeDecisionSchema, 'selectedRoute'),
};

assert.equal(fixture.artifact, artifact);
assert.match(fixture.status, /not_classifier_not_runtime/);
for (const boundary of ['local_shadow_only', 'parser_evidence_shape_only', 'not_classifier', 'not_runtime_enforcement', 'not_tool_execution', 'not_config', 'not_memory_write', 'not_external_publication']) {
  assert.ok(fixture.boundary.includes(boundary), `fixture boundary must include ${boundary}`);
}
assert.deepEqual([...new Set(fixture.routeVocabulary)].sort(), [...routeEnums.routes].sort(), 'fixture route vocabulary must match RouteDecision schema');
assert.ok(Array.isArray(fixture.fixtures) && fixture.fixtures.length > 0, 'fixtures must not be empty');

const validationErrors = [];
const routeCounts = Object.fromEntries([...routeEnums.routes].map((route) => [route, 0]));
const warningSet = new Set();
const sensitiveSignalSet = new Set();
const coverage = {
  parserEvidencePresent: 0,
  routeDecisionInputHashBound: 0,
  freeTextAuthorityAttempts: 0,
  sensitiveSignals: 0,
  foldedIndexMismatch: 0,
  staleSourceOrPolicy: 0,
  invalidReceiptSchema: 0,
};

for (const testCase of fixture.fixtures) {
  try {
    assert.equal(typeof testCase.id, 'string', 'fixture id must be string');
    assert.equal(typeof testCase.rawInput, 'string', `${testCase.id} rawInput must be string`);
    assert.ok(Array.isArray(testCase.receiptCandidates), `${testCase.id} receiptCandidates must be array`);
    assertParserEvidenceShape(testCase, parserEvidenceSchema);
    assertRouteDecisionInput(testCase, routeEnums);
    assertExpectedDecision(testCase, routeEnums);
    routeCounts[testCase.expectedRouteDecision.selectedRoute] += 1;
    coverage.parserEvidencePresent += 1;
    if (testCase.parserEvidence.routeDecisionInputHash === sha256Json(testCase.routeDecisionInput)) coverage.routeDecisionInputHashBound += 1;
    if (testCase.parserEvidence.freeTextAuthorityAttempts.length > 0) coverage.freeTextAuthorityAttempts += 1;
    if (testCase.parserEvidence.sensitiveSignals.length > 0) coverage.sensitiveSignals += 1;
    if (testCase.parserEvidence.normalizationWarnings.includes('FOLDED_INDEX_MISMATCH')) coverage.foldedIndexMismatch += 1;
    if (testCase.parserEvidence.normalizationWarnings.some((code) => ['STALE_POLICY_WINDOW', 'SOURCE_REFRESH_REQUIRED'].includes(code))) coverage.staleSourceOrPolicy += 1;
    if (testCase.parserEvidence.normalizationWarnings.includes('INVALID_RECEIPT_SCHEMA')) coverage.invalidReceiptSchema += 1;
    for (const code of testCase.parserEvidence.normalizationWarnings) warningSet.add(code);
    for (const code of testCase.parserEvidence.sensitiveSignals) sensitiveSignalSet.add(code);
  } catch (error) {
    validationErrors.push({ id: testCase.id ?? 'unknown', error: error.message });
  }
}

try {
  assertMinimumCoverage(fixture.fixtures);
} catch (error) {
  validationErrors.push({ id: 'minimum-parser-normalization-coverage', error: error.message });
}

assert.deepEqual(validationErrors, [], 'all parser normalization evidence fixtures should validate');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T22:45:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/parser-normalization-evidence.json',
    schema: 'schemas/parser-evidence.schema.json',
    fixtureCount: fixture.fixtures.length,
    validCount: fixture.fixtures.length - validationErrors.length,
    routesCovered: Object.fromEntries(Object.entries(routeCounts).filter(([, count]) => count > 0)),
    normalizationWarningsValidated: warningSet.size,
    sensitiveSignalsValidated: sensitiveSignalSet.size,
    coverage,
    parserEvidencePresentRate: coverage.parserEvidencePresent / fixture.fixtures.length,
    routeDecisionInputHashBoundRate: coverage.routeDecisionInputHashBound / fixture.fixtures.length,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    safetyClaimScope: 'parser_evidence_shape_and_normalization_fixture_evidence_only_not_classifier_not_runtime_not_authorization',
  },
  cases: fixture.fixtures.map((testCase) => ({
    id: testCase.id,
    caseType: testCase.caseType,
    rawInputShape: testCase.rawInputShape,
    receiptCandidatesFound: testCase.parserEvidence.receiptCandidatesFound,
    validReceipts: testCase.parserEvidence.validReceipts,
    invalidReceipts: testCase.parserEvidence.invalidReceipts,
    selectedRoute: testCase.expectedRouteDecision.selectedRoute,
    compactAllowed: testCase.expectedRouteDecision.compactAllowed,
    humanRequired: testCase.expectedRouteDecision.humanRequired,
    normalizationWarnings: testCase.parserEvidence.normalizationWarnings,
    sensitiveSignals: testCase.parserEvidence.sensitiveSignals,
  })),
  knownUncoveredRisks: [
    'parser_evidence_is_hand_authored_fixture_evidence_not_live_parser_robustness',
    'no_classifier_runtime_enforcement_or_tool_authorization_added',
    'route_decision_input_hash_binds_fixture_input_but_is_not_cryptographic_authority',
    'real_flow_replay_and_live_shadow_observer_are_not_implemented_yet',
  ],
  validationErrors,
  boundary: [
    'local_shadow_only',
    'parser_evidence_shape_only',
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
