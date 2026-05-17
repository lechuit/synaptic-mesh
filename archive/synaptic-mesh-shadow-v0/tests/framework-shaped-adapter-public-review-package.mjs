import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-framework-shaped-adapter-public-review-package-v0.7.5';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const packageDocPath = resolve(repoRoot, 'docs/framework-shaped-adapter-public-review-package.md');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const evidencePath = resolve(packageRoot, 'evidence/framework-shaped-adapter-public-review-package.out.json');

const requiredDocs = [
  'docs/status-v0.7.5.md',
  'docs/framework-shaped-adapter-public-review-package.md',
  'docs/framework-shaped-adapter-boundary.md',
  'docs/framework-shaped-adapter-hazard-catalog.md',
  'docs/simulated-framework-shaped-adapter.md',
  'docs/simulated-framework-shaped-adapter-reproducibility.md',
  'docs/framework-shaped-adapter-reviewer-runbook.md',
];

const requiredEvidence = [
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-boundary-schema.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-hazard-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/simulated-framework-shaped-adapter.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/simulated-framework-shaped-adapter-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-reviewer-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-public-review-package.out.json',
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
for (const evidence of requiredEvidence.filter((entry) => entry !== 'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-public-review-package.out.json')) {
  await stat(resolve(repoRoot, evidence));
  if (!manifestFilePaths.has(evidence)) missingEvidence.push(evidence);
  assert.ok(packageDoc.includes(evidence), `public package must mention ${evidence}`);
}

const requiredPhrases = [
  'This package closes the `v0.7.x` framework-shaped adapter review phase',
  'No real adapter exists in this line.',
  'A passing public review package is evidence that this framework-shaped adapter review phase stayed within boundary.',
  'It is not permission to connect the shape to MCP, LangGraph, A2A, GitHub bot, a framework SDK, runtime, agent, watcher, daemon, network source, resource fetch, tool, memory store, config writer, approval path, block/allow path, authorization path, or enforcement path.',
  'A passing framework-shaped adapter review is evidence of local boundary preservation, not runtime authorization.',
  'A later phase, if any, must be explicitly authorized separately and must not inherit permission from this package.',
];
const forbiddenPhrases = [
  'runtime authorization is granted',
  'framework integration is authorized',
  'agents may consume this as policy',
  'may enforce',
  'production ready',
  'safety certified',
  'real framework integration is approved',
];
const missingRequiredPhrases = requiredPhrases.filter((phrase) => !packageDoc.includes(phrase));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => packageDocLower.includes(phrase.toLowerCase()));

assert.deepEqual(missingDocs, [], 'all required docs must be in MANIFEST.files.json');
assert.deepEqual(missingEvidence, [], 'all required evidence paths must be in MANIFEST.files.json');
assert.deepEqual(missingRequiredPhrases, [], 'public package must include all required phrases');
assert.deepEqual(forbiddenPhraseFindings, [], 'public package must not include forbidden authority phrases');

const boundary = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[0]), 'utf8'));
const hazard = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[1]), 'utf8'));
const simulated = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[2]), 'utf8'));
const reproducibility = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[3]), 'utf8'));
const reviewerRunbook = JSON.parse(await readFile(resolve(repoRoot, requiredEvidence[4]), 'utf8'));

assert.equal(boundary.summary.frameworkShapedAdapterBoundarySchema, 'pass');
assert.equal(boundary.summary.schemaOnly, true);
assert.equal(boundary.summary.realAdapterImplemented, false);
assert.equal(boundary.summary.positiveCases, 2);
assert.equal(boundary.summary.negativeCases, 10);
assert.equal(boundary.summary.unexpectedAccepts, 0);
assert.equal(boundary.summary.realFrameworkIntegration, false);
assert.equal(boundary.summary.sdkImported, false);
assert.equal(boundary.summary.networkAllowed, false);
assert.equal(boundary.summary.authorizationAllowed, false);
assert.equal(boundary.summary.enforcementAllowed, false);

assert.equal(hazard.summary.frameworkAdapterHazardCatalog, 'pass');
assert.equal(hazard.summary.hazardCases, 25);
assert.equal(hazard.summary.rejectedOrDowngraded, 25);
assert.equal(hazard.summary.unexpectedAccepts, 0);
assert.equal(hazard.summary.pipelineRunsForRejectedCases, 0);
assert.equal(hazard.summary.sourceReadsForRejectedCases, 0);
assert.equal(hazard.summary.successOutputsForRejectedCases, 0);
assert.equal(hazard.summary.authorization, false);
assert.equal(hazard.summary.enforcement, false);

assert.equal(simulated.summary.simulatedFrameworkShapedAdapter, 'pass');
assert.equal(simulated.summary.positiveCases, 2);
assert.deepEqual(simulated.summary.frameworkKinds, ['mcp_like', 'langgraph_like']);
assert.equal(simulated.summary.parserEvidenceProduced, 2);
assert.equal(simulated.summary.classifierDecisionsProduced, 2);
assert.equal(simulated.summary.classifierCompactAllowedTrue, 0);
assert.equal(simulated.summary.decisionTracesProduced, 2);
assert.equal(simulated.summary.advisoryReportsProduced, 2);
assert.equal(simulated.summary.agentConsumed, false);
assert.equal(simulated.summary.machineReadablePolicyDecision, false);
assert.equal(simulated.summary.authorization, false);
assert.equal(simulated.summary.enforcement, false);

