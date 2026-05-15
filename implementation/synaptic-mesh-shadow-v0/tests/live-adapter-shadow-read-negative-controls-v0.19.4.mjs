import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveAdapterShadowReadNegativeControlSummary, parseLiveAdapterShadowReadArgs } from '../src/live-adapter-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const source = JSON.parse(await readFile(resolve('fixtures/live-adapter-shadow-read-negative-controls-v0.19.4.json'), 'utf8'));
let rejects = 0;
for (const c of source.cases) {
  try { parseLiveAdapterShadowReadArgs(['--source', 'README.md', c]); } catch { rejects += 1; }
}
for (const args of [
  ['--source', 'README.md', '--records', '13'],
  ['--source', 'README.md', '--adapter', 'network-adapter'],
  ['--source', 'README.md', '--adapter=repo-local-file-read-adapter-v0', '--batch']
]) {
  assert.throws(() => parseLiveAdapterShadowReadArgs(args));
  rejects += 1;
}
const allCases = [...source.cases, '--records=13', '--adapter network-adapter', '--batch with adapter'];
const summary = liveAdapterShadowReadNegativeControlSummary(allCases);
assert.equal(rejects, allCases.length);
assert.equal(summary.unexpectedPermits, 0);
assert.equal(summary.unsupportedAdapterRejected, true);
assert.equal(summary.multiAdapterRejected, true);
const out = { artifact: 'T-synaptic-mesh-live-adapter-shadow-read-negative-controls-v0.19.4', timestamp: '2026-05-15T12:05:00.000Z', summary: { ...summary, observedRejects: rejects } };
await writeFile(resolve('evidence/live-adapter-shadow-read-negative-controls-v0.19.4.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
