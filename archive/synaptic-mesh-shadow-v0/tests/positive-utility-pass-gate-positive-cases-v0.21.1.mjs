import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate, runPositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const sources = ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md', 'positive-utility-samples/source-c.md'];
const result = JSON.parse(await runPositiveUtilityPassGate({ sources, recordsPerSource: 3, totalRecords: 9 }));
assert.equal(result.classification, 'PASS_TO_HUMAN_REVIEW');
assert.equal(result.observationAccepted, true);
assert.equal(result.includedInReport, true);
assert.equal(result.readyForHumanReview, true);
assert.equal(result.summary.policyDecision, null);
assert.equal(result.summary.authorization, false);
assert.equal(result.summary.enforcement, false);
assert.equal(result.summary.toolExecution, false);
assert.equal(result.summary.agentConsumedOutput, false);
assert.equal(result.summary.externalEffects, false);
assert.equal(result.summary.rawPersisted, false);
assert.equal(result.rejectionReasons.length, 0);
assert.match(result.reportMarkdown, /Positive Utility Pass-to-Human-Review Report v0\.21\.5/);

const packetWithAllowedIsolatedFailure = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/missing.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 6 }));
assert.equal(packetWithAllowedIsolatedFailure.summary.sourceFailuresIsolated, 1);
const acceptedWithIsolatedFailure = evaluatePositiveUtilityPassGate(packetWithAllowedIsolatedFailure, { maxIsolatedSourceFailures: 1 });
assert.equal(acceptedWithIsolatedFailure.classification, 'PASS_TO_HUMAN_REVIEW');
assert.equal(acceptedWithIsolatedFailure.summary.sourceFailuresAccepted, 1);
assert.equal(acceptedWithIsolatedFailure.summary.policyDecision, null);
assert.equal(acceptedWithIsolatedFailure.summary.authorization, false);
assert.equal(acceptedWithIsolatedFailure.summary.enforcement, false);

const out = { summary: result.summary, isolatedFailureSummary: acceptedWithIsolatedFailure.summary, classification: result.classification };
await writeFile(resolve('evidence/positive-utility-pass-gate-positive-cases-v0.21.1.out.json'), JSON.stringify(out, null, 2) + '\n');
await writeFile(resolve('evidence/positive-utility-pass-gate-report-v0.21.1.out.md'), result.reportMarkdown);
console.log(JSON.stringify(out, null, 2));
