import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunArtifact, runManualDryRunCli } from '../src/manual-dry-run.mjs';
import { effectCapabilityFields, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const inputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/case-001.json');
const outputPath = resolve(packageRoot, 'evidence/manual-dry-run-cli.case-001.out.json');
const symlinkOutputPath = resolve(packageRoot, 'evidence/manual-dry-run-cli.symlink-poc.out.json');
const symlinkEscapeTarget = '/tmp/synaptic-mesh-manual-dry-run-symlink-poc.json';
const outsideDirPoc = '/tmp/synaptic-mesh-manual-dry-run-outside-dir-poc';
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli.out.json');

const schemas = {
  decisionTrace: JSON.parse(await readFile(resolve(repoRoot, 'schemas/decision-trace.schema.json'), 'utf8')),
  observation: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation.schema.json'), 'utf8')),
  result: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json'), 'utf8')),
  manualDryRunResult: JSON.parse(await readFile(resolve(repoRoot, 'schemas/manual-dry-run-result.schema.json'), 'utf8')),
};

const input = JSON.parse(await readFile(inputPath, 'utf8'));
const direct = runManualDryRunArtifact(input, { target: 'v0.1.13-cli-skeleton' });
await rm(outputPath, { force: true });
const cli = await runManualDryRunCli(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-cli.case-001.out.json', '--target', 'v0.1.13-cli-skeleton'], { cwd: packageRoot });
const written = JSON.parse(await readFile(outputPath, 'utf8'));

assert.deepEqual(cli, direct, 'CLI output must match direct pipeline output');
assert.deepEqual(written, direct, 'CLI must write exactly the direct pipeline output');
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
assert.equal(written.liveShadowObservationResult.observerAction, 'record_only');
assert.equal(written.manualDryRunResult.safetyClaimScope, 'manual_dry_run_cli_minimal_local_file_redacted_bundle_record_only_not_live_observer_not_runtime_not_authorization');
assert.deepEqual(written.liveShadowObservationResult.forbiddenEffectsDetected, []);
for (const field of effectCapabilityFields) assert.equal(written.liveShadowObservationResult[field], false, `${field} must remain false`);
for (const field of effectCapabilityFields) assert.equal(written.manualDryRunResult[field], false, `manualDryRunResult.${field} must remain false`);

const validationErrors = [];
for (const [kind, schema, value] of [
  ['decision_trace', schemas.decisionTrace, written.decisionTrace],
  ['live_shadow_observation', schemas.observation, written.liveShadowObservation],
  ['live_shadow_observation_result', schemas.result, written.liveShadowObservationResult],
  ['manual_dry_run_result', schemas.manualDryRunResult, written.manualDryRunResult],
]) {
  const errors = validateSchemaValue(schema, value);
  if (errors.length > 0) validationErrors.push({ kind, errors });
}
assert.deepEqual(validationErrors, [], 'generated artifacts must validate against schemas');

await rm(symlinkOutputPath, { force: true });
await rm(symlinkEscapeTarget, { force: true });
await symlink(symlinkEscapeTarget, symlinkOutputPath);
let symlinkRejected = false;
try {
  await runManualDryRunCli(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-cli.symlink-poc.out.json'], { cwd: packageRoot });
} catch (error) {
  symlinkRejected = ['OUTPUT_ALREADY_EXISTS', 'OUTPUT_SYMLINK_NOT_ALLOWED'].includes(error.reasonCode);
}
assert.equal(symlinkRejected, true, 'CLI must reject symlink output paths');
assert.equal(existsSync(symlinkEscapeTarget), false, 'CLI must not write through symlink output paths');
await rm(symlinkOutputPath, { force: true });

await rm(outsideDirPoc, { recursive: true, force: true });
let outsideDirRejected = false;
try {
  await runManualDryRunCli(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', `${outsideDirPoc}/out.json`], { cwd: packageRoot });
} catch (error) {
  outsideDirRejected = error.reasonCode === 'OUTPUT_ABSOLUTE_PATH_NOT_ALLOWED' || error.reasonCode === 'OUTPUT_OUTSIDE_EVIDENCE_DIR_NOT_ALLOWED';
}
assert.equal(outsideDirRejected, true, 'CLI must reject output outside evidence before mkdir');
assert.equal(existsSync(outsideDirPoc), false, 'CLI must not create directories outside evidence for rejected output paths');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T12:00:00.000Z',
    verdict: 'pass',
    input: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-inputs/case-001.json',
    output: 'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli.case-001.out.json',
    manualDryRun: written.manualDryRun,
    recordOnly: written.recordOnly,
    generatedParserEvidence: true,
    generatedClassifierDecision: true,
    generatedDecisionTrace: true,
    generatedLiveShadowObservation: true,
    generatedLiveShadowResult: true,
    generatedScorecardRow: true,
    generatedManualDryRunResult: true,
    validationErrorCount: validationErrors.length,
    forbiddenEffectsDetected: written.liveShadowObservationResult.forbiddenEffectsDetected.length,
    mayBlock: written.manualDryRunResult.mayBlock ? 1 : 0,
    mayAllow: written.manualDryRunResult.mayAllow ? 1 : 0,
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
    cliImplemented: true,
    liveObserverImplemented: false,
    watcherImplemented: false,
    daemonImplemented: false,
    runtimeIntegrationImplemented: false,
    symlinkOutputRejected: symlinkRejected,
    symlinkEscapeTargetWritten: existsSync(symlinkEscapeTarget),
    outsideEvidenceDirRejected: outsideDirRejected,
    outsideEvidenceDirCreated: existsSync(outsideDirPoc),
    safetyClaimScope: 'manual_dry_run_cli_minimal_local_file_redacted_bundle_record_only_not_live_observer_not_runtime_not_authorization',
  },
  validationErrors,
  boundary: ['manual_invocation_only', 'explicit_local_file_input_only', 'already_redacted_bundle_only', 'redaction_review_record_required', 'local_evidence_output_only', 'record_only', 'no_live_observer', 'no_watcher', 'no_daemon', 'no_network', 'no_tool_execution', 'no_memory_write', 'no_config_write', 'no_publication', 'no_approval_path', 'no_blocking', 'no_allowing', 'no_authorization', 'no_enforcement'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
