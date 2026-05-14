import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSimulatedFrameworkShapedAdapter } from '../src/adapters/simulated-framework-shaped-adapter.mjs';

const artifact = 'T-synaptic-mesh-simulated-framework-shaped-adapter-v0.7.2';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/simulated-framework-shaped-adapter.json');
const evidencePath = resolve(packageRoot, 'evidence/simulated-framework-shaped-adapter.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

const results = fixture.positiveCases.map((testCase, index) => {
  const output = runSimulatedFrameworkShapedAdapter(testCase.input, { adapterRunId: `simulated_framework_run_${index + 1}` });
  return { caseId: testCase.caseId, output };
});

assert.equal(results.length, 2, 'v0.7.2 must cover exactly 2 positive simulated adapter cases');
for (const { output } of results) {
  assert.equal(output.ok, true, 'simulated adapter positive case must pass');
  assert.equal(output.parserEvidence?.kind, 'parserEvidence');
  assert.equal(output.classifierDecision?.selectedRoute, 'shadow_only');
  assert.equal(output.classifierDecision?.compactAllowed, false);
  assert.equal(output.classifierDecision?.machineReadablePolicyDecision, false);
  assert.equal(output.classifierDecision?.agentConsumed, false);
  assert.equal(output.classifierDecision?.mayAllow, false);
  assert.equal(output.classifierDecision?.mayBlock, false);
  assert.equal(output.classifierDecision?.authorization, false);
  assert.equal(output.classifierDecision?.enforcement, false);
  assert.equal(output.decisionTrace?.kind, 'DecisionTrace');
  assert.equal(output.advisoryReport?.kind, 'human_readable_advisory_report');
  assert.equal(output.result.recordOnly, true);
  assert.equal(output.result.parserEvidenceProduced, true);
  assert.equal(output.result.classifierDecisionProduced, true);
  assert.equal(output.result.decisionTraceProduced, true);
  assert.equal(output.result.advisoryReportProduced, true);
  for (const field of ['realFrameworkIntegration','sdkImported','networkUsed','toolExecution','resourceFetch','memoryWrite','configWrite','externalPublication','approvalEmission','machineReadablePolicyDecision','agentConsumed','mayBlock','mayAllow','authorization','enforcement']) {
    assert.equal(output.result[field], false, `${field} must remain false`);
  }
}

const frameworkKinds = results.map(({ output }) => output.result.frameworkKind);
const summary = {
  simulatedFrameworkShapedAdapter: 'pass',
  releaseLayer: 'v0.7.2',
  positiveCases: results.length,
  frameworkKinds,
  parserEvidenceProduced: results.filter(({ output }) => output.result.parserEvidenceProduced).length,
  classifierDecisionsProduced: results.filter(({ output }) => output.result.classifierDecisionProduced).length,
  classifierCompactAllowedTrue: results.filter(({ output }) => output.classifierDecision?.compactAllowed === true).length,
  decisionTracesProduced: results.filter(({ output }) => output.result.decisionTraceProduced).length,
  advisoryReportsProduced: results.filter(({ output }) => output.result.advisoryReportProduced).length,
  recordOnly: true,
  realFrameworkIntegration: false,
  sdkImported: false,
  networkUsed: false,
  liveTrafficAllowed: false,
  toolExecution: false,
  resourceFetch: false,
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

assert.deepEqual(summary.frameworkKinds, ['mcp_like', 'langgraph_like']);
assert.equal(summary.parserEvidenceProduced, 2);
assert.equal(summary.classifierDecisionsProduced, 2);
assert.equal(summary.classifierCompactAllowedTrue, 0);
assert.equal(summary.decisionTracesProduced, 2);
assert.equal(summary.advisoryReportsProduced, 2);

const output = {
  artifact,
  timestamp: '2026-05-14T15:10:00.000Z',
  summary,
  results,
  boundary: [
    'simulated_framework_shaped_adapter_only',
    'fake_local_redacted_fixture_only',
    'record_only_evidence',
    'no_mcp_real',
    'no_langgraph_real',
    'no_a2a_real',
    'no_github_bot_real',
    'no_sdk',
    'no_network',
    'no_live_traffic',
    'no_resource_fetch',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_agent_consumption',
    'no_machine_policy',
    'classifier_compactAllowed_false',
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
