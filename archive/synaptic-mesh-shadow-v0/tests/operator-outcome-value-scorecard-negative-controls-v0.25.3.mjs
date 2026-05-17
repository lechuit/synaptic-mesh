import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scoreOperatorOutcomeValue } from '../src/operator-outcome-value-scorecard.mjs';
import { operatorOutcomeCaptureFixture } from './operator-outcome-value-scorecard-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const base = await operatorOutcomeCaptureFixture();
const mutateOutcome = (field, value) => ({ ...base, capturedOutcomes: base.capturedOutcomes.map((entry, index) => index === 0 ? { ...entry, [field]: value } : entry) });
const controls = [
  { name: 'malformed_capture', capture: 'not-object', expected: 'capture.malformed_not_object' },
  { name: 'unsafe_label_approve', capture: mutateOutcome('outcomeLabel', 'APPROVE'), expected: 'capture.capturedOutcomes[0].unsafe_or_unknown_outcome_label' },
  { name: 'unsafe_label_allow_camel', capture: mutateOutcome('outcomeLabel', 'mayAllow'), expected: 'capture.capturedOutcomes[0].unsafe_or_unknown_outcome_label' },
  { name: 'operator_note_policy_decision', capture: mutateOutcome('operatorNoteRedacted', 'policyDecision says approve'), expected: 'capture.capturedOutcomes[0].operatorNoteRedacted.authority_token:approve' },
  { name: 'reason_tool_execution', capture: mutateOutcome('reasonCodes', ['toolExecution']), expected: 'capture.capturedOutcomes[0].reasonCodes[0].authority_token:toolExecution' },
  { name: 'policy_decision_non_null', capture: { ...base, policyDecision: 'ALLOW' }, expected: 'capture.policyDecision_non_null' },
  { name: 'authorization_true', capture: { ...base, authorization: true }, expected: 'capture.authorization_not_false' },
  { name: 'tool_execution_string', capture: { ...base, toolExecution: 'yes' }, expected: 'capture.toolExecution_not_false' },
  { name: 'external_effects_object', capture: { ...base, externalEffects: { write: true } }, expected: 'capture.externalEffects_not_false' },
  { name: 'raw_persisted_true', capture: { ...base, rawPersisted: true }, expected: 'capture.rawPersisted_not_false' },
  { name: 'raw_output_string', capture: { ...base, rawOutput: 'raw' }, expected: 'capture.rawOutput_not_false' },
  { name: 'entry_approval_block_allow_true', capture: mutateOutcome('approvalBlockAllow', true), expected: 'capture.capturedOutcomes[0].approvalBlockAllow_not_false' },
  { name: 'entry_network_fetch_object', capture: mutateOutcome('networkFetch', { url: 'https://example.test' }), expected: 'capture.capturedOutcomes[0].networkFetch_not_false' },
  { name: 'entry_memory_write_string', capture: mutateOutcome('memoryConfigWrite', 'true'), expected: 'capture.capturedOutcomes[0].memoryConfigWrite_not_false' },
  { name: 'report_markdown_authority', capture: { ...base, reportMarkdown: 'This report can APPROVE and policyDecision: yes' }, expected: 'capture.reportMarkdown.authority_token:approve' },
  { name: 'duplicate_outcome_id', capture: { ...base, capturedOutcomes: base.capturedOutcomes.map((entry, index) => index === 1 ? { ...entry, queueItemId: base.capturedOutcomes[0].queueItemId } : entry) }, expected: 'capture.capturedOutcomes[1].duplicate_queue_item_id' },
  { name: 'missing_outcome_id', capture: mutateOutcome('queueItemId', ''), expected: 'capture.capturedOutcomes[0].queue_item_id_required' },
  { name: 'malformed_outcome_entry', capture: { ...base, capturedOutcomes: [null, ...base.capturedOutcomes.slice(1)] }, expected: 'capture.capturedOutcomes[0].malformed_not_object' },
  { name: 'invalid_count_mismatch', capture: { ...base, capturedOutcomeCount: 99 }, expected: 'capture.captured_outcome_count_mismatch' },
  { name: 'captured_outcome_count_string', capture: { ...base, capturedOutcomeCount: '3' }, expected: 'capture.captured_outcome_count_not_integer' },
  { name: 'invalid_metrics_by_malformed_degrades', capture: { ...base, capturedOutcomes: [] }, expected: 'capture.captured_outcome_count_out_of_bounds' },
  { name: 'artifact_authority_token', capture: { ...base, artifact: 'approve rawOutput' }, expected: 'capture.artifact.authority_token:approve' },
  { name: 'protocol_report_markdown_authority', capture: { ...base, protocol: { ...(base.protocol ?? {}), reportMarkdown: 'APPROVE policyDecision rawOutput' } }, expected: 'capture.protocol.reportMarkdown.authority_token:approve' },
  { name: 'recommendation_field_authority', capture: { ...base, recommendation: 'APPROVE' }, expected: 'capture.recommendation.authority_token:approve' },
  { name: 'capture_status_authority_token', capture: { ...base, captureStatus: 'APPROVE' }, expected: 'capture.captureStatus.authority_token:approve' },
  { name: 'false_recommendation_authority_leakage', capture: mutateOutcome('operatorNoteRedacted', 'mayBlock path'), expected: 'capture.capturedOutcomes[0].operatorNoteRedacted.authority_token:mayBlock' }
];
const results = controls.map((control) => ({ name: control.name, scorecard: scoreOperatorOutcomeValue(control.capture), expected: control.expected }));
for (const result of results) {
  assert.equal(result.scorecard.scorecardStatus, 'DEGRADED_NO_VALUE_SCORECARD', result.name);
  assert.equal(result.scorecard.metrics.reviewedItemCount, 0, result.name);
  assert.equal(result.scorecard.policyDecision, null, result.name);
  assert.equal(result.scorecard.authorization, false, result.name);
  assert.equal(result.scorecard.toolExecution, false, result.name);
  assert.equal(result.scorecard.externalEffects, false, result.name);
  assert.equal(result.scorecard.rawPersisted, false, result.name);
  assert.equal(result.scorecard.rawOutput, false, result.name);
  assert.equal(result.scorecard.sourceCaptureArtifact, null, result.name);
  assert.equal(result.scorecard.sourceCaptureStatus, null, result.name);
  assert.equal(result.scorecard.validationIssues.includes(result.expected), true, `${result.name} expected ${result.expected}; got ${result.scorecard.validationIssues.join(', ')}`);
}
await writeFile(resolve('evidence/operator-outcome-value-scorecard-negative-controls-v0.25.3.out.json'), JSON.stringify({ rejectedNegativeControls: results.map((entry) => ({ name: entry.name, validationIssues: entry.scorecard.validationIssues })) }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
