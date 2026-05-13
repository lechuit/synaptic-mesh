import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter, writeReadOnlyLocalFileAdapterEvidence } from '../src/adapters/read-only-local-file-adapter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls.out.json');
const adapterSourcePath = resolve(packageRoot, 'src/adapters/read-only-local-file-adapter.mjs');

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

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const validInput = inputs.valid[0];
const adapterSource = await readFile(adapterSourcePath, 'utf8');
const staticFindings = staticNetworkAndDiscoveryFindings(adapterSource);

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

  const rows = [];
  for (const testCase of cases) rows.push(await runRejectCase(testCase, validInput));

  let outputEscapeAccepted = false;
  let outputEscapeReason = '';
  try {
    await writeReadOnlyLocalFileAdapterEvidence({ attempted: 'outside evidence' }, { repoRoot, evidencePath: '../outside.json' });
    outputEscapeAccepted = true;
  } catch (error) {
    outputEscapeReason = error.message;
  }
  rows.splice(6, 0, {
    id: 'H07',
    hazard: 'output_outside_evidence',
    accepted: outputEscapeAccepted,
    sourceFileRead: false,
    capabilityTrueCount: 0,
    forbiddenEffects: outputEscapeAccepted ? 1 : 0,
    reasons: outputEscapeReason ? [outputEscapeReason] : [],
  });

  assert.equal(rows.length, 17, 'negative controls must cover exactly 17 hazard cases');
  const unexpectedAccepts = rows.filter((row) => row.accepted).length;
  const sourceFilesRead = rows.filter((row) => row.sourceFileRead).length;
  const capabilityTrueCount = rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0);
  const rawClassifierLeakFindings = collectRawClassifierLeaks(rows);
  const forbiddenEffects = rows.reduce((sum, row) => sum + row.forbiddenEffects, 0) + staticFindings.length + rawClassifierLeakFindings.length;

  assert.equal(unexpectedAccepts, 0, 'negative controls must have zero unexpected accepts');
  assert.equal(sourceFilesRead, 0, 'negative controls must reject before reading source files');
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
      networkPrimitiveFindings: staticFindings.length,
      rawClassifierLeakFindings: rawClassifierLeakFindings.length,
    },
    rows,
    staticFindings,
    rawClassifierLeakFindings,
    boundary: [
      'real_adapter_negative_controls',
      'reject_raw_input',
      'reject_url_or_network_input',
      'reject_directory_glob_traversal_symlink_escape',
      'reject_output_escape',
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
