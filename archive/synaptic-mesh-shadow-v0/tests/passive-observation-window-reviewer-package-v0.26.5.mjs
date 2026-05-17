import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow } from '../src/passive-observation-window.mjs';
import { passiveObservationWindowInput } from './passive-observation-window-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const artifact = await runPassiveObservationWindow(await passiveObservationWindowInput());
assert.equal(artifact.windowStatus, 'OBSERVATION_WINDOW_COMPLETE');
assert.equal(artifact.stageSummaries.length, 6);
assert.equal(artifact.valueSignal.scorecardStatus, 'VALUE_SCORECARD_COMPLETE');
assert.equal(artifact.valueSignal.recommendation, 'HOLD_FOR_MORE_EVIDENCE');
assert.equal(artifact.valueSignal.recommendationIsAuthority, false);
assert.equal(artifact.policyDecision, null);
const reviewerPackage = {
  artifact: 'T-synaptic-mesh-passive-observation-window-reviewer-package-v0.26.5',
  releaseLayer: 'v0.26.5',
  windowStatus: artifact.windowStatus,
  stageSummaries: artifact.stageSummaries,
  redactedEvidencePacket: artifact.redactedEvidencePacket,
  valueSignal: artifact.valueSignal,
  reportMarkdown: artifact.reportMarkdown,
  policyDecision: null,
  nonAuthoritative: true,
  humanReadableReportOnly: true
};
await writeFile(resolve('evidence/passive-observation-window-reviewer-package-v0.26.5.out.json'), JSON.stringify(reviewerPackage, null, 2) + '\n');
await writeFile(resolve('evidence/passive-observation-window-report-v0.26.5.out.md'), artifact.reportMarkdown);
console.log(JSON.stringify({ windowStatus: reviewerPackage.windowStatus, stages: reviewerPackage.stageSummaries.length }, null, 2));
