import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 4 }));
const cases = [
  ['semantic_decision_token_persisted', (p) => { p.redactedRecords[0].semanticDecisionTokenPersisted = true; p.retention.semanticDecisionTokenPersisted = true; }],
  ['private_pattern_detected_in_positive_case', (p) => { p.redactedRecords[0].privatePatternDetected = true; p.retention.privatePatternDetected = true; }],
  ['decision_verb_detected_in_positive_case', (p) => { p.redactedRecords[0].decisionVerbDetected = true; p.retention.decisionVerbDetected = true; }]
];
const rejected = [];
for (const [reason, mutate] of cases) {
  const copy = structuredClone(packet);
  mutate(copy);
  const result = evaluatePositiveUtilityPassGate(copy);
  assert.equal(result.positiveUtilityGatePassed, false, reason);
  assert(result.rejectionReasons.includes(reason), reason);
  assert.equal(result.summary.policyDecision, null);
  assert.equal(result.summary.authorization, false);
  assert.equal(result.summary.enforcement, false);
  rejected.push(reason);
}
const out = { summary: { verdict: 'pass', rejected } };
await writeFile(resolve('evidence/positive-utility-pass-gate-redaction-negative-v0.21.3.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
