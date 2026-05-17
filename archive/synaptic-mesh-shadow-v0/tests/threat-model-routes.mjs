import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-threat-model-route-mapping-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const mappingPath = resolve(packageRoot, 'fixtures/threat-model-routes.json');
const authorityRoutesPath = resolve(packageRoot, 'fixtures/authority-claim-routes.json');
const schemaPath = resolve(repoRoot, 'schemas/route-decision.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/threat-model-routes.out.json');

const stableCodePattern = /^[A-Z0-9_]+$/;
const stableSnakePattern = /^[a-z0-9_]+$/;
const runtimeClaimPattern = /\b(enforces?|protects?|prevents?|guarantees?|authorizes?|allows?|runtime classifier|production safe|security certification)\b/i;

function enumValues(schema, propertyName) {
  const values = schema.properties?.[propertyName]?.enum;
  assert.ok(Array.isArray(values), `schema must define enum for ${propertyName}`);
  return new Set(values);
}

function validateStableCodes(values, label) {
  assert.ok(Array.isArray(values) && values.length > 0, `${label} must be non-empty array`);
  assert.equal(new Set(values).size, values.length, `${label} must not contain duplicates`);
  for (const value of values) assert.match(value, stableCodePattern, `${label} contains unstable code ${value}`);
}

function validateRejectedRoutes(record, routeValues) {
  assert.ok(record.rejectedRoutes && typeof record.rejectedRoutes === 'object' && !Array.isArray(record.rejectedRoutes), `${record.threatId} rejectedRoutes must be object`);
  const entries = Object.entries(record.rejectedRoutes);
  assert.ok(entries.length > 0, `${record.threatId} rejectedRoutes must not be empty`);
  for (const [route, reasons] of entries) {
    assert.ok(routeValues.has(route), `${record.threatId} rejects unknown route ${route}`);
    assert.notEqual(route, record.selectedRoute, `${record.threatId} must not reject selected route`);
    const reasonList = Array.isArray(reasons) ? reasons : [reasons];
    assert.ok(reasonList.length > 0, `${record.threatId} rejected route ${route} must include reason`);
    for (const reason of reasonList) assert.match(reason, stableCodePattern, `${record.threatId} rejected route ${route} has unstable reason ${reason}`);
  }
}

function validateRouteDecision(mapping, schemaSets) {
  const decision = mapping.routeDecision;
  assert.ok(decision && typeof decision === 'object' && !Array.isArray(decision), `${mapping.threatId} must include routeDecision`);
  const record = { threatId: mapping.threatId, ...decision };

  assert.ok(schemaSets.routeValues.has(record.selectedRoute), `${mapping.threatId} selectedRoute must be known`);
  assert.equal(record.selectedRoute, mapping.expectedSelectedRoute, `${mapping.threatId} routeDecision must match expectedSelectedRoute`);
  assert.equal(typeof record.humanRequired, 'boolean', `${mapping.threatId} humanRequired must be boolean`);
  validateStableCodes(record.reasonCodes, `${mapping.threatId} reasonCodes`);
  validateStableCodes(record.decisiveSignals, `${mapping.threatId} decisiveSignals`);
  validateRejectedRoutes(record, schemaSets.routeValues);
  assert.equal(typeof record.actionIntent, 'string', `${mapping.threatId} actionIntent must be string`);
  assert.match(record.actionIntent, stableSnakePattern, `${mapping.threatId} actionIntent must be stable snake_case`);
  assert.ok(schemaSets.actionEffectValues.has(record.actionEffect), `${mapping.threatId} actionEffect must be known`);
  assert.ok(schemaSets.authorityLevelValues.has(record.authorityLevel), `${mapping.threatId} authorityLevel must be known`);
  assert.ok(schemaSets.boundaryCoverageValues.has(record.boundaryCoverage), `${mapping.threatId} boundaryCoverage must be known`);
  if (record.verificationFailureMode !== undefined) assert.match(record.verificationFailureMode, stableSnakePattern, `${mapping.threatId} verificationFailureMode must be stable snake_case`);
  if (record.humanReason !== undefined) assert.ok(record.humanReason.length > 0, `${mapping.threatId} humanReason must be non-empty when present`);
  for (const expectedReason of mapping.expectedReasonCodes) assert.ok(record.reasonCodes.includes(expectedReason), `${mapping.threatId} missing expected reason ${expectedReason}`);
}

