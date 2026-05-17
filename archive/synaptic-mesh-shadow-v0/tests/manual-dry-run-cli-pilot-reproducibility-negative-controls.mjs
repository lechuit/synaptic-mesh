import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-pilot-reproducibility-negative-controls-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-pilot-reproducibility-negative-controls.out.json');
const canonicalPath = resolve(packageRoot, 'evidence/manual-dry-run-cli.real-redacted-pilot-expanded-001.out.json');

const boundary = [
  'manual_invocation_only',
  'explicit_local_file_input_only',
  'already_redacted_bundle_only',
  'redaction_review_record_required',
  'local_evidence_output_only',
  'record_only',
  'no_live_observer',
  'no_watcher',
  'no_daemon',
  'no_network',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_publication',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_enforcement',
];

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex')}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function evaluate({ inputBefore, inputAfter, firstWritten, secondWritten, canonicalWritten }) {
  const reasonCodes = [];
  const firstSecondMatch = canonicalJson(firstWritten) === canonicalJson(secondWritten);
  const committedMatch = canonicalJson(firstWritten) === canonicalJson(canonicalWritten);
  const decisionTraceHashMatch = firstWritten.liveShadowObservation.decisionTraceHash === secondWritten.liveShadowObservation.decisionTraceHash
    && firstWritten.liveShadowObservation.decisionTraceHash === canonicalWritten.liveShadowObservation.decisionTraceHash
    && firstWritten.liveShadowObservation.decisionTraceHash === sha256(firstWritten.decisionTrace);
  const scorecardMatch = canonicalJson(firstWritten.scorecardRow) === canonicalJson(secondWritten.scorecardRow)
    && canonicalJson(firstWritten.scorecardRow) === canonicalJson(canonicalWritten.scorecardRow);
  const inputMutated = inputBefore !== inputAfter;
  const forbiddenEffects = firstWritten.liveShadowObservationResult.forbiddenEffectsDetected.length;
  const capabilityTrueCount = [
    'mayBlock',
    'mayAllow',
    'mayExecuteTool',
    'mayWriteMemory',
    'mayWriteConfig',
    'mayPublishExternally',
    'mayModifyAgentInstructions',
    'mayEnterApprovalPath',
  ].filter((field) => firstWritten.manualDryRunResult[field] !== false || firstWritten.liveShadowObservationResult[field] !== false).length;

  if (!firstSecondMatch) reasonCodes.push('NORMALIZED_OUTPUT_MISMATCH');
  if (!committedMatch) reasonCodes.push('COMMITTED_EVIDENCE_MISMATCH');
  if (!decisionTraceHashMatch) reasonCodes.push('DECISION_TRACE_HASH_MISMATCH');
  if (!scorecardMatch) reasonCodes.push('SCORECARD_MISMATCH');
  if (inputMutated) reasonCodes.push('INPUT_MUTATION_DETECTED');
  if (forbiddenEffects > 0) reasonCodes.push('FORBIDDEN_EFFECT_DETECTED');
  if (capabilityTrueCount > 0) reasonCodes.push('CAPABILITY_TRUE_DETECTED');
  if (firstWritten.decisionTrace.boundaryVerdict.falsePermit) reasonCodes.push('FALSE_PERMIT_DETECTED');
  if (firstWritten.decisionTrace.boundaryVerdict.falseCompact) reasonCodes.push('FALSE_COMPACT_DETECTED');
  if (firstWritten.decisionTrace.boundaryVerdict.boundaryLoss) reasonCodes.push('BOUNDARY_LOSS_DETECTED');

  return {
    accepted: reasonCodes.length === 0,
    reasonCodes,
    firstRunHash: sha256(firstWritten),
    secondRunHash: sha256(secondWritten),
    committedOutputHash: sha256(canonicalWritten),
    decisionTraceHash: firstWritten.liveShadowObservation.decisionTraceHash,
    recomputedDecisionTraceHash: sha256(firstWritten.decisionTrace),
    scorecardRowHash: sha256(firstWritten.scorecardRow),
    firstSecondMatch,
    committedMatch,
    decisionTraceHashMatch,
    scorecardMatch,
    inputMutated,
    forbiddenEffects,
    capabilityTrueCount,
  };
}

const canonical = JSON.parse(await readFile(canonicalPath, 'utf8'));
const inputBefore = 'redacted-input-fixture-hash-placeholder';
const base = {
  inputBefore,
  inputAfter: inputBefore,
  firstWritten: canonical,
  secondWritten: canonical,
  canonicalWritten: canonical,
};