assert.equal(reproducibility.summary.simulatedFrameworkAdapterReproducibility, 'pass');
assert.equal(reproducibility.summary.runs, 2);
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.baselineMismatches, 0);
assert.equal(reproducibility.summary.negativeControls, 8);
assert.equal(reproducibility.summary.unexpectedAccepts, 0);
assert.equal(reproducibility.summary.expectedReasonCodeMisses, 0);
assert.equal(reproducibility.summary.classifierCompactAllowedTrue, 0);
assert.equal(reproducibility.summary.authorization, false);
assert.equal(reproducibility.summary.enforcement, false);

assert.equal(reviewerRunbook.summary.frameworkShapedAdapterReviewerRunbook, 'pass');
assert.equal(reviewerRunbook.summary.missingRequiredPhrases, 0);
assert.equal(reviewerRunbook.summary.missingRequiredSections, 0);
assert.equal(reviewerRunbook.summary.missingCommands, 0);
assert.equal(reviewerRunbook.summary.forbiddenPhraseFindings, 0);
assert.equal(reviewerRunbook.summary.machineReadablePolicyDecision, false);
assert.equal(reviewerRunbook.summary.agentConsumed, false);
assert.equal(reviewerRunbook.summary.authorization, false);
assert.equal(reviewerRunbook.summary.enforcement, false);

const summary = {
  frameworkShapedAdapterPublicReviewPackage: 'pass',
  releaseLayer: 'v0.7.5',
  phaseClosed: true,
  realAdapterImplemented: false,
  frameworkIntegrationAuthorized: false,
  runtimeAuthorized: false,
  positiveCases: simulated.summary.positiveCases,
  hazardCases: hazard.summary.hazardCases,
  rejectedOrDowngraded: hazard.summary.rejectedOrDowngraded,
  pipelineRunsForRejectedCases: hazard.summary.pipelineRunsForRejectedCases,
  sourceReadsForRejectedCases: hazard.summary.sourceReadsForRejectedCases,
  successOutputsForRejectedCases: hazard.summary.successOutputsForRejectedCases,
  classifierCompactAllowedTrue: simulated.summary.classifierCompactAllowedTrue,
  reproducibilityRuns: reproducibility.summary.runs,
  normalizedOutputMismatches: reproducibility.summary.normalizedOutputMismatches,
  baselineMismatches: reproducibility.summary.baselineMismatches,
  driftControls: reproducibility.summary.negativeControls,
  unexpectedAccepts: reproducibility.summary.unexpectedAccepts,
  expectedReasonCodeMisses: reproducibility.summary.expectedReasonCodeMisses,
  requiredDocs: requiredDocs.length,
  missingDocs: missingDocs.length,
  requiredEvidence: requiredEvidence.length,
  missingEvidence: missingEvidence.length,
  requiredPhrases: requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  reviewerRunbookForbiddenPhraseFindings: reviewerRunbook.summary.forbiddenPhraseFindings,
  recordOnly: true,
  toolExecution: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
};

assert.deepEqual(summary, {
  frameworkShapedAdapterPublicReviewPackage: 'pass',
  releaseLayer: 'v0.7.5',
  phaseClosed: true,
  realAdapterImplemented: false,
  frameworkIntegrationAuthorized: false,
  runtimeAuthorized: false,
  positiveCases: 2,
  hazardCases: 25,
  rejectedOrDowngraded: 25,
  pipelineRunsForRejectedCases: 0,
  sourceReadsForRejectedCases: 0,
  successOutputsForRejectedCases: 0,
  classifierCompactAllowedTrue: 0,
  reproducibilityRuns: 2,
  normalizedOutputMismatches: 0,
  baselineMismatches: 0,
  driftControls: 8,
  unexpectedAccepts: 0,
  expectedReasonCodeMisses: 0,
  requiredDocs: 7,
  missingDocs: 0,
  requiredEvidence: 6,
  missingEvidence: 0,
  requiredPhrases: 6,
  missingRequiredPhrases: 0,
  forbiddenPhraseFindings: 0,
  reviewerRunbookForbiddenPhraseFindings: 0,
  recordOnly: true,
  toolExecution: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
});

const output = {
  artifact,
  timestamp: '2026-05-14T16:55:00.000Z',
  summary,
  packageChecks: {
    requiredDocs: requiredDocs.length,
    missingDocs: missingDocs.length,
    requiredEvidence: requiredEvidence.length,
    missingEvidence: missingEvidence.length,
    requiredPhrases: requiredPhrases.length,
    missingRequiredPhrases: missingRequiredPhrases.length,
    forbiddenPhraseFindings: forbiddenPhraseFindings.length,
    reviewerRunbookForbiddenPhraseFindings: reviewerRunbook.summary.forbiddenPhraseFindings,
  },
  boundary: [
    'manual_local_public_review_package_only',
    'framework_shaped_phase_close_only',
    'human_readable_review_evidence_only',
    'fake_local_redacted_fixture_only',
    'record_only_evidence_only',
    'no_real_adapter',
    'not_runtime_authorization',
    'not_machine_policy',
    'not_agent_consumed',
    'no_framework_integration',
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
