import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/adapter-implementation-hazard-catalog-v0.4.8.json');
const evidencePath = resolve(packageRoot, 'evidence/adapter-implementation-hazard-catalog-v0.4.8.out.json');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const catalogPath = resolve(repoRoot, 'docs/adapter-implementation-hazard-catalog-v0.4.8.md');
const statusPath = resolve(repoRoot, 'docs/status-v0.4.8.md');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));
const catalog = await readFile(catalogPath, 'utf8');
const status = await readFile(statusPath, 'utf8');

const requiredPaths = [
  'docs/adapter-implementation-hazard-catalog-v0.4.8.md',
  'docs/status-v0.4.8.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/adapter-implementation-hazard-catalog-v0.4.8.json',
  'implementation/synaptic-mesh-shadow-v0/tests/adapter-implementation-hazard-catalog.mjs',
];
for (const filePath of requiredPaths) {
  await stat(resolve(repoRoot, filePath));
  assert.ok(manifestFilePaths.has(filePath), `MANIFEST.files.json must include ${filePath}`);
}

for (const phrase of [
  'Adapter implementation hazard catalog',
  'pre-implementation hazard catalog only',
  'Do **not** implement',
  'raw input',
  'URL input',
  'directory input',
  'glob input',
  'directory traversal',
  'symlink escape',
  'output outside evidence',
  'agent-consumed output',
  'machine-readable policy leak',
  'tool execution attempt',
  'memory write attempt',
  'config write attempt',
  'external publication attempt',
  'approval attempt',
  'block/allow attempt',
  'authorization attempt',
  'enforcement attempt',
  'v0.5.0-alpha — first real read-only local-file adapter canary',
]) {
  assert.ok(catalog.includes(phrase), `hazard catalog must include ${phrase}`);
}
assert.ok(status.toLowerCase().includes('pre-implementation only'), 'status must preserve pre-implementation language');
assert.ok(status.toLowerCase().includes('no adapter implementation'), 'status must preserve no implementation language');

assert.equal(fixture.adapterImplementationHazardCatalog, 'pass');
assert.equal(fixture.releaseLayer, 'v0.4.8');
assert.equal(fixture.basedOnDesignNote, 'v0.4.7');
assert.equal(fixture.implementationAuthorized, false);
assert.equal(fixture.goToV050AlphaCanaryIfStillGreen, true);
assert.equal(fixture.hazardCases.length, 17);
assert.equal(fixture.hazardCases.filter((hazard) => hazard.accepted === false).length, 17);
assert.equal(fixture.hazardCases.filter((hazard) => hazard.route === 'reject').length, 17);

for (const field of [
  'rawInputAllowed',
  'urlInputAllowed',
  'directoryInputAllowed',
  'globAllowed',
  'directoryTraversalAllowed',
  'symlinkEscapeAllowed',
  'outputOutsideEvidenceAllowed',
  'agentConsumed',
  'machineReadablePolicyDecision',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]) {
  assert.equal(fixture[field], false, `${field} must remain false`);
}
assert.deepEqual(fixture.failures, []);

const output = {
  artifact: 'T-synaptic-mesh-adapter-implementation-hazard-catalog-v0.4.8',
  timestamp: '2026-05-13T22:40:00.000Z',
  summary: {
    adapterImplementationHazardCatalog: fixture.adapterImplementationHazardCatalog,
    releaseLayer: fixture.releaseLayer,
    basedOnDesignNote: fixture.basedOnDesignNote,
    implementationAuthorized: fixture.implementationAuthorized,
    goToV050AlphaCanaryIfStillGreen: fixture.goToV050AlphaCanaryIfStillGreen,
    hazardCases: fixture.hazardCases.length,
    rejectedOrDowngraded: fixture.hazardCases.filter((hazard) => hazard.accepted === false).length,
    unexpectedAccepts: fixture.hazardCases.filter((hazard) => hazard.accepted !== false).length,
    rawInputAllowed: fixture.rawInputAllowed,
    urlInputAllowed: fixture.urlInputAllowed,
    directoryInputAllowed: fixture.directoryInputAllowed,
    globAllowed: fixture.globAllowed,
    directoryTraversalAllowed: fixture.directoryTraversalAllowed,
    symlinkEscapeAllowed: fixture.symlinkEscapeAllowed,
    outputOutsideEvidenceAllowed: fixture.outputOutsideEvidenceAllowed,
    agentConsumed: fixture.agentConsumed,
    machineReadablePolicyDecision: fixture.machineReadablePolicyDecision,
    toolExecution: fixture.toolExecution,
    memoryWrite: fixture.memoryWrite,
    configWrite: fixture.configWrite,
    externalPublication: fixture.externalPublication,
    approvalEmission: fixture.approvalEmission,
    mayBlock: fixture.mayBlock,
    mayAllow: fixture.mayAllow,
    authorization: fixture.authorization,
    enforcement: fixture.enforcement,
  },
  boundary: [
    'hazard_catalog_only',
    'pre_implementation',
    'go_v0_5_alpha_canary_if_still_green',
    'no_current_implementation',
    'reject_raw_input',
    'reject_url_input',
    'reject_directory_input',
    'reject_glob_input',
    'reject_traversal',
    'reject_symlink_escape',
    'reject_output_escape',
    'reject_agent_consumption',
    'reject_machine_policy',
    'reject_tools_memory_config_publication',
    'reject_approval_block_allow_authorization_enforcement',
  ],
};
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
