import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter, writeReadOnlyLocalFileAdapterEvidence } from '../src/adapters/read-only-local-file-adapter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-failure-catalog.out.json');
const adapterEvidenceFilename = 'read-only-local-file-adapter.out.json';

const forbiddenCapabilityFields = [
  'toolExecution',
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
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withPatch(base, patch = {}, remove = []) {
  const candidate = { ...clone(base), ...patch };
  for (const key of remove) delete candidate[key];
  return candidate;
}

function countCapabilityTrue(value) {
  if (!value || typeof value !== 'object') return 0;
  let count = 0;
  for (const key of forbiddenCapabilityFields) {
    if (value[key] === true) count += 1;
  }
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') count += countCapabilityTrue(child);
  }
  return count;
}

function adapterEvidenceRoot(root) {
  return resolve(root, 'implementation/synaptic-mesh-shadow-v0/evidence');
}

function adapterEvidenceDirectory(root) {
  return resolve(adapterEvidenceRoot(root), 'read-only-local-file-adapter');
}

function adapterEvidenceTarget(root) {
  return resolve(adapterEvidenceDirectory(root), adapterEvidenceFilename);
}

async function runAdapterRejectCase({ id, hazard, patch = {}, remove = [] }, validInput) {
  const candidate = withPatch(validInput, patch, remove);
  const result = await runReadOnlyLocalFileAdapter(candidate, { repoRoot, adapterRunId: `failure_catalog_${id}` });
  const capabilityTrueCount = countCapabilityTrue(result);
  return {
    id,
    kind: 'adapter_input_rejection',
    hazard,
    accepted: result.ok === true,
    sourceFileRead: result.result?.sourceFileRead === true,
    capabilityTrueCount,
    forbiddenEffects: capabilityTrueCount,
    reasons: result.advisoryReport?.reasons ?? [],
  };
}

async function runOutputRejectCase({ id, hazard, setup, options, protectedPath }) {
  await setup?.();
  const protectedBefore = protectedPath ? await readFile(protectedPath, 'utf8') : null;
  let accepted = false;
  let reason = '';
  try {
    await writeReadOnlyLocalFileAdapterEvidence({ attempted: hazard }, options());
    accepted = true;
  } catch (error) {
    reason = error.message;
  }
  const protectedMutated = protectedPath ? (await readFile(protectedPath, 'utf8')) !== protectedBefore : false;
  return {
    id,
    kind: 'evidence_output_rejection',
    hazard,
    accepted,
    sourceFileRead: false,
    capabilityTrueCount: 0,
    forbiddenEffects: accepted || protectedMutated ? 1 : 0,
    reasons: reason ? [reason] : [],
  };
}

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const validInput = inputs.valid[0];

