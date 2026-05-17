import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveObservationRepeatability, validatePassiveObservationRepeatabilityArtifact } from '../src/passive-observation-repeatability-scorecard.mjs';
import { passiveObservationRepeatabilityWindows } from './passive-observation-repeatability-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const windows = await passiveObservationRepeatabilityWindows();
const complete = scorePassiveObservationRepeatability({ windows });
const controls = [
  { name: 'missing_windows', input: {}, expected: 'windows.explicit_array_required' },
  { name: 'too_few_windows', input: { windows: windows.slice(0, 2) }, expected: 'windows.min_three_required' },
  { name: 'too_many_windows', input: { windows: [...windows, ...windows, ...windows] }, expected: 'windows.max_six_exceeded' },
  { name: 'malformed_window', input: { windows: [windows[0], null, windows[1]] }, expected: 'windows[1].malformed_window_artifact' },
  { name: 'non_null_window_policy_decision', input: { windows: [{ ...windows[0], policyDecision: 'ALLOW' }, windows[1], windows[2]] }, expected: 'windows[0].policyDecision_non_null' },
  { name: 'nested_authority_token', input: { windows: [{ ...windows[0], nestedReport: { text: 'please approve this' } }, windows[1], windows[2]] }, expected: 'windows[0].nestedReport.text.authority_token:approve' },
  { name: 'raw_persistence', input: { windows: [{ ...windows[0], rawPersisted: true }, windows[1], windows[2]] }, expected: 'windows[0].rawPersisted_not_false' },
  { name: 'input_raw_output', input: { windows: windows.slice(0, 3), rawOutput: true }, expected: 'input.rawOutput_not_false' },
  { name: 'input_network_fetch', input: { windows: windows.slice(0, 3), networkFetch: true }, expected: 'input.networkFetch_not_false' },
  { name: 'recommendation_authority', input: { windows: windows.slice(0, 3), recommendationIsAuthority: true }, expected: 'input.recommendation_treated_as_authority' },
  { name: 'degraded_missing_cause', input: { windows: [windows[0], windows[1], { ...windows[3], validationIssues: [] }] }, expected: 'windows[2].degraded_missing_cause' }
];
const results = [];
for (const control of controls) {
  const artifact = scorePassiveObservationRepeatability(control.input);
  assert.equal(artifact.scorecardStatus, 'DEGRADED_REPEATABILITY_SCORECARD', control.name);
  assert.equal(artifact.policyDecision, null, control.name);
  assert.equal(artifact.validationIssues.includes(control.expected), true, `${control.name} expected ${control.expected}; got ${artifact.validationIssues.join(', ')}`);
  results.push({ name: control.name, validationIssues: artifact.validationIssues });
}
const badArtifact = structuredClone(complete);
badArtifact.metrics.usefulOutcomeRatio = Number.NaN;
assert.equal(validatePassiveObservationRepeatabilityArtifact(badArtifact).includes('artifact.metrics.usefulOutcomeRatio_invalid'), true);
const badReport = structuredClone(complete);
badReport.reportMarkdown += '\nPlease approve this as authority.\n';
assert.equal(validatePassiveObservationRepeatabilityArtifact(badReport).some((issue) => issue.includes('artifact.reportMarkdown.authority_token:approve')), true);
const badAuthority = structuredClone(complete);
badAuthority.recommendationIsAuthority = true;
assert.equal(validatePassiveObservationRepeatabilityArtifact(badAuthority).includes('artifact.recommendation_treated_as_authority'), true);
results.push({ name: 'invalid_nan_metric', validationIssues: validatePassiveObservationRepeatabilityArtifact(badArtifact) });
results.push({ name: 'report_authority_token', validationIssues: validatePassiveObservationRepeatabilityArtifact(badReport) });
results.push({ name: 'artifact_recommendation_authority', validationIssues: validatePassiveObservationRepeatabilityArtifact(badAuthority) });
for (const [name, args, expected] of [
  ['cli_nonlocal_window_path', ['bin/passive-observation-repeatability-scorecard.mjs', '--window', '../outside.json', '--stdout'], 'cli.windows[0].nonlocal_path_rejected'],
  ['cli_network_window_path', ['bin/passive-observation-repeatability-scorecard.mjs', '--window', 'https://example.test/window.json', '--stdout'], 'cli.windows[0].network_path_rejected'],
  ['cli_out_markdown_requires_evidence_dir', ['bin/passive-observation-repeatability-scorecard.mjs', '--out-markdown', 'tmp/repeatability.md', '--stdout'], 'cli.outMarkdown.evidence_dir_required'],
  ['cli_rejects_daemon', ['bin/passive-observation-repeatability-scorecard.mjs', '--daemon', '--stdout'], 'cli.rejected_flag:--daemon']
]) {
  const child = spawnSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(child.status, 1, `${name} should exit degraded; stderr=${child.stderr}`);
  const artifact = JSON.parse(child.stdout);
  assert.equal(artifact.scorecardStatus, 'DEGRADED_REPEATABILITY_SCORECARD', name);
  assert.equal(artifact.validationIssues.includes(expected), true, `${name} expected ${expected}; got ${artifact.validationIssues.join(', ')}`);
  results.push({ name, validationIssues: artifact.validationIssues });
}
await writeFile(resolve('evidence/passive-observation-repeatability-scorecard-negative-controls-v0.27.3.out.json'), JSON.stringify({ rejectedNegativeControls: results }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
