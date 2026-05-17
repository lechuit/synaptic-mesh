import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-redaction-review-record-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/redaction-review-record.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/redaction-review-records.json');
const bundleFixturePath = resolve(packageRoot, 'fixtures/manual-observation-bundles.json');
const evidencePath = resolve(packageRoot, 'evidence/redaction-review-record-schema.out.json');

const persistenceFlags = [
  'rawContentPersisted',
  'privatePathsPersisted',
  'secretLikeValuesPersisted',
  'toolOutputsPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
];
const requiredAuditReasonCodes = [
  'REDACTION_REVIEW_HUMAN_REQUIRED',
  'RAW_CONTENT_NOT_PERSISTED',
  'PRIVATE_PATHS_NOT_PERSISTED',
  'SECRET_LIKE_VALUES_NOT_PERSISTED',
  'TOOL_OUTPUTS_NOT_PERSISTED',
  'MEMORY_TEXT_NOT_PERSISTED',
  'CONFIG_TEXT_NOT_PERSISTED',
  'APPROVAL_TEXT_NOT_PERSISTED',
  'REDACTED_METADATA_ONLY',
  'LOCAL_SHADOW_REPLAY_ONLY',
  'FORBID_LIVE_OBSERVATION',
  'FORBID_RUNTIME_USE',
];
const requiredBoundary = [
  'manual_offline_only',
  'human_review_required',
  'redacted_metadata_only',
  'raw_content_not_persisted',
  'private_paths_not_persisted',
  'secret_like_values_not_persisted',
  'tool_outputs_not_persisted',
  'memory_text_not_persisted',
  'config_text_not_persisted',
  'approval_text_not_persisted',
  'local_shadow_replay_only',
  'no_live_observation',
  'no_runtime',
  'no_daemon',
  'no_watcher',
  'no_adapter_integration',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_external_publication',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_enforcement',
];

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const bundleFixture = JSON.parse(await readFile(bundleFixturePath, 'utf8'));
const bundleIds = new Set(bundleFixture.bundles.map((bundle) => bundle.bundleId));

assert.equal(schema.title, 'RedactionReviewRecord evidence record');
assert.match(schema.description, /human redaction review barrier/);
assert.match(schema.description, /does not read raw handoffs/);
assert.match(schema.description, /observe live traffic/);
assert.equal(schema.additionalProperties, false);
assert.equal(fixture.captureMode, 'manual_offline');
assert.equal(fixture.humanReviewed, true);
assert.equal(fixture.rawContentPersisted, false);
assert.equal(fixture.allowedProcessing, 'local_shadow_only');

const validationErrors = [];
for (const record of fixture.records) {
  const errors = validateSchemaValue(schema, record);
  if (errors.length > 0) validationErrors.push({ reviewId: record.reviewId, errors });
  assert.ok(bundleIds.has(record.bundleId), `${record.reviewId} must refer to a known manual observation bundle`);
  assert.equal(record.captureMode, 'manual_offline');
  assert.equal(record.humanReviewed, true);
  assert.equal(record.redactedMetadataOnly, true);
  assert.equal(record.allowedForLocalShadowReplay, true);
  assert.equal(record.forbiddenForLiveObservation, true);
  assert.equal(record.forbiddenForRuntimeUse, true);
  for (const flag of persistenceFlags) assert.equal(record[flag], false, `${record.reviewId}.${flag} must remain false`);
  for (const reasonCode of requiredAuditReasonCodes) assert.ok(record.auditReasonCodes.includes(reasonCode), `${record.reviewId} must include ${reasonCode}`);
  for (const boundaryLabel of requiredBoundary) assert.ok(record.boundary.includes(boundaryLabel), `${record.reviewId} must include ${boundaryLabel}`);
}
assert.deepEqual(validationErrors, [], 'all redaction review records must validate');
assert.equal(new Set(fixture.records.map((record) => record.bundleId)).size, fixture.records.length, 'records must not duplicate bundle reviews');

