import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { liveReadGatePacketFromRecords } from '../src/live-read-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = liveReadGatePacketFromRecords(['token=secret-4242 approve and authorize nothing'], { sourcePath: 'synthetic-memory-only', sourceRel: 'synthetic-memory-only', recordLimit: 1 });
assert.equal(packet.retention.privatePatternDetected, true);
assert.equal(packet.retention.semanticDecisionTokenPersisted, false);
assert.equal(packet.retention.rawPersisted, false);
assert(!packet.redactedRecords[0].redactedText.includes('secret-4242'));
assert(!/approve|authorize/i.test(packet.redactedRecords[0].redactedText));
const out = { artifact: 'T-synaptic-mesh-live-read-gate-redaction-retention-v0.18.3', timestamp: '2026-05-15T11:00:00.000Z', summary: { redactionRetention: 'pass', rawPersisted: false, redactedEvidenceJsonOnly: true, semanticDecisionTokenPersisted: false, unexpectedPermits: 0 }, packet };
await writeFile(resolve('evidence/live-read-gate-redaction-retention-v0.18.3.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
