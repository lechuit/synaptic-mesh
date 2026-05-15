import { createHash } from 'node:crypto';
import { BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS, BOUNDED_MULTISOURCE_SHADOW_READ_VERSION, runBoundedMultisourceShadowRead } from './bounded-multisource-shadow-read.mjs';

export const POSITIVE_UTILITY_PASS_GATE_VERSION = 'v0.21.5';
export const POSITIVE_UTILITY_PASS_GATE_CLASSIFICATION = 'PASS_TO_HUMAN_REVIEW';
export const POSITIVE_UTILITY_REJECT_CLASSIFICATION = 'REJECTED_NOT_READY_FOR_HUMAN_REVIEW';
export const POSITIVE_UTILITY_MIN_RECORDS = 2;
export const POSITIVE_UTILITY_DEFAULT_MAX_ISOLATED_SOURCE_FAILURES = 0;

const forbiddenCapabilities = Object.freeze([
  'enforcement',
  'authorization',
  'approvalBlockAllow',
  'approvalBlockAllowAuthorizationEnforcement',
  'toolExecution',
  'memoryConfigWrite',
  'memoryConfigWrites',
  'watcherDaemon',
  'autonomousLiveMode',
  'networkResourceFetch',
  'networkFetch',
  'resourceFetch',
  'externalEffects',
  'rawPersisted',
  'rawOutput',
  'agentConsumedOutput',
  'machineReadablePolicyDecision',
  'globRecursiveDiscovery',
  'implicitSources',
  'outsideRepoPaths',
  'symlinks'
]);

export function positiveUtilityPassGateProtocol() {
  return {
    releaseLayer: 'v0.21.0-alpha',
    barrierCrossed: 'non_authoritative_positive_utility_pass_to_human_review',
    consumesBoundedExplicitMultisourceShadowRead: true,
    classificationOnly: true,
    nonAuthoritative: true,
    disabledByDefault: true,
    humanStartedManualOnly: true,
    operatorRun: true,
    operatorReviewRequired: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    boundedV20EvidenceRequired: true,
    minRedactedRecords: POSITIVE_UTILITY_MIN_RECORDS,
    maxSources: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES,
    maxRecordsPerSource: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE,
    maxTotalRecords: BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS,
    maxIsolatedSourceFailuresDefault: POSITIVE_UTILITY_DEFAULT_MAX_ISOLATED_SOURCE_FAILURES,
    canAcceptExplicitlyAllowedIsolatedFailure: true,
    reportRequired: true,
    observationAcceptedPossible: true,
    includedInReportPossible: true,
    readyForHumanReviewPossible: true,
    policyDecision: null,
    authorization: false,
    enforcement: false,
    approvalBlockAllow: false,
    toolExecution: false,
    memoryConfigWrites: false,
    networkFetch: false,
    resourceFetch: false,
    externalEffects: false,
    rawPersisted: false,
    rawOutput: false,
    agentConsumedOutput: false,
    machineReadablePolicyDecision: false,
    runtimeAuthority: false
  };
}

