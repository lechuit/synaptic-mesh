import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const result = JSON.parse(await runPositiveUtilityPassGate({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md', 'positive-utility-samples/source-c.md'], recordsPerSource: 2, totalRecords: 6 }));
assert.equal(result.classification, 'PASS_TO_HUMAN_REVIEW');
assert.equal(result.observationAccepted, true);
assert.equal(result.includedInReport, true);
assert.equal(result.readyForHumanReview, true);
assert.equal(result.summary.nonAuthoritative, true);
assert.equal(result.summary.classificationOnly, true);
assert.equal(result.summary.policyDecision, null);
for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert.equal(result.summary[key], false, key);
assert.equal(result.summary.unexpectedPermits, 0);
const out = {
  summary: result.summary,
  classification: result.classification,
  reviewerNotes: [
    'positive utility pass-to-human-review is not an allow/block/approve policy gate',
    'classification is for human review readiness only and is not agent-consumed runtime authority',
    'all effects, authorization, enforcement, raw persistence, and tool execution remain false'
  ]
};
await writeFile(resolve('evidence/positive-utility-pass-gate-reviewer-package-v0.21.5.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
