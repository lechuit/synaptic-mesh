import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function classifierDecisionFrom(decision) {
  return {
    selectedRoute: decision.selectedRoute,
    humanRequired: decision.humanRequired,
    compactAllowed: decision.compactAllowed,
    reasonCodes: decision.reasonCodes,
    decisiveSignals: decision.decisiveSignals,
    rejectedRoutes: decision.rejectedRoutes,
  };
}

const realFlowFixture = JSON.parse(await readFile(realFlowFixturePath, 'utf8'));
const parserFixture = JSON.parse(await readFile(parserFixturePath, 'utf8'));
const parserEvidenceById = new Map(parserFixture.fixtures.map((record) => [record.id, record]));

assert.equal(realFlowFixture.artifact, 'T-synaptic-mesh-real-flow-replay-v0');
assert.ok(Array.isArray(realFlowFixture.flows), 'real-flow fixture must expose flows');
assert.ok(realFlowFixture.flows.length >= 20 && realFlowFixture.flows.length <= 30, 'v0.1.7 real-flow replay must contain 20–30 cases');

const rows = [];
const mismatches = [];
const falsePermitRows = [];
const falseCompactRows = [];
const goldRouteCounts = {};
const classifierRouteCounts = {};

for (const flow of realFlowFixture.flows) {
  const parserRecord = parserEvidenceById.get(flow.parserEvidenceRef);
  assert.ok(parserRecord, `${flow.flowId} parserEvidenceRef must resolve`);
  assert.ok(flow.goldDecision && typeof flow.goldDecision === 'object', `${flow.flowId} must expose goldDecision`);
  assert.ok(!flow.observedDecision || flow.observedDecision.deprecated === true, `${flow.flowId} observedDecision may only remain as deprecated metadata`);

  const rawDecision = classifyRoute({
    parserEvidence: parserRecord.parserEvidence,
    routeDecisionInput: parserRecord.routeDecisionInput,
  });
  const classifierDecision = classifierDecisionFrom(rawDecision);
  const goldDecision = flow.goldDecision;
  const row = {
    flowId: flow.flowId,
    parserEvidenceRef: flow.parserEvidenceRef,
    parserEvidenceRefHash: flow.parserEvidenceRefHash,
    goldDecisionHash: sha256(goldDecision),
    classifierDecisionHash: sha256(classifierDecision),
    goldDecision,
    classifierDecision,
    matchedGold: classifierDecision.selectedRoute === goldDecision.selectedRoute
      && classifierDecision.compactAllowed === goldDecision.compactAllowed
      && classifierDecision.humanRequired === goldDecision.humanRequired,
  };
  rows.push(row);
  goldRouteCounts[goldDecision.selectedRoute] = (goldRouteCounts[goldDecision.selectedRoute] ?? 0) + 1;
  classifierRouteCounts[classifierDecision.selectedRoute] = (classifierRouteCounts[classifierDecision.selectedRoute] ?? 0) + 1;
  if (!row.matchedGold) mismatches.push(row);
  if (goldDecision.selectedRoute !== 'shadow_only' && classifierDecision.selectedRoute === 'shadow_only') falsePermitRows.push(row);
  if (goldDecision.compactAllowed === false && classifierDecision.compactAllowed === true) falseCompactRows.push(row);
}

for (const route of ['block', 'ask_human', 'fetch_source', 'request_full_receipt', 'request_policy_refresh', 'request_grammar_refresh', 'shadow_only', 'abstain']) {
  assert.ok((goldRouteCounts[route] ?? 0) > 0, `scorecard goldDecision coverage must cover ${route}`);
  assert.ok((classifierRouteCounts[route] ?? 0) > 0, `scorecard classifierDecision outputs must cover ${route}`);
}

assert.deepEqual(mismatches, [], 'classifierDecision must match goldDecision for real-flow scorecard');
assert.deepEqual(falsePermitRows, [], 'classifier scorecard falsePermit must be zero');
assert.deepEqual(falseCompactRows, [], 'classifier scorecard falseCompact must be zero');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-08T00:05:00.000Z',
    verdict: 'pass',
    realFlowFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    parserFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/parser-normalization-evidence.json',
    flowCount: realFlowFixture.flows.length,
    matchedGoldCount: rows.length - mismatches.length,
    mismatchCount: mismatches.length,
    goldDecisionRoutesCovered: goldRouteCounts,
    classifierDecisionRoutesCovered: classifierRouteCounts,
    falsePermitRate: falsePermitRows.length / rows.length,
    falseCompactRate: falseCompactRows.length / rows.length,
    parserEvidenceHashBound: true,
    scorecardCompares: 'classifierDecision_vs_goldDecision',
    observedDecisionDeprecated: true,
    scorecardConsumesObservedDecision: false,
    classifierImplemented: true,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    toolAuthorizationImplemented: false,
    safetyClaimScope: 'scorecard_compares_shadow_classifier_decisions_against_offline_gold_decisions_not_runtime_not_live_observer_not_authorization',
  },
  rows,
  mismatches,
  falsePermitRows,
  falseCompactRows,
  boundary: [
    'local_shadow_only',
    'offline_fixture_scorecard_only',
    'classifierDecision_vs_goldDecision',
    'observedDecision_deprecated_metadata_only',
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
