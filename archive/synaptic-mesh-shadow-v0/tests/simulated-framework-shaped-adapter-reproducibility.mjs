import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSimulatedFrameworkShapedAdapter } from '../src/adapters/simulated-framework-shaped-adapter.mjs';

const artifact = 'T-synaptic-mesh-simulated-framework-shaped-adapter-reproducibility-v0.7.3';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/simulated-framework-shaped-adapter-reproducibility.json');
const adapterFixturePath = resolve(packageRoot, 'fixtures/simulated-framework-shaped-adapter.json');
const baselineEvidencePath = resolve(packageRoot, 'evidence/simulated-framework-shaped-adapter.out.json');
const evidencePath = resolve(packageRoot, 'evidence/simulated-framework-shaped-adapter-reproducibility.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const adapterFixture = JSON.parse(await readFile(adapterFixturePath, 'utf8'));
const baselineEvidence = JSON.parse(await readFile(baselineEvidencePath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.7.3');
assert.equal(fixture.dependsOn, 'v0.7.2-simulated-framework-shaped-adapter');
assert.equal(fixture.mode, 'manual_local_framework_shaped_adapter_reproducibility_drift_record_only');
assert.equal(fixture.runs, 2);
assert.equal(fixture.negativeControls.length, 8);
assert.equal(baselineEvidence.summary.simulatedFrameworkShapedAdapter, 'pass');
assert.equal(baselineEvidence.summary.releaseLayer, 'v0.7.2');
assert.equal(baselineEvidence.summary.classifierCompactAllowedTrue, 0);

const forbiddenCapabilityFields = Object.freeze([
  'realFrameworkIntegration',
  'sdkImported',
  'networkUsed',
  'toolExecution',
  'resourceFetch',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

const requiredBoundaryTokens = Object.freeze([
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
  'no_enforcement',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function hash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(stable(value));
  return `sha256:${createHash('sha256').update(text).digest('hex')}`;
}

function buildAdapterEvidenceRun() {
  const results = adapterFixture.positiveCases.map((testCase, index) => {
    const output = runSimulatedFrameworkShapedAdapter(testCase.input, { adapterRunId: `simulated_framework_run_${index + 1}` });
    return { caseId: testCase.caseId, output };
  });
  return {
    artifact: baselineEvidence.artifact,
    summary: buildSummary(results),
    results,
    boundary: [...baselineEvidence.boundary],
  };
}

function buildSummary(results) {
  return {
    simulatedFrameworkShapedAdapter: 'pass',
    releaseLayer: 'v0.7.2',
    positiveCases: results.length,
    frameworkKinds: results.map(({ output }) => output.result.frameworkKind),
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
}

function normalize(evidence) {
  return {
    artifact: evidence.artifact,
    summary: evidence.summary,
    cases: evidence.results.map(({ caseId, output }) => ({
      caseId,
      ok: output.ok,
      frameworkKind: output.result.frameworkKind,
      sourceArtifactDigest: output.inputRef.sourceArtifactDigest,
      parserEvidence: {
        kind: output.parserEvidence.kind,
        rawInputShape: output.parserEvidence.rawInputShape,
        frameworkKind: output.parserEvidence.frameworkKind,
        validReceipts: output.parserEvidence.validReceipts,
        invalidReceipts: output.parserEvidence.invalidReceipts,
        sourceAlreadyRedacted: output.parserEvidence.sourceAlreadyRedacted,
        localFixtureOnly: output.parserEvidence.localFixtureOnly,
        networkUsed: output.parserEvidence.networkUsed,
        resourceFetch: output.parserEvidence.resourceFetch,
      },
      classifierDecision: {
        selectedRoute: output.classifierDecision.selectedRoute,
        compactAllowed: output.classifierDecision.compactAllowed,
        reasonCodes: output.classifierDecision.reasonCodes,
        rawClassifierDecisionPersisted: output.classifierDecision.rawClassifierDecisionPersisted,
        recordOnly: output.classifierDecision.recordOnly,
        machineReadablePolicyDecision: output.classifierDecision.machineReadablePolicyDecision,
        agentConsumed: output.classifierDecision.agentConsumed,
        mayBlock: output.classifierDecision.mayBlock,
        mayAllow: output.classifierDecision.mayAllow,
        authorization: output.classifierDecision.authorization,
        enforcement: output.classifierDecision.enforcement,
      },
      decisionTrace: {
        traceMode: output.decisionTrace.traceMode,
        selectedRoute: output.decisionTrace.selectedRoute,
        boundaryVerdict: output.decisionTrace.boundaryVerdict,
        classifierDecisionHash: output.decisionTrace.classifierDecisionHash,
        machineReadablePolicyDecision: output.decisionTrace.machineReadablePolicyDecision,
        agentConsumed: output.decisionTrace.agentConsumed,
        mayBlock: output.decisionTrace.mayBlock,
        mayAllow: output.decisionTrace.mayAllow,
        authorization: output.decisionTrace.authorization,
        enforcement: output.decisionTrace.enforcement,
      },
      advisoryReport: {
        kind: output.advisoryReport.kind,
        mode: output.advisoryReport.mode,
        frameworkKind: output.advisoryReport.frameworkKind,
        notAuthority: output.advisoryReport.notAuthority,
        notAgentInstruction: output.advisoryReport.notAgentInstruction,
        machineReadablePolicyDecision: output.advisoryReport.machineReadablePolicyDecision,
        agentConsumed: output.advisoryReport.agentConsumed,
      },
      result: Object.fromEntries(forbiddenCapabilityFields.map((field) => [field, output.result[field]])),
    })),
    boundary: evidence.boundary,
  };
}

function evaluate(candidate) {
  const reasons = [];
  const baseline = normalize(baselineEvidence);
  if (hash(candidate.summary) !== hash(baseline.summary)) reasons.push('SIMULATED_ADAPTER_SUMMARY_DRIFT');
  if (JSON.stringify(candidate.summary.frameworkKinds) !== JSON.stringify(baseline.summary.frameworkKinds)) reasons.push('SIMULATED_ADAPTER_FRAMEWORK_KIND_DRIFT');
  if (candidate.cases.length !== baseline.cases.length || hash(candidate.cases.map((item) => item.caseId)) !== hash(baseline.cases.map((item) => item.caseId))) reasons.push('SIMULATED_ADAPTER_CASE_SET_DRIFT');
  if (hash(candidate.cases.map((item) => item.decisionTrace)) !== hash(baseline.cases.map((item) => item.decisionTrace))) reasons.push('SIMULATED_ADAPTER_DECISION_TRACE_DRIFT');
  if (hash(candidate.boundary) !== hash(baseline.boundary) || requiredBoundaryTokens.some((token) => !candidate.boundary.includes(token))) reasons.push('SIMULATED_ADAPTER_BOUNDARY_DRIFT');

  for (const item of candidate.cases) {
    if (item.classifierDecision.compactAllowed !== false || item.decisionTrace.boundaryVerdict.falseCompact !== false || item.summary?.classifierCompactAllowedTrue > 0) reasons.push('SIMULATED_ADAPTER_CLASSIFIER_COMPACT_DRIFT');
    if (item.classifierDecision.machineReadablePolicyDecision !== false || item.decisionTrace.machineReadablePolicyDecision !== false || item.advisoryReport.machineReadablePolicyDecision !== false) reasons.push('SIMULATED_ADAPTER_MACHINE_POLICY_DRIFT');
    if (item.classifierDecision.agentConsumed !== false || item.decisionTrace.agentConsumed !== false || item.advisoryReport.agentConsumed !== false) reasons.push('SIMULATED_ADAPTER_AGENT_CONSUMPTION_DRIFT');
    for (const field of forbiddenCapabilityFields) {
      if (item.result[field] !== false) reasons.push('SIMULATED_ADAPTER_CAPABILITY_DRIFT');
    }
    for (const field of ['mayBlock', 'mayAllow', 'authorization', 'enforcement']) {
      if (item.classifierDecision[field] !== false || item.decisionTrace[field] !== false) reasons.push('SIMULATED_ADAPTER_CAPABILITY_DRIFT');
    }
  }
  if (candidate.summary.classifierCompactAllowedTrue !== 0) reasons.push('SIMULATED_ADAPTER_CLASSIFIER_COMPACT_DRIFT');
  for (const field of forbiddenCapabilityFields) {
    if (candidate.summary[field] !== false) reasons.push(field === 'machineReadablePolicyDecision' ? 'SIMULATED_ADAPTER_MACHINE_POLICY_DRIFT' : field === 'agentConsumed' ? 'SIMULATED_ADAPTER_AGENT_CONSUMPTION_DRIFT' : 'SIMULATED_ADAPTER_CAPABILITY_DRIFT');
  }
  return [...new Set(reasons)].sort();
}

function mutate(normalized, control) {
  const candidate = clone(normalized);
  if (control.mutateSummary) candidate.summary = { ...candidate.summary, ...control.mutateSummary };
  if (control.reverseFrameworkKinds) candidate.summary.frameworkKinds = [...candidate.summary.frameworkKinds].reverse();
  if (control.mutateFirstClassifierDecision) candidate.cases[0].classifierDecision = { ...candidate.cases[0].classifierDecision, ...control.mutateFirstClassifierDecision };
  if (control.mutateFirstAdvisoryReport) candidate.cases[0].advisoryReport = { ...candidate.cases[0].advisoryReport, ...control.mutateFirstAdvisoryReport };
  if (control.mutateFirstResult) candidate.cases[0].result = { ...candidate.cases[0].result, ...control.mutateFirstResult };
  if (control.mutateFirstDecisionTraceBoundaryVerdict) candidate.cases[0].decisionTrace.boundaryVerdict = { ...candidate.cases[0].decisionTrace.boundaryVerdict, ...control.mutateFirstDecisionTraceBoundaryVerdict };
  if (control.removeBoundaryToken) candidate.boundary = candidate.boundary.filter((token) => token !== control.removeBoundaryToken);
  return candidate;
}

const runs = Array.from({ length: fixture.runs }, (_, index) => {
  const evidence = buildAdapterEvidenceRun();
  const normalized = normalize(evidence);
  return {
    runId: `run-${index + 1}`,
    normalized,
    normalizedOutputHash: hash(normalized),
    baselineMatch: hash(normalized) === hash(normalize(baselineEvidence)),
  };
});

const normalizedOutputMismatches = runs.filter((run) => run.normalizedOutputHash !== runs[0].normalizedOutputHash).length;
const baselineMismatches = runs.filter((run) => !run.baselineMatch).length;
assert.equal(normalizedOutputMismatches, 0, 'simulated adapter normalized output must be reproducible across local runs');
assert.equal(baselineMismatches, 0, 'simulated adapter normalized output must match committed v0.7.2 evidence');
assert.deepEqual(evaluate(runs[0].normalized), [], 'baseline simulated adapter evidence must have zero drift reasons');

const negativeResults = fixture.negativeControls.map((control) => {
  const candidate = mutate(runs[0].normalized, control);
  const reasonCodes = evaluate(candidate);
  return { controlId: control.controlId, accepted: reasonCodes.length === 0, reasonCodes };
});

for (const [index, result] of negativeResults.entries()) {
  const expected = fixture.negativeControls[index].expectedReasonCodes;
  assert.equal(result.accepted, false, `${result.controlId} must reject`);
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.controlId} must include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const unexpectedAccepts = negativeResults.filter((result) => result.accepted).length;
const expectedReasonCodeMisses = negativeResults.reduce((count, result, index) => {
  const expected = fixture.negativeControls[index].expectedReasonCodes;
  return count + expected.filter((code) => !result.reasonCodes.includes(code)).length;
}, 0);

const summary = {
  artifact,
  timestamp: '2026-05-14T15:45:00.000Z',
  simulatedFrameworkAdapterReproducibility: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  mode: fixture.mode,
  runs: fixture.runs,
  normalizedOutputMismatches,
  baselineMismatches,
  baselineEvidenceHash: hash(normalize(baselineEvidence)),
  normalizedOutputHash: runs[0].normalizedOutputHash,
  negativeControls: fixture.negativeControls.length,
  expectedRejects: fixture.negativeControls.length,
  unexpectedAccepts,
  expectedReasonCodeMisses,
  positiveCases: baselineEvidence.summary.positiveCases,
  frameworkKinds: baselineEvidence.summary.frameworkKinds,
  classifierCompactAllowedTrue: baselineEvidence.summary.classifierCompactAllowedTrue,
  parserEvidenceProduced: baselineEvidence.summary.parserEvidenceProduced,
  classifierDecisionsProduced: baselineEvidence.summary.classifierDecisionsProduced,
  decisionTracesProduced: baselineEvidence.summary.decisionTracesProduced,
  advisoryReportsProduced: baselineEvidence.summary.advisoryReportsProduced,
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

assert.equal(summary.runs, 2);
assert.equal(summary.normalizedOutputMismatches, 0);
assert.equal(summary.baselineMismatches, 0);
assert.equal(summary.negativeControls, 8);
assert.equal(summary.expectedRejects, 8);
assert.equal(summary.unexpectedAccepts, 0);
assert.equal(summary.expectedReasonCodeMisses, 0);
assert.equal(summary.classifierCompactAllowedTrue, 0);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.agentConsumed, false);
assert.equal(summary.mayBlock, false);
assert.equal(summary.mayAllow, false);
assert.equal(summary.authorization, false);
assert.equal(summary.enforcement, false);

const output = {
  summary,
  runs: runs.map((run) => ({
    runId: run.runId,
    normalizedOutputHash: run.normalizedOutputHash,
    baselineMatch: run.baselineMatch,
  })),
  negativeResults,
  boundary: [
    'manual_local_reproducibility_only',
    'fake_local_redacted_fixture_only',
    'committed_record_only_evidence_only',
    'not_real_framework_integration',
    'not_machine_policy',
    'not_agent_consumed',
    'no_sdk',
    'no_network',
    'no_live_traffic',
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
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