const negativeControls = [
  {
    controlId: 'neg-001-second-output-normalized-mismatch',
    expectedReasonCodes: ['NORMALIZED_OUTPUT_MISMATCH'],
    build() {
      const secondWritten = clone(canonical);
      secondWritten.classifierDecision.reasonCodes = [...secondWritten.classifierDecision.reasonCodes, 'NEGATIVE_CONTROL_EXTRA_REASON'];
      return { ...base, secondWritten };
    },
  },
  {
    controlId: 'neg-002-committed-evidence-mismatch',
    expectedReasonCodes: ['COMMITTED_EVIDENCE_MISMATCH'],
    build() {
      const canonicalWritten = clone(canonical);
      canonicalWritten.manualDryRunResult.mismatchCount = 1;
      return { ...base, canonicalWritten };
    },
  },
  {
    controlId: 'neg-003-decisiontrace-hash-mismatch',
    expectedReasonCodes: ['DECISION_TRACE_HASH_MISMATCH'],
    build() {
      const firstWritten = clone(canonical);
      firstWritten.liveShadowObservation.decisionTraceHash = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';
      return { ...base, firstWritten };
    },
  },
  {
    controlId: 'neg-004-scorecard-mismatch',
    expectedReasonCodes: ['SCORECARD_MISMATCH'],
    build() {
      const secondWritten = clone(canonical);
      secondWritten.scorecardRow.mismatch = 1;
      const canonicalWritten = clone(canonical);
      canonicalWritten.scorecardRow.mismatch = 1;
      return { ...base, secondWritten, canonicalWritten };
    },
  },
  {
    controlId: 'neg-005-input-mutation',
    expectedReasonCodes: ['INPUT_MUTATION_DETECTED'],
    build() {
      return { ...base, inputAfter: `${inputBefore}:mutated` };
    },
  },
  {
    controlId: 'neg-006-forbidden-effect',
    expectedReasonCodes: ['COMMITTED_EVIDENCE_MISMATCH', 'FORBIDDEN_EFFECT_DETECTED'],
    build() {
      const firstWritten = clone(canonical);
      firstWritten.liveShadowObservationResult.forbiddenEffectsDetected = ['tool_execution'];
      return { ...base, firstWritten };
    },
  },
  {
    controlId: 'neg-007-capability-true',
    expectedReasonCodes: ['CAPABILITY_TRUE_DETECTED', 'COMMITTED_EVIDENCE_MISMATCH', 'SCORECARD_MISMATCH'],
    build() {
      const firstWritten = clone(canonical);
      firstWritten.liveShadowObservationResult.mayBlock = true;
      firstWritten.scorecardRow.mayBlock = 1;
      return { ...base, firstWritten };
    },
  },
  {
    controlId: 'neg-008-boundary-loss',
    expectedReasonCodes: ['COMMITTED_EVIDENCE_MISMATCH', 'DECISION_TRACE_HASH_MISMATCH', 'BOUNDARY_LOSS_DETECTED'],
    build() {
      const firstWritten = clone(canonical);
      firstWritten.decisionTrace.boundaryVerdict.boundaryLoss = true;
      return { ...base, firstWritten };
    },
  },
];

const rows = negativeControls.map((control) => {
  const evaluated = evaluate(control.build());
  const matchedExpectedReasonCodes = control.expectedReasonCodes.every((reasonCode) => evaluated.reasonCodes.includes(reasonCode));
  assert.equal(evaluated.accepted, false, `${control.controlId} must be rejected`);
  assert.equal(matchedExpectedReasonCodes, true, `${control.controlId} must include expected reason codes`);
  return {
    controlId: control.controlId,
    expectedReasonCodes: control.expectedReasonCodes,
    actualReasonCodes: evaluated.reasonCodes,
    rejected: !evaluated.accepted,
    matchedExpectedReasonCodes,
    firstRunHash: evaluated.firstRunHash,
    secondRunHash: evaluated.secondRunHash,
    committedOutputHash: evaluated.committedOutputHash,
    decisionTraceHash: evaluated.decisionTraceHash,
    recomputedDecisionTraceHash: evaluated.recomputedDecisionTraceHash,
    scorecardRowHash: evaluated.scorecardRowHash,
    firstSecondMatch: evaluated.firstSecondMatch,
    committedMatch: evaluated.committedMatch,
    decisionTraceHashMatch: evaluated.decisionTraceHashMatch,
    scorecardMatch: evaluated.scorecardMatch,
    inputMutated: evaluated.inputMutated,
    forbiddenEffects: evaluated.forbiddenEffects,
    capabilityTrueCount: evaluated.capabilityTrueCount,
  };
});

const output = {
  pilotReproducibilityNegativeControls: 'pass',
  artifact,
  timestamp: '2026-05-09T00:12:00.000Z',
  sourceCanonicalEvidence: 'implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-cli.real-redacted-pilot-expanded-001.out.json',
  negativeControls: rows.length,
  expectedRejects: rows.length,
  unexpectedAccepts: rows.filter((row) => !row.rejected).length,
  expectedReasonCodeMisses: rows.filter((row) => !row.matchedExpectedReasonCodes).length,
  coveredReasonCodes: [...new Set(rows.flatMap((row) => row.actualReasonCodes))].sort(),
  summary: {
    safetyClaimScope: 'manual_dry_run_cli_pilot_reproducibility_negative_controls_local_evidence_only_not_live_observer_not_runtime_not_authorization',
    liveObserverImplemented: false,
    runtimeIntegrationImplemented: false,
    toolExecutionImplemented: false,
    toolExecutionAllowed: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    publicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
  },
  rows,
  boundary,
};

assert.equal(output.unexpectedAccepts, 0);
assert.equal(output.expectedReasonCodeMisses, 0);
assert.equal(output.summary.liveObserverImplemented, false);
assert.equal(output.summary.runtimeIntegrationImplemented, false);
assert.equal(output.summary.toolExecutionImplemented, false);
assert.equal(output.summary.memoryWriteImplemented, false);
assert.equal(output.summary.configWriteImplemented, false);
assert.equal(output.summary.publicationImplemented, false);
assert.equal(output.summary.approvalPathImplemented, false);
assert.equal(output.summary.blockingImplemented, false);
assert.equal(output.summary.allowingImplemented, false);
assert.equal(output.summary.authorizationImplemented, false);
assert.equal(output.summary.enforcementImplemented, false);

await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
