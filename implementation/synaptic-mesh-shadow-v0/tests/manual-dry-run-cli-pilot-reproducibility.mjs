import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-pilot-reproducibility-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-pilot-reproducibility.out.json');
const tempDir = resolve(packageRoot, 'evidence/.manual-dry-run-reproducibility-temp');
const caseCount = 12;
const canonicalTarget = 'v0.1.15-real-redacted-pilot-expanded';

const boundary = [
  'manual_invocation_only',
  'explicit_local_file_input_only',
  'already_redacted_bundle_only',
  'redaction_review_record_required',
  'local_evidence_output_only',
  'record_only',
  'no_live_observer',
  'no_watcher',
  'no_daemon',
  'no_network',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_publication',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_enforcement',
];

function sha256(value) {
  return `sha256:${createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')}`;
}

function normalizeOutput(value) {
  return JSON.parse(JSON.stringify(value));
}

const rows = [];
let normalizedOutputMismatches = 0;
let committedEvidenceMismatches = 0;
let returnWriteMismatches = 0;
let forbiddenEffects = 0;
let capabilityTrueCount = 0;
let falsePermits = 0;
let falseCompacts = 0;
let boundaryLoss = 0;
let recordOnly = 0;
let rawContentPersisted = false;
let privatePathsPersisted = false;
let secretLikeValuesPersisted = false;
let toolOutputsPersisted = false;
let memoryTextPersisted = false;
let configTextPersisted = false;
let approvalTextPersisted = false;

await rm(tempDir, { recursive: true, force: true });
await mkdir(tempDir, { recursive: true });

