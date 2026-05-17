export const OPERATOR_REVIEW_OUTCOME_CAPTURE_VERSION = 'v0.24.5';
export const OPERATOR_REVIEW_OUTCOME_CAPTURE_ARTIFACT = 'T-synaptic-mesh-operator-review-outcome-capture-v0.24.5';

export const OPERATOR_REVIEW_OUTCOME_LABELS = Object.freeze([
  'USEFUL_FOR_REVIEW',
  'NOT_USEFUL_NOISE',
  'NEEDS_MORE_EVIDENCE',
  'ABSTAIN_OPERATOR_UNCERTAIN'
]);

const MAX_ITEMS = 3;
const MAX_NOTE_CHARS = 240;
const MAX_REASON_CODES = 4;
const OUTCOME_COMPLETE = 'OUTCOME_CAPTURE_COMPLETE';
const OUTCOME_DEGRADED = 'DEGRADED_NO_OUTCOME_CAPTURE';

const AUTHORITY_TOKENS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'execute', 'toolExecution', 'networkFetch', 'networkResourceFetch', 'resourceFetch',
  'memoryConfigWrite', 'memoryConfigWrites', 'externalEffects', 'rawPersisted', 'rawOutput',
  'runtimeAuthority', 'policyDecision', 'policy_decision', 'machineReadablePolicyDecision',
  'mayAllow', 'mayBlock', 'approvalBlockAllow'
]);

const AUTHORITY_BOUNDARY_KEYS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'enforcement', 'execute', 'approvalBlockAllow', 'toolExecution',
  'memoryConfigWrite', 'memoryConfigWrites', 'networkResourceFetch', 'networkFetch', 'resourceFetch',
  'externalEffects', 'rawPersisted', 'rawOutput', 'agentConsumedOutput',
  'machineReadablePolicyDecision', 'runtimeAuthority', 'mayAllow', 'mayBlock'
]);

const SENSITIVE_PATTERNS = Object.freeze([
  /sk-[A-Za-z0-9_-]{12,}/g,
  /ghp_[A-Za-z0-9_]{12,}/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b\d{3}[-. ]?\d{2}[-. ]?\d{4}\b/g,
  /\b(?:\d[ -]*?){13,19}\b/g
]);

function asArray(value) { return Array.isArray(value) ? value : []; }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function safeString(value) { return typeof value === 'string' ? value : ''; }

function tokenPattern(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, 'i');
}

function findAuthorityTokens(value, prefix = 'artifact') {
  const violations = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => violations.push(...findAuthorityTokens(entry, `${prefix}[${index}]`)));
    return violations;
  }
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      violations.push(...findAuthorityTokens(nested, `${prefix}.${key}`));
    }
    return violations;
  }
  if (typeof value !== 'string') return violations;
  for (const token of AUTHORITY_TOKENS) if (tokenPattern(token).test(value)) violations.push(`${prefix}.authority_token:${token}`);
  return violations;
}

function boundaryViolations(value, prefix) {
  const violations = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => violations.push(...boundaryViolations(entry, `${prefix}[${index}]`)));
    return violations;
  }
  if (!isPlainObject(value)) return violations;
  if (hasOwn(value, 'policyDecision') && value.policyDecision !== null) violations.push(`${prefix}.policyDecision_non_null`);
  for (const key of AUTHORITY_BOUNDARY_KEYS) {
    if (hasOwn(value, key) && value[key] !== false) violations.push(`${prefix}.${key}_not_false`);
  }
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'reportMarkdown') continue;
    violations.push(...boundaryViolations(nested, `${prefix}.${key}`));
  }
  return violations;
}

function redactText(text) {
  let output = safeString(text).slice(0, MAX_NOTE_CHARS);
  for (const pattern of SENSITIVE_PATTERNS) output = output.replace(pattern, '[REDACTED]');
  return output;
}

