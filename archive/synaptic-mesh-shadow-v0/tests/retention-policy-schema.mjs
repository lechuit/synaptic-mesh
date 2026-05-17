import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-retention-policy-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/retention-policy.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/retention-policy.json');
const evidencePath = resolve(packageRoot, 'evidence/retention-policy-schema.out.json');

const requiredArtifactClasses = [
  'raw_live_input',
  'redacted_observation_record',
  'redacted_result_record',
  'aggregate_scorecard',
  'public_release_evidence',
];
const requiredBoundary = [
  'manual_offline_only',
  'already_redacted_or_placeholder_fixtures_only',
  'retention_metadata_gate_only',
  'raw_live_inputs_zero_day_do_not_persist',
  'redacted_observations_short_local_window',
  'redacted_results_short_local_window',
  'aggregate_scorecards_metadata_only',
  'public_release_evidence_synthetic_non_sensitive_only',
  'unknown_retention_classes_rejected',
  'no_raw_content_persistence',
  'no_retention_scheduler',
  'no_deletion_implementation',
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
const policy = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'RetentionPolicy executable gate contract');
assert.match(schema.description, /retention ceilings/);
assert.match(schema.description, /does not implement deletion/);
assert.equal(schema.additionalProperties, false);
assert.equal(policy.schemaVersion, 'retention-policy-v0');
assert.equal(policy.mode, 'manual_offline_retention_policy_schema_only');
assert.equal(policy.retentionGate, 'validate_metadata_retention_ceiling');
assert.equal(policy.defaultAction, 'reject_unknown_retention_class');
assert.equal(policy.rawLiveInputRetentionDays, 0);
assert.ok(policy.redactedObservationRetentionDays <= 7);
assert.ok(policy.redactedResultRetentionDays <= 7);
assert.ok(policy.aggregateScorecardRetentionDays <= 90);
assert.equal(policy.publicReleaseEvidenceRetention, 'indefinite_if_synthetic_or_non_sensitive');
assert.equal(policy.rawContentPersisted, false);
assert.equal(policy.retentionSchedulerImplemented, false);
assert.equal(policy.deletionImplemented, false);

const validationErrors = validateSchemaValue(schema, policy);
assert.deepEqual(validationErrors, [], 'retention policy fixture must validate');
for (const artifactClass of requiredArtifactClasses) assert.ok(policy.artifactClasses.includes(artifactClass), `policy must cover ${artifactClass}`);
for (const boundaryLabel of requiredBoundary) assert.ok(policy.boundary.includes(boundaryLabel), `policy boundary must include ${boundaryLabel}`);

const negativeControls = [
  ['live mode', (value) => { value.mode = 'live_retention_scheduler'; }, '$.mode: enum mismatch'],
  ['unknown allow default', (value) => { value.defaultAction = 'allow_unknown_retention_class'; }, '$.defaultAction: enum mismatch'],
  ['raw live input retained', (value) => { value.rawLiveInputRetentionDays = 1; }, '$.rawLiveInputRetentionDays: enum mismatch'],
  ['observation retention too long', (value) => { value.redactedObservationRetentionDays = 8; }, '$.redactedObservationRetentionDays: above maximum'],
  ['result retention too long', (value) => { value.redactedResultRetentionDays = 8; }, '$.redactedResultRetentionDays: above maximum'],
  ['scorecard retention too long', (value) => { value.aggregateScorecardRetentionDays = 91; }, '$.aggregateScorecardRetentionDays: above maximum'],
  ['raw content persisted', (value) => { value.rawContentPersisted = true; }, '$.rawContentPersisted: enum mismatch'],
  ['scheduler implemented', (value) => { value.retentionSchedulerImplemented = true; }, '$.retentionSchedulerImplemented: enum mismatch'],
  ['deletion implemented', (value) => { value.deletionImplemented = true; }, '$.deletionImplemented: enum mismatch'],
  ['missing raw artifact class', (value) => { value.artifactClasses = value.artifactClasses.filter((entry) => entry !== 'raw_live_input'); }, '$.artifactClasses: allOf'],
  ['unknown artifact class', (value) => { value.artifactClasses = [...value.artifactClasses, 'private_memory_snapshot']; }, '$.artifactClasses[5]: enum mismatch'],
  ['unknown live capability', (value) => { value.mayDeleteFiles = true; }, '$: unknown field mayDeleteFiles'],
  ['missing redacted placeholder boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'already_redacted_or_placeholder_fixtures_only'); }, '$.boundary: allOf'],
  ['missing no scheduler boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_retention_scheduler'); }, '$.boundary: allOf'],
  ['missing no deletion boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_deletion_implementation'); }, '$.boundary: allOf'],
  ['missing no runtime boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_runtime'); }, '$.boundary: allOf'],
  ['missing no enforcement boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_enforcement'); }, '$.boundary: allOf'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, policy, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-09T01:25:00.000Z',
    verdict: 'pass',
    schema: 'schemas/retention-policy.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/retention-policy.json',
    validationErrorCount: validationErrors.length,
    negativeControlCount: negativeControls.length,
    artifactClasses: requiredArtifactClasses.length,
    retentionGate: 'validate_metadata_retention_ceiling',
    defaultAction: 'reject_unknown_retention_class',
    rawLiveInputRetentionDays: 0,
    redactedObservationRetentionDays: policy.redactedObservationRetentionDays,
    redactedResultRetentionDays: policy.redactedResultRetentionDays,
    aggregateScorecardRetentionDays: policy.aggregateScorecardRetentionDays,
    publicReleaseEvidenceRetention: policy.publicReleaseEvidenceRetention,
    rawContentPersisted: false,
    retentionSchedulerImplemented: false,
    deletionImplemented: false,
    mode: 'manual_offline_retention_policy_schema_only',
    liveObserverImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'retention_policy_schema_only_not_scheduler_not_deletion_not_runtime_not_enforcement',
  },
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  requiredArtifactClasses,
  boundary: policy.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
