import assert from 'node:assert/strict';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/read-only-adapter-human-review-go-no-go-v0.4.6.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-adapter-human-review-go-no-go-v0.4.6.out.json');
const manifestFilesPath = resolve(repoRoot, 'MANIFEST.files.json');
const recordPath = resolve(repoRoot, 'docs/read-only-adapter-human-review-findings-go-no-go-v0.4.6.md');
const statusPath = resolve(repoRoot, 'docs/status-v0.4.6.md');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const manifestFiles = JSON.parse(await readFile(manifestFilesPath, 'utf8'));
const manifestFilePaths = new Set(manifestFiles.files.map((entry) => entry.path));
const record = await readFile(recordPath, 'utf8');
const status = await readFile(statusPath, 'utf8');

const requiredPaths = [
  'docs/read-only-adapter-human-review-findings-go-no-go-v0.4.6.md',
  'docs/status-v0.4.6.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-adapter-human-review-go-no-go-v0.4.6.json',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-adapter-human-review-go-no-go.mjs',
];
for (const filePath of requiredPaths) {
  await stat(resolve(repoRoot, filePath));
  assert.ok(manifestFilePaths.has(filePath), `MANIFEST.files.json must include ${filePath}`);
}

for (const phrase of [
  'Human review findings / go-no-go record',
  'Go for holding v0.4.x as a public, review-only, non-authoritative package',
  'Go for designing the first real adapter boundary',
  'No-go for implementing a real adapter',
  'real adapter',
  'framework SDK import',
  'MCP client/server',
  'A2A integration',
  'LangGraph integration',
  'GitHub bot',
  'watcher',
  'daemon',
  'network call',
  'tool execution',
  'memory write',
  'config write',
  'approval emission',
  'block/allow',
  'authorization',
  'enforcement',
  'agent instruction packet',
  'machine-readable policy decision',
  'executable action plan',
  'APPROVE',
]) {
  assert.ok(record.includes(phrase), `go/no-go record must include ${phrase}`);
}
assert.ok(status.toLowerCase().includes('not runtime-ready'), 'status must preserve not runtime-ready language');
assert.ok(status.toLowerCase().includes('not production/enforcement-ready'), 'status must preserve not production/enforcement-ready language');

assert.equal(fixture.adapterBoundaryHumanReview, 'pass');
assert.equal(fixture.humanReviewFindingsGoNoGo, 'pass');
assert.equal(fixture.releaseLayer, 'v0.4.6');
assert.equal(fixture.reviewedRelease, 'v0.4.5');
assert.equal(fixture.goForPublicReviewOnly, true);
assert.equal(fixture.goToRealAdapterDesign, true);
assert.equal(fixture.goToRealAdapterImplementation, false);
assert.equal(fixture.requiresMaintainerDecisionForImplementation, true);
assert.equal(fixture.openBlockingRisks, 0);
assert.equal(fixture.independentLocalReviews, 2);
assert.deepEqual(fixture.independentLocalReviewVerdicts, ['APPROVE', 'APPROVE']);

for (const field of [
  'realAdapterAuthorized',
  'frameworkIntegrationAuthorized',
  'liveTrafficAuthorized',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublicationByAdapter',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]) {
  assert.equal(fixture[field], false, `${field} must remain false`);
}
assert.deepEqual(fixture.failures, []);

const output = {
  artifact: 'T-synaptic-mesh-read-only-adapter-human-review-go-no-go-v0.4.6',
  timestamp: '2026-05-13T16:20:00.000Z',
  summary: fixture,
  boundary: [
    'human_review_findings_only',
    'go_public_review_only',
    'go_real_adapter_design_only',
    'no_real_adapter_implementation',
    'no_real_adapter',
    'no_framework_integration',
    'no_live_traffic',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_external_publication_by_adapter',
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
