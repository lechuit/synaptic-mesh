import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-authority-claim-route-fixtures-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-claim-routes.json');
const evidencePath = resolve(packageRoot, 'evidence/authority-claim-routes-fixtures.out.json');

const expectedRoutes = [
  'block',
  'ask_human',
  'fetch_source',
  'request_full_receipt',
  'request_policy_refresh',
  'request_grammar_refresh',
  'shadow_only',
  'abstain',
];

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
assert.equal(fixture.artifact, artifact);
assert.equal(fixture.status, 'fixture_metadata_only_no_classifier');
assert.ok(fixture.boundary.includes('fixture_metadata_only'));
assert.ok(fixture.boundary.includes('not_classifier'));
assert.ok(fixture.boundary.includes('not_runtime_enforcement'));
assert.equal(fixture.threatModel?.document, 'docs/threat-model-v0.md');
assert.ok(fixture.threatModel.actors.includes('BoundarySmuggler'));
assert.ok(fixture.threatModel.actors.includes('NestedHandoffConfuser'));
assert.ok(fixture.threatModel.capabilities.includes('canClaimAuthorityWithoutEvidence'));
assert.ok(fixture.threatModel.capabilities.includes('canHideSensitivePromotion'));

const routeIds = fixture.routes.map((route) => route.id);
assert.deepEqual(routeIds, expectedRoutes, 'route vocabulary must be explicit and stable');
assert.equal(new Set(routeIds).size, routeIds.length, 'route ids must be unique');

const routes = new Map(fixture.routes.map((route) => [route.id, route]));
const expectedBoundaries = [
  'read_only',
  'local_shadow',
  'memory_candidate',
  'shared_memory',
  'permanent_memory',
  'config_change',
  'runtime_tool',
  'external_publication',
];
const boundaryTaxonomy = fixture.boundaryTaxonomy ?? [];
const boundaryIds = boundaryTaxonomy.map((entry) => entry.boundary);
assert.deepEqual(boundaryIds, expectedBoundaries, 'boundary taxonomy must be explicit and stable');
assert.equal(new Set(boundaryIds).size, boundaryIds.length, 'boundary ids must be unique');
const boundaries = new Map(boundaryTaxonomy.map((entry) => [entry.boundary, entry]));
assert.equal(boundaries.get('read_only').requiresHumanDefault, false);
assert.equal(boundaries.get('local_shadow').canCompact, 'yes_with_receipt');
assert.equal(boundaries.get('memory_candidate').requiresHumanDefault, false);
assert.equal(boundaries.get('shared_memory').requiresHumanDefault, 'possibly');
for (const boundaryId of ['permanent_memory', 'config_change', 'runtime_tool', 'external_publication']) {
  assert.equal(boundaries.get(boundaryId).canCompact, 'no', `${boundaryId} must not have a compact authority route`);
  assert.equal(boundaries.get(boundaryId).requiresHumanDefault, true, `${boundaryId} should default to human review`);
}
assert.equal(routes.get('ask_human').humanRequiredDefault, true);
for (const routeId of expectedRoutes.filter((routeId) => routeId !== 'ask_human')) {
  assert.equal(routes.get(routeId).humanRequiredDefault, false, `${routeId} should not default to human escalation`);
}

const cases = fixture.fixtures;
assert.ok(cases.length >= expectedRoutes.length, 'at least one fixture should exercise each route');
const caseIds = new Set(cases.map((testCase) => testCase.id));
assert.ok(caseIds.has('compact-receipt-missing-boundary-fields-requests-full-receipt'));
assert.ok(caseIds.has('config-change-requested-by-agent-inference-asks-human'));
assert.ok(caseIds.has('permanent-memory-claim-asks-human'));
assert.ok(caseIds.has('external-publication-authority-asks-human'));

for (const testCase of cases) {
  assert.ok(routes.has(testCase.selectedRoute), `${testCase.id} uses unknown route ${testCase.selectedRoute}`);
  assert.equal(typeof testCase.humanRequired, 'boolean', `${testCase.id} must declare humanRequired`);
  assert.equal(typeof testCase.reason, 'string', `${testCase.id} must declare a reason`);
  assert.equal(testCase.unsafeAllow, false, `${testCase.id} must not be an unsafe allow fixture`);
  if (testCase.boundaryType) assert.ok(boundaries.has(testCase.boundaryType), `${testCase.id} uses unknown boundary ${testCase.boundaryType}`);
}


const byId = Object.fromEntries(cases.map((testCase) => [testCase.id, testCase]));
assert.equal(byId['compact-receipt-missing-boundary-fields-requests-full-receipt'].selectedRoute, 'request_full_receipt');
assert.equal(byId['compact-receipt-missing-boundary-fields-requests-full-receipt'].humanRequired, false);
assert.equal(
  byId['compact-receipt-missing-boundary-fields-requests-full-receipt'].reason,
  'compact_receipt_missing_boundary_fields',
);
assert.equal(byId['config-change-requested-by-agent-inference-asks-human'].selectedRoute, 'ask_human');
assert.equal(byId['config-change-requested-by-agent-inference-asks-human'].humanRequired, true);
assert.equal(
  byId['config-change-requested-by-agent-inference-asks-human'].reason,
  'config_change_requested_by_agent_inference',
);

const routeCounts = Object.fromEntries(expectedRoutes.map((routeId) => [routeId, 0]));
const boundaryCounts = Object.fromEntries(expectedBoundaries.map((boundaryId) => [boundaryId, 0]));
for (const testCase of cases) {
  routeCounts[testCase.selectedRoute] += 1;
  if (testCase.boundaryType) boundaryCounts[testCase.boundaryType] += 1;
}
for (const routeId of expectedRoutes) assert.ok(routeCounts[routeId] > 0, `${routeId} must have fixture coverage`);
for (const boundaryId of expectedBoundaries) {
  assert.ok(boundaryCounts[boundaryId] > 0, `${boundaryId} must have fixture coverage`);
}

const askHumanCases = cases.filter((testCase) => testCase.selectedRoute === 'ask_human');
const nonHumanDegradationCases = cases.filter(
  (testCase) => testCase.selectedRoute !== 'ask_human' && testCase.humanRequired === false,
);
assert.ok(askHumanCases.length > 0, 'fixtures should include genuine human escalation');
assert.ok(nonHumanDegradationCases.length >= 6, 'most degradation routes should remain non-human mechanical routes');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T18:45:00.000Z',
    verdict: 'pass',
    routeCount: routeIds.length,
    fixtureCount: cases.length,
    routeCounts,
    boundaryCount: boundaryIds.length,
    boundaryCounts,
    askHumanCases: askHumanCases.length,
    nonHumanDegradationCases: nonHumanDegradationCases.length,
    unsafeAllows: cases.filter((testCase) => testCase.unsafeAllow).length,
    classifierImplemented: false,
    sourceFixtureMutation: false,
    threatActors: fixture.threatModel.actors.length,
    threatCapabilities: fixture.threatModel.capabilities.length,
    knownUncoveredRisks: fixture.threatModel.knownUncoveredRisks.length,
  },
  expectedRoutes,
  expectedBoundaries,
  fixtureIds: cases.map((testCase) => testCase.id),
  examples: {
    compactReceiptMissingBoundaryFields: byId['compact-receipt-missing-boundary-fields-requests-full-receipt'],
    configChangeRequestedByAgentInference: byId['config-change-requested-by-agent-inference-asks-human'],
  },
  threatModel: fixture.threatModel,
  knownNextStepForPr26: fixture.knownNextStepForPr26,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
