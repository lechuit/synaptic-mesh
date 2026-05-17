import { createHash } from 'node:crypto';

export const PASSIVE_OBSERVATION_REPEATABILITY_VERSION = 'v0.27.5';
export const PASSIVE_OBSERVATION_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-observation-repeatability-scorecard-v0.27.5';
export const PASSIVE_OBSERVATION_REPEATABILITY_MIN_WINDOWS = 3;
export const PASSIVE_OBSERVATION_REPEATABILITY_MAX_WINDOWS = 6;

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
  'rawOutput', 'runtimeAuthority', 'policyDecision', 'policy_decision', 'machineReadablePolicyDecision',
  'mayAllow', 'mayBlock'
]);

function asArray(value) { return Array.isArray(value) ? value : []; }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function sha256(value) { return createHash('sha256').update(String(value ?? '')).digest('hex'); }
function tokenPattern(token) { return new RegExp(`(^|[^A-Za-z0-9])${token.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`, 'i'); }
function ratio(numerator, denominator) { return denominator > 0 ? Number((numerator / denominator).toFixed(3)) : 0; }
function numberOrNull(value) { return Number.isFinite(value) ? value : null; }

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

function validationIssueSummary(artifact) {
  return asArray(artifact?.validationIssues).map(String).slice(0, 8);
}

function validateWindowArtifact(window, prefix) {
  const issues = [];
  if (!isPlainObject(window)) return [`${prefix}.malformed_window_artifact`];
  if (window.schemaVersion !== 'passive-observation-window-v0.26.0-alpha') issues.push(`${prefix}.schema_version_invalid`);
  if (!['OBSERVATION_WINDOW_COMPLETE', 'DEGRADED_OBSERVATION_WINDOW'].includes(window.windowStatus)) issues.push(`${prefix}.window_status_invalid`);
  if (window.policyDecision !== null) issues.push(`${prefix}.policyDecision_non_null`);
  if (window.nonAuthoritative !== true || window.humanReadableReportOnly !== true || window.redactedEvidencePacketOnly !== true) issues.push(`${prefix}.boundary_flags_missing`);
  if (window.windowStatus === 'DEGRADED_OBSERVATION_WINDOW' && validationIssueSummary(window).length === 0) issues.push(`${prefix}.degraded_missing_cause`);
  issues.push(...boundaryViolations(window, prefix));
  issues.push(...findAuthorityTokens(window, prefix));
  return [...new Set(issues)];
}

export function passiveObservationRepeatabilityProtocol() {
  return {
    releaseLayer: 'v0.27.0-alpha',
    barrierCrossed: 'aggregate_multiple_bounded_passive_observation_windows_for_repeatability_only',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    boundedWindows: PASSIVE_OBSERVATION_REPEATABILITY_MAX_WINDOWS,
    acceptsOnlyRedactedV026WindowArtifacts: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendationIsAuthority: false,
    noRuntimeAuthority: true,
    policyDecision: null
  };
}

export function validatePassiveObservationRepeatabilityInput(input = {}) {
  const issues = [];
  if (!isPlainObject(input)) return ['input.malformed_not_object'];
  if (!Array.isArray(input.windows)) issues.push('windows.explicit_array_required');
  else {
    if (input.windows.length < PASSIVE_OBSERVATION_REPEATABILITY_MIN_WINDOWS) issues.push('windows.min_three_required');
    if (input.windows.length > PASSIVE_OBSERVATION_REPEATABILITY_MAX_WINDOWS) issues.push('windows.max_six_exceeded');
    input.windows.forEach((window, index) => issues.push(...validateWindowArtifact(window, `windows[${index}]`)));
  }
  if (input.recommendationIsAuthority === true) issues.push('input.recommendation_treated_as_authority');
  if (input.rawPersist === true || input.rawOutput === true || input.persistRaw === true) issues.push('input.raw_persistence_or_output_requested');
  if (input.externalEffects === true || input.networkFetch === true || input.toolExecution === true) issues.push('input.external_or_tool_effect_requested');
  issues.push(...boundaryViolations(input, 'input'));
  issues.push(...findAuthorityTokens(input, 'input'));
  return [...new Set(issues)];
}

