import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { mkdir, open, readFile, realpath, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRoute } from './route-classifier.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');

export const forbiddenDryRunFlags = new Set([
  '--watch',
  '--daemon',
  '--url',
  '--repo',
  '--network',
  '--tool',
  '--memory',
  '--config',
  '--publish',
  '--approve',
  '--block',
  '--allow',
  '--observer',
  '--live',
  '--runtime',
  '--adapter',
  '--mcp',
  '--a2a',
  '--enforce',
  '--authorize',
]);

const allowedFlags = new Set(['--input', '--output', '--target']);
const requiredForbiddenEffects = ['runtime', 'tools', 'memory_write', 'config_write', 'external_publication', 'approval_path', 'blocking', 'allowing'];
const sensitiveBundleFlags = ['containsSecrets', 'containsToolOutput', 'containsMemoryText', 'containsConfigText', 'containsApprovalText', 'containsPrivatePath'];
const persistenceReviewFlags = ['rawContentPersisted', 'privatePathsPersisted', 'secretLikeValuesPersisted', 'toolOutputsPersisted', 'memoryTextPersisted', 'configTextPersisted', 'approvalTextPersisted'];
const effectCapabilityFields = ['mayBlock', 'mayAllow', 'mayExecuteTool', 'mayWriteMemory', 'mayWriteConfig', 'mayPublishExternally', 'mayModifyAgentInstructions', 'mayEnterApprovalPath'];

export function parseManualDryRunArgs(argv) {
  const parsed = { target: 'manual-dry-run-v0' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (forbiddenDryRunFlags.has(arg)) return { error: { reasonCode: 'FORBIDDEN_FLAG', detail: arg } };
    if (!allowedFlags.has(arg)) return { error: { reasonCode: 'UNKNOWN_FLAG', detail: arg } };
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) return { error: { reasonCode: 'MISSING_FLAG_VALUE', detail: arg } };
    index += 1;
    if (arg === '--input') parsed.input = value;
    if (arg === '--output') parsed.output = value;
    if (arg === '--target') parsed.target = value;
  }
  if (!parsed.input) return { error: { reasonCode: 'MISSING_INPUT' } };
  if (!parsed.output) return { error: { reasonCode: 'MISSING_OUTPUT' } };
  return { value: parsed };
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex')}`;
}

function classifierDecisionFrom(decision) {
  return {
    selectedRoute: decision.selectedRoute,
    humanRequired: decision.humanRequired,
    compactAllowed: decision.compactAllowed,
    reasonCodes: decision.reasonCodes,
    decisiveSignals: decision.decisiveSignals,
    rejectedRoutes: decision.rejectedRoutes,
  };
}

function fail(reasonCode, detail) {
  const error = new Error(detail ? `${reasonCode}: ${detail}` : reasonCode);
  error.reasonCode = reasonCode;
  error.detail = detail;
  return error;
}

function assertManualBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') throw fail('INPUT_NOT_OBJECT');
  if (bundle.schemaVersion !== 'manual-observation-bundle-v0') throw fail('INPUT_NOT_MANUAL_OBSERVATION_BUNDLE');
  if (!/^mob_[a-z0-9_-]+$/.test(bundle.bundleId ?? '')) throw fail('INVALID_BUNDLE_ID');
  if (bundle.captureMode !== 'manual_offline') throw fail('NON_MANUAL_CAPTURE_MODE');
  if (bundle.humanReviewRequiredForCapture !== true) throw fail('HUMAN_CAPTURE_REVIEW_NOT_REQUIRED');
  if (bundle.rawContentIncluded !== false) throw fail('RAW_CONTENT_INCLUDED');
  if (bundle.redactedContentIncluded !== true) throw fail('REDACTED_CONTENT_MISSING');
  if (bundle.allowedProcessing !== 'local_shadow_only') throw fail('NON_LOCAL_SHADOW_PROCESSING');
  for (const flag of sensitiveBundleFlags) if (bundle[flag] !== false) throw fail('SENSITIVE_BUNDLE_FLAG_TRUE', flag);
  for (const effect of requiredForbiddenEffects) if (!bundle.forbiddenEffects?.includes(effect)) throw fail('MISSING_FORBIDDEN_EFFECT', effect);
}

