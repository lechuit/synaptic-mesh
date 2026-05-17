import {
  readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput,
  scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation,
} from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

export async function receiverUsefulnessLiveObservationInputFixture(){
  return readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput();
}

export async function receiverUsefulnessLiveObservationArtifactFixture(){
  return scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation(await receiverUsefulnessLiveObservationInputFixture());
}