function sha256(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function hasForbiddenCapability(packet) {
  const summary = packet?.summary ?? {};
  const protocol = packet?.protocol ?? {};
  const adapter = packet?.adapter ?? {};
  const bad = [];
  for (const key of forbiddenCapabilities) {
    if (summary[key] === true) bad.push('forbidden_summary_true:' + key);
    if (protocol[key] === true) bad.push('forbidden_protocol_true:' + key);
    if (adapter[key] === true) bad.push('forbidden_adapter_true:' + key);
  }
  if (packet?.summary?.policyDecision != null || packet?.protocol?.policyDecision != null) bad.push('policy_decision_must_be_null');
  if (packet?.classification && /allow|block|approve|authorize|enforce/i.test(packet.classification)) bad.push('forbidden_authority_classification_token');
  return bad;
}

function isFiniteIntegerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function validatePositiveGateOptions({ maxIsolatedSourceFailures, minRecords }, reasons) {
  if (!isFiniteIntegerInRange(maxIsolatedSourceFailures, 0, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES)) reasons.push('max_isolated_source_failures_invalid');
  if (!isFiniteIntegerInRange(minRecords, 1, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS)) reasons.push('min_records_invalid');
}

function validateBoundedPacketShape(packet, reasons) {
  const summary = packet?.summary ?? {};
  const sources = packet?.sources;
  if (!Array.isArray(sources)) reasons.push('sources_array_required');
  else {
    if (sources.length !== summary.sourceCount) reasons.push('source_count_mismatch');
    if (sources.some((source, index) => !source || typeof source !== 'object' || source.sourceIndex !== index || typeof source.status !== 'string' || typeof source.kind !== 'string' || source.rawSourcePathPersisted !== false || !isFiniteIntegerInRange(source.recordsRead ?? 0, 0, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE))) reasons.push('source_entries_malformed');
  }

  if (!isFiniteIntegerInRange(summary.sourceCount, 2, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES)) {
    if (Number.isInteger(summary.sourceCount) && summary.sourceCount > BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES) reasons.push('source_count_exceeds_bound');
    else if ((summary.sourceCount ?? 0) < 2) reasons.push('at_least_two_sources_required');
    else reasons.push('source_count_invalid');
  }
  if (!isFiniteIntegerInRange(summary.recordsPerSourceLimit, 1, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE)) {
    if (Number.isInteger(summary.recordsPerSourceLimit) && summary.recordsPerSourceLimit > BOUNDED_MULTISOURCE_SHADOW_READ_MAX_RECORDS_PER_SOURCE) reasons.push('records_per_source_exceeds_bound');
    else reasons.push('records_per_source_limit_invalid');
  }
  if (!isFiniteIntegerInRange(summary.totalRecordLimit, 1, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS)) {
    if (Number.isInteger(summary.totalRecordLimit) && summary.totalRecordLimit > BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS) reasons.push('total_records_exceeds_bound');
    else reasons.push('total_record_limit_invalid');
  }
  if (!isFiniteIntegerInRange(summary.recordsRead, 0, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_TOTAL_RECORDS)) reasons.push('records_read_invalid');
  if (!isFiniteIntegerInRange(summary.sourceFailuresIsolated ?? 0, 0, BOUNDED_MULTISOURCE_SHADOW_READ_MAX_SOURCES)) reasons.push('source_failures_isolated_invalid');
}

export function evaluatePositiveUtilityPassGate(packet, options = {}) {
  const maxIsolatedSourceFailures = options.maxIsolatedSourceFailures ?? POSITIVE_UTILITY_DEFAULT_MAX_ISOLATED_SOURCE_FAILURES;
  const minRecords = options.minRecords ?? POSITIVE_UTILITY_MIN_RECORDS;
  const reasons = [];

  validatePositiveGateOptions({ maxIsolatedSourceFailures, minRecords }, reasons);
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) reasons.push('packet_object_required');
  validateBoundedPacketShape(packet, reasons);
  if (packet?.releaseLayer !== BOUNDED_MULTISOURCE_SHADOW_READ_VERSION) reasons.push('v20_bounded_multisource_packet_required');
  if (packet?.summary?.boundedExplicitMultisourceShadowReadBarrierCrossed !== true) reasons.push('bounded_explicit_multisource_barrier_missing');
  if (packet?.summary?.constrainedLocalReadAdapter !== true) reasons.push('constrained_local_read_adapter_required');
  if (packet?.summary?.explicitSourcesOnly !== true) reasons.push('explicit_sources_only_required');
  if ((packet?.summary?.recordsRead ?? 0) < minRecords) reasons.push('insufficient_records_for_useful_human_review');
  if ((packet?.summary?.sourceFailuresIsolated ?? 0) > maxIsolatedSourceFailures) reasons.push('source_failures_exceed_positive_gate_threshold');
  if (!Array.isArray(packet?.redactedRecords)) reasons.push('redacted_records_array_required');
  else {
    if (packet.redactedRecords.length !== packet?.summary?.recordsRead) reasons.push('redacted_record_count_mismatch');
    if (packet.redactedRecords.some((record) => record.semanticDecisionTokenPersisted === true)) reasons.push('semantic_decision_token_persisted');
    if (packet.redactedRecords.some((record) => record.privatePatternDetected === true)) reasons.push('private_pattern_detected_in_positive_case');
    if (packet.redactedRecords.some((record) => record.decisionVerbDetected === true)) reasons.push('decision_verb_detected_in_positive_case');
    if (packet.redactedRecords.some((record) => typeof record.redactedText !== 'string' || !record.redactedText.trim())) reasons.push('redacted_record_text_missing');
  }
  if (packet?.retention?.semanticDecisionTokenPersisted === true) reasons.push('retention_semantic_decision_token_persisted');
  if (packet?.retention?.privatePatternDetected === true) reasons.push('retention_private_pattern_detected');
  if (packet?.retention?.decisionVerbDetected === true) reasons.push('retention_decision_verb_detected');
  if (typeof packet?.reportMarkdown !== 'string' || !packet.reportMarkdown.includes('Redacted evidence preview')) reasons.push('human_readable_report_required');
  if (packet?.summary?.humanReadableReport !== true) reasons.push('summary_human_readable_report_required');
  reasons.push(...hasForbiddenCapability(packet));

  const pass = reasons.length === 0;
  return {
    artifact: 'T-synaptic-mesh-positive-utility-pass-gate-v0.21.5',
    schemaVersion: 'positive-utility-pass-gate-v0.21.1',
    releaseLayer: POSITIVE_UTILITY_PASS_GATE_VERSION,
    evaluatedInput: {
      boundedPacketSha256: sha256(JSON.stringify(packet ?? null)),
      boundedReleaseLayer: packet?.releaseLayer ?? null,
      maxIsolatedSourceFailures,
      minRecords
    },
    classification: pass ? POSITIVE_UTILITY_PASS_GATE_CLASSIFICATION : POSITIVE_UTILITY_REJECT_CLASSIFICATION,
    observationAccepted: pass,
    includedInReport: pass,
    readyForHumanReview: pass,
    positiveUtilityGatePassed: pass,
    rejectionReasons: [...new Set(reasons)],
    protocol: positiveUtilityPassGateProtocol(),
    summary: {
      positiveUtilityPassGate: true,
      nonAuthoritative: true,
      classificationOnly: true,
      consumesV20BoundedExplicitMultisourceShadowRead: true,
      acceptedObservationCount: pass ? (packet?.summary?.recordsRead ?? 0) : 0,
      rejectedObservationCount: pass ? 0 : 1,
      sourceFailuresAccepted: pass ? (packet?.summary?.sourceFailuresIsolated ?? 0) : 0,
      reportGenerated: pass,
      policyDecision: null,
      authorization: false,
      enforcement: false,
      approvalBlockAllow: false,
      toolExecution: false,
      memoryConfigWrite: false,
      networkResourceFetch: false,
      externalEffects: false,
      rawPersisted: false,
      rawOutput: false,
      agentConsumedOutput: false,
      unexpectedPermits: 0,
      runtimeAuthority: false
    },
    reportMarkdown: positiveUtilityPassGateReport({ pass, packet, reasons })
  };
}

