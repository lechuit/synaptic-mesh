import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_VERSION = 'v0.34.5';
export const PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_ARTIFACT = 'T-synaptic-mesh-passive-hard-case-outcome-value-scorecard-v0.34.5';

const EXPECTED_HARD_CASE_ARTIFACT = 'T-synaptic-mesh-passive-context-assembly-hard-cases-v0.33.5';
const EXPECTED_SCHEMA = 'passive-context-assembly-hard-cases-v0.33.0-alpha';
const EXPECTED_RELEASE = 'v0.33.5';
const EXPECTED_HARD_CASE_ARTIFACT_PATHS = Object.freeze([
  'evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-context-assembly-hard-cases-reviewer-package-v0.33.5.out.json',
]);
const EXPECTED_HARD_CASE_ARTIFACT_SHA256 = '6c291b1800a9fdbf21a2631a8dbfd84f852bc77a612d3a1b33972a9cd78c9dc6';
const EXPECTED_HARD_CASE_REPORT_MARKDOWN_SHA256 = 'ae729bc3f2a6ba6d14c8b0259c5eb94d3635080b48ce85172b2b0fd9453a3c3f';
const EXPECTED_HARD_CASE_IDS = Object.freeze([
  'hard-active-project-rule-vs-old-context',
  'hard-partial-contradiction-thread',
  'hard-source-bound-decision-carry-forward',
  'hard-stale-caution-not-instruction',
  'hard-tempting-noise-suppression',
]);
const EXPECTED_HARD_CASE_ITEMS = Object.freeze({
  'hard-active-project-rule-vs-old-context': Object.freeze({
    sourceAssemblyItemId: 'context-project-rule',
    sourceConflictId: 'conflict-project-rule-vs-generic-prior',
    hardCaseType: 'active_project_rule',
    competingContextType: 'old_project_summary',
    humanTreatment: 'active_rule_preferred_for_human_context',
    outcome: 'include',
    sourceBound: true,
    sourceAnchorPreserved: true,
    activeRulePreferred: true,
    partialContradictionFlagged: false,
    sourceBoundDecisionCarriedForward: false,
    staleCautionPreserved: false,
    temptingNoiseSuppressed: false,
  }),
  'hard-partial-contradiction-thread': Object.freeze({
    sourceAssemblyItemId: 'context-explicit-contradiction',
    sourceConflictId: 'conflict-explicit-contradiction',
    hardCaseType: 'partial_contradiction',
    competingContextType: 'overconfident_summary',
    humanTreatment: 'partial_contradiction_flagged_for_human_resolution',
    outcome: 'flag',
    sourceBound: true,
    sourceAnchorPreserved: true,
    activeRulePreferred: false,
    partialContradictionFlagged: true,
    sourceBoundDecisionCarriedForward: false,
    staleCautionPreserved: false,
    temptingNoiseSuppressed: false,
  }),
  'hard-source-bound-decision-carry-forward': Object.freeze({
    sourceAssemblyItemId: 'context-source-bound-decision',
    sourceConflictId: 'conflict-source-bound-decision-vs-inference',
    hardCaseType: 'source_bound_decision',
    competingContextType: 'unsourced_inference',
    humanTreatment: 'source_bound_decision_carried_forward_for_human_context',
    outcome: 'include',
    sourceBound: true,
    sourceAnchorPreserved: true,
    activeRulePreferred: false,
    partialContradictionFlagged: false,
    sourceBoundDecisionCarriedForward: true,
    staleCautionPreserved: false,
    temptingNoiseSuppressed: false,
  }),
  'hard-stale-caution-not-instruction': Object.freeze({
    sourceAssemblyItemId: 'context-stale-negative-caution',
    sourceConflictId: 'conflict-stale-negative-context',
    hardCaseType: 'stale_caution',
    competingContextType: 'fresh_instruction_candidate',
    humanTreatment: 'stale_context_preserved_as_caution_not_instruction',
    outcome: 'caution',
    sourceBound: true,
    sourceAnchorPreserved: true,
    activeRulePreferred: false,
    partialContradictionFlagged: false,
    sourceBoundDecisionCarriedForward: false,
    staleCautionPreserved: true,
    temptingNoiseSuppressed: false,
  }),
  'hard-tempting-noise-suppression': Object.freeze({
    sourceAssemblyItemId: 'context-project-rule',
    sourceConflictId: 'conflict-project-rule-vs-generic-prior',
    hardCaseType: 'noise_suppression',
    competingContextType: 'generic_plausible_memory',
    humanTreatment: 'tempting_noise_suppressed_from_minimal_context',
    outcome: 'suppress',
    sourceBound: true,
    sourceAnchorPreserved: true,
    activeRulePreferred: false,
    partialContradictionFlagged: false,
    sourceBoundDecisionCarriedForward: false,
    staleCautionPreserved: false,
    temptingNoiseSuppressed: true,
  }),
});
const EXPECTED_METRICS = Object.freeze({
  hardCaseCount: 5,
  activeRulePreferredCount: 1,
  partialContradictionFlagCount: 1,
  sourceBoundDecisionCarryForwardCount: 1,
  staleCautionPreservedCount: 1,
  temptingNoiseSuppressedCount: 1,
  sourceBoundHardCaseRatio: 1,
  humanReviewOnlyRatio: 1,
  minimalContextRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  hardCaseCoverageRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_HARD_CASE_ARTIFACT_FIELDS = Object.freeze({
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
  recommendation: 'ADVANCE_OBSERVATION_ONLY',
  recommendationIsAuthority: false,
  agentConsumedOutput: false,
  notRuntimeInstruction: true,
  noRuntimeAuthority: true,
  noMemoryWrites: true,
  noRuntimeIntegration: true,
  policyDecision: null,
  rawSourceCache: 'excluded',
  rawPersisted: false,
});
const EXPECTED_HARD_CASE_PROTOCOL_FIELDS = Object.freeze({
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
});
const HARD_CASE_ARTIFACT_ALLOWED_KEYS = Object.freeze([
  'artifact','schemaVersion','releaseLayer','protocol','hardCaseStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedContextAssemblyArtifact','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','hardCases','rawSourceCache','rawPersisted','reportMarkdown'
]);
const HARD_CASE_PROTOCOL_ALLOWED_KEYS = Object.freeze([
  'releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedContextAssemblyArtifact','producesHumanHardCaseContextScorecardOnly','measuresHardCaseContinuityWithoutRuntimeConsumption','humanReadableReportOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision'
]);
const HARD_CASE_METRICS_ALLOWED_KEYS = Object.freeze([
  'hardCaseCount','activeRulePreferredCount','partialContradictionFlagCount','sourceBoundDecisionCarryForwardCount','staleCautionPreservedCount','temptingNoiseSuppressedCount','sourceBoundHardCaseRatio','humanReviewOnlyRatio','minimalContextRatio','noPromotionWithoutHumanRatio','hardCaseCoverageRatio','boundaryViolationCount','policyDecision'
]);
const HARD_CASE_ITEM_ALLOWED_KEYS = Object.freeze([
  'hardCaseId','sourceAssemblyItemId','sourceConflictId','hardCaseType','humanTreatment','competingContextType','outcome','sourceBound','sourceAnchorPreserved','humanReviewOnly','minimalContextOnly','activeRulePreferred','partialContradictionFlagged','sourceBoundDecisionCarriedForward','staleCautionPreserved','temptingNoiseSuppressed','precedenceSuggestionIsAuthority','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision'
]);
const INPUT_ALLOWED_KEYS = Object.freeze(['hardCaseArtifact', 'hardCaseArtifactPath', 'hardCaseArtifactSha256', 'receiverOutcomes']);
const OUTCOME_ALLOWED_KEYS = Object.freeze(['hardCaseId','receiverLabel','receiverRationale','sourceBound','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const VALID_LABELS = Object.freeze(['useful_for_human_continuity','noise_for_human_context','needs_more_evidence']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);

function arr(v){ return Array.isArray(v) ? v : []; }
function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function unknownKeys(value, allowed, prefix){ return Object.keys(value ?? {}).filter((k)=>!allowed.includes(k)).map((k)=>`${prefix}.unknown_field:${redact(k)}`); }
function expectedFieldIssues(value, expected, prefix){ const out=[]; for(const [k,v] of Object.entries(expected)) if(value?.[k] !== v) out.push(`${prefix}.${k}_not_expected`); return out; }
function tokenIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...tokenIssues(x, `${prefix}[${i}]`))); return out; }
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(k !== 'reportMarkdown') out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
  if(typeof value === 'string' && AUTHORITY_TOKENS.some((t)=>hit(value,t))) out.push(`${prefix}.authority_token_detected`);
  return out;
}
function boundaryIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...boundaryIssues(x, `${prefix}[${i}]`))); return out; }
  if(!obj(value)) return out;
  if(own(value,'policyDecision') && value.policyDecision !== null) out.push(`${prefix}.policyDecision_non_null`);
  if(own(value,'recommendationIsAuthority') && value.recommendationIsAuthority !== false) out.push(`${prefix}.recommendation_treated_as_authority`);
  for(const k of FORBIDDEN_FIELDS) if(own(value,k) && value[k] !== false) out.push(`${prefix}.forbidden_boundary_field_set`);
  for(const [k,v] of Object.entries(value)) if(k !== 'reportMarkdown') out.push(...boundaryIssues(v, `${prefix}.${redact(k)}`));
  return out;
}

