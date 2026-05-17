import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { boundedMultisourceShadowReadNegativeControlSummary, parseBoundedMultisourceShadowReadArgs, runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const cases = JSON.parse(await readFile(resolve('fixtures/bounded-multisource-shadow-read-negative-controls-v0.20.4.json'), 'utf8'));
const rejected = [];
for (const item of cases) {
  const parsedOnlyReject = !['fixture-positive-source', 'outside-repo'].includes(item.name);
  if (parsedOnlyReject) assert.throws(() => parseBoundedMultisourceShadowReadArgs(item.args), /rejected|required|exceeds|duplicate|glob|URL|unsupported|unknown|source/i, item.name);
  else await assert.rejects(async () => runBoundedMultisourceShadowRead(parseBoundedMultisourceShadowReadArgs(item.args)), /at least two successfully read|fixture|inside this repository|no such file|source/i, item.name);
  rejected.push(item.name);
}
const linkPath = resolve('evidence/bounded-multisource-shadow-read-symlink-control.md');
await rm(linkPath, { force: true });
await symlink(resolve('README.md'), linkPath);
await assert.rejects(() => runBoundedMultisourceShadowRead({ sources: ['README.md', 'evidence/bounded-multisource-shadow-read-symlink-control.md'] }), /at least two successfully read|symlink/i);
await rm(linkPath, { force: true });
rejected.push('symlink-source');

for (const invalid of [
  { name: 'api-records-per-source-nan', recordsPerSource: NaN, totalRecords: 12 },
  { name: 'api-total-records-nan', recordsPerSource: 5, totalRecords: NaN },
  { name: 'api-records-per-source-infinity', recordsPerSource: Infinity, totalRecords: 12 },
  { name: 'api-total-records-infinity', recordsPerSource: 5, totalRecords: Infinity },
  { name: 'api-records-per-source-string', recordsPerSource: '5', totalRecords: 12 },
  { name: 'api-total-records-string', recordsPerSource: 5, totalRecords: '12' },
  { name: 'api-records-per-source-zero', recordsPerSource: 0, totalRecords: 12 },
  { name: 'api-total-records-zero', recordsPerSource: 5, totalRecords: 0 },
  { name: 'api-records-per-source-too-high', recordsPerSource: 6, totalRecords: 12 },
  { name: 'api-total-records-too-high', recordsPerSource: 5, totalRecords: 13 }
]) {
  await assert.rejects(() => runBoundedMultisourceShadowRead({ sources: ['README.md', 'RELEASE_NOTES.md'], recordsPerSource: invalid.recordsPerSource, totalRecords: invalid.totalRecords }), /preflight rejected before read|finite integer|exceeds/i, invalid.name);
  rejected.push(invalid.name);
}
await assert.rejects(() => runBoundedMultisourceShadowRead({ sources: ['README.md'] }), /preflight rejected before read|at_least_two/i, 'api-single-source-pre-read-reject');
rejected.push('api-single-source-pre-read-reject');
await assert.rejects(() => runBoundedMultisourceShadowRead({ sources: ['README.md', 'RELEASE_NOTES.md', 'RELEASE_CANDIDATE.md', 'MANIFEST.json'] }), /preflight rejected before read|source_count_exceeds_max/i, 'api-too-many-sources-pre-read-reject');
rejected.push('api-too-many-sources-pre-read-reject');
const summary = boundedMultisourceShadowReadNegativeControlSummary(rejected);
assert.equal(summary.unexpectedPermits, 0);
assert.equal(summary.expectedRejects >= 30, true);
const out = { summary };
await writeFile(resolve('evidence/bounded-multisource-shadow-read-negative-controls-v0.20.4.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
