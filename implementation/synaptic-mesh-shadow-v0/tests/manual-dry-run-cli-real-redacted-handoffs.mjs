import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';
import { effectCapabilityFields, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-real-redacted-handoffs-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-real-redacted-handoffs.out.json');
const packPath = resolve(packageRoot, 'fixtures/real-redacted-handoff-pack.json');

const schemas = {
  decisionTrace: JSON.parse(await readFile(resolve(repoRoot, 'schemas/decision-trace.schema.json'), 'utf8')),
  observation: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation.schema.json'), 'utf8')),
  result: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json'), 'utf8')),
  manualDryRunResult: JSON.parse(await readFile(resolve(repoRoot, 'schemas/manual-dry-run-result.schema.json'), 'utf8')),
};

const pack = JSON.parse(await readFile(packPath, 'utf8'));
assert.equal(pack.captureMode, 'manual_offline');
assert.equal(pack.humanReviewed, true);
assert.equal(pack.rawContentPersisted, false);
assert.equal(pack.allowedProcessing, 'local_shadow_only');
assert.equal(pack.cases.length, 3, 'positive path must cover exactly three real-redacted handoffs');

const rows = [];
const validationErrors = [];
for (const [index, handoff] of pack.cases.entries()) {
  const ordinal = String(index + 1).padStart(3, '0');
  const inputRel = `fixtures/manual-dry-run-inputs/real-redacted-case-${ordinal}.json`;
  const outputRel = `evidence/manual-dry-run-cli.real-redacted-case-${ordinal}.out.json`;
  const inputPath = resolve(packageRoot, inputRel);
  const outputPath = resolve(packageRoot, outputRel);
  const input = {
    schemaVersion: 'manual-dry-run-input-v0',
    caseId: handoff.caseId,
    manualObservationBundle: handoff.manualObservationBundle,
    redactionReviewRecord: handoff.redactionReviewRecord,
  };
  await mkdir(dirname(inputPath), { recursive: true });
  await writeFile(inputPath, `${JSON.stringify(input, null, 2)}\n`);
  await rm(outputPath, { force: true });
  const result = await runManualDryRunCli(['--input', inputRel, '--output', outputRel, '--target', 'v0.1.13-real-redacted-positive-path'], { cwd: packageRoot });
  const written = JSON.parse(await readFile(outputPath, 'utf8'));
  assert.deepEqual(written, result, `${handoff.caseId} CLI return must equal written evidence`);
  assert.equal(written.manualDryRun, 'pass');
  assert.equal(written.recordOnly, true);
  assert.equal(written.inputKind, 'redacted_manual_observation_bundle');
  assert.equal(written.rawUnredactedInputRead, false);
  assert.equal(written.liveInputRead, false);
  assert.equal(written.networkUsed, false);
  assert.equal(written.toolExecuted, false);
  assert.equal(written.memoryWritten, false);
  assert.equal(written.configWritten, false);
  assert.equal(written.publishedExternally, false);
  assert.equal(written.approvalEntered, false);
  assert.equal(written.blocked, false);
  assert.equal(written.allowed, false);
  assert.equal(written.enforced, false);
  assert.equal(written.manualDryRunResult.observerAction, 'record_only');
  assert.deepEqual(written.liveShadowObservationResult.forbiddenEffectsDetected, []);
  for (const field of effectCapabilityFields) assert.equal(written.liveShadowObservationResult[field], false, `${handoff.caseId}.${field} result must remain false`);
  for (const field of effectCapabilityFields) assert.equal(written.manualDryRunResult[field], false, `${handoff.caseId}.manualDryRunResult.${field} must remain false`);

  for (const [kind, schema, value] of [
    ['decision_trace', schemas.decisionTrace, written.decisionTrace],
    ['live_shadow_observation', schemas.observation, written.liveShadowObservation],
    ['live_shadow_observation_result', schemas.result, written.liveShadowObservationResult],
    ['manual_dry_run_result', schemas.manualDryRunResult, written.manualDryRunResult],
  ]) {
    const errors = validateSchemaValue(schema, value);
    if (errors.length > 0) validationErrors.push({ caseId: handoff.caseId, kind, errors });
  }

  rows.push({
    caseId: handoff.caseId,
    bundleId: handoff.manualObservationBundle.bundleId,
    reviewId: handoff.redactionReviewRecord.reviewId,
    output: `implementation/synaptic-mesh-shadow-v0/${outputRel}`,
    manualDryRun: written.manualDryRun,
    recordOnly: written.recordOnly,
    selectedRoute: written.classifierDecision.selectedRoute,
    matchedGold: written.decisionTrace.matchedGold,
    falsePermit: written.decisionTrace.boundaryVerdict.falsePermit,
    falseCompact: written.decisionTrace.boundaryVerdict.falseCompact,
    boundaryLoss: written.decisionTrace.boundaryVerdict.boundaryLoss,
    forbiddenEffectsDetected: written.liveShadowObservationResult.forbiddenEffectsDetected.length,
    capabilityTrueCount: effectCapabilityFields.filter((field) => written.manualDryRunResult[field] !== false || written.liveShadowObservationResult[field] !== false).length,
    rawUnredactedInputRead: written.rawUnredactedInputRead,
    liveInputRead: written.liveInputRead,
    networkUsed: written.networkUsed,
    toolExecuted: written.toolExecuted,
    memoryWritten: written.memoryWritten,
    configWritten: written.configWritten,
    publishedExternally: written.publishedExternally,
    approvalEntered: written.approvalEntered,
    blocked: written.blocked,
    allowed: written.allowed,
    enforced: written.enforced,
  });
}

assert.deepEqual(validationErrors, [], 'all real-redacted manual dry-run outputs must validate');
assert.equal(rows.length, 3);
assert.equal(rows.filter((row) => row.recordOnly).length, 3);
assert.equal(rows.reduce((sum, row) => sum + row.forbiddenEffectsDetected, 0), 0);
assert.equal(rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0), 0);
assert.equal(rows.filter((row) => row.falsePermit || row.falseCompact || row.boundaryLoss).length, 0);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T12:20:00.000Z',
    verdict: 'pass',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/real-redacted-handoff-pack.json',
    realRedactedHandoffCount: rows.length,
    validationErrorCount: validationErrors.length,
    recordOnlyCount: rows.filter((row) => row.recordOnly).length,
    forbiddenEffectsDetectedCount: rows.reduce((sum, row) => sum + row.forbiddenEffectsDetected, 0),
    capabilityTrueCount: rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0),
    falsePermitCount: rows.filter((row) => row.falsePermit).length,
    falseCompactCount: rows.filter((row) => row.falseCompact).length,
    boundaryLossCount: rows.filter((row) => row.boundaryLoss).length,
    rawUnredactedInputReadCount: rows.filter((row) => row.rawUnredactedInputRead).length,
    liveInputReadCount: rows.filter((row) => row.liveInputRead).length,
    networkUsedCount: rows.filter((row) => row.networkUsed).length,
    toolExecutedCount: rows.filter((row) => row.toolExecuted).length,
    memoryWrittenCount: rows.filter((row) => row.memoryWritten).length,
    configWrittenCount: rows.filter((row) => row.configWritten).length,
    publishedExternallyCount: rows.filter((row) => row.publishedExternally).length,
    approvalEnteredCount: rows.filter((row) => row.approvalEntered).length,
    blockedCount: rows.filter((row) => row.blocked).length,
    allowedCount: rows.filter((row) => row.allowed).length,
    enforcedCount: rows.filter((row) => row.enforced).length,
    safetyClaimScope: 'manual_dry_run_cli_real_redacted_positive_path_record_only_not_live_observer_not_runtime_not_authorization',
  },
  rows,
  validationErrors,
  boundary: ['manual_invocation_only', 'explicit_local_file_input_only', 'already_redacted_bundle_only', 'redaction_review_record_required', 'local_evidence_output_only', 'record_only', 'no_live_observer', 'no_watcher', 'no_daemon', 'no_network', 'no_tool_execution', 'no_memory_write', 'no_config_write', 'no_publication', 'no_approval_path', 'no_blocking', 'no_allowing', 'no_authorization', 'no_enforcement'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