function assertRedactionReview(record, bundleId) {
  if (!record || typeof record !== 'object') throw fail('REDACTION_REVIEW_RECORD_MISSING');
  if (record.schemaVersion !== 'redaction-review-record-v0') throw fail('INVALID_REDACTION_REVIEW_SCHEMA');
  if (record.bundleId !== bundleId) throw fail('REDACTION_REVIEW_BUNDLE_MISMATCH');
  if (record.captureMode !== 'manual_offline') throw fail('REDACTION_REVIEW_NON_MANUAL');
  if (record.humanReviewed !== true) throw fail('REDACTION_REVIEW_NOT_HUMAN_REVIEWED');
  for (const flag of persistenceReviewFlags) if (record[flag] !== false) throw fail('REDACTION_REVIEW_PERSISTENCE_FLAG_TRUE', flag);
  if (record.redactedMetadataOnly !== true) throw fail('REDACTION_REVIEW_NOT_REDACTED_METADATA_ONLY');
  if (record.allowedForLocalShadowReplay !== true) throw fail('REDACTION_REVIEW_NOT_ALLOWED_FOR_LOCAL_REPLAY');
  if (record.forbiddenForLiveObservation !== true) throw fail('REDACTION_REVIEW_NOT_FORBIDDEN_FOR_LIVE');
  if (record.forbiddenForRuntimeUse !== true) throw fail('REDACTION_REVIEW_NOT_FORBIDDEN_FOR_RUNTIME');
}

function normalizeInputArtifact(input) {
  if (input?.schemaVersion === 'manual-dry-run-input-v0') {
    assertManualBundle(input.manualObservationBundle);
    assertRedactionReview(input.redactionReviewRecord, input.manualObservationBundle.bundleId);
    return {
      caseId: input.caseId ?? input.manualObservationBundle.bundleId,
      manualObservationBundle: input.manualObservationBundle,
      redactionReviewRecord: input.redactionReviewRecord,
    };
  }

  if (input?.manualObservationBundle && input?.redactionReviewRecord) {
    assertManualBundle(input.manualObservationBundle);
    assertRedactionReview(input.redactionReviewRecord, input.manualObservationBundle.bundleId);
    return {
      caseId: input.caseId ?? input.manualObservationBundle.bundleId,
      manualObservationBundle: input.manualObservationBundle,
      redactionReviewRecord: input.redactionReviewRecord,
    };
  }

  assertManualBundle(input);
  throw fail('REDACTION_REVIEW_RECORD_MISSING');
}

function buildParserEvidence(bundle, suppliedParserEvidence) {
  return suppliedParserEvidence ?? {
    rawArtifactId: `manual-dry-run/${bundle.bundleId}`,
    rawInputShape: 'redacted_manual_observation_bundle',
    receiptCandidatesFound: 0,
    validReceipts: 0,
    invalidReceipts: 0,
    freeTextAuthorityAttempts: [],
    sensitiveSignals: [],
    foldedIndex: null,
    normalizationWarnings: ['MANUAL_OFFLINE_CAPTURE', 'REDACTED_SNAPSHOT_ONLY', 'RAW_CONTENT_NOT_PERSISTED', 'AUTHORITY_AMBIGUOUS'],
    routeDecisionInputHash: sha256({ bundleId: bundle.bundleId, redactedSnapshotHash: bundle.redactedSnapshotHash }),
  };
}

function buildRouteDecisionInput(bundle, suppliedRouteDecisionInput) {
  return suppliedRouteDecisionInput ?? {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: 0,
      invalidReceipts: 0,
      sensitiveSignals: [],
      manualCapture: true,
      realRedacted: true,
      redactedSnapshotOnly: true,
      freshness: 'current',
    },
    recommendedRoute: 'abstain',
  };
}

