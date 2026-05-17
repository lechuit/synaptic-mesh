import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';

const artifact = 'T-synaptic-mesh-deterministic-route-classifier-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const evidencePath = resolve(packageRoot, 'evidence/route-classifier-shadow.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const rows = [];
const mismatches = [];
const routeCounts = {};

for (const record of fixture.fixtures) {
  const classified = classifyRoute({ parserEvidence: record.parserEvidence, routeDecisionInput: record.routeDecisionInput });
  const expected = record.expectedRouteDecision;
  const matched = classified.selectedRoute === expected.selectedRoute
    && classified.humanRequired === expected.humanRequired
    && classified.compactAllowed === expected.compactAllowed
    && expected.reasonCodes.every((code) => classified.reasonCodes.includes(code));
  routeCounts[classified.selectedRoute] = (routeCounts[classified.selectedRoute] ?? 0) + 1;
  const row = {
    id: record.id,
    expectedRoute: expected.selectedRoute,
    classifiedRoute: classified.selectedRoute,
    matched,
    expectedHumanRequired: expected.humanRequired,
    classifiedHumanRequired: classified.humanRequired,
    expectedCompactAllowed: expected.compactAllowed,
    classifiedCompactAllowed: classified.compactAllowed,
    reasonCodes: classified.reasonCodes,
    decisiveSignals: classified.decisiveSignals,
  };
  rows.push(row);
  if (!matched) mismatches.push(row);
}

for (const route of ['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'shadow_only', 'abstain']) {
  assert.ok((routeCounts[route] ?? 0) > 0, `classifier fixture evaluation must cover ${route}`);
}

const inconsistentSensitiveSummaryDecision = classifyRoute({
  parserEvidence: {
    rawArtifactId: 'negative-control/inconsistent-sensitive-summary.md',
    rawInputShape: 'markdown_with_embedded_receipt',
    receiptCandidatesFound: 1,
    validReceipts: 1,
    invalidReceipts: 0,
    freeTextAuthorityAttempts: [],
    sensitiveSignals: [],
    foldedIndex: null,
    normalizationWarnings: [],
    routeDecisionInputHash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
  },
  routeDecisionInput: {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: 1,
      invalidReceipts: 0,
      sensitiveSignals: ['CONFIG_CHANGE_PROMOTION'],
    },
    recommendedRoute: 'shadow_only',
  },
});
const falsePermitRows = rows.filter((row) => row.expectedRoute !== 'shadow_only' && row.classifiedRoute === 'shadow_only');
const falseCompactRows = rows.filter((row) => row.expectedCompactAllowed === false && row.classifiedCompactAllowed === true);
assert.deepEqual(mismatches, [], 'shadow classifier must match parser-normalization expected decisions');
assert.deepEqual(falsePermitRows, [], 'shadow classifier must not false-permit non-shadow cases');
assert.deepEqual(falseCompactRows, [], 'shadow classifier must not compact sensitive/degraded cases');
assert.notEqual(inconsistentSensitiveSummaryDecision.selectedRoute, 'shadow_only', 'classifier must not permit when candidateSummary has sensitive signals even if parserEvidence signals are empty');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T23:25:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/parser-normalization-evidence.json',
    classifierId: 'deterministic-route-classifier-v0',
    mode: 'shadow_only_fixture_evaluation',
    fixtureCount: fixture.fixtures.length,
    matchedCount: rows.length - mismatches.length,
    mismatchCount: mismatches.length,
    routesCovered: routeCounts,
    falsePermitRate: falsePermitRows.length / rows.length,
    falseCompactRate: falseCompactRows.length / rows.length,
    inconsistentSensitiveSummaryRoute: inconsistentSensitiveSummaryDecision.selectedRoute,
    classifierImplemented: true,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    toolAuthorizationImplemented: false,
    safetyClaimScope: 'deterministic_shadow_classifier_against_hand_authored_fixtures_only_not_runtime_not_authorization',
  },
  rows,
  mismatches,
  negativeControls: [
    {
      id: 'inconsistent-sensitive-summary-signal',
      selectedRoute: inconsistentSensitiveSummaryDecision.selectedRoute,
      reasonCodes: inconsistentSensitiveSummaryDecision.reasonCodes,
      assertion: 'candidateSummary.sensitiveSignals must not be ignored for shadow_only permits',
    },
  ],
  knownUncoveredRisks: [
    'classifier_consumes_hand_authored_parser_evidence_not_raw_untrusted_input',
    'classifier_is_deterministic_shadow_only_not_runtime_enforcement',
    'no_live_shadow_observer_or_tool_authorization_added',
    'classifier_is_not_trained_or_semantic_robustness_proof',
  ],
  boundary: [
    'local_shadow_only',
    'fixture_evaluation_only',
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
