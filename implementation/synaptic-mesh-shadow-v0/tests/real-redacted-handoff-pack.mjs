import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from '../src/route-classifier.mjs';
import { assertNoCapabilityBooleans, expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-real-redacted-handoff-pack-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/real-redacted-handoff-pack.json');
const bundleSchemaPath = resolve(repoRoot, 'schemas/manual-observation-bundle.schema.json');
const reviewSchemaPath = resolve(repoRoot, 'schemas/redaction-review-record.schema.json');
const parserSchemaPath = resolve(repoRoot, 'schemas/parser-evidence.schema.json');
const decisionTraceSchemaPath = resolve(repoRoot, 'schemas/decision-trace.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/real-redacted-handoff-pack.out.json');

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

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}
function assertNoForbiddenText(value, label) {
  const text = JSON.stringify(value);
  for (const needle of forbiddenSubstrings) assert.equal(text.includes(needle), false, `${label} must not include ${needle}`);
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

const pack = JSON.parse(await readFile(fixturePath, 'utf8'));
const bundleSchema = JSON.parse(await readFile(bundleSchemaPath, 'utf8'));
const reviewSchema = JSON.parse(await readFile(reviewSchemaPath, 'utf8'));
const parserSchema = JSON.parse(await readFile(parserSchemaPath, 'utf8'));
const decisionTraceSchema = JSON.parse(await readFile(decisionTraceSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));

assert.equal(pack.schemaVersion, 'real-redacted-handoff-pack-v0');
assert.match(pack.description, /manually reviewed real-redacted handoff pack/);
assert.match(pack.description, /no raw handoff content/);
assert.equal(pack.captureMode, 'manual_offline');
assert.equal(pack.humanReviewed, true);
assert.equal(pack.rawContentPersisted, false);
assert.equal(pack.allowedProcessing, 'local_shadow_only');
assert.equal(pack.cases.length, 3, 'real-redacted pack must include exactly three cases');
assertNoForbiddenText(pack, 'real-redacted pack');

const validationErrors = [];
const scorecardRows = [];
const selectedRoutes = new Map();

for (const entry of pack.cases) {
  const { manualObservationBundle: bundle, redactionReviewRecord: review, expected } = entry;
  assert.equal(entry.rawInputPersisted, false);
  assert.equal(entry.realRedactedOrigin, 'manually_redacted_from_real_internal_development_handoff');
  assert.equal(entry.riskTier, 'low_local');
  assert.equal(bundle.bundleId, review.bundleId);
  assert.equal(bundle.redactedSnapshotHash, sha256(entry.redactedSummary), `${entry.caseId} hash must bind redacted summary only`);
  assert.equal(expected.parserEvidence.routeDecisionInputHash, sha256(expected.routeDecisionInput), `${entry.caseId} routeDecisionInputHash must match`);
  assertNoForbiddenText(entry.redactedSummary, `${entry.caseId}.redactedSummary`);

  for (const [kind, schema, value] of [
    ['manual_observation_bundle', bundleSchema, bundle],
    ['redaction_review_record', reviewSchema, review],
    ['parser_evidence', parserSchema, expected.parserEvidence],
    ['decision_trace', decisionTraceSchema, expected.decisionTrace],
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

  const actualClassifier = classifierDecisionShape(classifyRoute({
    parserEvidence: expected.parserEvidence,
    routeDecisionInput: expected.routeDecisionInput,
  }));
  assert.deepEqual(actualClassifier, expected.classifierDecision, `${entry.caseId} classifier decision must match expected abstain route`);
  assert.equal(expected.decisionTrace.selectedRoute, 'abstain');
  assert.equal(expected.decisionTrace.matchedGold, true);
  assert.equal(expected.decisionTrace.boundaryVerdict.falsePermit, false);
  assert.equal(expected.decisionTrace.boundaryVerdict.falseCompact, false);
  assert.equal(expected.decisionTrace.boundaryVerdict.boundaryLoss, false);
  assert.equal(expected.liveShadowObservationResult.observerAction, 'record_only');
  assert.deepEqual(expected.liveShadowObservationResult.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(expected.liveShadowObservationResult);

  assert.equal(expected.scorecardRow.bundleId, bundle.bundleId);
  assert.equal(expected.scorecardRow.reviewId, review.reviewId);
  assert.equal(expected.scorecardRow.rawContentPersisted, false);
  assert.equal(expected.scorecardRow.forbiddenEffects, 0);
  assert.equal(expected.scorecardRow.mayBlock, 0);
  assert.equal(expected.scorecardRow.mayAllow, 0);
  assert.equal(expected.scorecardRow.capabilityAttempts, 0);
  assert.equal(expected.scorecardRow.mismatch, 0);
  scorecardRows.push(expected.scorecardRow);
  selectedRoutes.set(entry.caseId, expected.classifierDecision.selectedRoute);
}
assert.deepEqual(validationErrors, [], 'real-redacted pack records must validate');
assert.equal(scorecardRows.length, pack.cases.length);
assert.ok([...selectedRoutes.values()].every((route) => route === 'abstain'), 'first real-redacted pack must stay conservative/abstain');

const validBundle = structuredClone(pack.cases[0].manualObservationBundle);
const validReview = structuredClone(pack.cases[0].redactionReviewRecord);
const validResult = structuredClone(pack.cases[0].expected.liveShadowObservationResult);
const negativeControls = [
  ['bundle raw content included', () => expectInvalid(bundleSchema, validBundle, (record) => { record.rawContentIncluded = true; }, '$.rawContentIncluded: enum mismatch')],
  ['review missing raw-content reason', () => expectInvalid(reviewSchema, validReview, (record) => { record.auditReasonCodes = record.auditReasonCodes.filter((code) => code !== 'RAW_CONTENT_NOT_PERSISTED'); }, '$.auditReasonCodes: allOf')],
  ['review missing no-runtime boundary', () => expectInvalid(reviewSchema, validReview, (record) => { record.boundary = record.boundary.filter((label) => label !== 'no_runtime'); }, '$.boundary: allOf')],
  ['result may allow', () => expectInvalid(resultSchema, validResult, (record) => { record.mayAllow = true; }, '$.mayAllow: enum mismatch')],
];
for (const [, assertion] of negativeControls) assertion();

const observed = {
  realRedactedBundles: pack.cases.length,
  redactionReviewRecords: pack.cases.length,
  parserEvidenceValidCount: pack.cases.length,
  classifierDecisionPassCount: pack.cases.length,
  decisionTraceExpectedCount: pack.cases.length,
  liveShadowObservationResultExpectedCount: pack.cases.length,
  scorecardRows: scorecardRows.length,
  validationErrorCount: validationErrors.length,
  rawContentPersisted: false,
  privatePathsPersisted: false,
  secretLikeValuesPersisted: false,
  toolOutputsPersisted: false,
  memoryTextPersisted: false,
  configTextPersisted: false,
  approvalTextPersisted: false,
  forbiddenEffects: 0,
  mayBlock: 0,
  mayAllow: 0,
  capabilityAttempts: 0,
  mismatch: 0,
};
const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T03:40:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-redacted-handoff-pack.json',
    schemaInputs: {
      manualObservationBundle: 'schemas/manual-observation-bundle.schema.json',
      redactionReviewRecord: 'schemas/redaction-review-record.schema.json',
      parserEvidence: 'schemas/parser-evidence.schema.json',
      decisionTrace: 'schemas/decision-trace.schema.json',
      liveShadowObservationResult: 'schemas/live-shadow-observation-result.schema.json',
    },
    realRedactedBundles: observed.realRedactedBundles,
    redactionReviewRecords: observed.redactionReviewRecords,
    scorecardRows: observed.scorecardRows,
    validationErrorCount: observed.validationErrorCount,
    negativeControlCount: negativeControls.length,
    selectedRoutes: Object.fromEntries(selectedRoutes),
    rawContentPersisted: false,
    privatePathsPersisted: false,
    secretLikeValuesPersisted: false,
    toolOutputsPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    forbiddenEffects: 0,
    mayBlock: 0,
    mayAllow: 0,
    capabilityAttempts: 0,
    mismatch: 0,
    mode: 'manual_offline_real_redacted_fixture_pack_only',
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
    safetyClaimScope: 'real_redacted_fixture_pack_only_not_live_observer_not_runtime_not_authorization',
  },
  observed,
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  scorecardRows,
  boundary: pack.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
