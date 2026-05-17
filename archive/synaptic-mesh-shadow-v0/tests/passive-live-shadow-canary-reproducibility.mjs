import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-reproducibility-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-reproducibility.out.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function capability(record, field) {
  return record.capabilities?.[field] === true;
}

function digestLooksValid(value) {
  return /^sha256:[a-f0-9]{64}$/.test(value ?? '');
}

function evaluate(record) {
  const reasonCodes = [];
  if (record.optIn !== true) reasonCodes.push('CANARY_OPT_IN_REQUIRED');
  if (record.sourceKind !== 'manual_redacted_canary_packet') reasonCodes.push('CANARY_LIVE_SOURCE_FORBIDDEN');
  if (record.inputBoundary !== 'already_redacted') reasonCodes.push('CANARY_ALREADY_REDACTED_REQUIRED');
  if (record.rawInputPersisted === true) reasonCodes.push('CANARY_RAW_PERSISTENCE_FORBIDDEN');
  if (record.liveTrafficRead === true) reasonCodes.push('CANARY_LIVE_TRAFFIC_READ_FORBIDDEN');
  if (record.outputBoundary !== 'record_only_local_evidence') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.observerMode !== 'passive') reasonCodes.push('CANARY_PASSIVE_MODE_REQUIRED');
  if (record.observerAction !== 'record_only') reasonCodes.push('CANARY_RECORD_ONLY_REQUIRED');
  if (record.effectBoundary !== 'no_effects') reasonCodes.push('CANARY_NO_EFFECTS_REQUIRED');
  if (record.runtimeIntegration === true) reasonCodes.push('CANARY_RUNTIME_FORBIDDEN');
  if (record.daemonStarted === true) reasonCodes.push('CANARY_DAEMON_FORBIDDEN');
  if (record.watcherStarted === true) reasonCodes.push('CANARY_WATCHER_FORBIDDEN');
  if (record.adapterIntegrated === true) reasonCodes.push('CANARY_ADAPTER_FORBIDDEN');
  if (record.toolExecuted === true || capability(record, 'mayExecuteTool')) reasonCodes.push('CANARY_TOOL_EXECUTION_FORBIDDEN');
  if (record.memoryWritten === true || capability(record, 'mayWriteMemory')) reasonCodes.push('CANARY_MEMORY_WRITE_FORBIDDEN');
  if (record.configWritten === true || capability(record, 'mayWriteConfig')) reasonCodes.push('CANARY_CONFIG_WRITE_FORBIDDEN');
  if (record.publishedExternally === true || capability(record, 'mayPublishExternally')) reasonCodes.push('CANARY_PUBLICATION_FORBIDDEN');
  if (record.publicationAutomation === true) reasonCodes.push('CANARY_PUBLICATION_AUTOMATION_FORBIDDEN');
  if (record.agentInstructionWritten === true || capability(record, 'mayModifyAgentInstructions')) reasonCodes.push('CANARY_AGENT_INSTRUCTION_WRITE_FORBIDDEN');
  if (record.approvalEntered === true || capability(record, 'mayEnterApprovalPath')) reasonCodes.push('CANARY_APPROVAL_FORBIDDEN');
  if (record.blocked === true || capability(record, 'mayBlock')) reasonCodes.push('CANARY_BLOCKING_FORBIDDEN');
  if (record.allowed === true || capability(record, 'mayAllow')) reasonCodes.push('CANARY_ALLOWING_FORBIDDEN');
  if (record.authorizesAction === true) reasonCodes.push('CANARY_AUTHORIZATION_FORBIDDEN');
  if (record.deleted === true) reasonCodes.push('CANARY_DELETION_FORBIDDEN');
  if (record.retentionSchedulerStarted === true) reasonCodes.push('CANARY_RETENTION_SCHEDULER_FORBIDDEN');
  if (record.enforced === true) reasonCodes.push('CANARY_ENFORCEMENT_FORBIDDEN');

  for (const field of ['sourceArtifactId', 'sourceArtifactPath', 'sourceDigest', 'sourceMtime', 'receiverNow']) {
    if (!record[field]) reasonCodes.push('CANARY_SOURCE_TUPLE_REQUIRED');
  }
  if (record.sourceDigest && !digestLooksValid(record.sourceDigest)) reasonCodes.push('CANARY_SOURCE_DIGEST_REQUIRED');

  const reasonSet = [...new Set(reasonCodes)].sort();
  const capabilityTrueCount = effectCapabilityFields.filter((field) => capability(record, field)).length;
  const forbiddenEffects = reasonSet.filter((code) => code.endsWith('_FORBIDDEN'));
  const boundaryVerdict = reasonSet.length === 0 ? 'allow_record_only' : 'reject_no_effects_boundary';
  const scorecard = {
    caseId: record.caseId,
    accepted: reasonSet.length === 0,
    reasonSet,
    boundaryVerdict,
    recordOnly: record.observerAction === 'record_only' && record.outputBoundary === 'record_only_local_evidence',
    capabilityTrueCount,
    forbiddenEffects: forbiddenEffects.length,
  };
  return {
    caseId: record.caseId,
    normalizedOutput: {
      accepted: scorecard.accepted,
      reasonSet,
      boundaryVerdict,
      recordOnly: scorecard.recordOnly,
      capabilityTrueCount,
      forbiddenEffects: forbiddenEffects.length,
    },
    scorecard,
  };
}

