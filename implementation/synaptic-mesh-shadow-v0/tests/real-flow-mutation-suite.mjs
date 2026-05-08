import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';

const artifact = 'T-synaptic-mesh-real-flow-mutation-suite-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const realFlowFixturePath = resolve(packageRoot, 'fixtures/real-flow-replay.json');
const parserFixturePath = resolve(packageRoot, 'fixtures/parser-normalization-evidence.json');
const evidencePath = resolve(packageRoot, 'evidence/real-flow-mutation-suite.out.json');

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

const sourceFlows = realFlowFixture.flows.filter((flow) => flow.goldDecision.selectedRoute === 'shadow_only');
assert.ok(sourceFlows.length >= 1, 'mutation suite needs at least one clean shadow_only source flow whose mutations can visibly degrade');

function mutate(record, mutation, variant = 'base') {
  const parserEvidence = clone(record.parserEvidence);
  const routeDecisionInput = clone(record.routeDecisionInput);
  const summary = routeDecisionInput.candidateSummary ?? {};
  routeDecisionInput.candidateSummary = summary;

  if (mutation === 'inject_config_change_free_text') {
    const attempt = variant === 'summary_signal' ? 'SUMMARY_CONFIG_CHANGE' : variant === 'receipt_signal' ? 'RECEIPT_CONFIG_CHANGE' : 'UPDATE_CONFIG';
    parserEvidence.freeTextAuthorityAttempts = [...new Set([...(parserEvidence.freeTextAuthorityAttempts ?? []), attempt])];
    parserEvidence.sensitiveSignals = [...new Set([...(parserEvidence.sensitiveSignals ?? []), 'CONFIG_CHANGE_PROMOTION'])];
    parserEvidence.normalizationWarnings = [...new Set([...(parserEvidence.normalizationWarnings ?? []), 'CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT', 'FREE_TEXT_NOT_AUTHORITY'])];
    summary.sensitiveSignals = [...new Set([...(summary.sensitiveSignals ?? []), 'CONFIG_CHANGE_PROMOTION'])];
    routeDecisionInput.normalizedAuthorityLevel = 'config_change';
    routeDecisionInput.normalizedActionEffect = 'config_change';
    routeDecisionInput.recommendedRoute = 'ask_human';
  } else if (mutation === 'stale_policy_window') {
    const policyWarning = variant === 'missing_clock' ? 'POLICY_CLOCK_MISSING' : 'POLICY_CHECKSUM_STALE';
    parserEvidence.normalizationWarnings = [...new Set([...(parserEvidence.normalizationWarnings ?? []), policyWarning, 'POLICY_REFRESH_REQUIRED'])];
    summary.policyFreshness = variant;
    routeDecisionInput.recommendedRoute = 'request_policy_refresh';
  } else if (mutation === 'missing_receipt_boundary') {
    parserEvidence.invalidReceipts = Math.max(1, Number(parserEvidence.invalidReceipts ?? 0));
    const boundaryWarning = variant === 'missing_policy_checksum' ? 'MISSING_POLICY_CHECKSUM' : 'INVALID_RECEIPT_SCHEMA';
    parserEvidence.normalizationWarnings = [...new Set([...(parserEvidence.normalizationWarnings ?? []), boundaryWarning, 'BOUNDARY_COVERAGE_MISSING'])];
    summary.invalidReceipts = Math.max(1, Number(summary.invalidReceipts ?? 0));
    routeDecisionInput.recommendedRoute = 'request_full_receipt';
  } else if (mutation === 'unknown_grammar_digest') {
    const grammarWarning = variant === 'rollback' ? 'GRAMMAR_VERSION_ROLLBACK' : 'GRAMMAR_DIGEST_UNKNOWN';
    parserEvidence.normalizationWarnings = [...new Set([...(parserEvidence.normalizationWarnings ?? []), grammarWarning, 'GRAMMAR_REFRESH_REQUIRED'])];
    summary.grammarDigest = variant;
    routeDecisionInput.recommendedRoute = 'request_grammar_refresh';
  } else if (mutation === 'source_digest_mismatch') {
    const sourceWarning = variant === 'stale_window' ? 'STALE_POLICY_WINDOW' : 'SOURCE_DIGEST_MISMATCH';
    parserEvidence.normalizationWarnings = [...new Set([...(parserEvidence.normalizationWarnings ?? []), sourceWarning, 'SOURCE_REFRESH_REQUIRED'])];
    summary.sourceDigest = variant;
    routeDecisionInput.recommendedRoute = 'fetch_source';
  } else {
    throw new Error(`unknown mutation ${mutation}`);
  }

  parserEvidence.routeDecisionInputHash = sha256(routeDecisionInput);
  return { parserEvidence, routeDecisionInput };
}

