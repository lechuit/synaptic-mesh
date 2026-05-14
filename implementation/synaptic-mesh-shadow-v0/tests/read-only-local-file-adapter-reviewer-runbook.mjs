import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-read-only-local-file-adapter-reviewer-runbook-v0.5.3';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const runbookPath = resolve(repoRoot, 'docs/read-only-local-file-adapter-reviewer-runbook.md');
const adapterEvidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json');
const negativeControlsPath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls.out.json');
const canaryPath = resolve(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json');
const reproducibilityPath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-reproducibility.out.json');
const failureCatalogPath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-failure-catalog.out.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-reviewer-runbook.out.json');

const runbook = await readFile(runbookPath, 'utf8');
const runbookLower = runbook.toLowerCase();
const adapterEvidence = JSON.parse(await readFile(adapterEvidencePath, 'utf8'));
const negativeControls = JSON.parse(await readFile(negativeControlsPath, 'utf8'));
const canary = JSON.parse(await readFile(canaryPath, 'utf8'));
const reproducibility = JSON.parse(await readFile(reproducibilityPath, 'utf8'));
const failureCatalog = JSON.parse(await readFile(failureCatalogPath, 'utf8'));

const requiredPhrases = [
  'A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.',
  'one explicit already-redacted local file',
  'record-only evidence',
  'The reviewer is checking boundary preservation, not granting authority.',
  'failureCases: 30',
  'sourceFilesReadForRejectedCases: 0',
  'Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.',
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
  'test:read-only-local-file-adapter-schema',
  'test:read-only-local-file-adapter',
  'test:read-only-local-file-adapter-negative-controls',
  'test:read-only-local-file-adapter-canary',
  'test:read-only-local-file-adapter-reproducibility',
  'test:read-only-local-file-adapter-failure-catalog',
  'test:read-only-local-file-adapter-reviewer-runbook',
  'release:check -- --target v0.5.3',
];

const forbiddenPhrases = [
  'runtime authorization is granted',
  'may enable enforcement',
  'agent may consume as policy',
  'production ready',
  'safety certified',
];

const missingRequiredPhrases = requiredPhrases.filter((phrase) => !runbook.includes(phrase));
const missingRequiredSections = requiredSections.filter((section) => !runbook.includes(`## ${section}`));
const missingCommands = requiredCommands.filter((command) => !runbook.includes(command));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => runbookLower.includes(phrase.toLowerCase()));

assert.deepEqual(missingRequiredPhrases, [], 'reviewer runbook must include all required phrases');
assert.deepEqual(missingRequiredSections, [], 'reviewer runbook must include all required sections');
assert.deepEqual(missingCommands, [], 'reviewer runbook must include all required local commands');
assert.deepEqual(forbiddenPhraseFindings, [], 'reviewer runbook must not include forbidden authority phrases');

assert.equal(adapterEvidence.summary.readOnlyLocalFileAdapter, 'pass');
assert.equal(adapterEvidence.summary.sourceFileRead, true);
assert.equal(adapterEvidence.summary.recordOnly, true);
assert.equal(negativeControls.summary.readOnlyLocalFileAdapterNegativeControls, 'pass');
assert.equal(negativeControls.summary.sourceFilesRead, 0);
assert.equal(negativeControls.summary.unexpectedAccepts, 0);
assert.equal(canary.summary.readOnlyLocalFileAdapterCanary, 'pass');
assert.equal(canary.summary.sourceFilesRead, 1);
assert.equal(canary.summary.recordOnly, true);
assert.equal(reproducibility.summary.readOnlyLocalFileAdapterReproducibility, 'pass');
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.decisionTraceHashMismatches, 0);
assert.equal(reproducibility.summary.advisoryReportHashMismatches, 0);
assert.equal(failureCatalog.summary.readOnlyLocalFileAdapterFailureCatalog, 'pass');
assert.equal(failureCatalog.summary.failureCases, 30);
assert.equal(failureCatalog.summary.unexpectedAccepts, 0);
assert.equal(failureCatalog.summary.sourceFilesReadForRejectedCases, 0);
assert.equal(failureCatalog.summary.forbiddenEffects, 0);
assert.equal(failureCatalog.summary.capabilityTrueCount, 0);

const summary = {
  artifact,
  timestamp: '2026-05-14T05:45:00.000Z',
  readOnlyLocalFileAdapterReviewerRunbook: 'pass',
  verdict: 'pass',
  releaseLayer: 'v0.5.3',
  mode: 'manual_local_read_only_adapter_human_review_runbook_record_only',
  requiredPhrases: requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  requiredSections: requiredSections.length,
  missingRequiredSections: missingRequiredSections.length,
  requiredCommands: requiredCommands.length,
  missingCommands: missingCommands.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  adapterEvidencePass: true,
  negativeControlsPass: true,
  canaryPass: true,
  reproducibilityPass: true,
  failureCatalogPass: true,
  failureCases: failureCatalog.summary.failureCases,
  sourceFilesReadForRejectedCases: failureCatalog.summary.sourceFilesReadForRejectedCases,
  recordOnly: true,
  machineReadablePolicyDecision: false,
  consumedByAgent: false,
  authoritative: false,
  mayApprove: false,
  mayBlock: false,
  mayAllow: false,
  mayAuthorize: false,
  mayEnforce: false,
  runtimeIntegrated: false,
  toolExecutionImplemented: false,
  memoryWriteImplemented: false,
  configWriteImplemented: false,
  externalPublicationImplemented: false,
  approvalPathImplemented: false,
  blockingImplemented: false,
  allowingImplemented: false,
  authorizationImplemented: false,
  enforcementImplemented: false,
  automaticAgentConsumptionImplemented: false,
  safetyClaimScope: 'local_read_only_adapter_human_review_runbook_only_not_runtime_authorization',
};

assert.equal(summary.missingRequiredPhrases, 0);
assert.equal(summary.missingRequiredSections, 0);
assert.equal(summary.missingCommands, 0);
assert.equal(summary.forbiddenPhraseFindings, 0);
assert.equal(summary.failureCases, 30);
assert.equal(summary.sourceFilesReadForRejectedCases, 0);
for (const field of [
  'machineReadablePolicyDecision',
  'consumedByAgent',
  'authoritative',
  'mayApprove',
  'mayBlock',
  'mayAllow',
  'mayAuthorize',
  'mayEnforce',
  'runtimeIntegrated',
  'toolExecutionImplemented',
  'memoryWriteImplemented',
  'configWriteImplemented',
  'externalPublicationImplemented',
  'approvalPathImplemented',
  'blockingImplemented',
  'allowingImplemented',
  'authorizationImplemented',
  'enforcementImplemented',
  'automaticAgentConsumptionImplemented',
]) {
  assert.equal(summary[field], false, `${field} must remain false`);
}

const output = {
  summary,
  boundary: [
    'human_readable_reviewer_runbook_only',
    'local_read_only_boundary_preservation_only',
    'not_runtime_authorization',
    'not_machine_policy',
    'not_agent_consumed',
    'not_mini_receiver',
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
