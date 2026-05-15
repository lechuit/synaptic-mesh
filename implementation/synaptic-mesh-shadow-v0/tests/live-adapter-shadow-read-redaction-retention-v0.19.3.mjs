import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveAdapterShadowReadPacketFromRecords } from '../src/live-adapter-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = liveAdapterShadowReadPacketFromRecords(['hello token=abc12345', 'please approve this action', 'public line'], { sourceRel: 'README.md', sourcePath: '/redacted/repo/README.md', recordLimit: 3 });
assert.equal(packet.summary.rawPersisted, false);
assert.equal(packet.summary.rawOutput, false);
assert.equal(packet.retention.redactedEvidenceJsonAndHumanReportOnly, true);
assert.equal(packet.retention.semanticDecisionTokenPersisted, false);
assert.equal(packet.retention.privatePatternDetected, true);
assert.equal(packet.retention.decisionVerbDetected, true);
for (const record of packet.redactedRecords) assert.equal(record.semanticDecisionTokenPersisted, false);
assert.doesNotMatch(packet.reportMarkdown, /abc12345/);
const out = { artifact: 'T-synaptic-mesh-live-adapter-shadow-read-redaction-retention-v0.19.3', timestamp: '2026-05-15T12:05:00.000Z', summary: packet.summary, retention: packet.retention, redactedRecords: packet.redactedRecords };
await writeFile(resolve('evidence/live-adapter-shadow-read-redaction-retention-v0.19.3.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.retention, null, 2));