function summarizeWindow(window, index) {
  const status = window?.windowStatus ?? 'MALFORMED';
  const completed = status === 'OBSERVATION_WINDOW_COMPLETE';
  const usefulRatioValue = numberOrNull(window?.valueSignal?.metrics?.usefulRatio);
  return {
    windowId: `window-${index + 1}`,
    status,
    completed,
    degraded: status === 'DEGRADED_OBSERVATION_WINDOW',
    degradationCause: status === 'DEGRADED_OBSERVATION_WINDOW' ? validationIssueSummary(window) : [],
    stageCount: asArray(window?.stageSummaries).length,
    valueScorecardStatus: window?.valueSignal?.scorecardStatus ?? null,
    usefulRatio: usefulRatioValue,
    recommendation: window?.valueSignal?.recommendation ?? null,
    artifactSha256: sha256(JSON.stringify(window ?? null)),
    rawPersisted: false,
    policyDecision: null
  };
}

function aggregateMetrics(windowSummaries, boundaryViolationCount) {
  const completed = windowSummaries.filter((window) => window.completed);
  const degraded = windowSummaries.filter((window) => window.degraded);
  const completedUsefulTotal = completed.reduce((sum, window) => sum + (Number.isFinite(window.usefulRatio) ? window.usefulRatio : 0), 0);
  const recommendationCounts = new Map();
  for (const window of completed) recommendationCounts.set(window.recommendation, (recommendationCounts.get(window.recommendation) ?? 0) + 1);
  const mostCommonRecommendationCount = Math.max(0, ...recommendationCounts.values());
  return {
    totalWindows: windowSummaries.length,
    completedWindows: completed.length,
    degradedWindows: degraded.length,
    usefulOutcomeRatio: ratio(completedUsefulTotal, completed.length),
    repeatabilityRatio: ratio(mostCommonRecommendationCount, completed.length),
    boundaryViolationCount,
    malformedWindowCount: windowSummaries.filter((window) => window.status === 'MALFORMED').length,
    policyDecision: null
  };
}

function recommendationFor(metrics) {
  if (metrics.boundaryViolationCount > 0) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.completedWindows < PASSIVE_OBSERVATION_REPEATABILITY_MIN_WINDOWS) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.repeatabilityRatio >= 0.66 && metrics.usefulOutcomeRatio >= 0.5) return 'ADVANCE_OBSERVATION_ONLY';
  return 'HOLD_FOR_MORE_EVIDENCE';
}

