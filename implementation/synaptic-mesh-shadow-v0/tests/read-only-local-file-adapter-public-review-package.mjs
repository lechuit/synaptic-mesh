import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-read-only-local-file-adapter-public-review-package-v0.5.4';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const packageDocPath = resolve(repoRoot, 'docs/read-only-local-file-adapter-public-review-package.md');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-public-review-package.out.json');

const requiredDocs = [
  'docs/status-v0.5.4.md',
  'docs/read-only-local-file-adapter-public-review-package.md',
  'docs/read-only-local-file-adapter-reviewer-runbook.md',
  'docs/read-only-local-file-adapter-canary-runbook.md',
];

const requiredEvidence = [
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-negative-controls.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-failure-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-reviewer-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-public-review-package.out.json',
];

const packageDoc = await readFile(packageDocPath, 'utf8');
const packageDocLower = packageDoc.toLowerCase();
const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));

const missingDocs = [];
for (const doc of requiredDocs) {
  await stat(resolve(repoRoot, doc));
  if (!manifestFilePaths.has(doc)) missingDocs.push(doc);
  assert.ok(packageDoc.includes(doc), `public package must mention ${doc}`);
}

const missingEvidence = [];
for (const evidence of requiredEvidence.filter((entry) => entry !== 'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-public-review-package.out.json')) {
  await stat(resolve(repoRoot, evidence));
  if (!manifestFilePaths.has(evidence)) missingEvidence.push(evidence);
  assert.ok(packageDoc.includes(evidence), `public package must mention ${evidence}`);
}

const requiredPhrases = [
  'This package closes the read-only local-file adapter review phase',
  'It is not permission to connect the adapter to a framework, runtime, agent, watcher, daemon, network source, tool, memory store, config writer, approval path, block/allow path, or enforcement path.',
  'A passing public review package is evidence that this local adapter review phase stayed within boundary.',
  'A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.',
  'The next phase, if any, must be explicitly authorized separately and must not inherit permission from this package.',
];
const forbiddenPhrases = [
  'runtime authorization is granted',
  'framework integration is authorized',
  'agents may consume this as policy',
  'may enforce',
  'production ready',
  'safety certified',
];
const missingRequiredPhrases = requiredPhrases.filter((phrase) => !packageDoc.includes(phrase));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => packageDocLower.includes(phrase.toLowerCase()));

assert.deepEqual(missingDocs, [], 'all required docs must be in MANIFEST.files.json');
assert.deepEqual(missingEvidence, [], 'all required evidence paths must be in MANIFEST.files.json');
assert.deepEqual(missingRequiredPhrases, [], 'public package must include all required phrases');
assert.deepEqual(forbiddenPhraseFindings, [], 'public package must not include forbidden authority phrases');

const adapterEvidence = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[0]), 'utf8'));
const negativeControls = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[1]), 'utf8'));
const canary = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[2]), 'utf8'));
const reproducibility = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[3]), 'utf8'));
const failureCatalog = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[4]), 'utf8'));
const reviewerRunbook = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[5]), 'utf8'));

assert.equal(adapterEvidence.summary.readOnlyLocalFileAdapter, 'pass');
assert.equal(adapterEvidence.summary.sourceFileRead, true);
assert.equal(adapterEvidence.summary.recordOnly, true);
assert.equal(negativeControls.summary.readOnlyLocalFileAdapterNegativeControls, 'pass');
assert.equal(negativeControls.summary.unexpectedAccepts, 0);
assert.equal(negativeControls.summary.sourceFilesRead, 0);
assert.equal(canary.summary.readOnlyLocalFileAdapterCanary, 'pass');
assert.equal(canary.summary.sourceFilesRead, 1);
assert.equal(canary.summary.recordOnly, true);
assert.equal(reproducibility.summary.readOnlyLocalFileAdapterReproducibility, 'pass');
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.decisionTraceHashMismatches, 0);
assert.equal(reproducibility.summary.advisoryReportHashMismatches, 0);
assert.equal(failureCatalog.summary.readOnlyLocalFileAdapterFailureCatalog, 'pass');
assert.equal(failureCatalog.summary.failureCases, 30);
assert.equal(failureCatalog.summary.sourceFilesReadForRejectedCases, 0);
assert.equal(failureCatalog.summary.forbiddenEffects, 0);
assert.equal(failureCatalog.summary.capabilityTrueCount, 0);
assert.equal(reviewerRunbook.summary.readOnlyLocalFileAdapterReviewerRunbook, 'pass');
assert.equal(reviewerRunbook.summary.forbiddenPhraseFindings, 0);

const summary = {
  readOnlyLocalFileAdapterPublicReviewPackage: 'pass',
  adapterImplemented: true,
  frameworkIntegrationAuthorized: false,
  runtimeAuthorized: false,
  toolExecution: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  mayBlock: false,
  mayAllow: false,
  enforcement: false,
};

assert.deepEqual(summary, {
  readOnlyLocalFileAdapterPublicReviewPackage: 'pass',
  adapterImplemented: true,
  frameworkIntegrationAuthorized: false,
  runtimeAuthorized: false,
  toolExecution: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  mayBlock: false,
  mayAllow: false,
  enforcement: false,
});

const output = {
  artifact,
  timestamp: '2026-05-14T06:15:00.000Z',
  summary,
  packageChecks: {
    requiredDocs: requiredDocs.length,
    missingDocs: missingDocs.length,
    requiredEvidence: requiredEvidence.length,
    missingEvidence: missingEvidence.length,
    requiredPhrases: requiredPhrases.length,
    missingRequiredPhrases: missingRequiredPhrases.length,
    forbiddenPhraseFindings: forbiddenPhraseFindings.length,
    failureCases: failureCatalog.summary.failureCases,
    sourceFilesReadForRejectedCases: failureCatalog.summary.sourceFilesReadForRejectedCases,
    reviewerRunbookForbiddenPhraseFindings: reviewerRunbook.summary.forbiddenPhraseFindings,
  },
  boundary: [
    'manual_local_public_review_package_only',
    'adapter_phase_close_only',
    'human_readable_review_evidence_only',
    'not_runtime_authorization',
    'not_machine_policy',
    'not_agent_consumed',
    'no_framework_integration',
    'no_runtime',
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