function hasActorCapabilityCoverage(actor, capability, mappings, gaps) {
  return mappings.some((mapping) => mapping.actor === actor && mapping.capability === capability) || gaps.some((gap) => gap.actor === actor && gap.capability === capability);
}

function assertNoRuntimeProtectionClaims(mapping) {
  const text = [
    mapping.scenario,
    mapping.humanReason,
    ...(mapping.expectedReasonCodes ?? []),
    ...(mapping.routeDecision?.reasonCodes ?? []),
    ...(mapping.routeDecision?.decisiveSignals ?? []),
    ...(mapping.routeDecision?.humanReason ? [mapping.routeDecision.humanReason] : []),
  ].filter(Boolean).join(' ');
  assert.ok(!runtimeClaimPattern.test(text), `${mapping.threatId} must not claim runtime/enforcement protection`);
}

const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
const authorityRoutes = JSON.parse(await readFile(authorityRoutesPath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(mapping.artifact, artifact);
assert.equal(mapping.status, 'local_shadow_mapping_only');
assert.match(mapping.description, /not a runtime classifier/i);
assert.ok(mapping.nonClaims.includes('not_runtime_classifier'));
assert.ok(mapping.nonClaims.includes('not_enforcement'));

const schemaSets = {
  routeValues: enumValues(schema, 'selectedRoute'),
  actionEffectValues: enumValues(schema, 'actionEffect'),
  authorityLevelValues: enumValues(schema, 'authorityLevel'),
  boundaryCoverageValues: enumValues(schema, 'boundaryCoverage'),
};
const fixtureIds = new Set(authorityRoutes.fixtures.map((fixture) => fixture.id));
const fixtureIdsFromRuns = new Set(['source-spoofing-nested-handoff-fixture-v0']);
const mappings = mapping.mappings;
const gaps = mapping.explicitKnownGaps;

assert.ok(Array.isArray(mapping.actors) && mapping.actors.length === 9, 'must list all threat-model actors');
assert.ok(Array.isArray(mapping.capabilities) && mapping.capabilities.length === 8, 'must list all threat-model capabilities');
assert.ok(Array.isArray(mappings) && mappings.length > 0, 'must include mappings');
assert.ok(Array.isArray(gaps), 'must include explicitKnownGaps');

const validationErrors = [];
const actorCounts = Object.fromEntries(mapping.actors.map((actor) => [actor, 0]));
const capabilityCounts = Object.fromEntries(mapping.capabilities.map((capability) => [capability, 0]));
const routeCounts = Object.fromEntries([...schemaSets.routeValues].map((route) => [route, 0]));
const boundaryCounts = Object.fromEntries([...schemaSets.authorityLevelValues].map((boundary) => [boundary, 0]));
const reasonCodes = new Set();

for (const entry of mappings) {
  try {
    assert.match(entry.threatId, /^TM-R\d{2}$/, 'threatId must be stable');
    assert.ok(mapping.actors.includes(entry.actor), `${entry.threatId} actor must be in threat model`);
    assert.ok(mapping.capabilities.includes(entry.capability), `${entry.threatId} capability must be in threat model`);
    assert.equal(entry.coverageStatus, 'covered_fixture', `${entry.threatId} coverageStatus must be covered_fixture`);
    assert.ok(schemaSets.authorityLevelValues.has(entry.boundary), `${entry.threatId} boundary must match boundary taxonomy`);
    assert.ok(schemaSets.routeValues.has(entry.expectedSelectedRoute), `${entry.threatId} expectedSelectedRoute must be known`);
    validateStableCodes(entry.expectedReasonCodes, `${entry.threatId} expectedReasonCodes`);
    validateRejectedRoutes({ threatId: entry.threatId, selectedRoute: entry.expectedSelectedRoute, rejectedRoutes: entry.expectedRejectedRoutes }, schemaSets.routeValues);
    validateRouteDecision(entry, schemaSets);
    assertNoRuntimeProtectionClaims(entry);
    assert.ok(fixtureIds.has(entry.fixtureRef) || fixtureIdsFromRuns.has(entry.fixtureRef), `${entry.threatId} fixtureRef must point to known fixture or recorded run fixture`);

    actorCounts[entry.actor] += 1;
    capabilityCounts[entry.capability] += 1;
    routeCounts[entry.expectedSelectedRoute] += 1;
    boundaryCounts[entry.boundary] += 1;
    for (const code of entry.expectedReasonCodes) reasonCodes.add(code);
  } catch (error) {
    validationErrors.push({ threatId: entry.threatId ?? 'unknown', error: error.message });
  }
}

for (const gap of gaps) {
  assert.match(gap.gapId, /^TM-G\d{2}$/, 'gapId must be stable');
  assert.ok(mapping.actors.includes(gap.actor), `${gap.gapId} actor must be in threat model`);
  assert.ok(mapping.capabilities.includes(gap.capability), `${gap.gapId} capability must be in threat model`);
  assert.equal(gap.status, 'known_gap', `${gap.gapId} status must be known_gap`);
  assert.ok(typeof gap.reason === 'string' && gap.reason.length > 0, `${gap.gapId} must explain gap`);
}

for (const actor of mapping.actors) assert.ok(actorCounts[actor] > 0 || gaps.some((gap) => gap.actor === actor), `${actor} must have mapping or explicit gap`);
for (const capability of mapping.capabilities) assert.ok(capabilityCounts[capability] > 0 || gaps.some((gap) => gap.capability === capability), `${capability} must have mapping or explicit gap`);
for (const actor of mapping.actors) {
  const coveredCapabilities = mapping.capabilities.filter((capability) => hasActorCapabilityCoverage(actor, capability, mappings, gaps));
  assert.ok(coveredCapabilities.length > 0, `${actor} must have at least one covered actor/capability pair`);
}

assert.deepEqual(validationErrors, [], 'all threat route mappings should validate');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T19:45:00.000Z',
    verdict: 'pass',
    mapping: 'implementation/synaptic-mesh-shadow-v0/fixtures/threat-model-routes.json',
    sourceThreatModel: mapping.sourceThreatModel,
    mappingCount: mappings.length,
    actorCount: mapping.actors.length,
    capabilityCount: mapping.capabilities.length,
    knownGapCount: gaps.length,
    reasonCodesValidated: reasonCodes.size,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    safetyClaimScope: 'local_shadow_threat_to_fixture_mapping_only_not_semantic_proof_not_runtime_authorization',
  },
  coverageAreas: {
    actors: Object.keys(actorCounts).filter((actor) => actorCounts[actor] > 0),
    capabilities: Object.keys(capabilityCounts).filter((capability) => capabilityCounts[capability] > 0),
    selectedRoutes: Object.keys(routeCounts).filter((route) => routeCounts[route] > 0),
    boundaries: Object.keys(boundaryCounts).filter((boundary) => boundaryCounts[boundary] > 0),
  },
  knownUncoveredRisks: [
    'mapping_validates_expected_route_shape_not_semantic_correctness',
    'no_runtime_classifier_or_enforcement_added',
    'malicious_external_document_semantics_are_not_parsed',
    'folded_index_tamper_detection_is_mapped_but_not_implemented',
    'policy_hot_swap_route_pressure_is_fixture_mapping_not_live_policy_state_validation'
  ],
  explicitKnownGaps: gaps,
  validationErrors,
  boundary: [
    'local_shadow_only',
    'threat_mapping_only',
    'not_runtime_integration',
    'not_tool_authorization',
    'not_external_publication'
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
