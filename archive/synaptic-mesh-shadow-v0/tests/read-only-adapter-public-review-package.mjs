import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/read-only-adapter-public-review-package-v0.4.5.out.json');
const fixturePath = resolve(packageRoot, 'fixtures/read-only-adapter-public-review-package-v0.4.5.json');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const publicPackagePath = resolve(repoRoot, 'docs/read-only-adapter-public-review-package-v0.4.5.md');

const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));
const publicPackage = await readFile(publicPackagePath, 'utf8');

const requiredDocs = [
  'docs/read-only-adapter-boundary-contracts-v0.4.0-alpha.md',
  'docs/read-only-adapter-misuse-failure-catalog-v0.4.1.md',
  'docs/read-only-adapter-reproducibility-drift-gate-v0.4.2.md',
  'docs/read-only-adapter-reviewer-runbook-v0.4.3.md',
  'docs/read-only-adapter-public-review-package-v0.4.5.md',
  'docs/status-v0.4.5.md',
];
const requiredEvidence = [
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-contracts.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-misuse-failure-catalog-v0.4.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-reproducibility-drift-gate-v0.4.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-simulated-v0.4.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-public-review-package-v0.4.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-adapter-public-review-package-v0.4.5.json',
];

for (const filePath of [...requiredDocs, ...requiredEvidence]) {
  await stat(resolve(repoRoot, filePath));
  assert.ok(manifestFilePaths.has(filePath), `MANIFEST.files.json must include ${filePath}`);
}

for (const phrase of [
  'Read-only adapter boundary, design-first',
  'no real adapter implementation',
  'tool execution',
  'memory write',
  'config write',
  'external publication',
  'machine-readable runtime policy',
  'agent-consumed instruction',
  'live traffic capture',
  'framework integration',
  'v0.5.0-alpha',
]) {
  assert.ok(publicPackage.includes(phrase), `public review package must include ${phrase}`);
}

const boundarySpec = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[0]), 'utf8'));
const misuse = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[1]), 'utf8'));
const reproducibility = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[2]), 'utf8'));
const simulated = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[3]), 'utf8'));
const reviewPackage = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(boundarySpec.readOnlyAdapterBoundarySpec, 'pass');
assert.equal(boundarySpec.unexpectedAccepts, 0);
assert.equal(misuse.readOnlyAdapterFailureCatalog, 'pass');
assert.equal(misuse.unexpectedAccepts, 0);
assert.equal(reproducibility.readOnlyAdapterReproducibilityDriftGate, 'pass');
assert.equal(reproducibility.repeatStable, true);
assert.equal(reproducibility.unexpectedDriftAccepts.length, 0);
assert.equal(simulated.readOnlyAdapterSimulated, 'pass');
assert.equal(simulated.adapterReal, false);
assert.equal(simulated.fakeLocalOnly, true);
assert.equal(simulated.outputRecordOnly, true);
assert.equal(reviewPackage.readOnlyAdapterBoundaryDesignFirstPackage, 'pass');
assert.equal(reviewPackage.v040AlphaBoundarySpec, 'pass');
assert.equal(reviewPackage.v041MisuseFailureCatalog, 'pass');
assert.equal(reviewPackage.v042ReproducibilityDriftGate, 'pass');
assert.equal(reviewPackage.v043ReviewerRunbook, 'pass');
assert.equal(reviewPackage.v044SimulatedReadOnlyAdapter, 'pass');

for (const [label, evidence] of Object.entries({ boundarySpec, misuse, reproducibility, simulated, reviewPackage })) {
  assert.equal(evidence.toolExecution, false, `${label} toolExecution must remain false`);
  assert.equal(evidence.memoryWrite, false, `${label} memoryWrite must remain false`);
  assert.equal(evidence.configWrite, false, `${label} configWrite must remain false`);
  assert.equal(evidence.externalPublication, false, `${label} externalPublication must remain false`);
  assert.equal(evidence.machineReadablePolicyDecision, false, `${label} machineReadablePolicyDecision must remain false`);
  assert.equal(evidence.agentConsumed, false, `${label} agentConsumed must remain false`);
  assert.equal(evidence.mayBlock, false, `${label} mayBlock must remain false`);
  assert.equal(evidence.mayAllow, false, `${label} mayAllow must remain false`);
}
assert.equal(reviewPackage.realAdapterAuthorized, false);
assert.equal(reviewPackage.frameworkIntegrationAuthorized, false);
assert.equal(reviewPackage.liveTrafficAuthorized, false);
assert.equal(reviewPackage.approvalEmission, false);
assert.equal(reviewPackage.enforcement, false);

const output = {
  artifact: 'T-synaptic-mesh-read-only-adapter-public-review-package-v0.4.5',
  timestamp: '2026-05-13T16:00:00.000Z',
  summary: {
    verdict: 'pass',
    releaseLayer: 'v0.4.5',
    requiredDocs: requiredDocs.length,
    requiredEvidence: requiredEvidence.length,
    missingDocs: 0,
    missingEvidence: 0,
    readOnlyAdapterBoundaryDesignFirstPackage: 'pass',
    realAdapterAuthorized: false,
    frameworkIntegrationAuthorized: false,
    liveTrafficAuthorized: false,
    toolExecution: false,
    memoryWrite: false,
    configWrite: false,
    externalPublication: false,
    approvalEmission: false,
    machineReadablePolicyDecision: false,
    agentConsumed: false,
    mayBlock: false,
    mayAllow: false,
    enforcement: false,
  },
  boundary: [
    'manual_local_public_review_package_only',
    'explicit_redacted_local_input_only',
    'record_only_evidence',
    'no_real_adapter',
    'no_framework_integration',
    'no_live_traffic',
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
console.log(JSON.stringify(output, null, 2));
