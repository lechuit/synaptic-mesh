import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveObservationRepeatability } from '../src/passive-observation-repeatability-scorecard.mjs';
import { passiveObservationRepeatabilityInput } from './passive-observation-repeatability-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = scorePassiveObservationRepeatability(await passiveObservationRepeatabilityInput());
assert.equal(artifact.scorecardStatus, 'REPEATABILITY_SCORECARD_COMPLETE');
assert.equal(artifact.metrics.completedWindows, 3);
assert.equal(artifact.metrics.degradedWindows, 1);
assert.equal(artifact.recommendation, 'ADVANCE_OBSERVATION_ONLY');
assert.equal(artifact.recommendationIsAuthority, false);
assert.equal(artifact.policyDecision, null);
const reviewerPackage = {
  artifact: 'T-synaptic-mesh-passive-observation-repeatability-scorecard-reviewer-package-v0.27.5',
  releaseLayer: 'v0.27.5',
  scorecardStatus: artifact.scorecardStatus,
  metrics: artifact.metrics,
  windowSummaries: artifact.windowSummaries,
  recommendation: artifact.recommendation,
  recommendationIsAuthority: false,
  reportMarkdown: artifact.reportMarkdown,
  policyDecision: null,
  nonAuthoritative: true,
  humanReadableReportOnly: true
};
await writeFile(resolve('evidence/passive-observation-repeatability-scorecard-reviewer-package-v0.27.5.out.json'), JSON.stringify(reviewerPackage, null, 2) + '\n');
await writeFile(resolve('evidence/passive-observation-repeatability-scorecard-report-v0.27.5.out.md'), artifact.reportMarkdown);
console.log(JSON.stringify({ scorecardStatus: reviewerPackage.scorecardStatus, windows: reviewerPackage.metrics.totalWindows }, null, 2));
