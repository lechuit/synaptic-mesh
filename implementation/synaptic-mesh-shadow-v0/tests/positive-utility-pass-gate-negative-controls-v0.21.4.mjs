import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate, positiveUtilityPassGateNegativeControlSummary } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const packet = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 4 }));
const cases = [
  ['raw_persisted', 'summary', 'rawPersisted'],
  ['raw_output', 'summary', 'rawOutput'],
  ['agent_consumed_output', 'summary', 'agentConsumedOutput'],
  ['tool_execution', 'summary', 'toolExecution'],
  ['authorization', 'summary', 'authorization'],
  ['enforcement', 'summary', 'enforcement'],
  ['external_effects', 'summary', 'externalEffects'],
  ['policy_decision', 'summary', 'policyDecision'],
  ['machine_readable_policy_decision_summary', 'summary', 'machineReadablePolicyDecision'],
  ['memory_config_writes_summary', 'summary', 'memoryConfigWrites'],
  ['memory_config_write_summary', 'summary', 'memoryConfigWrite'],
  ['network_fetch_summary', 'summary', 'networkFetch'],
  ['network_resource_fetch_summary', 'summary', 'networkResourceFetch'],
  ['resource_fetch_summary', 'summary', 'resourceFetch'],
  ['approval_block_allow_authorization_enforcement_summary', 'summary', 'approvalBlockAllowAuthorizationEnforcement'],
  ['machine_readable_policy_decision_protocol', 'protocol', 'machineReadablePolicyDecision'],
  ['memory_config_writes_protocol', 'protocol', 'memoryConfigWrites'],
  ['network_fetch_protocol', 'protocol', 'networkFetch'],
  ['resource_fetch_protocol', 'protocol', 'resourceFetch'],
  ['approval_block_allow_authorization_enforcement_protocol', 'protocol', 'approvalBlockAllowAuthorizationEnforcement'],
  ['network_fetch_adapter', 'adapter', 'networkFetch'],
  ['resource_fetch_adapter', 'adapter', 'resourceFetch']
];
const rejected = [];
for (const [name, container, field] of cases) {
  const copy = structuredClone(packet);
  if (!copy[container]) copy[container] = {};
  if (field === 'policyDecision') copy[container][field] = 'not-null';
  else copy[container][field] = true;
  const result = evaluatePositiveUtilityPassGate(copy);
  assert.equal(result.positiveUtilityGatePassed, false, name);
  assert.equal(result.classification, 'REJECTED_NOT_READY_FOR_HUMAN_REVIEW');
  assert.equal(result.summary.policyDecision, null);
  assert.equal(result.summary.authorization, false);
  assert.equal(result.summary.enforcement, false);
  assert.equal(result.summary.unexpectedPermits, 0);
  rejected.push(name);
}
const failingSourcePacket = JSON.parse(await runBoundedMultisourceShadowRead({ sources: ['positive-utility-samples/source-a.md', 'positive-utility-samples/missing.md', 'positive-utility-samples/source-b.md'], recordsPerSource: 2, totalRecords: 6 }));
const sourceFailureResult = evaluatePositiveUtilityPassGate(failingSourcePacket);
assert.equal(sourceFailureResult.positiveUtilityGatePassed, false);
assert(sourceFailureResult.rejectionReasons.includes('source_failures_exceed_positive_gate_threshold'));
rejected.push('source_failures_exceed_positive_gate_threshold');
const summary = positiveUtilityPassGateNegativeControlSummary(rejected);
const out = { summary };
await writeFile(resolve('evidence/positive-utility-pass-gate-negative-controls-v0.21.4.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
