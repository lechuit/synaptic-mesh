import assert from 'node:assert/strict';
import { scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage, validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';
import { stableInvalidationReceiverPackageInputV041 } from './passive-live-memory-coherence-stable-invalidation-receiver-package-fixtures.mjs';

const artifact = scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(stableInvalidationReceiverPackageInputV041());
assert.equal(artifact.receiverPackageStatus, 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE');
assert.equal(artifact.receiverPackageItems.length, 5);
assert.deepEqual(artifact.receiverPackageSummary.carryForwardCandidateIds, ['candidate-current-release-continuity','candidate-boundary-invariants','candidate-repeatability-evidence']);
assert.deepEqual(artifact.receiverPackageSummary.staleInvalidatedCandidateIds, ['candidate-stale-prior-release-anchor']);
assert.deepEqual(artifact.receiverPackageSummary.contradictionCautionCandidateIds, ['candidate-contradictory-boundary-claim']);
assert.equal(artifact.receiverPackageItems.every((item)=>item.sourceBound && item.stableAcrossRuns && item.redactedBeforePersist && item.rawPersisted === false && item.promoteToMemory === false && item.agentConsumedOutput === false), true);
artifact.reportMarkdown = 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE';
assert.deepEqual(validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact(artifact), []);
console.log(JSON.stringify({ items: artifact.receiverPackageItems.length, carryForward: artifact.receiverPackageSummary.carryForwardCandidateIds.length }));
