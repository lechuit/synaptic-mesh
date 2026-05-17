import assert from 'node:assert/strict';
import { passiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteProtocol } from '../src/passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite.mjs';
const p = passiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuiteProtocol();
assert.equal(p.releaseLayer, 'v0.52.0-alpha');
assert.equal(p.barrierCrossed, 'bounded_no_effect_receiver_runtime_adapter_fixture_suite');
assert.equal(p.buildsOn, 'v0.51.5_passive_live_memory_coherence_receiver_runtime_invocation_shim_rehearsal');
for (const flag of ['disabledByDefault','operatorRunOneShotOnly','localOnly','fixtureOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedReceiverRuntimeInvocationShimRehearsal','receiverRuntimeAdapterFixtureSuite','humanReviewOnly','nonAuthoritative','redactedBeforePersist','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects']) assert.equal(p[flag], true, flag);
for (const flag of ['rawPersisted','recommendationIsAuthority','agentConsumedOutput']) assert.equal(p[flag], false, flag);
console.log(JSON.stringify({ releaseLayer: p.releaseLayer, barrierCrossed: p.barrierCrossed }));