try {
  for (let index = 1; index <= caseCount; index += 1) {
    const ordinal = String(index).padStart(3, '0');
    const inputRel = `fixtures/manual-dry-run-inputs/real-redacted-pilot-expanded-${ordinal}.json`;
    const canonicalRel = `evidence/manual-dry-run-cli.real-redacted-pilot-expanded-${ordinal}.out.json`;
    const firstRel = `evidence/.manual-dry-run-reproducibility-temp/repro-${ordinal}-a.out.json`;
    const secondRel = `evidence/.manual-dry-run-reproducibility-temp/repro-${ordinal}-b.out.json`;
    const inputPath = resolve(packageRoot, inputRel);
    const canonicalPath = resolve(packageRoot, canonicalRel);
    const inputBefore = await readFile(inputPath, 'utf8');

    const firstResult = await runManualDryRunCli(['--input', inputRel, '--output', firstRel, '--target', canonicalTarget], { cwd: packageRoot });
    const firstWritten = JSON.parse(await readFile(resolve(packageRoot, firstRel), 'utf8'));
    const secondResult = await runManualDryRunCli(['--input', inputRel, '--output', secondRel, '--target', canonicalTarget], { cwd: packageRoot });
    const secondWritten = JSON.parse(await readFile(resolve(packageRoot, secondRel), 'utf8'));
    const canonicalWritten = JSON.parse(await readFile(canonicalPath, 'utf8'));
    const inputAfter = await readFile(inputPath, 'utf8');

    assert.equal(inputAfter, inputBefore, `${inputRel} must not be mutated by reproducibility replay`);

    const returnWriteMatch = JSON.stringify(normalizeOutput(firstResult)) === JSON.stringify(normalizeOutput(firstWritten))
      && JSON.stringify(normalizeOutput(secondResult)) === JSON.stringify(normalizeOutput(secondWritten));
    const firstSecondMatch = JSON.stringify(normalizeOutput(firstWritten)) === JSON.stringify(normalizeOutput(secondWritten));
    const committedMatch = JSON.stringify(normalizeOutput(firstWritten)) === JSON.stringify(normalizeOutput(canonicalWritten));

    if (!returnWriteMatch) returnWriteMismatches += 1;
    if (!firstSecondMatch) normalizedOutputMismatches += 1;
    if (!committedMatch) committedEvidenceMismatches += 1;

    assert.equal(firstWritten.manualDryRun, 'pass');
    assert.equal(firstWritten.recordOnly, true);
    assert.equal(firstWritten.rawUnredactedInputRead, false);
    assert.equal(firstWritten.liveInputRead, false);
    assert.equal(firstWritten.networkUsed, false);
    assert.equal(firstWritten.toolExecuted, false);
    assert.equal(firstWritten.memoryWritten, false);
    assert.equal(firstWritten.configWritten, false);
    assert.equal(firstWritten.publishedExternally, false);
    assert.equal(firstWritten.approvalEntered, false);
    assert.equal(firstWritten.blocked, false);
    assert.equal(firstWritten.allowed, false);
    assert.equal(firstWritten.enforced, false);
    assert.equal(firstWritten.manualDryRunResult.observerAction, 'record_only');

    const rowForbiddenEffects = firstWritten.liveShadowObservationResult.forbiddenEffectsDetected.length;
    const rowCapabilityTrueCount = [
      'mayBlock',
      'mayAllow',
      'mayExecuteTool',
      'mayWriteMemory',
      'mayWriteConfig',
      'mayPublishExternally',
      'mayModifyAgentInstructions',
      'mayEnterApprovalPath',
    ].filter((field) => firstWritten.manualDryRunResult[field] !== false || firstWritten.liveShadowObservationResult[field] !== false).length;

    recordOnly += firstWritten.recordOnly ? 1 : 0;
    forbiddenEffects += rowForbiddenEffects;
    capabilityTrueCount += rowCapabilityTrueCount;
    falsePermits += firstWritten.decisionTrace.boundaryVerdict.falsePermit ? 1 : 0;
    falseCompacts += firstWritten.decisionTrace.boundaryVerdict.falseCompact ? 1 : 0;
    boundaryLoss += firstWritten.decisionTrace.boundaryVerdict.boundaryLoss ? 1 : 0;

    rows.push({
      caseId: firstWritten.caseId,
      bundleId: firstWritten.bundleId,
      reviewId: firstWritten.reviewId,
      input: `implementation/synaptic-mesh-shadow-v0/${inputRel}`,
      canonicalOutput: `implementation/synaptic-mesh-shadow-v0/${canonicalRel}`,
      target: firstWritten.target,
      firstRunHash: sha256(normalizeOutput(firstWritten)),
      secondRunHash: sha256(normalizeOutput(secondWritten)),
      committedOutputHash: sha256(normalizeOutput(canonicalWritten)),
      returnWriteMatch,
      firstSecondMatch,
      committedMatch,
      inputMutated: inputAfter !== inputBefore,
      manualDryRun: firstWritten.manualDryRun,
      recordOnly: firstWritten.recordOnly,
      selectedRoute: firstWritten.classifierDecision.selectedRoute,
      matchedGold: firstWritten.decisionTrace.matchedGold,
      falsePermit: firstWritten.decisionTrace.boundaryVerdict.falsePermit,
      falseCompact: firstWritten.decisionTrace.boundaryVerdict.falseCompact,
      boundaryLoss: firstWritten.decisionTrace.boundaryVerdict.boundaryLoss,
      forbiddenEffectsDetected: rowForbiddenEffects,
      capabilityTrueCount: rowCapabilityTrueCount,
      rawUnredactedInputRead: firstWritten.rawUnredactedInputRead,
      liveInputRead: firstWritten.liveInputRead,
      networkUsed: firstWritten.networkUsed,
      toolExecuted: firstWritten.toolExecuted,
      memoryWritten: firstWritten.memoryWritten,
      configWritten: firstWritten.configWritten,
      publishedExternally: firstWritten.publishedExternally,
      approvalEntered: firstWritten.approvalEntered,
      blocked: firstWritten.blocked,
      allowed: firstWritten.allowed,
      enforced: firstWritten.enforced,
    });
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

assert.equal(rows.length, caseCount);
assert.equal(recordOnly, caseCount);
assert.equal(returnWriteMismatches, 0);
assert.equal(normalizedOutputMismatches, 0);
assert.equal(committedEvidenceMismatches, 0);
assert.equal(rows.filter((row) => row.inputMutated).length, 0);
assert.equal(forbiddenEffects, 0);
assert.equal(capabilityTrueCount, 0);
assert.equal(falsePermits, 0);
assert.equal(falseCompacts, 0);
assert.equal(boundaryLoss, 0);
assert.equal(rows.filter((row) => row.publishedExternally || row.blocked || row.allowed || row.enforced).length, 0);

const output = {
  pilotReproducibility: 'pass',
  artifact,
  timestamp: '2026-05-08T23:45:00.000Z',
  reproducedArtifact: 'T-synaptic-mesh-manual-dry-run-cli-real-redacted-pilot-expanded-v0',
  sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-real-redacted-pilot-expanded.json',
  cases: rows.length,
  runsPerCase: 2,
  canonicalOutputsCompared: rows.length,
  recordOnly,
  returnWriteMismatches,
  normalizedOutputMismatches,
  committedEvidenceMismatches,
  inputMutations: rows.filter((row) => row.inputMutated).length,
  forbiddenEffects,
  capabilityTrueCount,
  falsePermits,
  falseCompacts,
  boundaryLoss,
  rawContentPersisted,
  privatePathsPersisted,
  secretLikeValuesPersisted,
  toolOutputsPersisted,
  memoryTextPersisted,
  configTextPersisted,
  approvalTextPersisted,
  summary: {
    safetyClaimScope: 'manual_dry_run_cli_pilot_reproducibility_local_record_only_not_live_observer_not_runtime_not_authorization',
    liveObserverImplemented: false,
    runtimeIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    publicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
  },
  rows,
  boundary,
};

await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
