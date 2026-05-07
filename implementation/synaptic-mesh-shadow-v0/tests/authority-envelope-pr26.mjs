import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-authority-envelope-pr26-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-claim-routes.json');
const evidencePath = resolve(packageRoot, 'evidence/authority-envelope-pr26.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const concept = fixture.authorityEnvelopeConcept;
assert.equal(concept.status, 'pr26_fixture_concept_no_classifier');
assert.equal(concept.document, 'docs/authority-envelope-pr26.md');
assert.ok(concept.principles.includes('separate_confidence_from_authority'));
assert.ok(concept.principles.includes('separate_action_intent_from_action_effect'));
assert.ok(concept.principles.includes('route_decisions_include_selected_and_rejected_routes'));
assert.ok(concept.principles.includes('tests_validate_stable_reason_codes_not_free_text'));

const claimConfidenceValues = new Set(concept.claimConfidenceValues);
const evidenceStrengthValues = new Set(concept.evidenceStrengthValues);
const boundaryCoverageValues = new Set(concept.boundaryCoverageValues);
const actionEffectValues = new Set(concept.actionEffectValues);
const boundaryValues = new Set(fixture.boundaryTaxonomy.map((entry) => entry.boundary));
const routeValues = new Set(fixture.routes.map((route) => route.id));

const cases = fixture.fixtures;
for (const testCase of cases) {
  assert.ok(claimConfidenceValues.has(testCase.claimConfidence), `${testCase.id} has invalid claimConfidence`);
  assert.ok(evidenceStrengthValues.has(testCase.evidenceStrength), `${testCase.id} has invalid evidenceStrength`);
  assert.ok(boundaryValues.has(testCase.authorityLevel), `${testCase.id} has invalid authorityLevel`);
  assert.ok(boundaryCoverageValues.has(testCase.boundaryCoverage), `${testCase.id} has invalid boundaryCoverage`);
  assert.equal(typeof testCase.actionIntent, 'string', `${testCase.id} must declare actionIntent`);
  assert.ok(actionEffectValues.has(testCase.actionEffect), `${testCase.id} has invalid actionEffect`);

  const decision = testCase.routeDecision;
  assert.equal(decision.selectedRoute, testCase.selectedRoute, `${testCase.id} routeDecision must match selectedRoute`);
  assert.ok(routeValues.has(decision.selectedRoute), `${testCase.id} selected route must be known`);
  assert.ok(decision.rejectedRoutes && typeof decision.rejectedRoutes === 'object', `${testCase.id} must record rejectedRoutes`);
  assert.ok(Object.keys(decision.rejectedRoutes).length > 0, `${testCase.id} must reject at least one alternative route`);
  assert.ok(Array.isArray(decision.decisiveSignals) && decision.decisiveSignals.length > 0, `${testCase.id} must record decisiveSignals`);
  assert.ok(Array.isArray(decision.reasonCodes) && decision.reasonCodes.length > 0, `${testCase.id} must record stable reasonCodes`);
  for (const code of [...decision.decisiveSignals, ...decision.reasonCodes]) {
    assert.match(code, /^[A-Z0-9_]+$/, `${testCase.id} uses unstable code ${code}`);
  }
}

const byId = Object.fromEntries(cases.map((testCase) => [testCase.id, testCase]));

const highConfidenceConfig = byId['high-confidence-framework-claim-cannot-authorize-config-write'];
assert.equal(highConfidenceConfig.claimConfidence, 'high');
assert.equal(highConfidenceConfig.evidenceStrength, 'high');
assert.equal(highConfidenceConfig.authorityLevel, 'config_change');
assert.equal(highConfidenceConfig.boundaryCoverage, 'missing');
assert.equal(highConfidenceConfig.selectedRoute, 'ask_human');
assert.ok(highConfidenceConfig.routeDecision.reasonCodes.includes('CONFIDENCE_IS_NOT_AUTHORITY'));
assert.ok(highConfidenceConfig.routeDecision.reasonCodes.includes('CONFIG_CHANGE_REQUIRES_HUMAN_AUTHORITY'));

const textOnlyMigration = byId['generate-migration-plan-text-only-stays-shadow'];
const writeMigration = byId['generate-migration-filesystem-write-asks-human'];
assert.equal(textOnlyMigration.actionIntent, 'generate_migration_plan');
assert.equal(textOnlyMigration.actionEffect, 'text_only');
assert.equal(textOnlyMigration.selectedRoute, 'shadow_only');
assert.equal(writeMigration.actionIntent, 'generate_migration');
assert.equal(writeMigration.actionEffect, 'filesystem_write');
assert.equal(writeMigration.selectedRoute, 'ask_human');
assert.ok(writeMigration.routeDecision.reasonCodes.includes('ACTION_EFFECT_FILESYSTEM_WRITE'));

const compact = byId['compact-receipt-missing-boundary-fields-requests-full-receipt'];
assert.equal(compact.routeDecision.selectedRoute, 'request_full_receipt');
assert.ok(compact.routeDecision.rejectedRoutes.ask_human.includes('NO_SENSITIVE_PROMOTION'));
assert.ok(compact.routeDecision.reasonCodes.includes('MISSING_BOUNDARY_FIELDS'));
assert.ok(compact.routeDecision.decisiveSignals.includes('UNKNOWN_GRAMMAR_DIGEST'));

const benchmarkNeed = fixture.knownNextStepForPr26.some((entry) =>
  entry.includes('repeatable benchmark') &&
  entry.includes('wrongRouteRate') &&
  entry.includes('receiverDecisionAccuracy') &&
  entry.includes('boundaryLossRate'),
);
assert.equal(benchmarkNeed, true, 'future benchmark need should be captured as roadmap concept');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T18:51:00.000Z',
    verdict: 'pass',
    fixtureCount: cases.length,
    classifierImplemented: false,
    runtimeEnforcementImplemented: false,
    conceptDocument: concept.document,
  },
  examples: {
    highConfidenceConfig,
    textOnlyMigration,
    writeMigration,
    compactReceiptRouteDecision: compact.routeDecision,
  },
  benchmarkRoadmapCaptured: benchmarkNeed,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
