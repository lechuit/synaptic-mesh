import { createHash } from 'node:crypto';
import { runBoundedMultisourceShadowRead } from './bounded-multisource-shadow-read.mjs';
import { evaluatePositiveUtilityPassGate } from './positive-utility-pass-gate.mjs';
import { scoreObservedUsefulnessNoise } from './observed-usefulness-noise-scorecard.mjs';
import { buildControlledOperatorReviewQueue } from './controlled-operator-review-queue.mjs';
import { buildOperatorReviewOutcomeCapture, OPERATOR_REVIEW_OUTCOME_LABELS } from './operator-review-outcome-capture.mjs';
import { scoreOperatorOutcomeValue } from './operator-outcome-value-scorecard.mjs';

export const PASSIVE_OBSERVATION_WINDOW_VERSION = 'v0.26.5';
export const PASSIVE_OBSERVATION_WINDOW_ARTIFACT = 'T-synaptic-mesh-passive-observation-window-v0.26.5';
export const PASSIVE_OBSERVATION_WINDOW_MAX_SOURCES = 3;
export const PASSIVE_OBSERVATION_WINDOW_MIN_SOURCES = 2;
export const PASSIVE_OBSERVATION_WINDOW_MAX_ITEMS = 3;
export const PASSIVE_OBSERVATION_WINDOW_MAX_OUTCOMES = 3;

const AUTHORITY_FIELD_NAMES = Object.freeze([
  'authorization', 'enforcement', 'approval', 'approvalBlockAllow', 'allow', 'block', 'approve',
  'toolExecution', 'networkFetch', 'networkResourceFetch', 'resourceFetch', 'memoryConfigWrite',
  'memoryConfigWrites', 'externalEffects', 'rawPersisted', 'rawOutput', 'agentConsumedOutput',
  'machineReadablePolicyDecision', 'runtimeAuthority', 'mayAllow', 'mayBlock'
]);
const AUTHORITY_TOKENS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'enforcement', 'execute', 'toolExecution', 'networkFetch', 'networkResourceFetch',
  'resourceFetch', 'memoryConfigWrite', 'memoryConfigWrites', 'externalEffects', 'rawPersisted',
  'rawOutput', 'runtimeAuthority', 'policyDecision', 'policy_decision', 'machineReadablePolicyDecision', 'mayAllow', 'mayBlock'
]);
const SENSITIVE_PATTERNS = Object.freeze([
  /sk-[A-Za-z0-9_-]{12,}/g,
  /ghp_[A-Za-z0-9_]{12,}/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b\d{3}[-. ]?\d{2}[-. ]?\d{4}\b/g,
  /\b(?:\d[ -]*?){13,19}\b/g
]);

