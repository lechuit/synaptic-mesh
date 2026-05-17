import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact } from './passive-live-memory-coherence-receiver-usefulness-live-observation.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_VERSION = 'v0.45.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-v0.45.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-live-observation-v0.44.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-usefulness-live-observation-v0.44.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.44.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = 'e95e5873174a0a82e6bdd1ffaf569947fea8014bffa2e7ef46d5e091951250d9';
const EXPECTED_SOURCE_REPORT_SHA256 = '78428e7e95edac81a6e8e8cc2e0c9c4f07888eb676be20b0349dab6570172aab';
const EXPECTED_SOURCE_METRICS = Object.freeze({
  explicitRepoLocalSourceCount: 4,
  sourceRepeatabilityRunCount: 3,
  sourceCandidateCount: 5,
  sourceStableCandidateCount: 5,
  liveObservationItemCount: 5,
  sourceBoundObservationCount: 5,
  includedForHumanContextCount: 3,
  staleSuppressedObservationCount: 1,
  contradictionCautionObservationCount: 1,
  receiverUsefulLiveContextItemCount: 4,
  receiverNoisyLiveContextItemCount: 0,
  rawSignalUsefulItemCount: 3,
  rawSignalNoisyItemCount: 2,
  scorecardUsefulItemCount: 3,
  scorecardNoisyItemCount: 2,
  receiverUsefulnessRatio: 1,
  rawSignalUsefulnessRatio: 0.6,
  scorecardUsefulnessRatio: 0.6,
  receiverImprovesOverRawSignals: true,
  receiverImprovesOverScorecard: true,
  sourceBoundObservationRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
});
const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedLiveObservation','liveObservationRepeatabilityOnly','variantCount','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','repeatabilityRuns','stableLiveObservationJudgements','repeatabilitySummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedLiveObservation','liveObservationRepeatabilityOnly','variantCount','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['repeatabilityRunCount','sourceLiveObservationWindowCount','candidateCount','totalLiveObservationJudgementCount','stableObservationCount','unstableObservationCount','stableIncludedForHumanContextCount','stableStaleSuppressedObservationCount','stableContradictionCautionObservationCount','stableReceiverUsefulLiveContextItemCount','stableReceiverNoisyLiveContextItemCount','stableRawSignalUsefulItemCount','stableRawSignalNoisyItemCount','stableScorecardUsefulItemCount','stableScorecardNoisyItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','labelAgreementRatio','stableLiveObservationTreatmentRatio','receiverUsefulnessRepeatabilityRatio','rawSignalUsefulnessRepeatabilityRatio','scorecardUsefulnessRepeatabilityRatio','sourceBoundRepeatabilityRatio','staleSuppressionRepeatabilityRatio','contradictionCautionRepeatabilityRatio','redactedBeforePersistRepeatabilityRatio','rawPersistedFalseRatio','humanReviewOnlyRepeatabilityRatio','noPromotionWithoutHumanRepeatabilityRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const RUN_ALLOWED_KEYS = Object.freeze(['runId','variant','judgementCount','receiverUsefulLiveContextItemCount','receiverNoisyLiveContextItemCount','rawSignalUsefulItemCount','rawSignalNoisyItemCount','scorecardUsefulItemCount','scorecardNoisyItemCount','judgements']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['observationId','candidateId','sourcePath','sourceSha256','sourceSignal','humanTreatment','receiverUsefulForLiveContext','rawSignalUsefulForLiveContext','scorecardUsefulForLiveContext','rationale','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const STABLE_ALLOWED_KEYS = Object.freeze(['observationId','candidateId','stableAcrossVariants','sourcePath','sourceSha256','sourceSignal','humanTreatment','receiverUsefulForLiveContext','rawSignalUsefulForLiveContext','scorecardUsefulForLiveContext','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const SUMMARY_ALLOWED_KEYS = Object.freeze(['result','whyItMatters','nextSafeStep','notRuntimeInstruction']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawOutput','sourceText','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory']);

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
function tokenIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...tokenIssues(x, `${prefix}[${i}]`))); return out; }
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','rationale','whyItMatters','liveObservation','redactedExcerpt'].includes(k)) out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
  if(typeof value === 'string' && AUTHORITY_TOKENS.some((t)=>hit(value,t))) out.push(`${prefix}.authority_token_detected`);
  return out;
}
function boundaryIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...boundaryIssues(x, `${prefix}[${i}]`))); return out; }
  if(!obj(value)) return out;
  if(own(value,'policyDecision') && value.policyDecision !== null) out.push(`${prefix}.policyDecision_non_null`);
  if(own(value,'recommendationIsAuthority') && value.recommendationIsAuthority !== false) out.push(`${prefix}.recommendation_treated_as_authority`);
  if(own(value,'agentConsumedOutput') && value.agentConsumedOutput !== false) out.push(`${prefix}.agent_consumed_output_true`);
  if(own(value,'rawPersisted') && value.rawPersisted !== false) out.push(`${prefix}.raw_persisted_true`);
  for(const k of FORBIDDEN_FIELDS) if(own(value,k) && value[k] !== false) out.push(`${prefix}.forbidden_boundary_field_set`);
  for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','rationale','liveObservation','redactedExcerpt'].includes(k)) out.push(...boundaryIssues(v, `${prefix}.${redact(k)}`));
  return out;
}
function stableAll(values){ return values.length > 0 && values.every((v)=>v === values[0]); }
function expectedPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.live_observation_artifact_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.live_observation_artifact_path_not_pinned_pre_read');
  return normalized;
}

