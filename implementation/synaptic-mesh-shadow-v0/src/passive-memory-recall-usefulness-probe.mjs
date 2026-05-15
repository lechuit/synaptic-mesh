import { createHash } from 'node:crypto';

export const PASSIVE_MEMORY_RECALL_USEFULNESS_VERSION = 'v0.28.5';
export const PASSIVE_MEMORY_RECALL_USEFULNESS_ARTIFACT = 'T-synaptic-mesh-passive-memory-recall-usefulness-probe-v0.28.5';
export const PASSIVE_MEMORY_RECALL_MIN_CARDS = 4;

const CARD_TYPES = Object.freeze(['decision', 'project_rule', 'contradiction', 'stale_negative_context']);
const EVIDENCE_SIGNALS = Object.freeze(['useful', 'irrelevant', 'contradiction']);
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

function asArray(value) { return Array.isArray(value) ? value : []; }
function isPlainObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function hasOwn(object, key) { return Object.prototype.hasOwnProperty.call(object ?? {}, key); }
function sha256(value) { return createHash('sha256').update(String(value ?? '')).digest('hex'); }
function escapeRe(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function tokenPattern(token) { return new RegExp(`(^|[^A-Za-z0-9])${escapeRe(token)}([^A-Za-z0-9]|$)`, 'i'); }
function ratio(numerator, denominator) { return denominator > 0 ? Number((numerator / denominator).toFixed(4)) : 0; }
function intersects(left, right) { const set = new Set(asArray(left).map(String)); return asArray(right).map(String).some((item) => set.has(item)); }

export function sourceAnchorDigest(redactedExcerpt) {
  return sha256(String(redactedExcerpt ?? ''));
}

export function evidenceSourceDigest({ sourceArtifactId, sourceArtifactPath, sourceAnchorId, redactedExcerpt }) {
  return sha256([sourceArtifactId, sourceArtifactPath, sourceAnchorId, redactedExcerpt].map((part) => String(part ?? '')).join('\n'));
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
    .replace(/recommendationIsAuthority\s*:\s*false/gi, '')
    .replace(/(?:toolExecution|agentConsumedOutput|externalEffects|rawPersisted|rawOutput|runtimeIntegration)\s*:\s*false/gi, '');
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
  for (const key of AUTHORITY_FIELD_NAMES) if (hasOwn(value, key) && value[key] !== false) issues.push(`${prefix}.${key}_not_false`);
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'reportMarkdown') continue;
    issues.push(...boundaryViolations(nested, `${prefix}.${key}`));
  }
  return issues;
}

export function passiveMemoryRecallUsefulnessProtocol() {
  return {
    releaseLayer: 'v0.28.0-alpha',
    barrierCrossed: 'passive_memory_recall_usefulness_probe_for_ai_continuity',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyRedactedObservationArtifactsAndNeedCards: true,
    verifiesSourceAnchorsAgainstRedactedArtifactContent: true,
    evaluatesDecisionsRulesContradictionsAndStaleNegativeContext: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendationIsAuthority: false,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null
  };
}

