import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/authority-confusion-phase-close-v0.9.5.out.json');
const docsPath = resolve(repoRoot, 'docs/authority-confusion-phase-close-v0.9.5.md');
const evidenceFiles = {
  spec: resolve(packageRoot, 'evidence/authority-confusion-benchmark-spec-v0.9.0.out.json'),
  baseline: resolve(packageRoot, 'evidence/authority-confusion-naive-baseline-v0.9.1.out.json'),
  comparison: resolve(packageRoot, 'evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json'),
  demo: resolve(packageRoot, 'evidence/authority-confusion-public-demo-v0.9.3.out.json'),
  hardening: resolve(packageRoot, 'evidence/authority-confusion-adversarial-hardening-v0.9.4.out.json'),
};
const evidence = Object.fromEntries(await Promise.all(Object.entries(evidenceFiles).map(async ([key, file]) => [key, JSON.parse(await readFile(file, 'utf8'))])));
const docs = await readFile(docsPath, 'utf8');

assert.equal(evidence.spec.summary?.authorityConfusionBenchmarkSpec, 'pass', 'v0.9.0 spec evidence must pass');
assert.equal(evidence.baseline.summary?.authorityConfusionNaiveBaseline, 'pass', 'v0.9.1 baseline evidence must pass');
assert.equal(evidence.comparison.summary?.authorityConfusionSynapticComparison, 'pass', 'v0.9.2 comparison evidence must pass');
assert.equal(evidence.demo.summary?.authorityConfusionPublicDemo, 'pass', 'v0.9.3 public demo evidence must pass');
assert.equal(evidence.hardening.summary?.authorityConfusionAdversarialHardening, 'pass', 'v0.9.4 hardening evidence must pass');

const baseEvaluationCases = evidence.comparison.summary.comparisonCases;
const adversarialEvaluationCases = evidence.hardening.summary.adversarialVariants;
const totalEvaluationCases = baseEvaluationCases + adversarialEvaluationCases;
const totalBaselineFalsePermits = evidence.comparison.summary.baselineFalsePermits + evidence.hardening.summary.baselineFalsePermits;
const totalSynapticMeshFalsePermits = evidence.comparison.summary.synapticMeshFalsePermits + evidence.hardening.summary.synapticMeshFalsePermits;
const totalPreventedFalsePermits = evidence.comparison.summary.preventedFalsePermits + evidence.hardening.summary.preventedFalsePermits;
const falsePermitReductionPercent = ((totalBaselineFalsePermits - totalSynapticMeshFalsePermits) / totalBaselineFalsePermits) * 100;
const evidenceArtifacts = Object.keys(evidence).length;
const evidencePasses = Object.values(evidence).filter((item) => Object.values(item.summary ?? {}).includes('pass')).length;
const missingEvidence = evidenceArtifacts - evidencePasses;
const boundaryFlags = Object.values(evidence).flatMap((item) => [item.summary?.runtimeImplemented, item.summary?.networkAllowed, item.summary?.sdkImported, item.summary?.resourceFetch, item.summary?.toolExecution, item.summary?.agentConsumed, item.summary?.machineReadablePolicyDecision, item.summary?.approvalEmission, item.summary?.mayBlock, item.summary?.mayAllow, item.summary?.authorization, item.summary?.enforcement]);
const forbiddenTrueCount = boundaryFlags.filter(Boolean).length;

assert.equal(evidenceArtifacts, 5, 'phase close must aggregate 5 v0.9 evidence artifacts');
assert.equal(evidencePasses, 5, 'all v0.9 evidence artifacts must pass');
assert.equal(missingEvidence, 0, 'missing evidence must be zero');
assert.equal(baseEvaluationCases, 12, 'base comparison cases must be 12');
assert.equal(adversarialEvaluationCases, 48, 'adversarial cases must be 48');
assert.equal(totalEvaluationCases, 60, 'total evaluated cases must be 60');
assert.equal(totalBaselineFalsePermits, 60, 'total baseline false permits must be 60');
assert.equal(totalSynapticMeshFalsePermits, 0, 'total Synaptic Mesh false permits must be zero');
assert.equal(totalPreventedFalsePermits, 60, 'total prevented false permits must be 60');
assert.equal(falsePermitReductionPercent, 100, 'false permit reduction must be 100 percent');
assert.equal(forbiddenTrueCount, 0, 'all forbidden capability flags must remain false across evidence');

const requiredDocsPhrases = ['Authority Confusion Phase Close','proof-of-value achieved','total evaluated cases: 60','baseline false permits: 60','Synaptic Mesh false permits: 0','prevented false permits: 60','false permit reduction: 100%','framework integration remains unauthorized','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.5'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'phase close docs must include required phrases');

const summary = {
  authorityConfusionPhaseClose: 'pass',
  releaseLayer: 'v0.9.5',
  evidenceArtifacts,
  evidencePasses,
  missingEvidence,
  baseEvaluationCases,
  adversarialEvaluationCases,
  totalEvaluationCases,
  totalBaselineFalsePermits,
  totalSynapticMeshFalsePermits,
  totalPreventedFalsePermits,
  falsePermitReductionPercent,
  proofOfValueAchieved: true,
  phaseCloseReady: true,
  frameworkIntegrationAuthorized: false,
  realFrameworkAdapterImplemented: false,
  runtimeImplemented: false,
  networkAllowed: false,
  sdkImported: false,
  resourceFetch: false,
  toolExecution: false,
  liveTraffic: false,
  watcherDaemon: false,
  memoryWrite: false,
  configWrite: false,
  externalPublicationAutomation: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  approvalEmission: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
  nextRuntimeStepAuthorized: false,
};
const output = { artifact: 'T-synaptic-mesh-authority-confusion-phase-close-v0.9.5', timestamp: '2026-05-14T22:15:00.000Z', summary, evidenceFiles: Object.fromEntries(Object.entries(evidenceFiles).map(([key, file]) => [key, file.replace(repoRoot + '/', '')])), phaseDecision: { proofOfValueAchieved: true, closeAuthorityConfusionBenchmarkPhase: true, frameworkIntegrationAuthorized: false, nextRuntimeStepAuthorized: false, recommendedNextStep: 'human_decision_before_any_real_integration' }, boundary: ['phase_close_public_review_only','proof_of_value_not_runtime_authorization','local_redacted_evidence_only','no_runtime','no_network','no_sdk_import','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.summary, null, 2));
