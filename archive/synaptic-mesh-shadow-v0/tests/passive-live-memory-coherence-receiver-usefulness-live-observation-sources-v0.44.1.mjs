import assert from 'node:assert/strict';
import { receiverUsefulnessLiveObservationArtifactFixture, receiverUsefulnessLiveObservationInputFixture } from './passive-live-memory-coherence-receiver-usefulness-live-observation-fixtures.mjs';

const input = await receiverUsefulnessLiveObservationInputFixture();
assert.equal(input.sourceArtifactSha256, '7746da106e59f78d2ff5c0fbc359c5d03251a1fddc9d2fbdfbff13d5a11698e5');
assert.equal(input.liveSourcePacks.length, 4);
assert(input.liveSourcePacks.every((p) => p.redactedBeforePersist === true && p.rawPersisted === false && p.repoLocalSource === true && p.readOnly === true));

const artifact = await receiverUsefulnessLiveObservationArtifactFixture();
assert.equal(artifact.liveObservationStatus, 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE');
assert.equal(artifact.liveObservationItems.length, 5);
assert.equal(artifact.liveObservationItems.filter((i) => i.humanTreatment === 'include_for_human_context').length, 3);
assert.equal(artifact.liveObservationItems.filter((i) => i.humanTreatment === 'exclude_as_stale_from_human_context').length, 1);
assert.equal(artifact.liveObservationItems.filter((i) => i.humanTreatment === 'include_as_contradiction_caution').length, 1);
assert(artifact.liveObservationItems.every((i) => i.sourceBound === true && i.promoteToMemory === false && i.agentConsumedOutput === false));
console.log(JSON.stringify({ sources: input.liveSourcePacks.length, observations: artifact.liveObservationItems.length }));
