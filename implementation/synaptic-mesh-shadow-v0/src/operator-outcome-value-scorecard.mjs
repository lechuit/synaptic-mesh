export const OPERATOR_OUTCOME_VALUE_SCORECARD_VERSION = 'v0.25.5';
export const OPERATOR_OUTCOME_VALUE_SCORECARD_ARTIFACT = 'T-synaptic-mesh-operator-outcome-value-scorecard-v0.25.5';

export const OPERATOR_OUTCOME_VALUE_RECOMMENDATIONS = Object.freeze([
  'ADVANCE_OBSERVATION_ONLY',
  'HOLD_FOR_MORE_EVIDENCE',
  'DEGRADE_QUEUE_SIGNAL'
]);

const EXPECTED_SCHEMA = 'operator-review-outcome-capture-v0.24.0-alpha';
const MAX_OUTCOMES = 3;
const MIN_RECOMMENDABLE_SAMPLE = 3;
const AUTHORITY_TOKENS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'execute', 'toolExecution', 'networkFetch', 'networkResourceFetch', 'resourceFetch',
  'memoryConfigWrite', 'memoryConfigWrites', 'externalEffects', 'rawPersisted', 'rawOutput',
  'runtimeAuthority', 'policyDecision', 'policy_decision', 'machineReadablePolicyDecision',
  'mayAllow', 'mayBlock', 'approvalBlockAllow'
]);
const BOUNDARY_KEYS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'enforcement', 'execute', 'approvalBlockAllow', 'toolExecution',
  'memoryConfigWrite', 'memoryConfigWrites', 'networkResourceFetch', 'networkFetch', 'resourceFetch',
  'externalEffects', 'rawPersisted', 'rawOutput', 'agentConsumedOutput',
  'machineReadablePolicyDecision', 'runtimeAuthority', 'mayAllow', 'mayBlock'
]);
const VALID_LABELS = Object.freeze([
  'USEFUL_FOR_REVIEW',
  'NOT_USEFUL_NOISE',
  'NEEDS_MORE_EVIDENCE',
  'ABSTAIN_OPERATOR_UNCERTAIN'
]);
const SENSITIVE_PATTERNS = Object.freeze([
  /sk-[A-Za-z0-9_-]{12,}/g,
  /ghp_[A-Za-z0-9_]{12,}/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b\d{3}[-. ]?\d{2}[-. ]?\d{4}\b/g,
  /\b(?:\d[ -]*?){13,19}\b/g
]);

function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function tokenPattern(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, 'i');
}
function findAuthorityTokens(value, prefix = 'artifact') {
  const issues = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => issues.push(...findAuthorityTokens(entry, `${prefix}[${index}]`)));
    return issues;
  }
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'reportMarkdown') issues.push(...findReportAuthorityTokens(nested, `${prefix}.${key}`));
      else issues.push(...findAuthorityTokens(nested, `${prefix}.${key}`));
    }
    return issues;
  }
  if (typeof value !== 'string') return issues;
  for (const token of AUTHORITY_TOKENS) if (tokenPattern(token).test(value)) issues.push(`${prefix}.authority_token:${token}`);
  return issues;
}
function findReportAuthorityTokens(text, prefix = 'artifact.reportMarkdown') {
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
  for (const key of BOUNDARY_KEYS) if (hasOwn(value, key) && value[key] !== false) issues.push(`${prefix}.${key}_not_false`);
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'reportMarkdown') continue;
    issues.push(...boundaryViolations(nested, `${prefix}.${key}`));
  }
  return issues;
}
function redactText(value, max = 180) {
  let output = typeof value === 'string' ? value.slice(0, max) : '';
  for (const pattern of SENSITIVE_PATTERNS) output = output.replace(pattern, '[REDACTED]');
  return output;
}
function ratio(numerator, denominator) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  return Number((numerator / denominator).toFixed(4));
}
function recommendationFor(metrics) {
  if (metrics.validationIssueCount > 0 || metrics.reviewedItemCount < MIN_RECOMMENDABLE_SAMPLE || metrics.needsMoreEvidence > 0 || metrics.abstainUncertain > 0) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.noiseRatio !== null && metrics.noiseRatio >= 0.5) return 'DEGRADE_QUEUE_SIGNAL';
  if (metrics.usefulRatio !== null && metrics.usefulRatio >= 0.666 && metrics.noiseRatio !== null && metrics.noiseRatio <= 0.3333) return 'ADVANCE_OBSERVATION_ONLY';
  return 'HOLD_FOR_MORE_EVIDENCE';
}

