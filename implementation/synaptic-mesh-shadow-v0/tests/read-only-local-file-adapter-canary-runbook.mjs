import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-canary-runbook.json');
const runbookPath = resolve(repoRoot, 'docs/read-only-local-file-adapter-canary-runbook.md');
const canaryEvidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json');
const negativeControlsPath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls.out.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-canary-runbook.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const runbook = await readFile(runbookPath, 'utf8');
const runbookLower = runbook.toLowerCase();
const canaryEvidence = JSON.parse(await readFile(canaryEvidencePath, 'utf8'));
const negativeControls = JSON.parse(await readFile(negativeControlsPath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.5.0-alpha-pr5');
assert.equal(fixture.mode, 'manual_local_read_only_adapter_canary_runbook_record_only');
assert.deepEqual(fixture.dependsOn, [
  'v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls',
  'v0.5.0-alpha-pr4-read-only-local-file-adapter-canary',
]);
assert.deepEqual(fixture.dependsOnLabels, ['PR #3 negative controls', 'PR #4 positive canary']);
assert.deepEqual(fixture.dependsOnSlugs, [
  'v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls',
  'v0.5.0-alpha-pr4-read-only-local-file-adapter-canary',
]);
for (const dependencyText of [...fixture.dependsOnLabels, ...fixture.dependsOnSlugs]) {
  assert.ok(runbook.includes(dependencyText), `runbook must explicitly include ${dependencyText}`);
}

const missingRequiredPhrases = fixture.requiredPhrases.filter((phrase) => !runbook.includes(phrase));
const missingRequiredSections = fixture.requiredSections.filter((section) => !runbook.includes(`## ${section}`));
const forbiddenPhraseFindings = fixture.forbiddenPhrases.filter((phrase) => runbookLower.includes(phrase.toLowerCase()));
const missingCommands = fixture.requiredCommands.filter((command) => !runbook.includes(command));

assert.deepEqual(missingRequiredPhrases, [], 'adapter canary runbook must include all required phrases');
assert.deepEqual(missingRequiredSections, [], 'adapter canary runbook must include all required sections');
assert.deepEqual(forbiddenPhraseFindings, [], 'adapter canary runbook must not include forbidden authority phrases');
assert.deepEqual(missingCommands, [], 'adapter canary runbook must include all required local commands');

assert.equal(canaryEvidence.summary.readOnlyLocalFileAdapterCanary, 'pass');
assert.equal(canaryEvidence.summary.positiveCases, 1);
assert.equal(canaryEvidence.summary.sourceFilesRead, 1);
assert.equal(canaryEvidence.summary.recordOnly, true);
assert.equal(canaryEvidence.summary.parserEvidenceProduced, true);
assert.equal(canaryEvidence.summary.classifierDecisionProduced, true);
assert.equal(canaryEvidence.summary.decisionTraceProduced, true);
assert.equal(canaryEvidence.summary.advisoryReportProduced, true);
assert.equal(canaryEvidence.summary.rawClassifierDecisionPersisted, false);
assert.equal(canaryEvidence.summary.forbiddenEffects, 0);
assert.equal(canaryEvidence.summary.capabilityTrueCount, 0);
assert.equal(canaryEvidence.summary.rawClassifierLeakFindings, 0);
assert.equal(negativeControls.summary.readOnlyLocalFileAdapterNegativeControls, 'pass');
assert.equal(negativeControls.summary.negativeCases, 17);
assert.equal(negativeControls.summary.unexpectedAccepts, 0);
assert.equal(negativeControls.summary.sourceFilesRead, 0);
assert.equal(negativeControls.summary.forbiddenEffects, 0);
assert.equal(negativeControls.summary.capabilityTrueCount, 0);

const summary = {
  artifact: 'T-synaptic-mesh-read-only-local-file-adapter-canary-runbook-v0.5.0-alpha-pr5',
  timestamp: '2026-05-13T23:55:00.000Z',
  readOnlyLocalFileAdapterCanaryRunbook: 'pass',
  verdict: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  dependsOnLabels: fixture.dependsOnLabels,
  dependsOnSlugs: fixture.dependsOnSlugs,
  dependsOnNegativeControls: fixture.dependsOn.includes('v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls') && fixture.dependsOnLabels.includes('PR #3 negative controls'),
  dependsOnPositiveCanary: fixture.dependsOn.includes('v0.5.0-alpha-pr4-read-only-local-file-adapter-canary') && fixture.dependsOnLabels.includes('PR #4 positive canary'),
  releaseCheckDeferredToPr6: runbook.includes('This final release command is intentionally not an applicable PR #5 gate while `MANIFEST.json` still targets `v0.4.8`'),
  mode: fixture.mode,
  requiredPhrases: fixture.requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  requiredSections: fixture.requiredSections.length,
  missingRequiredSections: missingRequiredSections.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  requiredCommands: fixture.requiredCommands.length,
  missingCommands: missingCommands.length,
  positiveCanaryPass: true,
  positiveCases: canaryEvidence.summary.positiveCases,
  positiveSourceFilesRead: canaryEvidence.summary.sourceFilesRead,
  negativeControlsPass: true,
  negativeCases: negativeControls.summary.negativeCases,
  negativeUnexpectedAccepts: negativeControls.summary.unexpectedAccepts,
  negativeSourceFilesRead: negativeControls.summary.sourceFilesRead,
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
  safetyClaimScope: 'local_read_only_boundary_preservation_only_not_runtime_authorization',
};

assert.equal(summary.missingRequiredPhrases, 0);
assert.equal(summary.missingRequiredSections, 0);
assert.equal(summary.forbiddenPhraseFindings, 0);
assert.equal(summary.missingCommands, 0);
assert.equal(summary.dependsOnNegativeControls, true);
assert.equal(summary.dependsOnPositiveCanary, true);
assert.deepEqual(summary.dependsOnLabels, ['PR #3 negative controls', 'PR #4 positive canary']);
assert.deepEqual(summary.dependsOnSlugs, [
  'v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls',
  'v0.5.0-alpha-pr4-read-only-local-file-adapter-canary',
]);
assert.equal(summary.releaseCheckDeferredToPr6, true);
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
    'human_readable_runbook_only',
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
    'no_enforcement'
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
