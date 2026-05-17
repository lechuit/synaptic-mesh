import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoCapabilityBooleans, effectCapabilityFields, expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-live-shadow-observation-result-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/live-shadow-observation-results.json');
const evidencePath = resolve(packageRoot, 'evidence/live-shadow-observation-result-schema.out.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'LiveShadowObservationResult evidence record');
assert.match(schema.description, /record-only audit evidence/);
assert.match(schema.description, /cannot authorize/);
assert.match(schema.description, /enter approval paths/);
assert.equal(schema.additionalProperties, false);

for (const required of ['schemaVersion', 'observationId', 'resultId', 'observerAction', 'matchedExpectedPolicy', 'warnings', 'safetySignals', 'driftSignals', 'forbiddenEffectsDetected', 'auditReasonCodes', ...effectCapabilityFields]) {
  assert.ok(schema.required.includes(required), `schema must require ${required}`);
}

const validationErrors = [];
for (const result of fixture.results) {
  const errors = validateSchemaValue(schema, result);
  if (errors.length > 0) validationErrors.push({ resultId: result.resultId, errors });
  assert.equal(result.observerAction, 'record_only');
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  assertNoCapabilityBooleans(result);
}
assert.deepEqual(validationErrors, [], 'all live-shadow observation results must validate');
assert.ok(fixture.results.some((result) => result.warnings.length > 0), 'positive fixtures should include a result with warnings');
assert.ok(fixture.results.some((result) => result.driftSignals.includes('classifier_decision_changed_from_previous_trace')), 'positive fixtures should include drift signal with no effects');

const valid = fixture.results[0];
const negativeControls = [
  ['observerAction block', (record) => { record.observerAction = 'block'; }, '$.observerAction: enum mismatch'],
  ['mayBlock true', (record) => { record.mayBlock = true; }, '$.mayBlock: enum mismatch'],
  ['mayAllow true', (record) => { record.mayAllow = true; }, '$.mayAllow: enum mismatch'],
  ['mayExecuteTool true', (record) => { record.mayExecuteTool = true; }, '$.mayExecuteTool: enum mismatch'],
  ['mayWriteMemory true', (record) => { record.mayWriteMemory = true; }, '$.mayWriteMemory: enum mismatch'],
  ['mayWriteConfig true', (record) => { record.mayWriteConfig = true; }, '$.mayWriteConfig: enum mismatch'],
  ['mayPublishExternally true', (record) => { record.mayPublishExternally = true; }, '$.mayPublishExternally: enum mismatch'],
  ['mayModifyAgentInstructions true', (record) => { record.mayModifyAgentInstructions = true; }, '$.mayModifyAgentInstructions: enum mismatch'],
  ['mayEnterApprovalPath true', (record) => { record.mayEnterApprovalPath = true; }, '$.mayEnterApprovalPath: enum mismatch'],
  ['forbidden effect detected', (record) => { record.forbiddenEffectsDetected = ['tool_execution']; }, '$.forbiddenEffectsDetected: too many items'],
  ['unknown property', (record) => { record.approvalGrant = true; }, '$: unknown field approvalGrant'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, valid, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T00:56:00.000Z',
    verdict: 'pass',
    schema: 'schemas/live-shadow-observation-result.schema.json',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-observation-results.json',
    resultCount: fixture.results.length,
    validResultCount: fixture.results.length - validationErrors.length,
    negativeControlCount: negativeControls.length,
    recordOnlyResultCount: fixture.results.filter((result) => result.observerAction === 'record_only').length,
    forbiddenEffectsDetectedCount: fixture.results.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0),
    mode: 'offline_schema_fixture_only',
    observerImplemented: false,
    liveTrafficRead: false,
    mayBlockCount: 0,
    mayAllowCount: 0,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    agentInstructionWriteImplemented: false,
    approvalPathImplemented: false,
    safetyClaimScope: 'live_shadow_observation_result_schema_shape_only_record_only_not_runtime_not_authorization',
  },
  validationErrors,
  effectCapabilityFields,
  negativeControls: negativeControls.map(([label]) => label),
  boundary: ['record_only', 'no_effects', 'no_block', 'no_allow', 'not_tool_execution', 'not_memory_write', 'not_config_write', 'not_external_publication', 'not_agent_instruction_write', 'not_approval_path'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