export function operatorOutcomeValueScorecardProtocol() {
  return {
    releaseLayer: 'v0.25.0-alpha',
    barrierCrossed: 'manual_operator_outcome_value_scorecard_over_v24_capture_artifacts',
    consumesOperatorReviewOutcomeCaptureArtifacts: true,
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    boundedItems: MAX_OUTCOMES,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    valueScorecardOnly: true,
    notPolicyArtifact: true,
    noAuthorization: true,
    noEnforcement: true,
    noToolExecution: true,
    noNetworkResourceFetch: true,
    noMemoryConfigWrites: true,
    noExternalEffects: true,
    noDaemonOrWatcher: true,
    noRawPersistedOrOutput: true,
    noAgentConsumedMachineReadablePolicyDecision: true,
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
    machineReadablePolicyDecision: false,
    runtimeAuthority: false,
    recommendations: OPERATOR_OUTCOME_VALUE_RECOMMENDATIONS
  };
}

export function validateOperatorOutcomeValueCapture(capture) {
  const issues = [];
  if (!isPlainObject(capture)) return ['capture.malformed_not_object'];
  if (capture.schemaVersion !== EXPECTED_SCHEMA) issues.push('capture.schema_version_not_v0.24');
  if (capture.captureStatus !== 'OUTCOME_CAPTURE_COMPLETE') issues.push('capture.status_not_complete');
  if (capture.nonAuthoritative !== true || capture.humanReadableOnly !== true) issues.push('capture.boundary_flags_missing');
  if (capture.redactedEvidenceOnly !== true || capture.redactionBeforePersist !== true) issues.push('capture.redaction_flags_missing');
  issues.push(...boundaryViolations(capture, 'capture'));
  issues.push(...findReportAuthorityTokens(capture.reportMarkdown ?? '', 'capture.reportMarkdown'));
  const entries = asArray(capture.capturedOutcomes);
  if (!Array.isArray(capture.capturedOutcomes)) issues.push('capture.captured_outcomes_not_array');
  if (entries.length < 1 || entries.length > MAX_OUTCOMES) issues.push('capture.captured_outcome_count_out_of_bounds');
  if (!Number.isInteger(capture.capturedOutcomeCount)) issues.push('capture.captured_outcome_count_not_integer');
  else if (capture.capturedOutcomeCount !== entries.length) issues.push('capture.captured_outcome_count_mismatch');
  const seen = new Set();
  for (const [index, entry] of entries.entries()) {
    const prefix = `capture.capturedOutcomes[${index}]`;
    if (!isPlainObject(entry)) { issues.push(`${prefix}.malformed_not_object`); continue; }
    if (typeof entry.queueItemId !== 'string' || !entry.queueItemId.trim()) issues.push(`${prefix}.queue_item_id_required`);
    if (seen.has(entry.queueItemId)) issues.push(`${prefix}.duplicate_queue_item_id`);
    seen.add(entry.queueItemId);
    if (!VALID_LABELS.includes(entry.outcomeLabel)) issues.push(`${prefix}.unsafe_or_unknown_outcome_label`);
    if (entry.nonAuthoritative !== true || entry.humanReadableOnly !== true) issues.push(`${prefix}.boundary_flags_missing`);
    issues.push(...boundaryViolations(entry, prefix));
  }
  issues.push(...findAuthorityTokens(capture, 'capture'));
  return [...new Set(issues)];
}

