import { readFile } from 'node:fs/promises';

export const PASSIVE_MEMORY_HANDOFF_CANDIDATE_SCORECARD_VERSION = 'v0.29.5';
export const PASSIVE_MEMORY_HANDOFF_CANDIDATE_SCORECARD_ARTIFACT = 'T-synaptic-mesh-passive-memory-handoff-candidate-scorecard-v0.29.5';
export const PASSIVE_MEMORY_HANDOFF_MIN_CANDIDATES = 4;

const CARD_TYPES = Object.freeze(['decision', 'project_rule', 'contradiction', 'stale_negative_context']);
const SAFE_TREATMENTS = Object.freeze([
  'carry_forward_candidate',
  'surface_contradiction_candidate',
  'stale_caution_candidate',
  'needs_more_evidence_candidate',
  'exclude_noise_candidate'
]);
const AUTHORITY_FIELD_NAMES = Object.freeze([
  'authorization', 'enforcement', 'approval', 'approvalBlockAllow', 'allow', 'block', 'approve',
  'toolExecution', 'networkFetch', 'networkResourceFetch', 'resourceFetch', 'memoryWrite',
  'memoryWrites', 'memoryConfigWrite', 'memoryConfigWrites', 'configWrite', 'configWrites',
  'externalEffects', 'externalEffect', 'rawPersisted', 'rawOutput', 'sourceText', 'agentConsumedOutput',
  'agentConsumedPolicyDecision', 'machineReadablePolicyDecision', 'runtimeAuthority', 'runtimeIntegration',
  'autonomousRuntime', 'daemon', 'watch', 'mayAllow', 'mayBlock'
]);
const AUTHORITY_TOKENS = Object.freeze([
  'approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit',
  'enforce', 'enforcement', 'execute', 'toolExecution', 'networkFetch', 'networkResourceFetch',
  'resourceFetch', 'memoryWrite', 'memoryConfigWrite', 'memoryConfigWrites', 'configWrite',
  'externalEffects', 'rawPersisted', 'rawOutput', 'sourceText', 'runtimeAuthority', 'runtimeIntegration',
  'autonomousRuntime', 'agentConsumedPolicyDecision', 'policyDecision', 'policy_decision',
  'machineReadablePolicyDecision', 'mayAllow', 'mayBlock'
]);

const EXPECTED_RECALL_ARTIFACT = 'T-synaptic-mesh-passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5';
const EXPECTED_RECALL_RELEASE_LAYER = 'v0.28.5';
const EXPECTED_RECALL_METRICS = Object.freeze({
  cardCount: 4,
  evidenceCount: 5,
  sourceArtifactCount: 1,
  usefulRecallRatio: 0.75,
  contradictionSurfacingRatio: 1,
  staleNegativeMarkedRatio: 1,
  sourceBoundMatchRatio: 1,
  irrelevantMatchRatio: 0,
  boundaryViolationCount: 0,
  policyDecision: null
});
const EXPECTED_RECALL_BINDINGS = Object.freeze([
  {
    cardId: 'card-north-star-decision',
    cardType: 'decision',
    bestSignal: 'useful',
    useful: true,
    contradictionSurfaced: false,
    staleMarked: false,
    evidenceId: 'evidence-v027-repeatability',
    signal: 'useful',
    sourceArtifactId: 'T-synaptic-mesh-passive-memory-recall-source-anchors-v0.28.1',
    sourceAnchorId: 'anchor-north-star-decision',
    anchorExcerptSha256: '581cd5c7cea4ec7be5eed5d79e8b70d5111eebdb47e5cce6db4d526308247b18',
    evidenceSha256: '9d13d672102c295eb5fe96f947b690e2f8421c1797858cd5cc21ea12c7914a87',
    stale: false,
    contradiction: false
  },
  {
    cardId: 'card-boundary-project-rule',
    cardType: 'project_rule',
    bestSignal: 'useful',
    useful: true,
    contradictionSurfaced: false,
    staleMarked: false,
    evidenceId: 'evidence-boundary-project-rule',
    signal: 'useful',
    sourceArtifactId: 'T-synaptic-mesh-passive-memory-recall-source-anchors-v0.28.1',
    sourceAnchorId: 'anchor-boundary-project-rule',
    anchorExcerptSha256: 'd79bf2ecb473e23bcdfe2169fb1ff689557081825ea9485659c191acb8ac36bd',
    evidenceSha256: '0ded7891f98946eabb615852f439ce46869f0bdc9477ba7d436534fc833c3013',
    stale: false,
    contradiction: false
  },
  {
    cardId: 'card-readiness-theater-contradiction',
    cardType: 'contradiction',
    bestSignal: 'contradiction',
    useful: false,
    contradictionSurfaced: true,
    staleMarked: false,
    evidenceId: 'evidence-readiness-theater-contradiction',
    signal: 'contradiction',
    sourceArtifactId: 'T-synaptic-mesh-passive-memory-recall-source-anchors-v0.28.1',
    sourceAnchorId: 'anchor-readiness-theater-contradiction',
    anchorExcerptSha256: '7f2d583f1290d44c9b73db702f48726720057cad3cee56253784d6b27342ae8b',
    evidenceSha256: '46f3534a77ecc879e55f92318ef78b9745896ee772666c64f5d61329f5759fa4',
    stale: false,
    contradiction: true
  },
  {
    cardId: 'card-stale-rag-negative-context',
    cardType: 'stale_negative_context',
    bestSignal: 'useful',
    useful: true,
    contradictionSurfaced: false,
    staleMarked: true,
    evidenceId: 'evidence-stale-generic-rag-context',
    signal: 'useful',
    sourceArtifactId: 'T-synaptic-mesh-passive-memory-recall-source-anchors-v0.28.1',
    sourceAnchorId: 'anchor-stale-generic-rag-context',
    anchorExcerptSha256: '11c9fed89d972100d45fadbafc7eea08c5c3668f223c1ca2b1f2ccd7bfbcc121',
    evidenceSha256: 'af4b16694944998de4bc36f4b06b2f51e24c8e9b8d18842abfccb5cdc5615eee',
    stale: true,
    contradiction: false
  }
]);

