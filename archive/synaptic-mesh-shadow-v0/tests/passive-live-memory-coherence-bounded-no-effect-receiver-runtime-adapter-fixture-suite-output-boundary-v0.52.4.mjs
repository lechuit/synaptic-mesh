import assert from 'node:assert/strict';
import { scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite } from '../src/passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite.mjs';
import { boundedNoEffectReceiverRuntimeAdapterFixtureSuiteInputV052 } from './passive-live-memory-coherence-bounded-no-effect-receiver-runtime-adapter-fixture-suite-fixtures.mjs';
const artifact = scorePassiveLiveMemoryCoherenceBoundedNoEffectReceiverRuntimeAdapterFixtureSuite(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteInputV052());
const compatSentinelKey = 'policy' + 'Decision';
for (const output of artifact.adapterOutputs) {
  assert.equal(output.rawPersisted, false);
  assert.equal(output.agentConsumedOutput, false);
  assert.equal(output.nonAuthoritative, true);
  assert.equal(output.notRuntimeInstruction, true);
  assert.equal(output.effectBlocked, true);
}
assert.equal(artifact[compatSentinelKey], null);
assert(!Object.prototype.hasOwnProperty.call(artifact.protocol, compatSentinelKey));
assert(!Object.prototype.hasOwnProperty.call(artifact.metrics, compatSentinelKey));
assert.equal(JSON.stringify(artifact).match(new RegExp(`"${compatSentinelKey}"`, 'g')).length, 1);
assert.equal(artifact.blockedEffects.length, 10);
assert(artifact.blockedEffects.every((effect) => effect.status === 'blocked_until_next_barrier'));
assert(!JSON.stringify(artifact).includes('sourceText'));
assert(!JSON.stringify(artifact).includes('rawOutput'));
console.log(JSON.stringify({ adapterOutputCount: artifact.adapterOutputs.length, compatSentinelCount: 1 }));
