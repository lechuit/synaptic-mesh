import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRedactionCandidate } from '../src/redaction-scanner.mjs';
import { evaluateRetentionCandidate } from '../src/retention-gate.mjs';

const artifact = 'T-synaptic-mesh-redaction-retention-executable-gates-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/redaction-retention-executable-gates.json');
const evidencePath = resolve(packageRoot, 'evidence/redaction-retention-executable-gates.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

const requiredBoundary = [
  'manual_offline_only',
  'committed_fixtures_only',
  'redaction_first_retention_second',
  'local_evidence_output_only',
  'record_only',
  'no_live_observation',
  'no_runtime',
  'no_daemon',
  'no_watcher',
  'no_adapter_integration',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_external_publication',
  'no_publication_automation',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_enforcement',
];

assert.equal(fixture.schemaVersion, 'redaction-retention-executable-gates-v0');
assert.equal(fixture.mode, 'manual_offline_redaction_retention_gate_only');
assert.match(fixture.description, /committed fixtures only/);
assert.match(fixture.description, /No live observation/);
for (const boundaryLabel of requiredBoundary) assert.ok(fixture.boundary.includes(boundaryLabel), `fixture boundary must include ${boundaryLabel}`);

function evaluateComposedCase(row) {
  const redactionResult = scanRedactionCandidate(row.redactionCandidate);
  const retentionResult = evaluateRetentionCandidate(row.retentionCandidate);
  const reasonCodes = [];

  if (redactionResult.redactionGate === 'reject') {
    reasonCodes.push('REDACTION_GATE_REJECTED', ...redactionResult.reasonCodes);
  }
  if (redactionResult.redactionGate === 'pass' && retentionResult.retentionGate === 'reject') {
    reasonCodes.push('RETENTION_GATE_REJECTED', ...retentionResult.reasonCodes);
  }

  const composedGate = reasonCodes.length === 0 ? 'pass' : 'reject';
  return {
    caseId: row.caseId,
    composedGate,
    redactionGate: redactionResult.redactionGate,
    retentionGate: retentionResult.retentionGate,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    redactionReasonCodes: redactionResult.reasonCodes,
    retentionReasonCodes: retentionResult.reasonCodes,
    redactionResult,
    retentionResult,
    boundary: 'manual_offline_redaction_retention_gate_only',
  };
}

const passResults = fixture.passCases.map(evaluateComposedCase);
const rejectResults = fixture.rejectCases.map(evaluateComposedCase);

for (const result of passResults) {
  assert.equal(result.redactionGate, 'pass', `${result.caseId} redaction gate must pass`);
  assert.equal(result.retentionGate, 'pass', `${result.caseId} retention gate must pass`);
  assert.equal(result.composedGate, 'pass', `${result.caseId} composed gate must pass`);
  assert.deepEqual(result.reasonCodes, [], `${result.caseId} must have no composed reason codes`);
}

for (const [index, result] of rejectResults.entries()) {
  const expectedReasonCodes = fixture.rejectCases[index].expectedReasonCodes;
  assert.equal(result.composedGate, 'reject', `${result.caseId} composed gate must reject`);
  for (const expectedReasonCode of expectedReasonCodes) {
    assert.ok(result.reasonCodes.includes(expectedReasonCode), `${result.caseId} must include ${expectedReasonCode}; got ${result.reasonCodes.join(', ')}`);
  }
}

const redactionRejectedBeforeRetention = rejectResults.filter((result) => result.reasonCodes.includes('REDACTION_GATE_REJECTED')).length;
const retentionRejectedAfterRedactionPass = rejectResults.filter((result) => result.reasonCodes.includes('RETENTION_GATE_REJECTED')).length;
const unexpectedPasses = rejectResults.filter((result) => result.composedGate !== 'reject');
const unexpectedRejects = passResults.filter((result) => result.composedGate !== 'pass');
const coveredReasonCodes = [...new Set(rejectResults.flatMap((result) => result.reasonCodes))].sort();

assert.equal(passResults.length, 3, 'fixture must keep three positive controls');
assert.equal(rejectResults.length, 7, 'fixture must keep seven expected rejects');
assert.equal(redactionRejectedBeforeRetention, 2, 'two rows must prove redaction rejects before retention can matter');
assert.equal(retentionRejectedAfterRedactionPass, 5, 'five rows must prove retention rejects after redaction passes');
assert.deepEqual(unexpectedPasses, [], 'reject cases must not pass');
assert.deepEqual(unexpectedRejects, [], 'pass cases must not reject');
assert.ok(coveredReasonCodes.includes('REDACTION_SECRET_LIKE_VALUE_PERSISTED'), 'must cover secret-like redaction rejection');
assert.ok(coveredReasonCodes.includes('REDACTION_PRIVATE_PATH_PERSISTED'), 'must cover private-path redaction rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_CEILING_EXCEEDED'), 'must cover retention ceiling rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_REDACTION_STATUS_REQUIRED'), 'must cover missing redaction status rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_UNKNOWN_CLASS_REJECTED'), 'must cover unknown retention class rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_SCHEDULER_FORBIDDEN'), 'must cover scheduler pressure rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN'), 'must cover deletion pressure rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_RUNTIME_INTEGRATION_FORBIDDEN'), 'must cover runtime pressure rejection');
assert.ok(coveredReasonCodes.includes('RETENTION_LIVE_OBSERVER_FORBIDDEN'), 'must cover live observer pressure rejection');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T04:10:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/redaction-retention-executable-gates.json',
    redactionScanner: 'implementation/synaptic-mesh-shadow-v0/src/redaction-scanner.mjs',
    retentionGate: 'implementation/synaptic-mesh-shadow-v0/src/retention-gate.mjs',
    passCases: passResults.length,
    expectedRejects: rejectResults.length,
    unexpectedPasses: unexpectedPasses.length,
    unexpectedRejects: unexpectedRejects.length,
    redactionRejectedBeforeRetention,
    retentionRejectedAfterRedactionPass,
    coveredReasonCodes,
    rawPersistedInPassOutput: false,
    secretLikePersistedInPassOutput: false,
    privatePathPersistedInPassOutput: false,
    retentionSchedulerImplemented: false,
    deletionImplemented: false,
    mode: 'manual_offline_redaction_retention_gate_only',
    liveObserverImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    publicationAutomationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'redaction_retention_executable_gate_composition_over_committed_fixtures_only_not_runtime_not_authorization_not_enforcement',
  },
  passResults,
  rejectResults,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
