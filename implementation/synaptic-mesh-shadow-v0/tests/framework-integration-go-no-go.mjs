
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-framework-integration-go-no-go-v0.8.0-alpha';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/framework-integration-go-no-go.json');
const evidencePath = resolve(packageRoot, 'evidence/framework-integration-go-no-go.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

const operationalFalseFields = [
  'realFrameworkAdapterAuthorized',
  'frameworkSdkImportAuthorized',
  'networkAuthorized',
  'resourceFetchAuthorized',
  'toolExecutionAuthorized',
  'runtimeAuthorized',
  'memoryWriteAuthorized',
  'configWriteAuthorized',
  'externalPublicationAuthorized',
  'agentConsumptionAuthorized',
  'machineReadablePolicyAuthorized',
  'approvalAuthorized',
  'blockingAuthorized',
  'allowingAuthorized',
  'authorizationAuthorized',
  'enforcementAuthorized',
];
const candidateValues = new Set([
  'none_selected_yet',
  'mcp_read_only_candidate',
  'langgraph_read_only_candidate',
  'a2a_read_only_candidate',
  'github_bot_read_only_candidate',
]);

function materialize(testCase) {
  return { ...fixture.baseDecision, ...(testCase.patch ?? {}), ...(testCase.record ?? {}) };
}

function assess(record) {
  const reasonCodes = [];
  if (record.schemaVersion !== 'framework-integration-go-no-go-v0') reasonCodes.push('SCHEMA_VERSION_MISMATCH');
  if (record.reviewedPhase !== 'v0.7.x') reasonCodes.push('REVIEWED_PHASE_MISMATCH');
  if (record.goToDesign !== true) reasonCodes.push('DESIGN_NOT_ALLOWED');
  if (record.goToImplementation !== false) reasonCodes.push('IMPLEMENTATION_ATTEMPTED');
  if (!candidateValues.has(record.selectedFrameworkCandidate)) reasonCodes.push('UNKNOWN_CANDIDATE');
  for (const field of operationalFalseFields) {
    if (record[field] !== false) reasonCodes.push(`${field.toUpperCase()}_NOT_FALSE`);
  }
  return {
    disposition: reasonCodes.length === 0 ? 'accept' : 'reject',
    reasonCodes,
    recordOnly: true,
    realFrameworkRuntime: false,
    sdkImported: false,
    networkUsed: false,
    toolExecution: false,
    agentConsumed: false,
    machineReadablePolicyDecision: false,
  };
}

const results = fixture.cases.map((testCase) => {
  const assessment = assess(materialize(testCase));
  return {
    caseId: testCase.caseId,
    expected: testCase.expected,
    actual: assessment.disposition,
    matched: assessment.disposition === testCase.expected,
    reasonCodes: assessment.reasonCodes,
    recordOnly: assessment.recordOnly,
  };
});

const positiveCases = results.filter((result) => result.expected === 'accept').length;
const negativeCases = results.filter((result) => result.expected === 'reject').length;
const unexpectedAccepts = results.filter((result) => result.expected === 'reject' && result.actual === 'accept').length;
const unexpectedRejects = results.filter((result) => result.expected === 'accept' && result.actual === 'reject').length;

assert.equal(positiveCases, 1, 'go/no-go record must have exactly one positive fixture');
assert.equal(negativeCases, 12, 'go/no-go record must have exactly twelve negative fixtures');
assert.equal(unexpectedAccepts, 0, 'negative go/no-go fixtures must not be accepted');
assert.equal(unexpectedRejects, 0, 'positive go/no-go fixture must not be rejected');
assert.ok(results.every((result) => result.matched), 'all go/no-go fixtures must match expected dispositions');

const summary = {
  frameworkIntegrationGoNoGo: 'pass',
  releaseLayer: 'v0.8.0-alpha',
  positiveCases,
  negativeCases,
  unexpectedAccepts,
  unexpectedRejects,
  goToDesign: true,
  goToImplementation: false,
  realFrameworkAdapterAuthorized: false,
  frameworkSdkImportAuthorized: false,
  networkAuthorized: false,
  resourceFetchAuthorized: false,
  toolExecutionAuthorized: false,
  runtimeAuthorized: false,
  memoryWriteAuthorized: false,
  configWriteAuthorized: false,
  externalPublicationAuthorized: false,
  agentConsumptionAuthorized: false,
  machineReadablePolicyAuthorized: false,
  approvalAuthorized: false,
  blockingAuthorized: false,
  allowingAuthorized: false,
  mayBlock: false,
  mayAllow: false,
  authorizationAuthorized: false,
  enforcementAuthorized: false,
};

const output = {
  artifact,
  timestamp: '2026-05-14T18:56:00.000Z',
  summary,
  results,
  boundary: [
    'go_no_go_record_only',
    'design_allowed_implementation_blocked',
    'record_only_evidence',
    'no_real_framework_adapter',
    'no_framework_runtime',
    'no_sdk',
    'no_network',
    'no_resource_fetch',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_agent_consumption',
    'no_machine_policy',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement'
  ]
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
