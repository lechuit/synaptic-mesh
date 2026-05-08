import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';
import { assertNoCapabilityBooleans, effectCapabilityFields, expectInvalid, requiredForbiddenPaths, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-real-redacted-adversarial-coverage-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const packPath = resolve(packageRoot, 'fixtures/real-redacted-adversarial-coverage.json');
const bundleSchemaPath = resolve(repoRoot, 'schemas/manual-observation-bundle.schema.json');
const reviewSchemaPath = resolve(repoRoot, 'schemas/redaction-review-record.schema.json');
const parserSchemaPath = resolve(repoRoot, 'schemas/parser-evidence.schema.json');
const traceSchemaPath = resolve(repoRoot, 'schemas/decision-trace.schema.json');
const observationSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/real-redacted-adversarial-coverage.out.json');

const forbiddenSubstrings = [
  '/Users/',
  `Ra${'dar'}`,
  `Jarvis${'Lab'}`,
  `642${'5687132'}`,
  `BEGIN_OPENCLAW_${'INTERNAL_CONTEXT'}`,
  'PRIVATE KEY',
  'BEGIN PRIVATE',
  'approval command',
  'tool output:',
];
const persistenceFlags = [
  'rawContentPersisted',
  'privatePathsPersisted',
  'secretLikeValuesPersisted',
  'toolOutputsPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
];
const requiredRoutes = new Set(['block', 'ask_human', 'request_full_receipt', 'request_policy_refresh']);

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}
function classifierDecisionShape(decision) {
  return {
    selectedRoute: decision.selectedRoute,
    humanRequired: decision.humanRequired,
    compactAllowed: decision.compactAllowed,
    reasonCodes: decision.reasonCodes,
    decisiveSignals: decision.decisiveSignals,
  };
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
function assertNoForbiddenText(value, label) {
  const text = JSON.stringify(value);
  for (const needle of forbiddenSubstrings) assert.equal(text.includes(needle), false, `${label} must not include ${needle}`);
}

const pack = JSON.parse(await readFile(packPath, 'utf8'));
const bundleSchema = JSON.parse(await readFile(bundleSchemaPath, 'utf8'));
const reviewSchema = JSON.parse(await readFile(reviewSchemaPath, 'utf8'));
const parserSchema = JSON.parse(await readFile(parserSchemaPath, 'utf8'));
const traceSchema = JSON.parse(await readFile(traceSchemaPath, 'utf8'));
const observationSchema = JSON.parse(await readFile(observationSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));

assert.equal(pack.schemaVersion, 'real-redacted-adversarial-coverage-v0');
assert.match(pack.description, /real-redacted adversarial coverage pack/);
assert.match(pack.description, /no raw handoff content/);
assert.equal(pack.captureMode, 'manual_offline');
assert.equal(pack.humanReviewed, true);
assert.equal(pack.rawContentPersisted, false);
assert.equal(pack.allowedProcessing, 'local_shadow_only');
assert.equal(pack.cases.length, 6, 'adversarial coverage pack must include exactly six reviewed cases');
assertNoForbiddenText(pack, 'real-redacted adversarial coverage pack');

const validationErrors = [];
const selectedRoutes = new Map();
const scorecardRows = [];
let falsePermitCount = 0;
let falseCompactCount = 0;
let boundaryLossCount = 0;

for (const entry of pack.cases) {
  const { manualObservationBundle: bundle, redactionReviewRecord: review, expected } = entry;
  assert.equal(entry.rawInputPersisted, false);
  assert.equal(entry.realRedactedOrigin, 'manually_redacted_from_real_internal_development_handoff_or_user_authorized_control_message');
  assert.equal(bundle.bundleId, review.bundleId);
  assert.equal(bundle.redactedSnapshotHash, sha256(entry.redactedSummary), `${entry.caseId} hash must bind redacted summary only`);
  assert.equal(expected.parserEvidence.routeDecisionInputHash, sha256(expected.routeDecisionInput), `${entry.caseId} routeDecisionInputHash must match`);
  assert.equal(expected.decisionTrace.parserEvidenceRefHash, sha256({ parserEvidence: expected.parserEvidence, routeDecisionInput: expected.routeDecisionInput }), `${entry.caseId} parserEvidenceRefHash must bind parser evidence and route input`);
  assert.equal(expected.liveShadowObservation.decisionTraceHash, sha256(expected.decisionTrace), `${entry.caseId} observation must bind decision trace`);
  assert.deepEqual(expected.liveShadowObservation.forbiddenPaths, requiredForbiddenPaths, `${entry.caseId} observation forbidden paths must be complete`);
  assertNoForbiddenText(entry.redactedSummary, `${entry.caseId}.redactedSummary`);

  for (const [kind, schema, value] of [
    ['manual_observation_bundle', bundleSchema, bundle],
    ['redaction_review_record', reviewSchema, review],
    ['parser_evidence', parserSchema, expected.parserEvidence],
    ['decision_trace', traceSchema, expected.decisionTrace],
    ['live_shadow_observation', observationSchema, expected.liveShadowObservation],
    ['live_shadow_observation_result', resultSchema, expected.liveShadowObservationResult],
  ]) {
    const errors = validateSchemaValue(schema, value);
    if (errors.length > 0) validationErrors.push({ caseId: entry.caseId, kind, errors });
  }

  assert.equal(bundle.captureMode, 'manual_offline');
  assert.equal(bundle.rawContentIncluded, false);
  assert.equal(bundle.redactedContentIncluded, true);
  assert.equal(bundle.containsSecrets, false);
  assert.equal(bundle.containsToolOutput, false);
  assert.equal(bundle.containsMemoryText, false);
  assert.equal(bundle.containsConfigText, false);
  assert.equal(bundle.containsApprovalText, false);
  assert.equal(bundle.containsPrivatePath, false);
  assert.equal(review.humanReviewed, true);
  assert.equal(review.redactedMetadataOnly, true);
  assert.equal(review.allowedForLocalShadowReplay, true);
  assert.equal(review.forbiddenForLiveObservation, true);
  assert.equal(review.forbiddenForRuntimeUse, true);
  for (const flag of persistenceFlags) assert.equal(review[flag], false, `${entry.caseId}.${flag} must remain false`);

  const actual = classifyRoute({ parserEvidence: expected.parserEvidence, routeDecisionInput: expected.routeDecisionInput });
  const actualClassifierShape = classifierDecisionShape(actual);
  const actualClassifierWithRejected = classifierDecisionFrom(actual);
  const expectedGoldDecision = {
    selectedRoute: expected.classifierDecision.selectedRoute,
    humanRequired: expected.classifierDecision.humanRequired,
    compactAllowed: expected.classifierDecision.compactAllowed,
    reasonCodes: expected.classifierDecision.reasonCodes,
    forbiddenEffects: bundle.forbiddenEffects,
  };
  assert.deepEqual(actualClassifierShape, expected.classifierDecision, `${entry.caseId} classifier decision must match expected route`);
  assert.deepEqual(actualClassifierWithRejected, { ...expected.classifierDecision, rejectedRoutes: expected.decisionTrace.rejectedRoutes }, `${entry.caseId} rejected route reasons must match trace`);
  assert.equal(expected.decisionTrace.goldDecisionHash, sha256(expectedGoldDecision), `${entry.caseId} goldDecisionHash must bind derived gold decision`);
  assert.equal(expected.decisionTrace.classifierDecisionHash, sha256(actual), `${entry.caseId} classifierDecisionHash must bind actual classifier output`);
  assert.equal(expected.decisionTrace.selectedRoute, actual.selectedRoute, `${entry.caseId} trace route must match classifier route`);
  assert.deepEqual(expected.decisionTrace.reasonCodes, actual.reasonCodes, `${entry.caseId} trace reasons must match classifier reasons`);
  assert.deepEqual(expected.decisionTrace.decisiveSignals, actual.decisiveSignals, `${entry.caseId} trace decisive signals must match classifier decisive signals`);
  assert.deepEqual(expected.decisionTrace.rejectedRoutes, actual.rejectedRoutes, `${entry.caseId} trace rejected routes must match classifier rejected routes`);
  assert.equal(expected.decisionTrace.matchedGold, true);
  assert.equal(expected.decisionTrace.boundaryVerdict.falsePermit, false);
  assert.equal(expected.decisionTrace.boundaryVerdict.falseCompact, false);
  assert.equal(expected.decisionTrace.boundaryVerdict.boundaryLoss, false);
  assert.equal(expected.liveShadowObservation.flowId, expected.decisionTrace.flowId, `${entry.caseId} observation flow must bind trace flow`);
  assert.equal(expected.liveShadowObservation.sourceArtifactId, bundle.bundleId, `${entry.caseId} observation source must bind bundle`);
  assert.equal(expected.liveShadowObservation.parserEvidenceRef, expected.decisionTrace.parserEvidenceRef, `${entry.caseId} observation parser ref must bind trace parser ref`);
  assert.equal(expected.liveShadowObservation.routeDecisionInputHash, expected.decisionTrace.routeDecisionInputHash, `${entry.caseId} observation route input hash must bind trace route input hash`);
  assert.equal(expected.liveShadowObservation.classifierDecisionHash, expected.decisionTrace.classifierDecisionHash, `${entry.caseId} observation classifier hash must bind trace classifier hash`);
  assert.equal(expected.liveShadowObservationResult.observationId, expected.liveShadowObservation.observationId, `${entry.caseId} result must bind observation id`);
  assert.equal(expected.liveShadowObservationResult.matchedExpectedPolicy, expected.decisionTrace.matchedGold, `${entry.caseId} result policy match must bind trace policy match`);
  assert.equal(expected.liveShadowObservationResult.observerAction, 'record_only');
  assert.deepEqual(expected.liveShadowObservationResult.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(expected.liveShadowObservationResult);

  const replayRow = {
    bundleId: bundle.bundleId,
    reviewId: review.reviewId,
    selectedRoute: expected.decisionTrace.selectedRoute,
    matchedExpectedPolicy: expected.liveShadowObservationResult.matchedExpectedPolicy,
    observerAction: expected.liveShadowObservationResult.observerAction,
    rawContentPersisted: review.rawContentPersisted,
    privatePathsPersisted: review.privatePathsPersisted,
    secretLikeValuesPersisted: review.secretLikeValuesPersisted,
    toolOutputsPersisted: review.toolOutputsPersisted,
    memoryTextPersisted: review.memoryTextPersisted,
    configTextPersisted: review.configTextPersisted,
    approvalTextPersisted: review.approvalTextPersisted,
    forbiddenEffects: expected.liveShadowObservationResult.forbiddenEffectsDetected.length,
    mayBlock: expected.liveShadowObservationResult.mayBlock ? 1 : 0,
    mayAllow: expected.liveShadowObservationResult.mayAllow ? 1 : 0,
    capabilityAttempts: effectCapabilityFields.filter((field) => expected.liveShadowObservationResult[field] !== false).length,
    mismatch: expected.decisionTrace.matchedGold ? 0 : 1,
  };
  assert.deepEqual(replayRow, expected.scorecardRow, `${entry.caseId} generated scorecard row must match expected fixture row`);
  scorecardRows.push(replayRow);
  selectedRoutes.set(entry.caseId, actual.selectedRoute);
  if (expected.decisionTrace.boundaryVerdict.falsePermit) falsePermitCount += 1;
  if (expected.decisionTrace.boundaryVerdict.falseCompact) falseCompactCount += 1;
  if (expected.decisionTrace.boundaryVerdict.boundaryLoss) boundaryLossCount += 1;
}
assert.deepEqual(validationErrors, [], 'real-redacted adversarial coverage records must validate');
for (const route of requiredRoutes) assert.ok([...selectedRoutes.values()].includes(route), `coverage must include ${route}`);
assert.deepEqual(pack.expectedRouteCoverage, Object.fromEntries(selectedRoutes), 'declared route coverage must match observed decisions');

const validBundle = structuredClone(pack.cases[0].manualObservationBundle);
const validReview = structuredClone(pack.cases[0].redactionReviewRecord);
const validResult = structuredClone(pack.cases[0].expected.liveShadowObservationResult);
const negativeControls = [
  ['bundle raw content included', () => expectInvalid(bundleSchema, validBundle, (record) => { record.rawContentIncluded = true; }, '$.rawContentIncluded: enum mismatch')],
  ['review live observation allowed', () => expectInvalid(reviewSchema, validReview, (record) => { record.forbiddenForLiveObservation = false; }, '$.forbiddenForLiveObservation: enum mismatch')],
  ['review runtime use allowed', () => expectInvalid(reviewSchema, validReview, (record) => { record.forbiddenForRuntimeUse = false; }, '$.forbiddenForRuntimeUse: enum mismatch')],
  ['result may enter approval path', () => expectInvalid(resultSchema, validResult, (record) => { record.mayEnterApprovalPath = true; }, '$.mayEnterApprovalPath: enum mismatch')],
];
for (const [, assertion] of negativeControls) assertion();

const routeCounts = [...selectedRoutes.values()].reduce((counts, route) => ({ ...counts, [route]: (counts[route] ?? 0) + 1 }), {});
const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T04:55:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-redacted-adversarial-coverage.json',
    adversarialRealRedactedCases: pack.cases.length,
    routeCounts,
    requiredRoutesCovered: [...requiredRoutes].sort(),
    scorecardRows: scorecardRows.length,
    validationErrorCount: validationErrors.length,
    negativeControlCount: negativeControls.length,
    falsePermitCount,
    falseCompactCount,
    boundaryLossCount,
    rawContentPersisted: false,
    privatePathsPersisted: false,
    secretLikeValuesPersisted: false,
    toolOutputsPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    forbiddenEffectsDetectedCount: 0,
    mayBlockCount: 0,
    mayAllowCount: 0,
    capabilityTrueCount: 0,
    observerImplemented: false,
    liveObserverImplemented: false,
    liveTrafficRead: false,
    liveLogsRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingOrAllowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'real_redacted_adversarial_fixture_coverage_only_not_live_observer_not_runtime_not_authorization',
  },
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  selectedRoutes: Object.fromEntries(selectedRoutes),
  scorecardRows,
  boundary: pack.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