function asArray(value) { return Array.isArray(value) ? value : []; }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function escapeRe(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function tokenPattern(token) { return new RegExp(`(^|[^A-Za-z0-9])${escapeRe(token)}([^A-Za-z0-9]|$)`, 'i'); }
function containsAuthorityToken(value) { return typeof value === 'string' && AUTHORITY_TOKENS.some((token) => tokenPattern(token).test(value)); }
function redactAuthorityString(value) { return containsAuthorityToken(value) ? '[authority-token-redacted]' : String(value ?? ''); }
function ratio(numerator, denominator) { return denominator > 0 ? Number((numerator / denominator).toFixed(4)) : 0; }

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
  for (const token of AUTHORITY_TOKENS) if (tokenPattern(token).test(value)) issues.push(`${prefix}.authority_token_detected`);
  return issues;
}

function findReportTokens(text, prefix) {
  if (typeof text !== 'string') return [];
  const sanitized = text
    .replace(/policyDecision\s*:\s*null/gi, '')
    .replace(/recommendationIsAuthority\s*:\s*false/gi, '')
    .replace(/(?:agentConsumedOutput|toolExecution|externalEffects|rawPersisted|rawOutput|runtimeIntegration)\s*:\s*false/gi, '')
    .replace(/notRuntimeInstruction\s*:\s*true/gi, '');
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
  if (hasOwn(value, 'recommendationIsAuthority') && value.recommendationIsAuthority !== false) issues.push(`${prefix}.recommendation_treated_as_authority`);
  for (const key of AUTHORITY_FIELD_NAMES) if (hasOwn(value, key) && value[key] !== false) issues.push(`${prefix}.forbidden_boundary_field_set`);
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'reportMarkdown') continue;
    issues.push(...boundaryViolations(nested, `${prefix}.${key}`));
  }
  return issues;
}

export function passiveMemoryHandoffCandidateScorecardProtocol() {
  return {
    releaseLayer: 'v0.29.0-alpha',
    barrierCrossed: 'passive_memory_handoff_candidate_scorecard_for_ai_continuity',
    buildsOn: 'v0.28.5_passive_memory_recall_usefulness_probe',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyCompletedRedactedRecallProbeArtifact: true,
    producesHumanReviewHandoffCandidates: true,
    measuresWhatMayReturnToContextWithoutRuntimeConsumption: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null
  };
}

export async function readPassiveMemoryHandoffInput(path) {
  const parsed = JSON.parse(await readFile(path, 'utf8'));
  return { recallArtifact: parsed };
}


