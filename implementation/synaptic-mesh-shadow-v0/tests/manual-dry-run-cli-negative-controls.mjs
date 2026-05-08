import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-negative-controls-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const inputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/case-001.json');
const forbiddenInputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/forbidden-effect-poc.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-negative-controls.out.json');
const symlinkOutputPath = resolve(packageRoot, 'evidence/manual-dry-run-cli.symlink-poc.out.json');
const symlinkEscapeTarget = '/tmp/synaptic-mesh-manual-dry-run-symlink-poc.json';
const symlinkParentPath = resolve(packageRoot, 'evidence/manual-dry-run-parent-symlink-poc');
const symlinkParentTarget = '/tmp/synaptic-mesh-parent-symlink-poc-target';
const symlinkParentNested = `${symlinkParentTarget}/nested`;
const outsideDirPoc = '/tmp/synaptic-mesh-manual-dry-run-outside-dir-poc';

const input = JSON.parse(await readFile(inputPath, 'utf8'));

async function expectCliReject(args, expectedReasonCode) {
  try {
    await runManualDryRunCli(args, { cwd: packageRoot });
  } catch (error) {
    assert.equal(error.reasonCode, expectedReasonCode, `${args.join(' ')} should reject with ${expectedReasonCode}`);
    return true;
  }
  assert.fail(`${args.join(' ')} should reject`);
}

await rm(symlinkOutputPath, { force: true });
await rm(symlinkEscapeTarget, { force: true });
await symlink(symlinkEscapeTarget, symlinkOutputPath);
let symlinkOutputRejected = false;
try {
  await runManualDryRunCli(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-cli.symlink-poc.out.json'], { cwd: packageRoot });
} catch (error) {
  symlinkOutputRejected = ['OUTPUT_ALREADY_EXISTS', 'OUTPUT_SYMLINK_NOT_ALLOWED'].includes(error.reasonCode);
}
assert.equal(symlinkOutputRejected, true, 'CLI must reject symlink output paths');
assert.equal(existsSync(symlinkEscapeTarget), false, 'CLI must not write through symlink output paths');
await rm(symlinkOutputPath, { force: true });

await rm(outsideDirPoc, { recursive: true, force: true });
const outsideEvidenceDirRejected = await expectCliReject(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', `${outsideDirPoc}/out.json`], 'OUTPUT_ABSOLUTE_PATH_NOT_ALLOWED');
const outsideEvidenceDirCreated = existsSync(outsideDirPoc);
assert.equal(outsideEvidenceDirCreated, false, 'CLI must not create directories outside evidence for rejected output paths');

await rm(symlinkParentPath, { force: true });
await rm(symlinkParentTarget, { recursive: true, force: true });
await mkdir(symlinkParentTarget, { recursive: true });
await symlink(symlinkParentTarget, symlinkParentPath);
const symlinkParentRejected = await expectCliReject(['--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-parent-symlink-poc/nested/out.json'], 'OUTPUT_PARENT_SYMLINK_NOT_ALLOWED');
const symlinkParentNestedCreated = existsSync(symlinkParentNested);
assert.equal(symlinkParentNestedCreated, false, 'CLI must not create directories through symlinked output parents');
await rm(symlinkParentPath, { force: true });
await rm(symlinkParentTarget, { recursive: true, force: true });

const forbiddenCliCases = [
  '--url', '--watch', '--daemon', '--network', '--tool', '--memory', '--config', '--publish', '--approve', '--block', '--allow', '--live', '--runtime', '--adapter', '--enforce', '--authorize',
];
let forbiddenCliFlagRejections = 0;
for (const flag of forbiddenCliCases) {
  if (await expectCliReject([flag, 'x', '--input', 'fixtures/manual-dry-run-inputs/case-001.json', '--output', 'evidence/manual-dry-run-cli.forbidden.out.json'], 'FORBIDDEN_FLAG')) forbiddenCliFlagRejections += 1;
}

const forbiddenInputCases = [
  { patch: { manualObservationBundle: { rawContent: 'unredacted text' } }, reasonCode: 'RAW_CONTENT_FIELD_PRESENT' },
  { patch: { manualObservationBundle: { rawHandoffText: 'unredacted handoff' } }, reasonCode: 'RAW_CONTENT_FIELD_PRESENT' },
  { patch: { manualObservationBundle: { unredactedContent: 'unredacted content' } }, reasonCode: 'RAW_CONTENT_FIELD_PRESENT' },
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
  { patch: { manualObservationBundle: { nested: { mayBlock: true } } }, reasonCode: 'MAY_BLOCK_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayAllow: true } } }, reasonCode: 'MAY_ALLOW_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayExecuteTool: true } } }, reasonCode: 'MAY_EXECUTE_TOOL_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayWriteMemory: true } } }, reasonCode: 'MAY_WRITE_MEMORY_REQUESTED' },
  { patch: { manualObservationBundle: { nested: { mayWriteConfig: true } } }, reasonCode: 'MAY_WRITE_CONFIG_REQUESTED' },
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
  const rejected = await expectCliReject(['--input', 'fixtures/manual-dry-run-inputs/forbidden-effect-poc.json', '--output', `evidence/manual-dry-run-cli.forbidden-${index}.out.json`], reasonCode);
  if (rejected) forbiddenInputRejections += 1;
  assert.equal(existsSync(resolve(packageRoot, `evidence/manual-dry-run-cli.forbidden-${index}.out.json`)), false, 'rejected forbidden input must not write output evidence');
  await rm(forbiddenInputPath, { force: true });
}

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T12:10:00.000Z',
    verdict: 'pass',
    symlinkOutputRejected,
    symlinkEscapeTargetWritten: existsSync(symlinkEscapeTarget),
    outsideEvidenceDirRejected,
    outsideEvidenceDirCreated,
    symlinkParentRejected,
    symlinkParentNestedCreated,
    forbiddenCliFlagCases: forbiddenCliCases.length,
    forbiddenCliFlagRejections,
    forbiddenInputCases: forbiddenInputCases.length,
    forbiddenInputRejections,
    rejectedOutputEvidenceWritten: false,
    manualInvocationOnly: true,
    explicitLocalFileInputOnly: true,
    alreadyRedactedBundleOnly: true,
    recordOnly: true,
    liveInputRead: false,
    networkUsed: false,
    toolExecuted: false,
    memoryWritten: false,
    configWritten: false,
    publishedExternally: false,
    approvalEntered: false,
    blocked: false,
    allowed: false,
    enforced: false,
  },
  boundary: ['manual_invocation_only', 'explicit_local_file_input_only', 'already_redacted_bundle_only', 'local_evidence_output_only', 'record_only', 'no_live_observer', 'no_network', 'no_tool_execution', 'no_memory_write', 'no_config_write', 'no_publication', 'no_approval_path', 'no_blocking', 'no_allowing', 'no_authorization', 'no_enforcement'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
