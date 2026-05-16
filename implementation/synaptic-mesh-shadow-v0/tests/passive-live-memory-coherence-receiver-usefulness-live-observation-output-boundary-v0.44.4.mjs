import assert from 'node:assert/strict';
import {
  passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationReport,
  validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact,
} from '../src/passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';
import { receiverUsefulnessLiveObservationArtifactFixture } from './passive-live-memory-coherence-receiver-usefulness-live-observation-fixtures.mjs';

const artifact = await receiverUsefulnessLiveObservationArtifactFixture();
assert.deepEqual(validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact(artifact), []);
assert.equal(artifact.reportMarkdown, passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationReport(artifact));
assert.equal(artifact.policyDecision, null);
assert(!Object.prototype.hasOwnProperty.call(artifact.protocol, 'policyDecision'));
assert(!Object.prototype.hasOwnProperty.call(artifact.metrics, 'policyDecision'));
assert(artifact.liveObservationItems.every((i) => !Object.prototype.hasOwnProperty.call(i, 'policyDecision')));
assert.equal(artifact.rawPersisted, false);
assert.equal(artifact.agentConsumedOutput, false);
assert.equal(artifact.recommendationIsAuthority, false);
assert.equal(artifact.noMemoryWrites, true);
assert.equal(artifact.noRuntimeIntegration, true);
assert.equal(artifact.humanReadableReportOnly, true);
console.log(JSON.stringify({ outputBoundary: 'ok', status: artifact.liveObservationStatus }));
