import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage, passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport, validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact } from '../src/passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';
import { stableInvalidationReceiverPackageInputV041 } from './passive-live-memory-coherence-stable-invalidation-receiver-package-fixtures.mjs';

mkdirSync('evidence', { recursive: true });
const artifact = scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(stableInvalidationReceiverPackageInputV041());
artifact.reportMarkdown = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport(artifact);
assert.deepEqual(validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact(artifact), []);
writeFileSync('evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json', JSON.stringify(artifact, null, 2) + '\n');
writeFileSync('evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-report-v0.41.5.out.md', artifact.reportMarkdown + '\n');
console.log(JSON.stringify({ receiverPackageStatus: artifact.receiverPackageStatus, itemCount: artifact.metrics.receiverPackageItemCount, policyDecision: artifact.policyDecision }, null, 2));
