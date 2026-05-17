import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-public-review-package-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-advisory-public-review-package.json');
const packageDocPath = resolve(repoRoot, 'docs/advisory-public-review-package.md');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-public-review-package.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const packageDoc = await readFile(packageDocPath, 'utf8');
const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));

assert.equal(fixture.releaseLayer, 'v0.3.5');
assert.equal(fixture.dependsOn, 'v0.3.4-advisory-reviewer-runbook');
assert.equal(fixture.mode, 'manual_local_advisory_public_review_package_record_only');

const missingEvidence = [];
for (const evidence of fixture.requiredEvidence) {
  await stat(resolve(repoRoot, evidence));
  if (!manifestFilePaths.has(evidence)) missingEvidence.push(evidence);
  assert.ok(packageDoc.includes(evidence.split('/').at(-1)), `public package must mention ${evidence}`);
}

const missingDocs = [];
for (const doc of fixture.requiredDocs) {
  await stat(resolve(repoRoot, doc));
  if (!manifestFilePaths.has(doc)) missingDocs.push(doc);
  assert.ok(packageDoc.includes(doc), `public package must mention ${doc}`);
}

const missingRequiredPhrases = fixture.requiredPhrases.filter((phrase) => !packageDoc.includes(phrase));
const forbiddenPhraseFindings = fixture.forbiddenPhrases.filter((phrase) => packageDoc.toLowerCase().includes(phrase.toLowerCase()));
assert.deepEqual(missingEvidence, [], 'all required evidence paths must be in MANIFEST.files.json');
assert.deepEqual(missingDocs, [], 'all required docs must be in MANIFEST.files.json');
assert.deepEqual(missingRequiredPhrases, [], 'public package must include all required phrases');
assert.deepEqual(forbiddenPhraseFindings, [], 'public package must not include forbidden authority phrases');

const advisory = JSON.parse(await readFile(resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.json'), 'utf8'));
const unicodeGuard = JSON.parse(await readFile(resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json'), 'utf8'));
const failureCatalog = JSON.parse(await readFile(resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json'), 'utf8'));
const reproducibility = JSON.parse(await readFile(resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json'), 'utf8'));
const runbook = JSON.parse(await readFile(resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-reviewer-runbook.out.json'), 'utf8'));

assert.equal(advisory.summary.machineReadablePolicyDecision, false);
assert.equal(advisory.summary.consumedByAgent, false);
assert.equal(advisory.summary.nonAuthoritative, true);
assert.equal(unicodeGuard.summary.textFindings, 0);
assert.equal(unicodeGuard.summary.machineReadableFindings, 0);
assert.equal(failureCatalog.summary.expectedRejects, 12);
assert.equal(failureCatalog.summary.unexpectedAccepts, 0);
assert.equal(reproducibility.summary.runs, 2);
assert.equal(reproducibility.summary.normalizedOutputMismatches, 0);
assert.equal(reproducibility.summary.unexpectedAccepts, 0);
assert.equal(runbook.summary.requiredPhrases, 10);
assert.equal(runbook.summary.requiredSections, 6);
assert.equal(runbook.summary.requiredCommands, 6);
assert.equal(runbook.summary.forbiddenPhraseFindings, 0);

const summary = {
  artifact,
  timestamp: '2026-05-13T06:05:00.000Z',
  advisoryPublicReviewPackage: 'pass',
  verdict: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  mode: fixture.mode,
  requiredEvidence: fixture.requiredEvidence.length,
  missingEvidence: missingEvidence.length,
  requiredDocs: fixture.requiredDocs.length,
  missingDocs: missingDocs.length,
  requiredPhrases: fixture.requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  failureCatalogExpectedRejects: failureCatalog.summary.expectedRejects,
  failureCatalogUnexpectedAccepts: failureCatalog.summary.unexpectedAccepts,
  reproducibilityRuns: reproducibility.summary.runs,
  reproducibilityMismatches: reproducibility.summary.normalizedOutputMismatches,
  runbookRequiredPhrases: runbook.summary.requiredPhrases,
  runbookRequiredSections: runbook.summary.requiredSections,
  runbookRequiredCommands: runbook.summary.requiredCommands,
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
  safetyClaimScope: 'advisory_public_review_package_only_not_authority_not_runtime_not_agent_consumed',
};

assert.equal(summary.missingEvidence, 0);
assert.equal(summary.missingDocs, 0);
assert.equal(summary.missingRequiredPhrases, 0);
assert.equal(summary.forbiddenPhraseFindings, 0);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.consumedByAgent, false);
assert.equal(summary.mayBlock, false);
assert.equal(summary.mayAllow, false);

const output = {
  summary,
  boundary: [
    'manual_local_public_review_package_only',
    'human_readable_review_evidence_only',
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
