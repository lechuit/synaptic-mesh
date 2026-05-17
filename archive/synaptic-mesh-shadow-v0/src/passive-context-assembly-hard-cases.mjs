import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_VERSION = 'v0.33.5';
export const PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_ARTIFACT = 'T-synaptic-mesh-passive-context-assembly-hard-cases-v0.33.5';

const EXPECTED_ASSEMBLY_ARTIFACT = 'T-synaptic-mesh-passive-context-assembly-rehearsal-scorecard-v0.32.5';
const EXPECTED_SCHEMA = 'passive-context-assembly-rehearsal-scorecard-v0.32.0-alpha';
const EXPECTED_RELEASE = 'v0.32.5';
const EXPECTED_ASSEMBLY_ARTIFACT_PATHS = Object.freeze([
  'evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-rehearsal-scorecard-reviewer-package-v0.32.5.out.json',
]);
const EXPECTED_ASSEMBLY_ARTIFACT_SHA256 = '791fc6388091583ca237472c29b65810b383572045745d187a788af5a9116659';
const EXPECTED_METRICS = Object.freeze({
  assemblyItemCount: 4,
  includeForHumanContextCount: 2,
  conflictReviewCount: 1,
  staleCautionCount: 1,
  sourceBoundAssemblyRatio: 1,
  minimalContextRatio: 1,
  conflictFlaggedRatio: 1,
  staleCautionRatio: 1,
  noiseSuppressedCount: 2,
  noiseSuppressionRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_ASSEMBLY_ITEMS = Object.freeze([
  ['context-source-bound-decision', 'conflict-source-bound-decision-vs-inference', 'include_for_human_continuity_context', 'core_context'],
  ['context-project-rule', 'conflict-project-rule-vs-generic-prior', 'include_for_human_project_rule_context', 'core_context'],
  ['context-explicit-contradiction', 'conflict-explicit-contradiction', 'flag_for_human_conflict_resolution', 'conflict_review'],
  ['context-stale-negative-caution', 'conflict-stale-negative-context', 'include_as_stale_caution_not_instruction', 'stale_caution'],
]);
const AUTHORITY_TOKENS = Object.freeze(['approve', 'approval', 'allow', 'authorize', 'authorization', 'block', 'deny', 'permit', 'enforce', 'enforcement', 'execute', 'toolExecution', 'networkFetch', 'resourceFetch', 'memoryWrite', 'memoryConfigWrite', 'configWrite', 'externalEffects', 'runtimeAuthority', 'runtimeIntegration', 'agentConsumedPolicyDecision', 'machineReadablePolicyDecision', 'rawOutput', 'rawPersisted', 'sourceText', 'mayAllow', 'mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization', 'enforcement', 'approval', 'allow', 'block', 'approve', 'toolExecution', 'networkFetch', 'resourceFetch', 'memoryWrite', 'memoryConfigWrite', 'configWrite', 'externalEffects', 'rawPersisted', 'rawOutput', 'sourceText', 'agentConsumedOutput', 'agentConsumedPolicyDecision', 'machineReadablePolicyDecision', 'runtimeAuthority', 'runtimeIntegration', 'autonomousRuntime', 'daemon', 'watch', 'mayAllow', 'mayBlock']);
const ASSEMBLY_ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','assemblyStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedConflictScorecard','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','assemblyItems','rawSourceCache','rawPersisted','reportMarkdown']);
const ASSEMBLY_PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedConflictScorecard','producesHumanContextAssemblyRehearsalOnly','measuresMinimalContextAssemblyWithoutRuntimeConsumption','humanReadableReportOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const ASSEMBLY_METRICS_ALLOWED_KEYS = Object.freeze(['assemblyItemCount','includeForHumanContextCount','conflictReviewCount','staleCautionCount','sourceBoundAssemblyRatio','minimalContextRatio','conflictFlaggedRatio','staleCautionRatio','noiseSuppressedCount','noiseSuppressionRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','boundaryViolationCount','policyDecision']);
const ASSEMBLY_ITEM_ALLOWED_KEYS = Object.freeze(['assemblyItemId','sourceConflictId','primaryCardId','humanAssemblyTreatment','assemblyRole','suppressedCompetingContextType','sourceBound','humanReviewOnly','includeForHumanContext','surfaceConflictForHumanReview','includeAsStaleCaution','suppressesNoisyCompetingContext','minimalContextOnly','precedenceSuggestionIsAuthority','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const INPUT_ALLOWED_KEYS = Object.freeze(['contextAssemblyArtifact', 'contextAssemblyArtifactPath', 'contextAssemblyArtifactSha256']);
const EXPECTED_ASSEMBLY_ARTIFACT_FIELDS = Object.freeze({
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedConflictScorecard: true,
  humanReadableReportOnly: true,
  humanReviewOnly: true,
  nonAuthoritative: true,
  recommendationIsAuthority: false,
  agentConsumedOutput: false,
  notRuntimeInstruction: true,
  noRuntimeAuthority: true,
  noMemoryWrites: true,
  noRuntimeIntegration: true,
  rawSourceCache: 'excluded',
  rawPersisted: false,
});
const EXPECTED_ASSEMBLY_PROTOCOL_FIELDS = Object.freeze({
  releaseLayer: 'v0.32.0-alpha',
  barrierCrossed: 'passive_context_assembly_rehearsal_for_ai_continuity',
  buildsOn: 'v0.31.5_passive_source_authority_conflict_scorecard',
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedConflictScorecard: true,
  producesHumanContextAssemblyRehearsalOnly: true,
  measuresMinimalContextAssemblyWithoutRuntimeConsumption: true,
  humanReadableReportOnly: true,
  nonAuthoritative: true,
  recommendationIsAuthority: false,
  agentConsumedOutput: false,
  notRuntimeInstruction: true,
  noRuntimeAuthority: true,
  noMemoryWrites: true,
  noRuntimeIntegration: true,
  policyDecision: null,
});

function arr(v) { return Array.isArray(v) ? v : []; }
function obj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
function own(o, k) { return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n, d) { return d ? Number((n / d).toFixed(4)) : 0; }
function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hit(text, token) { return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v) { return AUTHORITY_TOKENS.some((t) => hit(v, t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function normPath(p) { return String(p ?? '').replace(/\\/g, '/').replace(/^\.\//, ''); }
function unknownKeys(value, allowed, prefix) { return Object.keys(value ?? {}).filter((k) => !allowed.includes(k)).map((k) => `${prefix}.unknown_field:${redact(k)}`); }
function expectedFieldIssues(value, expected, prefix) {
  const out = [];
  for (const [field, expectedValue] of Object.entries(expected)) {
    if (value?.[field] !== expectedValue) out.push(`${prefix}.${field}_not_expected`);
  }
  return out;
}
function tokenIssues(value, prefix = 'input') {
  const out = [];
  if (Array.isArray(value)) { value.forEach((x, i) => out.push(...tokenIssues(x, `${prefix}[${i}]`))); return out; }
  if (obj(value)) { for (const [k, v] of Object.entries(value)) { if (k !== 'reportMarkdown') out.push(...tokenIssues(v, `${prefix}.${k}`)); } return out; }
  if (typeof value === 'string' && AUTHORITY_TOKENS.some((t) => hit(value, t))) out.push(`${prefix}.authority_token_detected`);
  return out;
}
function boundaryIssues(value, prefix = 'input') {
  const out = [];
  if (Array.isArray(value)) { value.forEach((x, i) => out.push(...boundaryIssues(x, `${prefix}[${i}]`))); return out; }
  if (!obj(value)) return out;
  if (own(value, 'policyDecision') && value.policyDecision !== null) out.push(`${prefix}.policyDecision_non_null`);
  if (own(value, 'recommendationIsAuthority') && value.recommendationIsAuthority !== false) out.push(`${prefix}.recommendation_treated_as_authority`);
  for (const k of FORBIDDEN_FIELDS) if (own(value, k) && value[k] !== false) out.push(`${prefix}.forbidden_boundary_field_set`);
  for (const [k, v] of Object.entries(value)) if (k !== 'reportMarkdown') out.push(...boundaryIssues(v, `${prefix}.${k}`));
  return out;
}

export function passiveContextAssemblyHardCasesProtocol() {
  return {
    releaseLayer: 'v0.33.0-alpha',
    barrierCrossed: 'passive_context_assembly_hard_cases_for_long_continuity',
    buildsOn: 'v0.32.5_passive_context_assembly_rehearsal_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedContextAssemblyArtifact: true,
    producesHumanHardCaseContextScorecardOnly: true,
    measuresHardCaseContinuityWithoutRuntimeConsumption: true,
    humanReadableReportOnly: true,
    nonAuthoritative: true,
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null,
  };
}

export async function readPassiveContextAssemblyHardCasesInput(path) {
  const raw = await readFile(path, 'utf8');
  return {
    contextAssemblyArtifact: JSON.parse(raw),
    contextAssemblyArtifactPath: path,
    contextAssemblyArtifactSha256: createHash('sha256').update(raw).digest('hex'),
  };
}

function validateAssemblyArtifact(a) {
  const issues = [];
  if (!obj(a)) return ['contextAssemblyArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, ASSEMBLY_ARTIFACT_ALLOWED_KEYS, 'contextAssemblyArtifact'));
  if (obj(a.protocol)) issues.push(...unknownKeys(a.protocol, ASSEMBLY_PROTOCOL_ALLOWED_KEYS, 'contextAssemblyArtifact.protocol'));
  if (obj(a.metrics)) issues.push(...unknownKeys(a.metrics, ASSEMBLY_METRICS_ALLOWED_KEYS, 'contextAssemblyArtifact.metrics'));
  if (a.artifact !== EXPECTED_ASSEMBLY_ARTIFACT) issues.push('contextAssemblyArtifact.artifact_not_expected_v0.32_context_assembly');
  if (a.schemaVersion !== EXPECTED_SCHEMA) issues.push('contextAssemblyArtifact.schema_not_expected');
  if (a.releaseLayer !== EXPECTED_RELEASE) issues.push('contextAssemblyArtifact.release_layer_not_v0.32.5');
  if (a.assemblyStatus !== 'PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE') issues.push('contextAssemblyArtifact.status_not_complete');
  if (a.recommendation !== 'ADVANCE_OBSERVATION_ONLY') issues.push('contextAssemblyArtifact.recommendation_not_observation_only');
  if (a.policyDecision !== null) issues.push('contextAssemblyArtifact.policyDecision_non_null');
  issues.push(...expectedFieldIssues(a, EXPECTED_ASSEMBLY_ARTIFACT_FIELDS, 'contextAssemblyArtifact'));
  if (!obj(a.protocol)) issues.push('contextAssemblyArtifact.protocol_not_object');
  else issues.push(...expectedFieldIssues(a.protocol, EXPECTED_ASSEMBLY_PROTOCOL_FIELDS, 'contextAssemblyArtifact.protocol'));
  if (a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true) issues.push('contextAssemblyArtifact.boundary_flags_invalid');
  if (Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('contextAssemblyArtifact.prior_validation_issues_present');
  for (const [k, v] of Object.entries(EXPECTED_METRICS)) if (a.metrics?.[k] !== v) issues.push(`contextAssemblyArtifact.metrics.${k}_not_expected`);
  const items = arr(a.assemblyItems);
  items.forEach((item, index) => { if (obj(item)) issues.push(...unknownKeys(item, ASSEMBLY_ITEM_ALLOWED_KEYS, `contextAssemblyArtifact.assemblyItems[${index}]`)); });
  if (items.length !== EXPECTED_ASSEMBLY_ITEMS.length) issues.push('contextAssemblyArtifact.assembly_items_not_exact_expected_count');
  const byId = new Map(items.map((item) => [item?.assemblyItemId, item]));
  for (const [id, sourceConflictId, treatment, role] of EXPECTED_ASSEMBLY_ITEMS) {
    const item = byId.get(id);
    if (!item) { issues.push(`contextAssemblyArtifact.expected_assembly_item_missing:${redact(id)}`); continue; }
    if (item.sourceConflictId !== sourceConflictId) issues.push(`contextAssemblyArtifact.${id}.source_conflict_not_expected`);
    if (item.humanAssemblyTreatment !== treatment) issues.push(`contextAssemblyArtifact.${id}.treatment_not_expected`);
    if (item.assemblyRole !== role) issues.push(`contextAssemblyArtifact.${id}.role_not_expected`);
    if (item.sourceBound !== true) issues.push(`contextAssemblyArtifact.${id}.source_not_bound`);
    if (item.humanReviewOnly !== true || item.precedenceSuggestionIsAuthority !== false || item.promoteToMemory !== false || item.policyDecision !== null || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false) issues.push(`contextAssemblyArtifact.${id}.boundary_flags_invalid`);
  }
  for (const item of items) if (!EXPECTED_ASSEMBLY_ITEMS.some(([id]) => id === item?.assemblyItemId)) issues.push(`contextAssemblyArtifact.unexpected_assembly_item:${redact(item?.assemblyItemId ?? 'missing')}`);
  return issues;
}

export function validatePassiveContextAssemblyHardCasesInput(input = {}) {
  const issues = [];
  if (!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if (!EXPECTED_ASSEMBLY_ARTIFACT_PATHS.includes(normPath(input.contextAssemblyArtifactPath))) issues.push('input.context_assembly_artifact_path_not_pinned');
  if (input.contextAssemblyArtifactSha256 !== EXPECTED_ASSEMBLY_ARTIFACT_SHA256) issues.push('input.context_assembly_artifact_digest_not_pinned');
  issues.push(...validateAssemblyArtifact(input.contextAssemblyArtifact));
  if (input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if (input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if (input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if (input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input, 'input'), ...tokenIssues(input, 'input'));
  return [...new Set(issues)];
}

function buildHardCases(assemblyItems) {
  const byId = new Map(arr(assemblyItems).map((item) => [item.assemblyItemId, item]));
  const spec = [
    ['hard-active-project-rule-vs-old-context', 'context-project-rule', 'active_rule_preferred_for_human_context', 'active_project_rule', 'old_project_summary', 'include'],
    ['hard-partial-contradiction-thread', 'context-explicit-contradiction', 'partial_contradiction_flagged_for_human_resolution', 'partial_contradiction', 'overconfident_summary', 'flag'],
    ['hard-source-bound-decision-carry-forward', 'context-source-bound-decision', 'source_bound_decision_carried_forward_for_human_context', 'source_bound_decision', 'unsourced_inference', 'include'],
    ['hard-stale-caution-not-instruction', 'context-stale-negative-caution', 'stale_context_preserved_as_caution_not_instruction', 'stale_caution', 'fresh_instruction_candidate', 'caution'],
    ['hard-tempting-noise-suppression', 'context-project-rule', 'tempting_noise_suppressed_from_minimal_context', 'noise_suppression', 'generic_plausible_memory', 'suppress'],
  ];
  return spec.map(([hardCaseId, sourceAssemblyItemId, humanTreatment, hardCaseType, competingContextType, outcome]) => {
    const item = byId.get(sourceAssemblyItemId) ?? {};
    return {
      hardCaseId,
      sourceAssemblyItemId,
      sourceConflictId: redact(item.sourceConflictId),
      hardCaseType,
      competingContextType,
      humanTreatment,
      outcome,
      sourceBound: item.sourceBound === true,
      sourceAnchorPreserved: item.sourceBound === true,
      activeRulePreferred: hardCaseType === 'active_project_rule',
      partialContradictionFlagged: hardCaseType === 'partial_contradiction',
      sourceBoundDecisionCarriedForward: hardCaseType === 'source_bound_decision',
      staleCautionPreserved: hardCaseType === 'stale_caution',
      temptingNoiseSuppressed: hardCaseType === 'noise_suppression',
      humanReviewOnly: true,
      minimalContextOnly: true,
      precedenceSuggestionIsAuthority: false,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      policyDecision: null,
    };
  });
}

function metrics(hardCases, boundaryViolationCount) {
  return {
    hardCaseCount: hardCases.length,
    activeRulePreferredCount: hardCases.filter((c) => c.activeRulePreferred).length,
    partialContradictionFlagCount: hardCases.filter((c) => c.partialContradictionFlagged).length,
    sourceBoundDecisionCarryForwardCount: hardCases.filter((c) => c.sourceBoundDecisionCarriedForward).length,
    staleCautionPreservedCount: hardCases.filter((c) => c.staleCautionPreserved).length,
    temptingNoiseSuppressedCount: hardCases.filter((c) => c.temptingNoiseSuppressed).length,
    sourceBoundHardCaseRatio: ratio(hardCases.filter((c) => c.sourceBound && c.sourceAnchorPreserved).length, hardCases.length),
    humanReviewOnlyRatio: ratio(hardCases.filter((c) => c.humanReviewOnly).length, hardCases.length),
    minimalContextRatio: ratio(hardCases.filter((c) => c.minimalContextOnly).length, hardCases.length),
    noPromotionWithoutHumanRatio: ratio(hardCases.filter((c) => c.promoteToMemory === false).length, hardCases.length),
    hardCaseCoverageRatio: ratio([
      hardCases.some((c) => c.activeRulePreferred),
      hardCases.some((c) => c.partialContradictionFlagged),
      hardCases.some((c) => c.sourceBoundDecisionCarriedForward),
      hardCases.some((c) => c.staleCautionPreserved),
      hardCases.some((c) => c.temptingNoiseSuppressed),
    ].filter(Boolean).length, 5),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues) {
  return issues.length === 0 && m.hardCaseCount === 5 && m.activeRulePreferredCount === 1 && m.partialContradictionFlagCount === 1 && m.sourceBoundDecisionCarryForwardCount === 1 && m.staleCautionPreservedCount === 1 && m.temptingNoiseSuppressedCount === 1 && m.sourceBoundHardCaseRatio === 1 && m.humanReviewOnlyRatio === 1 && m.minimalContextRatio === 1 && m.noPromotionWithoutHumanRatio === 1 && m.hardCaseCoverageRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveContextAssemblyHardCases(input = {}) {
  const inputIssues = validatePassiveContextAssemblyHardCasesInput(input);
  const hardCases = buildHardCases(input?.contextAssemblyArtifact?.assemblyItems);
  const itemIssues = [];
  for (const item of hardCases) {
    if (item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.precedenceSuggestionIsAuthority !== false) itemIssues.push(`${item.hardCaseId}.boundary_flags_invalid`);
  }
  const allIssues = [...new Set([...inputIssues, ...itemIssues])];
  const boundaryViolationCount = allIssues.filter((i) => /(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  const m = metrics(hardCases, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_ARTIFACT,
    schemaVersion: 'passive-context-assembly-hard-cases-v0.33.0-alpha',
    releaseLayer: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_VERSION,
    protocol: passiveContextAssemblyHardCasesProtocol(),
    hardCaseStatus: allIssues.length === 0 ? 'PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE' : 'DEGRADED_PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedContextAssemblyArtifact: true,
    humanReadableReportOnly: true,
    humanReviewOnly: true,
    nonAuthoritative: true,
    recommendation: recommendation(m, allIssues),
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null,
    validationIssues: allIssues,
    metrics: m,
    hardCases,
    rawSourceCache: 'excluded',
    rawPersisted: false,
  };
  artifact.reportMarkdown = passiveContextAssemblyHardCasesReport(artifact);
  return artifact;
}

export function validatePassiveContextAssemblyHardCasesArtifact(a) {
  const issues = [];
  if (!obj(a)) return ['artifact.malformed_not_object'];
  if (a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if (a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true) issues.push('artifact.boundary_flags_invalid');
  for (const item of arr(a.hardCases)) if (item.policyDecision !== null || item.precedenceSuggestionIsAuthority !== false || item.promoteToMemory !== false || item.agentConsumedOutput !== false) issues.push(`artifact.${redact(item.hardCaseId)}.boundary_flags_invalid`);
  issues.push(...boundaryIssues(a, 'artifact'), ...tokenIssues(a, 'artifact'));
  return [...new Set(issues)];
}

export function passiveContextAssemblyHardCasesReport(a) {
  return [
    '# Passive Context Assembly Hard Cases Scorecard v0.33.5',
    '',
    `hardCaseStatus: ${a.hardCaseStatus}`,
    `hardCaseCount=${a.metrics.hardCaseCount}`,
    `activeRulePreferredCount=${a.metrics.activeRulePreferredCount}`,
    `partialContradictionFlagCount=${a.metrics.partialContradictionFlagCount}`,
    `sourceBoundDecisionCarryForwardCount=${a.metrics.sourceBoundDecisionCarryForwardCount}`,
    `staleCautionPreservedCount=${a.metrics.staleCautionPreservedCount}`,
    `temptingNoiseSuppressedCount=${a.metrics.temptingNoiseSuppressedCount}`,
    `sourceBoundHardCaseRatio=${a.metrics.sourceBoundHardCaseRatio}`,
    `hardCaseCoverageRatio=${a.metrics.hardCaseCoverageRatio}`,
    `humanReviewOnlyRatio=${a.metrics.humanReviewOnlyRatio}`,
    `minimalContextRatio=${a.metrics.minimalContextRatio}`,
    `noPromotionWithoutHumanRatio=${a.metrics.noPromotionWithoutHumanRatio}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable hard-case context assembly scorecard only. Hard-case treatments are for human review, not runtime instructions, not memory promotion, and not authority.',
    '',
    '## Hard cases',
    ...a.hardCases.map((c) => `- ${c.hardCaseId}: ${c.humanTreatment}; type=${c.hardCaseType}; outcome=${c.outcome}; sourceBound=${c.sourceBound}; promoteToMemory=${c.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i) => `- ${i}`) : ['- none']),
    '',
  ].join('\n');
}
