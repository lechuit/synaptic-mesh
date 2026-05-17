import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter, writeReadOnlyLocalFileAdapterEvidence } from '../src/adapters/read-only-local-file-adapter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls.out.json');
const adapterSourcePath = resolve(packageRoot, 'src/adapters/read-only-local-file-adapter.mjs');
const inputSchemaPath = resolve(repoRoot, 'schemas/read-only-local-file-adapter-input.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/read-only-local-file-adapter-result.schema.json');
const adapterEvidenceFilename = 'read-only-local-file-adapter.out.json';

const forbiddenConvenienceCliFlags = Object.freeze([
  '--directory',
  '--glob',
  '--watch',
  '--daemon',
  '--url',
  '--repo',
  '--network',
  '--tool',
  '--memory',
  '--config',
  '--publish',
  '--approve',
  '--block',
  '--allow',
]);

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

function collectRawClassifierLeaks(value, path = []) {
  if (!value || typeof value !== 'object') return [];
  const leaks = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    if (['classifierDecision', 'selectedRoute', 'rejectedRoutes', 'compactAllowed', 'toolAuthorization'].includes(key)) {
      leaks.push(childPath.join('.'));
    }
    leaks.push(...collectRawClassifierLeaks(child, childPath));
  }
  return leaks;
}

