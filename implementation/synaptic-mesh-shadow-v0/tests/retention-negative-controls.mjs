import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateRetentionCandidate, summarizeRetentionGate } from '../src/retention-gate.mjs';

const artifact = 'T-synaptic-mesh-retention-negative-controls-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/retention-negative-controls.json');
const policyPath = resolve(packageRoot, 'fixtures/retention-policy.json');
const evidencePath = resolve(packageRoot, 'evidence/retention-negative-controls.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const policy = JSON.parse(await readFile(policyPath, 'utf8'));

assert.equal(fixture.mode, 'manual_offline_retention_gate_only');
assert.equal(policy.retentionGate, 'validate_metadata_retention_ceiling');
assert.equal(policy.rawLiveInputRetentionDays, 0);
assert.equal(policy.retentionSchedulerImplemented, false);
assert.equal(policy.deletionImplemented, false);
assert.match(fixture.description, /No deletion/);
assert.match(fixture.description, /No .*retention scheduler/);

const passResults = fixture.passCases.map((candidate) => evaluateRetentionCandidate(candidate));
const negativeResults = fixture.negativeControls.map((candidate) => evaluateRetentionCandidate(candidate));

for (const result of passResults) {
  assert.equal(result.retentionGate, 'pass', `${result.caseId} must pass`);
  assert.deepEqual(result.reasonCodes, [], `${result.caseId} must have no reason codes`);
}

for (const [index, result] of negativeResults.entries()) {
  const expected = fixture.negativeControls[index].expectedReasonCode;
  assert.equal(result.retentionGate, 'reject', `${result.caseId} must reject`);
  assert.ok(result.reasonCodes.includes(expected), `${result.caseId} must include ${expected}; got ${result.reasonCodes.join(', ')}`);
}

const coveredReasonCodes = [...new Set(negativeResults.flatMap((result) => result.reasonCodes))].sort();
const requiredReasonCodes = fixture.negativeControls.map((entry) => entry.expectedReasonCode).sort();
assert.deepEqual(coveredReasonCodes, [...new Set(requiredReasonCodes)].sort(), 'negative controls must cover every expected retention reason code exactly');

const unexpectedPasses = negativeResults.filter((result) => result.retentionGate !== 'reject');
const unexpectedRejects = passResults.filter((result) => result.retentionGate !== 'pass');
assert.deepEqual(unexpectedPasses, [], 'retention negative controls must not pass');
assert.deepEqual(unexpectedRejects, [], 'retention pass controls must not reject');

const passSummary = summarizeRetentionGate(passResults);
const negativeSummary = summarizeRetentionGate(negativeResults);
assert.equal(passSummary.retentionGate, 'pass');
assert.equal(negativeSummary.retentionGate, 'reject');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-09T01:45:00.000Z',
    verdict: 'pass',
    gate: 'implementation/synaptic-mesh-shadow-v0/src/retention-gate.mjs',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/retention-negative-controls.json',
    policyFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/retention-policy.json',
    passCases: fixture.passCases.length,
    negativeControls: fixture.negativeControls.length,
    rejectedNegativeControls: negativeResults.filter((result) => result.retentionGate === 'reject').length,
    unexpectedPasses: unexpectedPasses.length,
    unexpectedRejects: unexpectedRejects.length,
    coveredReasonCodes,
    passSummary,
    negativeSummary,
    rawLiveInputRetentionDays: 0,
    redactedObservationRetentionCeilingDays: policy.redactedObservationRetentionDays,
    redactedResultRetentionCeilingDays: policy.redactedResultRetentionDays,
    aggregateScorecardRetentionCeilingDays: policy.aggregateScorecardRetentionDays,
    rawContentPersisted: false,
    retentionSchedulerImplemented: false,
    deletionImplemented: false,
    mode: 'manual_offline_retention_gate_only',
    liveObserverImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'retention_negative_controls_over_committed_fixtures_only_not_scheduler_not_deletion_not_runtime_not_enforcement',
  },
  passResults,
  negativeResults,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
