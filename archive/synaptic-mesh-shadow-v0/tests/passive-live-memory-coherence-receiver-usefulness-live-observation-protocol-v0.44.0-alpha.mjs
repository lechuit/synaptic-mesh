import assert from 'node:assert/strict';
import { passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationProtocol } from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

const protocol = passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationProtocol();
assert.equal(protocol.releaseLayer, 'v0.44.0-alpha');
assert.equal(protocol.barrierCrossed, 'passive_live_memory_coherence_receiver_usefulness_live_observation');
assert.equal(protocol.buildsOn, 'v0.43.5_passive_live_memory_coherence_receiver_usefulness_repeatability_scorecard');
assert.equal(protocol.preReadPathPinned, true);
assert.equal(protocol.liveObservationOnly, true);
assert.equal(protocol.repoLocalSourcesOnly, true);
assert.equal(protocol.rawPersisted, false);
assert.equal(protocol.agentConsumedOutput, false);
assert.equal(protocol.noMemoryWrites, true);
assert.equal(protocol.noRuntimeIntegration, true);
assert(!Object.prototype.hasOwnProperty.call(protocol, 'policyDecision'));
console.log(JSON.stringify({ ok: true, protocol: protocol.releaseLayer, preReadPathPinned: protocol.preReadPathPinned }));
