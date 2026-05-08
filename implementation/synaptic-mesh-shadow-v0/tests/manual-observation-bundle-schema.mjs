import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-observation-bundle-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/manual-observation-bundle.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/manual-observation-bundles.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-observation-bundle-schema.out.json');

const requiredForbiddenEffects = ['runtime', 'tools', 'memory_write', 'config_write', 'external_publication', 'approval_path', 'blocking', 'allowing'];
const sensitiveFlags = ['containsSecrets', 'containsToolOutput', 'containsMemoryText', 'containsConfigText', 'containsApprovalText', 'containsPrivatePath'];

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'ManualObservationBundle evidence record');
assert.match(schema.description, /manually captured, manually redacted/);
assert.match(schema.description, /does not capture live traffic/);
assert.equal(schema.additionalProperties, false);

const validationErrors = [];
for (const bundle of fixture.bundles) {
  const errors = validateSchemaValue(schema, bundle);
  if (errors.length > 0) validationErrors.push({ bundleId: bundle.bundleId, errors });
  assert.equal(bundle.captureMode, 'manual_offline');
  assert.equal(bundle.humanReviewRequiredForCapture, true);
  assert.equal(bundle.rawContentIncluded, false);
  assert.equal(bundle.redactedContentIncluded, true);
  assert.equal(bundle.allowedProcessing, 'local_shadow_only');
  for (const flag of sensitiveFlags) assert.equal(bundle[flag], false, `${bundle.bundleId}.${flag} must be false`);
  for (const effect of requiredForbiddenEffects) assert.ok(bundle.forbiddenEffects.includes(effect), `${bundle.bundleId} must forbid ${effect}`);
}
assert.deepEqual(validationErrors, [], 'all manual observation bundles must validate');

const valid = fixture.bundles[0];
const negativeControls = [
  ['automatic capture', (record) => { record.captureMode = 'live_auto'; }, '$.captureMode: enum mismatch'],
  ['human review disabled', (record) => { record.humanReviewRequiredForCapture = false; }, '$.humanReviewRequiredForCapture: enum mismatch'],
  ['raw content persisted', (record) => { record.rawContentIncluded = true; }, '$.rawContentIncluded: enum mismatch'],
  ['redacted content missing', (record) => { record.redactedContentIncluded = false; }, '$.redactedContentIncluded: enum mismatch'],
  ['secret flag true', (record) => { record.containsSecrets = true; }, '$.containsSecrets: enum mismatch'],
  ['tool output flag true', (record) => { record.containsToolOutput = true; }, '$.containsToolOutput: enum mismatch'],
  ['memory text flag true', (record) => { record.containsMemoryText = true; }, '$.containsMemoryText: enum mismatch'],
  ['config text flag true', (record) => { record.containsConfigText = true; }, '$.containsConfigText: enum mismatch'],
  ['approval text flag true', (record) => { record.containsApprovalText = true; }, '$.containsApprovalText: enum mismatch'],
  ['private path flag true', (record) => { record.containsPrivatePath = true; }, '$.containsPrivatePath: enum mismatch'],
  ['processing escalates runtime', (record) => { record.allowedProcessing = 'runtime'; }, '$.allowedProcessing: enum mismatch'],
  ['missing snapshot hash', (record) => { delete record.redactedSnapshotHash; }, '$: missing required field redactedSnapshotHash'],
  ['unknown property rawContent', (record) => { record.rawContent = 'do not persist'; }, '$: unknown field rawContent'],
  ['forbidden effect tool_execution', (record) => { record.forbiddenEffects = [...record.forbiddenEffects, 'tool_execution']; }, '$.forbiddenEffects[8]: enum mismatch'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, valid, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T02:00:00.000Z',
    verdict: 'pass',
    schema: 'schemas/manual-observation-bundle.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-bundles.json',
    manualBundles: fixture.bundles.length,
    validBundleCount: fixture.bundles.length - validationErrors.length,
    validationErrorCount: validationErrors.length,
    negativeControlCount: negativeControls.length,
    captureMode: 'manual_offline',
    humanReviewRequiredForCapture: true,
    rawContentPersisted: false,
    redactedContentIncluded: true,
    secretLikeValuePersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    privatePathPersisted: false,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    mode: 'manual_offline_bundle_schema_only',
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
    blockingOrAllowingImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_observation_bundle_schema_shape_only_not_live_observer_not_runtime_not_authorization'
  },
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  requiredForbiddenEffects,
  boundary: ['manual_offline_only', 'human_review_required_for_capture', 'redacted_snapshot_only', 'raw_content_not_persisted', 'local_shadow_only', 'no_runtime', 'no_tools', 'no_memory_write', 'no_config_write', 'no_publication', 'no_approval', 'no_blocking', 'no_allowing', 'no_enforcement']
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
