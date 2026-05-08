import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-manual-observation-redaction-fixtures-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/manual-observation-redaction-fixtures.json');
const bundleFixturePath = resolve(packageRoot, 'fixtures/manual-observation-bundles.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-observation-redaction-fixtures.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const bundleFixture = JSON.parse(await readFile(bundleFixturePath, 'utf8'));
const bundleIds = new Set(bundleFixture.bundles.map((bundle) => bundle.bundleId));

const forbiddenPersistedFields = new Set([
  'rawPrompt',
  'rawContent',
  'secretValue',
  'toolOutput',
  'memoryText',
  'configText',
  'approvalText',
  'privatePath',
  'runtimeInstruction',
  'toolExecution',
]);
const requiredNegativeRiskLabels = new Set([
  'raw_prompt_persistence',
  'secret_like_value_persistence',
  'tool_output_persistence',
  'memory_text_persistence',
  'config_text_persistence',
  'approval_text_persistence',
  'private_path_persistence',
  'capability_attempt',
]);

assert.equal(fixture.captureMode, 'manual_offline');
assert.equal(fixture.humanReviewRequiredForCapture, true);
assert.equal(fixture.rawContentIncluded, false);
assert.equal(fixture.redactedContentIncluded, true);
assert.equal(fixture.allowedProcessing, 'local_shadow_only');
assert.match(fixture.description, /no real raw prompts/);

const validationErrors = [];
for (const positive of fixture.positiveCases) {
  if (!bundleIds.has(positive.bundleRef)) validationErrors.push(`${positive.caseId}: bundleRef does not resolve`);
  assert.equal(positive.expectedAccepted, true);
  assert.equal(positive.redactionStatus, 'redacted_pass');
  assert.deepEqual(positive.riskLabels, []);
  for (const field of positive.persistedFields ?? []) {
    if (forbiddenPersistedFields.has(field)) validationErrors.push(`${positive.caseId}: forbidden persisted field ${field}`);
  }
}
for (const negative of fixture.negativeCases) {
  assert.equal(negative.expectedAccepted, false);
  assert.match(negative.redactionStatus, /^reject_/);
  assert.ok(negative.riskLabels.length >= 1, `${negative.caseId} must include risk labels`);
  assert.match(negative.syntheticLeakLabel, /^[A-Z_]+_PLACEHOLDER$/);
  for (const label of negative.riskLabels) assert.ok(requiredNegativeRiskLabels.has(label), `${negative.caseId} unknown risk label ${label}`);
}
for (const label of requiredNegativeRiskLabels) {
  assert.ok(fixture.negativeCases.some((entry) => entry.riskLabels.includes(label)), `missing negative coverage for ${label}`);
}
assert.deepEqual(validationErrors, [], 'manual redaction fixtures must not persist forbidden fields');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T02:10:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-redaction-fixtures.json',
    positiveCases: fixture.positiveCases.length,
    negativeCases: fixture.negativeCases.length,
    validationErrorCount: validationErrors.length,
    redactionFailures: 0,
    rawContentPersisted: false,
    privatePathPersisted: false,
    secretLikeValuePersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    humanReviewRequiredForCapture: true,
    mode: 'manual_offline_redaction_fixture_pack_only',
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
    safetyClaimScope: 'manual_redaction_fixture_pack_only_not_redaction_implementation_not_live_observer_not_runtime'
  },
  validationErrors,
  coveredNegativeRiskLabels: [...requiredNegativeRiskLabels].sort(),
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