export function validatePassiveObservationRepeatabilityArtifact(artifact) {
  const issues = [];
  if (!isPlainObject(artifact)) return ['artifact.malformed_not_object'];
  if (artifact.schemaVersion !== 'passive-observation-repeatability-scorecard-v0.27.0-alpha') issues.push('artifact.schema_version_invalid');
  if (!['REPEATABILITY_SCORECARD_COMPLETE', 'DEGRADED_REPEATABILITY_SCORECARD'].includes(artifact.scorecardStatus)) issues.push('artifact.scorecard_status_invalid');
  if (artifact.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if (artifact.recommendationIsAuthority !== false) issues.push('artifact.recommendation_treated_as_authority');
  if (artifact.humanReadableReportOnly !== true || artifact.nonAuthoritative !== true) issues.push('artifact.boundary_flags_missing');
  if (!isPlainObject(artifact.metrics)) issues.push('artifact.metrics_missing');
  else for (const key of ['totalWindows', 'completedWindows', 'degradedWindows', 'usefulOutcomeRatio', 'repeatabilityRatio', 'boundaryViolationCount']) if (!Number.isFinite(artifact.metrics[key]) || artifact.metrics[key] < 0) issues.push(`artifact.metrics.${key}_invalid`);
  issues.push(...boundaryViolations(artifact, 'artifact'));
  issues.push(...findAuthorityTokens(artifact, 'artifact'));
  issues.push(...findReportTokens(artifact.reportMarkdown ?? '', 'artifact.reportMarkdown'));
  return [...new Set(issues)];
}

function buildScorecardArtifact({ status, validationIssues, windowSummaries, boundaryViolationCount }) {
  const metrics = aggregateMetrics(windowSummaries, boundaryViolationCount);
  const recommendation = recommendationFor(metrics);
  const artifact = {
    artifact: PASSIVE_OBSERVATION_REPEATABILITY_ARTIFACT,
    schemaVersion: 'passive-observation-repeatability-scorecard-v0.27.0-alpha',
    releaseLayer: PASSIVE_OBSERVATION_REPEATABILITY_VERSION,
    protocol: passiveObservationRepeatabilityProtocol(),
    scorecardStatus: status,
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyRedactedV026WindowArtifacts: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendation,
    recommendationIsAuthority: false,
    noRuntimeAuthority: true,
    policyDecision: null,
    validationIssues: [...new Set(validationIssues)],
    metrics,
    windowSummaries,
    redactedEvidenceOnly: true,
    rawSourceCache: 'excluded',
    rawPersisted: false
  };
  artifact.reportMarkdown = passiveObservationRepeatabilityReport(artifact);
  return artifact;
}

export function scorePassiveObservationRepeatability(input = {}) {
  const inputIssues = validatePassiveObservationRepeatabilityInput(input);
  const windowIssues = Array.isArray(input?.windows) ? input.windows.flatMap((window, index) => validateWindowArtifact(window, `windows[${index}]`)) : [];
  const windowSummaries = Array.isArray(input?.windows) ? input.windows.map(summarizeWindow) : [];
  const boundaryViolationCount = windowIssues.length;
  const preliminary = buildScorecardArtifact({
    status: inputIssues.length ? 'DEGRADED_REPEATABILITY_SCORECARD' : 'REPEATABILITY_SCORECARD_COMPLETE',
    validationIssues: inputIssues,
    windowSummaries,
    boundaryViolationCount
  });
  const artifactIssues = preliminary.scorecardStatus === 'REPEATABILITY_SCORECARD_COMPLETE' ? validatePassiveObservationRepeatabilityArtifact(preliminary) : [];
  if (artifactIssues.length) return buildScorecardArtifact({ status: 'DEGRADED_REPEATABILITY_SCORECARD', validationIssues: artifactIssues, windowSummaries, boundaryViolationCount: artifactIssues.length });
  return preliminary;
}

export function passiveObservationRepeatabilityReport(artifact) {
  const lines = asArray(artifact.windowSummaries).map((window) => `- ${window.windowId}: ${window.status}; usefulRatio=${String(window.usefulRatio)}; recommendation=${String(window.recommendation)}; policyDecision: null`);
  return [
    '# Passive Observation Repeatability Scorecard v0.27.5',
    '',
    '- Scorecard status: ' + artifact.scorecardStatus,
    '- Scope: aggregate bounded local/manual/operator-run passive observation window artifacts only.',
    '- Boundary: redacted artifacts only, human-readable signal only, non-authoritative, no runtime authority.',
    '- policyDecision: null',
    '- Recommendation: ' + artifact.recommendation + '; recommendationIsAuthority=false',
    '- Metrics: completedWindows=' + artifact.metrics.completedWindows + '; degradedWindows=' + artifact.metrics.degradedWindows + '; usefulOutcomeRatio=' + artifact.metrics.usefulOutcomeRatio + '; repeatabilityRatio=' + artifact.metrics.repeatabilityRatio + '; boundaryViolationCount=' + artifact.metrics.boundaryViolationCount,
    '- Validation issues: ' + (artifact.validationIssues.length ? artifact.validationIssues.join(', ') : 'none'),
    '',
    '## Window summaries',
    ...(lines.length ? lines : ['- No windows supplied.'])
  ].join('\n') + '\n';
}
