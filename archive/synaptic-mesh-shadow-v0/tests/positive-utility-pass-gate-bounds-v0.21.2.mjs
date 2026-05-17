import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 4 }));
const accepted = evaluatePositiveUtilityPassGate(packet);
assert.equal(accepted.positiveUtilityGatePassed, true);
for (const mutation of [
  ['source_count_exceeds_bound', (p) => { p.summary.sourceCount = 4; p.sources.push({ sourceIndex: 3, status: 'ok', kind: 'explicit_repo_local_file_via_adapter', rawSourcePathPersisted: false, recordsRead: 1 }); }],
  ['records_per_source_exceeds_bound', (p) => { p.summary.recordsPerSourceLimit = 6; }],
  ['total_records_exceeds_bound', (p) => { p.summary.totalRecordLimit = 13; }],
  ['insufficient_records_for_useful_human_review', (p) => { p.summary.recordsRead = 0; p.redactedRecords = []; }],
  ['records_per_source_limit_invalid', (p) => { p.summary.recordsPerSourceLimit = 'not-a-number'; }],
  ['total_record_limit_invalid', (p) => { p.summary.totalRecordLimit = 'not-a-number'; }],
  ['records_per_source_limit_invalid', (p) => { p.summary.recordsPerSourceLimit = 0; }],
  ['total_record_limit_invalid', (p) => { p.summary.totalRecordLimit = 0; }],
  ['records_per_source_limit_invalid', (p) => { p.summary.recordsPerSourceLimit = -1; }],
  ['total_record_limit_invalid', (p) => { p.summary.totalRecordLimit = -1; }],
  ['source_failures_isolated_invalid', (p) => { p.summary.sourceFailuresIsolated = -1; }],
  ['sources_array_required', (p) => { p.sources = { length: p.summary.sourceCount }; }],
  ['source_entries_malformed', (p) => { p.sources = [null, null]; }]
]) {
  const copy = structuredClone(packet);
  mutation[1](copy);
  const result = evaluatePositiveUtilityPassGate(copy);
  assert.equal(result.positiveUtilityGatePassed, false, mutation[0]);
  assert.equal(result.classification, 'REJECTED_NOT_READY_FOR_HUMAN_REVIEW');
  assert(result.rejectionReasons.includes(mutation[0]), mutation[0]);
  assert.equal(result.summary.policyDecision, null);
}
for (const [optionName, optionValue] of [['max_isolated_source_failures_nan', Number.NaN], ['max_isolated_source_failures_string', 'x']]) {
  const copy = structuredClone(packet);
  copy.summary.sourceFailuresIsolated = 1;
  const result = evaluatePositiveUtilityPassGate(copy, { maxIsolatedSourceFailures: optionValue });
  assert.equal(result.positiveUtilityGatePassed, false, optionName);
  assert(result.rejectionReasons.includes('max_isolated_source_failures_invalid'), optionName);
}
const out = { summary: { verdict: 'pass', accepted: accepted.summary, rejectedBounds: 15 } };
await writeFile(resolve('evidence/positive-utility-pass-gate-bounds-v0.21.2.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
