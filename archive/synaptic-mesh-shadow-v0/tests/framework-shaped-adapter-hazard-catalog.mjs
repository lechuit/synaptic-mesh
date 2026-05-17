import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-framework-shaped-adapter-hazard-catalog-v0.7.1';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/framework-shaped-adapter-hazard-catalog.json');
const evidencePath = resolve(packageRoot, 'evidence/framework-shaped-adapter-hazard-catalog.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

const hazardChecks = [
  ['mcpServerEnabled', 'MCP_SERVER_ENABLED'],
  ['mcpClientEnabled', 'MCP_CLIENT_ENABLED'],
  ['sdkImported', 'SDK_IMPORTED'],
  ['a2aRuntimeEnabled', 'A2A_RUNTIME_ENABLED'],
  ['githubBotEnabled', 'GITHUB_BOT_OR_WEBHOOK_ENABLED'],
  ['webhookEnabled', 'GITHUB_BOT_OR_WEBHOOK_ENABLED'],
  ['networkAllowed', 'NETWORK_ENABLED'],
  ['networkFetchEnabled', 'NETWORK_ENABLED'],
  ['resourceFetchAllowed', 'RESOURCE_FETCH_ENABLED'],
  ['toolExecutionAllowed', 'TOOL_CALL_ATTEMPTED'],
  ['toolCallAttempted', 'TOOL_CALL_ATTEMPTED'],
  ['toolResultPersisted', 'TOOL_RESULT_PERSISTED'],
  ['memoryWriteAllowed', 'MEMORY_WRITE_ATTEMPTED'],
  ['memoryWriteAttempted', 'MEMORY_WRITE_ATTEMPTED'],
  ['configWriteAllowed', 'CONFIG_WRITE_ATTEMPTED'],
  ['configWriteAttempted', 'CONFIG_WRITE_ATTEMPTED'],
  ['externalPublicationAllowed', 'EXTERNAL_PUBLICATION_ATTEMPTED'],
  ['externalPublicationAttempted', 'EXTERNAL_PUBLICATION_ATTEMPTED'],
  ['approvalAllowed', 'APPROVAL_EMITTED'],
  ['approvalEmitted', 'APPROVAL_EMITTED'],
  ['blockingAllowed', 'BLOCK_EMITTED'],
  ['blockEmitted', 'BLOCK_EMITTED'],
  ['allowingAllowed', 'ALLOW_EMITTED'],
  ['allowEmitted', 'ALLOW_EMITTED'],
  ['authorizationAllowed', 'AUTHORIZATION_EMITTED'],
  ['authorizationEmitted', 'AUTHORIZATION_EMITTED'],
  ['enforcementAllowed', 'ENFORCEMENT_EMITTED'],
  ['enforcementEmitted', 'ENFORCEMENT_EMITTED'],
  ['machineReadablePolicyAllowed', 'MACHINE_POLICY_EMITTED'],
  ['machineReadablePolicyEmitted', 'MACHINE_POLICY_EMITTED'],
  ['agentConsumedAllowed', 'AGENT_CONSUMED_INSTRUCTION_EMITTED'],
  ['agentConsumedInstructionEmitted', 'AGENT_CONSUMED_INSTRUCTION_EMITTED'],
  ['advisoryReportConsumedByAgent', 'ADVISORY_CONSUMED_BY_AGENT'],
  ['liveTrafficAllowed', 'LIVE_TRAFFIC_CLAIMED'],
  ['liveTrafficClaimed', 'LIVE_TRAFFIC_CLAIMED'],
  ['watcherEnabled', 'WATCHER_OR_DAEMON_ENABLED'],
  ['daemonEnabled', 'WATCHER_OR_DAEMON_ENABLED'],
  ['directoryDiscoveryEnabled', 'DIRECTORY_DISCOVERY_ENABLED'],
  ['globInputEnabled', 'GLOB_INPUT_ENABLED'],
  ['rawInputAccepted', 'RAW_INPUT_ACCEPTED'],
];

function materializeHazard(testCase) {
  return { ...fixture.baseBoundarySpec, ...(testCase.patch ?? {}) };
}

function assessHazard(candidate) {
  const reasonCodes = [];
  for (const [field, reasonCode] of hazardChecks) {
    if (candidate[field] === true && !reasonCodes.includes(reasonCode)) reasonCodes.push(reasonCode);
  }
  if (candidate.sourceAlreadyRedacted === false && !reasonCodes.includes('RAW_INPUT_ACCEPTED')) reasonCodes.push('RAW_INPUT_ACCEPTED');
  const rejected = reasonCodes.length > 0;
  return {
    disposition: rejected ? 'reject' : 'accept',
    reasonCodes,
    pipelineRun: false,
    sourceRead: false,
    successOutputWritten: false,
    recordOnly: true,
  };
}

const results = fixture.hazards.map((testCase) => {
  const assessment = assessHazard(materializeHazard(testCase));
  return {
    caseId: testCase.caseId,
    hazard: testCase.hazard,
    expectedDisposition: testCase.expectedDisposition,
    actualDisposition: assessment.disposition,
    matchedDisposition: assessment.disposition === testCase.expectedDisposition,
    expectedReasonCode: testCase.expectedReasonCode,
    matchedReasonCode: assessment.reasonCodes.includes(testCase.expectedReasonCode),
    reasonCodes: assessment.reasonCodes,
    pipelineRun: assessment.pipelineRun,
    sourceRead: assessment.sourceRead,
    successOutputWritten: assessment.successOutputWritten,
    recordOnly: assessment.recordOnly,
  };
});

const hazardCases = fixture.hazards.length;
const rejectedOrDowngraded = results.filter((result) => ['reject', 'downgrade'].includes(result.actualDisposition)).length;
const unexpectedAccepts = results.filter((result) => result.expectedDisposition !== 'accept' && result.actualDisposition === 'accept').length;
const pipelineRunsForRejectedCases = results.filter((result) => result.actualDisposition !== 'accept' && result.pipelineRun).length;
const sourceReadsForRejectedCases = results.filter((result) => result.actualDisposition !== 'accept' && result.sourceRead).length;
const successOutputsForRejectedCases = results.filter((result) => result.actualDisposition !== 'accept' && result.successOutputWritten).length;
const reasonCodeMisses = results.filter((result) => !result.matchedReasonCode).length;

assert.equal(hazardCases, 25, 'v0.7.1 hazard catalog must cover exactly 25 hazards');
assert.equal(rejectedOrDowngraded, 25, 'all hazard cases must reject or downgrade');
assert.equal(unexpectedAccepts, 0, 'hazard cases must not be unexpectedly accepted');
assert.equal(pipelineRunsForRejectedCases, 0, 'rejected hazard cases must not run simulated pipeline');
assert.equal(sourceReadsForRejectedCases, 0, 'rejected hazard cases must not read source');
assert.equal(successOutputsForRejectedCases, 0, 'rejected hazard cases must not write success outputs');
assert.equal(reasonCodeMisses, 0, 'hazard cases must match expected reason codes');

const summary = {
  frameworkAdapterHazardCatalog: 'pass',
  releaseLayer: 'v0.7.1',
  hazardCases,
  rejectedOrDowngraded,
  unexpectedAccepts,
  pipelineRunsForRejectedCases,
  sourceReadsForRejectedCases,
  successOutputsForRejectedCases,
  reasonCodeMisses,
  realFrameworkIntegration: false,
  sdkImported: false,
  networkAllowed: false,
  toolExecution: false,
  resourceFetch: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  approvalEmission: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
};

const output = {
  artifact,
  timestamp: '2026-05-14T14:45:00.000Z',
  summary,
  results,
  boundary: [
    'hazard_catalog_only',
    'reject_or_downgrade_before_pipeline',
    'pipeline_runs_for_rejected_cases_0',
    'source_reads_for_rejected_cases_0',
    'success_outputs_for_rejected_cases_0',
    'record_only_evidence',
    'no_real_framework_integration',
    'no_sdk',
    'no_network',
    'no_resource_fetch',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
    'no_agent_consumption',
    'no_machine_policy'
  ]
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