function validateQueue(queue) {
  const issues = [];
  if (!isPlainObject(queue)) return ['queue.malformed_not_object'];
  if (queue.schemaVersion !== 'controlled-operator-review-queue-v0.23.0-alpha') issues.push('queue.schema_version_not_v0.23');
  if (queue.queueStatus !== 'READY_FOR_OPERATOR_REVIEW') issues.push('queue.status_not_ready');
  if (queue.nonAuthoritative !== true || queue.humanReadableOnly !== true) issues.push('queue.boundary_flags_missing');
  issues.push(...boundaryViolations(queue, 'queue'));
  const items = asArray(queue.queueItems);
  if (!Array.isArray(queue.queueItems)) issues.push('queue.items_not_array');
  if (items.length < 1 || items.length > MAX_ITEMS) issues.push('queue.item_count_out_of_bounds');
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    const prefix = `queue.queueItems[${index}]`;
    if (!isPlainObject(item)) { issues.push(`${prefix}.malformed_not_object`); continue; }
    if (typeof item.queueItemId !== 'string' || !item.queueItemId.trim()) issues.push(`${prefix}.id_required`);
    if (seen.has(item.queueItemId)) issues.push(`${prefix}.duplicate_id`);
    seen.add(item.queueItemId);
    if (item.nonAuthoritative !== true || item.humanReadableOnly !== true) issues.push(`${prefix}.boundary_flags_missing`);
    issues.push(...boundaryViolations(item, prefix));
  }
  issues.push(...findAuthorityTokens({ queueStatus: queue.queueStatus, queueItems: items.map((item) => ({ queueItemId: item?.queueItemId, rationale: item?.rationale, redactedSummary: item?.redactedSummary })) }, 'queue'));
  return [...new Set(issues)];
}

function validateOutcomeInput(outcomes, queueItems) {
  const issues = [];
  if (!isPlainObject(outcomes)) return ['outcomes.malformed_not_object'];
  if (outcomes.schemaVersion !== 'operator-review-outcomes-v0.24.0-alpha') issues.push('outcomes.schema_version_invalid');
  if (outcomes.nonAuthoritative !== true || outcomes.humanReadableOnly !== true) issues.push('outcomes.boundary_flags_missing');
  issues.push(...boundaryViolations(outcomes, 'outcomes'));
  const entries = asArray(outcomes.outcomes);
  if (!Array.isArray(outcomes.outcomes)) issues.push('outcomes.entries_not_array');
  if (entries.length !== queueItems.length) issues.push('outcomes.count_mismatch');
  if (entries.length < 1 || entries.length > MAX_ITEMS) issues.push('outcomes.count_out_of_bounds');
  const queueIds = new Set(queueItems.map((item) => item.queueItemId));
  const outcomeIds = new Set();
  for (const [index, entry] of entries.entries()) {
    const prefix = `outcomes.outcomes[${index}]`;
    if (!isPlainObject(entry)) { issues.push(`${prefix}.malformed_not_object`); continue; }
    if (typeof entry.queueItemId !== 'string' || !entry.queueItemId.trim()) issues.push(`${prefix}.queue_item_id_required`);
    if (outcomeIds.has(entry.queueItemId)) issues.push(`${prefix}.duplicate_queue_item_id`);
    outcomeIds.add(entry.queueItemId);
    if (!queueIds.has(entry.queueItemId)) issues.push(`${prefix}.queue_item_id_not_in_queue`);
    if (!OPERATOR_REVIEW_OUTCOME_LABELS.includes(entry.outcomeLabel)) issues.push(`${prefix}.unsafe_or_unknown_outcome_label`);
    if (entry.operatorNote !== undefined && typeof entry.operatorNote !== 'string') issues.push(`${prefix}.operator_note_string_required`);
    if (safeString(entry.operatorNote).length > MAX_NOTE_CHARS) issues.push(`${prefix}.operator_note_too_long`);
    if (entry.reasonCodes !== undefined && !Array.isArray(entry.reasonCodes)) issues.push(`${prefix}.reason_codes_array_required`);
    if (asArray(entry.reasonCodes).length > MAX_REASON_CODES) issues.push(`${prefix}.too_many_reason_codes`);
    issues.push(...boundaryViolations(entry, prefix));
  }
  for (const queueId of queueIds) if (!outcomeIds.has(queueId)) issues.push(`outcomes.missing_outcome_for:${queueId}`);
  issues.push(...findAuthorityTokens(outcomes, 'outcomes'));
  return [...new Set(issues)];
}

