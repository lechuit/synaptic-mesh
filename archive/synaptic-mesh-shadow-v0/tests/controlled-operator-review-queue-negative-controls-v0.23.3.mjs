import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildControlledOperatorReviewQueue } from '../src/controlled-operator-review-queue.mjs';
import { controlledOperatorReviewQueueScorecard } from './controlled-operator-review-queue-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const base = await controlledOperatorReviewQueueScorecard();
const controls = [
  { name: 'malformed_scorecard', scorecard: { schemaVersion: 'wrong', cases: 'not-array' }, expected: 'malformed_scorecard_schema_version' },
  { name: 'non_null_policy_decision', scorecard: { ...base, policyDecision: 'ALLOW' }, expected: 'scorecard.policyDecision_non_null' },
  { name: 'false_pass_present', scorecard: { ...base, metrics: { ...base.metrics, falsePasses: 1 } }, expected: 'scorecard_false_passes_present' },
  { name: 'authority_violation_present', scorecard: { ...base, metrics: { ...base.metrics, authorityViolations: 1 }, cases: [{ ...base.cases[0], authorityViolations: ['report_authority_token'] }] }, expected: 'scorecard_authority_violations_present' },
  { name: 'recommendation_as_authority', scorecard: { ...base, recommendationIsAuthority: true }, expected: 'recommendation_treated_as_authority' },
  { name: 'forbidden_capability_true', scorecard: { ...base, toolExecution: true }, expected: 'scorecard.toolExecution_true' },
  { name: 'raw_persisted_true', scorecard: { ...base, rawPersisted: true }, expected: 'scorecard.rawPersisted_true' },
  { name: 'external_effects_true', scorecard: { ...base, externalEffects: true }, expected: 'scorecard.externalEffects_true' },
  { name: 'case_authorization_true', scorecard: { ...base, cases: [{ ...base.cases[0], authorization: true }] }, expected: 'scorecard.cases[0].authorization_true' },
  { name: 'case_tool_execution_true', scorecard: { ...base, cases: [{ ...base.cases[0], toolExecution: true }] }, expected: 'scorecard.cases[0].toolExecution_true' },
  { name: 'case_external_effects_true', scorecard: { ...base, cases: [{ ...base.cases[0], externalEffects: true }] }, expected: 'scorecard.cases[0].externalEffects_true' },
  { name: 'case_raw_persisted_true', scorecard: { ...base, cases: [{ ...base.cases[0], rawPersisted: true }] }, expected: 'scorecard.cases[0].rawPersisted_true' },
  { name: 'case_policy_decision_non_null', scorecard: { ...base, cases: [{ ...base.cases[0], policyDecision: 'ALLOW' }] }, expected: 'scorecard.cases[0].policyDecision_non_null' },
  { name: 'case_null_malformed', scorecard: { ...base, cases: [null] }, expected: 'scorecard.cases[0].malformed_case_not_object' },
  { name: 'case_missing_id', scorecard: { ...base, cases: [{ ...base.cases[0], id: undefined }] }, expected: 'scorecard.cases[0].case_id_required' },
  { name: 'case_rejection_reason_approve_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['approve'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:approve' },
  { name: 'case_rejection_reason_tool_execution_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['toolExecution'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:toolExecution' },
  { name: 'case_rejection_reason_may_allow_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['mayAllow'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:mayAllow' },
  { name: 'case_rejection_reason_network_fetch_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['networkFetch'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:networkFetch' },
  { name: 'case_rejection_reason_runtime_authority_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['runtimeAuthority'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:runtimeAuthority' },
  { name: 'case_rejection_reason_policy_decision_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['policyDecision'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:policyDecision' },
  { name: 'case_rejection_reason_raw_output_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['rawOutput'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:rawOutput' },
  { name: 'case_rejection_reason_external_effects_token', scorecard: { ...base, cases: base.cases.map((entry, index) => index === 1 ? { ...entry, rejectionReasons: ['externalEffects'] } : entry) }, expected: 'prequeue_scorecard.cases[1].rejectionReasons[0].forbidden_capability_token:externalEffects' }
];
const results = controls.map((control) => ({ name: control.name, queue: buildControlledOperatorReviewQueue(control.scorecard), expected: control.expected }));
for (const result of results) {
  assert.equal(result.queue.queueStatus, 'DEGRADED_NO_QUEUE_GENERATED', result.name);
  assert.equal(result.queue.queueItems.length, 0, result.name);
  assert.equal(result.queue.policyDecision, null, result.name);
  assert.equal(result.queue.enforcement, false, result.name);
  assert.equal(result.queue.externalEffects, false, result.name);
  assert.equal(result.queue.validationIssues.includes(result.expected), true, `${result.name} expected ${result.expected}`);
}
await writeFile(resolve('evidence/controlled-operator-review-queue-negative-controls-v0.23.3.out.json'), JSON.stringify({ rejectedNegativeControls: results.map((entry) => ({ name: entry.name, validationIssues: entry.queue.validationIssues })) }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));
