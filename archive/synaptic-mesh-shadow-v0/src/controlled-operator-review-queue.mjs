export const CONTROLLED_OPERATOR_REVIEW_QUEUE_VERSION = 'v0.23.5';
export const CONTROLLED_OPERATOR_REVIEW_QUEUE_ARTIFACT = 'T-synaptic-mesh-controlled-operator-review-queue-v0.23.5';

const READY = 'READY_FOR_OPERATOR_REVIEW';
const ABSTAIN = 'ABSTAIN_REQUIRES_OPERATOR_SOURCE_REVIEW';
const DEGRADED = 'DEGRADED_NO_QUEUE_GENERATED';

const FORBIDDEN_KEYS = Object.freeze([
  'authorization',
  'enforcement',
  'approvalBlockAllow',
  'toolExecution',
  'memoryConfigWrite',
  'memoryConfigWrites',
  'networkResourceFetch',
  'networkFetch',
  'resourceFetch',
  'externalEffects',
  'rawPersisted',
  'rawOutput',
  'agentConsumedOutput',
  'machineReadablePolicyDecision',
  'runtimeAuthority'
]);

const FORBIDDEN_CAPABILITY_VALUES = Object.freeze([
  'authorize',
  'approve',
  'allow',
  'block',
  'enforce',
  'execute',
  'mayAllow',
  'mayBlock',
  'toolExecution',
  'networkFetch',
  'networkResourceFetch',
  'resourceFetch',
  'memoryConfigWrite',
  'memoryConfigWrites',
  'externalEffects',
  'external_effect',
  'external_effects',
  'rawPersisted',
  'rawOutput',
  'raw_persisted',
  'raw_output',
  'runtimeAuthority',
  'runtime_authority',
  'policyDecision',
  'policy_decision',
  'machineReadablePolicyDecision'
]);

