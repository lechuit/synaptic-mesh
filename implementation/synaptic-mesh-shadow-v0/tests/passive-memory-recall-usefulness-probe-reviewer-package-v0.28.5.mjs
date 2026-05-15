import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveMemoryRecallUsefulness } from '../src/passive-memory-recall-usefulness-probe.mjs';
import { passiveMemoryRecallInput } from './passive-memory-recall-usefulness-probe-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = scorePassiveMemoryRecallUsefulness(await passiveMemoryRecallInput());
assert.equal(artifact.probeStatus, 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE');
assert.equal(artifact.metrics.usefulRecallRatio, 0.75);
assert.equal(artifact.metrics.contradictionSurfacingRatio, 1);
assert.equal(artifact.metrics.staleNegativeMarkedRatio, 1);
assert.equal(artifact.metrics.sourceBoundMatchRatio, 1);
assert.equal(artifact.metrics.boundaryViolationCount, 0);
assert.equal(artifact.recommendation, 'ADVANCE_OBSERVATION_ONLY');
assert.equal(artifact.recommendationIsAuthority, false);
assert.equal(artifact.policyDecision, null);
const reviewerPackage = {
  artifact: 'T-synaptic-mesh-passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5',
  releaseLayer: 'v0.28.5',
  probeStatus: artifact.probeStatus,
  metrics: artifact.metrics,
  coverage: artifact.coverage,
  cardSummaries: artifact.cardSummaries,
  recommendation: artifact.recommendation,
  recommendationIsAuthority: false,
  reportMarkdown: artifact.reportMarkdown,
  policyDecision: null,
  nonAuthoritative: true,
  humanReadableReportOnly: true
};
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.out.json'), JSON.stringify(reviewerPackage, null, 2) + '\n');
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-report-v0.28.5.out.md'), artifact.reportMarkdown);
console.log(JSON.stringify({ probeStatus: reviewerPackage.probeStatus, cards: reviewerPackage.metrics.cardCount }, null, 2));