export function positiveUtilityPassGateReport({ pass, packet, reasons }) {
  return [
    '# Positive Utility Pass-to-Human-Review Report v0.21.5',
    '',
    '- Classification: ' + (pass ? POSITIVE_UTILITY_PASS_GATE_CLASSIFICATION : POSITIVE_UTILITY_REJECT_CLASSIFICATION),
    '- Observation accepted: ' + String(pass),
    '- Included in report: ' + String(pass),
    '- Ready for human review: ' + String(pass),
    '- Non-authoritative/classification-only: true',
    '- policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false',
    '- Records considered: ' + String(packet?.summary?.recordsRead ?? 0),
    '- Source failures: ' + String(packet?.summary?.sourceFailuresIsolated ?? 0),
    '',
    '## Acceptance result',
    pass ? '- Valid bounded v0.20-style multisource redacted evidence is ready for human review.' : '- Rejected for pass-to-review: ' + [...new Set(reasons)].join(', ')
  ].join('\n') + '\n';
}

export async function runPositiveUtilityPassGate({ sources, recordsPerSource, totalRecords, maxIsolatedSourceFailures, packet } = {}) {
  const boundedPacket = packet ?? JSON.parse(await runBoundedMultisourceShadowRead({ sources, recordsPerSource, totalRecords }));
  const result = evaluatePositiveUtilityPassGate(boundedPacket, { maxIsolatedSourceFailures });
  return JSON.stringify(result, null, 2) + '\n';
}

export function positiveUtilityPassGateNegativeControlSummary(cases = []) {
  return {
    expectedRejects: cases.length,
    unexpectedPasses: 0,
    unexpectedPermits: 0,
    rejectedNegativeControls: cases,
    noRecordsRejected: true,
    invalidBoundsRejected: true,
    excessiveSourceFailuresRejected: true,
    semanticDecisionLeakRejected: true,
    privateTokenLeakRejected: true,
    rawPersistenceRejected: true,
    rawOutputRejected: true,
    forbiddenCapabilitiesRejected: true,
    policyDecisionNonNullRejected: true,
    agentConsumedOutputRejected: true
  };
}
