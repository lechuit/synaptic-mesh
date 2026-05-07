import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-authority-overhead-benchmark-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-overhead-benchmark-cases.json');
const evidencePath = resolve(packageRoot, 'evidence/authority-overhead-benchmark.out.json');

const modeIds = ['naive_summary', 'full_context', 'simple_receipt', 'authority_envelope'];
const allowedRoutes = new Set([
  'block',
  'ask_human',
  'fetch_source',
  'request_full_receipt',
  'request_policy_refresh',
  'request_grammar_refresh',
  'shadow_only',
  'abstain',
]);
const routeAliases = {
  falseAllowRate: 'falsePermitRate',
};

function stablePayloadString(representation) {
  if (typeof representation.text === 'string') return representation.text;
  if (representation.record && typeof representation.record === 'object') return JSON.stringify(representation.record);
  throw new Error('representation must include text or record');
}

function tokenProxy(payload) {
  const chars = [...payload].length;
  const bytes = Buffer.byteLength(payload, 'utf8');
  return {
    chars,
    bytes,
    approxTokens: Math.ceil(chars / 4),
    proxy: 'ceil(unicode_character_count / 4); byte count recorded separately; no tokenizer dependency',
  };
}

function rate(numerator, denominator) {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(6));
}

function average(values) {
  return values.length === 0 ? 0 : Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function retainedFraction(retained, required) {
  const retainedSet = new Set(retained);
  const retainedCount = required.filter((value) => retainedSet.has(value)).length;
  return { retainedCount, total: required.length, fraction: rate(retainedCount, required.length) };
}

function decisionClass(route) {
  if (route === 'shadow_only') return 'permit_local_shadow';
  if (route === 'block') return 'block';
  if (route === 'ask_human') return 'human_escalation';
  return 'defer_or_abstain';
}

function assertStableFixtureShape(fixture) {
  assert.equal(fixture.artifact, 'T-synaptic-mesh-authority-overhead-benchmark-cases-v0');
  assert.equal(fixture.status, 'deterministic_local_fixture_benchmark_only');
  for (const nonClaim of ['not_runtime_classifier', 'not_live_llm_benchmark', 'not_external_api_benchmark', 'not_enforcement']) {
    assert.ok(fixture.nonClaims.includes(nonClaim), `fixture must declare ${nonClaim}`);
  }
  assert.deepEqual(fixture.modes, modeIds, 'benchmark modes must stay explicit and ordered');
  assert.ok(Array.isArray(fixture.coverageAreas) && fixture.coverageAreas.length >= 6, 'fixture must declare coverage areas');
  assert.ok(Array.isArray(fixture.knownUncoveredRisks) && fixture.knownUncoveredRisks.length > 0, 'fixture must declare known uncovered risks');
  assert.ok(Array.isArray(fixture.cases) && fixture.cases.length >= fixture.coverageAreas.length, 'fixture must include representative cases');
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
assertStableFixtureShape(fixture);

const seenCaseIds = new Set();
const coverageCounts = Object.fromEntries(fixture.coverageAreas.map((coverageArea) => [coverageArea, 0]));
const modeStats = Object.fromEntries(modeIds.map((modeId) => [modeId, {
  mode: modeId,
  cases: 0,
  correctRoutes: 0,
  correctDecisionClasses: 0,
  wrongRoutes: 0,
  falseBlocks: 0,
  falseHumanEscalations: 0,
  falseAllows: 0,
  falseCompacts: 0,
  boundaryLosses: 0,
  tokenCostProxy: { chars: [], bytes: [], approxTokens: [] },
  signalRetention: [],
  boundaryRetention: [],
  clarityScores: [],
  caseRows: [],
}]));

for (const testCase of fixture.cases) {
  assert.match(testCase.caseId, /^BM-AO-\d{3}-[a-z0-9-]+$/, `${testCase.caseId} must have stable id`);
  assert.ok(!seenCaseIds.has(testCase.caseId), `${testCase.caseId} must be unique`);
  seenCaseIds.add(testCase.caseId);
  assert.ok(fixture.coverageAreas.includes(testCase.coverageArea), `${testCase.caseId} coverageArea must be declared`);
  coverageCounts[testCase.coverageArea] += 1;
  assert.ok(allowedRoutes.has(testCase.expectedRoute), `${testCase.caseId} expectedRoute must be known`);
  assert.equal(typeof testCase.expectedHumanRequired, 'boolean', `${testCase.caseId} expectedHumanRequired must be boolean`);
  assert.ok(Array.isArray(testCase.requiredSignals) && testCase.requiredSignals.length > 0, `${testCase.caseId} requiredSignals required`);
  assert.ok(Array.isArray(testCase.requiredBoundaryFields) && testCase.requiredBoundaryFields.length > 0, `${testCase.caseId} requiredBoundaryFields required`);
  assert.ok(testCase.representations && typeof testCase.representations === 'object', `${testCase.caseId} representations required`);

  for (const modeId of modeIds) {
    const representation = testCase.representations[modeId];
    assert.ok(representation, `${testCase.caseId} missing ${modeId}`);
    assert.ok(allowedRoutes.has(representation.observedRoute), `${testCase.caseId}/${modeId} observedRoute must be known`);
    assert.ok(Array.isArray(representation.retainedSignals), `${testCase.caseId}/${modeId} retainedSignals required`);
    assert.ok(Array.isArray(representation.retainedBoundaryFields), `${testCase.caseId}/${modeId} retainedBoundaryFields required`);
    assert.equal(typeof representation.compacted, 'boolean', `${testCase.caseId}/${modeId} compacted must be boolean`);

    const payload = stablePayloadString(representation);
    const cost = tokenProxy(payload);
    const signalRetention = retainedFraction(representation.retainedSignals, testCase.requiredSignals);
    const boundaryRetention = retainedFraction(representation.retainedBoundaryFields, testCase.requiredBoundaryFields);
    const boundaryLost = boundaryRetention.retainedCount < boundaryRetention.total;
    const routeCorrect = representation.observedRoute === testCase.expectedRoute;
    const decisionClassCorrect = decisionClass(representation.observedRoute) === decisionClass(testCase.expectedRoute);
    const expectedAllows = testCase.expectedRoute === 'shadow_only';
    const observedAllows = representation.observedRoute === 'shadow_only';

    // Heuristic clarity score is intentionally mechanical: 45% signal retention,
    // 45% boundary-field retention, 10% structured-record bonus.
    const structuredBonus = representation.record ? 0.1 : 0;
    const clarityScore = Number(Math.min(1, (signalRetention.fraction * 0.45) + (boundaryRetention.fraction * 0.45) + structuredBonus).toFixed(3));

    const stats = modeStats[modeId];
    stats.cases += 1;
    stats.correctRoutes += routeCorrect ? 1 : 0;
    stats.correctDecisionClasses += decisionClassCorrect ? 1 : 0;
    stats.wrongRoutes += routeCorrect ? 0 : 1;
    stats.falseBlocks += representation.observedRoute === 'block' && testCase.expectedRoute !== 'block' ? 1 : 0;
    stats.falseHumanEscalations += representation.observedRoute === 'ask_human' && !testCase.expectedHumanRequired ? 1 : 0;
    stats.falseAllows += observedAllows && !expectedAllows ? 1 : 0;
    stats.falseCompacts += representation.compacted && !routeCorrect ? 1 : 0;
    stats.boundaryLosses += boundaryLost ? 1 : 0;
    stats.tokenCostProxy.chars.push(cost.chars);
    stats.tokenCostProxy.bytes.push(cost.bytes);
    stats.tokenCostProxy.approxTokens.push(cost.approxTokens);
    stats.signalRetention.push(signalRetention.fraction);
    stats.boundaryRetention.push(boundaryRetention.fraction);
    stats.clarityScores.push(clarityScore);
    stats.caseRows.push({
      caseId: testCase.caseId,
      coverageArea: testCase.coverageArea,
      expectedRoute: testCase.expectedRoute,
      observedRoute: representation.observedRoute,
      routeCorrect,
      decisionClassCorrect,
      boundaryLost,
      signalRetention: signalRetention.fraction,
      boundaryRetention: boundaryRetention.fraction,
      approxTokens: cost.approxTokens,
      chars: cost.chars,
      bytes: cost.bytes,
      clarityScore,
    });
  }
}

for (const [coverageArea, count] of Object.entries(coverageCounts)) assert.ok(count > 0, `must cover ${coverageArea}`);

const modeSummaries = Object.fromEntries(Object.entries(modeStats).map(([modeId, stats]) => {
  const total = stats.cases;
  return [modeId, {
    mode: modeId,
    cases: total,
    receiverDecisionAccuracy: rate(stats.correctRoutes, total),
    decisionClassAccuracy: rate(stats.correctDecisionClasses, total),
    wrongRouteRate: rate(stats.wrongRoutes, total),
    falseBlockRate: rate(stats.falseBlocks, total),
    falseHumanEscalationRate: rate(stats.falseHumanEscalations, total),
    falseAllowRate: rate(stats.falseAllows, total),
    falsePermitRate: rate(stats.falseAllows, total),
    falseCompactRate: rate(stats.falseCompacts, total),
    boundaryLossRate: rate(stats.boundaryLosses, total),
    averageSignalRetention: average(stats.signalRetention),
    averageBoundaryRetention: average(stats.boundaryRetention),
    clarityScore: average(stats.clarityScores),
    tokenCostProxy: {
      averageChars: average(stats.tokenCostProxy.chars),
      averageBytes: average(stats.tokenCostProxy.bytes),
      averageApproxTokens: average(stats.tokenCostProxy.approxTokens),
      maxApproxTokens: Math.max(...stats.tokenCostProxy.approxTokens),
      proxy: 'ceil(unicode_character_count / 4); byte count recorded separately; no tokenizer dependency',
    },
    latencyMs: null,
    latencyPolicy: 'omitted_from_scored_metrics_to_avoid_flaky_local_timing_thresholds; script processing is dependency-free and deterministic apart from filesystem IO',
    caseRows: stats.caseRows,
  }];
}));

assert.equal(modeSummaries.authority_envelope.receiverDecisionAccuracy, 1, 'AuthorityEnvelope fixture benchmark should preserve all oracle routes');
assert.ok(modeSummaries.authority_envelope.boundaryLossRate <= modeSummaries.simple_receipt.boundaryLossRate, 'AuthorityEnvelope should not lose more boundary fields than simple receipt in fixtures');
assert.ok(modeSummaries.simple_receipt.tokenCostProxy.averageApproxTokens <= modeSummaries.full_context.tokenCostProxy.averageApproxTokens, 'simple receipt should remain below full context token proxy in fixtures');
assert.ok(modeSummaries.naive_summary.tokenCostProxy.averageApproxTokens <= modeSummaries.authority_envelope.tokenCostProxy.averageApproxTokens, 'naive summary should have lower token proxy than AuthorityEnvelope in fixtures');
assert.equal(routeAliases.falseAllowRate, 'falsePermitRate');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-07T20:45:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/authority-overhead-benchmark-cases.json',
    benchmarkKind: 'deterministic_fixture_proxy_benchmark',
    modes: modeIds,
    caseCount: fixture.cases.length,
    coverageAreaCount: fixture.coverageAreas.length,
    bestRouteAccuracyMode: Object.values(modeSummaries).sort((left, right) => right.receiverDecisionAccuracy - left.receiverDecisionAccuracy || left.tokenCostProxy.averageApproxTokens - right.tokenCostProxy.averageApproxTokens)[0].mode,
    lowestTokenProxyMode: Object.values(modeSummaries).sort((left, right) => left.tokenCostProxy.averageApproxTokens - right.tokenCostProxy.averageApproxTokens)[0].mode,
    runtimeSemanticsImplemented: false,
    runtimeEnforcementImplemented: false,
    externalApiCalls: false,
    liveLlmCalls: false,
    safetyClaimScope: 'local_shadow_fixture_proxy_benchmark_only_not_runtime_classifier_not_authorization_not_enforcement',
  },
  metricDefinitions: {
    tokenCostProxy: 'Character/byte proxy only: approxTokens = ceil(unicode character count / 4). No tokenizer dependency and no model-specific token claim.',
    latencyMs: 'Not scored and recorded as null because local micro-timing would be noisy/flaky; this benchmark focuses on deterministic fixture processing.',
    wrongRouteRate: 'Observed route differs from oracle expectedRoute for the fixed fixture.',
    falseCompactRate: 'Representation is marked compacted and observed route differs from oracle expectedRoute.',
    falseHumanEscalationRate: 'Observed route is ask_human when the oracle does not require a human.',
    falseAllowRate: 'Observed route permits local shadow handling when oracle expected route is not shadow_only.',
    falsePermitRate: 'Alias of falseAllowRate for reviewer terminology.',
    boundaryLossRate: 'Required boundary fields missing from the representation.',
    receiverDecisionAccuracy: 'Exact selectedRoute match against fixed oracle route.',
    decisionClassAccuracy: 'Coarser permit/block/human/defer class match against fixed oracle route.',
    clarityScore: 'Mechanical heuristic: 45% signal retention + 45% boundary retention + 10% structured-record bonus; not subjective quality.',
  },
  coverageAreas: fixture.coverageAreas,
  coverageCounts,
  modes: modeSummaries,
  knownUncoveredRisks: fixture.knownUncoveredRisks,
  boundary: [
    'local_shadow_only',
    'fixture_proxy_benchmark_only',
    'not_runtime_integration',
    'not_external_api_benchmark',
    'not_live_llm_benchmark',
    'not_authorization',
    'not_enforcement',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
