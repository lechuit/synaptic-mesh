import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveReadGateNegativeControlSummary, parseLiveReadGateArgs } from '../src/live-read-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const source = JSON.parse(await readFile(resolve('fixtures/live-read-gate-negative-controls-v0.18.4.json'), 'utf8'));
let rejects = 0;
for (const c of source.cases) {
  try { parseLiveReadGateArgs(['--source', 'README.md', c]); } catch { rejects += 1; }
}
assert.throws(() => parseLiveReadGateArgs(['--source', 'README.md', '--records', '13']), /excess N rejected/);
rejects += 1;
const summary = liveReadGateNegativeControlSummary([...source.cases, '--records=13']);
assert.equal(rejects, source.cases.length + 1);
assert.equal(summary.unexpectedPermits, 0);
const out = { artifact: 'T-synaptic-mesh-live-read-gate-negative-controls-v0.18.4', timestamp: '2026-05-15T11:00:00.000Z', summary: { ...summary, observedRejects: rejects } };
await writeFile(resolve('evidence/live-read-gate-negative-controls-v0.18.4.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
