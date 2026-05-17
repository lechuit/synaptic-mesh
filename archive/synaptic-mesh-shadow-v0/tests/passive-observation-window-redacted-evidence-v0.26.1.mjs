import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';
import { passiveObservationWindowInput } from './passive-observation-window-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = await runPassiveObservationWindow(await passiveObservationWindowInput());
assert.equal(artifact.windowStatus, 'OBSERVATION_WINDOW_COMPLETE');
assert.equal(artifact.redactedEvidencePacket.packetVersion, 'passive-observation-window-redacted-evidence-v0.26.1');
assert.equal(artifact.redactedEvidencePacket.rawSourceCache, 'excluded');
assert.equal(artifact.redactedEvidencePacket.rawPersisted, false);
assert.equal(artifact.redactedEvidencePacket.policyDecision, null);
assert.equal(artifact.redactedEvidencePacket.redactedPreviews.length > 0, true);
assert.equal(artifact.redactedEvidencePacket.redactedPreviews.every((entry) => entry.rawPersisted === false && entry.policyDecision === null), true);
await writeFile(resolve('evidence/passive-observation-window-redacted-evidence-v0.26.1.out.json'), JSON.stringify(artifact.redactedEvidencePacket, null, 2) + '\n');
console.log(JSON.stringify({ previewCount: artifact.redactedEvidencePacket.redactedPreviews.length }, null, 2));
