import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { receiverUsefulnessLiveObservationArtifactFixture } from './passive-live-memory-coherence-receiver-usefulness-live-observation-fixtures.mjs';
import { validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact } from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

const artifact = await receiverUsefulnessLiveObservationArtifactFixture();
assert.deepEqual(validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact(artifact), []);
assert.equal(artifact.liveObservationStatus, 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE');
assert.equal(artifact.metrics.liveObservationItemCount, 5);
assert.equal(artifact.metrics.receiverUsefulnessRatio, 1);
assert.equal(artifact.metrics.boundaryViolationCount, 0);
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json', `${JSON.stringify(artifact, null, 2)}\n`);
await writeFile('evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-report-v0.44.5.out.md', `${artifact.reportMarkdown}\n`);
console.log(JSON.stringify({ liveObservationStatus: artifact.liveObservationStatus, liveObservationItemCount: artifact.metrics.liveObservationItemCount }));
