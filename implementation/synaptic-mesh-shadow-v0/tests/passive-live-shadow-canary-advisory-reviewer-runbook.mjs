import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-reviewer-runbook-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-advisory-reviewer-runbook.json');
const runbookPath = resolve(repoRoot, 'docs/advisory-report-reviewer-runbook.md');
const advisoryEvidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.json');
const failureCatalogPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json');
const reproducibilityPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json');
const unicodeGuardPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-reviewer-runbook.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const runbook = await readFile(runbookPath, 'utf8');
const advisoryEvidence = JSON.parse(await readFile(advisoryEvidencePath, 'utf8'));
const failureCatalog = JSON.parse(await readFile(failureCatalogPath, 'utf8'));
const reproducibility = JSON.parse(await readFile(reproducibilityPath, 'utf8'));
const unicodeGuard = JSON.parse(await readFile(unicodeGuardPath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.3.4');
assert.equal(fixture.dependsOn, 'v0.3.3-advisory-report-reproducibility');
assert.equal(fixture.mode, 'manual_local_advisory_reviewer_runbook_record_only');

const missingRequiredPhrases = fixture.requiredPhrases.filter((phrase) => !runbook.includes(phrase));
const missingRequiredSections = fixture.requiredSections.filter((section) => !runbook.includes(`## ${section}`));
const forbiddenPhraseFindings = fixture.forbiddenPhrases.filter((phrase) => runbook.toLowerCase().includes(phrase.toLowerCase()));

assert.deepEqual(missingRequiredPhrases, [], 'runbook must include all required phrases');
assert.deepEqual(missingRequiredSections, [], 'runbook must include all required sections');
assert.deepEqual(forbiddenPhraseFindings, [], 'runbook must not include forbidden authority phrases');

assert.equal(advisoryEvidence.summary.machineReadablePolicyDecision, false);
assert.equal(advisoryEvidence.summary.consumedByAgent, false);
assert.equal(advisoryEvidence.summary.automaticAgentConsumptionImplemented, false);
assert.equal(failureCatalog.summary.advisoryReportFailureCatalog, 'pass');
assert.equal(failureCatalog.summary.unexpectedAccepts, 0);
assert.equal(failureCatalog.summary.expectedRejects, 12);
assert.equal(reproducibility.summary.advisoryReportReproducibility, 'pass');
assert.equal(reproducibility.summary.runs, 2);
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.unexpectedAccepts, 0);
assert.equal(unicodeGuard.summary.verdict, 'pass');
assert.equal(unicodeGuard.summary.textFindings, 0);
assert.equal(unicodeGuard.summary.machineReadableFindings, 0);

const requiredCommands = [
  'test:passive-live-shadow-canary-advisory-report',
  'test:passive-live-shadow-canary-advisory-unicode-bidi-guard',
  'test:passive-live-shadow-canary-advisory-report-failure-catalog',
  'test:passive-live-shadow-canary-advisory-report-reproducibility',
  'review:local',
  'release:check -- --target v0.3.4',
];
const missingCommands = requiredCommands.filter((command) => !runbook.includes(command));
assert.deepEqual(missingCommands, [], 'runbook must include all required local commands');

const summary = {
  artifact,
  timestamp: '2026-05-13T05:35:00.000Z',
  advisoryReviewerRunbook: 'pass',
  verdict: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  mode: fixture.mode,
  requiredPhrases: fixture.requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  requiredSections: fixture.requiredSections.length,
  missingRequiredSections: missingRequiredSections.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  requiredCommands: requiredCommands.length,
  missingCommands: missingCommands.length,
  failureCatalogExpectedRejects: failureCatalog.summary.expectedRejects,
  failureCatalogUnexpectedAccepts: failureCatalog.summary.unexpectedAccepts,
  reproducibilityRuns: reproducibility.summary.runs,
  reproducibilityMismatches: reproducibility.summary.normalizedOutputMismatches,
  unicodeTextFindings: unicodeGuard.summary.textFindings,
  unicodeMachineReadableFindings: unicodeGuard.summary.machineReadableFindings,
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
  safetyClaimScope: 'advisory_reviewer_runbook_only_not_authority_not_runtime_not_agent_consumed',
};

assert.equal(summary.missingRequiredPhrases, 0);
assert.equal(summary.missingRequiredSections, 0);
assert.equal(summary.forbiddenPhraseFindings, 0);
assert.equal(summary.missingCommands, 0);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.consumedByAgent, false);
assert.equal(summary.mayBlock, false);
assert.equal(summary.mayAllow, false);

const output = {
  summary,
  boundary: [
    'manual_local_reviewer_runbook_only',
    'human_readable_guidance_only',
    'not_authority',
    'not_machine_policy',
    'not_agent_consumed',
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

if (summary.verdict !== 'pass') process.exit(1);
