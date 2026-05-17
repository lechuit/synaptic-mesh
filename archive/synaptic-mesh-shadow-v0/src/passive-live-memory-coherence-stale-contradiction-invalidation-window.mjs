import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceUsefulnessWindowArtifact } from './passive-live-memory-coherence-usefulness-window.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_VERSION = 'v0.39.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-stale-contradiction-invalidation-window-v0.39.5';

const EXPECTED_USEFULNESS_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-usefulness-window-v0.38.5';
const EXPECTED_USEFULNESS_SCHEMA = 'passive-live-memory-coherence-usefulness-window-v0.38.0-alpha';
const EXPECTED_USEFULNESS_RELEASE = 'v0.38.5';
const EXPECTED_USEFULNESS_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE';
const EXPECTED_USEFULNESS_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json',
]);
const EXPECTED_USEFULNESS_SHA256 = 'cad1bdacfc6b7bad69da104193e790d210844008b54e97934d82bf1a2ffb7559';
const EXPECTED_USEFULNESS_REPORT_SHA256 = '4eaf699f9f39ee469ec47fe4abfe9be3274efacee9ac7b49e91ad01648f725c3';
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
const EXPECTED_HANDOFFS = Object.freeze({
  'handoff-current-release-continuity': Object.freeze({ sourceObservationId: 'obs-current-release-continuity', humanTreatment: 'include_for_human_handoff' }),
  'handoff-boundary-invariants': Object.freeze({ sourceObservationId: 'obs-boundary-invariants', humanTreatment: 'include_for_human_handoff' }),
  'handoff-repeatability-evidence': Object.freeze({ sourceObservationId: 'obs-repeatability-evidence', humanTreatment: 'include_for_human_handoff' }),
  'handoff-review-hardening-caution': Object.freeze({ sourceObservationId: 'obs-review-hardening-caution', humanTreatment: 'include_as_caution_only' }),
});
const EXPECTED_HANDOFF_IDS = Object.freeze(Object.keys(EXPECTED_HANDOFFS));
const INPUT_ALLOWED_KEYS = Object.freeze(['usefulnessArtifact','usefulnessArtifactPath','usefulnessArtifactSha256']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedUsefulnessArtifact','boundedInvalidationWindowOnly','staleSignalsInvalidated','contradictionsLabeledForHumanReview','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','invalidationWindowStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedUsefulnessArtifact','boundedInvalidationWindowOnly','staleSignalsInvalidated','contradictionsLabeledForHumanReview','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','invalidationCandidates','invalidationJudgements','reportMarkdown']);
const METRICS_ALLOWED_KEYS = Object.freeze(['invalidationWindowCount','candidateSignalCount','validCarryForwardCount','staleSignalCount','contradictionSignalCount','staleInvalidatedCount','contradictionCautionCount','includedForHumanHandoffCount','invalidatedOrCautionedSignalCount','sourceBoundInvalidationRatio','staleInvalidationRatio','contradictionCautionRatio','validCarryForwardRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','boundaryViolationCount','policyDecision']);
const CANDIDATE_ALLOWED_KEYS = Object.freeze(['candidateId','sourceHandoffId','sourceObservationId','signalKind','invalidationTreatment','humanTreatment','sourceBound','stableSourceSignal','stale','contradictsActiveBoundary','validCarryForward','invalidated','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['judgementId','candidateId','sourceHandoffId','sourceObservationId','staleSignalDetected','contradictionDetected','shouldCarryForward','shouldInvalidate','shouldCautionHuman','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const EXPECTED_METRICS = Object.freeze({
  invalidationWindowCount: 1,
  candidateSignalCount: 5,
  validCarryForwardCount: 3,
  staleSignalCount: 1,
  contradictionSignalCount: 1,
  staleInvalidatedCount: 1,
  contradictionCautionCount: 1,
  includedForHumanHandoffCount: 3,
  invalidatedOrCautionedSignalCount: 2,
  sourceBoundInvalidationRatio: 1,
  staleInvalidationRatio: 1,
  contradictionCautionRatio: 1,
  validCarryForwardRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);

function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function arr(v){ return Array.isArray(v) ? v : []; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
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

export function passiveLiveMemoryCoherenceInvalidationWindowProtocol(){
  return {
    releaseLayer: 'v0.39.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_stale_contradiction_invalidation_window',
    buildsOn: 'v0.38.5_bounded_passive_live_memory_coherence_usefulness_window',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedUsefulnessArtifact: true,
    boundedInvalidationWindowOnly: true,
    staleSignalsInvalidated: true,
    contradictionsLabeledForHumanReview: true,
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

export async function readPassiveLiveMemoryCoherenceInvalidationWindowInput(usefulnessArtifactPath = 'evidence/passive-live-memory-coherence-usefulness-window-reviewer-package-v0.38.5.out.json'){
  const raw = await readFile(usefulnessArtifactPath, 'utf8');
  return { usefulnessArtifact: JSON.parse(raw), usefulnessArtifactPath, usefulnessArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

function validateUsefulnessArtifact(a){
  const issues=[];
  if(!obj(a)) return ['usefulnessArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceUsefulnessWindowArtifact(a).map((i)=>`usefulnessArtifact.${i}`));
  if(a.artifact !== EXPECTED_USEFULNESS_ARTIFACT) issues.push('usefulnessArtifact.artifact_not_expected_v0.38_usefulness');
  if(a.schemaVersion !== EXPECTED_USEFULNESS_SCHEMA) issues.push('usefulnessArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_USEFULNESS_RELEASE) issues.push('usefulnessArtifact.release_layer_not_v0.38.5');
  if(a.usefulnessWindowStatus !== EXPECTED_USEFULNESS_STATUS) issues.push('usefulnessArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('usefulnessArtifact.reportMarkdown_not_string');
  else {
    if(sha256Text(a.reportMarkdown) !== EXPECTED_USEFULNESS_REPORT_SHA256) issues.push('usefulnessArtifact.reportMarkdown_digest_not_expected');
    issues.push(...tokenIssues(a.reportMarkdown, 'usefulnessArtifact.reportMarkdown'));
  }
  for(const [k,v] of Object.entries(EXPECTED_USEFULNESS_METRICS)) if(a.metrics?.[k] !== v) issues.push(`usefulnessArtifact.metrics.${k}_not_expected`);
  const handoffs = arr(a.handoffItems);
  if(handoffs.length !== 4) issues.push('usefulnessArtifact.handoff_items_not_exact_expected_count');
  const ids = handoffs.map((item)=>item?.handoffId);
  for(const id of EXPECTED_HANDOFF_IDS) if(!ids.includes(id)) issues.push(`usefulnessArtifact.handoff_missing:${redact(id)}`);
  for(const item of handoffs){
    if(!obj(item)){ issues.push('usefulnessArtifact.handoff_not_object'); continue; }
    const expected = EXPECTED_HANDOFFS[item.handoffId];
    if(!expected) issues.push(`usefulnessArtifact.${redact(item.handoffId)}.handoff_not_expected`);
    else {
      if(item.sourceObservationId !== expected.sourceObservationId) issues.push(`usefulnessArtifact.${redact(item.handoffId)}.sourceObservationId_not_pinned`);
      if(item.humanTreatment !== expected.humanTreatment) issues.push(`usefulnessArtifact.${redact(item.handoffId)}.humanTreatment_not_pinned`);
    }
    if(item.sourceBound !== true || item.stableAcrossRuns !== true || item.redactedBeforePersist !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.policyDecision !== null) issues.push(`usefulnessArtifact.${redact(item.handoffId)}.boundary_flags_invalid`);
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceInvalidationWindowInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_USEFULNESS_PATHS.includes(normPath(input.usefulnessArtifactPath))) issues.push('input.usefulness_artifact_path_not_pinned');
  if(input.usefulnessArtifactSha256 !== EXPECTED_USEFULNESS_SHA256) issues.push('input.usefulness_artifact_digest_not_pinned');
  if(obj(input.usefulnessArtifact) && sha256Text(JSON.stringify(input.usefulnessArtifact, null, 2) + '\n') !== EXPECTED_USEFULNESS_SHA256) issues.push('input.usefulness_artifact_object_digest_not_pinned');
  issues.push(...validateUsefulnessArtifact(input.usefulnessArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function invalidationCandidates(handoffs){
  const byId = Object.fromEntries(arr(handoffs).map((item)=>[item.handoffId,item]));
  const base = [
    ['candidate-current-release-continuity','handoff-current-release-continuity','current_valid_continuity','carry_forward_valid','include_for_human_handoff',false,false,true,false],
    ['candidate-boundary-invariants','handoff-boundary-invariants','current_valid_boundary','carry_forward_valid','include_for_human_handoff',false,false,true,false],
    ['candidate-repeatability-evidence','handoff-repeatability-evidence','current_valid_evidence','carry_forward_valid','include_for_human_handoff',false,false,true,false],
    ['candidate-stale-prior-release-anchor','handoff-current-release-continuity','stale_prior_release_anchor','invalidate_as_stale','exclude_from_handoff_as_stale',true,false,false,true],
    ['candidate-contradictory-boundary-claim','handoff-boundary-invariants','contradictory_boundary_claim','label_contradiction_for_human_review','include_as_contradiction_caution',false,true,false,false],
  ];
  return base.map(([candidateId, sourceHandoffId, signalKind, invalidationTreatment, humanTreatment, stale, contradictsActiveBoundary, validCarryForward, invalidated])=>({
    candidateId,
    sourceHandoffId,
    sourceObservationId: byId[sourceHandoffId]?.sourceObservationId ?? 'missing-source-observation',
    signalKind,
    invalidationTreatment,
    humanTreatment,
    sourceBound: true,
    stableSourceSignal: true,
    stale,
    contradictsActiveBoundary,
    validCarryForward,
    invalidated,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function invalidationJudgements(candidates){
  return candidates.map((c)=>({
    judgementId: `${c.candidateId}:passive-invalidation`,
    candidateId: c.candidateId,
    sourceHandoffId: c.sourceHandoffId,
    sourceObservationId: c.sourceObservationId,
    staleSignalDetected: c.stale,
    contradictionDetected: c.contradictsActiveBoundary,
    shouldCarryForward: c.validCarryForward,
    shouldInvalidate: c.stale,
    shouldCautionHuman: c.contradictsActiveBoundary,
    sourceBound: c.sourceBound,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function metrics(candidates){
  const judgements=invalidationJudgements(candidates);
  const stale=candidates.filter((c)=>c.stale).length;
  const contradictions=candidates.filter((c)=>c.contradictsActiveBoundary).length;
  const valid=candidates.filter((c)=>c.validCarryForward).length;
  const staleInvalidated=judgements.filter((j)=>j.staleSignalDetected && j.shouldInvalidate).length;
  const contradictionCaution=judgements.filter((j)=>j.contradictionDetected && j.shouldCautionHuman && !j.shouldInvalidate).length;
  return {
    invalidationWindowCount: 1,
    candidateSignalCount: candidates.length,
    validCarryForwardCount: valid,
    staleSignalCount: stale,
    contradictionSignalCount: contradictions,
    staleInvalidatedCount: staleInvalidated,
    contradictionCautionCount: contradictionCaution,
    includedForHumanHandoffCount: candidates.filter((c)=>c.humanTreatment === 'include_for_human_handoff').length,
    invalidatedOrCautionedSignalCount: staleInvalidated + contradictionCaution,
    sourceBoundInvalidationRatio: ratio(judgements.filter((j)=>j.sourceBound).length, judgements.length),
    staleInvalidationRatio: ratio(staleInvalidated, stale),
    contradictionCautionRatio: ratio(contradictionCaution, contradictions),
    validCarryForwardRatio: ratio(valid, 3),
    redactedBeforePersistRatio: ratio(candidates.filter((c)=>c.redactedBeforePersist).length, candidates.length),
    rawPersistedFalseRatio: ratio(candidates.filter((c)=>c.rawPersisted === false).length, candidates.length),
    humanReviewOnlyRatio: ratio(candidates.filter((c)=>c.humanReviewOnly).length, candidates.length),
    noPromotionWithoutHumanRatio: ratio(candidates.filter((c)=>c.promoteToMemory === false).length, candidates.length),
    agentConsumedOutputFalseRatio: ratio(candidates.filter((c)=>c.agentConsumedOutput === false).length, candidates.length),
    boundaryViolationCount: 0,
    policyDecision: null,
  };
}
function recommendation(m, issues){ return issues.length === 0 && m.staleInvalidationRatio === 1 && m.contradictionCautionRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE'; }

export function scorePassiveLiveMemoryCoherenceInvalidationWindow(input={}){
  const validationIssues=validatePassiveLiveMemoryCoherenceInvalidationWindowInput(input);
  const candidates=invalidationCandidates(input.usefulnessArtifact?.handoffItems);
  const judgements=invalidationJudgements(candidates);
  const m=metrics(candidates);
  const allIssues=[...new Set([...validationIssues, ...boundaryIssues({candidates,judgements}, 'output'), ...tokenIssues({candidates,judgements}, 'output')])];
  m.boundaryViolationCount = allIssues.filter((i)=>i.includes('boundary') || i.includes('policyDecision') || i.includes('authority_token')).length;
  const artifact={
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-stale-contradiction-invalidation-window-v0.39.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_VERSION,
    protocol: passiveLiveMemoryCoherenceInvalidationWindowProtocol(),
    invalidationWindowStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedUsefulnessArtifact: true,
    boundedInvalidationWindowOnly: true,
    staleSignalsInvalidated: true,
    contradictionsLabeledForHumanReview: true,
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
    invalidationCandidates: candidates,
    invalidationJudgements: judgements,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceInvalidationWindowReport(artifact);
  return artifact;
}

const EXPECTED_ARTIFACT_FIELDS = Object.freeze({
  artifact: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_ARTIFACT,
  schemaVersion: 'passive-live-memory-coherence-stale-contradiction-invalidation-window-v0.39.0-alpha',
  releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_VERSION,
  invalidationWindowStatus: 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE',
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedUsefulnessArtifact: true,
  boundedInvalidationWindowOnly: true,
  staleSignalsInvalidated: true,
  contradictionsLabeledForHumanReview: true,
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

export function validatePassiveLiveMemoryCoherenceInvalidationWindowArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  issues.push(...expectedFieldIssues(a, EXPECTED_ARTIFACT_FIELDS, 'artifact'));
  if(!obj(a.protocol)) issues.push('artifact.protocol_not_object');
  else { issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol')); issues.push(...expectedFieldIssues(a.protocol, passiveLiveMemoryCoherenceInvalidationWindowProtocol(), 'artifact.protocol')); }
  if(!Array.isArray(a.validationIssues)) issues.push('artifact.validationIssues_not_array');
  else if(a.validationIssues.length !== 0) issues.push('artifact.validationIssues_not_empty');
  if(!obj(a.metrics)) issues.push('artifact.metrics_not_object');
  else { issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics')); issues.push(...expectedFieldIssues(a.metrics, EXPECTED_METRICS, 'artifact.metrics')); }
  const candidates=arr(a.invalidationCandidates);
  if(candidates.length !== 5) issues.push('artifact.invalidationCandidates_not_exact_expected_count');
  for(const c of candidates){
    if(!obj(c)){ issues.push('artifact.invalidationCandidate_not_object'); continue; }
    issues.push(...unknownKeys(c, CANDIDATE_ALLOWED_KEYS, `artifact.${redact(c.candidateId ?? 'candidate')}`));
    if(c.sourceBound !== true || c.stableSourceSignal !== true || c.redactedBeforePersist !== true || c.rawPersisted !== false || c.humanReviewOnly !== true || c.promoteToMemory !== false || c.agentConsumedOutput !== false || c.recommendationIsAuthority !== false || c.policyDecision !== null) issues.push(`artifact.${redact(c.candidateId)}.boundary_flags_invalid`);
    if(c.signalKind === 'stale_prior_release_anchor' && (c.stale !== true || c.invalidated !== true || c.invalidationTreatment !== 'invalidate_as_stale')) issues.push(`artifact.${redact(c.candidateId)}.stale_signal_not_invalidated`);
    if(c.signalKind === 'contradictory_boundary_claim' && (c.contradictsActiveBoundary !== true || c.humanTreatment !== 'include_as_contradiction_caution' || c.invalidated !== false)) issues.push(`artifact.${redact(c.candidateId)}.contradiction_not_cautioned`);
    if(c.validCarryForward === true && (c.stale !== false || c.contradictsActiveBoundary !== false || c.invalidated !== false || c.humanTreatment !== 'include_for_human_handoff')) issues.push(`artifact.${redact(c.candidateId)}.valid_signal_not_carried_forward_cleanly`);
  }
  const judgements=arr(a.invalidationJudgements);
  if(judgements.length !== 5) issues.push('artifact.invalidationJudgements_not_exact_expected_count');
  for(const j of judgements){
    if(!obj(j)){ issues.push('artifact.invalidationJudgement_not_object'); continue; }
    issues.push(...unknownKeys(j, JUDGEMENT_ALLOWED_KEYS, `artifact.${redact(j.judgementId ?? 'judgement')}`));
    if(j.sourceBound !== true || j.redactedBeforePersist !== true || j.rawPersisted !== false || j.humanReviewOnly !== true || j.promoteToMemory !== false || j.agentConsumedOutput !== false || j.recommendationIsAuthority !== false || j.policyDecision !== null) issues.push(`artifact.${redact(j.judgementId)}.boundary_flags_invalid`);
    if(j.staleSignalDetected === true && j.shouldInvalidate !== true) issues.push(`artifact.${redact(j.judgementId)}.stale_judgement_not_invalidated`);
    if(j.contradictionDetected === true && j.shouldCautionHuman !== true) issues.push(`artifact.${redact(j.judgementId)}.contradiction_judgement_not_cautioned`);
  }
  if(typeof a.reportMarkdown !== 'string') issues.push('artifact.reportMarkdown_not_string');
  else issues.push(...tokenIssues(a.reportMarkdown, 'artifact.reportMarkdown'));
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceInvalidationWindowReport(a){
  return [
    '# Passive Live Memory Coherence Stale/Contradiction Invalidation Window v0.39.5',
    '',
    `invalidationWindowStatus: ${a.invalidationWindowStatus}`,
    `invalidationWindowCount=${a.metrics.invalidationWindowCount}`,
    `candidateSignalCount=${a.metrics.candidateSignalCount}`,
    `validCarryForwardCount=${a.metrics.validCarryForwardCount}`,
    `staleSignalCount=${a.metrics.staleSignalCount}`,
    `contradictionSignalCount=${a.metrics.contradictionSignalCount}`,
    `staleInvalidatedCount=${a.metrics.staleInvalidatedCount}`,
    `contradictionCautionCount=${a.metrics.contradictionCautionCount}`,
    `includedForHumanHandoffCount=${a.metrics.includedForHumanHandoffCount}`,
    `invalidatedOrCautionedSignalCount=${a.metrics.invalidatedOrCautionedSignalCount}`,
    `sourceBoundInvalidationRatio=${a.metrics.sourceBoundInvalidationRatio}`,
    `staleInvalidationRatio=${a.metrics.staleInvalidationRatio}`,
    `contradictionCautionRatio=${a.metrics.contradictionCautionRatio}`,
    `validCarryForwardRatio=${a.metrics.validCarryForwardRatio}`,
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
    'Human-readable passive invalidation window only. It labels stale and contradictory memory/coherence signals for human review and does not write memory, change runtime behavior, or create agent-consumed policy.',
    '',
    '## Invalidation candidates',
    ...a.invalidationCandidates.map((o)=>`- ${o.candidateId}: source=${o.sourceHandoffId}; kind=${o.signalKind}; treatment=${o.invalidationTreatment}; humanTreatment=${o.humanTreatment}; stale=${o.stale}; contradiction=${o.contradictsActiveBoundary}; invalidated=${o.invalidated}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
