import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const comparisonEvidencePath = resolve(packageRoot, 'evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json');
const specEvidencePath = resolve(packageRoot, 'evidence/authority-confusion-benchmark-spec-v0.9.0.out.json');
const baselineEvidencePath = resolve(packageRoot, 'evidence/authority-confusion-naive-baseline-v0.9.1.out.json');
const docsPath = resolve(repoRoot, 'docs/authority-confusion-public-demo-v0.9.3.md');
const evidencePath = resolve(packageRoot, 'evidence/authority-confusion-public-demo-v0.9.3.out.json');

const spec = JSON.parse(await readFile(specEvidencePath, 'utf8'));
const baseline = JSON.parse(await readFile(baselineEvidencePath, 'utf8'));
const comparison = JSON.parse(await readFile(comparisonEvidencePath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');

assert.equal(spec.summary?.authorityConfusionBenchmarkSpec, 'pass', 'v0.9.0 spec must pass');
assert.equal(baseline.summary?.authorityConfusionNaiveBaseline, 'pass', 'v0.9.1 baseline must pass');
assert.equal(comparison.summary?.authorityConfusionSynapticComparison, 'pass', 'v0.9.2 comparison must pass');

const demoRows = comparison.rows.map((row) => ({
  caseId: row.caseId,
  category: row.category,
  beforeNaive: row.baselineDecision,
  beforeFailure: row.baselineFalsePermit === true ? 'false_permit' : 'none',
  afterSynapticMesh: row.synapticMeshDecision,
  afterFailure: row.falsePermit === true ? 'false_permit' : 'none',
  publicClaim: row.preventedFalsePermit ? 'prevented_false_permit' : 'not_prevented'
}));

const demoRowCount = demoRows.length;
const beforeFalsePermits = demoRows.filter((row) => row.beforeFailure === 'false_permit').length;
const afterFalsePermits = demoRows.filter((row) => row.afterFailure === 'false_permit').length;
const preventedFalsePermits = demoRows.filter((row) => row.publicClaim === 'prevented_false_permit').length;
const afterPermits = demoRows.filter((row) => row.afterSynapticMesh === 'permit').length;
const comparisonArtifacts = [specEvidencePath, baselineEvidencePath, comparisonEvidencePath].length;
const publicReviewDocs = ['docs/authority-confusion-benchmark-spec-v0.9.0.md','docs/authority-confusion-naive-baseline-v0.9.1.md','docs/authority-confusion-synaptic-comparison-v0.9.2.md','docs/authority-confusion-public-demo-v0.9.3.md','docs/status-v0.9.3.md'].length;

assert.equal(demoRowCount, 12, 'public demo must include 12 rows');
assert.equal(beforeFalsePermits, 12, 'public demo must show 12 before false permits');
assert.equal(afterFalsePermits, 0, 'public demo must show 0 after false permits');
assert.equal(preventedFalsePermits, 12, 'public demo must show 12 prevented false permits');
assert.equal(afterPermits, 0, 'public demo must show zero after permits');

const requiredDocsPhrases = ['Public Demo Package','before: 12 false permits','after: 0 false permits','12/12 prevented false permits','human review only','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.3'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'public demo docs must include required phrases');

const summary = {
  authorityConfusionPublicDemo: 'pass',
  releaseLayer: 'v0.9.3',
  demoRowCount,
  beforeFalsePermits,
  afterFalsePermits,
  preventedFalsePermits,
  afterPermits,
  falsePermitReductionPercent: 100,
  comparisonArtifacts,
  publicReviewDocs,
  reproducibleEvidence: true,
  humanReviewOnly: true,
  publicDemoReady: true,
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
  enforcement: false
};
const output = { artifact: 'T-synaptic-mesh-authority-confusion-public-demo-v0.9.3', timestamp: '2026-05-14T21:15:00.000Z', summary, demoRows, reproducibleEvidenceFiles: ['implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-benchmark-spec-v0.9.0.out.json','implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-naive-baseline-v0.9.1.out.json','implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json','implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-public-demo-v0.9.3.out.json'], boundary: ['public_demo_package','human_review_only','local_redacted_fixture_only','no_runtime','no_network','no_sdk_import','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.summary, null, 2));
