import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-framework-shaped-adapter-reviewer-runbook-v0.7.4';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const runbookPath = resolve(repoRoot, 'docs/framework-shaped-adapter-reviewer-runbook.md');
const boundaryPath = resolve(packageRoot, 'evidence/framework-shaped-adapter-boundary-schema.out.json');
const hazardPath = resolve(packageRoot, 'evidence/framework-shaped-adapter-hazard-catalog.out.json');
const simulatedPath = resolve(packageRoot, 'evidence/simulated-framework-shaped-adapter.out.json');
const reproducibilityPath = resolve(packageRoot, 'evidence/simulated-framework-shaped-adapter-reproducibility.out.json');
const evidencePath = resolve(packageRoot, 'evidence/framework-shaped-adapter-reviewer-runbook.out.json');

const runbook = await readFile(runbookPath, 'utf8');
const runbookLower = runbook.toLowerCase();
const boundary = JSON.parse(await readFile(boundaryPath, 'utf8'));
const hazard = JSON.parse(await readFile(hazardPath, 'utf8'));
const simulated = JSON.parse(await readFile(simulatedPath, 'utf8'));
const reproducibility = JSON.parse(await readFile(reproducibilityPath, 'utf8'));

const requiredPhrases = [
  'A passing framework-shaped adapter review is evidence of local boundary preservation, not runtime authorization.',
  'fake/local/already-redacted fixtures only',
  'committed record-only evidence only',
  'The reviewer is checking boundary preservation, not granting authority.',
  'pipelineRunsForRejectedCases: 0',
  'sourceReadsForRejectedCases: 0',
  'successOutputsForRejectedCases: 0',
  'classifierCompactAllowedTrue: 0',
  'normalizedOutputMismatches: 0',
  'baselineMismatches: 0',
  'Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.',
  'Do not convert this runbook into machine-readable policy or agent instructions.',
];

const requiredSections = [
  'Status',
  'Purpose',
  'Required evidence before review',
  'Allowed review scope',
  'What pass means',
  'What pass does not mean',
  'How to run the local review',
  'Human checklist',
  'Abort conditions',
  'Reporting',
];

const requiredCommands = [
  'verify:manifest',
  'check',
  'review:local',
  'test:framework-shaped-adapter-boundary-schema',
  'test:framework-shaped-adapter-hazard-catalog',
  'test:simulated-framework-shaped-adapter',
  'test:simulated-framework-shaped-adapter-reproducibility',
  'test:framework-shaped-adapter-reviewer-runbook',
  'release:check -- --target v0.7.4',
];

const forbiddenPhrases = [
  'runtime authorization is granted',
  'may enable enforcement',
  'agent may consume as policy',
  'production ready',
  'safety certified',
  'real framework integration is approved',
];

const missingRequiredPhrases = requiredPhrases.filter((phrase) => !runbook.includes(phrase));
const missingRequiredSections = requiredSections.filter((section) => !runbook.includes(`## ${section}`));
const missingCommands = requiredCommands.filter((command) => !runbook.includes(command));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => runbookLower.includes(phrase.toLowerCase()));

assert.deepEqual(missingRequiredPhrases, [], 'framework reviewer runbook must include all required phrases');
assert.deepEqual(missingRequiredSections, [], 'framework reviewer runbook must include all required sections');
assert.deepEqual(missingCommands, [], 'framework reviewer runbook must include all required local commands');
assert.deepEqual(forbiddenPhraseFindings, [], 'framework reviewer runbook must not include forbidden authority phrases');

