import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_VERSION = 'v0.38.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-usefulness-window-v0.38.5';

const EXPECTED_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-repeatability-scorecard-v0.37.5';
const EXPECTED_REPEATABILITY_SCHEMA = 'passive-live-memory-coherence-repeatability-scorecard-v0.37.0-alpha';
const EXPECTED_REPEATABILITY_RELEASE = 'v0.37.5';
const EXPECTED_REPEATABILITY_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_COMPLETE';
const EXPECTED_REPEATABILITY_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json',
]);
const EXPECTED_REPEATABILITY_SHA256 = '427957ccda1f9295ddfa05bd3b11917d6774916c0a2ddb0955147b2af51d9222';
const EXPECTED_REPEATABILITY_REPORT_SHA256 = 'da5a841a0743ed103c5d4d0b58cd32a1437d036ca0125cf6bfe265c78fcfb319';
const EXPECTED_REPEATABILITY_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  expectedRepeatabilityRunCount: 3,
  observationItemCount: 4,
  totalObservationJudgementCount: 12,
  expectedObservationJudgementCount: 12,
  stableObservationCount: 4,
  unstableObservationCount: 0,
  stableIncludeForHumanContextCount: 3,
  stableHardeningCautionCount: 1,
  labelAgreementJudgementCount: 12,
  labelAgreementRatio: 1,
  stableObservationRatio: 1,
  sourceBoundRepeatabilityRatio: 1,
  redactedBeforePersistRepeatabilityRatio: 1,
  humanReviewOnlyRepeatabilityRatio: 1,
  noPromotionWithoutHumanRepeatabilityRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_REPEATABILITY_FIELDS = Object.freeze({
  disabledByDefault: true, operatorRunOneShotOnly: true, localOnly: true, passiveOnly: true, readOnly: true,
  explicitArtifactsOnly: true, acceptsOnlyPinnedCompletedObservationArtifact: true, redactedBeforePersist: true,
  rawSourceCache: 'excluded', rawPersisted: false, humanReadableReportOnly: true, humanReviewOnly: true,
  nonAuthoritative: true, recommendation: 'ADVANCE_OBSERVATION_ONLY', recommendationIsAuthority: false,
  agentConsumedOutput: false, notRuntimeInstruction: true, noRuntimeAuthority: true, noMemoryWrites: true,
  noRuntimeIntegration: true, policyDecision: null,
});
const EXPECTED_REPEATABILITY_ITEMS = Object.freeze({
  'obs-current-release-continuity': Object.freeze({ receiverLabel: 'include_for_human_context', expectedReceiverLabel: 'include_for_human_context' }),
  'obs-boundary-invariants': Object.freeze({ receiverLabel: 'include_for_human_context', expectedReceiverLabel: 'include_for_human_context' }),
  'obs-repeatability-evidence': Object.freeze({ receiverLabel: 'include_for_human_context', expectedReceiverLabel: 'include_for_human_context' }),
  'obs-review-hardening-caution': Object.freeze({ receiverLabel: 'caution_for_future_hardening', expectedReceiverLabel: 'caution_for_future_hardening' }),
});
const EXPECTED_REPEATABILITY_ITEM_IDS = Object.freeze(Object.keys(EXPECTED_REPEATABILITY_ITEMS));
const REPEATABILITY_ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedObservationArtifact','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','runSummaries','repeatabilityItems','reportMarkdown']);
const REPEATABILITY_METRICS_ALLOWED_KEYS = Object.freeze(Object.keys(EXPECTED_REPEATABILITY_METRICS));
const REPEATABILITY_ITEM_ALLOWED_KEYS = Object.freeze(['observationId','runCount','expectedRunCount','stableReceiverLabel','receiverLabel','expectedReceiverLabel','agreesWithV036Observation','sourceBoundAcrossRuns','redactedBeforePersistAcrossRuns','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const INPUT_ALLOWED_KEYS = Object.freeze(['repeatabilityArtifact','repeatabilityArtifactPath','repeatabilityArtifactSha256']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedRepeatabilityArtifact','boundedHumanHandoffUsefulnessWindowOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','usefulnessWindowStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedRepeatabilityArtifact','boundedHumanHandoffUsefulnessWindowOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','handoffItems','usefulnessJudgements','reportMarkdown']);
const METRICS_ALLOWED_KEYS = Object.freeze(['usefulnessWindowCount','handoffItemCount','usefulHandoffItemCount','noisyHandoffItemCount','includeForHumanHandoffCount','cautionOnlyCount','sourceBoundHandoffRatio','stableSignalCarryForwardRatio','usefulHandoffRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','boundaryViolationCount','policyDecision']);
const HANDOFF_ITEM_ALLOWED_KEYS = Object.freeze(['handoffId','sourceObservationId','usefulnessLabel','humanTreatment','expectedHumanUtility','windowOrdinal','sourceBound','stableAcrossRuns','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const USEFULNESS_JUDGEMENT_ALLOWED_KEYS = Object.freeze(['judgementId','handoffId','sourceObservationId','usefulForHumanHandoff','noiseForHumanHandoff','cautionOnly','sourceBound','stableAcrossRuns','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const EXPECTED_USEFULNESS_METRICS = Object.freeze({
  usefulnessWindowCount: 1,
  handoffItemCount: 4,
  usefulHandoffItemCount: 4,
  noisyHandoffItemCount: 0,
  includeForHumanHandoffCount: 3,
  cautionOnlyCount: 1,
  sourceBoundHandoffRatio: 1,
  stableSignalCarryForwardRatio: 1,
  usefulHandoffRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_ARTIFACT_FIELDS = Object.freeze({
  artifact: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_ARTIFACT,
  schemaVersion: 'passive-live-memory-coherence-usefulness-window-v0.38.0-alpha',
  releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_VERSION,
  usefulnessWindowStatus: 'PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE',
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
  boundedHumanHandoffUsefulnessWindowOnly: true,
  redactedBeforePersist: true,
  rawSourceCache: 'excluded',
  rawPersisted: false,
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
});

const HANDOFF_DEFINITIONS = Object.freeze({
  'obs-current-release-continuity': Object.freeze({ handoffId: 'handoff-current-release-continuity', usefulnessLabel: 'continuity_anchor', humanTreatment: 'include_for_human_handoff', expectedHumanUtility: true }),
  'obs-boundary-invariants': Object.freeze({ handoffId: 'handoff-boundary-invariants', usefulnessLabel: 'boundary_guardrail_anchor', humanTreatment: 'include_for_human_handoff', expectedHumanUtility: true }),
  'obs-repeatability-evidence': Object.freeze({ handoffId: 'handoff-repeatability-evidence', usefulnessLabel: 'advance_evidence_anchor', humanTreatment: 'include_for_human_handoff', expectedHumanUtility: true }),
  'obs-review-hardening-caution': Object.freeze({ handoffId: 'handoff-review-hardening-caution', usefulnessLabel: 'hardening_caution', humanTreatment: 'include_as_caution_only', expectedHumanUtility: true }),
});

function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function arr(v){ return Array.isArray(v) ? v : []; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^(\.\.\/)+/,''); }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
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

export function passiveLiveMemoryCoherenceUsefulnessWindowProtocol(){
  return {
    releaseLayer: 'v0.38.0-alpha',
    barrierCrossed: 'bounded_passive_live_memory_coherence_usefulness_window',
    buildsOn: 'v0.37.5_passive_live_memory_coherence_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
    boundedHumanHandoffUsefulnessWindowOnly: true,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    humanReadableReportOnly: true,
    humanReviewOnly: true,
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

export async function readPassiveLiveMemoryCoherenceUsefulnessWindowInput(repeatabilityArtifactPath = 'evidence/passive-live-memory-coherence-repeatability-scorecard-reviewer-package-v0.37.5.out.json'){
  const raw = await readFile(repeatabilityArtifactPath, 'utf8');
  return { repeatabilityArtifact: JSON.parse(raw), repeatabilityArtifactPath, repeatabilityArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

function validateRepeatabilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['repeatabilityArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, REPEATABILITY_ARTIFACT_ALLOWED_KEYS, 'repeatabilityArtifact'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, REPEATABILITY_METRICS_ALLOWED_KEYS, 'repeatabilityArtifact.metrics'));
  if(a.artifact !== EXPECTED_REPEATABILITY_ARTIFACT) issues.push('repeatabilityArtifact.artifact_not_expected_v0.37_repeatability');
  if(a.schemaVersion !== EXPECTED_REPEATABILITY_SCHEMA) issues.push('repeatabilityArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_REPEATABILITY_RELEASE) issues.push('repeatabilityArtifact.release_layer_not_v0.37.5');
  if(a.repeatabilityStatus !== EXPECTED_REPEATABILITY_STATUS) issues.push('repeatabilityArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('repeatabilityArtifact.reportMarkdown_not_string');
  else {
    if(sha256Text(a.reportMarkdown) !== EXPECTED_REPEATABILITY_REPORT_SHA256) issues.push('repeatabilityArtifact.reportMarkdown_digest_not_expected');
    issues.push(...tokenIssues(a.reportMarkdown, 'repeatabilityArtifact.reportMarkdown'));
  }
  issues.push(...expectedFieldIssues(a, EXPECTED_REPEATABILITY_FIELDS, 'repeatabilityArtifact'));
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('repeatabilityArtifact.prior_validation_issues_present');
  for(const [k,v] of Object.entries(EXPECTED_REPEATABILITY_METRICS)) if(a.metrics?.[k] !== v) issues.push(`repeatabilityArtifact.metrics.${k}_not_expected`);
  const items = arr(a.repeatabilityItems);
  if(items.length !== 4) issues.push('repeatabilityArtifact.repeatability_items_not_exact_expected_count');
  const ids = items.map((item)=>item?.observationId);
  for(const id of EXPECTED_REPEATABILITY_ITEM_IDS) if(!ids.includes(id)) issues.push(`repeatabilityArtifact.repeatability_item_missing:${redact(id)}`);
  for(const item of items){
    if(!obj(item)){ issues.push('repeatabilityArtifact.repeatability_item_not_object'); continue; }
    issues.push(...unknownKeys(item, REPEATABILITY_ITEM_ALLOWED_KEYS, `repeatabilityArtifact.${redact(item.observationId ?? 'item')}`));
    const expectedItem = EXPECTED_REPEATABILITY_ITEMS[item.observationId];
    if(!expectedItem) issues.push(`repeatabilityArtifact.${redact(item.observationId)}.repeatability_item_not_expected`);
    else for(const [field, expectedValue] of Object.entries(expectedItem)) if(item[field] !== expectedValue) issues.push(`repeatabilityArtifact.${redact(item.observationId)}.${field}_not_pinned`);
    if(item.runCount !== 3 || item.expectedRunCount !== 3 || item.stableReceiverLabel !== true || item.agreesWithV036Observation !== true || item.sourceBoundAcrossRuns !== true || item.redactedBeforePersistAcrossRuns !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.policyDecision !== null) issues.push(`repeatabilityArtifact.${redact(item.observationId)}.boundary_or_repeatability_flags_invalid`);
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceUsefulnessWindowInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_REPEATABILITY_PATHS.includes(normPath(input.repeatabilityArtifactPath))) issues.push('input.repeatability_artifact_path_not_pinned');
  if(input.repeatabilityArtifactSha256 !== EXPECTED_REPEATABILITY_SHA256) issues.push('input.repeatability_artifact_digest_not_pinned');
  if(obj(input.repeatabilityArtifact) && sha256Text(JSON.stringify(input.repeatabilityArtifact, null, 2) + '\n') !== EXPECTED_REPEATABILITY_SHA256) issues.push('input.repeatability_artifact_object_digest_not_pinned');
  issues.push(...validateRepeatabilityArtifact(input.repeatabilityArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function handoffItems(repeatabilityItems){
  return EXPECTED_REPEATABILITY_ITEM_IDS.map((observationId, index)=>{
    const source = arr(repeatabilityItems).find((item)=>item.observationId === observationId) ?? {};
    const def = HANDOFF_DEFINITIONS[observationId];
    return {
      handoffId: def.handoffId,
      sourceObservationId: observationId,
      usefulnessLabel: def.usefulnessLabel,
      humanTreatment: def.humanTreatment,
      expectedHumanUtility: def.expectedHumanUtility,
      windowOrdinal: index + 1,
      sourceBound: source.sourceBoundAcrossRuns === true,
      stableAcrossRuns: source.stableReceiverLabel === true,
      redactedBeforePersist: true,
      rawPersisted: false,
      humanReviewOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      policyDecision: null,
    };
  });
}
function usefulnessJudgements(items){
  return items.map((item)=>({
    judgementId: `${item.handoffId}:bounded-passive-usefulness`,
    handoffId: item.handoffId,
    sourceObservationId: item.sourceObservationId,
    usefulForHumanHandoff: item.expectedHumanUtility === true && item.sourceBound === true && item.stableAcrossRuns === true,
    noiseForHumanHandoff: false,
    cautionOnly: item.humanTreatment === 'include_as_caution_only',
    sourceBound: item.sourceBound,
    stableAcrossRuns: item.stableAcrossRuns,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function metrics(items, judgements, validationIssues){
  const n=items.length;
  const useful=judgements.filter((j)=>j.usefulForHumanHandoff).length;
  return {
    usefulnessWindowCount: 1,
    handoffItemCount: n,
    usefulHandoffItemCount: useful,
    noisyHandoffItemCount: judgements.filter((j)=>j.noiseForHumanHandoff).length,
    includeForHumanHandoffCount: items.filter((i)=>i.humanTreatment === 'include_for_human_handoff').length,
    cautionOnlyCount: items.filter((i)=>i.humanTreatment === 'include_as_caution_only').length,
    sourceBoundHandoffRatio: ratio(items.filter((i)=>i.sourceBound).length, n),
    stableSignalCarryForwardRatio: ratio(items.filter((i)=>i.stableAcrossRuns).length, n),
    usefulHandoffRatio: ratio(useful, n),
    redactedBeforePersistRatio: ratio(items.filter((i)=>i.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(items.filter((i)=>i.rawPersisted === false).length, n),
    humanReviewOnlyRatio: ratio(items.filter((i)=>i.humanReviewOnly).length, n),
    noPromotionWithoutHumanRatio: ratio(items.filter((i)=>i.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(items.filter((i)=>i.agentConsumedOutput === false).length, n),
    boundaryViolationCount: validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.handoffItemCount === 4 && m.usefulHandoffItemCount === 4 && m.noisyHandoffItemCount === 0 && m.sourceBoundHandoffRatio === 1 && m.stableSignalCarryForwardRatio === 1 && m.rawPersistedFalseRatio === 1 && m.noPromotionWithoutHumanRatio === 1 && m.agentConsumedOutputFalseRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceUsefulnessWindow(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceUsefulnessWindowInput(input);
  const items = handoffItems(input?.repeatabilityArtifact?.repeatabilityItems ?? []);
  const judgements = usefulnessJudgements(items);
  const itemIssues=[];
  for(const item of items){
    if(item.sourceBound !== true || item.stableAcrossRuns !== true) itemIssues.push(`${item.handoffId}.source_or_stability_missing`);
    if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) itemIssues.push(`${item.handoffId}.boundary_flags_invalid`);
  }
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const m=metrics(items, judgements, allIssues);
  const artifact={
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-usefulness-window-v0.38.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_VERSION,
    protocol: passiveLiveMemoryCoherenceUsefulnessWindowProtocol(),
    usefulnessWindowStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
    boundedHumanHandoffUsefulnessWindowOnly: true,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
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
    handoffItems: items,
    usefulnessJudgements: judgements,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceUsefulnessWindowReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceUsefulnessWindowArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  issues.push(...expectedFieldIssues(a, EXPECTED_ARTIFACT_FIELDS, 'artifact'));
  if(!obj(a.protocol)) issues.push('artifact.protocol_not_object');
  else {
    issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
    issues.push(...expectedFieldIssues(a.protocol, passiveLiveMemoryCoherenceUsefulnessWindowProtocol(), 'artifact.protocol'));
  }
  if(!Array.isArray(a.validationIssues)) issues.push('artifact.validationIssues_not_array');
  else if(a.validationIssues.length !== 0) issues.push('artifact.validationIssues_not_empty');
  if(!obj(a.metrics)) issues.push('artifact.metrics_not_object');
  else {
    issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
    issues.push(...expectedFieldIssues(a.metrics, EXPECTED_USEFULNESS_METRICS, 'artifact.metrics'));
  }
  const items=arr(a.handoffItems);
  if(items.length !== EXPECTED_REPEATABILITY_ITEM_IDS.length) issues.push('artifact.handoffItems_not_exact_expected_count');
  const sourceIds=items.map((item)=>item?.sourceObservationId);
  for(const id of EXPECTED_REPEATABILITY_ITEM_IDS) if(!sourceIds.includes(id)) issues.push(`artifact.handoffItems.missing_source_observation:${redact(id)}`);
  for(const item of items){
    if(!obj(item)){ issues.push('artifact.handoffItem_not_object'); continue; }
    issues.push(...unknownKeys(item, HANDOFF_ITEM_ALLOWED_KEYS, `artifact.${redact(item.handoffId ?? 'handoffItem')}`));
    const def=HANDOFF_DEFINITIONS[item.sourceObservationId];
    if(!def) issues.push(`artifact.${redact(item.handoffId ?? item.sourceObservationId)}.source_observation_not_expected`);
    else {
      if(item.handoffId !== def.handoffId) issues.push(`artifact.${redact(item.handoffId)}.handoffId_not_pinned`);
      if(item.usefulnessLabel !== def.usefulnessLabel) issues.push(`artifact.${redact(item.handoffId)}.usefulnessLabel_not_pinned`);
      if(item.humanTreatment !== def.humanTreatment) issues.push(`artifact.${redact(item.handoffId)}.humanTreatment_not_pinned`);
      if(item.expectedHumanUtility !== def.expectedHumanUtility) issues.push(`artifact.${redact(item.handoffId)}.expectedHumanUtility_not_pinned`);
    }
    const expectedOrdinal=EXPECTED_REPEATABILITY_ITEM_IDS.indexOf(item.sourceObservationId)+1;
    if(item.windowOrdinal !== expectedOrdinal) issues.push(`artifact.${redact(item.handoffId)}.windowOrdinal_not_pinned`);
    if(item.sourceBound !== true || item.stableAcrossRuns !== true || item.redactedBeforePersist !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.policyDecision !== null) issues.push(`artifact.${redact(item.handoffId)}.boundary_flags_invalid`);
  }
  const judgements=arr(a.usefulnessJudgements);
  if(judgements.length !== EXPECTED_REPEATABILITY_ITEM_IDS.length) issues.push('artifact.usefulnessJudgements_not_exact_expected_count');
  const judgementIds=judgements.map((j)=>j?.sourceObservationId);
  for(const id of EXPECTED_REPEATABILITY_ITEM_IDS) if(!judgementIds.includes(id)) issues.push(`artifact.usefulnessJudgements.missing_source_observation:${redact(id)}`);
  for(const judgement of judgements){
    if(!obj(judgement)){ issues.push('artifact.usefulnessJudgement_not_object'); continue; }
    issues.push(...unknownKeys(judgement, USEFULNESS_JUDGEMENT_ALLOWED_KEYS, `artifact.${redact(judgement.judgementId ?? 'usefulnessJudgement')}`));
    const def=HANDOFF_DEFINITIONS[judgement.sourceObservationId];
    if(!def) issues.push(`artifact.${redact(judgement.judgementId ?? judgement.sourceObservationId)}.source_observation_not_expected`);
    else {
      if(judgement.handoffId !== def.handoffId) issues.push(`artifact.${redact(judgement.judgementId)}.handoffId_not_pinned`);
      if(judgement.judgementId !== `${def.handoffId}:bounded-passive-usefulness`) issues.push(`artifact.${redact(judgement.judgementId)}.judgementId_not_pinned`);
      if(judgement.cautionOnly !== (def.humanTreatment === 'include_as_caution_only')) issues.push(`artifact.${redact(judgement.judgementId)}.cautionOnly_not_pinned`);
    }
    if(judgement.usefulForHumanHandoff !== true || judgement.noiseForHumanHandoff !== false || judgement.sourceBound !== true || judgement.stableAcrossRuns !== true || judgement.redactedBeforePersist !== true || judgement.rawPersisted !== false || judgement.humanReviewOnly !== true || judgement.promoteToMemory !== false || judgement.agentConsumedOutput !== false || judgement.recommendationIsAuthority !== false || judgement.policyDecision !== null) issues.push(`artifact.${redact(judgement.judgementId)}.boundary_or_usefulness_flags_invalid`);
  }
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  for(const item of arr(a.handoffItems)) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) issues.push(`artifact.${redact(item.handoffId)}.boundary_flags_invalid`);
  if(typeof a.reportMarkdown !== 'string') issues.push('artifact.reportMarkdown_not_string');
  else issues.push(...tokenIssues(a.reportMarkdown, 'artifact.reportMarkdown'));
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceUsefulnessWindowReport(a){
  return [
    '# Passive Live Memory Coherence Usefulness Window v0.38.5',
    '',
    `usefulnessWindowStatus: ${a.usefulnessWindowStatus}`,
    `usefulnessWindowCount=${a.metrics.usefulnessWindowCount}`,
    `handoffItemCount=${a.metrics.handoffItemCount}`,
    `usefulHandoffItemCount=${a.metrics.usefulHandoffItemCount}`,
    `noisyHandoffItemCount=${a.metrics.noisyHandoffItemCount}`,
    `includeForHumanHandoffCount=${a.metrics.includeForHumanHandoffCount}`,
    `cautionOnlyCount=${a.metrics.cautionOnlyCount}`,
    `sourceBoundHandoffRatio=${a.metrics.sourceBoundHandoffRatio}`,
    `stableSignalCarryForwardRatio=${a.metrics.stableSignalCarryForwardRatio}`,
    `usefulHandoffRatio=${a.metrics.usefulHandoffRatio}`,
    `redactedBeforePersistRatio=${a.metrics.redactedBeforePersistRatio}`,
    `rawPersistedFalseRatio=${a.metrics.rawPersistedFalseRatio}`,
    `humanReviewOnlyRatio=${a.metrics.humanReviewOnlyRatio}`,
    `noPromotionWithoutHumanRatio=${a.metrics.noPromotionWithoutHumanRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable passive usefulness window only. It packages stable source-bound observations for human handoff review and does not write memory, change runtime behavior, or create agent-consumed policy.',
    '',
    '## Handoff items',
    ...a.handoffItems.map((o)=>`- ${o.handoffId}: source=${o.sourceObservationId}; label=${o.usefulnessLabel}; treatment=${o.humanTreatment}; useful=${o.expectedHumanUtility}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
