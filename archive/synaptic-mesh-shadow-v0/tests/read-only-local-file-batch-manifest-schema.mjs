import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-read-only-local-file-batch-manifest-schema-v0.6.0-alpha';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const schemaPath = resolve(repoRoot, 'schemas/read-only-local-file-batch-manifest.schema.json');
const fixturesPath = resolve(packageRoot, 'fixtures/read-only-local-file-batch-manifests.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-batch-manifest-schema.out.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixtureDocument = JSON.parse(await readFile(fixturesPath, 'utf8'));

const expectedSchemaVersion = 'read-only-local-file-batch-manifest-v0';
const expectedBatchMode = 'manual_explicit_redacted_file_list';
const minInputCount = 1;
const maxInputCount = 5;
const forbiddenTrueFieldNames = [
  'directoryDiscovery',
  'globAllowed',
  'watcherAllowed',
  'daemonAllowed',
  'networkAllowed',
  'liveTrafficAllowed',
];
const requiredRootFields = new Set(schema.required ?? []);
const rootProperties = schema.properties ?? {};
const inputSchema = rootProperties.inputs?.items ?? {};
const requiredInputFields = new Set(inputSchema.required ?? []);
const inputProperties = inputSchema.properties ?? {};
const sourcePathPattern = new RegExp(inputProperties.sourceFilePath.pattern);
const digestPattern = new RegExp(inputProperties.sourceArtifactDigest.pattern);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function caseManifest(testCase) {
  if (testCase.manifest) return clone(testCase.manifest);
  const base = clone(fixtureDocument.cases.find((candidate) => candidate.expectedVerdict === 'accept').manifest);
  for (const [key, value] of Object.entries(testCase.patch ?? {})) base[key] = value;
  if (testCase.inputPatch) {
    base.inputs[0] = { ...base.inputs[0], ...testCase.inputPatch };
  }
  return base;
}

function validateInputItem(inputItem, index) {
  const errors = [];
  if (!inputItem || typeof inputItem !== 'object' || Array.isArray(inputItem)) return [`inputs[${index}] must be object`];
  const keys = Object.keys(inputItem);
  for (const required of requiredInputFields) if (!keys.includes(required)) errors.push(`inputs[${index}].${required} missing`);
  if (inputSchema.additionalProperties === false) {
    for (const key of keys) if (!inputProperties[key]) errors.push(`inputs[${index}].${key} additional property`);
  }
  const sourceFilePath = typeof inputItem.sourceFilePath === 'string' ? inputItem.sourceFilePath : '';
  const sourceArtifactDigest = typeof inputItem.sourceArtifactDigest === 'string' ? inputItem.sourceArtifactDigest : '';
  const redactionReviewRecordId = typeof inputItem.redactionReviewRecordId === 'string' ? inputItem.redactionReviewRecordId : '';
  if (!sourcePathPattern.test(sourceFilePath)) errors.push(`inputs[${index}].sourceFilePath pattern mismatch`);
  if (!digestPattern.test(sourceArtifactDigest)) errors.push(`inputs[${index}].sourceArtifactDigest pattern mismatch`);
  if (inputItem.sourceAlreadyRedacted !== true) errors.push(`inputs[${index}].sourceAlreadyRedacted must be true`);
  if (redactionReviewRecordId.length < 1) errors.push(`inputs[${index}].redactionReviewRecordId too short`);
  return errors;
}

function validateBatchManifest(batchManifest) {
  const errors = [];
  if (!batchManifest || typeof batchManifest !== 'object' || Array.isArray(batchManifest)) return { verdict: 'reject', errors: ['manifest must be object'] };

  const rootKeys = Object.keys(batchManifest);
  for (const required of requiredRootFields) if (!rootKeys.includes(required)) errors.push(`${required} missing`);
  if (schema.additionalProperties === false) {
    for (const key of rootKeys) if (!rootProperties[key]) errors.push(`${key} additional property`);
  }

  if (batchManifest.schemaVersion !== expectedSchemaVersion) errors.push('schemaVersion mismatch');
  if (batchManifest.batchMode !== expectedBatchMode) errors.push('batchMode mismatch');
  if (batchManifest.explicitInputListOnly !== true) errors.push('explicitInputListOnly must be true');
  if (batchManifest.recordOnly !== true) errors.push('recordOnly must be true');
  for (const fieldName of forbiddenTrueFieldNames) {
    if (batchManifest[fieldName] !== false) errors.push(`${fieldName} must be false`);
  }

  if (!Number.isInteger(batchManifest.maxInputCount) || batchManifest.maxInputCount < minInputCount || batchManifest.maxInputCount > maxInputCount) {
    errors.push('maxInputCount must be integer 1..5');
  }

  const inputList = Array.isArray(batchManifest.inputs) ? batchManifest.inputs : [];
  if (!Array.isArray(batchManifest.inputs)) errors.push('inputs must be array');
  if (inputList.length < minInputCount || inputList.length > maxInputCount) errors.push('inputs length must be 1..5');
  if (Number.isInteger(batchManifest.maxInputCount) && inputList.length > batchManifest.maxInputCount) errors.push('inputs length exceeds maxInputCount');
  for (const [index, inputItem] of inputList.entries()) errors.push(...validateInputItem(inputItem, index));

  return {
    verdict: errors.length === 0 ? 'accept' : 'reject',
    errors,
    inputCount: inputList.length,
  };
}

assert.equal(schema.additionalProperties, false, 'schema must be strict at root');
assert.equal(schema.properties.inputs.items.additionalProperties, false, 'schema must be strict for input items');
assert.equal(schema.properties.maxInputCount.maximum, 5, 'maxInputCount must be capped at 5');
assert.equal(schema.properties.inputs.maxItems, 5, 'inputs must be capped at 5');
assert.equal(schema.properties.schemaVersion.const, expectedSchemaVersion);
assert.equal(schema.properties.batchMode.const, expectedBatchMode);
assert.equal(schema.properties.explicitInputListOnly.const, true);
assert.equal(schema.properties.recordOnly.const, true);
for (const fieldName of forbiddenTrueFieldNames) assert.equal(schema.properties[fieldName].const, false, `${fieldName} must be const false`);

const results = fixtureDocument.cases.map((testCase) => {
  const validationResult = validateBatchManifest(caseManifest(testCase));
  const matchedExpected = validationResult.verdict === testCase.expectedVerdict;
  return {
    caseId: testCase.caseId,
    expectedVerdict: testCase.expectedVerdict,
    actualVerdict: validationResult.verdict,
    matchedExpected,
    errors: validationResult.errors,
  };
});

const mismatches = results.filter((result) => !result.matchedExpected);
const positiveCases = fixtureDocument.cases.filter((testCase) => testCase.expectedVerdict === 'accept').length;
const negativeCases = fixtureDocument.cases.filter((testCase) => testCase.expectedVerdict === 'reject').length;
const unexpectedAccepts = results.filter((result) => result.expectedVerdict === 'reject' && result.actualVerdict === 'accept').length;
const unexpectedRejects = results.filter((result) => result.expectedVerdict === 'accept' && result.actualVerdict === 'reject').length;

assert.equal(positiveCases, 2, 'v0.6.0-alpha must keep exactly 2 positive schema cases');
assert.equal(negativeCases, 8, 'v0.6.0-alpha must keep exactly 8 negative schema cases');
assert.equal(unexpectedAccepts, 0, 'negative cases must not be unexpectedly accepted');
assert.equal(unexpectedRejects, 0, 'positive cases must not be unexpectedly rejected');
assert.deepEqual(mismatches, [], 'all schema fixture cases must match expected verdict');

const summary = {
  readOnlyLocalFileBatchManifestSchema: 'pass',
  releaseLayer: 'v0.6.0-alpha',
  manifestOnly: true,
  schemaOnly: true,
  batchAdapterImplemented: false,
  batchBehaviorAuthorized: false,
  positiveCases,
  negativeCases,
  unexpectedAccepts,
  unexpectedRejects,
  sourceFilesReadForSchemaCases: 0,
  maxInputCount: 5,
  directoryDiscovery: false,
  globAllowed: false,
  watcherAllowed: false,
  daemonAllowed: false,
  networkAllowed: false,
  liveTrafficAllowed: false,
  recordOnly: true,
  adapterRuntimeChanged: false,
  toolExecution: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  approvalEmission: false,
  machineReadablePolicyDecision: false,
  agentConsumed: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
};

const output = {
  artifact,
  timestamp: '2026-05-14T13:00:00.000Z',
  summary,
  results,
  boundary: [
    'manifest_only',
    'schema_only',
    'no_batch_execution_yet',
    'no_source_file_reads_in_schema_test',
    'manual_explicit_redacted_file_list_only',
    'max_input_count_5',
    'explicit_input_list_only',
    'already_redacted_sources_only',
    'digest_bound_inputs_only',
    'review_record_id_required',
    'record_only_evidence_only',
    'no_directory_discovery',
    'no_glob',
    'no_watcher',
    'no_daemon',
    'no_network',
    'no_live_traffic',
    'no_runtime_authorization',
    'no_tool_execution',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_approval',
    'no_machine_policy',
    'no_agent_consumption',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement'
  ]
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
