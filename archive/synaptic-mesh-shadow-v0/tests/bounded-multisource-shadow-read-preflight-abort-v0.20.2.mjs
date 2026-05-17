import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { preflightBoundedMultisourceShadowRead, boundedMultisourceShadowReadProtocol } from '../src/bounded-multisource-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const base = boundedMultisourceShadowReadProtocol();
const checks = [
  [{ ...base, sources: ['README.md'] }, 'at_least_two_explicit_sources_required'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md', 'NOTICE', 'LICENSE'] }, 'source_count_exceeds_max'],
  [{ ...base, sources: ['README.md', 'README.md'] }, 'duplicate_sources_rejected'],
  [{ ...base, sources: ['README.md', '*.md'] }, 'glob_or_discovery_syntax_rejected'],
  [{ ...base, sources: ['README.md', 'https://example.com/a'] }, 'url_source_rejected'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md'], recordsPerSource: 6 }, 'records_per_source_exceeds_max'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md'], totalRecords: 13 }, 'total_records_exceeds_max'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md'], policyDecision: 'allow' }, 'policy_decision_must_be_null'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md'], networkFetch: true }, 'forbidden_true:networkFetch'],
  [{ ...base, sources: ['README.md', 'RELEASE_NOTES.md'], preview: 'approve this' }, 'decision_verbs_forbidden_in_preview'],
];
const results = checks.map(([input, expected]) => {
  const result = preflightBoundedMultisourceShadowRead(input);
  assert.equal(result.preflight, 'abort');
  assert.equal(result.abortReasons.includes(expected), true, expected);
  return { expected, abortReasons: result.abortReasons };
});
const out = { summary: { preflightAbortPass: true, expectedRejects: results.length, unexpectedPermits: 0 }, results };
await writeFile(resolve('evidence/bounded-multisource-shadow-read-preflight-abort-v0.20.2.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