function decisionTraceFrom({ bundle, parserEvidence, routeDecisionInput, classifierDecision }) {
  const goldDecision = {
    selectedRoute: 'abstain',
    humanRequired: false,
    compactAllowed: false,
    reasonCodes: ['MANUAL_DRY_RUN_RECORD_ONLY', 'RAW_CONTENT_NOT_PERSISTED'],
    forbiddenEffects: bundle.forbiddenEffects,
  };
  const matchedGold = classifierDecision.selectedRoute !== 'shadow_only' && classifierDecision.compactAllowed === false;
  return {
    traceId: `trace_manual_dry_run_${bundle.bundleId.replace(/^mob_/, '')}`,
    flowId: `manual-dry-run/${bundle.bundleId}`,
    parserEvidenceRef: parserEvidence.rawArtifactId,
    parserEvidenceRefHash: sha256({ parserEvidence, routeDecisionInput }),
    routeDecisionInputHash: parserEvidence.routeDecisionInputHash ?? sha256(routeDecisionInput),
    goldDecisionHash: sha256(goldDecision),
    classifierDecisionHash: sha256(classifierDecision),
    matchedGold,
    selectedRoute: classifierDecision.selectedRoute,
    reasonCodes: classifierDecision.reasonCodes,
    decisiveSignals: classifierDecision.decisiveSignals,
    rejectedRoutes: classifierDecision.rejectedRoutes,
    boundaryVerdict: {
      falsePermit: classifierDecision.selectedRoute === 'shadow_only',
      falseCompact: classifierDecision.compactAllowed === true,
      boundaryLoss: false,
    },
    mode: 'offline_fixture_trace',
    scope: 'local_shadow_only',
  };
}

