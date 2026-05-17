import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter, writeReadOnlyLocalFileAdapterEvidence } from '../src/adapters/read-only-local-file-adapter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const validInput = inputs.valid[0];
const result = await runReadOnlyLocalFileAdapter(validInput, { repoRoot, adapterRunId: 'adapter_run_001' });

assert.equal(result.ok, true);
assert.equal(result.result.schemaVersion, 'read-only-local-file-adapter-result-v0');
assert.equal(result.result.recordOnly, true);
assert.equal(result.result.sourceFileRead, true);
assert.equal(result.result.sourceFilePath, validInput.sourceFilePath);
assert.equal(validInput.sourceAlreadyRedacted, true);
assert.equal(validInput.rawContentPersisted, false);
assert.equal(validInput.redactionReviewRecord.reviewed, true);
assert.equal(validInput.redactionReviewRecord.rawContentPersisted, false);
assert.equal(result.result.sourceArtifactDigestVerified, true);
assert.equal(result.result.parserEvidenceProduced, true);
assert.equal(result.result.classifierDecisionProduced, true);
assert.equal(result.result.decisionTraceProduced, true);
assert.equal(result.result.advisoryReportProduced, true);
assert.equal(result.parserEvidence.kind, 'parserEvidence');
assert.equal(result.parserEvidence.rawInputShape, 'explicit_already_redacted_local_file');
assert.equal(Object.hasOwn(result, 'classifierDecision'), false, 'raw classifier decision must not be returned');
assert.equal(result.decisionTrace.kind, 'DecisionTrace');
assert.equal(result.advisoryReport.kind, 'human_readable_advisory_report');
assert.equal(result.advisoryReport.machineReadablePolicyDecision, false);
assert.equal(result.advisoryReport.agentConsumed, false);
assert.ok(result.boundary.includes('no_policy_logic_in_adapter'));
assert.ok(result.boundary.includes('calls_existing_route_classifier'));

const forbiddenResultFlags = ['toolExecution', 'memoryWrite', 'configWrite', 'externalPublication', 'approvalEmission', 'machineReadablePolicyDecision', 'agentConsumed', 'mayBlock', 'mayAllow', 'authorization', 'enforcement'];
for (const field of forbiddenResultFlags) assert.equal(result.result[field], false, `${field} must remain false`);
for (const field of ['toolExecution', 'memoryWrite', 'configWrite', 'externalPublication', 'authorization', 'enforcement']) {
  assert.equal(result.decisionTrace[field], false, `decisionTrace ${field} must remain false`);
}

const rejectedRuns = [];
for (const entry of inputs.invalid) {
  const candidate = { ...validInput, ...entry.patch };
  for (const key of entry.remove ?? []) delete candidate[key];
  const rejected = await runReadOnlyLocalFileAdapter(candidate, { repoRoot, adapterRunId: `adapter_run_reject_${entry.id}` });
  assert.equal(rejected.ok, false, `${entry.id} must reject`);
  assert.equal(rejected.result.sourceFileRead, false, `${entry.id} must reject before reading`);
  for (const field of forbiddenResultFlags) assert.equal(rejected.result[field], false, `${entry.id} ${field} must remain false`);
  rejectedRuns.push({ id: entry.id, ok: rejected.ok, sourceFileRead: rejected.result.sourceFileRead, reasons: rejected.advisoryReport.reasons });
}

const output = {
  artifact: 'T-synaptic-mesh-read-only-local-file-adapter-v0.5.0-alpha-pr2',
  timestamp: '2026-05-13T23:05:00.000Z',
  summary: {
    readOnlyLocalFileAdapter: 'pass',
    releaseLayer: 'v0.5.0-alpha-pr2',
    adapterSkeleton: true,
    adapterDecidesAuthority: false,
    callsExistingPipeline: true,
    sourceFileRead: result.result.sourceFileRead,
    sourceArtifactDigestVerified: result.result.sourceArtifactDigestVerified,
    parserEvidenceProduced: result.result.parserEvidenceProduced,
    classifierDecisionProduced: result.result.classifierDecisionProduced,
    decisionTraceProduced: result.result.decisionTraceProduced,
    advisoryReportProduced: result.result.advisoryReportProduced,
    invalidInputsRejectedBeforeRead: rejectedRuns.length,
    recordOnly: result.result.recordOnly,
    toolExecution: result.result.toolExecution,
    memoryWrite: result.result.memoryWrite,
    configWrite: result.result.configWrite,
    externalPublication: result.result.externalPublication,
    approvalEmission: result.result.approvalEmission,
    machineReadablePolicyDecision: result.result.machineReadablePolicyDecision,
    agentConsumed: result.result.agentConsumed,
    mayBlock: result.result.mayBlock,
    mayAllow: result.result.mayAllow,
    authorization: result.result.authorization,
    enforcement: result.result.enforcement,
  },
  adapterResult: result.result,
  parserEvidence: result.parserEvidence,
  decisionTrace: result.decisionTrace,
  advisoryReport: result.advisoryReport,
  rejectedRuns,
  boundary: result.boundary,
};

assert.equal(Object.hasOwn(output, 'classifierDecision'), false, 'evidence must not persist raw classifier decision');
assert.equal(output.advisoryReport.classifierRoute, undefined, 'advisory must not expose classifier route');
assert.equal(output.decisionTrace.rawClassifierDecisionPersisted, false, 'raw classifier decision must not be persisted');
await writeReadOnlyLocalFileAdapterEvidence(output, { repoRoot });
console.log(JSON.stringify(output, null, 2));
