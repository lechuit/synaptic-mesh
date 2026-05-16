import assert from 'node:assert/strict';
import { passiveLiveMemoryCoherenceStableInvalidationReceiverPackageProtocol } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';

const protocol = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageProtocol();
assert.equal(protocol.releaseLayer, 'v0.41.0-alpha');
assert.equal(protocol.barrierCrossed, 'passive_live_memory_coherence_stable_invalidation_receiver_package');
assert.equal(protocol.buildsOn, 'v0.40.5_passive_live_memory_coherence_invalidation_repeatability_scorecard');
assert.equal(protocol.preReadPathPinned, true);
assert.equal(protocol.receiverSidePackageOnly, true);
assert.equal(protocol.stableCarryForwardSignalsOnly, true);
assert.equal(protocol.stableStaleInvalidationSignalsOnly, true);
assert.equal(protocol.stableContradictionCautionSignalsOnly, true);
assert.equal(protocol.noMemoryWrites, true);
assert.equal(protocol.noRuntimeIntegration, true);
assert.equal(protocol.agentConsumedOutput, false);
assert.equal(protocol.recommendationIsAuthority, false);
assert.equal(protocol.policyDecision, null);
console.log(JSON.stringify({ ok: true, protocol: protocol.releaseLayer, preReadPathPinned: protocol.preReadPathPinned }));