const mutationPlans = [
  { mutation: 'inject_config_change_free_text', variants: ['free_text', 'summary_signal', 'receipt_signal'], expectedRoute: 'ask_human', requiredReasonCodes: ['FREE_TEXT_NOT_AUTHORITY', 'CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT'] },
  { mutation: 'stale_policy_window', variants: ['checksum_stale', 'missing_clock', 'checksum_replay'], expectedRoute: 'request_policy_refresh', requiredReasonCodes: ['POLICY_REFRESH_REQUIRED'] },
  { mutation: 'missing_receipt_boundary', variants: ['invalid_schema', 'missing_policy_checksum', 'boundary_missing'], expectedRoute: 'request_full_receipt', requiredReasonCodes: ['BOUNDARY_COVERAGE_MISSING'] },
  { mutation: 'unknown_grammar_digest', variants: ['unknown_digest', 'rollback', 'unrecognized_digest'], expectedRoute: 'request_grammar_refresh', requiredReasonCodes: ['GRAMMAR_REFRESH_REQUIRED'] },
  { mutation: 'source_digest_mismatch', variants: ['digest_mismatch', 'stale_window', 'source_changed'], expectedRoute: 'fetch_source', requiredReasonCodes: ['SOURCE_REFRESH_REQUIRED'] },
];

const rows = [];
let sourceIndex = 0;
for (const plan of mutationPlans) {
  for (const variant of plan.variants) {
    const flow = sourceFlows[sourceIndex % sourceFlows.length];
    sourceIndex += 1;
    const parserRecord = parserEvidenceById.get(flow.parserEvidenceRef);
    assert.ok(parserRecord, `${flow.flowId} parserEvidenceRef must resolve`);
    const mutated = mutate(parserRecord, plan.mutation, variant);
    const classifierDecision = classifierDecisionFrom(classifyRoute(mutated));
    const matchedExpectedRoute = classifierDecision.selectedRoute === plan.expectedRoute;
    const hasRequiredReasons = plan.requiredReasonCodes.every((code) => classifierDecision.reasonCodes.includes(code));
    const degradedFromSource = classifierDecision.selectedRoute !== flow.goldDecision.selectedRoute || classifierDecision.compactAllowed !== flow.goldDecision.compactAllowed || classifierDecision.humanRequired !== flow.goldDecision.humanRequired;
    rows.push({
      mutationId: `${flow.flowId}__${plan.mutation}__${variant}`,
      variant,
      sourceFlowId: flow.flowId,
      sourceGoldRoute: flow.goldDecision.selectedRoute,
      mutation: plan.mutation,
      expectedRoute: plan.expectedRoute,
      requiredReasonCodes: plan.requiredReasonCodes,
      classifierDecision,
      matchedExpectedRoute,
      hasRequiredReasons,
      degradedFromSource,
      parserEvidenceHash: sha256(mutated.parserEvidence),
      routeDecisionInputHash: sha256(mutated.routeDecisionInput),
    });
  }
}

const mismatches = rows.filter((row) => !row.matchedExpectedRoute || !row.hasRequiredReasons);
const nonDegradedRows = rows.filter((row) => !row.degradedFromSource);
const falsePermitRows = rows.filter((row) => row.expectedRoute !== 'shadow_only' && row.classifierDecision.selectedRoute === 'shadow_only');
const falseCompactRows = rows.filter((row) => row.classifierDecision.compactAllowed === true && row.expectedRoute !== 'shadow_only');
const mutationCounts = Object.fromEntries(mutationPlans.map((plan) => [plan.mutation, rows.filter((row) => row.mutation === plan.mutation).length]));
const duplicateMutationIds = rows.map((row) => row.mutationId).filter((id, index, ids) => ids.indexOf(id) !== index);

assert.ok(rows.length >= 15, 'mutation suite must cover at least 15 mutations');
assert.deepEqual(duplicateMutationIds, [], 'mutationId values must be unique');
for (const [mutation, count] of Object.entries(mutationCounts)) assert.ok(count >= 3, `${mutation} must have at least 3 distinct mutation variants`);
assert.deepEqual(mismatches, [], 'all mutations must route to expected degradation route with required reason codes');
assert.deepEqual(nonDegradedRows, [], 'all mutations must degrade from source decision');
assert.deepEqual(falsePermitRows, [], 'mutation suite falsePermit must be zero');
assert.deepEqual(falseCompactRows, [], 'mutation suite falseCompact must be zero');

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : '2026-05-08T00:25:00.000Z',
    verdict: 'pass',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-flow-replay.json',
    mutationCount: rows.length,
    sourceFlowCount: new Set(rows.map((row) => row.sourceFlowId)).size,
    mutationCounts,
    mismatchCount: mismatches.length,
    duplicateMutationIdCount: duplicateMutationIds.length,
    nonDegradedCount: nonDegradedRows.length,
    falsePermitRate: falsePermitRows.length / rows.length,
    falseCompactRate: falseCompactRows.length / rows.length,
    allMutationsDegrade: nonDegradedRows.length === 0,
    classifierImplemented: true,
    runtimeEnforcementImplemented: false,
    liveShadowObserverImplemented: false,
    toolAuthorizationImplemented: false,
    memoryWriteImplemented: false,
    configChangeImplemented: false,
    externalPublicationImplemented: false,
    safetyClaimScope: 'offline_real_flow_mutation_suite_only_not_live_observer_not_runtime_not_authorization',
  },
  rows,
  mismatches,
  duplicateMutationIds,
  nonDegradedRows,
  falsePermitRows,
  falseCompactRows,
  knownUncoveredRisks: [
    'mutations_are_synthetic_derivatives_of_offline_real_flow_fixtures_not_live_traffic',
    'classifier_consumes_mutated_normalized_parser_evidence_not_raw_arbitrary_input',
    'mutation_suite_tests_degradation_routes_not_runtime_blocking_or_authorization',
  ],
  boundary: [
    'local_shadow_only',
    'offline_mutation_suite_only',
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
