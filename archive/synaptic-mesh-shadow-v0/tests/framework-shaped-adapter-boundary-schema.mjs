import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-framework-shaped-adapter-boundary-schema-v0.7.0-alpha';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const schemaPath = resolve(repoRoot, 'schemas/framework-shaped-adapter-boundary.schema.json');
const fixturesPath = resolve(packageRoot, 'fixtures/framework-shaped-adapter-boundaries.json');
const evidencePath = resolve(packageRoot, 'evidence/framework-shaped-adapter-boundary-schema.out.json');
const packageJsonPath = resolve(packageRoot, 'package.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixtureDocument = JSON.parse(await readFile(fixturesPath, 'utf8'));
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

const expectedSchemaVersion = 'framework-shaped-adapter-boundary-v0';
const expectedAdapterShape = 'framework_shaped_local_fixture';
const frameworkKinds = new Set(['mcp_like', 'langgraph_like', 'a2a_like', 'github_bot_like']);
const expectedInputMode = 'local_redacted_fixture_only';
const expectedOutputMode = 'record_only_evidence';
const forbiddenTrueFields = [
  'realFrameworkIntegration',
  'sdkImported',
  'networkAllowed',
  'liveTrafficAllowed',
  'toolExecutionAllowed',
  'resourceFetchAllowed',
  'memoryWriteAllowed',
  'configWriteAllowed',
  'externalPublicationAllowed',
  'agentConsumedAllowed',
  'machineReadablePolicyAllowed',
  'approvalAllowed',
  'blockingAllowed',
  'allowingAllowed',
  'authorizationAllowed',
  'enforcementAllowed',
];
const prohibitedSdkPackageFragments = [
  '@modelcontextprotocol',
  'langgraph',
  '@langchain/langgraph',
  'a2a',
  '@octokit',
  'probot',
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function basePositiveBoundarySpec() {
  return clone(fixtureDocument.cases.find((testCase) => testCase.expectedVerdict === 'accept').boundarySpec);
}

function caseBoundarySpec(testCase) {
  if (testCase.boundarySpec) return clone(testCase.boundarySpec);
  return { ...basePositiveBoundarySpec(), ...(testCase.patch ?? {}) };
}

function validateBoundarySpec(boundarySpec) {
  const errors = [];
  if (!boundarySpec || typeof boundarySpec !== 'object' || Array.isArray(boundarySpec)) return { verdict: 'reject', errors: ['boundarySpec must be object'] };

  const requiredFields = new Set(schema.required ?? []);
  const properties = schema.properties ?? {};
  const keys = Object.keys(boundarySpec);
  for (const required of requiredFields) if (!keys.includes(required)) errors.push(`${required} missing`);
  if (schema.additionalProperties === false) {
    for (const key of keys) if (!properties[key]) errors.push(`${key} additional property`);
  }

  if (boundarySpec.schemaVersion !== expectedSchemaVersion) errors.push('schemaVersion mismatch');
  if (boundarySpec.adapterShape !== expectedAdapterShape) errors.push('adapterShape mismatch');
  if (!frameworkKinds.has(boundarySpec.frameworkKind)) errors.push('frameworkKind mismatch');
  for (const field of forbiddenTrueFields) if (boundarySpec[field] !== false) errors.push(`${field} must be false`);
  if (boundarySpec.inputMode !== expectedInputMode) errors.push('inputMode mismatch');
  if (boundarySpec.outputMode !== expectedOutputMode) errors.push('outputMode mismatch');

  return { verdict: errors.length === 0 ? 'accept' : 'reject', errors };
}

function countFrameworkSdkDependencies(packageJsonDocument) {
  const dependencyNames = Object.keys({
    ...(packageJsonDocument.dependencies ?? {}),
    ...(packageJsonDocument.devDependencies ?? {}),
    ...(packageJsonDocument.optionalDependencies ?? {}),
  });
  return dependencyNames.filter((name) => prohibitedSdkPackageFragments.some((fragment) => name.includes(fragment))).length;
}

assert.equal(schema.additionalProperties, false, 'schema must be strict at root');
assert.deepEqual(new Set(schema.required ?? []), new Set(Object.keys(schema.properties ?? {})), 'schema required fields must match root properties exactly');
assert.equal(schema.properties.schemaVersion.const, expectedSchemaVersion);
assert.equal(schema.properties.adapterShape.const, expectedAdapterShape);
assert.deepEqual(new Set(schema.properties.frameworkKind.enum), frameworkKinds);
assert.equal(schema.properties.inputMode.const, expectedInputMode);
assert.equal(schema.properties.outputMode.const, expectedOutputMode);
for (const field of forbiddenTrueFields) assert.equal(schema.properties[field].const, false, `${field} must be const false`);
assert.equal(countFrameworkSdkDependencies(packageJson), 0, 'package must not add MCP/LangGraph/A2A/GitHub bot SDK dependencies');

const results = fixtureDocument.cases.map((testCase) => {
  const validationResult = validateBoundarySpec(caseBoundarySpec(testCase));
  const matchedExpected = validationResult.verdict === testCase.expectedVerdict;
  return {
    caseId: testCase.caseId,
    expectedVerdict: testCase.expectedVerdict,
    actualVerdict: validationResult.verdict,
    matchedExpected,
    errors: validationResult.errors,
  };
});

const positiveCases = fixtureDocument.cases.filter((testCase) => testCase.expectedVerdict === 'accept').length;
const negativeCases = fixtureDocument.cases.filter((testCase) => testCase.expectedVerdict === 'reject').length;
const unexpectedAccepts = results.filter((result) => result.expectedVerdict === 'reject' && result.actualVerdict === 'accept').length;
const unexpectedRejects = results.filter((result) => result.expectedVerdict === 'accept' && result.actualVerdict === 'reject').length;
const mismatches = results.filter((result) => !result.matchedExpected);

assert.equal(positiveCases, 2, 'v0.7.0-alpha must keep exactly 2 positive boundary schema cases');
assert.equal(negativeCases, 10, 'v0.7.0-alpha must keep exactly 10 negative boundary schema cases');
assert.equal(unexpectedAccepts, 0, 'negative cases must not be unexpectedly accepted');
assert.equal(unexpectedRejects, 0, 'positive cases must not be unexpectedly rejected');
assert.deepEqual(mismatches, [], 'all framework-shaped boundary fixture cases must match expected verdict');

const summary = {
  frameworkShapedAdapterBoundarySchema: 'pass',
  releaseLayer: 'v0.7.0-alpha',
  schemaOnly: true,
  shapeOnly: true,
  frameworkShapedOnly: true,
  localRedactedFixtureOnly: true,
  positiveCases,
  negativeCases,
  unexpectedAccepts,
  unexpectedRejects,
  realFrameworkIntegration: false,
  sdkImported: false,
  networkAllowed: false,
  liveTrafficAllowed: false,
  toolExecutionAllowed: false,
  resourceFetchAllowed: false,
  memoryWriteAllowed: false,
  configWriteAllowed: false,
  externalPublicationAllowed: false,
  agentConsumedAllowed: false,
  machineReadablePolicyAllowed: false,
  approvalAllowed: false,
  blockingAllowed: false,
  allowingAllowed: false,
  authorizationAllowed: false,
  enforcementAllowed: false,
  realAdapterImplemented: false,
  mcpAdapterImplemented: false,
  langGraphAdapterImplemented: false,
  a2aAdapterImplemented: false,
  githubBotAdapterImplemented: false,
  sourceFilesReadForSchemaCases: 0,
  frameworkSdkDependencyCount: countFrameworkSdkDependencies(packageJson),
  outputMode: expectedOutputMode,
};

const output = {
  artifact,
  timestamp: '2026-05-14T14:20:00.000Z',
  summary,
  results,
  boundary: [
    'framework_shaped_only',
    'local_redacted_fixture_only',
    'schema_shape_test_only',
    'record_only_evidence_only',
    'no_real_framework_integration',
    'no_mcp_server_client',
    'no_langgraph_sdk',
    'no_a2a_runtime',
    'no_github_bot',
    'no_webhook',
    'no_network_call',
    'no_resource_fetch',
    'no_live_traffic',
    'no_watcher',
    'no_daemon',
    'no_tool_call',
    'no_memory_write',
    'no_config_write',
    'no_publication',
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