function validateExpectedRecallArtifact(recall) {
  const issues = [];
  if (recall.artifact !== EXPECTED_RECALL_ARTIFACT) issues.push('recallArtifact.artifact_not_expected_v0.28_reviewer_package');
  if (recall.releaseLayer !== EXPECTED_RECALL_RELEASE_LAYER) issues.push('recallArtifact.release_layer_not_v0.28.5');
  if (recall.recommendation !== 'ADVANCE_OBSERVATION_ONLY') issues.push('recallArtifact.recommendation_not_expected_observation_only');
  if (recall.reportMarkdown && typeof recall.reportMarkdown === 'string') {
    for (const phrase of ['Passive Memory Recall Usefulness Probe v0.28.5', 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE', 'sourceBoundMatchRatio=1', 'irrelevantMatchRatio=0', 'policyDecision: null']) {
      if (!recall.reportMarkdown.includes(phrase)) issues.push(`recallArtifact.report_missing:${phrase}`);
    }
  } else issues.push('recallArtifact.report_markdown_required');
  if (Array.isArray(recall.validationIssues) && recall.validationIssues.length !== 0) issues.push('recallArtifact.prior_validation_issues_present');
  if (isPlainObject(recall.metrics)) {
    for (const [key, expected] of Object.entries(EXPECTED_RECALL_METRICS)) if (recall.metrics[key] !== expected) issues.push(`recallArtifact.metrics.${key}_not_expected`);
  }
  if (isPlainObject(recall.coverage)) for (const type of CARD_TYPES) if (recall.coverage[type] !== 1) issues.push(`recallArtifact.coverage.${type}_not_expected`);
  const summaries = asArray(recall.cardSummaries);
  if (summaries.length !== EXPECTED_RECALL_BINDINGS.length) issues.push('recallArtifact.card_summaries_not_exact_expected_count');
  const byCardId = new Map(summaries.map((summary) => [summary?.cardId, summary]));
  for (const expected of EXPECTED_RECALL_BINDINGS) {
    const summary = byCardId.get(expected.cardId);
    if (!summary) {
      issues.push(`recallArtifact.expected_card_missing:${expected.cardId}`);
      continue;
    }
    if (summary.cardType !== expected.cardType) issues.push(`recallArtifact.${expected.cardId}.card_type_not_expected`);
    if (summary.bestSignal !== expected.bestSignal) issues.push(`recallArtifact.${expected.cardId}.best_signal_not_expected`);
    if (summary.useful !== expected.useful) issues.push(`recallArtifact.${expected.cardId}.useful_not_expected`);
    if (summary.contradictionSurfaced !== expected.contradictionSurfaced) issues.push(`recallArtifact.${expected.cardId}.contradiction_not_expected`);
    if (summary.staleMarked !== expected.staleMarked) issues.push(`recallArtifact.${expected.cardId}.stale_not_expected`);
    if (summary.matchCount !== 1) issues.push(`recallArtifact.${expected.cardId}.match_count_not_expected`);
    const matches = asArray(summary.matches);
    if (matches.length !== 1) {
      issues.push(`recallArtifact.${expected.cardId}.matches_not_exact_expected_count`);
      continue;
    }
    const match = matches[0];
    if (match.evidenceId !== expected.evidenceId) issues.push(`recallArtifact.${expected.cardId}.evidence_id_not_expected`);
    if (match.signal !== expected.signal) issues.push(`recallArtifact.${expected.cardId}.signal_not_expected`);
    if (match.sourceBound !== true) issues.push(`recallArtifact.${expected.cardId}.source_not_bound`);
    if (asArray(match.sourceBindingIssues).length !== 0) issues.push(`recallArtifact.${expected.cardId}.source_binding_issues_present`);
    if (match.sourceArtifactId !== expected.sourceArtifactId) issues.push(`recallArtifact.${expected.cardId}.source_artifact_not_expected`);
    if (match.sourceAnchorId !== expected.sourceAnchorId) issues.push(`recallArtifact.${expected.cardId}.source_anchor_not_expected`);
    if (match.anchorExcerptSha256 !== expected.anchorExcerptSha256) issues.push(`recallArtifact.${expected.cardId}.anchor_digest_not_expected`);
    if (match.evidenceSha256 !== expected.evidenceSha256) issues.push(`recallArtifact.${expected.cardId}.evidence_digest_not_expected`);
    if (match.stale !== expected.stale) issues.push(`recallArtifact.${expected.cardId}.stale_match_not_expected`);
    if (match.contradiction !== expected.contradiction) issues.push(`recallArtifact.${expected.cardId}.contradiction_match_not_expected`);
    if (match.policyDecision !== null) issues.push(`recallArtifact.${expected.cardId}.match_policyDecision_non_null`);
  }
  for (const summary of summaries) if (!EXPECTED_RECALL_BINDINGS.some((expected) => expected.cardId === summary?.cardId)) issues.push(`recallArtifact.unexpected_card:${redactAuthorityString(summary?.cardId ?? 'missing')}`);
  return issues;
}

export function validatePassiveMemoryHandoffCandidateInput(input = {}) {
  const issues = [];
  if (!isPlainObject(input)) return ['input.malformed_not_object'];
  const recall = input.recallArtifact;
  if (!isPlainObject(recall)) issues.push('recallArtifact.explicit_object_required');
  else {
    if (recall.probeStatus !== 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE') issues.push('recallArtifact.probe_status_not_complete');
    if (recall.policyDecision !== null) issues.push('recallArtifact.policyDecision_non_null');
    if (recall.recommendationIsAuthority !== false) issues.push('recallArtifact.recommendation_treated_as_authority');
    if (recall.humanReadableReportOnly !== true || recall.nonAuthoritative !== true) issues.push('recallArtifact.boundary_flags_missing');
    issues.push(...validateExpectedRecallArtifact(recall));
    if (!isPlainObject(recall.metrics)) issues.push('recallArtifact.metrics_required');
    else {
      if (recall.metrics.sourceBoundMatchRatio !== 1) issues.push('recallArtifact.source_bound_ratio_not_one');
      if (recall.metrics.contradictionSurfacingRatio !== 1) issues.push('recallArtifact.contradiction_ratio_not_one');
      if (recall.metrics.staleNegativeMarkedRatio !== 1) issues.push('recallArtifact.stale_ratio_not_one');
      if (recall.metrics.irrelevantMatchRatio !== 0) issues.push('recallArtifact.noise_match_ratio_not_zero');
      if (recall.metrics.boundaryViolationCount !== 0) issues.push('recallArtifact.boundary_violations_present');
    }
    if (!Array.isArray(recall.cardSummaries) || recall.cardSummaries.length < PASSIVE_MEMORY_HANDOFF_MIN_CANDIDATES) issues.push('recallArtifact.card_summaries_min_four_required');
    else {
      const coverage = coverageByType(recall.cardSummaries);
      for (const type of CARD_TYPES) if ((coverage[type] ?? 0) < 1) issues.push(`recallArtifact.missing_card_type:${type}`);
      recall.cardSummaries.forEach((summary, index) => issues.push(...validateRecallCardSummary(summary, `recallArtifact.cardSummaries[${index}]`)));
    }
  }
  if (input.recommendationIsAuthority === true) issues.push('input.recommendation_treated_as_authority');
  if (input.rawPersist === true || input.rawOutput === true || input.persistRaw === true) issues.push('input.raw_persistence_or_output_requested');
  if (input.externalEffects === true || input.networkFetch === true || input.resourceFetch === true || input.toolExecution === true) issues.push('input.external_or_tool_effect_requested');
  if (input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if (input.daemon === true || input.watch === true || input.autonomousRuntime === true || input.runtimeIntegration === true) issues.push('input.runtime_or_daemon_requested');
  issues.push(...boundaryViolations(input, 'input'));
  issues.push(...findAuthorityTokens(input, 'input'));
  return [...new Set(issues)];
}

function validateRecallCardSummary(summary, prefix) {
  const issues = [];
  if (!isPlainObject(summary)) return [`${prefix}.malformed_card_summary`];
  if (typeof summary.cardId !== 'string' || !summary.cardId.trim()) issues.push(`${prefix}.card_id_required`);
  if (!CARD_TYPES.includes(summary.cardType)) issues.push(`${prefix}.card_type_invalid`);
  if (typeof summary.bestSignal !== 'string') issues.push(`${prefix}.best_signal_required`);
  if (!Number.isFinite(summary.matchCount) || summary.matchCount < 1) issues.push(`${prefix}.match_count_required`);
  const matches = asArray(summary.matches);
  if (matches.length < 1) issues.push(`${prefix}.matches_required`);
  if (matches.some((match) => match?.sourceBound !== true)) issues.push(`${prefix}.unsourced_match`);
  if (summary.cardType === 'contradiction' && summary.contradictionSurfaced !== true) issues.push(`${prefix}.contradiction_not_surfaced`);
  if (summary.cardType === 'stale_negative_context' && summary.staleMarked !== true) issues.push(`${prefix}.stale_context_not_marked`);
  for (const [index, match] of matches.entries()) {
    if (!match?.evidenceId) issues.push(`${prefix}.matches[${index}].evidence_id_required`);
    if (!match?.sourceArtifactId || !match?.sourceAnchorId || !match?.anchorExcerptSha256) issues.push(`${prefix}.matches[${index}].source_anchor_required`);
    if (match?.policyDecision !== null) issues.push(`${prefix}.matches[${index}].policyDecision_non_null`);
  }
  return issues;
}

function coverageByType(cardSummaries) {
  const coverage = Object.fromEntries(CARD_TYPES.map((type) => [type, 0]));
  for (const card of asArray(cardSummaries)) if (CARD_TYPES.includes(card?.cardType)) coverage[card.cardType] += 1;
  return coverage;
}

function treatmentFor(summary) {
  if (summary.cardType === 'contradiction') return 'surface_contradiction_candidate';
  if (summary.cardType === 'stale_negative_context') return 'stale_caution_candidate';
  if (summary.bestSignal === 'useful') return 'carry_forward_candidate';
  if (summary.bestSignal === 'irrelevant') return 'exclude_noise_candidate';
  return 'needs_more_evidence_candidate';
}

function rationaleFor(summary, treatment) {
  if (treatment === 'surface_contradiction_candidate') return 'Surface contradiction evidence for human continuity review before context reuse.';
  if (treatment === 'stale_caution_candidate') return 'Keep stale negative context visible as caution, not as fresh instruction.';
  if (treatment === 'exclude_noise_candidate') return 'Treat noise as excluded from the human handoff summary.';
  if (treatment === 'carry_forward_candidate') return 'Carry forward source-bound continuity evidence for human review.';
  return 'Hold for more evidence before adding this memory to a handoff summary.';
}

function buildCandidates(cardSummaries) {
  return asArray(cardSummaries).map((summary) => {
    const treatment = treatmentFor(summary);
    const matches = asArray(summary.matches);
    return {
      candidateId: `handoff-${redactAuthorityString(summary.cardId)}`,
      cardId: redactAuthorityString(summary.cardId),
      cardType: redactAuthorityString(summary.cardType),
      treatment,
      rationale: rationaleFor(summary, treatment),
      sourceBound: matches.length > 0 && matches.every((match) => match.sourceBound === true),
      contradictionFlagged: summary.cardType === 'contradiction' && summary.contradictionSurfaced === true,
      staleCautionFlagged: summary.cardType === 'stale_negative_context' && summary.staleMarked === true,
      matchedEvidenceIds: matches.map((match) => redactAuthorityString(match.evidenceId)),
      sourceAnchors: matches.map((match) => ({
        evidenceId: redactAuthorityString(match.evidenceId),
        sourceArtifactId: redactAuthorityString(match.sourceArtifactId),
        sourceAnchorId: redactAuthorityString(match.sourceAnchorId),
        anchorExcerptSha256: redactAuthorityString(match.anchorExcerptSha256),
        policyDecision: null
      })),
      humanReviewOnly: true,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      policyDecision: null
    };
  });
}

function buildMetrics(candidates, recallMetrics, boundaryViolationCount) {
  const matchedEvidenceIds = new Set(candidates.flatMap((candidate) => candidate.matchedEvidenceIds));
  const evidenceCount = recallMetrics?.evidenceCount ?? matchedEvidenceIds.size;
  const noiseSuppressedCount = Math.max(0, evidenceCount - matchedEvidenceIds.size);
  const contradictionCandidates = candidates.filter((candidate) => candidate.cardType === 'contradiction');
  const staleCandidates = candidates.filter((candidate) => candidate.cardType === 'stale_negative_context');
  const actionableCandidates = candidates.filter((candidate) => candidate.treatment !== 'needs_more_evidence_candidate');
  return {
    candidateCount: candidates.length,
    carryForwardCandidateCount: candidates.filter((candidate) => candidate.treatment === 'carry_forward_candidate').length,
    contradictionCandidateCount: contradictionCandidates.length,
    staleCautionCandidateCount: staleCandidates.length,
    sourceBoundCandidateRatio: ratio(candidates.filter((candidate) => candidate.sourceBound).length, candidates.length),
    contradictionFlagRatio: ratio(contradictionCandidates.filter((candidate) => candidate.contradictionFlagged).length, contradictionCandidates.length),
    staleCautionRatio: ratio(staleCandidates.filter((candidate) => candidate.staleCautionFlagged).length, staleCandidates.length),
    noiseSuppressedCount,
    noiseSuppressionRatio: evidenceCount > matchedEvidenceIds.size ? 1 : 0,
    humanReviewCandidateRatio: ratio(actionableCandidates.length, candidates.length),
    boundaryViolationCount,
    policyDecision: null
  };
}

function validateCandidateOutcomes(candidates) {
  const issues = [];
  for (const candidate of candidates) {
    if (!SAFE_TREATMENTS.includes(candidate.treatment)) issues.push(`candidates.${candidate.cardId}.treatment_invalid`);
    if (candidate.sourceBound !== true) issues.push(`candidates.${candidate.cardId}.source_not_bound`);
    if (candidate.cardType === 'contradiction' && candidate.contradictionFlagged !== true) issues.push(`candidates.${candidate.cardId}.contradiction_not_flagged`);
    if (candidate.cardType === 'stale_negative_context' && candidate.staleCautionFlagged !== true) issues.push(`candidates.${candidate.cardId}.stale_caution_not_flagged`);
    if (candidate.agentConsumedOutput !== false || candidate.policyDecision !== null || candidate.recommendationIsAuthority !== false) issues.push(`candidates.${candidate.cardId}.boundary_flags_invalid`);
  }
  return issues;
}

function validateMetrics(metrics, prefix = 'artifact.metrics') {
  const issues = [];
  const ratioKeys = ['sourceBoundCandidateRatio', 'contradictionFlagRatio', 'staleCautionRatio', 'noiseSuppressionRatio', 'humanReviewCandidateRatio'];
  for (const [key, value] of Object.entries(metrics ?? {})) {
    if (key === 'policyDecision') {
      if (value !== null) issues.push(`${prefix}.${key}_non_null`);
      continue;
    }
    if (!Number.isFinite(value) || value < 0) issues.push(`${prefix}.${key}_invalid`);
    if (ratioKeys.includes(key) && value > 1) issues.push(`${prefix}.${key}_invalid`);
  }
  return issues;
}

function recommendationFor(metrics, validationIssues) {
  if (validationIssues.length > 0) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.candidateCount < PASSIVE_MEMORY_HANDOFF_MIN_CANDIDATES) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.boundaryViolationCount > 0) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.sourceBoundCandidateRatio === 1 && metrics.contradictionFlagRatio === 1 && metrics.staleCautionRatio === 1 && metrics.noiseSuppressionRatio === 1 && metrics.humanReviewCandidateRatio === 1) return 'ADVANCE_OBSERVATION_ONLY';
  return 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveMemoryHandoffCandidates(input = {}) {
  const inputIssues = validatePassiveMemoryHandoffCandidateInput(input);
  const recall = input?.recallArtifact ?? {};
  const candidates = buildCandidates(asArray(recall.cardSummaries));
  const candidateIssues = validateCandidateOutcomes(candidates);
  const boundaryIssueCount = [...inputIssues, ...candidateIssues].filter((issue) => issue.includes('policyDecision') || issue.includes('authority') || issue.includes('raw') || issue.includes('effect') || issue.includes('write') || issue.includes('runtime') || issue.includes('daemon') || issue.includes('watch') || issue.includes('unsourced') || issue.includes('source')).length;
  const metrics = buildMetrics(candidates, recall.metrics, boundaryIssueCount);
  const metricIssues = validateMetrics(metrics, 'metrics');
  const validationIssues = [...new Set([...inputIssues, ...candidateIssues, ...metricIssues])];
  const recommendation = recommendationFor(metrics, validationIssues);
  const artifact = {
    artifact: PASSIVE_MEMORY_HANDOFF_CANDIDATE_SCORECARD_ARTIFACT,
    schemaVersion: 'passive-memory-handoff-candidate-scorecard-v0.29.0-alpha',
    releaseLayer: PASSIVE_MEMORY_HANDOFF_CANDIDATE_SCORECARD_VERSION,
    protocol: passiveMemoryHandoffCandidateScorecardProtocol(),
    handoffStatus: validationIssues.length === 0 ? 'MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE' : 'DEGRADED_MEMORY_HANDOFF_CANDIDATE_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyCompletedRedactedRecallProbeArtifact: true,
    humanReadableReportOnly: true,
    humanReviewOnly: true,
    nonAuthoritative: true,
    recommendation,
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null,
    validationIssues,
    metrics,
    coverage: coverageByType(asArray(recall.cardSummaries)),
    candidates,
    rawSourceCache: 'excluded',
    rawPersisted: false
  };
  artifact.reportMarkdown = passiveMemoryHandoffCandidateScorecardReport(artifact);
  return artifact;
}

export function validatePassiveMemoryHandoffCandidateArtifact(artifact) {
  const issues = [];
  if (!isPlainObject(artifact)) return ['artifact.malformed_not_object'];
  if (artifact.schemaVersion !== 'passive-memory-handoff-candidate-scorecard-v0.29.0-alpha') issues.push('artifact.schema_version_invalid');
  if (!['MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE', 'DEGRADED_MEMORY_HANDOFF_CANDIDATE_SCORECARD'].includes(artifact.handoffStatus)) issues.push('artifact.handoff_status_invalid');
  if (artifact.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if (artifact.recommendationIsAuthority !== false) issues.push('artifact.recommendation_treated_as_authority');
  if (artifact.agentConsumedOutput !== false || artifact.notRuntimeInstruction !== true) issues.push('artifact.runtime_boundary_flags_missing');
  if (artifact.humanReadableReportOnly !== true || artifact.nonAuthoritative !== true) issues.push('artifact.boundary_flags_missing');
  if (!isPlainObject(artifact.metrics)) issues.push('artifact.metrics_missing');
  else issues.push(...validateMetrics(artifact.metrics));
  issues.push(...boundaryViolations(artifact, 'artifact'));
  issues.push(...findAuthorityTokens(artifact, 'artifact'));
  issues.push(...findReportTokens(artifact.reportMarkdown ?? '', 'artifact.reportMarkdown'));
  return [...new Set(issues)];
}

export function passiveMemoryHandoffCandidateScorecardReport(artifact) {
  return [
    '# Passive Memory Handoff Candidate Scorecard v0.29.5',
    '',
    `handoffStatus: ${artifact.handoffStatus}`,
    `candidateCount=${artifact.metrics.candidateCount}`,
    `carryForwardCandidateCount=${artifact.metrics.carryForwardCandidateCount}`,
    `contradictionCandidateCount=${artifact.metrics.contradictionCandidateCount}`,
    `staleCautionCandidateCount=${artifact.metrics.staleCautionCandidateCount}`,
    `sourceBoundCandidateRatio=${artifact.metrics.sourceBoundCandidateRatio}`,
    `contradictionFlagRatio=${artifact.metrics.contradictionFlagRatio}`,
    `staleCautionRatio=${artifact.metrics.staleCautionRatio}`,
    `noiseSuppressedCount=${artifact.metrics.noiseSuppressedCount}`,
    `noiseSuppressionRatio=${artifact.metrics.noiseSuppressionRatio}`,
    `humanReviewCandidateRatio=${artifact.metrics.humanReviewCandidateRatio}`,
    `boundaryViolationCount=${artifact.metrics.boundaryViolationCount}`,
    `recommendation: ${artifact.recommendation}`,
    `recommendationIsAuthority=false`,
    `agentConsumedOutput=false`,
    `notRuntimeInstruction=true`,
    `policyDecision: null`,
    '',
    'Human-readable local handoff candidates only. This scorecard does not write memory, does not feed a runtime, and does not grant authority.',
    '',
    '## Candidates',
    ...artifact.candidates.map((candidate) => `- ${candidate.cardId}: ${candidate.treatment}; sourceBound=${candidate.sourceBound}; contradictionFlagged=${candidate.contradictionFlagged}; staleCautionFlagged=${candidate.staleCautionFlagged}`),
    '',
    '## Validation issues',
    ...(artifact.validationIssues.length ? artifact.validationIssues.map((issue) => `- ${issue}`) : ['- none']),
    ''
  ].join('\n');
}
