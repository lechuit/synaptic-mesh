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
const forbiddenInputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/forbidden-effect-poc.json');
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

const forbiddenCliCases = [
  { flag: '--url', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--watch', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--network', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--tool', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--memory', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--config', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--publish', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--approve', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--block', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--allow', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--live', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--runtime', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--adapter', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--enforce', reasonCode: 'FORBIDDEN_FLAG' },
  { flag: '--authorize', reasonCode: 'FORBIDDEN_FLAG' },
];
let forbiddenCliFlagRejections = 0;
for (const { flag, reasonCode } of forbiddenCliCases) {
  try {
    await runManualDryRunCli([flag, 'x', '--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-cli.forbidden.out.json'], { cwd: packageRoot });
  } catch (error) {
    if (error.reasonCode === reasonCode) forbiddenCliFlagRejections += 1;
  }
}
assert.equal(forbiddenCliFlagRejections, forbiddenCliCases.length, 'CLI must reject forbidden effect flags before execution');

const forbiddenInputCases = [
  { patch: { manualObservationBundle: { rawContent: 'unredacted text' } }, reasonCode: 'RAW_CONTENT_FIELD_PRESENT' },
  { patch: { manualObservationBundle: { liveInputAllowed: true } }, reasonCode: 'LIVE_INPUT_REQUESTED' },
  { patch: { manualObservationBundle: { networkAllowed: true } }, reasonCode: 'NETWORK_REQUESTED' },
  { patch: { manualObservationBundle: { toolExecutionAllowed: true } }, reasonCode: 'TOOL_EXECUTION_REQUESTED' },
  { patch: { manualObservationBundle: { memoryWriteAllowed: true } }, reasonCode: 'MEMORY_WRITE_REQUESTED' },
  { patch: { manualObservationBundle: { configWriteAllowed: true } }, reasonCode: 'CONFIG_WRITE_REQUESTED' },
  { patch: { manualObservationBundle: { publicationAllowed: true } }, reasonCode: 'PUBLICATION_REQUESTED' },
  { patch: { manualObservationBundle: { approvalPathAllowed: true } }, reasonCode: 'APPROVAL_PATH_REQUESTED' },
  { patch: { manualObservationBundle: { blockingAllowed: true } }, reasonCode: 'BLOCKING_REQUESTED' },
  { patch: { manualObservationBundle: { allowingAllowed: true } }, reasonCode: 'ALLOWING_REQUESTED' },
  { patch: { manualObservationBundle: { authorizationAllowed: true } }, reasonCode: 'AUTHORIZATION_REQUESTED' },
  { patch: { manualObservationBundle: { enforcementAllowed: true } }, reasonCode: 'ENFORCEMENT_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayExecuteTool: true } } }, reasonCode: 'MAY_EXECUTE_TOOL_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayWriteMemory: true } } }, reasonCode: 'MAY_WRITE_MEMORY_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayPublishExternally: true } } }, reasonCode: 'MAY_PUBLISH_EXTERNALLY_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayEnterApprovalPath: true } } }, reasonCode: 'MAY_ENTER_APPROVAL_PATH_REQUESTED' },
  { patch: { parserEvidence: { rawContent: 'laundered raw text' } }, reasonCode: 'RAW_CONTENT_FIELD_PRESENT' },
  { patch: { routeDecisionInput: { mayAllow: true } }, reasonCode: 'MAY_ALLOW_REQUESTED' },
];
let forbiddenInputRejections = 0;
for (const [index, { patch, reasonCode }] of forbiddenInputCases.entries()) {
  const candidate = JSON.parse(JSON.stringify(input));
  for (const [topLevelKey, patchValue] of Object.entries(patch)) {
    candidate[topLevelKey] = { ...(candidate[topLevelKey] ?? {}), ...patchValue };
  }
  await writeFile(forbiddenInputPath, `${JSON.stringify(candidate, null, 2)}\n`);
  try {
    await runManualDryRunCli(['--input', 'fixtures/manual-dry-run-inputs/forbidden-effect-poc.json', '--output', `evidence/manual-dry-run-cli.forbidden-${index}.out.json`], { cwd: packageRoot });
  } catch (error) {
    if (error.reasonCode === reasonCode) forbiddenInputRejections += 1;
  }
  await rm(forbiddenInputPath, { force: true });
}
assert.equal(forbiddenInputRejections, forbiddenInputCases.length, 'CLI must reject forbidden effect claims in input artifacts');

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
    forbiddenCliFlagCases: forbiddenCliCases.length,
    forbiddenCliFlagRejections,
    forbiddenInputCases: forbiddenInputCases.length,
    forbiddenInputRejections,
    safetyClaimScope: 'manual_dry_run_cli_minimal_local_file_redacted_bundle_record_only_not_live_observer_not_runtime_not_authorization',
  },
  validationErrors,
  boundary: ['manual_invocation_only', 'explicit_local_file_input_only', 'already_redacted_bundle_only', 'redaction_review_record_required', 'local_evidence_output_only', 'record_only', 'no_live_observer', 'no_watcher', 'no_daemon', 'no_network', 'no_tool_execution', 'no_memory_write', 'no_config_write', 'no_publication', 'no_approval_path', 'no_blocking', 'no_allowing', 'no_authorization', 'no_enforcement'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