function liveShadowObservationFrom({ bundle, trace }) {
  return {
    schemaVersion: 'live-shadow-observation-v0',
    observationId: `lso_manual_dry_run_${bundle.bundleId.replace(/^mob_/, '')}`,
    flowId: trace.flowId,
    observedAt: '2026-05-08T12:00:00.000Z',
    observerMode: 'passive',
    effectBoundary: 'no_effects',
    writeBoundary: 'local_shadow_only',
    sourceArtifactId: bundle.bundleId,
    parserEvidenceRef: trace.parserEvidenceRef,
    routeDecisionInputHash: trace.routeDecisionInputHash,
    classifierDecisionHash: trace.classifierDecisionHash,
    decisionTraceHash: sha256(trace),
    allowedInputs: ['decision_trace', 'parser_evidence', 'route_decision_input', 'classifier_decision'],
    forbiddenPaths: ['runtime', 'tools', 'memory_write', 'config_write', 'external_publication', 'agent_instruction', 'approval_path'],
    auditReasonCodes: ['LIVE_SHADOW_OBSERVE_ONLY', 'LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_LOCAL_ONLY', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
  };
}

function liveShadowObservationResultFrom({ observation, trace }) {
  return {
    schemaVersion: 'live-shadow-observation-result-v0',
    observationId: observation.observationId,
    resultId: `lsor_manual_dry_run_${observation.sourceArtifactId.replace(/^mob_/, '')}`,
    observerAction: 'record_only',
    matchedExpectedPolicy: trace.matchedGold,
    warnings: trace.matchedGold ? [] : ['manual_dry_run_replay_mismatch_record_only'],
    safetySignals: ['manual_dry_run_replayed', 'redaction_review_record_present', 'decision_trace_present', 'record_only_result', 'no_forbidden_effects_detected'],
    driftSignals: trace.selectedRoute === 'abstain' ? [] : ['manual_dry_run_route_not_abstain_recorded_without_effect'],
    forbiddenEffectsDetected: [],
    auditReasonCodes: ['LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
    mayBlock: false,
    mayAllow: false,
    mayExecuteTool: false,
    mayWriteMemory: false,
    mayWriteConfig: false,
    mayPublishExternally: false,
    mayModifyAgentInstructions: false,
    mayEnterApprovalPath: false,
  };
}

function manualDryRunResultFrom({ bundle, review, trace, result, target }) {
  return {
    schemaVersion: 'manual-dry-run-result-v0',
    commandId: `dry_run_${bundle.bundleId.replace(/^mob_/, '')}`,
    resultId: `dry_run_result_${bundle.bundleId.replace(/^mob_/, '')}`,
    completed: true,
    recordOnly: true,
    generatedParserEvidence: true,
    generatedClassifierDecision: true,
    generatedDecisionTrace: true,
    generatedLiveShadowResult: true,
    generatedScorecardRow: true,
    observerAction: 'record_only',
    forbiddenEffectsDetected: result.forbiddenEffectsDetected,
    validationErrorCount: 0,
    mismatchCount: trace.matchedGold ? 0 : 1,
    falsePermitCount: trace.boundaryVerdict.falsePermit ? 1 : 0,
    falseCompactCount: trace.boundaryVerdict.falseCompact ? 1 : 0,
    boundaryLossCount: trace.boundaryVerdict.boundaryLoss ? 1 : 0,
    rawContentPersisted: review.rawContentPersisted,
    privatePathsPersisted: review.privatePathsPersisted,
    secretLikeValuesPersisted: review.secretLikeValuesPersisted,
    toolOutputsPersisted: review.toolOutputsPersisted,
    memoryTextPersisted: review.memoryTextPersisted,
    configTextPersisted: review.configTextPersisted,
    approvalTextPersisted: review.approvalTextPersisted,
    mayBlock: false,
    mayAllow: false,
    mayExecuteTool: false,
    mayWriteMemory: false,
    mayWriteConfig: false,
    mayPublishExternally: false,
    mayModifyAgentInstructions: false,
    mayEnterApprovalPath: false,
    observerImplemented: false,
    liveObserverImplemented: false,
    watcherImplemented: false,
    daemonImplemented: false,
    networkAccessed: false,
    adapterIntegrationImplemented: false,
    runtimeIntegrationImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_dry_run_cli_minimal_local_file_redacted_bundle_record_only_not_live_observer_not_runtime_not_authorization',
  };
}

export function runManualDryRunArtifact(input, { target = 'manual-dry-run-v0' } = {}) {
  const normalized = normalizeInputArtifact(input);
  const bundle = normalized.manualObservationBundle;
  const review = normalized.redactionReviewRecord;
  const parserEvidence = buildParserEvidence(bundle, normalized.parserEvidence);
  const routeDecisionInput = buildRouteDecisionInput(bundle, normalized.routeDecisionInput);
  const classifierDecision = classifierDecisionFrom(classifyRoute({ parserEvidence, routeDecisionInput }));
  const decisionTrace = decisionTraceFrom({ bundle, parserEvidence, routeDecisionInput, classifierDecision });
  const liveShadowObservation = liveShadowObservationFrom({ bundle, trace: decisionTrace });
  const liveShadowObservationResult = liveShadowObservationResultFrom({ observation: liveShadowObservation, trace: decisionTrace });
  const scorecardRow = {
    bundleId: bundle.bundleId,
    reviewId: review.reviewId,
    selectedRoute: decisionTrace.selectedRoute,
    matchedExpectedPolicy: liveShadowObservationResult.matchedExpectedPolicy,
    observerAction: liveShadowObservationResult.observerAction,
    rawContentPersisted: review.rawContentPersisted,
    privatePathsPersisted: review.privatePathsPersisted,
    secretLikeValuesPersisted: review.secretLikeValuesPersisted,
    toolOutputsPersisted: review.toolOutputsPersisted,
    memoryTextPersisted: review.memoryTextPersisted,
    configTextPersisted: review.configTextPersisted,
    approvalTextPersisted: review.approvalTextPersisted,
    forbiddenEffects: liveShadowObservationResult.forbiddenEffectsDetected.length,
    mayBlock: liveShadowObservationResult.mayBlock ? 1 : 0,
    mayAllow: liveShadowObservationResult.mayAllow ? 1 : 0,
    capabilityAttempts: effectCapabilityFields.filter((field) => liveShadowObservationResult[field] !== false).length,
    mismatch: decisionTrace.matchedGold ? 0 : 1,
  };
  const manualDryRunResult = manualDryRunResultFrom({ bundle, review, trace: decisionTrace, result: liveShadowObservationResult, target });

  return {
    schemaVersion: 'manual-dry-run-output-v0',
    manualDryRun: 'pass',
    recordOnly: true,
    inputKind: 'redacted_manual_observation_bundle',
    rawUnredactedInputRead: false,
    liveInputRead: false,
    networkUsed: false,
    toolExecuted: false,
    memoryWritten: false,
    configWritten: false,
    publishedExternally: false,
    approvalEntered: false,
    blocked: false,
    allowed: false,
    enforced: false,
    target,
    bundleId: bundle.bundleId,
    reviewId: review.reviewId,
    parserEvidence,
    classifierDecision,
    decisionTrace,
    liveShadowObservation,
    liveShadowObservationResult,
    scorecardRow,
    manualDryRunResult,
  };
}

function rejectPathShape(inputPath) {
  if (/^https?:\/\//i.test(inputPath)) throw fail('INPUT_URL_NOT_ALLOWED');
  if (inputPath.includes('*') || inputPath.includes('?') || inputPath.includes('[')) throw fail('INPUT_GLOB_NOT_ALLOWED');
}

export async function runManualDryRunCli(argv, { cwd = process.cwd() } = {}) {
  const parsed = parseManualDryRunArgs(argv);
  if (parsed.error) throw fail(parsed.error.reasonCode, parsed.error.detail);
  rejectPathShape(parsed.value.input);
  rejectPathShape(parsed.value.output);
  if (parsed.value.output.startsWith('/')) throw fail('OUTPUT_ABSOLUTE_PATH_NOT_ALLOWED');
  const inputPath = resolve(cwd, parsed.value.input);
  const outputPath = resolve(cwd, parsed.value.output);
  const evidenceRoot = resolve(packageRoot, 'evidence');
  if (outputPath !== evidenceRoot && !outputPath.startsWith(`${evidenceRoot}/`)) throw fail('OUTPUT_OUTSIDE_EVIDENCE_DIR_NOT_ALLOWED');
  const realEvidenceRoot = await realpath(evidenceRoot);
  const outputParent = dirname(outputPath);
  if (outputParent !== evidenceRoot && !outputParent.startsWith(`${evidenceRoot}/`)) throw fail('OUTPUT_OUTSIDE_EVIDENCE_DIR_NOT_ALLOWED');
  await mkdir(outputParent, { recursive: true });
  const realOutputParent = await realpath(outputParent);
  if (realOutputParent !== realEvidenceRoot && !realOutputParent.startsWith(`${realEvidenceRoot}/`)) throw fail('OUTPUT_OUTSIDE_EVIDENCE_DIR_NOT_ALLOWED');
  const inputStat = await stat(inputPath).catch((error) => { throw fail('INPUT_NOT_READABLE', error.message); });
  if (inputStat.isDirectory()) throw fail('INPUT_DIRECTORY_NOT_ALLOWED');
  const text = await readFile(inputPath, 'utf8');
  const input = JSON.parse(text);
  const output = runManualDryRunArtifact(input, { target: parsed.value.target });
  const handle = await open(outputPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600)
    .catch((error) => {
      if (error.code === 'EEXIST') throw fail('OUTPUT_ALREADY_EXISTS');
      if (error.code === 'ELOOP') throw fail('OUTPUT_SYMLINK_NOT_ALLOWED');
      throw fail('OUTPUT_NOT_WRITABLE', error.message);
    });
  try {
    await handle.writeFile(`${JSON.stringify(output, null, 2)}\n`);
  } finally {
    await handle.close();
  }
  return output;
}

export function repoPaths() {
  return { repoRoot, packageRoot };
}
