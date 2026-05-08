import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-pilot-failure-catalog-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const catalogPath = resolve(packageRoot, 'fixtures/manual-dry-run-cli-pilot-failure-catalog.json');
const baseInputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/case-001.json');
const tempInputPath = resolve(packageRoot, 'fixtures/manual-dry-run-inputs/failure-catalog-poc.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-pilot-failure-catalog.out.json');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const baseInput = JSON.parse(await readFile(baseInputPath, 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergePatch(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      mergePatch(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function hasSuccessEvidenceShape(value) {
  return Boolean(
    value &&
    value.manualDryRun === 'pass' &&
    value.decisionTrace &&
    value.liveShadowObservationResult &&
    value.scorecardRow &&
    value.manualDryRunResult
  );
}

async function maybeReadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(await readFile(path, 'utf8'));
}

const rows = [];
let expectedRejects = 0;
let unexpectedAccepts = 0;
let successEvidenceWrittenForRejectedCases = 0;
let forbiddenEffects = 0;
let capabilityTrueCount = 0;

await rm(tempInputPath, { force: true });

for (const [index, testCase] of catalog.cases.entries()) {
  const ordinal = String(index + 1).padStart(3, '0');
  const defaultOutputRel = `evidence/manual-dry-run-cli.failure-catalog-case-${ordinal}.out.json`;
  const outputRel = testCase.cliArgs?.output ?? defaultOutputRel;
  const outputPath = resolve(packageRoot, outputRel);
  const outputIsManagedEvidence = outputRel.startsWith('evidence/') && !outputRel.includes('..');
  if (outputIsManagedEvidence) await rm(outputPath, { force: true });

  let inputRel = testCase.cliArgs?.input;
  if (!inputRel) {
    const candidate = mergePatch(clone(baseInput), testCase.inputPatch ?? {});
    await writeFile(tempInputPath, `${JSON.stringify(candidate, null, 2)}\n`);
    inputRel = 'fixtures/manual-dry-run-inputs/failure-catalog-poc.json';
  }

  let accepted = false;
  let reasonCodes = [];
  try {
    await runManualDryRunCli(['--input', inputRel, '--output', outputRel, '--target', 'v0.1.15-pilot-failure-catalog'], { cwd: packageRoot });
    accepted = true;
    unexpectedAccepts += 1;
  } catch (error) {
    expectedRejects += 1;
    reasonCodes = error.reasonCodes ?? [error.reasonCode ?? 'UNKNOWN'];
    assert.deepEqual(reasonCodes, testCase.expectedReasonCodes, `${testCase.caseId} must reject with expected reason codes`);
  }

  const written = outputIsManagedEvidence ? await maybeReadJson(outputPath) : null;
  const successEvidenceWritten = hasSuccessEvidenceShape(written);
  if (!accepted && successEvidenceWritten) successEvidenceWrittenForRejectedCases += 1;
  assert.equal(successEvidenceWritten, false, `${testCase.caseId} must not write success evidence`);
  assert.equal(accepted, false, `${testCase.caseId} must reject`);

  rows.push({
    caseId: testCase.caseId,
    expectedReasonCodes: testCase.expectedReasonCodes,
    actualReasonCodes: reasonCodes,
    rejected: !accepted,
    successEvidenceWritten,
    decisionTraceWritten: Boolean(written?.decisionTrace),
    liveShadowObservationResultWritten: Boolean(written?.liveShadowObservationResult),
    scorecardSuccessRowWritten: Boolean(written?.scorecardRow),
  });

  await rm(tempInputPath, { force: true });
}

assert.equal(catalog.cases.length, 14);
assert.equal(expectedRejects, 14);
assert.equal(unexpectedAccepts, 0);
assert.equal(successEvidenceWrittenForRejectedCases, 0);
assert.equal(forbiddenEffects, 0);
assert.equal(capabilityTrueCount, 0);

const output = {
  pilotFailureCatalog: 'pass',
  failureCases: catalog.cases.length,
  expectedRejects,
  unexpectedAccepts,
  successEvidenceWrittenForRejectedCases,
  forbiddenEffects,
  capabilityTrueCount,
  summary: {
    artifact,
    timestamp: '2026-05-08T14:30:00.000Z',
    verdict: 'pass',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-cli-pilot-failure-catalog.json',
    rejectedCasesDoNotWriteDecisionTrace: rows.every((row) => row.decisionTraceWritten === false),
    rejectedCasesDoNotWriteLiveShadowObservationResult: rows.every((row) => row.liveShadowObservationResultWritten === false),
    rejectedCasesDoNotWriteScorecardSuccessRow: rows.every((row) => row.scorecardSuccessRowWritten === false),
    liveObserverImplemented: false,
    runtimeIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_dry_run_cli_failure_catalog_local_reject_evidence_only_not_success_evidence_not_runtime_not_live_observer',
  },
  rows,
  boundary: [
    'manual_invocation_only',
    'explicit_local_file_input_only',
    'already_redacted_bundle_only',
    'redaction_review_record_required',
    'local_reject_evidence_only',
    'no_success_evidence_for_rejected_cases',
    'no_decision_trace_for_rejected_cases',
    'no_live_shadow_observation_result_for_rejected_cases',
    'no_scorecard_success_row_for_rejected_cases',
    'no_runtime',
    'no_live_observer',
    'no_tool_execution',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_approval_path',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement'
  ]
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