const workDir = await mkdtemp(resolve(packageRoot, 'evidence/read-only-local-file-adapter-failure-catalog-work-'));
try {
  const sourceSymlinkPath = resolve(workDir, 'source-symlink.json');
  await symlink(resolve(repoRoot, validInput.sourceFilePath), sourceSymlinkPath);
  const symlinkSourceFilePath = relative(repoRoot, sourceSymlinkPath);
  const outputParentSymlinkRoot = resolve(workDir, 'output-parent-symlink-root');
  const outputParentOutside = resolve(workDir, 'output-parent-outside');
  const outputParentProtected = resolve(outputParentOutside, adapterEvidenceFilename);
  const outputCollisionRoot = resolve(workDir, 'output-collision-root');
  const outputCollisionTarget = adapterEvidenceTarget(outputCollisionRoot);

  const adapterCases = [
    { id: 'FC01', hazard: 'raw_input_allowed', patch: { sourceAlreadyRedacted: false, rawInputAllowed: true, rawContentPersisted: true, redactionReviewRecord: { reviewed: true, rawContentPersisted: true, sourceAlreadyRedacted: false } } },
    { id: 'FC02', hazard: 'url_network_input', patch: { sourceFilePath: 'https://example.invalid/redacted.json', networkAllowed: true } },
    { id: 'FC03', hazard: 'directory_input', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/', directoryInputAllowed: true } },
    { id: 'FC04', hazard: 'glob_input', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/*.json', globAllowed: true } },
    { id: 'FC05', hazard: 'parent_traversal', patch: { sourceFilePath: '../outside.json' } },
    { id: 'FC06', hazard: 'source_symlink', patch: { sourceFilePath: symlinkSourceFilePath } },
    { id: 'FC07', hazard: 'agent_consumed_output_request', patch: { agentConsumed: true } },
    { id: 'FC08', hazard: 'machine_readable_policy_request', patch: { machineReadablePolicyDecision: true } },
    { id: 'FC09', hazard: 'tool_execution_request', patch: { toolExecution: true } },
    { id: 'FC10', hazard: 'memory_write_request', patch: { memoryWrite: true } },
    { id: 'FC11', hazard: 'config_write_request', patch: { configWrite: true } },
    { id: 'FC12', hazard: 'external_publication_request', patch: { externalPublication: true } },
    { id: 'FC13', hazard: 'approval_path_request', patch: { approvalEmission: true } },
    { id: 'FC14', hazard: 'block_allow_request', patch: { mayBlock: true, mayAllow: true } },
    { id: 'FC15', hazard: 'authorization_request', patch: { authorization: true } },
    { id: 'FC16', hazard: 'enforcement_request', patch: { enforcement: true } },
    { id: 'FC17', hazard: 'unicode_bidi_path', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/example\u202ejson' } },
    { id: 'FC18', hazard: 'confusable_filename', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/examp\u043Be.json' } },
    { id: 'FC19', hazard: 'future_mtime_claim', patch: { sourceMtime: '2999-01-01T00:00:00.000Z' } },
    { id: 'FC20', hazard: 'invalid_mtime_claim', patch: { sourceMtime: 'not-a-date' } },
    { id: 'FC21', hazard: 'digest_mismatch_claim', patch: { sourceArtifactDigest: 'sha256:0000000000000000000000000000000000000000000000000000000000000000', digestMismatchExpected: true } },
    { id: 'FC22', hazard: 'duplicate_source_artifact_id', patch: { sourceArtifactId: 'redacted-example', duplicateSourceArtifactId: 'redacted-example' } },
    { id: 'FC23', hazard: 'redaction_review_record_missing', remove: ['redactionReviewRecord'] },
    { id: 'FC24', hazard: 'redaction_review_record_partial', patch: { redactionReviewRecord: { reviewed: true } } },
    { id: 'FC25', hazard: 'oversized_file_claim', patch: { sourceSizeBytes: 104857601 } },
    { id: 'FC26', hazard: 'malformed_json_claim', patch: { sourceFormat: 'malformed_json' } },
    { id: 'FC27', hazard: 'valid_json_wrong_schema', patch: { schemaVersion: 'read-only-local-file-adapter-input-v999' } },
    { id: 'FC28', hazard: 'encoded_parent_traversal', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/%2e%2e/example.json' } },
  ];

  const rows = [];
  for (const testCase of adapterCases) rows.push(await runAdapterRejectCase(testCase, validInput));
  rows.push(await runOutputRejectCase({
    id: 'FC29',
    hazard: 'output_parent_symlink',
    setup: async () => {
      await mkdir(adapterEvidenceRoot(outputParentSymlinkRoot), { recursive: true });
      await mkdir(outputParentOutside, { recursive: true });
      await writeFile(outputParentProtected, 'parent symlink protected sentinel\n');
      await symlink(outputParentOutside, adapterEvidenceDirectory(outputParentSymlinkRoot));
    },
    options: () => ({ repoRoot: outputParentSymlinkRoot }),
    protectedPath: outputParentProtected,
  }));
  rows.push(await runOutputRejectCase({
    id: 'FC30',
    hazard: 'output_path_collision_symlink',
    setup: async () => {
      await mkdir(adapterEvidenceDirectory(outputCollisionRoot), { recursive: true });
      await symlink(resolve(workDir, 'collision-target.json'), outputCollisionTarget);
    },
    options: () => ({ repoRoot: outputCollisionRoot }),
  }));

  assert.equal(rows.length, 30, 'failure catalog must cover exactly 30 cases');
  const unexpectedAccepts = rows.filter((row) => row.accepted).length;
  const sourceFilesReadForRejectedCases = rows.filter((row) => !row.accepted && row.sourceFileRead).length;
  const forbiddenEffects = rows.reduce((sum, row) => sum + row.forbiddenEffects, 0);
  const capabilityTrueCount = rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0);

  assert.equal(unexpectedAccepts, 0, 'failure catalog must have zero unexpected accepts');
  assert.equal(sourceFilesReadForRejectedCases, 0, 'failure catalog rejected cases must not read source files');
  assert.equal(forbiddenEffects, 0, 'failure catalog must have zero forbidden effects');
  assert.equal(capabilityTrueCount, 0, 'failure catalog must have zero true capabilities');
  for (const row of rows) {
    assert.ok(row.reasons.length > 0, `${row.id} must record at least one rejection reason`);
  }

  const output = {
    artifact: 'T-synaptic-mesh-read-only-local-file-adapter-failure-catalog-v0.5.2',
    timestamp: '2026-05-14T05:10:00.000Z',
    summary: {
      readOnlyLocalFileAdapterFailureCatalog: 'pass',
      failureCases: 30,
      unexpectedAccepts,
      sourceFilesReadForRejectedCases,
      forbiddenEffects,
      capabilityTrueCount,
    },
    rows,
    boundary: [
      'adapter_failure_catalog_v0_5_2',
      'manual_invocation_only',
      'one_explicit_already_redacted_local_file_only',
      'reject_before_source_read_for_rejected_cases',
      'record_only',
      'no_runtime_authorization',
      'no_enforcement',
      'no_network_call',
      'no_tool_execution',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_approval_blocking_allowing',
    ],
  };

  await mkdir(dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output.summary, null, 2));
} finally {
  await rm(workDir, { recursive: true, force: true });
}
