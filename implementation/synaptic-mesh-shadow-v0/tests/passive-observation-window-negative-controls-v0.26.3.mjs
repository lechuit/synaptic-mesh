import assert from 'node:assert/strict';
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
  { name: 'outcome_authority_note', input: mutateOutcome('operatorNote', 'please approve'), expected: 'outcomes.outcomes[0].operatorNote.authority_token:approve' }
];
const results = [];
for (const control of controls) {
  const artifact = await runPassiveObservationWindow(control.input);
  assert.equal(artifact.windowStatus, 'DEGRADED_OBSERVATION_WINDOW', control.name);
  assert.equal(artifact.policyDecision, null, control.name);
  assert.equal(artifact.validationIssues.includes(control.expected), true, `${control.name} expected ${control.expected}; got ${artifact.validationIssues.join(', ')}`);
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
await writeFile(resolve('evidence/passive-observation-window-negative-controls-v0.26.3.out.json'), JSON.stringify({ rejectedNegativeControls: results }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