function runCanary(runIndex) {
  return {
    runIndex,
    passCases: fixture.passCases.map(evaluate),
    rejectCases: fixture.rejectCases.map(evaluate),
  };
}

const runs = [runCanary(1), runCanary(2)];
const first = runs[0];
const second = runs[1];

const mismatches = [];
const firstById = new Map([...first.passCases, ...first.rejectCases].map((item) => [item.caseId, item]));
for (const candidate of [...second.passCases, ...second.rejectCases]) {
  const baseline = firstById.get(candidate.caseId);
  if (!baseline) {
    mismatches.push({ caseId: candidate.caseId, kind: 'missing_baseline' });
    continue;
  }
  if (digest(baseline.normalizedOutput) !== digest(candidate.normalizedOutput)) mismatches.push({ caseId: candidate.caseId, kind: 'normalized_output_mismatch' });
  if (digest(baseline.normalizedOutput.reasonSet) !== digest(candidate.normalizedOutput.reasonSet)) mismatches.push({ caseId: candidate.caseId, kind: 'reason_set_mismatch' });
  if (digest(baseline.scorecard) !== digest(candidate.scorecard)) mismatches.push({ caseId: candidate.caseId, kind: 'scorecard_mismatch' });
  if (baseline.normalizedOutput.boundaryVerdict !== candidate.normalizedOutput.boundaryVerdict) mismatches.push({ caseId: candidate.caseId, kind: 'boundary_verdict_mismatch' });
}

for (const result of first.passCases) assert.equal(result.normalizedOutput.accepted, true, `${result.caseId} should pass`);
for (const result of first.rejectCases) assert.equal(result.normalizedOutput.accepted, false, `${result.caseId} should reject`);
assert.deepEqual(mismatches, []);

const allFirst = [...first.passCases, ...first.rejectCases];
const normalizedOutputMismatches = mismatches.filter((item) => item.kind === 'normalized_output_mismatch').length;
const scorecardMismatches = mismatches.filter((item) => item.kind === 'scorecard_mismatch').length;
const reasonSetMismatches = mismatches.filter((item) => item.kind === 'reason_set_mismatch').length;
const boundaryVerdictMismatches = mismatches.filter((item) => item.kind === 'boundary_verdict_mismatch').length;
const passingCapabilityTrueCount = first.passCases.reduce((sum, item) => sum + item.normalizedOutput.capabilityTrueCount, 0);
const passingForbiddenEffects = first.passCases.reduce((sum, item) => sum + item.normalizedOutput.forbiddenEffects, 0);

const output = {
  passiveCanaryReproducibility: 'pass',
  artifact,
  timestamp: '2026-05-12T12:45:00.000Z',
  runs: runs.length,
  passCases: fixture.passCases.length,
  rejectCases: fixture.rejectCases.length,
  normalizedOutputMismatches,
  reasonSetMismatches,
  scorecardMismatches,
  boundaryVerdictMismatches,
  capabilityTrueCount: passingCapabilityTrueCount,
  forbiddenEffects: passingForbiddenEffects,
  runDigests: runs.map((run) => ({ runIndex: run.runIndex, digest: digest({ passCases: run.passCases, rejectCases: run.rejectCases }) })),
  mismatches,
  scorecard: allFirst.map((item) => item.scorecard),
  boundary: [
    'manual_local_opt_in_passive_canary_only',
    'same_packet_same_normalized_output',
    'same_packet_same_reason_set',
    'same_packet_same_scorecard',
    'same_packet_same_boundary_verdict',
    'no_live_traffic_read',
    'no_runtime_integration',
    'no_tool_execution',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_agent_instruction_write',
    'no_approval_block_allow_authorize_or_enforce',
  ],
};

assert.equal(output.passiveCanaryReproducibility, 'pass');
assert.equal(output.runs, 2);
assert.equal(output.passCases, 2);
assert.equal(output.rejectCases, 8);
assert.equal(output.normalizedOutputMismatches, 0);
assert.equal(output.scorecardMismatches, 0);
assert.equal(output.capabilityTrueCount, 0);
assert.equal(output.forbiddenEffects, 0);

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