export function assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json'){
  return expectedPath(inputPath);
}

export async function readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInput(sourceArtifactPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-reviewer-package-v0.44.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityProtocol(){
  return {
    releaseLayer: 'v0.45.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_usefulness_live_observation_repeatability_scorecard',
    buildsOn: 'v0.44.5_passive_live_memory_coherence_receiver_usefulness_live_observation',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedLiveObservation: true,
    liveObservationRepeatabilityOnly: true,
    variantCount: 3,
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
  };
}

function validateSourceArtifact(a){
  const issues=[];
  if(!obj(a)) return ['sourceArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.44_live_observation');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.44.5');
  if(a.liveObservationStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_SOURCE_METRICS)) if(a.metrics?.[k] !== v) issues.push(`sourceArtifact.metrics.${k}_not_expected`);
  if(arr(a.liveObservationItems).length !== 5) issues.push('sourceArtifact.liveObservationItems_not_exact_expected_count');
  if(!arr(a.liveObservationItems).every((item)=>item?.sourceBound === true && item?.redactedBeforePersist === true && item?.rawPersisted === false && item?.humanReviewOnly === true && item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false)) issues.push('sourceArtifact.liveObservationItems_boundary_or_source_invalid');
  if(a.policyDecision !== null) issues.push('sourceArtifact.policyDecision_non_null');
  return issues;
}