function asArray(value) { return Array.isArray(value) ? value : []; }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function sha256(value) { return createHash('sha256').update(String(value ?? '')).digest('hex'); }
function tokenPattern(token) { return new RegExp(`(^|[^A-Za-z0-9])${token.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`, 'i'); }
function redactText(value, max = 220) {
  let output = String(value ?? '').slice(0, max);
  for (const pattern of SENSITIVE_PATTERNS) output = output.replace(pattern, '[REDACTED]');
  return output;
}
function findAuthorityTokens(value, prefix = 'artifact') {
  const issues = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => issues.push(...findAuthorityTokens(entry, `${prefix}[${index}]`)));
    return issues;
  }
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'reportMarkdown') issues.push(...findReportTokens(nested, `${prefix}.${key}`));
      else issues.push(...findAuthorityTokens(nested, `${prefix}.${key}`));
    }
    return issues;
  }
  if (typeof value !== 'string') return issues;
  for (const token of AUTHORITY_TOKENS) if (tokenPattern(token).test(value)) issues.push(`${prefix}.authority_token:${token}`);
  return issues;
}
function findReportTokens(text, prefix) {
  if (typeof text !== 'string') return [];
  const sanitized = text
    .replace(/policyDecision\s*:\s*null/gi, '')
    .replace(/(?:authorization|enforcement|toolExecution|agentConsumedOutput|externalEffects|rawPersisted|rawOutput)\s*:\s*false/gi, '');
  return findAuthorityTokens(sanitized, prefix);
}
function boundaryViolations(value, prefix) {
  const issues = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => issues.push(...boundaryViolations(entry, `${prefix}[${index}]`)));
    return issues;
  }
  if (!isPlainObject(value)) return issues;
  if (hasOwn(value, 'policyDecision') && value.policyDecision !== null) issues.push(`${prefix}.policyDecision_non_null`);
  for (const key of AUTHORITY_FIELD_NAMES) if (hasOwn(value, key) && value[key] !== false) issues.push(`${prefix}.${key}_not_false`);
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'reportMarkdown') continue;
    issues.push(...boundaryViolations(nested, `${prefix}.${key}`));
  }
  return issues;
}
function assertSafeStageArtifact(value, prefix, issues) {
  if (!isPlainObject(value)) { issues.push(`${prefix}.missing_or_malformed`); return; }
  issues.push(...boundaryViolations(value, prefix));
  issues.push(...findAuthorityTokens(value, prefix));
  if (value.policyDecision !== null) issues.push(`${prefix}.policyDecision_must_be_null`);
}
function validateSources(sources, issues) {
  if (!Array.isArray(sources)) { issues.push('sources.explicit_array_required'); return; }
  if (sources.length < PASSIVE_OBSERVATION_WINDOW_MIN_SOURCES) issues.push('sources.min_two_required');
  if (sources.length > PASSIVE_OBSERVATION_WINDOW_MAX_SOURCES) issues.push('sources.max_three_exceeded');
  if (new Set(sources).size !== sources.length) issues.push('sources.duplicates_rejected');
  for (const [index, source] of sources.entries()) {
    const prefix = `sources[${index}]`;
    if (typeof source !== 'string' || !source.trim()) { issues.push(`${prefix}.nonempty_string_required`); continue; }
    if (/^https?:\/\//i.test(source)) issues.push(`${prefix}.network_source_rejected`);
    if (source.startsWith('/') || source.includes('..')) issues.push(`${prefix}.nonlocal_path_rejected`);
    if (/[*?\[\]{}]/.test(source)) issues.push(`${prefix}.glob_or_discovery_rejected`);
  }
}
function validateBounds(input, issues) {
  const rps = input.recordsPerSource ?? 2;
  const total = input.totalRecords ?? 6;
  if (!Number.isInteger(rps) || rps < 1 || rps > 5) issues.push('bounds.records_per_source_invalid');
  if (!Number.isInteger(total) || total < 2 || total > 12) issues.push('bounds.total_records_invalid');
}
function validateOutcomeInputs(outcomes, issues) {
  if (!isPlainObject(outcomes)) { issues.push('outcomes.manual_fixture_object_required'); return; }
  if (outcomes.schemaVersion !== 'operator-review-outcomes-v0.24.0-alpha') issues.push('outcomes.schema_version_invalid');
  if (outcomes.localFixtureOnly !== true && outcomes.manualLocalInputOnly !== true) issues.push('outcomes.local_fixture_or_manual_flag_required');
  const entries = asArray(outcomes.outcomes);
  if (!Array.isArray(outcomes.outcomes)) issues.push('outcomes.entries_array_required');
  if (entries.length < 1 || entries.length > PASSIVE_OBSERVATION_WINDOW_MAX_OUTCOMES) issues.push('outcomes.count_out_of_bounds');
  const seen = new Set();
  for (const [index, entry] of entries.entries()) {
    const prefix = `outcomes.outcomes[${index}]`;
    if (!isPlainObject(entry)) { issues.push(`${prefix}.malformed_not_object`); continue; }
    if (typeof entry.queueItemId !== 'string' || !entry.queueItemId.trim()) issues.push(`${prefix}.queue_item_id_required`);
    if (seen.has(entry.queueItemId)) issues.push(`${prefix}.duplicate_queue_item_id`);
    seen.add(entry.queueItemId);
    if (!OPERATOR_REVIEW_OUTCOME_LABELS.includes(entry.outcomeLabel)) issues.push(`${prefix}.unsafe_or_unknown_outcome_label`);
    issues.push(...boundaryViolations(entry, prefix));
    issues.push(...findAuthorityTokens(entry, prefix));
  }
  issues.push(...boundaryViolations(outcomes, 'outcomes'));
  issues.push(...findAuthorityTokens(outcomes, 'outcomes'));
}
function buildNoiseCasesFromPacket(packet) {
  const privatePacket = structuredClone(packet);
  if (privatePacket.redactedRecords?.[0]) privatePacket.redactedRecords[0].privatePatternDetected = true;
  const boundsPacket = structuredClone(packet);
  boundsPacket.summary.recordsPerSourceLimit = 99;
  const capabilityPacket = structuredClone(packet);
  capabilityPacket.summary.networkFetch = true;
  const insufficientPacket = structuredClone(packet);
  insufficientPacket.summary.recordsRead = 1;
  insufficientPacket.redactedRecords = asArray(insufficientPacket.redactedRecords).slice(0, 1);
  return [
    { id: 'window-useful-pass', caseType: 'useful_valid_pass', expectedUsefulness: true, expectedNoise: false, output: evaluatePositiveUtilityPassGate(packet) },
    { id: 'window-noisy-private-reject', caseType: 'noisy_safe_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(privatePacket) },
    { id: 'window-malformed-bounds-reject', caseType: 'malformed_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(boundsPacket) },
    { id: 'window-forbidden-capability-reject', caseType: 'forbidden_alias_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(capabilityPacket) },
    { id: 'window-insufficient-records-reject', caseType: 'borderline_insufficient_records_reject', expectedUsefulness: false, expectedNoise: true, output: evaluatePositiveUtilityPassGate(insufficientPacket) }
  ];
}
function summarizeBoundedReadFailure(reason = 'read_error') {
  return {
    stage: 'explicit_repo_local_multisource_read',
    status: 'DEGRADED',
    failure: reason,
    sourceCount: 0,
    recordsRead: 0,
    sourceFailuresIsolated: 0,
    evidencePacketSha256: sha256('bounded-read-failed:' + reason),
    redactedRecordPreviews: [],
    policyDecision: null
  };
}
function summarizeBoundedPacket(packet) {
  return {
    stage: 'explicit_repo_local_multisource_read',
    status: packet?.summary?.boundedExplicitMultisourceShadowReadBarrierCrossed === true ? 'COMPLETE' : 'DEGRADED',
    sourceCount: packet?.summary?.sourceCount ?? 0,
    recordsRead: packet?.summary?.recordsRead ?? 0,
    sourceFailuresIsolated: packet?.summary?.sourceFailuresIsolated ?? 0,
    evidencePacketSha256: sha256(JSON.stringify(packet ?? null)),
    redactedRecordPreviews: asArray(packet?.redactedRecords).slice(0, 3).map((record, index) => ({ recordId: `redacted-record-${index + 1}`, text: redactText(record.redactedText ?? ''), rawPersisted: false })),
    policyDecision: null
  };
}
function summarizePositiveGate(gate) {
  return { stage: 'positive_pass_gate', status: gate?.positiveUtilityGatePassed === true ? 'PASS' : 'DEGRADED', classification: gate?.classification ?? null, rejectionReasons: asArray(gate?.rejectionReasons), policyDecision: null };
}
function summarizeQueue(queue) {
  return { stage: 'operator_review_queue', status: queue?.queueStatus ?? 'DEGRADED', queueItemCount: asArray(queue?.queueItems).length, queueItems: asArray(queue?.queueItems).map((item) => ({ queueItemId: item.queueItemId, sourceCaseId: item.sourceCaseId, summary: redactText(item.redactedSummary ?? '', 160), policyDecision: null })), policyDecision: null };
}
function summarizeCapture(capture) {
  return { stage: 'manual_local_outcome_capture', status: capture?.captureStatus ?? 'DEGRADED', capturedOutcomeCount: capture?.capturedOutcomeCount ?? 0, labels: asArray(capture?.capturedOutcomes).map((entry) => entry.outcomeLabel), policyDecision: null };
}
function summarizeValue(scorecard) {
  return { stage: 'value_scorecard', status: scorecard?.scorecardStatus ?? 'DEGRADED', metrics: scorecard?.metrics ?? {}, recommendation: scorecard?.recommendation ?? null, recommendationIsAuthority: false, policyDecision: null };
}

export function passiveObservationWindowProtocol() {
  return {
    releaseLayer: 'v0.26.0-alpha',
    barrierCrossed: 'bounded_passive_observation_window_chaining_safe_local_stages',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitRepoLocalSourcesOnly: true,
    boundedSources: PASSIVE_OBSERVATION_WINDOW_MAX_SOURCES,
    boundedItems: PASSIVE_OBSERVATION_WINDOW_MAX_ITEMS,
    localManualOutcomeFixturesOnly: true,
    redactionBeforePersist: true,
    redactedEvidencePacketOnly: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    noRuntimeAuthority: true,
    policyDecision: null
  };
}

export function validatePassiveObservationWindowInput(input = {}) {
  const issues = [];
  if (!isPlainObject(input)) return ['input.malformed_not_object'];
  validateSources(input.sources, issues);
  validateBounds(input, issues);
  validateOutcomeInputs(input.outcomes, issues);
  issues.push(...boundaryViolations(input, 'input'));
  issues.push(...findAuthorityTokens(input, 'input'));
  if (hasOwn(input, 'policyDecision') && input.policyDecision !== null) issues.push('input.policyDecision_non_null');
  if (input.recommendationIsAuthority === true) issues.push('input.recommendation_treated_as_authority');
  if (input.rawPersist === true || input.rawOutput === true || input.persistRaw === true) issues.push('input.raw_persistence_or_output_requested');
  if (input.externalEffects === true || input.networkFetch === true || input.toolExecution === true) issues.push('input.external_or_tool_effect_requested');
  return [...new Set(issues)];
}

export function validatePassiveObservationWindowArtifact(artifact) {
  const issues = [];
  if (!isPlainObject(artifact)) return ['artifact.malformed_not_object'];
  if (artifact.schemaVersion !== 'passive-observation-window-v0.26.0-alpha') issues.push('artifact.schema_version_invalid');
  if (artifact.windowStatus !== 'OBSERVATION_WINDOW_COMPLETE') issues.push('artifact.window_status_not_complete');
  if (artifact.nonAuthoritative !== true || artifact.humanReadableReportOnly !== true || artifact.redactedEvidencePacketOnly !== true) issues.push('artifact.boundary_flags_missing');
  if (artifact.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  issues.push(...boundaryViolations(artifact, 'artifact'));
  issues.push(...findAuthorityTokens(artifact, 'artifact'));
  for (const stage of asArray(artifact.stageSummaries)) assertSafeStageArtifact(stage, `artifact.stageSummaries[${stage?.stage ?? 'unknown'}]`, issues);
  assertSafeStageArtifact(artifact.redactedEvidencePacket, 'artifact.redactedEvidencePacket', issues);
  issues.push(...findReportTokens(artifact.reportMarkdown ?? '', 'artifact.reportMarkdown'));
  return [...new Set(issues)];
}

function boundedReadFailureReason(error) {
  const message = String(error?.message ?? error ?? '');
  if (/at least two successfully read explicit repo-local sources/i.test(message)) return 'min_successful_sources_not_met';
  if (/source/i.test(message) && /read/i.test(message)) return 'source_read_failed';
  return 'read_error';
}

export async function runPassiveObservationWindow(input = {}) {
  const inputIssues = validatePassiveObservationWindowInput(input);
  if (inputIssues.length) return degradedWindow(inputIssues);
  let bounded;
  try {
    bounded = JSON.parse(await runBoundedMultisourceShadowRead({ sources: input.sources, recordsPerSource: input.recordsPerSource ?? 2, totalRecords: input.totalRecords ?? 6 }));
  } catch (error) {
    const reason = boundedReadFailureReason(error);
    return degradedWindow([`stage.explicit_repo_local_multisource_read_failed:${reason}`], [summarizeBoundedReadFailure(reason)]);
  }
  const positive = evaluatePositiveUtilityPassGate(bounded, { minRecords: input.minRecords ?? 2, maxIsolatedSourceFailures: input.maxIsolatedSourceFailures ?? 0 });
  const observed = scoreObservedUsefulnessNoise(buildNoiseCasesFromPacket(bounded));
  const queue = buildControlledOperatorReviewQueue(observed);
  const capture = buildOperatorReviewOutcomeCapture(queue, input.outcomes);
  const value = scoreOperatorOutcomeValue(capture);
  const stageSummaries = [summarizeBoundedPacket(bounded), summarizePositiveGate(positive), { stage: 'usefulness_noise_scorecard', status: observed?.scorecardStatus ?? 'COMPLETE', recommendation: observed?.recommendation ?? null, passPrecision: observed?.metrics?.passPrecision ?? null, noiseRejected: observed?.metrics?.noiseRejected ?? null, policyDecision: null }, summarizeQueue(queue), summarizeCapture(capture), summarizeValue(value)];
  const stageIssues = [];
  if (positive.positiveUtilityGatePassed !== true) stageIssues.push(`stage.positive_pass_gate_not_pass:${positive?.classification ?? 'unknown'}`, ...asArray(positive?.rejectionReasons).map((reason) => `stage.positive_pass_gate:${reason}`));
  if (queue.queueStatus !== 'READY_FOR_OPERATOR_REVIEW') stageIssues.push(`stage.operator_review_queue_not_ready:${queue?.queueStatus ?? 'unknown'}`, ...asArray(queue?.validationIssues).map((issue) => `stage.operator_review_queue:${issue}`));
  if (capture.captureStatus !== 'OUTCOME_CAPTURE_COMPLETE') stageIssues.push(`stage.outcome_capture_not_complete:${capture?.captureStatus ?? 'unknown'}`, ...asArray(capture?.validationIssues).map((issue) => `stage.outcome_capture:${issue}`));
  if (value.scorecardStatus !== 'VALUE_SCORECARD_COMPLETE') stageIssues.push(`stage.value_scorecard_not_complete:${value?.scorecardStatus ?? 'unknown'}`, ...asArray(value?.validationIssues).map((issue) => `stage.value_scorecard:${issue}`));
  const complete = stageIssues.length === 0;
  const artifact = buildWindowArtifact({ status: complete ? 'OBSERVATION_WINDOW_COMPLETE' : 'DEGRADED_OBSERVATION_WINDOW', stageSummaries, bounded, value, validationIssues: [...new Set(stageIssues)] });
  const artifactIssues = complete ? validatePassiveObservationWindowArtifact(artifact) : [];
  if (artifactIssues.length) return degradedWindow(artifactIssues, stageSummaries);
  return artifact;
}

function buildWindowArtifact({ status, stageSummaries, bounded, value, validationIssues }) {
  const redactedEvidencePacket = {
    packetVersion: 'passive-observation-window-redacted-evidence-v0.26.1',
    boundedPacketSha256: sha256(JSON.stringify(bounded ?? null)),
    redactedPreviews: asArray(bounded?.redactedRecords).slice(0, 3).map((record, index) => ({ id: `window-evidence-${index + 1}`, text: redactText(record.redactedText ?? ''), rawPersisted: false, policyDecision: null })),
    rawSourceCache: 'excluded',
    rawPersisted: false,
    policyDecision: null
  };
  const artifact = {
    artifact: PASSIVE_OBSERVATION_WINDOW_ARTIFACT,
    schemaVersion: 'passive-observation-window-v0.26.0-alpha',
    releaseLayer: PASSIVE_OBSERVATION_WINDOW_VERSION,
    protocol: passiveObservationWindowProtocol(),
    windowStatus: status,
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitRepoLocalSourcesOnly: true,
    boundedSources: PASSIVE_OBSERVATION_WINDOW_MAX_SOURCES,
    boundedItems: PASSIVE_OBSERVATION_WINDOW_MAX_ITEMS,
    localManualOutcomeFixturesOnly: true,
    redactionBeforePersist: true,
    redactedEvidencePacketOnly: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    noRuntimeAuthority: true,
    policyDecision: null,
    validationIssues,
    stageSummaries,
    redactedEvidencePacket,
    valueSignal: { scorecardStatus: value?.scorecardStatus ?? null, metrics: value?.metrics ?? {}, recommendation: value?.recommendation ?? null, recommendationIsAuthority: false, policyDecision: null }
  };
  artifact.reportMarkdown = passiveObservationWindowReport(artifact);
  return artifact;
}

function degradedWindow(validationIssues, stageSummaries = []) {
  return buildWindowArtifact({ status: 'DEGRADED_OBSERVATION_WINDOW', stageSummaries, bounded: null, value: null, validationIssues: [...new Set(validationIssues)] });
}

export function passiveObservationWindowReport(artifact) {
  const lines = asArray(artifact.stageSummaries).map((stage) => `- ${stage.stage}: ${stage.status}; policyDecision: null`);
  return [
    '# Passive Observation Window v0.26.5',
    '',
    '- Window status: ' + artifact.windowStatus,
    '- Scope: one operator-run local passive observation loop over explicit repo-local sources and local manual outcome inputs.',
    '- Boundary: read-only, redacted-before-persist, human-readable signal only, non-authoritative, no runtime authority.',
    '- policyDecision: null',
    '- Value signal: status=' + String(artifact.valueSignal.scorecardStatus) + '; recommendation=' + String(artifact.valueSignal.recommendation) + '; recommendationIsAuthority=false',
    '- Validation issues: ' + (artifact.validationIssues.length ? artifact.validationIssues.join(', ') : 'none'),
    '',
    '## Stage summaries',
    ...(lines.length ? lines : ['- No complete stage chain.']),
    '',
    '## Redacted evidence packet',
    '- packetVersion: ' + artifact.redactedEvidencePacket.packetVersion,
    '- previewCount: ' + artifact.redactedEvidencePacket.redactedPreviews.length,
    '- source cache: excluded; raw persistence: false'
  ].join('\n') + '\n';
}