function sanitizeOutcome(entry) {
  return {
    queueItemId: entry.queueItemId,
    outcomeLabel: entry.outcomeLabel,
    operatorNoteRedacted: redactText(entry.operatorNote ?? ''),
    reasonCodes: asArray(entry.reasonCodes).slice(0, MAX_REASON_CODES).map((reason) => redactText(String(reason)).replace(/[^A-Z0-9_:-]/gi, '_').slice(0, 64)),
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
  };
}

export function operatorReviewOutcomeCaptureProtocol() {
  return {
    releaseLayer: 'v0.24.0-alpha',
    barrierCrossed: 'manual_operator_value_feedback_over_v23_queue',
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    boundedItems: MAX_ITEMS,
    redactionBeforePersist: true,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    valueFeedbackOnly: true,
    notPolicyArtifact: true,
    noToolExecution: true,
    noNetworkResourceFetch: true,
    noMemoryConfigWrites: true,
    noExternalEffects: true,
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
    allowedOutcomeLabels: OPERATOR_REVIEW_OUTCOME_LABELS
  };
}

export function buildOperatorReviewOutcomeCapture(queue, outcomes) {
  const queueIssues = validateQueue(queue);
  const outcomeIssues = queueIssues.length === 0 ? validateOutcomeInput(outcomes, queue.queueItems) : ['outcomes.skipped_until_queue_valid'];
  const validationIssues = [...queueIssues, ...outcomeIssues];
  const capturedOutcomes = validationIssues.length === 0
    ? outcomes.outcomes.map(sanitizeOutcome).sort((a, b) => a.queueItemId.localeCompare(b.queueItemId))
    : [];
  const artifact = {
    artifact: OPERATOR_REVIEW_OUTCOME_CAPTURE_ARTIFACT,
    schemaVersion: 'operator-review-outcome-capture-v0.24.0-alpha',
    releaseLayer: OPERATOR_REVIEW_OUTCOME_CAPTURE_VERSION,
    protocol: operatorReviewOutcomeCaptureProtocol(),
    captureStatus: validationIssues.length === 0 ? OUTCOME_COMPLETE : OUTCOME_DEGRADED,
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    boundedItems: MAX_ITEMS,
    redactionBeforePersist: true,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    valueFeedbackOnly: true,
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
    sourceQueueArtifact: queue?.artifact ?? null,
    sourceQueueStatus: queue?.queueStatus ?? null,
    sourceQueueItemCount: asArray(queue?.queueItems).length,
    validationIssues,
    capturedOutcomeCount: capturedOutcomes.length,
    capturedOutcomes
  };
  artifact.falseAuthorityLeakage = findAuthorityTokens({ captureStatus: artifact.captureStatus, capturedOutcomes: artifact.capturedOutcomes }, 'capture');
  artifact.reportMarkdown = operatorReviewOutcomeCaptureReport(artifact);
  return artifact;
}

export function operatorReviewOutcomeCaptureReport(capture) {
  const outcomes = capture.capturedOutcomes.length === 0
    ? ['- No operator feedback captured.']
    : capture.capturedOutcomes.map((entry) => `- ${entry.queueItemId}: label=${entry.outcomeLabel}; note=${entry.operatorNoteRedacted || 'none'}; reasons=${entry.reasonCodes.join(',') || 'none'}`);
  return [
    '# Operator Review Outcome Capture v0.24.5',
    '',
    '- Scope: local manual operator value feedback over v0.23 review queue items.',
    '- Boundary: non-authoritative, human-readable report only, not a policy or runtime artifact.',
    '- Capture status: ' + capture.captureStatus,
    '- Captured outcomes: ' + capture.capturedOutcomeCount + ' of ' + capture.sourceQueueItemCount,
    '- Labels: ' + OPERATOR_REVIEW_OUTCOME_LABELS.join(', '),
    '- Safety: policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false; rawPersisted: false; rawOutput: false',
    '- Redaction-before-persist: true; local files only; one-shot only.',
    '- Validation issues: ' + (capture.validationIssues.length ? capture.validationIssues.join(', ') : 'none'),
    '',
    '## Captured operator feedback',
    ...outcomes
  ].join('\n') + '\n';
}
