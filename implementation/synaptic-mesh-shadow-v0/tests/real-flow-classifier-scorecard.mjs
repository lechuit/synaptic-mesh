import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';

const artifact = 'T-synaptic-mesh-real-flow-classifier-scorecard-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const realFlowFixturePath = resolve(packageRoot, 'fixtures/real-flow-replay.json');
const parserFixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const evidencePath = resolve(packageRoot, 'evidence/real-flow-classifier-scorecard.out.json');

const realFlowFixture = JSON.parse(await readFile(realFlowFixturePath, 'utf8'));
const parserFixture = JSON.parse(await readFile(parserFixturePath, 'utf8'));
const parserEvidenceById = new Map(parserFixture.fixtures.map((record) => [record.id, record]));

assert.equal(realFlowFixture.artifact, 'T-synaptic-mesh-real-flow-replay-v0');
assert.ok(Array.isArray(realFlowFixture.flows), 'real-flow fixture must expose flows');
assert.ok(realFlowFixture.flows.length >= 20 && realFlowFixture.flows.length <= 30, 'v0.1.6 real-flow replay must contain 20–30 cases');

const rows = [];
const mismatches = [];
const falsePermitRows = [];
const falseCompactRows = [];
const routeCounts = {};
const classifierRouteCounts = {};

for (const flow of realFlowFixture.flows) {
  const parserRecord = parserEvidenceById.get(flow.parserEvidenceRef);
  assert.ok(parserRecord, `${flow.flowId} parserEvidenceRef must resolve`);
  const decision = classifyRoute({
    parserEvidence: parserRecord.parserEvidence,
    routeDecisionInput: parserRecord.routeDecisionInput,
  });
  const row = {
    flowId: flow.flowId,
    parserEvidenceRef: flow.parserEvidenceRef,
    replayObservedRoute: flow.observedDecision.selectedRoute,
    goldExpectedRoute: flow.goldLabel.expectedRoute,
    classifierRoute: decision.selectedRoute,
    replayObservedCompactAllowed: flow.observedDecision.compactAllowed,
    goldExpectedCompactAllowed: flow.goldLabel.expectedCompactAllowed,
    classifierCompactAllowed: decision.compactAllowed,
    replayObservedHumanRequired: flow.observedDecision.humanRequired,
    goldExpectedHumanRequired: flow.goldLabel.expectedHumanRequired,
    classifierHumanRequired: decision.humanRequired,
    matchedGoldRoute: decision.selectedRoute === flow.goldLabel.expectedRoute,
    matchedReplayObservedRoute: decision.selectedRoute === flow.observedDecision.selectedRoute,
    classifierReasonCodes: decision.reasonCodes,
    replayReasonCodes: flow.observedDecision.reasonCodes,
  };
  rows.push(row);
  routeCounts[flow.observedDecision.selectedRoute] = (routeCounts[flow.observedDecision.selectedRoute] ?? 0) + 1;
  classifierRouteCounts[decision.selectedRoute] = (classifierRouteCounts[decision.selectedRoute] ?? 0) + 1;
  if (!row.matchedGoldRoute || !row.matchedReplayObservedRoute || decision.compactAllowed !== flow.goldLabel.expectedCompactAllowed || decision.humanRequired !== flow.goldLabel.expectedHumanRequired) mismatches.push(row);
  if (flow.goldLabel.expectedRoute !== 'shadow_only' && decision.selectedRoute === 'shadow_only') falsePermitRows.push(row);
  if (flow.goldLabel.expectedCompactAllowed === false && decision.compactAllowed === true) falseCompactRows.push(row);
}

for (const route of ['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'shadow_only', 'abstain']) {
  assert.ok((routeCounts[route] ?? 0) > 0, `scorecard real-flow replay must cover ${route}`);
  assert.ok((classifierRouteCounts[route] ?? 0) > 0, `scorecard classifier outputs must cover ${route}`);
}

assert.deepEqual(mismatches, [], 'classifier must match gold and replay observed decisions for real-flow scorecard');
assert.deepEqual(falsePermitRows, [], 'classifier scorecard falsePermit must be zero');
assert.deepEqual(falseCompactRows, [], 'classifier scorecard falseCompact must be zero');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-07T23:40:00.000Z',
    verdict: 'pass',
    realFlowFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    parserFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/parser-normalization-evidence.json',
    flowCount: realFlowFixture.flows.length,
    matchedGoldCount: rows.length - mismatches.length,
    mismatchCount: mismatches.length,
    routesCovered: routeCounts,
    classifierRoutesCovered: classifierRouteCounts,
    falsePermitRate: falsePermitRows.length / rows.length,
    falseCompactRate: falseCompactRows.length / rows.length,
    parserEvidenceHashBound: true,
    observedDecisionIsFixtureOracle: true,
    observedDecisionIsClassifierOutput: false,
    classifierImplemented: true,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    toolAuthorizationImplemented: false,
    safetyClaimScope: 'scorecard_compares_shadow_classifier_against_offline_real_flow_gold_labels_not_runtime_not_live_observer_not_authorization',
  },
  rows,
  mismatches,
  falsePermitRows,
  falseCompactRows,
  boundary: [
    'local_shadow_only',
    'offline_fixture_scorecard_only',
    'observed_decision_fixture_oracle_not_classifier_output',
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
