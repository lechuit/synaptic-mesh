import assert from 'node:assert/strict';
import { scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage, passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';
import { stableInvalidationReceiverPackageInputV041 } from './passive-live-memory-coherence-stable-invalidation-receiver-package-fixtures.mjs';

const artifact = scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(stableInvalidationReceiverPackageInputV041());
artifact.reportMarkdown = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport(artifact);
assert.equal(artifact.humanReadableReportOnly, true);
assert.equal(artifact.humanReviewOnly, true);
assert.equal(artifact.nonAuthoritative, true);
assert.equal(artifact.recommendationIsAuthority, false);
assert.equal(artifact.agentConsumedOutput, false);
assert.equal(artifact.notRuntimeInstruction, true);
assert.equal(artifact.noMemoryWrites, true);
assert.equal(artifact.noRuntimeIntegration, true);
assert.equal(artifact.policyDecision, null);
assert.equal(artifact.receiverPackageItems.every((item)=>item.promoteToMemory === false && item.rawPersisted === false && item.agentConsumedOutput === false && item.policyDecision === null), true);
assert.match(artifact.reportMarkdown, /Human-readable receiver-side package only/);
assert.match(artifact.reportMarkdown, /policyDecision: null/);
console.log(JSON.stringify({ outputBoundary: 'ok', status: artifact.receiverPackageStatus }));