export function passiveHardCaseOutcomeValueScorecardProtocol(){
  return {
    releaseLayer: 'v0.34.0-alpha',
    barrierCrossed: 'passive_hard_case_receiver_outcome_value_measurement',
    buildsOn: 'v0.33.5_passive_context_assembly_hard_cases',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedHardCaseArtifact: true,
    producesHumanReceiverOutcomeValueScorecardOnly: true,
    measuresUsefulnessNoiseAndEvidenceGapsWithoutRuntimeConsumption: true,
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

export async function readPassiveHardCaseOutcomeValueScorecardInput(path, receiverOutcomes = canonicalReceiverOutcomes()){
  const raw = await readFile(path, 'utf8');
  return { hardCaseArtifact: JSON.parse(raw), hardCaseArtifactPath: path, hardCaseArtifactSha256: createHash('sha256').update(raw).digest('hex'), receiverOutcomes };
}

export function canonicalReceiverOutcomes(){
  return [
    ['hard-active-project-rule-vs-old-context','useful_for_human_continuity','active rule surfaced instead of stale context'],
    ['hard-partial-contradiction-thread','needs_more_evidence','partial contradiction was visible but needs source followup'],
    ['hard-source-bound-decision-carry-forward','useful_for_human_continuity','source-bound decision carry-forward was useful'],
    ['hard-stale-caution-not-instruction','useful_for_human_continuity','stale material stayed caution-shaped, not instruction-shaped'],
    ['hard-tempting-noise-suppression','noise_for_human_context','noise case shows useful suppression but still needs receiver scrutiny'],
  ].map(([hardCaseId, receiverLabel, receiverRationale]) => ({ hardCaseId, receiverLabel, receiverRationale, sourceBound: true, humanReviewOnly: true, minimalContextOnly: true, promoteToMemory: false, agentConsumedOutput: false, recommendationIsAuthority: false, policyDecision: null }));
}

function validateHardCaseArtifact(a){
  const issues=[];
  if(!obj(a)) return ['hardCaseArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, HARD_CASE_ARTIFACT_ALLOWED_KEYS, 'hardCaseArtifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, HARD_CASE_PROTOCOL_ALLOWED_KEYS, 'hardCaseArtifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, HARD_CASE_METRICS_ALLOWED_KEYS, 'hardCaseArtifact.metrics'));
  if(a.artifact !== EXPECTED_HARD_CASE_ARTIFACT) issues.push('hardCaseArtifact.artifact_not_expected_v0.33_hard_cases');
  if(a.schemaVersion !== EXPECTED_SCHEMA) issues.push('hardCaseArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_RELEASE) issues.push('hardCaseArtifact.release_layer_not_v0.33.5');
  if(a.hardCaseStatus !== 'PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE') issues.push('hardCaseArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('hardCaseArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_HARD_CASE_REPORT_MARKDOWN_SHA256) issues.push('hardCaseArtifact.reportMarkdown_digest_not_expected');
  issues.push(...expectedFieldIssues(a, EXPECTED_HARD_CASE_ARTIFACT_FIELDS, 'hardCaseArtifact'));
  if(!obj(a.protocol)) issues.push('hardCaseArtifact.protocol_not_object');
  else issues.push(...expectedFieldIssues(a.protocol, EXPECTED_HARD_CASE_PROTOCOL_FIELDS, 'hardCaseArtifact.protocol'));
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('hardCaseArtifact.prior_validation_issues_present');
  for(const [k,v] of Object.entries(EXPECTED_METRICS)) if(a.metrics?.[k] !== v) issues.push(`hardCaseArtifact.metrics.${k}_not_expected`);
  const hardCases = arr(a.hardCases);
  if(hardCases.length !== EXPECTED_HARD_CASE_IDS.length) issues.push('hardCaseArtifact.hard_cases_not_exact_expected_count');
  const ids = new Set(hardCases.map((c)=>c?.hardCaseId));
  for(const id of EXPECTED_HARD_CASE_IDS) if(!ids.has(id)) issues.push(`hardCaseArtifact.expected_hard_case_missing:${redact(id)}`);
  hardCases.forEach((c, index)=>{
    if(obj(c)) issues.push(...unknownKeys(c, HARD_CASE_ITEM_ALLOWED_KEYS, `hardCaseArtifact.hardCases[${index}]`));
    if(!EXPECTED_HARD_CASE_IDS.includes(c?.hardCaseId)) issues.push(`hardCaseArtifact.unexpected_hard_case:${redact(c?.hardCaseId ?? 'missing')}`);
    const expected = EXPECTED_HARD_CASE_ITEMS[c?.hardCaseId];
    if(expected) {
      for(const [field, expectedValue] of Object.entries(expected)) if(c?.[field] !== expectedValue) issues.push(`hardCaseArtifact.${redact(c?.hardCaseId)}.${field}_not_expected`);
    }
    if(c?.sourceBound !== true || c?.sourceAnchorPreserved !== true) issues.push(`hardCaseArtifact.${redact(c?.hardCaseId)}.source_not_bound`);
    if(c?.humanReviewOnly !== true || c?.minimalContextOnly !== true || c?.promoteToMemory !== false || c?.agentConsumedOutput !== false || c?.recommendationIsAuthority !== false || c?.precedenceSuggestionIsAuthority !== false || c?.policyDecision !== null) issues.push(`hardCaseArtifact.${redact(c?.hardCaseId)}.boundary_flags_invalid`);
  });
  return issues;
}

function validateReceiverOutcomes(outcomes){
  const issues=[];
  if(!Array.isArray(outcomes)) return ['receiverOutcomes.array_required'];
  if(outcomes.length !== EXPECTED_HARD_CASE_IDS.length) issues.push('receiverOutcomes.not_exact_expected_count');
  const byId = new Map();
  outcomes.forEach((o,i)=>{
    if(!obj(o)){ issues.push(`receiverOutcomes[${i}].object_required`); return; }
    issues.push(...unknownKeys(o, OUTCOME_ALLOWED_KEYS, `receiverOutcomes[${i}]`));
    if(!EXPECTED_HARD_CASE_IDS.includes(o.hardCaseId)) issues.push(`receiverOutcomes[${i}].hard_case_id_not_expected:${redact(o.hardCaseId)}`);
    if(byId.has(o.hardCaseId)) issues.push(`receiverOutcomes[${i}].duplicate_hard_case_id:${redact(o.hardCaseId)}`);
    byId.set(o.hardCaseId, o);
    if(!VALID_LABELS.includes(o.receiverLabel)) issues.push(`receiverOutcomes[${i}].receiver_label_not_expected`);
    if(typeof o.receiverRationale !== 'string' || o.receiverRationale.length < 6) issues.push(`receiverOutcomes[${i}].receiver_rationale_required`);
    if(o.sourceBound !== true) issues.push(`receiverOutcomes[${i}].source_not_bound`);
    if(o.humanReviewOnly !== true || o.minimalContextOnly !== true || o.promoteToMemory !== false || o.agentConsumedOutput !== false || o.recommendationIsAuthority !== false || o.policyDecision !== null) issues.push(`receiverOutcomes[${i}].boundary_flags_invalid`);
  });
  for(const id of EXPECTED_HARD_CASE_IDS) if(!byId.has(id)) issues.push(`receiverOutcomes.expected_hard_case_missing:${redact(id)}`);
  return issues;
}

export function validatePassiveHardCaseOutcomeValueScorecardInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_HARD_CASE_ARTIFACT_PATHS.includes(normPath(input.hardCaseArtifactPath))) issues.push('input.hard_case_artifact_path_not_pinned');
  if(input.hardCaseArtifactSha256 !== EXPECTED_HARD_CASE_ARTIFACT_SHA256) issues.push('input.hard_case_artifact_digest_not_pinned');
  issues.push(...validateHardCaseArtifact(input.hardCaseArtifact));
  issues.push(...validateReceiverOutcomes(input.receiverOutcomes));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function scoreOutcomes(receiverOutcomes){
  return arr(receiverOutcomes).map((o)=>({
    hardCaseId: redact(o?.hardCaseId),
    receiverLabel: o?.receiverLabel,
    outcomeValue: o?.receiverLabel === 'useful_for_human_continuity' ? 'useful' : o?.receiverLabel === 'noise_for_human_context' ? 'noise' : 'evidence_gap',
    receiverRationale: redact(o?.receiverRationale),
    sourceBound: o?.sourceBound === true,
    humanReviewOnly: true,
    minimalContextOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function metrics(outcomeItems, boundaryViolationCount){
  const n=outcomeItems.length;
  const useful=outcomeItems.filter((o)=>o.outcomeValue === 'useful').length;
  const noise=outcomeItems.filter((o)=>o.outcomeValue === 'noise').length;
  const gap=outcomeItems.filter((o)=>o.outcomeValue === 'evidence_gap').length;
  return {
    outcomeCount: n,
    usefulOutcomeCount: useful,
    noiseOutcomeCount: noise,
    evidenceGapOutcomeCount: gap,
    usefulOutcomeRatio: ratio(useful,n),
    noiseOutcomeRatio: ratio(noise,n),
    evidenceGapRatio: ratio(gap,n),
    sourceBoundOutcomeRatio: ratio(outcomeItems.filter((o)=>o.sourceBound).length,n),
    humanReviewOnlyRatio: ratio(outcomeItems.filter((o)=>o.humanReviewOnly).length,n),
    minimalContextRatio: ratio(outcomeItems.filter((o)=>o.minimalContextOnly).length,n),
    noPromotionWithoutHumanRatio: ratio(outcomeItems.filter((o)=>o.promoteToMemory === false).length,n),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.outcomeCount === 5 && m.usefulOutcomeCount >= 3 && m.noiseOutcomeCount <= 1 && m.evidenceGapOutcomeCount <= 1 && m.sourceBoundOutcomeRatio === 1 && m.humanReviewOnlyRatio === 1 && m.noPromotionWithoutHumanRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveHardCaseOutcomeValueScorecard(input={}){
  const inputIssues = validatePassiveHardCaseOutcomeValueScorecardInput(input);
  const outcomeItems = scoreOutcomes(input?.receiverOutcomes);
  const itemIssues=[];
  for(const item of outcomeItems) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false) itemIssues.push(`${item.hardCaseId}.boundary_flags_invalid`);
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  const m=metrics(outcomeItems,boundaryViolationCount);
  const artifact={
    artifact: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_ARTIFACT,
    schemaVersion: 'passive-hard-case-outcome-value-scorecard-v0.34.0-alpha',
    releaseLayer: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_VERSION,
    protocol: passiveHardCaseOutcomeValueScorecardProtocol(),
    outcomeValueStatus: allIssues.length === 0 ? 'PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedHardCaseArtifact: true,
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
    outcomeItems,
    rawSourceCache: 'excluded',
    rawPersisted: false,
  };
  artifact.reportMarkdown = passiveHardCaseOutcomeValueScorecardReport(artifact);
  return artifact;
}

export function validatePassiveHardCaseOutcomeValueScorecardArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true) issues.push('artifact.boundary_flags_invalid');
  for(const item of arr(a.outcomeItems)) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false) issues.push(`artifact.${redact(item.hardCaseId)}.boundary_flags_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveHardCaseOutcomeValueScorecardReport(a){
  return [
    '# Passive Hard-Case Outcome Value Scorecard v0.34.5',
    '',
    `outcomeValueStatus: ${a.outcomeValueStatus}`,
    `outcomeCount=${a.metrics.outcomeCount}`,
    `usefulOutcomeCount=${a.metrics.usefulOutcomeCount}`,
    `noiseOutcomeCount=${a.metrics.noiseOutcomeCount}`,
    `evidenceGapOutcomeCount=${a.metrics.evidenceGapOutcomeCount}`,
    `usefulOutcomeRatio=${a.metrics.usefulOutcomeRatio}`,
    `noiseOutcomeRatio=${a.metrics.noiseOutcomeRatio}`,
    `evidenceGapRatio=${a.metrics.evidenceGapRatio}`,
    `sourceBoundOutcomeRatio=${a.metrics.sourceBoundOutcomeRatio}`,
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
    'Human-readable receiver outcome value scorecard only. Outcome labels measure usefulness/noise/evidence gaps for human review; they are not policy decisions, not memory promotion, and not runtime instructions.',
    '',
    '## Receiver outcomes',
    ...a.outcomeItems.map((o)=>`- ${o.hardCaseId}: ${o.outcomeValue}; label=${o.receiverLabel}; sourceBound=${o.sourceBound}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
    '',
  ].join('\n');
}