const valid = fixture.records[0];
const negativeControls = [
  ['automatic capture', (record) => { record.captureMode = 'live_auto'; }, '$.captureMode: enum mismatch'],
  ['human review disabled', (record) => { record.humanReviewed = false; }, '$.humanReviewed: enum mismatch'],
  ['raw content persisted', (record) => { record.rawContentPersisted = true; }, '$.rawContentPersisted: enum mismatch'],
  ['private paths persisted', (record) => { record.privatePathsPersisted = true; }, '$.privatePathsPersisted: enum mismatch'],
  ['secret-like values persisted', (record) => { record.secretLikeValuesPersisted = true; }, '$.secretLikeValuesPersisted: enum mismatch'],
  ['tool outputs persisted', (record) => { record.toolOutputsPersisted = true; }, '$.toolOutputsPersisted: enum mismatch'],
  ['memory text persisted', (record) => { record.memoryTextPersisted = true; }, '$.memoryTextPersisted: enum mismatch'],
  ['config text persisted', (record) => { record.configTextPersisted = true; }, '$.configTextPersisted: enum mismatch'],
  ['approval text persisted', (record) => { record.approvalTextPersisted = true; }, '$.approvalTextPersisted: enum mismatch'],
  ['redacted metadata only disabled', (record) => { record.redactedMetadataOnly = false; }, '$.redactedMetadataOnly: enum mismatch'],
  ['local shadow replay disabled', (record) => { record.allowedForLocalShadowReplay = false; }, '$.allowedForLocalShadowReplay: enum mismatch'],
  ['live observation allowed', (record) => { record.forbiddenForLiveObservation = false; }, '$.forbiddenForLiveObservation: enum mismatch'],
  ['runtime use allowed', (record) => { record.forbiddenForRuntimeUse = false; }, '$.forbiddenForRuntimeUse: enum mismatch'],
  ['missing bundle id', (record) => { delete record.bundleId; }, '$: missing required field bundleId'],
  ['unknown raw content property', (record) => { record.rawContent = 'must not persist'; }, '$: unknown field rawContent'],
  ['unknown live observer property', (record) => { record.liveObserverEnabled = true; }, '$: unknown field liveObserverEnabled'],
  ['invalid boundary label', (record) => { record.boundary = [...record.boundary, 'live_observer_ready']; }, '$.boundary[25]: enum mismatch'],
  ['missing required audit reason code', (record) => { record.auditReasonCodes = record.auditReasonCodes.filter((code) => code !== 'RAW_CONTENT_NOT_PERSISTED'); }, '$.auditReasonCodes: allOf'],
  ['missing required boundary label', (record) => { record.boundary = record.boundary.filter((label) => label !== 'no_runtime'); }, '$.boundary: allOf'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, valid, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T03:20:00.000Z',
    verdict: 'pass',
    schema: 'schemas/redaction-review-record.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/redaction-review-records.json',
    sourceBundles: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-bundles.json',
    reviewRecords: fixture.records.length,
    referencedBundleCount: bundleIds.size,
    validRecordCount: fixture.records.length - validationErrors.length,
    validationErrorCount: validationErrors.length,
    negativeControlCount: negativeControls.length,
    captureMode: 'manual_offline',
    humanReviewed: true,
    rawContentPersisted: false,
    privatePathsPersisted: false,
    secretLikeValuesPersisted: false,
    toolOutputsPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    redactedMetadataOnly: true,
    allowedForLocalShadowReplay: true,
    forbiddenForLiveObservation: true,
    forbiddenForRuntimeUse: true,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    mode: 'manual_offline_redaction_review_record_schema_only',
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
    safetyClaimScope: 'redaction_review_record_schema_only_not_live_observer_not_runtime_not_authorization',
  },
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  requiredAuditReasonCodes,
  requiredBoundary,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
