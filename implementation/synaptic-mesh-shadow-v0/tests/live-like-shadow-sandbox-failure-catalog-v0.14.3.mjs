import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateLiveLikeNegativeControls } from '../src/live-like-shadow-negative-controls.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const evidencePath = resolve(packageRoot, 'evidence/live-like-shadow-sandbox-failure-catalog-v0.14.3.out.json');
const docs = await readFile(resolve(repoRoot, 'docs/live-like-shadow-sandbox-failure-catalog-v0.14.3.md'), 'utf8');
const phrases = ['tool request', 'approval-ish text', 'stale source', 'missing redaction', 'framework-looking route', 'fail-closed', 'degrade', 'record-only', 'unexpected permits 0', 'not runtime authority', 'release:check -- --target v0.14.3'];
assert.deepEqual(phrases.filter((phrase) => !docs.includes(phrase)), [], 'docs must include required phrases');
const cases = JSON.parse(await readFile(resolve(packageRoot, 'fixtures/live-like-shadow-negative-controls-v0.14.3.json'), 'utf8'));
const summary = evaluateLiveLikeNegativeControls(cases);
assert.equal(summary.sandboxFailureCatalog, 'pass');
assert.equal(summary.negativeControls, 5);
assert.deepEqual(summary.dangerousLabels, ['tool request', 'approval-ish text', 'stale source', 'missing redaction', 'framework-looking route']);
assert.equal(summary.failClosedOrDegradeOrRecordOnly, true);
assert.equal(summary.unexpectedPermits, 0);
for (const record of summary.records) {
  assert.equal(record.matchesExpected, true, record.caseId);
  assert.equal(record.permitEmitted, false, record.caseId);
  assert.equal(record.runtimeAuthority, false, record.caseId);
  assert.equal(record.toolExecution, false, record.caseId);
  assert.equal(record.policyDecision, false, record.caseId);
  assert.equal(record.enforcement, false, record.caseId);
}
const output = { artifact: 'T-synaptic-mesh-live-like-shadow-sandbox-failure-catalog-v0.14.3', timestamp: '2026-05-14T23:59:00.000Z', summary };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
