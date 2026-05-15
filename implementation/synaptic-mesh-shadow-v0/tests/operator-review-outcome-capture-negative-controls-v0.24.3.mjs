import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildOperatorReviewOutcomeCapture } from '../src/operator-review-outcome-capture.mjs';
import { operatorReviewQueueFixture, operatorOutcomesFixture } from './operator-review-outcome-capture-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const queue = await operatorReviewQueueFixture();
const base = await operatorOutcomesFixture();
const controls = [
  { name: 'unsafe_label_approve', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, outcomeLabel: 'APPROVE' } : entry) }, expected: 'outcomes.outcomes[0].unsafe_or_unknown_outcome_label' },
  { name: 'unsafe_label_allow', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, outcomeLabel: 'ALLOW' } : entry) }, expected: 'outcomes.outcomes[0].unsafe_or_unknown_outcome_label' },
  { name: 'camel_case_policy_decision', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, operatorNote: 'policyDecision says yes' } : entry) }, expected: 'outcomes.outcomes[0].operatorNote.authority_token:policyDecision' },
  { name: 'camel_case_tool_execution', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, reasonCodes: ['toolExecution'] } : entry) }, expected: 'outcomes.outcomes[0].reasonCodes[0].authority_token:toolExecution' },
  { name: 'external_effects_true', outcomes: { ...base, externalEffects: true }, expected: 'outcomes.externalEffects_not_false' },
  { name: 'raw_persisted_true', outcomes: { ...base, rawPersisted: true }, expected: 'outcomes.rawPersisted_not_false' },
  { name: 'raw_output_true', outcomes: { ...base, rawOutput: true }, expected: 'outcomes.rawOutput_not_false' },
  { name: 'non_null_policy_decision', outcomes: { ...base, policyDecision: 'USEFUL_FOR_REVIEW' }, expected: 'outcomes.policyDecision_non_null' },
  { name: 'mismatched_id', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, queueItemId: 'operator-review-missing' } : entry) }, expected: 'outcomes.outcomes[0].queue_item_id_not_in_queue' },
  { name: 'missing_outcome', outcomes: { ...base, outcomes: base.outcomes.slice(1) }, expected: `outcomes.missing_outcome_for:${queue.queueItems[0].queueItemId}` },
  { name: 'too_many_outcomes', outcomes: { ...base, outcomes: [...base.outcomes, { ...base.outcomes[0], queueItemId: 'extra-item' }] }, expected: 'outcomes.count_out_of_bounds' },
  { name: 'queue_raw_output_true', queue: { ...queue, rawOutput: true }, outcomes: base, expected: 'queue.rawOutput_not_false' },
  { name: 'queue_protocol_tool_execution_true', queue: { ...queue, protocol: { ...(queue.protocol ?? {}), toolExecution: true } }, outcomes: base, expected: 'queue.protocol.toolExecution_not_false' },
  { name: 'queue_protocol_policy_decision_non_null', queue: { ...queue, protocol: { ...(queue.protocol ?? {}), policyDecision: 'ALLOW' } }, outcomes: base, expected: 'queue.protocol.policyDecision_non_null' },
  { name: 'outcomes_protocol_external_effects_true', outcomes: { ...base, protocol: { externalEffects: true } }, expected: 'outcomes.protocol.externalEffects_not_false' },
  { name: 'outcomes_protocol_machine_policy_true', outcomes: { ...base, protocol: { machineReadablePolicyDecision: true } }, expected: 'outcomes.protocol.machineReadablePolicyDecision_not_false' },
  { name: 'top_tool_execution_string', outcomes: { ...base, toolExecution: 'yes' }, expected: 'outcomes.toolExecution_not_false' },
  { name: 'nested_protocol_authorization_string', outcomes: { ...base, protocol: { authorization: 'yes' } }, expected: 'outcomes.protocol.authorization_not_false' },
  { name: 'entry_external_effects_string', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, externalEffects: 'yes' } : entry) }, expected: 'outcomes.outcomes[0].externalEffects_not_false' },
  { name: 'queue_protocol_tool_execution_object', queue: { ...queue, protocol: { ...(queue.protocol ?? {}), toolExecution: { mode: 'dry' } } }, outcomes: base, expected: 'queue.protocol.toolExecution_not_false' },
  { name: 'queue_item_authorization_string', queue: { ...queue, queueItems: queue.queueItems.map((entry, i) => i === 0 ? { ...entry, authorization: 'true' } : entry) }, outcomes: base, expected: 'queue.queueItems[0].authorization_not_false' },
  { name: 'queue_item_raw_output_object', queue: { ...queue, queueItems: queue.queueItems.map((entry, i) => i === 0 ? { ...entry, rawOutput: { redacted: 'summary' } } : entry) }, outcomes: base, expected: 'queue.queueItems[0].rawOutput_not_false' },
  { name: 'outcomes_protocol_machine_policy_object', outcomes: { ...base, protocol: { machineReadablePolicyDecision: { outcomeLabel: 'USEFUL_FOR_REVIEW' } } }, expected: 'outcomes.protocol.machineReadablePolicyDecision_not_false' },
  { name: 'outcomes_protocol_external_effects_object', outcomes: { ...base, protocol: { externalEffects: { type: 'none' } } }, expected: 'outcomes.protocol.externalEffects_not_false' },
  { name: 'top_allow_true', outcomes: { ...base, allow: true }, expected: 'outcomes.allow_not_false' },
  { name: 'entry_approve_true', outcomes: { ...base, outcomes: base.outcomes.map((entry, i) => i === 0 ? { ...entry, approve: true } : entry) }, expected: 'outcomes.outcomes[0].approve_not_false' },
  { name: 'queue_item_block_true', queue: { ...queue, queueItems: queue.queueItems.map((entry, i) => i === 0 ? { ...entry, block: true } : entry) }, outcomes: base, expected: 'queue.queueItems[0].block_not_false' },
  { name: 'outcomes_report_markdown_authority_tokens', outcomes: { ...base, reportMarkdown: 'policyDecision APPROVE rawOutput' }, expected: 'outcomes.reportMarkdown.authority_token:approve' },
  { name: 'queue_authority_token', queue: { ...queue, queueItems: queue.queueItems.map((entry, i) => i === 0 ? { ...entry, rationale: 'mayAllow operator path' } : entry) }, outcomes: base, expected: 'queue.queueItems[0].rationale.authority_token:mayAllow' }
];
const results = controls.map((control) => ({ name: control.name, capture: buildOperatorReviewOutcomeCapture(control.queue ?? queue, control.outcomes), expected: control.expected }));
for (const result of results) {
  assert.equal(result.capture.captureStatus, 'DEGRADED_NO_OUTCOME_CAPTURE', result.name);
  assert.equal(result.capture.capturedOutcomes.length, 0, result.name);
  assert.equal(result.capture.policyDecision, null, result.name);
  assert.equal(result.capture.externalEffects, false, result.name);
  assert.equal(result.capture.validationIssues.includes(result.expected), true, `${result.name} expected ${result.expected}; got ${result.capture.validationIssues.join(', ')}`);
}
await writeFile(resolve('evidence/operator-review-outcome-capture-negative-controls-v0.24.3.out.json'), JSON.stringify({ rejectedNegativeControls: results.map((entry) => ({ name: entry.name, validationIssues: entry.capture.validationIssues })) }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