export function validatePassiveMemoryRecallUsefulnessInput(input = {}) {
  const issues = [];
  if (!isPlainObject(input)) return ['input.malformed_not_object'];
  if (!Array.isArray(input.cards)) issues.push('cards.explicit_array_required');
  else {
    if (input.cards.length < PASSIVE_MEMORY_RECALL_MIN_CARDS) issues.push('cards.min_four_required');
    input.cards.forEach((card, index) => issues.push(...validateCard(card, `cards[${index}]`)));
    const coverage = coverageByType(input.cards);
    for (const type of CARD_TYPES) if ((coverage[type] ?? 0) < 1) issues.push(`cards.missing_type:${type}`);
  }
  if (!Array.isArray(input.evidence)) issues.push('evidence.explicit_array_required');
  else input.evidence.forEach((entry, index) => issues.push(...validateEvidence(entry, `evidence[${index}]`)));
  if (!Array.isArray(input.sourceArtifacts)) issues.push('sourceArtifacts.explicit_array_required');
  else input.sourceArtifacts.forEach((entry, index) => issues.push(...validateSourceArtifact(entry, `sourceArtifacts[${index}]`)));
  if (input.recommendationIsAuthority === true) issues.push('input.recommendation_treated_as_authority');
  if (input.rawPersist === true || input.rawOutput === true || input.persistRaw === true) issues.push('input.raw_persistence_or_output_requested');
  if (input.externalEffects === true || input.networkFetch === true || input.resourceFetch === true || input.toolExecution === true) issues.push('input.external_or_tool_effect_requested');
  if (input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if (input.daemon === true || input.watch === true || input.autonomousRuntime === true || input.runtimeIntegration === true) issues.push('input.runtime_or_daemon_requested');
  issues.push(...boundaryViolations(input, 'input'));
  issues.push(...findAuthorityTokens(input, 'input'));
  return [...new Set(issues)];
}

function validateCard(card, prefix) {
  const issues = [];
  if (!isPlainObject(card)) return [`${prefix}.malformed_card`];
  if (typeof card.id !== 'string' || !card.id.trim()) issues.push(`${prefix}.id_required`);
  if (!CARD_TYPES.includes(card.type)) issues.push(`${prefix}.type_invalid`);
  if (typeof card.need !== 'string' || card.need.trim().length < 12) issues.push(`${prefix}.need_explicit_text_required`);
  if (!Array.isArray(card.expectedEvidenceIds) || card.expectedEvidenceIds.length === 0) issues.push(`${prefix}.expected_evidence_required`);
  return issues;
}

function validateEvidence(entry, prefix) {
  const issues = [];
  if (!isPlainObject(entry)) return [`${prefix}.malformed_evidence`];
  if (typeof entry.id !== 'string' || !entry.id.trim()) issues.push(`${prefix}.id_required`);
  if (!EVIDENCE_SIGNALS.includes(entry.signal)) issues.push(`${prefix}.signal_invalid`);
  if (entry.policyDecision !== null) issues.push(`${prefix}.policyDecision_non_null`);
  if (entry.redacted !== true) issues.push(`${prefix}.redacted_required`);
  if (!entry.sourceArtifactId || !entry.sourceArtifactPath || !entry.digest) issues.push(`${prefix}.source_binding_required`);
  if (!entry.sourceAnchorId || !entry.sourceAnchorDigest) issues.push(`${prefix}.source_anchor_required`);
  if (entry.sourceArtifactPath && !String(entry.sourceArtifactPath).startsWith('implementation/synaptic-mesh-shadow-v0/evidence/')) issues.push(`${prefix}.source_path_not_evidence_artifact`);
  return issues;
}

function validateSourceArtifact(entry, prefix) {
  const issues = [];
  if (!isPlainObject(entry)) return [`${prefix}.malformed_source_artifact`];
  if (typeof entry.sourceArtifactId !== 'string' || !entry.sourceArtifactId.trim()) issues.push(`${prefix}.source_artifact_id_required`);
  if (typeof entry.sourceArtifactPath !== 'string' || !entry.sourceArtifactPath.startsWith('implementation/synaptic-mesh-shadow-v0/evidence/')) issues.push(`${prefix}.source_path_not_evidence_artifact`);
  if (entry.policyDecision !== null) issues.push(`${prefix}.policyDecision_non_null`);
  if (entry.redacted !== true) issues.push(`${prefix}.redacted_required`);
  if (!Array.isArray(entry.anchors) || entry.anchors.length === 0) issues.push(`${prefix}.anchors_required`);
  else entry.anchors.forEach((anchor, index) => {
    if (!anchor?.id) issues.push(`${prefix}.anchors[${index}].id_required`);
    if (typeof anchor?.redactedExcerpt !== 'string' || anchor.redactedExcerpt.length < 20) issues.push(`${prefix}.anchors[${index}].redacted_excerpt_required`);
  });
  return issues;
}

function coverageByType(cards) {
  const coverage = Object.fromEntries(CARD_TYPES.map((type) => [type, 0]));
  for (const card of asArray(cards)) if (CARD_TYPES.includes(card?.type)) coverage[card.type] += 1;
  return coverage;
}

function normalizeCards(cards) {
  return asArray(cards).map((card, index) => ({
    id: String(card?.id ?? `card-${index}`),
    type: card?.type,
    need: String(card?.need ?? ''),
    expectedEvidenceIds: asArray(card?.expectedEvidenceIds).map(String),
    tags: asArray(card?.tags).map(String)
  }));
}

function sourceArtifactIndex(sourceArtifacts) {
  const map = new Map();
  for (const artifact of asArray(sourceArtifacts)) map.set(`${artifact?.sourceArtifactId ?? ''}\n${artifact?.sourceArtifactPath ?? ''}`, artifact);
  return map;
}

function verifySourceBinding(entry, sources) {
  const issues = [];
  const source = sources.get(`${entry?.sourceArtifactId ?? ''}\n${entry?.sourceArtifactPath ?? ''}`);
  if (!source) return { sourceBound: false, sourceBindingIssues: ['source_artifact_not_found'], anchorExcerptSha256: null };
  const anchor = asArray(source.anchors).find((candidate) => candidate?.id === entry?.sourceAnchorId);
  if (!anchor) issues.push('source_anchor_not_found');
  else {
    const expectedAnchorDigest = sourceAnchorDigest(anchor.redactedExcerpt);
    const expectedEvidenceDigest = evidenceSourceDigest({
      sourceArtifactId: source.sourceArtifactId,
      sourceArtifactPath: source.sourceArtifactPath,
      sourceAnchorId: anchor.id,
      redactedExcerpt: anchor.redactedExcerpt
    });
    if (entry.sourceAnchorDigest !== expectedAnchorDigest) issues.push('source_anchor_digest_mismatch');
    if (entry.digest !== expectedEvidenceDigest) issues.push('source_artifact_digest_mismatch');
  }
  return { sourceBound: issues.length === 0, sourceBindingIssues: issues, anchorExcerptSha256: anchor ? sourceAnchorDigest(anchor.redactedExcerpt) : null };
}

function normalizeEvidence(evidence, sourceArtifacts) {
  const sources = sourceArtifactIndex(sourceArtifacts);
  return asArray(evidence).map((entry, index) => {
    const binding = verifySourceBinding(entry, sources);
    return {
      id: String(entry?.id ?? `evidence-${index}`),
      signal: entry?.signal,
      sourceBound: binding.sourceBound,
      sourceBindingIssues: binding.sourceBindingIssues,
      sourceArtifactId: entry?.sourceArtifactId ?? null,
      sourceArtifactPath: entry?.sourceArtifactPath ?? null,
      sourceAnchorId: entry?.sourceAnchorId ?? null,
      sourceAnchorDigest: entry?.sourceAnchorDigest ?? null,
      digest: entry?.digest ?? null,
      tags: asArray(entry?.tags).map(String),
      stale: entry?.stale === true,
      contradicts: asArray(entry?.contradicts).map(String),
      redacted: entry?.redacted === true,
      artifactSha256: sha256(JSON.stringify(entry ?? null)),
      anchorExcerptSha256: binding.anchorExcerptSha256,
      policyDecision: null
    };
  });
}

function scoreCard(card, evidence) {
  const matches = evidence
    .filter((entry) => card.expectedEvidenceIds.includes(entry.id) || intersects(card.tags, entry.tags))
    .map((entry) => ({
      evidenceId: entry.id,
      signal: entry.signal,
      sourceBound: entry.sourceBound,
      sourceBindingIssues: entry.sourceBindingIssues,
      stale: entry.stale,
      contradiction: entry.signal === 'contradiction' || entry.contradicts.includes(card.id),
      sourceArtifactId: entry.sourceArtifactId,
      sourceAnchorId: entry.sourceAnchorId,
      anchorExcerptSha256: entry.anchorExcerptSha256,
      evidenceSha256: entry.artifactSha256,
      policyDecision: null
    }));
  const bestSignal = matches.some((match) => match.signal === 'useful') ? 'useful'
    : matches.some((match) => match.signal === 'contradiction') ? 'contradiction'
      : matches.some((match) => match.signal === 'irrelevant') ? 'irrelevant' : 'missing';
  return {
    cardId: card.id,
    cardType: card.type,
    bestSignal,
    useful: bestSignal === 'useful',
    contradictionSurfaced: matches.some((match) => match.contradiction),
    staleMarked: matches.some((match) => match.stale),
    matchCount: matches.length,
    matches,
    policyDecision: null
  };
}

function buildMetrics(cardSummaries, evidenceCount, sourceArtifactCount, boundaryViolationCount) {
  const usefulCards = cardSummaries.filter((entry) => entry.bestSignal === 'useful').length;
  const contradictionCards = cardSummaries.filter((entry) => entry.cardType === 'contradiction');
  const surfacedContradictionCards = contradictionCards.filter((entry) => entry.contradictionSurfaced).length;
  const staleCards = cardSummaries.filter((entry) => entry.cardType === 'stale_negative_context');
  const markedStaleCards = staleCards.filter((entry) => entry.staleMarked).length;
  const allMatches = cardSummaries.flatMap((entry) => entry.matches);
  const sourceBoundMatches = allMatches.filter((match) => match.sourceBound).length;
  const irrelevantMatches = allMatches.filter((match) => match.signal === 'irrelevant').length;
  return {
    cardCount: cardSummaries.length,
    evidenceCount,
    sourceArtifactCount,
    usefulRecallRatio: ratio(usefulCards, cardSummaries.length),
    contradictionSurfacingRatio: ratio(surfacedContradictionCards, contradictionCards.length),
    staleNegativeMarkedRatio: ratio(markedStaleCards, staleCards.length),
    sourceBoundMatchRatio: ratio(sourceBoundMatches, allMatches.length),
    irrelevantMatchRatio: ratio(irrelevantMatches, allMatches.length),
    boundaryViolationCount,
    policyDecision: null
  };
}

function validateCardOutcomes(cardSummaries) {
  const issues = [];
  for (const card of cardSummaries) {
    if (card.matchCount === 0) issues.push(`cards.${card.cardId}.no_candidate_evidence`);
    if (card.matches.some((match) => !match.sourceBound)) issues.push(`cards.${card.cardId}.unsourced_match`);
    for (const match of card.matches) for (const issue of asArray(match.sourceBindingIssues)) issues.push(`cards.${card.cardId}.source_binding.${match.evidenceId}.${issue}`);
    if (card.cardType === 'stale_negative_context' && card.matchCount > 0 && !card.staleMarked) issues.push(`cards.${card.cardId}.stale_evidence_not_marked_stale`);
    if (card.cardType === 'contradiction' && !card.contradictionSurfaced) issues.push(`cards.${card.cardId}.contradiction_evidence_not_surfaced`);
  }
  return issues;
}

function validateMetrics(metrics, prefix = 'artifact.metrics') {
  const issues = [];
  const ratioKeys = ['usefulRecallRatio', 'contradictionSurfacingRatio', 'staleNegativeMarkedRatio', 'sourceBoundMatchRatio', 'irrelevantMatchRatio'];
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
  if (metrics.cardCount < PASSIVE_MEMORY_RECALL_MIN_CARDS) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.sourceArtifactCount < 1) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.boundaryViolationCount > 0) return 'HOLD_FOR_MORE_EVIDENCE';
  if (metrics.usefulRecallRatio >= 0.75 && metrics.contradictionSurfacingRatio === 1 && metrics.staleNegativeMarkedRatio === 1 && metrics.sourceBoundMatchRatio === 1 && metrics.irrelevantMatchRatio === 0) return 'ADVANCE_OBSERVATION_ONLY';
  return 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveMemoryRecallUsefulness(input = {}) {
  const inputIssues = validatePassiveMemoryRecallUsefulnessInput(input);
  const cards = normalizeCards(input.cards);
  const evidence = normalizeEvidence(input.evidence, input.sourceArtifacts);
  const cardSummaries = cards.map((card) => scoreCard(card, evidence));
  const outcomeIssues = validateCardOutcomes(cardSummaries);
  const boundaryIssueCount = [...inputIssues, ...outcomeIssues].filter((issue) => issue.includes('policyDecision') || issue.includes('authority') || issue.includes('raw') || issue.includes('effect') || issue.includes('write') || issue.includes('runtime') || issue.includes('daemon') || issue.includes('watch') || issue.includes('unsourced') || issue.includes('source_binding')).length;
  const metrics = buildMetrics(cardSummaries, evidence.length, asArray(input.sourceArtifacts).length, boundaryIssueCount);
  const metricIssues = validateMetrics(metrics, 'metrics');
  const validationIssues = [...new Set([...inputIssues, ...outcomeIssues, ...metricIssues])];
  const recommendation = recommendationFor(metrics, validationIssues);
  const artifact = {
    artifact: PASSIVE_MEMORY_RECALL_USEFULNESS_ARTIFACT,
    schemaVersion: 'passive-memory-recall-usefulness-probe-v0.28.0-alpha',
    releaseLayer: PASSIVE_MEMORY_RECALL_USEFULNESS_VERSION,
    protocol: passiveMemoryRecallUsefulnessProtocol(),
    probeStatus: validationIssues.length === 0 ? 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE' : 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyRedactedObservationArtifactsAndNeedCards: true,
    verifiesSourceAnchorsAgainstRedactedArtifactContent: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendation,
    recommendationIsAuthority: false,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null,
    validationIssues,
    metrics,
    coverage: coverageByType(cards),
    cardSummaries,
    redactedEvidenceOnly: true,
    rawSourceCache: 'excluded',
    rawPersisted: false
  };
  artifact.reportMarkdown = passiveMemoryRecallUsefulnessReport(artifact);
  return artifact;
}

