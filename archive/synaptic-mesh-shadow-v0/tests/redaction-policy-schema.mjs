import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-redaction-policy-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/redaction-policy.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/redaction-policy.json');
const evidencePath = resolve(packageRoot, 'evidence/redaction-policy-schema.out.json');

const requiredSensitiveFieldClasses = [
  'raw_content',
  'secret_like_value',
  'private_path',
  'tool_output',
  'memory_text',
  'config_text',
  'approval_text',
  'long_raw_prompt',
  'unknown_sensitive_field',
];
const requiredOutputFlags = [
  'rawPersisted',
  'secretLikePersisted',
  'privatePathPersisted',
  'toolOutputPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
];
const noPersistenceFlags = [
  'rawContentPersisted',
  'secretLikePersisted',
  'privatePathPersisted',
  'toolOutputPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
  'longRawPromptPersisted',
  'unknownSensitiveFieldPersisted',
];
const requiredBoundary = [
  'manual_offline_only',
  'already_redacted_or_placeholder_fixtures_only',
  'reject_only_redaction_gate',
  'raw_content_not_persisted',
  'secret_like_values_not_persisted',
  'private_paths_not_persisted',
  'tool_outputs_not_persisted',
  'memory_text_not_persisted',
  'config_text_not_persisted',
  'approval_text_not_persisted',
  'long_raw_prompt_not_persisted',
  'unknown_sensitive_fields_rejected',
  'no_live_observation',
  'no_runtime',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_external_publication',
  'no_authorization',
  'no_enforcement',
];

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const policy = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'RedactionPolicy executable gate contract');
assert.match(schema.description, /reject-only sensitive-field classes/);
assert.match(schema.description, /does not read live traffic/);
assert.equal(schema.additionalProperties, false);
assert.equal(policy.schemaVersion, 'redaction-policy-v0');
assert.equal(policy.mode, 'manual_offline_executable_gate_only');
assert.equal(policy.redactionGate, 'reject_sensitive_persistence');
assert.equal(policy.defaultAction, 'reject_unknown_sensitive_field');

const validationErrors = validateSchemaValue(schema, policy);
assert.deepEqual(validationErrors, [], 'redaction policy fixture must validate');
for (const fieldClass of requiredSensitiveFieldClasses) assert.ok(policy.sensitiveFieldClasses.includes(fieldClass), `policy must cover ${fieldClass}`);
for (const flag of requiredOutputFlags) assert.ok(policy.requiredOutputFlags.includes(flag), `policy must require output flag ${flag}`);
for (const flag of noPersistenceFlags) assert.equal(policy[flag], false, `${flag} must remain false`);
for (const boundaryLabel of requiredBoundary) assert.ok(policy.boundary.includes(boundaryLabel), `policy boundary must include ${boundaryLabel}`);

const negativeControls = [
  ['live mode', (value) => { value.mode = 'live_observer'; }, '$.mode: enum mismatch'],
  ['permit default action', (value) => { value.defaultAction = 'allow_unknown_sensitive_field'; }, '$.defaultAction: enum mismatch'],
  ['raw content persisted', (value) => { value.rawContentPersisted = true; }, '$.rawContentPersisted: enum mismatch'],
  ['secret-like persisted', (value) => { value.secretLikePersisted = true; }, '$.secretLikePersisted: enum mismatch'],
  ['private path persisted', (value) => { value.privatePathPersisted = true; }, '$.privatePathPersisted: enum mismatch'],
  ['tool output persisted', (value) => { value.toolOutputPersisted = true; }, '$.toolOutputPersisted: enum mismatch'],
  ['memory text persisted', (value) => { value.memoryTextPersisted = true; }, '$.memoryTextPersisted: enum mismatch'],
  ['config text persisted', (value) => { value.configTextPersisted = true; }, '$.configTextPersisted: enum mismatch'],
  ['approval text persisted', (value) => { value.approvalTextPersisted = true; }, '$.approvalTextPersisted: enum mismatch'],
  ['long raw prompt persisted', (value) => { value.longRawPromptPersisted = true; }, '$.longRawPromptPersisted: enum mismatch'],
  ['unknown sensitive persisted', (value) => { value.unknownSensitiveFieldPersisted = true; }, '$.unknownSensitiveFieldPersisted: enum mismatch'],
  ['missing long raw prompt class', (value) => { value.sensitiveFieldClasses = value.sensitiveFieldClasses.filter((entry) => entry !== 'long_raw_prompt'); }, '$.sensitiveFieldClasses: allOf'],
  ['missing approval output flag', (value) => { value.requiredOutputFlags = value.requiredOutputFlags.filter((entry) => entry !== 'approvalTextPersisted'); }, '$.requiredOutputFlags: allOf'],
  ['unknown live capability', (value) => { value.mayBlock = true; }, '$: unknown field mayBlock'],
  ['invalid boundary', (value) => { value.boundary = [...value.boundary, 'runtime_ready']; }, '$.boundary[26]: enum mismatch'],
  ['missing no daemon boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_daemon'); }, '$.boundary: allOf'],
  ['missing no watcher boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_watcher'); }, '$.boundary: allOf'],
  ['missing no adapter boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_adapter_integration'); }, '$.boundary: allOf'],
  ['missing no approval path boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_approval_path'); }, '$.boundary: allOf'],
  ['missing no blocking boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_blocking'); }, '$.boundary: allOf'],
  ['missing no allowing boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_allowing'); }, '$.boundary: allOf'],
  ['missing no enforcement boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_enforcement'); }, '$.boundary: allOf'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, policy, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-09T00:45:00.000Z',
    verdict: 'pass',
    schema: 'schemas/redaction-policy.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/redaction-policy.json',
    validationErrorCount: validationErrors.length,
    negativeControlCount: negativeControls.length,
    sensitiveFieldClasses: requiredSensitiveFieldClasses.length,
    requiredOutputFlags: requiredOutputFlags.length,
    redactionGate: 'reject_sensitive_persistence',
    defaultAction: 'reject_unknown_sensitive_field',
    rawContentPersisted: false,
    secretLikePersisted: false,
    privatePathPersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    longRawPromptPersisted: false,
    unknownSensitiveFieldPersisted: false,
    mode: 'manual_offline_executable_gate_only',
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
    safetyClaimScope: 'redaction_policy_schema_only_not_runtime_not_authorization_not_enforcement',
  },
  validationErrors,
  negativeControls: negativeControls.map(([label]) => label),
  requiredSensitiveFieldClasses,
  requiredOutputFlags,
  boundary: policy.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