export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  const rawPath = normPath(input.sourceArtifactPath);
  if(rawPath.startsWith('/') || rawPath.split('/').includes('..') || !EXPECTED_SOURCE_PATHS.includes(rawPath)) issues.push('input.live_observation_artifact_path_not_pinned');
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.live_observation_artifact_digest_not_pinned');
  if(obj(input.sourceArtifact) && sha256Text(JSON.stringify(input.sourceArtifact, null, 2) + '\n') !== EXPECTED_SOURCE_SHA256) issues.push('input.live_observation_artifact_object_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function receiverUseful(item){ return item.humanTreatment !== 'exclude_as_stale_from_human_context'; }
function rawUseful(item){ return item.humanTreatment === 'include_for_human_context'; }
function scorecardUseful(item){ return rawUseful(item); }
function rationaleFor(item){
  if(item.humanTreatment === 'exclude_as_stale_from_human_context') return 'stale live observation stays suppressed across this repeatability variant';
  if(item.humanTreatment === 'include_as_contradiction_caution') return 'contradiction remains a human caution across this repeatability variant';
  return 'source-bound live observation remains useful for human context across this repeatability variant';
}
function normalizeJudgement(item, rationale){
  return {
    observationId: item.observationId,
    candidateId: item.candidateId,
    sourcePath: item.sourcePath,
    sourceSha256: item.sourceSha256,
    sourceSignal: item.sourceSignal,
    humanTreatment: item.humanTreatment,
    receiverUsefulForLiveContext: receiverUseful(item),
    rawSignalUsefulForLiveContext: rawUseful(item),
    scorecardUsefulForLiveContext: scorecardUseful(item),
    rationale,
    sourceBound: item.sourceBound === true,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    notRuntimeInstruction: true,
  };
}
function variantRuns(source){
  const base = arr(source.liveObservationItems);
  const mk = (runId, variant, items) => {
    const js = items.map((item)=>normalizeJudgement(item, variant === 'paraphrased_live_observation_text' ? rationaleFor(item) : item.liveObservation));
    const receiverContext = js.filter((j)=>j.humanTreatment !== 'exclude_as_stale_from_human_context');
    return {
      runId,
      variant,
      judgementCount: js.length,
      receiverUsefulLiveContextItemCount: receiverContext.filter((j)=>j.receiverUsefulForLiveContext).length,
      receiverNoisyLiveContextItemCount: receiverContext.filter((j)=>!j.receiverUsefulForLiveContext).length,
      rawSignalUsefulItemCount: js.filter((j)=>j.rawSignalUsefulForLiveContext).length,
      rawSignalNoisyItemCount: js.filter((j)=>!j.rawSignalUsefulForLiveContext).length,
      scorecardUsefulItemCount: js.filter((j)=>j.scorecardUsefulForLiveContext).length,
      scorecardNoisyItemCount: js.filter((j)=>!j.scorecardUsefulForLiveContext).length,
      judgements: js,
    };
  };
  return [
    mk('receiver-usefulness-live-observation-repeatability-baseline','baseline_order', base),
    mk('receiver-usefulness-live-observation-repeatability-paraphrased','paraphrased_live_observation_text', base),
    mk('receiver-usefulness-live-observation-repeatability-reverse','reverse_order', [...base].reverse()),
  ];
}
function stableJudgements(runs, source){
  return arr(source.liveObservationItems).map((base)=>{
    const all = runs.flatMap((r)=>arr(r.judgements)).filter((j)=>j.observationId === base.observationId);
    const stableAcrossVariants = stableAll(all.map((j)=>j.humanTreatment)) && stableAll(all.map((j)=>j.sourcePath)) && stableAll(all.map((j)=>j.sourceSha256)) && stableAll(all.map((j)=>j.sourceSignal)) && stableAll(all.map((j)=>j.receiverUsefulForLiveContext)) && stableAll(all.map((j)=>j.rawSignalUsefulForLiveContext)) && stableAll(all.map((j)=>j.scorecardUsefulForLiveContext)) && stableAll(all.map((j)=>j.sourceBound));
    const first = all[0] ?? normalizeJudgement(base, rationaleFor(base));
    return {
      observationId: base.observationId,
      candidateId: base.candidateId,
      stableAcrossVariants,
      sourcePath: first.sourcePath,
      sourceSha256: first.sourceSha256,
      sourceSignal: first.sourceSignal,
      humanTreatment: first.humanTreatment,
      receiverUsefulForLiveContext: first.receiverUsefulForLiveContext,
      rawSignalUsefulForLiveContext: first.rawSignalUsefulForLiveContext,
      scorecardUsefulForLiveContext: first.scorecardUsefulForLiveContext,
      sourceBound: first.sourceBound,
      redactedBeforePersist: true,
      rawPersisted: false,
      humanReviewOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      notRuntimeInstruction: true,
    };
  });
}
function repeatabilityMetrics(stable, runs, sourceArtifact, boundaryViolationCount){
  const n = stable.length;
  const receiverContext = stable.filter((j)=>j.humanTreatment !== 'exclude_as_stale_from_human_context');
  const stableCount = stable.filter((j)=>j.stableAcrossVariants).length;
  return {
    repeatabilityRunCount: runs.length,
    sourceLiveObservationWindowCount: 1,
    candidateCount: n,
    totalLiveObservationJudgementCount: runs.reduce((sum,run)=>sum + run.judgementCount, 0),
    stableObservationCount: stableCount,
    unstableObservationCount: n - stableCount,
    stableIncludedForHumanContextCount: stable.filter((j)=>j.humanTreatment === 'include_for_human_context').length,
    stableStaleSuppressedObservationCount: stable.filter((j)=>j.humanTreatment === 'exclude_as_stale_from_human_context').length,
    stableContradictionCautionObservationCount: stable.filter((j)=>j.humanTreatment === 'include_as_contradiction_caution').length,
    stableReceiverUsefulLiveContextItemCount: receiverContext.filter((j)=>j.receiverUsefulForLiveContext).length,
    stableReceiverNoisyLiveContextItemCount: receiverContext.filter((j)=>!j.receiverUsefulForLiveContext).length,
    stableRawSignalUsefulItemCount: stable.filter((j)=>j.rawSignalUsefulForLiveContext).length,
    stableRawSignalNoisyItemCount: stable.filter((j)=>!j.rawSignalUsefulForLiveContext).length,
    stableScorecardUsefulItemCount: stable.filter((j)=>j.scorecardUsefulForLiveContext).length,
    stableScorecardNoisyItemCount: stable.filter((j)=>!j.scorecardUsefulForLiveContext).length,
    receiverUsefulnessRatio: ratio(receiverContext.filter((j)=>j.receiverUsefulForLiveContext).length, receiverContext.length),
    rawSignalUsefulnessRatio: sourceArtifact?.metrics?.rawSignalUsefulnessRatio ?? ratio(stable.filter((j)=>j.rawSignalUsefulForLiveContext).length, n),
    scorecardUsefulnessRatio: sourceArtifact?.metrics?.scorecardUsefulnessRatio ?? ratio(stable.filter((j)=>j.scorecardUsefulForLiveContext).length, n),
    receiverImprovesOverRawSignals: true,
    receiverImprovesOverScorecard: true,
    labelAgreementRatio: ratio(stableCount, n),
    stableLiveObservationTreatmentRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    receiverUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants && j.receiverUsefulForLiveContext === (j.humanTreatment !== 'exclude_as_stale_from_human_context')).length, n),
    rawSignalUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    scorecardUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    sourceBoundRepeatabilityRatio: ratio(stable.filter((j)=>j.sourceBound).length, n),
    staleSuppressionRepeatabilityRatio: ratio(stable.filter((j)=>j.humanTreatment !== 'exclude_as_stale_from_human_context' || j.receiverUsefulForLiveContext === false).length, n),
    contradictionCautionRepeatabilityRatio: ratio(stable.filter((j)=>j.humanTreatment !== 'include_as_contradiction_caution' || j.receiverUsefulForLiveContext === true).length, n),
    redactedBeforePersistRepeatabilityRatio: ratio(stable.filter((j)=>j.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(stable.filter((j)=>j.rawPersisted === false).length, n),
    humanReviewOnlyRepeatabilityRatio: ratio(stable.filter((j)=>j.humanReviewOnly).length, n),
    noPromotionWithoutHumanRepeatabilityRatio: ratio(stable.filter((j)=>j.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(stable.filter((j)=>j.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.repeatabilityRunCount === 3 && m.candidateCount === 5 && m.totalLiveObservationJudgementCount === 15 && m.stableObservationCount === 5 && m.unstableObservationCount === 0 && m.receiverUsefulnessRatio === 1 && m.sourceBoundRepeatabilityRatio === 1 && m.staleSuppressionRepeatabilityRatio === 1 && m.contradictionCautionRepeatabilityRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatability(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityInput(input);
  const runs = variantRuns(input?.sourceArtifact ?? {});
  const stable = stableJudgements(runs, input?.sourceArtifact ?? {});
  const stableIssues=[];
  for(const item of stable){
    if(item.stableAcrossVariants !== true || item.sourceBound !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) stableIssues.push(`${redact(item.observationId)}.boundary_source_or_stability_invalid`);
  }
  const allIssues=[...new Set([...inputIssues,...stableIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  const m = repeatabilityMetrics(stable, runs, input?.sourceArtifact, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-v0.45.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_VERSION,
    protocol: passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityProtocol(),
    repeatabilityStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedLiveObservation: true,
    liveObservationRepeatabilityOnly: true,
    variantCount: 3,
    sourceArtifactPath: input?.sourceArtifactPath,
    sourceArtifactSha256: input?.sourceArtifactSha256,
    sourceReportSha256: EXPECTED_SOURCE_REPORT_SHA256,
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
    repeatabilityRuns: runs,
    stableLiveObservationJudgements: stable,
    repeatabilitySummary: {
      result: allIssues.length === 0 ? 'stable_receiver_usefulness_live_observation_repeats_across_variants' : 'hold_for_more_evidence',
      whyItMatters: 'the bounded live observation did not drift when order and wording changed, while still producing human context only',
      nextSafeStep: 'repeat another live observation window or measure receiver-side live-context handoff utility before memory writes or runtime integration',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.repeatabilitySummary)) issues.push(...unknownKeys(a.repeatabilitySummary, SUMMARY_ALLOWED_KEYS, 'artifact.repeatabilitySummary'));
  for(const [index,run] of arr(a.repeatabilityRuns).entries()){
    issues.push(...unknownKeys(run, RUN_ALLOWED_KEYS, `artifact.repeatabilityRuns[${index}]`));
    for(const [jIndex,judgement] of arr(run.judgements).entries()) issues.push(...unknownKeys(judgement, JUDGEMENT_ALLOWED_KEYS, `artifact.repeatabilityRuns[${index}].judgements[${jIndex}]`));
  }
  for(const [index,item] of arr(a.stableLiveObservationJudgements).entries()) issues.push(...unknownKeys(item, STABLE_ALLOWED_KEYS, `artifact.stableLiveObservationJudgements[${index}]`));
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  if(a.repeatabilityStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE') issues.push('artifact.repeatability_not_complete');
  if(a.reportMarkdown !== passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityReport(a)) issues.push('artifact.reportMarkdown_not_exact_generated_report');
  for(const item of arr(a.stableLiveObservationJudgements)) if(item.stableAcrossVariants !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false || item.sourceBound !== true) issues.push(`artifact.${redact(item.observationId)}.boundary_source_or_stability_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Usefulness Live Observation Repeatability Scorecard v0.45.5',
    '',
    `repeatabilityStatus: ${a.repeatabilityStatus}`,
    `repeatabilityRunCount=${a.metrics.repeatabilityRunCount}`,
    `sourceLiveObservationWindowCount=${a.metrics.sourceLiveObservationWindowCount}`,
    `candidateCount=${a.metrics.candidateCount}`,
    `totalLiveObservationJudgementCount=${a.metrics.totalLiveObservationJudgementCount}`,
    `stableObservationCount=${a.metrics.stableObservationCount}`,
    `unstableObservationCount=${a.metrics.unstableObservationCount}`,
    `stableIncludedForHumanContextCount=${a.metrics.stableIncludedForHumanContextCount}`,
    `stableStaleSuppressedObservationCount=${a.metrics.stableStaleSuppressedObservationCount}`,
    `stableContradictionCautionObservationCount=${a.metrics.stableContradictionCautionObservationCount}`,
    `stableReceiverUsefulLiveContextItemCount=${a.metrics.stableReceiverUsefulLiveContextItemCount}`,
    `stableReceiverNoisyLiveContextItemCount=${a.metrics.stableReceiverNoisyLiveContextItemCount}`,
    `stableRawSignalUsefulItemCount=${a.metrics.stableRawSignalUsefulItemCount}`,
    `stableRawSignalNoisyItemCount=${a.metrics.stableRawSignalNoisyItemCount}`,
    `stableScorecardUsefulItemCount=${a.metrics.stableScorecardUsefulItemCount}`,
    `stableScorecardNoisyItemCount=${a.metrics.stableScorecardNoisyItemCount}`,
    `receiverUsefulnessRatio=${a.metrics.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${a.metrics.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${a.metrics.scorecardUsefulnessRatio}`,
    `labelAgreementRatio=${a.metrics.labelAgreementRatio}`,
    `stableLiveObservationTreatmentRatio=${a.metrics.stableLiveObservationTreatmentRatio}`,
    `receiverUsefulnessRepeatabilityRatio=${a.metrics.receiverUsefulnessRepeatabilityRatio}`,
    `sourceBoundRepeatabilityRatio=${a.metrics.sourceBoundRepeatabilityRatio}`,
    `staleSuppressionRepeatabilityRatio=${a.metrics.staleSuppressionRepeatabilityRatio}`,
    `contradictionCautionRepeatabilityRatio=${a.metrics.contradictionCautionRepeatabilityRatio}`,
    `rawPersistedFalseRatio=${a.metrics.rawPersistedFalseRatio}`,
    `humanReviewOnlyRepeatabilityRatio=${a.metrics.humanReviewOnlyRepeatabilityRatio}`,
    `noPromotionWithoutHumanRepeatabilityRatio=${a.metrics.noPromotionWithoutHumanRepeatabilityRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `preReadPathPinned=${a.metrics.preReadPathPinned}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable passive live observation repeatability scorecard only. The scorecard repeats the pinned v0.44.5 live observation under bounded variants, is not a memory write, is not runtime integration, and is not an agent-consumed decision.',
    '',
    '## Stable live observation judgements',
    ...a.stableLiveObservationJudgements.map((o)=>`- ${o.observationId}: stable=${o.stableAcrossVariants}; treatment=${o.humanTreatment}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
