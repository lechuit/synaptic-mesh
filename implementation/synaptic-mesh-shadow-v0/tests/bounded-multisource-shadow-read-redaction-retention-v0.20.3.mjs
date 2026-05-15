import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { boundedMultisourceShadowReadPacketFromResults } from '../src/bounded-multisource-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = boundedMultisourceShadowReadPacketFromResults([
  { sourceIndex: 0, status: 'ok', sourceInfo: { abs: '/repo/a.md', repoRelative: 'a.md', size: 10, mtimeMs: 1 }, records: ['password: hunter2', 'operator note only'] },
  { sourceIndex: 1, status: 'ok', sourceInfo: { abs: '/repo/b.md', repoRelative: 'b.md', size: 10, mtimeMs: 2 }, records: ['token=abc123456789', 'passive shadow read'] },
], { sources: ['a.md', 'b.md'], recordsPerSource: 5, totalRecords: 12 });
assert.equal(packet.summary.rawPersisted, false);
assert.equal(packet.summary.rawOutput, false);
assert.equal(packet.retention.redactedEvidenceJsonAndHumanReportOnly, true);
assert.equal(packet.retention.semanticDecisionTokenPersisted, false);
assert.equal(packet.retention.privatePatternDetected, true);
assert.equal(JSON.stringify(packet).includes('hunter2'), false);
assert.equal(JSON.stringify(packet).includes('abc123456789'), false);
assert.equal(packet.redactedRecords.every((record) => record.rawSha256 && record.redactedSha256), true);
await writeFile(resolve('evidence/bounded-multisource-shadow-read-redaction-retention-v0.20.3.out.json'), JSON.stringify({ summary: packet.summary, retention: packet.retention, redactedRecords: packet.redactedRecords }, null, 2) + '\n');
console.log(JSON.stringify(packet.retention, null, 2));
