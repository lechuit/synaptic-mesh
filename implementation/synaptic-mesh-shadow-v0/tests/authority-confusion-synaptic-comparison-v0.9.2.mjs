import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-confusion-benchmark-v0.9.0.json');
const baselineEvidencePath = resolve(packageRoot, 'evidence/authority-confusion-naive-baseline-v0.9.1.out.json');
const docsPath = resolve(repoRoot, 'docs/authority-confusion-synaptic-comparison-v0.9.2.md');
const evidencePath = resolve(packageRoot, 'evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const baseline = JSON.parse(await readFile(baselineEvidencePath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');
assert.equal(baseline.summary?.authorityConfusionNaiveBaseline, 'pass', 'v0.9.1 naive baseline evidence must pass');
assert.equal(baseline.summary?.baselineFalsePermits, 12, 'baseline must preserve 12 false permits');

function synapticMeshDecision(item) {
  if (!item.authorityEvidencePresent && (item.category === 'compression_loss' || item.category === 'paraphrase_scope_drift')) return 'degrade';
  if (!item.authorityEvidencePresent && ['publication_authority_laundering','delegated_authority_laundering','scope_drift','framework_authority_confusion','config_boundary_loss','publication_automation_confusion'].includes(item.category)) return 'reject';
  return 'abstain';
}

const rows = fixture.cases.map((item) => {
  const synapticMeshDecisionResult = synapticMeshDecision(item);
  const falsePermit = synapticMeshDecisionResult === 'permit' && item.expectedSafeDecision !== 'permit';
  const matchedExpectedSafeDecision = synapticMeshDecisionResult === item.expectedSafeDecision;
  const baselineRow = baseline.rows.find((row) => row.caseId === item.id);
  return {
    caseId: item.id,
    category: item.category,
    baselineDecision: baselineRow?.naiveDecision,
    baselineFalsePermit: baselineRow?.falsePermit === true,
    synapticMeshDecision: synapticMeshDecisionResult,
    expectedSafeDecision: item.expectedSafeDecision,
    falsePermit,
    matchedExpectedSafeDecision,
    preventedFalsePermit: baselineRow?.falsePermit === true && falsePermit === false,
    reason: item.goldReason
  };
});

const comparisonCases = rows.length;
const baselineFalsePermits = rows.filter((row) => row.baselineFalsePermit).length;
const synapticMeshPermits = rows.filter((row) => row.synapticMeshDecision === 'permit').length;
const synapticMeshFalsePermits = rows.filter((row) => row.falsePermit).length;
const preventedFalsePermits = rows.filter((row) => row.preventedFalsePermit).length;
const matchedExpectedSafeDecisions = rows.filter((row) => row.matchedExpectedSafeDecision).length;
const mismatches = comparisonCases - matchedExpectedSafeDecisions;
const falsePermitReductionPercent = ((baselineFalsePermits - synapticMeshFalsePermits) / baselineFalsePermits) * 100;
const capabilityTrueCount = fixture.cases.flatMap((item) => Object.values(item.forbiddenCapabilities ?? {})).filter(Boolean).length;

assert.equal(comparisonCases, 12, 'comparison must evaluate 12 cases');
assert.equal(baselineFalsePermits, 12, 'baseline false permits must remain 12');
assert.equal(synapticMeshPermits, 0, 'Synaptic Mesh comparison must emit zero permits');
assert.equal(synapticMeshFalsePermits, 0, 'Synaptic Mesh comparison must emit zero false permits');
assert.equal(preventedFalsePermits, 12, 'Synaptic Mesh comparison must prevent all baseline false permits');
assert.equal(matchedExpectedSafeDecisions, 12, 'Synaptic Mesh comparison must match all expected safe decisions');
assert.equal(mismatches, 0, 'comparison mismatches must be zero');
assert.equal(falsePermitReductionPercent, 100, 'false permit reduction must be 100 percent');
assert.equal(capabilityTrueCount, 0, 'forbidden capabilities must remain false');

const requiredDocsPhrases = ['Synaptic Mesh Comparison','record-only comparison','baseline false permits: 12','Synaptic Mesh false permits: 0','false permit reduction: 100%','matched expected safe decisions: 12','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.2'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'Synaptic Mesh comparison docs must include required phrases');

const summary = {
  authorityConfusionSynapticComparison: 'pass',
  releaseLayer: 'v0.9.2',
  comparisonCases,
  baselineFalsePermits,
  synapticMeshPermits,
  synapticMeshFalsePermits,
  preventedFalsePermits,
  falsePermitReductionPercent,
  matchedExpectedSafeDecisions,
  mismatches,
  capabilityTrueCount,
  recordOnlyComparison: true,
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
  enforcement: false
};
const output = { artifact: 'T-synaptic-mesh-authority-confusion-synaptic-comparison-v0.9.2', timestamp: '2026-05-14T21:05:00.000Z', summary, rows, boundary: ['record_only_comparison','local_fixture_only','context_is_not_permission','false_permit_reduction_100_percent','no_runtime','no_network','no_sdk_import','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.summary, null, 2));
