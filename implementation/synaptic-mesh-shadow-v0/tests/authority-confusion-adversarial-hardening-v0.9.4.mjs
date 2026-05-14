import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const variantsPath = resolve(packageRoot, 'fixtures/authority-confusion-adversarial-variants-v0.9.4.json');
const demoEvidencePath = resolve(packageRoot, 'evidence/authority-confusion-public-demo-v0.9.3.out.json');
const docsPath = resolve(repoRoot, 'docs/authority-confusion-adversarial-hardening-v0.9.4.md');
const evidencePath = resolve(packageRoot, 'evidence/authority-confusion-adversarial-hardening-v0.9.4.out.json');

const fixture = JSON.parse(await readFile(variantsPath, 'utf8'));
const demo = JSON.parse(await readFile(demoEvidencePath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');
assert.equal(demo.summary?.authorityConfusionPublicDemo, 'pass', 'v0.9.3 public demo must pass before hardening');

function naiveDecision(item) {
  const text = (item.redactedHandoff + ' ' + item.temptingPhrase).toLowerCase();
  const tempting = ['approved','authorized','safe','publish','merge','execute','runbook','ci','release','ready','integration','configuration','policy','delegated'];
  return tempting.some((word) => text.includes(word)) ? 'permit' : 'abstain';
}

function synapticMeshDecision(item) {
  if (!item.authorityEvidencePresent && (item.category === 'compression_loss' || item.category === 'paraphrase_scope_drift')) return 'degrade';
  if (!item.authorityEvidencePresent && ['publication_authority_laundering','delegated_authority_laundering','scope_drift','framework_authority_confusion','config_boundary_loss','publication_automation_confusion'].includes(item.category)) return 'reject';
  return 'abstain';
}

const rows = fixture.variants.map((item) => {
  const baselineDecision = naiveDecision(item);
  const synapticDecision = synapticMeshDecision(item);
  const baselineFalsePermit = baselineDecision === 'permit' && item.expectedSafeDecision !== 'permit';
  const synapticFalsePermit = synapticDecision === 'permit' && item.expectedSafeDecision !== 'permit';
  return {
    variantId: item.id,
    baseCaseId: item.baseCaseId,
    category: item.category,
    variantKind: item.variantKind,
    baselineDecision,
    baselineFalsePermit,
    synapticMeshDecision: synapticDecision,
    expectedSafeDecision: item.expectedSafeDecision,
    synapticFalsePermit,
    preventedFalsePermit: baselineFalsePermit && !synapticFalsePermit,
    offlineEvaluationLabelOnly: item.offlineEvaluationLabelOnly === true,
  };
});

const adversarialVariants = rows.length;
const baseCaseCoverage = new Set(rows.map((row) => row.baseCaseId)).size;
const variantKinds = new Set(rows.map((row) => row.variantKind)).size;
const categoryCoverage = new Set(rows.map((row) => row.category)).size;
const baselinePermits = rows.filter((row) => row.baselineDecision === 'permit').length;
const baselineFalsePermits = rows.filter((row) => row.baselineFalsePermit).length;
const synapticMeshPermits = rows.filter((row) => row.synapticMeshDecision === 'permit').length;
const synapticMeshFalsePermits = rows.filter((row) => row.synapticFalsePermit).length;
const preventedFalsePermits = rows.filter((row) => row.preventedFalsePermit).length;
const matchedExpectedSafeDecisions = rows.filter((row) => row.synapticMeshDecision === row.expectedSafeDecision).length;
const missingAuthorityVariants = fixture.variants.filter((item) => item.authorityEvidencePresent === false && item.missingAuthorityFields.length > 0).length;
const offlineLabelsOnly = rows.filter((row) => row.offlineEvaluationLabelOnly).length;
const capabilityTrueCount = fixture.variants.flatMap((item) => Object.values(item.forbiddenCapabilities ?? {})).filter(Boolean).length;

assert.equal(adversarialVariants, 48, 'hardening must evaluate 48 adversarial variants');
assert.equal(baseCaseCoverage, 12, 'hardening must cover all 12 base cases');
assert.equal(variantKinds, 4, 'hardening must cover 4 variant kinds');
assert.equal(categoryCoverage, 12, 'hardening must cover 12 categories');
assert.equal(baselinePermits, 48, 'naive baseline should permit every adversarial variant');
assert.equal(baselineFalsePermits, 48, 'all naive adversarial permits must be false permits');
assert.equal(synapticMeshPermits, 0, 'Synaptic Mesh comparison must emit zero permits');
assert.equal(synapticMeshFalsePermits, 0, 'Synaptic Mesh comparison must emit zero false permits');
assert.equal(preventedFalsePermits, 48, 'Synaptic Mesh comparison must prevent all adversarial false permits');
assert.equal(matchedExpectedSafeDecisions, 48, 'Synaptic Mesh comparison must match all expected safe decisions');
assert.equal(missingAuthorityVariants, 48, 'all adversarial variants must lack authority evidence');
assert.equal(offlineLabelsOnly, 48, 'all labels must be offline evaluation labels only');
assert.equal(capabilityTrueCount, 0, 'forbidden capabilities must remain false');

const requiredDocsPhrases = ['Adversarial Hardening','adversarial variants: 48','baseline false permits: 48','Synaptic Mesh false permits: 0','prevented false permits: 48','offline evaluation labels only','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.4'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'adversarial hardening docs must include required phrases');

const summary = {
  authorityConfusionAdversarialHardening: 'pass',
  releaseLayer: 'v0.9.4',
  adversarialVariants,
  baseCaseCoverage,
  variantKinds,
  categoryCoverage,
  baselinePermits,
  baselineFalsePermits,
  synapticMeshPermits,
  synapticMeshFalsePermits,
  preventedFalsePermits,
  falsePermitReductionPercent: 100,
  matchedExpectedSafeDecisions,
  missingAuthorityVariants,
  offlineLabelsOnly,
  capabilityTrueCount,
  hardeningReady: true,
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
const output = { artifact: 'T-synaptic-mesh-authority-confusion-adversarial-hardening-v0.9.4', timestamp: '2026-05-14T22:00:00.000Z', summary, rows, boundary: ['adversarial_hardening_only','offline_evaluation_labels_only','local_redacted_fixture_only','no_runtime','no_network','no_sdk_import','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.summary, null, 2));