function staticNetworkAndDiscoveryFindings(source) {
  const findings = [];
  const patterns = [
    [/from ['"]node:(?:http|https|net|tls|dgram)['"]/, 'network import'],
    [/\bfetch\s*\(/, 'fetch call'],
    [/\b(?:request|get)\s*\(/, 'network request-like call'],
    [/from ['"]node:child_process['"]/, 'tool execution import'],
    [/\b(?:exec|execFile|spawn|fork)\s*\(/, 'tool execution call'],
    [/\b(?:readdir|opendir)\s*\(/, 'directory discovery call'],
    [/\bwatch\s*\(/, 'watcher call'],
    [/\bcreateServer\s*\(/, 'daemon/server call'],
    [/\.listen\s*\(/, 'listener call'],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(source)) findings.push(label);
  }
  return findings;
}

function staticForbiddenConvenienceFlagFindings(surfaces) {
  const findings = [];
  for (const surface of surfaces) {
    for (const flag of forbiddenConvenienceCliFlags) {
      if (surface.source.includes(flag)) findings.push({ surface: surface.label, flag });
    }
  }
  return findings;
}

async function runRejectCase({ id, hazard, patch = {}, remove = [] }, validInput) {
  const candidate = withPatch(validInput, patch, remove);
  const result = await runReadOnlyLocalFileAdapter(candidate, { repoRoot, adapterRunId: `negative_${id}` });
  const capabilityTrueCount = countCapabilityTrue(result);
  return {
    id,
    hazard,
    accepted: result.ok === true,
    sourceFileRead: result.result?.sourceFileRead === true,
    capabilityTrueCount,
    forbiddenEffects: capabilityTrueCount,
    reasons: result.advisoryReport?.reasons ?? [],
  };
}

async function pathExists(filePath) {
  return Boolean(await lstat(filePath).catch(() => null));
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

async function runOutputContainmentCase(testCase) {
  await testCase.setup?.();
  const protectedBefore = [];
  for (const filePath of testCase.protectedPaths ?? []) {
    protectedBefore.push([filePath, await readFile(filePath, 'utf8')]);
  }

  let accepted = false;
  let reason = '';
  try {
    await writeReadOnlyLocalFileAdapterEvidence({ attempted: testCase.hazard }, testCase.options());
    accepted = true;
  } catch (error) {
    reason = error.message;
  }

  const forbiddenPathCreations = [];
  for (const filePath of testCase.mustNotExist ?? []) {
    if (await pathExists(filePath)) forbiddenPathCreations.push(testCase.id);
  }

  const protectedFileMutations = [];
  for (const [filePath, before] of protectedBefore) {
    const after = await readFile(filePath, 'utf8');
    if (after !== before) protectedFileMutations.push(testCase.id);
  }

  return {
    id: testCase.id,
    hazard: testCase.hazard,
    accepted,
    forbiddenPathCreated: forbiddenPathCreations.length > 0,
    protectedFileMutated: protectedFileMutations.length > 0,
    forbiddenEffects: accepted || forbiddenPathCreations.length > 0 || protectedFileMutations.length > 0 ? 1 : 0,
    reasons: reason ? [reason] : [],
  };
}

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const validInput = inputs.valid[0];
const adapterSource = await readFile(adapterSourcePath, 'utf8');
const inputSchemaSource = await readFile(inputSchemaPath, 'utf8');
const resultSchemaSource = await readFile(resultSchemaPath, 'utf8');
const staticFindings = staticNetworkAndDiscoveryFindings(adapterSource);
const forbiddenConvenienceFlagSurfaceFindings = staticForbiddenConvenienceFlagFindings([
  { label: 'src/adapters/read-only-local-file-adapter.mjs', source: adapterSource },
  { label: 'schemas/read-only-local-file-adapter-input.schema.json', source: inputSchemaSource },
  { label: 'schemas/read-only-local-file-adapter-result.schema.json', source: resultSchemaSource },
]);

const workDir = await mkdtemp(resolve(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls-work-'));
try {
  const sourceSymlinkPath = resolve(workDir, 'source-symlink.json');
  await symlink(resolve(repoRoot, validInput.sourceFilePath), sourceSymlinkPath);
  const symlinkSourceFilePath = relative(repoRoot, sourceSymlinkPath);

  const cases = [
    {
      id: 'H01',
      hazard: 'raw_input',
      patch: {
        sourceAlreadyRedacted: false,
        rawInputAllowed: true,
        rawContentPersisted: true,
        redactionReviewRecord: { reviewed: true, rawContentPersisted: true, sourceAlreadyRedacted: false },
      },
    },
    { id: 'H02', hazard: 'url_input_and_network_attempt', patch: { sourceFilePath: 'https://example.invalid/redacted.json', networkAllowed: true } },
    { id: 'H03', hazard: 'directory_input', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/', directoryInputAllowed: true } },
    { id: 'H04', hazard: 'glob_input', patch: { sourceFilePath: 'implementation/synaptic-mesh-shadow-v0/fixtures/redacted/*.json', globAllowed: true } },
    { id: 'H05', hazard: 'path_traversal', patch: { sourceFilePath: '../outside.json' } },
    { id: 'H06', hazard: 'symlink_escape', patch: { sourceFilePath: symlinkSourceFilePath } },
    { id: 'H08', hazard: 'agent_consumed_output', patch: { agentConsumed: true } },
    { id: 'H09', hazard: 'machine_readable_policy', patch: { machineReadablePolicyDecision: true } },
    { id: 'H10', hazard: 'tool_execution', patch: { toolExecution: true } },
    { id: 'H11', hazard: 'memory_write', patch: { memoryWrite: true } },
    { id: 'H12', hazard: 'config_write', patch: { configWrite: true } },
    { id: 'H13', hazard: 'external_publication', patch: { externalPublication: true } },
    { id: 'H14', hazard: 'approval', patch: { approvalEmission: true } },
    { id: 'H15', hazard: 'block_allow', patch: { mayBlock: true, mayAllow: true } },
    { id: 'H16', hazard: 'authorization', patch: { authorization: true } },
    { id: 'H17', hazard: 'enforcement', patch: { enforcement: true } },
  ];

  const forbiddenConvenienceFlagCases = [
    { id: 'F01', flag: '--directory', hazard: 'directory_convenience_flag', patch: { directory: true, directoryInputAllowed: true } },
    { id: 'F02', flag: '--glob', hazard: 'glob_convenience_flag', patch: { glob: true, globAllowed: true } },
    { id: 'F03', flag: '--watch', hazard: 'watch_convenience_flag', patch: { watch: true, watcherAllowed: true } },
    { id: 'F04', flag: '--daemon', hazard: 'daemon_convenience_flag', patch: { daemon: true, daemonAllowed: true } },
    { id: 'F05', flag: '--url', hazard: 'url_convenience_flag', patch: { url: 'https://example.invalid/redacted.json', sourceFilePath: 'https://example.invalid/redacted.json' } },
    { id: 'F06', flag: '--repo', hazard: 'repo_convenience_flag', patch: { repo: '../other-repo' } },
    { id: 'F07', flag: '--network', hazard: 'network_convenience_flag', patch: { network: true, networkAllowed: true } },
    { id: 'F08', flag: '--tool', hazard: 'tool_convenience_flag', patch: { tool: 'cat', toolExecution: true } },
    { id: 'F09', flag: '--memory', hazard: 'memory_convenience_flag', patch: { memory: true, memoryWrite: true } },
    { id: 'F10', flag: '--config', hazard: 'config_convenience_flag', patch: { config: true, configWrite: true } },
    { id: 'F11', flag: '--publish', hazard: 'publish_convenience_flag', patch: { publish: true, externalPublication: true } },
    { id: 'F12', flag: '--approve', hazard: 'approve_convenience_flag', patch: { approve: true, approvalEmission: true } },
    { id: 'F13', flag: '--block', hazard: 'block_convenience_flag', patch: { block: true, mayBlock: true } },
    { id: 'F14', flag: '--allow', hazard: 'allow_convenience_flag', patch: { allow: true, mayAllow: true } },
  ];

  const outsideAbsolutePath = resolve(workDir, 'outside-absolute-output.json');
  const relativeParentEscapePath = `../output-containment-${basename(workDir)}.json`;
  const relativeParentEscapeTargets = [
    resolve(repoRoot, relativeParentEscapePath),
    resolve(packageRoot, relativeParentEscapePath),
    resolve(adapterEvidenceRoot(repoRoot), relativeParentEscapePath),
    resolve(adapterEvidenceDirectory(repoRoot), relativeParentEscapePath),
  ];
  const existingSentinelPath = resolve(workDir, 'existing-sentinel.json');
  const sourceFixturePath = resolve(repoRoot, validInput.sourceFilePath);
  const targetSymlinkRoot = resolve(workDir, 'target-symlink-root');
  const targetSymlinkOutside = resolve(workDir, 'target-symlink-outside.json');
  const parentSymlinkRoot = resolve(workDir, 'parent-symlink-root');
  const parentSymlinkOutside = resolve(workDir, 'parent-symlink-outside');
  const parentSymlinkEscapeTarget = resolve(parentSymlinkOutside, adapterEvidenceFilename);
  const evidenceRootSymlinkRoot = resolve(workDir, 'evidence-root-symlink-root');
  const evidenceRootSymlinkOutside = resolve(workDir, 'evidence-root-symlink-outside');
  const evidenceRootSymlinkEscapeDirectory = resolve(evidenceRootSymlinkOutside, 'read-only-local-file-adapter');
  const evidenceRootSymlinkEscapeTarget = resolve(evidenceRootSymlinkEscapeDirectory, adapterEvidenceFilename);

  const outputContainmentCases = [
    {
      id: 'O01',
      hazard: 'caller_selected_relative_parent_escape_evidence_path',
      options: () => ({ repoRoot, evidencePath: relativeParentEscapePath }),
      mustNotExist: relativeParentEscapeTargets,
    },
    {
      id: 'O02',
      hazard: 'caller_selected_relative_parent_escape_output_path',
      options: () => ({ repoRoot, outputPath: relativeParentEscapePath }),
      mustNotExist: relativeParentEscapeTargets,
    },
    {
      id: 'O03',
      hazard: 'caller_selected_absolute_path_outside_evidence',
      options: () => ({ repoRoot, outputPath: outsideAbsolutePath }),
      mustNotExist: [outsideAbsolutePath],
    },
    {
      id: 'O04',
      hazard: 'caller_selected_output_in_fixtures_source',
      options: () => ({ repoRoot, outputPath: sourceFixturePath }),
      protectedPaths: [sourceFixturePath],
    },
    {
      id: 'O05',
      hazard: 'caller_selected_existing_file_overwrite',
      setup: async () => writeFile(existingSentinelPath, 'sentinel: do not overwrite\n'),
      options: () => ({ repoRoot, evidencePath: existingSentinelPath }),
      protectedPaths: [existingSentinelPath],
    },
    {
      id: 'O06',
      hazard: 'fixed_evidence_target_symlink_output',
      setup: async () => {
        await mkdir(adapterEvidenceDirectory(targetSymlinkRoot), { recursive: true });
        await writeFile(targetSymlinkOutside, 'outside symlink target\n');
        await symlink(targetSymlinkOutside, adapterEvidenceTarget(targetSymlinkRoot));
      },
      options: () => ({ repoRoot: targetSymlinkRoot }),
      protectedPaths: [targetSymlinkOutside],
    },
    {
      id: 'O07',
      hazard: 'fixed_evidence_parent_symlink_escape',
      setup: async () => {
        await mkdir(adapterEvidenceRoot(parentSymlinkRoot), { recursive: true });
        await mkdir(parentSymlinkOutside, { recursive: true });
        await writeFile(parentSymlinkEscapeTarget, 'parent symlink escape sentinel: do not overwrite\n');
        await symlink(parentSymlinkOutside, adapterEvidenceDirectory(parentSymlinkRoot));
      },
      options: () => ({ repoRoot: parentSymlinkRoot }),
      protectedPaths: [parentSymlinkEscapeTarget],
    },
    {
      id: 'O08',
      hazard: 'evidence_root_symlink_escape',
      setup: async () => {
        await mkdir(resolve(evidenceRootSymlinkRoot, 'implementation/synaptic-mesh-shadow-v0'), { recursive: true });
        await mkdir(evidenceRootSymlinkOutside, { recursive: true });
        await symlink(evidenceRootSymlinkOutside, adapterEvidenceRoot(evidenceRootSymlinkRoot));
      },
      options: () => ({ repoRoot: evidenceRootSymlinkRoot }),
      mustNotExist: [evidenceRootSymlinkEscapeDirectory, evidenceRootSymlinkEscapeTarget],
    },
  ];

  const rows = [];
  for (const testCase of cases) rows.push(await runRejectCase(testCase, validInput));

  const forbiddenConvenienceFlagRows = [];
  for (const testCase of forbiddenConvenienceFlagCases) {
    forbiddenConvenienceFlagRows.push({
      ...(await runRejectCase(testCase, validInput)),
      flag: testCase.flag,
    });
  }

  const outputContainmentRows = [];
  for (const testCase of outputContainmentCases) outputContainmentRows.push(await runOutputContainmentCase(testCase));
  const outputOutsideEvidenceRow = outputContainmentRows.find((row) => row.id === 'O01');
  rows.splice(6, 0, {
    id: 'H07',
    hazard: 'output_outside_evidence',
    accepted: outputOutsideEvidenceRow.accepted,
    sourceFileRead: false,
    capabilityTrueCount: 0,
    forbiddenEffects: outputOutsideEvidenceRow.forbiddenEffects,
    reasons: outputOutsideEvidenceRow.reasons,
  });

  assert.equal(rows.length, 17, 'negative controls must cover exactly 17 hazard cases');
  const unexpectedAccepts = rows.filter((row) => row.accepted).length;
  const sourceFilesRead = rows.filter((row) => row.sourceFileRead).length;
  const capabilityTrueCount = rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0);
  const rawClassifierLeakFindings = collectRawClassifierLeaks(rows);
  const forbiddenConvenienceCliFlagAccepts = forbiddenConvenienceFlagRows.filter((row) => row.accepted).length;
  const forbiddenConvenienceCliFlagSourceFilesRead = forbiddenConvenienceFlagRows.filter((row) => row.sourceFileRead).length;
  const forbiddenConvenienceCliFlagSurfaceFindings = forbiddenConvenienceFlagSurfaceFindings.length;
  const outputContainmentUnexpectedAccepts = outputContainmentRows.filter((row) => row.accepted).length;
  const outputContainmentForbiddenPathCreations = outputContainmentRows.filter((row) => row.forbiddenPathCreated).length;
  const outputContainmentProtectedFileMutations = outputContainmentRows.filter((row) => row.protectedFileMutated).length;
  const forbiddenEffects = rows.reduce((sum, row) => sum + row.forbiddenEffects, 0)
    + forbiddenConvenienceFlagRows.reduce((sum, row) => sum + row.forbiddenEffects, 0)
    + outputContainmentRows.reduce((sum, row) => sum + row.forbiddenEffects, 0)
    + staticFindings.length
    + forbiddenConvenienceCliFlagSurfaceFindings
    + rawClassifierLeakFindings.length;

  assert.equal(unexpectedAccepts, 0, 'negative controls must have zero unexpected accepts');
  assert.equal(sourceFilesRead, 0, 'negative controls must reject before reading source files');
  assert.equal(forbiddenConvenienceFlagRows.length, forbiddenConvenienceCliFlags.length, 'forbidden convenience CLI flag cases must cover the full flag list');
  assert.equal(forbiddenConvenienceCliFlagAccepts, 0, 'forbidden convenience CLI flag cases must have zero unexpected accepts');
  assert.equal(forbiddenConvenienceCliFlagSourceFilesRead, 0, 'forbidden convenience CLI flag cases must reject before reading source files');
  assert.equal(forbiddenConvenienceCliFlagSurfaceFindings, 0, 'adapter source and schemas must not expose forbidden convenience CLI flags');
  assert.equal(outputContainmentRows.length, 8, 'output containment negative controls must cover fixed and caller-selected escape cases');
  assert.equal(outputContainmentUnexpectedAccepts, 0, 'output containment negative controls must have zero unexpected accepts');
  assert.equal(outputContainmentForbiddenPathCreations, 0, 'output containment negative controls must not create forbidden paths');
  assert.equal(outputContainmentProtectedFileMutations, 0, 'output containment negative controls must not mutate protected files');
  assert.equal(staticFindings.length, 0, 'adapter source must not contain network/discovery/tool execution primitives');
  assert.equal(rawClassifierLeakFindings.length, 0, 'negative controls must not expose raw classifier route fields');
  assert.equal(forbiddenEffects, 0, 'negative controls must have zero forbidden effects');
  assert.equal(capabilityTrueCount, 0, 'negative controls must have zero true capability flags');

  const output = {
    artifact: 'T-synaptic-mesh-read-only-local-file-adapter-negative-controls-v0.5.0-alpha-pr3',
    timestamp: '2026-05-13T23:25:00.000Z',
    summary: {
      readOnlyLocalFileAdapterNegativeControls: 'pass',
      negativeCases: rows.length,
      unexpectedAccepts,
      forbiddenEffects,
      capabilityTrueCount,
      sourceFilesRead,
      forbiddenConvenienceCliFlags,
      forbiddenConvenienceCliFlagCases: forbiddenConvenienceFlagRows.length,
      forbiddenConvenienceCliFlagAccepts,
      forbiddenConvenienceCliFlagSourceFilesRead,
      forbiddenConvenienceCliFlagSurfaceFindings,
      outputContainmentCases: outputContainmentRows.length,
      outputContainmentUnexpectedAccepts,
      outputContainmentForbiddenPathCreations,
      outputContainmentProtectedFileMutations,
      networkPrimitiveFindings: staticFindings.length,
      rawClassifierLeakFindings: rawClassifierLeakFindings.length,
    },
    rows,
    forbiddenConvenienceFlagRows,
    outputContainmentRows,
    forbiddenConvenienceFlagSurfaceFindings,
    staticFindings,
    rawClassifierLeakFindings,
    boundary: [
      'real_adapter_negative_controls',
      'reject_raw_input',
      'reject_url_or_network_input',
      'reject_directory_glob_traversal_symlink_escape',
      'reject_output_escape',
      'reject_evidence_output_containment_escape',
      'reject_symlink_output',
      'reject_unapproved_overwrite',
      'reject_output_to_fixtures_source',
      'reject_forbidden_convenience_cli_flags',
      'reject_tools_memory_config_publication',
      'reject_approval_block_allow_authorization_enforcement',
      'reject_agent_consumed_and_machine_policy_output',
      'record_only',
    ],
  };

  await import('node:fs/promises').then(({ mkdir, writeFile }) => mkdir(dirname(evidencePath), { recursive: true }).then(() => writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`)));
  console.log(JSON.stringify(output, null, 2));
} finally {
  await rm(workDir, { recursive: true, force: true });
}