const PRIORITY_BY_CASE_TYPE = Object.freeze({
  useful_source_failure_allowed_with_explicit_threshold: 1,
  useful_valid_pass: 2,
  unspecified: 9
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

function fieldViolations(object, prefix) {
  const violations = [];
  if (!object || typeof object !== 'object') return violations;
  if (hasOwn(object, 'policyDecision') && object.policyDecision !== null) violations.push(`${prefix}.policyDecision_non_null`);
  for (const key of FORBIDDEN_KEYS) {
    if (object[key] === true) violations.push(`${prefix}.${key}_true`);
  }
  return violations;
}

function stringifyPrimitive(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function forbiddenCapabilityViolations(value, prefix = 'scorecard') {
  const violations = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => violations.push(...forbiddenCapabilityViolations(entry, `${prefix}[${index}]`)));
    return violations;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'reportMarkdown') continue;
      violations.push(...forbiddenCapabilityViolations(nested, `${prefix}.${key}`));
    }
    return violations;
  }
  const text = stringifyPrimitive(value).toLowerCase();
  if (!text) return violations;
  for (const token of FORBIDDEN_CAPABILITY_VALUES) {
    const pattern = new RegExp(`(^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (pattern.test(text)) violations.push(`${prefix}.forbidden_capability_token:${token}`);
  }
  return violations;
}

function validateCase(entry, index) {
  const prefix = `scorecard.cases[${index}]`;
  const violations = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [`${prefix}.malformed_case_not_object`];
  violations.push(...fieldViolations(entry, prefix));
  if (typeof entry.id !== 'string' || !entry.id.trim()) violations.push(`${prefix}.case_id_required`);
  if (typeof entry.caseType !== 'string' || !entry.caseType.trim()) violations.push(`${prefix}.case_type_required`);
  if (typeof entry.classification !== 'string' || !entry.classification.trim()) violations.push(`${prefix}.classification_required`);
  if (typeof entry.expectedUsefulness !== 'boolean') violations.push(`${prefix}.expected_usefulness_boolean_required`);
  if (typeof entry.observedPassToHumanReview !== 'boolean') violations.push(`${prefix}.observed_pass_boolean_required`);
  if (typeof entry.trueUsefulPass !== 'boolean') violations.push(`${prefix}.true_useful_pass_boolean_required`);
  if (typeof entry.falsePass !== 'boolean') violations.push(`${prefix}.false_pass_boolean_required`);
  if (!Array.isArray(entry.authorityViolations)) violations.push(`${prefix}.authority_violations_array_required`);
  if (!Array.isArray(entry.rejectionReasons)) violations.push(`${prefix}.rejection_reasons_array_required`);
  for (const violation of asArray(entry.authorityViolations)) violations.push(`${entry.id ?? prefix}.authority_violation:${violation}`);
  return violations;
}

function validateScorecard(scorecard) {
  const violations = [];
  if (!scorecard || typeof scorecard !== 'object') return ['malformed_scorecard_not_object'];
  if (scorecard.schemaVersion !== 'observed-usefulness-noise-scorecard-v0.22.0-alpha') violations.push('malformed_scorecard_schema_version');
  if (scorecard.nonAuthoritative !== true || scorecard.humanReadableOnly !== true || scorecard.scorecardOnly !== true) violations.push('malformed_scorecard_boundary_flags');
  if (!scorecard.metrics || typeof scorecard.metrics !== 'object') violations.push('malformed_scorecard_metrics');
  if (!Array.isArray(scorecard.cases)) violations.push('malformed_scorecard_cases');
  else scorecard.cases.forEach((entry, index) => {
    violations.push(...validateCase(entry, index));
    if (entry && typeof entry === 'object' && entry.trueUsefulPass === true) {
      violations.push(...forbiddenCapabilityViolations(entry, `scorecard.cases[${index}]`).map((violation) => `prequeue_${violation}`));
    }
  });
  if (!['advance', 'hold', 'degrade'].includes(scorecard.recommendation)) violations.push('malformed_scorecard_recommendation');
  if (scorecard.recommendationIsAuthority !== false) violations.push('recommendation_treated_as_authority');
  violations.push(...fieldViolations(scorecard, 'scorecard'));
  violations.push(...fieldViolations(scorecard.protocol, 'scorecard.protocol'));
  if ((scorecard.metrics?.falsePasses ?? 0) > 0) violations.push('scorecard_false_passes_present');
  if ((scorecard.metrics?.authorityViolations ?? 0) > 0) violations.push('scorecard_authority_violations_present');
  if ((scorecard.metrics?.falseValueWarnings ?? 0) > 0) violations.push('scorecard_false_value_warnings_present');
  if (scorecard.rawPersisted === true || scorecard.rawOutput === true) violations.push('raw_persist_or_output_enabled');
  return [...new Set(violations)];
}

function redactSummary(entry) {
  const safeParts = [
    `caseType=${entry.caseType ?? 'unspecified'}`,
    `classification=${entry.classification ?? 'none'}`,
    `expectedUsefulness=${entry.expectedUsefulness === true}`,
    `observedPass=${entry.observedPassToHumanReview === true}`
  ];
  const reasons = asArray(entry.rejectionReasons).slice(0, 4).join(',') || 'none';
  safeParts.push(`reasons=${reasons}`);
  return safeParts.join('; ');
}

function priorityFor(entry) {
  return PRIORITY_BY_CASE_TYPE[entry.caseType] ?? PRIORITY_BY_CASE_TYPE.unspecified;
}

function rationaleFor(entry) {
  if (entry.caseType === 'useful_source_failure_allowed_with_explicit_threshold') return 'Useful pass with isolated source failure threshold; review first for boundary clarity.';
  if (entry.caseType === 'useful_valid_pass') return 'Useful pass with clean observed queue signal; review for human value confirmation.';
  return 'Useful pass observed by v0.22 scorecard; review for operator prioritization only.';
}

function makeQueueItems(cases) {
  return cases
    .filter((entry) => entry.trueUsefulPass === true && entry.falsePass !== true && asArray(entry.authorityViolations).length === 0)
    .map((entry) => ({
      queueItemId: `operator-review-${entry.id}`,
      queueStatus: READY,
      priority: priorityFor(entry),
      sourceCaseId: entry.id,
      sourceCaseType: entry.caseType ?? 'unspecified',
      rationale: rationaleFor(entry),
      redactedSummary: redactSummary(entry),
      nonAuthoritative: true,
      humanReadableOnly: true,
      policyDecision: null,
      authorization: false,
      enforcement: false,
      approvalBlockAllow: false,
      toolExecution: false,
      externalEffects: false,
      rawPersisted: false,
      rawOutput: false,
      agentConsumedOutput: false,
      runtimeAuthority: false
    }))
    .sort((a, b) => a.priority - b.priority || a.sourceCaseId.localeCompare(b.sourceCaseId));
}

export function controlledOperatorReviewQueueProtocol() {
  return {
    releaseLayer: 'v0.23.0-alpha',
    barrierCrossed: 'local_controlled_operator_review_queue_from_v22_scorecard',
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    queueIsPrioritizationArtifactOnly: true,
    notDecisionApprovalQueue: true,
    noPolicyDecision: true,
    noAuthorization: true,
    noEnforcement: true,
    noAllowBlockApprove: true,
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

export function buildControlledOperatorReviewQueue(scorecard) {
  const validationIssues = validateScorecard(scorecard);
  const recommendation = scorecard?.recommendation ?? null;
  const shouldAbstainForRecommendation = recommendation === 'hold' || recommendation === 'degrade';
  const queueItems = validationIssues.length === 0 && !shouldAbstainForRecommendation ? makeQueueItems(scorecard.cases) : [];
  const queueStatus = validationIssues.length > 0 ? DEGRADED : shouldAbstainForRecommendation ? ABSTAIN : READY;
  const reviewBurden = {
    queueItemCount: queueItems.length,
    estimatedMinutes: queueItems.length * 7,
    qualitative: queueItems.length <= 3 ? 'low' : queueItems.length <= 6 ? 'medium' : 'high',
    sourceScorecardReviewBurden: scorecard?.metrics?.reviewBurdenEstimate ?? null
  };
  const artifact = {
    artifact: CONTROLLED_OPERATOR_REVIEW_QUEUE_ARTIFACT,
    schemaVersion: 'controlled-operator-review-queue-v0.23.0-alpha',
    releaseLayer: CONTROLLED_OPERATOR_REVIEW_QUEUE_VERSION,
    protocol: controlledOperatorReviewQueueProtocol(),
    queueStatus,
    queueIsPrioritizationArtifactOnly: true,
    notDecisionApprovalQueue: true,
    disabledByDefault: true,
    manualOperatorRunOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    oneShot: true,
    redactedEvidenceOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
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
    sourceScorecardArtifact: scorecard?.artifact ?? null,
    sourceScorecardRecommendation: recommendation,
    sourceRecommendationIsAuthority: false,
    validationIssues,
    abstainReason: validationIssues.length > 0 ? 'scorecard_failed_safety_validation' : shouldAbstainForRecommendation ? `scorecard_recommendation_${recommendation}` : null,
    reviewBurden,
    queueItems
  };
  artifact.capabilityTokenViolations = forbiddenCapabilityViolations(artifact).filter((violation) => !violation.includes('sourceScorecardRecommendation'));
  artifact.reportMarkdown = controlledOperatorReviewQueueReport(artifact);
  return artifact;
}

export function controlledOperatorReviewQueueReport(queue) {
  const items = queue.queueItems.length === 0
    ? ['- No queue items generated.']
    : queue.queueItems.map((item) => `- ${item.queueItemId}: priority=${item.priority}; status=${item.queueStatus}; sourceCaseId=${item.sourceCaseId}; rationale=${item.rationale}; summary=${item.redactedSummary}`);
  return [
    '# Controlled Operator Review Queue v0.23.5',
    '',
    '- Scope: local human-review prioritization artifact over v0.22 scorecard cases.',
    '- Boundary: not a decision queue, not an approval queue, and not runtime authority.',
    '- Queue status: ' + queue.queueStatus,
    '- Source scorecard recommendation: ' + String(queue.sourceScorecardRecommendation) + ' (context only; not authority).',
    '- policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false; rawPersisted: false; rawOutput: false',
    '- Review burden: ' + queue.reviewBurden.qualitative + ' (' + queue.reviewBurden.queueItemCount + ' item(s), ~' + queue.reviewBurden.estimatedMinutes + ' minutes)',
    '- Abstain/degrade reason: ' + (queue.abstainReason ?? 'none'),
    '',
    '## Queue items',
    ...items
  ].join('\n') + '\n';
}