export function scoreOperatorOutcomeValue(capture) {
  const validationIssues = validateOperatorOutcomeValueCapture(capture);
  const valid = validationIssues.length === 0;
  const entries = valid ? asArray(capture.capturedOutcomes) : [];
  const usefulOutcomes = entries.filter((entry) => entry.outcomeLabel === 'USEFUL_FOR_REVIEW').length;
  const noiseOutcomes = entries.filter((entry) => entry.outcomeLabel === 'NOT_USEFUL_NOISE').length;
  const needsMoreEvidence = entries.filter((entry) => entry.outcomeLabel === 'NEEDS_MORE_EVIDENCE').length;
  const abstainUncertain = entries.filter((entry) => entry.outcomeLabel === 'ABSTAIN_OPERATOR_UNCERTAIN').length;
  const reviewedItemCount = entries.length;
  const metrics = {
    usefulOutcomes,
    noiseOutcomes,
    needsMoreEvidence,
    abstainUncertain,
    reviewedItemCount,
    usefulRatio: ratio(usefulOutcomes, reviewedItemCount),
    noiseRatio: ratio(noiseOutcomes, reviewedItemCount),
    evidenceGapRatio: ratio(needsMoreEvidence + abstainUncertain, reviewedItemCount),
    validationIssueCount: validationIssues.length
  };
  const recommendation = recommendationFor(metrics);
  const observations = entries.map((entry) => ({
    queueItemId: entry.queueItemId,
    outcomeLabel: entry.outcomeLabel,
    operatorNoteRedacted: redactText(entry.operatorNoteRedacted ?? ''),
    reasonCodes: asArray(entry.reasonCodes).map((reason) => redactText(String(reason), 64)),
    nonAuthoritative: true,
    humanReadableOnly: true,
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
    machineReadablePolicyDecision: false,
    runtimeAuthority: false
  }));
  const scorecard = {
    artifact: OPERATOR_OUTCOME_VALUE_SCORECARD_ARTIFACT,
    schemaVersion: 'operator-outcome-value-scorecard-v0.25.0-alpha',
    releaseLayer: OPERATOR_OUTCOME_VALUE_SCORECARD_VERSION,
    protocol: operatorOutcomeValueScorecardProtocol(),
    scorecardStatus: valid ? 'VALUE_SCORECARD_COMPLETE' : 'DEGRADED_NO_VALUE_SCORECARD',
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    boundedItems: MAX_OUTCOMES,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    valueScorecardOnly: true,
    notPolicyArtifact: true,
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
    machineReadablePolicyDecision: false,
    runtimeAuthority: false,
    sourceCaptureArtifact: valid ? (capture?.artifact ?? null) : null,
    sourceCaptureStatus: valid ? (capture?.captureStatus ?? null) : null,
    validationIssues,
    metrics,
    recommendation,
    recommendationIsAuthority: false,
    recommendationMeaning: 'human-readable non-authoritative queue-value signal only',
    observations
  };
  scorecard.falseAuthorityLeakage = findAuthorityTokens({ recommendation: scorecard.recommendation, observations: scorecard.observations }, 'scorecard');
  scorecard.reportMarkdown = operatorOutcomeValueScorecardReport(scorecard);
  return scorecard;
}

export function operatorOutcomeValueScorecardReport(scorecard) {
  const observations = scorecard.observations.length === 0
    ? ['- No valid captured outcomes scored.']
    : scorecard.observations.map((entry) => `- ${entry.queueItemId}: label=${entry.outcomeLabel}; note=${entry.operatorNoteRedacted || 'none'}; reasons=${entry.reasonCodes.join(',') || 'none'}`);
  return [
    '# Operator Outcome Value Scorecard v0.25.5',
    '',
    '- Scope: local manual scorecard over explicit v0.24 captured operator outcomes.',
    '- Boundary: non-authoritative, human-readable signal only; not a policy, approval, enforcement, or runtime artifact.',
    '- Scorecard status: ' + scorecard.scorecardStatus,
    '- Recommendation: ' + scorecard.recommendation + ' (human-readable non-authoritative signal only).',
    '- Metrics: usefulOutcomes=' + scorecard.metrics.usefulOutcomes + '; noiseOutcomes=' + scorecard.metrics.noiseOutcomes + '; needsMoreEvidence=' + scorecard.metrics.needsMoreEvidence + '; abstainUncertain=' + scorecard.metrics.abstainUncertain + '; reviewedItemCount=' + scorecard.metrics.reviewedItemCount + '; usefulRatio=' + String(scorecard.metrics.usefulRatio) + '; noiseRatio=' + String(scorecard.metrics.noiseRatio),
    '- Safety: policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false; rawPersisted: false; rawOutput: false',
    '- Validation issues: ' + (scorecard.validationIssues.length ? scorecard.validationIssues.join(', ') : 'none'),
    '',
    '## Scored operator outcomes',
    ...observations
  ].join('\n') + '\n';
}
