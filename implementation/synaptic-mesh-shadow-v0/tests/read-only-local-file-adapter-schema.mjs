import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputSchemaPath = resolve(repoRoot, 'schemas/read-only-local-file-adapter-input.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/read-only-local-file-adapter-result.schema.json');
const inputFixturesPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const resultFixturesPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-results.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-schema.out.json');

const inputSchema = JSON.parse(await readFile(inputSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));
const inputFixtures = JSON.parse(await readFile(inputFixturesPath, 'utf8'));
const resultFixtures = JSON.parse(await readFile(resultFixturesPath, 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withPatch(base, patch) {
  return { ...clone(base), ...patch };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateObjectBySchema(schema, candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) errors.push('candidate must be object');
  const keys = new Set(Object.keys(candidate ?? {}));
  for (const required of schema.required ?? []) {
    if (!keys.has(required)) errors.push(`missing required ${required}`);
  }
  for (const key of keys) {
    if (!schema.properties?.[key]) errors.push(`additional property ${key}`);
  }
  for (const [key, rule] of Object.entries(schema.properties ?? {})) {
    const value = candidate?.[key];
    if (Object.hasOwn(rule, 'const') && value !== rule.const) errors.push(`${key} must equal ${JSON.stringify(rule.const)}`);
    if (rule.type === 'string' && typeof value !== 'string') errors.push(`${key} must be string`);
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) errors.push(`${key} too short`);
    if (rule.pattern && typeof value === 'string' && !(new RegExp(rule.pattern).test(value))) errors.push(`${key} pattern mismatch`);
  }
  return { ok: errors.length === 0, errors };
}

function validateInput(candidate) {
  return validateObjectBySchema(inputSchema, candidate);
}

function validateResult(candidate) {
  return validateObjectBySchema(resultSchema, candidate);
}

const inputValidResults = inputFixtures.valid.map((fixture) => validateInput(fixture));
const resultValidResults = resultFixtures.valid.map((fixture) => validateResult(fixture));
assert.deepEqual(inputValidResults.filter((entry) => !entry.ok), [], 'all valid input fixtures must validate');
assert.deepEqual(resultValidResults.filter((entry) => !entry.ok), [], 'all valid result fixtures must validate');

const validInput = inputFixtures.valid[0];
const validResult = resultFixtures.valid[0];
const sourceBytes = await readFile(resolve(repoRoot, validInput.sourceFilePath));
assert.equal(validInput.sourceArtifactDigest, `sha256:${sha256(sourceBytes)}`, 'sourceArtifactDigest must match fixture bytes');
assert.equal(validResult.sourceFilePath, validInput.sourceFilePath, 'result sourceFilePath must match input fixture path');

const invalidInputResults = inputFixtures.invalid.map((entry) => {
  const candidate = withPatch(validInput, entry.patch);
  const result = validateInput(candidate);
  return { id: entry.id, accepted: result.ok, errors: result.errors };
});
const invalidResultResults = resultFixtures.invalid.map((entry) => {
  const candidate = withPatch(validResult, entry.patch);
  const result = validateResult(candidate);
  return { id: entry.id, accepted: result.ok, errors: result.errors };
});

assert.deepEqual(invalidInputResults.filter((entry) => entry.accepted), [], 'all invalid input fixtures must reject');
assert.deepEqual(invalidResultResults.filter((entry) => entry.accepted), [], 'all invalid result fixtures must reject');

for (const field of ['sourceAlreadyRedacted']) assert.equal(validInput[field], true, `${field} must be true`);
for (const field of ['rawInputAllowed', 'networkAllowed', 'directoryInputAllowed', 'globAllowed', 'watcherAllowed', 'daemonAllowed']) {
  assert.equal(validInput[field], false, `${field} must be false`);
}
assert.equal(validResult.recordOnly, true, 'recordOnly must be true');
for (const field of ['toolExecution', 'memoryWrite', 'configWrite', 'externalPublication', 'approvalEmission', 'machineReadablePolicyDecision', 'agentConsumed', 'mayBlock', 'mayAllow', 'authorization', 'enforcement']) {
  assert.equal(validResult[field], false, `${field} must be false`);
}

const output = {
  artifact: 'T-synaptic-mesh-read-only-local-file-adapter-schema-v0.5.0-alpha-pr1',
  timestamp: '2026-05-13T22:55:00.000Z',
  summary: {
    readOnlyLocalFileAdapterSchema: 'pass',
    releaseLayer: 'v0.5.0-alpha-pr1',
    schemaOnly: true,
    implementationAuthorized: false,
    inputValid: inputFixtures.valid.length,
    inputInvalidRejected: invalidInputResults.length,
    resultValid: resultFixtures.valid.length,
    resultInvalidRejected: invalidResultResults.length,
    sourceAlreadyRedacted: validInput.sourceAlreadyRedacted,
    rawInputAllowed: validInput.rawInputAllowed,
    networkAllowed: validInput.networkAllowed,
    directoryInputAllowed: validInput.directoryInputAllowed,
    globAllowed: validInput.globAllowed,
    watcherAllowed: validInput.watcherAllowed,
    daemonAllowed: validInput.daemonAllowed,
    recordOnly: validResult.recordOnly,
    toolExecution: validResult.toolExecution,
    memoryWrite: validResult.memoryWrite,
    configWrite: validResult.configWrite,
    externalPublication: validResult.externalPublication,
    approvalEmission: validResult.approvalEmission,
    machineReadablePolicyDecision: validResult.machineReadablePolicyDecision,
    agentConsumed: validResult.agentConsumed,
    mayBlock: validResult.mayBlock,
    mayAllow: validResult.mayAllow,
    authorization: validResult.authorization,
    enforcement: validResult.enforcement,
  },
  invalidInputResults,
  invalidResultResults,
  boundary: [
    'schema_only',
    'no_adapter_logic',
    'one_explicit_already_redacted_local_file',
    'evidence_record_only',
    'no_raw_input',
    'no_network',
    'no_directory',
    'no_glob',
    'no_watcher',
    'no_daemon',
    'no_tools',
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
console.log(JSON.stringify(output, null, 2));
