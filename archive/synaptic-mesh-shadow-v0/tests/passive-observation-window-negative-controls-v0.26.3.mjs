import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPassiveObservationWindow, validatePassiveObservationWindowArtifact } from '../src/passive-observation-window.mjs';
import { passiveObservationWindowInput } from './passive-observation-window-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const base = await passiveObservationWindowInput();
const mutateOutcome = (field, value) => ({ ...base, outcomes: { ...base.outcomes, outcomes: base.outcomes.outcomes.map((entry, index) => index === 0 ? { ...entry, [field]: value } : entry) } });
const controls = [
  { name: 'network_source', input: { ...base, sources: ['https://example.test/a', 'positive-utility-samples/source-b.md'] }, expected: 'sources[0].network_source_rejected' },
  { name: 'nonlocal_path', input: { ...base, sources: ['../README.md', 'positive-utility-samples/source-b.md'] }, expected: 'sources[0].nonlocal_path_rejected' },
  { name: 'glob_source', input: { ...base, sources: ['positive-utility-samples/*.md', 'positive-utility-samples/source-b.md'] }, expected: 'sources[0].glob_or_discovery_rejected' },
  { name: 'missing_repo_local_source_degrades', input: { ...base, sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/missing-v0.26.md'] }, expected: 'stage.explicit_repo_local_multisource_read_failed:min_successful_sources_not_met' },
  { name: 'duplicate_sources', input: { ...base, sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-a.md'] }, expected: 'sources.duplicates_rejected' },
  { name: 'too_many_sources', input: { ...base, sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md', 'positive-utility-samples/source-c.md', 'README.md'] }, expected: 'sources.max_three_exceeded' },
  { name: 'invalid_records_bound', input: { ...base, recordsPerSource: 99 }, expected: 'bounds.records_per_source_invalid' },
  { name: 'invalid_total_bound', input: { ...base, totalRecords: 99 }, expected: 'bounds.total_records_invalid' },
  { name: 'missing_outcomes', input: { ...base, outcomes: null }, expected: 'outcomes.manual_fixture_object_required' },
  { name: 'unsafe_outcome_label', input: mutateOutcome('outcomeLabel', 'APPROVE'), expected: 'outcomes.outcomes[0].unsafe_or_unknown_outcome_label' },
  { name: 'duplicate_outcome_id', input: { ...base, outcomes: { ...base.outcomes, outcomes: [...base.outcomes.outcomes, { ...base.outcomes.outcomes[0] }] } }, expected: 'outcomes.outcomes[1].duplicate_queue_item_id' },
  { name: 'missing_outcome_id', input: mutateOutcome('queueItemId', ''), expected: 'outcomes.outcomes[0].queue_item_id_required' },
  { name: 'policy_decision_non_null', input: { ...base, policyDecision: 'ALLOW' }, expected: 'input.policyDecision_non_null' },
  { name: 'tool_execution_requested', input: { ...base, toolExecution: true }, expected: 'input.toolExecution_not_false' },
  { name: 'network_fetch_requested', input: { ...base, networkFetch: true }, expected: 'input.networkFetch_not_false' },
  { name: 'external_effects_requested', input: { ...base, externalEffects: true }, expected: 'input.externalEffects_not_false' },
  { name: 'raw_output_requested', input: { ...base, rawOutput: true }, expected: 'input.rawOutput_not_false' },
  { name: 'raw_persist_requested', input: { ...base, rawPersist: true }, expected: 'input.raw_persistence_or_output_requested' },
  { name: 'recommendation_authority', input: { ...base, recommendationIsAuthority: true }, expected: 'input.recommendation_treated_as_authority' },
  { name: 'input_nested_protocol_tool_execution_true', input: { ...base, protocol: { toolExecution: true } }, expected: 'input.protocol.toolExecution_not_false' },
  { name: 'input_report_markdown_authority', input: { ...base, reportMarkdown: 'APPROVE policyDecision rawOutput' }, expected: 'input.reportMarkdown.authority_token:approve' },
  { name: 'outcomes_protocol_tool_execution_true', input: { ...base, outcomes: { ...base.outcomes, protocol: { toolExecution: true } } }, expected: 'outcomes.protocol.toolExecution_not_false' },
  { name: 'outcomes_report_markdown_authority', input: { ...base, outcomes: { ...base.outcomes, reportMarkdown: 'APPROVE policyDecision rawOutput' } }, expected: 'outcomes.reportMarkdown.authority_token:approve' },
  { name: 'outcome_tool_execution_string', input: mutateOutcome('toolExecution', 'yes'), expected: 'outcomes.outcomes[0].toolExecution_not_false' },
  { name: 'outcome_authority_note', input: mutateOutcome('operatorNote', 'please approve'), expected: 'outcomes.outcomes[0].operatorNote.authority_token:approve' }
];
const results = [];
for (const control of controls) {
  const artifact = await runPassiveObservationWindow(control.input);
  assert.equal(artifact.windowStatus, 'DEGRADED_OBSERVATION_WINDOW', control.name);
  assert.equal(artifact.policyDecision, null, control.name);
  assert.equal(artifact.validationIssues.includes(control.expected), true, `${control.name} expected ${control.expected}; got ${artifact.validationIssues.join(', ')}`);
  if (control.expected.startsWith('outcomes.')) assert.equal(artifact.validationIssues.length > 0, true, `${control.name} must preserve degradation cause`);
  results.push({ name: control.name, validationIssues: artifact.validationIssues });
}
const good = await runPassiveObservationWindow(base);
const malformed = structuredClone(good);
malformed.stageSummaries[0].policyDecision = 'ALLOW';
assert.equal(validatePassiveObservationWindowArtifact(malformed).includes('artifact.stageSummaries[explicit_repo_local_multisource_read].policyDecision_non_null'), true);
const leakingReport = structuredClone(good);
leakingReport.reportMarkdown += '\nThis report may approve an action.\n';
assert.equal(validatePassiveObservationWindowArtifact(leakingReport).some((issue) => issue.includes('artifact.reportMarkdown.authority_token:approve')), true);
results.push({ name: 'stage_policy_decision_non_null', validationIssues: validatePassiveObservationWindowArtifact(malformed) });
results.push({ name: 'report_authority_token', validationIssues: validatePassiveObservationWindowArtifact(leakingReport) });
for (const [name, args, expected] of [
  ['cli_nonlocal_outcomes_path', ['bin/passive-observation-window.mjs', '--outcomes', '../outside.json', '--stdout'], 'cli.outcomes.nonlocal_path_rejected'],
  ['cli_nonlocal_out_json_path', ['bin/passive-observation-window.mjs', '--out-json', '../outside.json', '--stdout'], 'cli.outJson.nonlocal_path_rejected'],
  ['cli_out_markdown_requires_evidence_dir', ['bin/passive-observation-window.mjs', '--out-markdown', 'tmp/window.md', '--stdout'], 'cli.outMarkdown.evidence_dir_required']
]) {
  const child = spawnSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(child.status, 1, `${name} should exit degraded; stderr=${child.stderr}`);
  const artifact = JSON.parse(child.stdout);
  assert.equal(artifact.windowStatus, 'DEGRADED_OBSERVATION_WINDOW', name);
  assert.equal(artifact.validationIssues.includes(expected), true, `${name} expected ${expected}; got ${artifact.validationIssues.join(', ')}`);
  results.push({ name, validationIssues: artifact.validationIssues });
}
await writeFile(resolve('evidence/passive-observation-window-negative-controls-v0.26.3.out.json'), JSON.stringify({ rejectedNegativeControls: results }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