export function validatePassiveMemoryRecallUsefulnessArtifact(artifact) {
  const issues = [];
  if (!isPlainObject(artifact)) return ['artifact.malformed_not_object'];
  if (artifact.schemaVersion !== 'passive-memory-recall-usefulness-probe-v0.28.0-alpha') issues.push('artifact.schema_version_invalid');
  if (!['MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE', 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE'].includes(artifact.probeStatus)) issues.push('artifact.probe_status_invalid');
  if (artifact.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if (artifact.recommendationIsAuthority !== false) issues.push('artifact.recommendation_treated_as_authority');
  if (artifact.humanReadableReportOnly !== true || artifact.nonAuthoritative !== true) issues.push('artifact.boundary_flags_missing');
  if (!isPlainObject(artifact.metrics)) issues.push('artifact.metrics_missing');
  else issues.push(...validateMetrics(artifact.metrics));
  issues.push(...boundaryViolations(artifact, 'artifact'));
  issues.push(...findAuthorityTokens(artifact, 'artifact'));
  issues.push(...findReportTokens(artifact.reportMarkdown ?? '', 'artifact.reportMarkdown'));
  return [...new Set(issues)];
}

export function passiveMemoryRecallUsefulnessReport(artifact) {
  return [
    '# Passive Memory Recall Usefulness Probe v0.28.5',
    '',
    `probeStatus: ${artifact.probeStatus}`,
    `cardCount=${artifact.metrics.cardCount}`,
    `evidenceCount=${artifact.metrics.evidenceCount}`,
    `sourceArtifactCount=${artifact.metrics.sourceArtifactCount}`,
    `usefulRecallRatio=${artifact.metrics.usefulRecallRatio}`,
    `contradictionSurfacingRatio=${artifact.metrics.contradictionSurfacingRatio}`,
    `staleNegativeMarkedRatio=${artifact.metrics.staleNegativeMarkedRatio}`,
    `sourceBoundMatchRatio=${artifact.metrics.sourceBoundMatchRatio}`,
    `irrelevantMatchRatio=${artifact.metrics.irrelevantMatchRatio}`,
    `boundaryViolationCount=${artifact.metrics.boundaryViolationCount}`,
    `recommendation: ${artifact.recommendation}`,
    `recommendationIsAuthority=false`,
    `policyDecision: null`,
    '',
    'Human-readable local evidence only. This probe verifies redacted source anchors, does not write durable memory, and does not feed a runtime.',
    '',
    '## Validation issues',
    ...(artifact.validationIssues.length ? artifact.validationIssues.map((issue) => `- ${issue}`) : ['- none']),
    ''
  ].join('\n');
}
