export const OBSERVED_USEFULNESS_NOISE_SCORECARD_VERSION = 'v0.22.5';
export const OBSERVED_USEFULNESS_NOISE_SCORECARD_ARTIFACT = 'T-synaptic-mesh-observed-usefulness-noise-scorecard-v0.22.5';

const FORBIDDEN_AUTHORITY_KEYS = Object.freeze([
  'policyDecision',
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

export function observedUsefulnessNoiseScorecardProtocol() {
  return {
    releaseLayer: 'v0.22.0-alpha',
    barrierCrossed: 'observed_usefulness_and_noise_scorecard_over_v21_positive_gate_outputs',
    consumesPositiveUtilityPassGateOutputs: true,
    humanReadableOnly: true,
    scorecardOnly: true,
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
    noPolicyDecision: true,
    noAuthorization: true,
    noEnforcement: true,
    noAllowBlockApprove: true,
    noToolExecution: true,
    noNetworkResourceFetch: true,
    noMemoryConfigWrites: true,
    noExternalEffects: true,
    noDaemonOrWatcher: true,
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
    agentConsumedOutput: false,
    machineReadablePolicyDecision: false,
    runtimeAuthority: false
  };
}

function isPass(output) {
  return output?.classification === 'PASS_TO_HUMAN_REVIEW' && output?.positiveUtilityGatePassed === true && output?.observationAccepted === true && output?.includedInReport === true && output?.readyForHumanReview === true;
}

const AUTHORITY_LANGUAGE_PATTERN = /\b(allow|block|approve|authorize|enforce)\b|policyDecision\s*:(?!\s*null\b)/i;

function authorityViolations(output) {
  const summary = output?.summary ?? {};
  const protocol = output?.protocol ?? {};
  const violations = [];
  if (summary.policyDecision != null || protocol.policyDecision != null || output?.policyDecision != null) violations.push('policy_decision_present');
  for (const key of FORBIDDEN_AUTHORITY_KEYS) {
    if (key === 'policyDecision') continue;
    if (summary[key] === true) violations.push('summary_authority_true:' + key);
    if (protocol[key] === true) violations.push('protocol_authority_true:' + key);
    if (output?.[key] === true) violations.push('output_authority_true:' + key);
  }
  if (typeof output?.recommendation === 'string' && AUTHORITY_LANGUAGE_PATTERN.test(output.recommendation)) violations.push('recommendation_authority_token');
  if (typeof output?.reportMarkdown === 'string' && AUTHORITY_LANGUAGE_PATTERN.test(output.reportMarkdown)) violations.push('report_authority_token');
  return [...new Set(violations)];
}

function boundedRatio(numerator, denominator) {
  if (denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}

function scoreRecommendation(metrics) {
  if (metrics.authorityViolations > 0 || metrics.falsePasses > 0 || metrics.falseValueWarnings > 0) return 'degrade';
  if (metrics.missedUsefulPasses > 0 || metrics.trueUsefulPasses === 0) return 'hold';
  if (metrics.passPrecision === 1 && metrics.noiseRejected >= 4) return 'advance';
  return 'hold';
}

export function scoreObservedUsefulnessNoise(cases = []) {
  const normalizedCases = cases.map((entry, index) => {
    const positivePass = isPass(entry.output);
    const expectedUseful = entry.expectedUsefulness === true;
    const expectedNoise = entry.expectedNoise === true || !expectedUseful;
    const violations = authorityViolations(entry.output);
    const falsePass = positivePass && !expectedUseful;
    const missedUsefulPass = !positivePass && expectedUseful;
    return {
      id: entry.id ?? `case-${index + 1}`,
      label: entry.label ?? entry.id ?? `case-${index + 1}`,
      caseType: entry.caseType ?? 'unspecified',
      expectedUsefulness: expectedUseful,
      expectedNoise,
      classification: entry.output?.classification ?? null,
      positiveUtilityGatePassed: entry.output?.positiveUtilityGatePassed === true,
      observedPassToHumanReview: positivePass,
      rejectionReasons: Array.isArray(entry.output?.rejectionReasons) ? entry.output.rejectionReasons : [],
      trueUsefulPass: positivePass && expectedUseful,
      falsePass,
      usefulReject: !positivePass && expectedUseful,
      missedUsefulPass,
      noisyReject: !positivePass && expectedNoise,
      authorityViolations: violations,
      valueWarning: falsePass || violations.length > 0,
      notes: entry.notes ?? ''
    };
  });

  const trueUsefulPasses = normalizedCases.filter((entry) => entry.trueUsefulPass).length;
  const falsePasses = normalizedCases.filter((entry) => entry.falsePass).length;
  const usefulRejects = normalizedCases.filter((entry) => entry.usefulReject).length;
  const missedUsefulPasses = normalizedCases.filter((entry) => entry.missedUsefulPass).length;
  const noisyRejects = normalizedCases.filter((entry) => entry.noisyReject).length;
  const noiseRejected = noisyRejects;
  const falseValueWarnings = normalizedCases.filter((entry) => entry.valueWarning).length;
  const authorityViolationCount = normalizedCases.reduce((sum, entry) => sum + entry.authorityViolations.length, 0);
  const passCount = normalizedCases.filter((entry) => entry.observedPassToHumanReview).length;
  const usefulExpected = normalizedCases.filter((entry) => entry.expectedUsefulness).length;
  const totalCases = normalizedCases.length;
  const metrics = {
    totalCases,
    expectedUsefulCases: usefulExpected,
    expectedNoiseCases: totalCases - usefulExpected,
    observedPasses: passCount,
    observedRejects: totalCases - passCount,
    trueUsefulPasses,
    falsePasses,
    usefulRejects,
    missedUsefulPasses,
    noisyRejects,
    noiseRejected,
    falseValueWarnings,
    authorityViolations: authorityViolationCount,
    passPrecision: boundedRatio(trueUsefulPasses, passCount),
    passUsefulness: boundedRatio(trueUsefulPasses, usefulExpected),
    noiseRejectionRate: boundedRatio(noiseRejected, totalCases - usefulExpected),
    reviewBurdenEstimate: {
      passCount,
      warningCount: falseValueWarnings,
      reviewerQueueItems: passCount + falseValueWarnings,
      qualitative: passCount + falseValueWarnings <= 3 ? 'low' : passCount + falseValueWarnings <= 6 ? 'medium' : 'high'
    }
  };
  const recommendation = scoreRecommendation(metrics);
  return {
    artifact: OBSERVED_USEFULNESS_NOISE_SCORECARD_ARTIFACT,
    schemaVersion: 'observed-usefulness-noise-scorecard-v0.22.0-alpha',
    releaseLayer: OBSERVED_USEFULNESS_NOISE_SCORECARD_VERSION,
    scorecardOnly: true,
    humanReadableOnly: true,
    nonAuthoritative: true,
    classificationOnly: true,
    protocol: observedUsefulnessNoiseScorecardProtocol(),
    metrics,
    recommendation,
    recommendationIsAuthority: false,
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
    runtimeAuthority: false,
    cases: normalizedCases,
    reportMarkdown: observedUsefulnessNoiseReport({ metrics, recommendation, cases: normalizedCases })
  };
}

export function observedUsefulnessNoiseReport({ metrics, recommendation, cases }) {
  return [
    '# Observed Usefulness and Noise Scorecard v0.22.5',
    '',
    '- Scope: passive scorecard over v0.21 positive utility pass gate outputs.',
    '- Recommendation: ' + recommendation + ' (human-readable signal only; not authority).',
    '- policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false',
    '- trueUsefulPasses: ' + metrics.trueUsefulPasses,
    '- falsePasses: ' + metrics.falsePasses,
    '- usefulRejects: ' + metrics.usefulRejects,
    '- missedUsefulPasses: ' + metrics.missedUsefulPasses,
    '- noisyRejects: ' + metrics.noisyRejects,
    '- noiseRejected: ' + metrics.noiseRejected,
    '- falseValueWarnings: ' + metrics.falseValueWarnings,
    '- passPrecision: ' + String(metrics.passPrecision),
    '- passUsefulness: ' + String(metrics.passUsefulness),
    '- reviewBurdenEstimate: ' + metrics.reviewBurdenEstimate.qualitative + ' (' + metrics.reviewBurdenEstimate.reviewerQueueItems + ' queue items)',
    '',
    '## Case observations',
    ...cases.map((entry) => `- ${entry.id}: ${entry.caseType}; classification=${entry.classification}; expectedUsefulness=${entry.expectedUsefulness}; observedPass=${entry.observedPassToHumanReview}; reasons=${entry.rejectionReasons.join(',') || 'none'}`)
  ].join('\n') + '\n';
}
