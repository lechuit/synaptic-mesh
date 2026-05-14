import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReadOnlyLocalFileAdapter } from '../src/adapters/read-only-local-file-adapter.mjs';
import { classifyRoute } from '../src/route-classifier.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const inputsPath = resolve(packageRoot, 'fixtures/read-only-local-file-adapter-inputs.json');
const evidencePath = resolve(packageRoot, 'evidence/read-only-local-file-adapter-reproducibility.out.json');
const artifact = 'T-synaptic-mesh-read-only-local-file-adapter-reproducibility-v0.5.1';
const timestamp = '2026-05-14T04:30:00.000Z';

const capabilityFields = Object.freeze([
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
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function hash(value) {
  const text = typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(stable(value));
  return `sha256:${createHash('sha256').update(text).digest('hex')}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function classifierDigest(value) {
  return `sha256:${createHash('sha256').update(Buffer.from(canonicalJson(value))).digest('hex')}`;
}

function stripVolatile(value) {
  if (Array.isArray(value)) return value.map(stripVolatile);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value)
      .filter((key) => !['generatedAt', 'durationMs', 'runId', 'adapterRunId'].includes(key))
      .sort()
      .map((key) => [key, stripVolatile(value[key])]));
  }
  return value;
}

function countCapabilityTrue(value) {
  if (!value || typeof value !== 'object') return 0;
  let count = 0;
  for (const key of capabilityFields) {
    if (value[key] === true) count += 1;
  }
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') count += countCapabilityTrue(child);
  }
  return count;
}

function routeDecisionInputFrom({ input, parserEvidence }) {
  return {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: parserEvidence.validReceipts,
      invalidReceipts: parserEvidence.invalidReceipts,
      sensitiveSignals: parserEvidence.sensitiveSignals,
      adapterMode: input.adapterMode,
      alreadyRedacted: input.sourceAlreadyRedacted,
    },
    recommendedRoute: 'shadow_only',
  };
}

function capabilityFlagsFrom(runResult) {
  return Object.fromEntries(capabilityFields.map((field) => [field, runResult.result[field] ?? runResult.decisionTrace?.[field] ?? runResult.advisoryReport?.[field] ?? false]));
}

function normalizeRun({ input, sourceDigest, runResult }) {
  const routeDecisionInput = routeDecisionInputFrom({ input, parserEvidence: runResult.parserEvidence });
  const classifierDecision = classifyRoute({ parserEvidence: runResult.parserEvidence, routeDecisionInput });
  const computedClassifierDecisionDigest = classifierDigest(classifierDecision);
  assert.equal(
    runResult.decisionTrace.classifierDecisionDigest,
    computedClassifierDecisionDigest,
    'DecisionTrace classifierDecisionDigest must bind the selected route and reason codes',
  );

  const decisionTraceNormalizedContent = stripVolatile(runResult.decisionTrace);
  const advisoryReportNormalizedContent = stripVolatile(runResult.advisoryReport);
  const adapterResultNormalized = stripVolatile(runResult.result);
  const capabilityFlags = capabilityFlagsFrom(runResult);
  const boundaryVerdicts = {
    ok: runResult.ok,
    sourceFileRead: runResult.result.sourceFileRead,
    sourceArtifactDigestVerified: runResult.result.sourceArtifactDigestVerified,
    recordOnly: runResult.result.recordOnly,
    parserEvidenceProduced: runResult.result.parserEvidenceProduced,
    classifierDecisionProduced: runResult.result.classifierDecisionProduced,
    decisionTraceProduced: runResult.result.decisionTraceProduced,
    advisoryReportProduced: runResult.result.advisoryReportProduced,
    rawClassifierDecisionPersisted: runResult.decisionTrace.rawClassifierDecisionPersisted,
    notAuthority: runResult.advisoryReport.notAuthority,
    notAgentInstruction: runResult.advisoryReport.notAgentInstruction,
  };

  const normalizedOutput = {
    inputDigest: hash(stripVolatile(input)),
    sourceArtifactDigest: input.sourceArtifactDigest,
    sourceArtifactContentDigest: sourceDigest,
    sourceFilePath: input.sourceFilePath,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    classifierDecisionDigest: runResult.decisionTrace.classifierDecisionDigest,
    decisionTraceHash: hash(decisionTraceNormalizedContent),
    advisoryReportHash: hash(advisoryReportNormalizedContent),
    advisoryReportNormalizedContent,
    adapterResult: adapterResultNormalized,
    parserEvidenceDigest: hash(runResult.parserEvidence),
    recordOnly: runResult.result.recordOnly,
    capabilityFlags,
    boundaryVerdicts,
    boundary: runResult.boundary,
  };

  return {
    normalizedOutput,
    normalizedOutputHash: hash(normalizedOutput),
    decisionTraceHash: normalizedOutput.decisionTraceHash,
    advisoryReportHash: normalizedOutput.advisoryReportHash,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    capabilityTrueCount: countCapabilityTrue({ result: runResult.result, decisionTrace: runResult.decisionTrace, advisoryReport: runResult.advisoryReport }),
    forbiddenEffects: countCapabilityTrue({ result: runResult.result, decisionTrace: runResult.decisionTrace, advisoryReport: runResult.advisoryReport }),
  };
}

const inputs = JSON.parse(await readFile(inputsPath, 'utf8'));
const input = inputs.valid[0];
const sourceBytes = await readFile(resolve(repoRoot, input.sourceFilePath));
const sourceDigest = hash(sourceBytes);
assert.equal(sourceDigest, input.sourceArtifactDigest, 'fixture source digest must match input sourceArtifactDigest');

const runs = [];
for (let index = 0; index < 2; index += 1) {
  const runId = `adapter_repro_run_${index + 1}`;
  const durationMs = index + 1;
  const runResult = await runReadOnlyLocalFileAdapter(input, { repoRoot, adapterRunId: runId });
  assert.equal(runResult.ok, true, `${runId} must pass`);
  assert.equal(runResult.result.adapterRunId, runId, `${runId} should carry its temporal adapterRunId before normalization`);
  const normalized = normalizeRun({ input, sourceDigest, runResult });
  runs.push({
    runId,
    generatedAt: timestamp,
    durationMs,
    ...normalized,
  });
}

const baseline = runs[0];
const normalizedOutputMismatches = runs.filter((run) => run.normalizedOutputHash !== baseline.normalizedOutputHash).length;
const decisionTraceHashMismatches = runs.filter((run) => run.decisionTraceHash !== baseline.decisionTraceHash).length;
const advisoryReportHashMismatches = runs.filter((run) => run.advisoryReportHash !== baseline.advisoryReportHash).length;
const capabilityTrueCount = runs.reduce((sum, run) => sum + run.capabilityTrueCount, 0);
const forbiddenEffects = runs.reduce((sum, run) => sum + run.forbiddenEffects, 0);

assert.equal(runs.length, 2, 'reproducibility gate must run twice');
assert.equal(normalizedOutputMismatches, 0, 'normalized adapter evidence must be reproducible across runs');
assert.equal(decisionTraceHashMismatches, 0, 'DecisionTrace hash must be reproducible across runs');
assert.equal(advisoryReportHashMismatches, 0, 'advisory report hash must be reproducible across runs');
assert.equal(capabilityTrueCount, 0, 'reproducibility runs must have zero true capability flags');
assert.equal(forbiddenEffects, 0, 'reproducibility runs must have zero forbidden effects');
assert.equal(baseline.normalizedOutput.sourceArtifactDigest, input.sourceArtifactDigest, 'normalized output must include input source artifact digest');
assert.equal(baseline.normalizedOutput.sourceArtifactContentDigest, sourceDigest, 'normalized output must include source artifact content digest');
assert.equal(baseline.normalizedOutput.recordOnly, true, 'normalized output must include recordOnly true');
assert.ok(baseline.normalizedOutput.selectedRoute, 'normalized output must include selectedRoute');
assert.ok(baseline.normalizedOutput.reasonCodes.length > 0, 'normalized output must include reason codes');
assert.equal(baseline.normalizedOutput.boundaryVerdicts.notAuthority, true, 'normalized output must include advisory boundary verdicts');
assert.equal(baseline.normalizedOutput.boundaryVerdicts.notAgentInstruction, true, 'normalized output must include agent-instruction boundary verdict');

const summary = {
  readOnlyLocalFileAdapterReproducibility: 'pass',
  runs: runs.length,
  positiveCases: 1,
  normalizedOutputMismatches,
  decisionTraceHashMismatches,
  advisoryReportHashMismatches,
  forbiddenEffects,
  capabilityTrueCount,
};

const output = {
  artifact,
  timestamp,
  summary,
  volatileFieldsExcludedFromHashes: ['generatedAt', 'durationMs', 'runId', 'adapterRunId'],
  includedInNormalizedHash: [
    'inputDigest',
    'sourceArtifactDigest',
    'sourceArtifactContentDigest',
    'selectedRoute',
    'reasonCodes',
    'classifierDecisionDigest',
    'decisionTraceHash',
    'advisoryReportHash',
    'advisoryReportNormalizedContent',
    'recordOnly',
    'capabilityFlags',
    'boundaryVerdicts',
  ],
  runs: runs.map((run) => ({
    runId: run.runId,
    generatedAt: run.generatedAt,
    durationMs: run.durationMs,
    normalizedOutputHash: run.normalizedOutputHash,
    decisionTraceHash: run.decisionTraceHash,
    advisoryReportHash: run.advisoryReportHash,
    selectedRoute: run.selectedRoute,
    reasonCodes: run.reasonCodes,
    capabilityTrueCount: run.capabilityTrueCount,
    forbiddenEffects: run.forbiddenEffects,
  })),
  baselineNormalizedOutput: baseline.normalizedOutput,
  boundary: [
    'manual_local_reproducibility_only',
    'one_explicit_already_redacted_local_file',
    'same_input_same_normalized_evidence',
    'same_decision_trace',
    'same_advisory_report',
    'record_only',
    'no_runtime_authorization',
    'no_enforcement',
    'no_tool_execution',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