assert.equal(boundary.summary.frameworkShapedAdapterBoundarySchema, 'pass');
assert.equal(boundary.summary.positiveCases, 2);
assert.equal(boundary.summary.negativeCases, 10);
assert.equal(boundary.summary.unexpectedAccepts, 0);
assert.equal(hazard.summary.frameworkAdapterHazardCatalog, 'pass');
assert.equal(hazard.summary.hazardCases, 25);
assert.equal(hazard.summary.rejectedOrDowngraded, 25);
assert.equal(hazard.summary.unexpectedAccepts, 0);
assert.equal(hazard.summary.pipelineRunsForRejectedCases, 0);
assert.equal(hazard.summary.sourceReadsForRejectedCases, 0);
assert.equal(hazard.summary.successOutputsForRejectedCases, 0);
assert.equal(simulated.summary.simulatedFrameworkShapedAdapter, 'pass');
assert.equal(simulated.summary.positiveCases, 2);
assert.equal(simulated.summary.parserEvidenceProduced, 2);
assert.equal(simulated.summary.classifierDecisionsProduced, 2);
assert.equal(simulated.summary.classifierCompactAllowedTrue, 0);
assert.equal(simulated.summary.decisionTracesProduced, 2);
assert.equal(simulated.summary.advisoryReportsProduced, 2);
assert.equal(reproducibility.summary.simulatedFrameworkAdapterReproducibility, 'pass');
assert.equal(reproducibility.summary.runs, 2);
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.baselineMismatches, 0);
assert.equal(reproducibility.summary.negativeControls, 8);
assert.equal(reproducibility.summary.unexpectedAccepts, 0);
assert.equal(reproducibility.summary.expectedReasonCodeMisses, 0);
assert.equal(reproducibility.summary.classifierCompactAllowedTrue, 0);

const summary = {
  artifact,
  timestamp: '2026-05-14T16:20:00.000Z',
  frameworkShapedAdapterReviewerRunbook: 'pass',
  verdict: 'pass',
  releaseLayer: 'v0.7.4',
  mode: 'manual_local_framework_shaped_adapter_human_review_runbook_record_only',
  requiredPhrases: requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  requiredSections: requiredSections.length,
  missingRequiredSections: missingRequiredSections.length,
  requiredCommands: requiredCommands.length,
  missingCommands: missingCommands.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  boundaryEvidencePass: true,
  hazardCatalogPass: true,
  simulatedAdapterPass: true,
  reproducibilityPass: true,
  hazardCases: hazard.summary.hazardCases,
  rejectedOrDowngraded: hazard.summary.rejectedOrDowngraded,
  pipelineRunsForRejectedCases: hazard.summary.pipelineRunsForRejectedCases,
  sourceReadsForRejectedCases: hazard.summary.sourceReadsForRejectedCases,
  successOutputsForRejectedCases: hazard.summary.successOutputsForRejectedCases,
  positiveCases: simulated.summary.positiveCases,
  classifierCompactAllowedTrue: simulated.summary.classifierCompactAllowedTrue,
  reproducibilityRuns: reproducibility.summary.runs,
  normalizedOutputMismatches: reproducibility.summary.normalizedOutputMismatches,
  baselineMismatches: reproducibility.summary.baselineMismatches,
  driftControls: reproducibility.summary.negativeControls,
  unexpectedAccepts: reproducibility.summary.unexpectedAccepts,
  expectedReasonCodeMisses: reproducibility.summary.expectedReasonCodeMisses,
  recordOnly: true,
  realFrameworkIntegration: false,
  sdkImported: false,
  networkAllowed: false,
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
  safetyClaimScope: 'framework_shaped_adapter_human_review_runbook_only_not_runtime_authorization',
};

for (const field of [
  'missingRequiredPhrases',
  'missingRequiredSections',
  'missingCommands',
  'forbiddenPhraseFindings',
  'pipelineRunsForRejectedCases',
  'sourceReadsForRejectedCases',
  'successOutputsForRejectedCases',
  'classifierCompactAllowedTrue',
  'normalizedOutputMismatches',
  'baselineMismatches',
  'unexpectedAccepts',
  'expectedReasonCodeMisses',
]) assert.equal(summary[field], 0, `${field} must be zero`);

for (const field of [
  'realFrameworkIntegration',
  'sdkImported',
  'networkAllowed',
  'liveTrafficAllowed',
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
]) assert.equal(summary[field], false, `${field} must remain false`);

const output = {
  summary,
  boundary: [
    'human_readable_reviewer_runbook_only',
    'framework_shaped_boundary_preservation_only',
    'fake_local_redacted_fixture_only',
    'committed_record_only_evidence_only',
    'not_runtime_authorization',
    'not_machine_policy',
    'not_agent_consumed',
    'no_real_framework_integration',
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
