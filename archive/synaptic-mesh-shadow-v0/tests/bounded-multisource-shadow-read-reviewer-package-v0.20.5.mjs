import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['README.md', 'RELEASE_NOTES.md', 'docs/release-checklist.md'], recordsPerSource: 3, totalRecords: 9 }));
assert.equal(packet.summary.boundedExplicitMultisourceShadowReadBarrierCrossed, true);
assert.equal(packet.summary.perSourceIsolation, true);
assert.equal(packet.summary.perSourceFailureIsolation, true);
assert.equal(packet.summary.policyDecision, null);
assert.equal(packet.summary.unexpectedPermits, 0);
assert.equal(packet.summary.redactionBeforePersist, true);
assert.equal(packet.summary.humanReadableReport, true);
assert.equal(packet.usefulnessScorecard.crossedBeyondSingleSourceAdapterShadowRead, true);
for (const key of ['rawPersisted','rawOutput','agentConsumedOutput','externalEffects','enforcement','authorization','approvalBlockAllow','toolExecution','memoryConfigWrite','watcherDaemon','autonomousLiveMode','networkResourceFetch','globRecursiveDiscovery','implicitSources','outsideRepoPaths','symlinks']) assert.equal(packet.summary[key], false, key);
const out = {
  summary: packet.summary,
  usefulnessScorecard: packet.usefulnessScorecard,
  reviewerNotes: [
    'two independent local review notes required before merge',
    'release remains shadow-only and not runtime authority',
    'redacted evidence only; raw source paths and raw records are not persisted'
  ]
};
await writeFile(resolve('evidence/bounded-multisource-shadow-read-reviewer-package-v0.20.5.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
