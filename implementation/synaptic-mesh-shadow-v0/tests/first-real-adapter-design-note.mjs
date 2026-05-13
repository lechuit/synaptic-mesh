import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/first-real-adapter-design-note-v0.4.7.json');
const evidencePath = resolve(packageRoot, 'evidence/first-real-adapter-design-note-v0.4.7.out.json');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const designNotePath = resolve(repoRoot, 'docs/first-real-adapter-design-note-v0.4.7.md');
const statusPath = resolve(repoRoot, 'docs/status-v0.4.7.md');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));
const designNote = await readFile(designNotePath, 'utf8');
const status = await readFile(statusPath, 'utf8');

const requiredPaths = [
  'docs/first-real-adapter-design-note-v0.4.7.md',
  'docs/status-v0.4.7.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/first-real-adapter-design-note-v0.4.7.json',
  'implementation/synaptic-mesh-shadow-v0/tests/first-real-adapter-design-note.mjs',
];
for (const filePath of requiredPaths) {
  await stat(resolve(repoRoot, filePath));
  assert.ok(manifestFilePaths.has(filePath), `MANIFEST.files.json must include ${filePath}`);
}

for (const phrase of [
  'First real adapter design note',
  'design note only',
  'read-only local-file adapter',
  'one explicit already-redacted local file',
  'evidence record-only',
  'Do **not** implement',
  'MCP client/server',
  'LangGraph integration',
  'GitHub bot',
  'watcher',
  'daemon',
  'directory scan',
  'glob input',
  'directory traversal',
  'symlink escape',
  'URL input',
  'network call',
  'tool execution',
  'memory write',
  'config write',
  'external publication',
  'agent instruction',
  'approval',
  'block/allow',
  'authorization',
  'enforcement',
  'v0.4.8 — adapter implementation hazard catalog',
]) {
  assert.ok(designNote.includes(phrase), `design note must include ${phrase}`);
}
assert.ok(status.toLowerCase().includes('design-only'), 'status must preserve design-only language');
assert.ok(status.toLowerCase().includes('no implementation'), 'status must preserve no implementation language');

assert.equal(fixture.firstRealAdapterDesignNote, 'pass');
assert.equal(fixture.releaseLayer, 'v0.4.7');
assert.equal(fixture.basedOnHumanReview, 'v0.4.6');
assert.equal(fixture.candidateAdapter, 'read_only_local_file_adapter');
assert.equal(fixture.designOnly, true);
assert.equal(fixture.implementationAuthorized, false);
assert.equal(fixture.goToHazardCatalog, true);
assert.equal(fixture.goToV050AlphaImplementation, false);
assert.equal(fixture.requiresMaintainerDecisionForImplementation, true);
assert.equal(fixture.inputLimit, 'one_explicit_already_redacted_local_file');
assert.equal(fixture.outputLimit, 'evidence_record_only');

for (const field of [
  'globAllowed',
  'directoryInputAllowed',
  'directoryTraversalAllowed',
  'symlinkEscapeAllowed',
  'urlInputAllowed',
  'networkAllowed',
  'watcherAllowed',
  'daemonAllowed',
  'frameworkSdkAllowed',
  'mcpAllowed',
  'langGraphAllowed',
  'githubBotAllowed',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'agentInstruction',
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
  artifact: 'T-synaptic-mesh-first-real-adapter-design-note-v0.4.7',
  timestamp: '2026-05-13T22:25:00.000Z',
  summary: fixture,
  boundary: [
    'design_note_only',
    'read_only_local_file_adapter_candidate',
    'one_explicit_already_redacted_local_file',
    'evidence_record_only',
    'go_hazard_catalog_next',
    'no_implementation',
    'no_mcp',
    'no_langgraph',
    'no_github_bot',
    'no_watcher',
    'no_daemon',
    'no_directory_scan',
    'no_glob',
    'no_directory_traversal',
    'no_symlink_escape',
    'no_url',
    'no_network',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_agent_instruction',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
  ],
};
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
