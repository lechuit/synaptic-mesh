import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter } from '../src/adapters/read-only-local-file-adapter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json');

const forbiddenCapabilityFields = [
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
];

const forbiddenRawClassifierKeys = [
  'classifierDecision',
  'selectedRoute',
  'rejectedRoutes',
  'compactAllowed',
  'toolAuthorization',
];

function countCapabilityTrue(value) {
  if (!value || typeof value !== 'object') return 0;
  let count = 0;
  for (const key of forbiddenCapabilityFields) {
    if (value[key] === true) count += 1;
  }
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') count += countCapabilityTrue(child);
  }
  return count;
}

function collectForbiddenKeys(value, path = []) {
  if (!value || typeof value !== 'object') return [];
  const findings = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    if (forbiddenRawClassifierKeys.includes(key)) findings.push(childPath.join('.'));
    findings.push(...collectForbiddenKeys(child, childPath));
  }
  return findings;
}

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const canaryInput = inputs.valid[0];

assert.equal(inputs.valid.length, 1, 'canary must use exactly one explicit positive input fixture');
assert.equal(canaryInput.sourceAlreadyRedacted, true, 'canary source must be already redacted');
assert.equal(canaryInput.rawContentPersisted, false, 'canary must not persist raw content');
assert.equal(canaryInput.redactionReviewRecord?.reviewed, true, 'canary must include reviewed redaction record');
assert.equal(canaryInput.redactionReviewRecord?.rawContentPersisted, false, 'redaction review record must forbid raw content persistence');
assert.equal(canaryInput.redactionReviewRecord?.sourceAlreadyRedacted, true, 'redaction review record must confirm redaction');

const canaryResult = await runReadOnlyLocalFileAdapter(canaryInput, { repoRoot, adapterRunId: 'adapter_canary_001' });

assert.equal(canaryResult.ok, true, 'positive canary must pass');
assert.equal(canaryResult.result.sourceFileRead, true, 'positive canary must read one explicit source file');
assert.equal(canaryResult.result.recordOnly, true, 'positive canary must remain record-only');
assert.equal(canaryResult.result.sourceArtifactDigestVerified, true, 'positive canary must verify the source digest');
assert.equal(canaryResult.result.parserEvidenceProduced, true, 'positive canary must produce parser evidence');
assert.equal(canaryResult.result.classifierDecisionProduced, true, 'positive canary must call existing classifier stage');
assert.equal(canaryResult.result.decisionTraceProduced, true, 'positive canary must produce DecisionTrace');
assert.equal(canaryResult.result.advisoryReportProduced, true, 'positive canary must produce advisory report');
assert.equal(canaryResult.decisionTrace.rawClassifierDecisionPersisted, false, 'positive canary must not persist raw classifier decision');
assert.equal(Object.hasOwn(canaryResult, 'classifierDecision'), false, 'positive canary must not return raw classifier decision');
assert.ok(canaryResult.boundary.includes('calls_existing_route_classifier'), 'positive canary must call existing classifier pipeline');
assert.ok(canaryResult.boundary.includes('evidence_record_only'), 'positive canary must stay evidence-record only');

const sourceFilesRead = canaryResult.result.sourceFileRead ? 1 : 0;
const capabilityTrueCount = countCapabilityTrue(canaryResult);
const rawClassifierLeakFindings = collectForbiddenKeys(canaryResult);
const forbiddenEffects = capabilityTrueCount + rawClassifierLeakFindings.length;

assert.equal(sourceFilesRead, 1, 'positive canary must read exactly one explicit source file');
assert.equal(capabilityTrueCount, 0, 'positive canary must have zero true capability flags');
assert.equal(rawClassifierLeakFindings.length, 0, 'positive canary must not leak raw classifier route/tool fields');
assert.equal(forbiddenEffects, 0, 'positive canary must have zero forbidden effects');

const output = {
  artifact: 'T-synaptic-mesh-read-only-local-file-adapter-canary-v0.5.0-alpha-pr4',
  timestamp: '2026-05-13T23:45:00.000Z',
  summary: {
    readOnlyLocalFileAdapterCanary: 'pass',
    releaseLayer: 'v0.5.0-alpha-pr4',
    positiveCases: 1,
    sourceFilesRead,
    recordOnly: canaryResult.result.recordOnly,
    sourceArtifactDigestVerified: canaryResult.result.sourceArtifactDigestVerified,
    parserEvidenceProduced: canaryResult.result.parserEvidenceProduced,
    classifierDecisionProduced: canaryResult.result.classifierDecisionProduced,
    decisionTraceProduced: canaryResult.result.decisionTraceProduced,
    advisoryReportProduced: canaryResult.result.advisoryReportProduced,
    rawClassifierDecisionPersisted: canaryResult.decisionTrace.rawClassifierDecisionPersisted,
    forbiddenEffects,
    capabilityTrueCount,
    rawClassifierLeakFindings: rawClassifierLeakFindings.length,
    toolExecution: canaryResult.result.toolExecution,
    memoryWrite: canaryResult.result.memoryWrite,
    configWrite: canaryResult.result.configWrite,
    externalPublication: canaryResult.result.externalPublication,
    approvalEmission: canaryResult.result.approvalEmission,
    machineReadablePolicyDecision: canaryResult.result.machineReadablePolicyDecision,
    agentConsumed: canaryResult.result.agentConsumed,
    mayBlock: canaryResult.result.mayBlock,
    mayAllow: canaryResult.result.mayAllow,
    authorization: canaryResult.result.authorization,
    enforcement: canaryResult.result.enforcement,
  },
  canaryInput: {
    sourceFilePath: canaryInput.sourceFilePath,
    sourceArtifactDigest: canaryInput.sourceArtifactDigest,
    sourceAlreadyRedacted: canaryInput.sourceAlreadyRedacted,
    rawContentPersisted: canaryInput.rawContentPersisted,
    redactionReviewRecordPresent: Boolean(canaryInput.redactionReviewRecord),
  },
  adapterResult: canaryResult.result,
  parserEvidence: canaryResult.parserEvidence,
  decisionTrace: canaryResult.decisionTrace,
  advisoryReport: canaryResult.advisoryReport,
  rawClassifierLeakFindings,
  boundary: [
    'positive_canary_only',
    'one_explicit_already_redacted_local_file',
    'record_only',
    'existing_pipeline_only',
    'no_raw_classifier_decision_persisted',
    'no_runtime_authorization',
    'no_enforcement',
    'no_tool_execution',
    'no_memory_or_config_write',
    'no_external_publication',
  ],
};

assert.equal(Object.hasOwn(output, 'classifierDecision'), false, 'canary evidence must not persist raw classifier decision');
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
