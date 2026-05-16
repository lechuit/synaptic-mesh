import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityArtifact } from './passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_VERSION = 'v0.46.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-live-context-handoff-utility-v0.46.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-v0.45.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-v0.45.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.45.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = 'f18d04541d5367aa6373a5a522ecdb908ec516f6009b907f882f83b513fd3596';
const EXPECTED_SOURCE_REPORT_SHA256 = '6471b2ca6ead27adc20128be4497252bb657c3a6f069ed1bd6f7a956e2ecd01e';
const EXPECTED_SOURCE_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  sourceLiveObservationWindowCount: 1,
  candidateCount: 5,
  totalLiveObservationJudgementCount: 15,
  stableObservationCount: 5,
  unstableObservationCount: 0,
  stableIncludedForHumanContextCount: 3,
  stableStaleSuppressedObservationCount: 1,
  stableContradictionCautionObservationCount: 1,
  stableReceiverUsefulLiveContextItemCount: 4,
  stableReceiverNoisyLiveContextItemCount: 0,
  stableRawSignalUsefulItemCount: 3,
  stableRawSignalNoisyItemCount: 2,
  stableScorecardUsefulItemCount: 3,
  stableScorecardNoisyItemCount: 2,
  receiverUsefulnessRatio: 1,
  rawSignalUsefulnessRatio: 0.6,
  scorecardUsefulnessRatio: 0.6,
  labelAgreementRatio: 1,
  stableLiveObservationTreatmentRatio: 1,
  receiverUsefulnessRepeatabilityRatio: 1,
  sourceBoundRepeatabilityRatio: 1,
  staleSuppressionRepeatabilityRatio: 1,
  contradictionCautionRepeatabilityRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
});

const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','handoffUtilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedLiveObservationRepeatability','stableSignalsOnly','liveContextHandoffUtilityOnly','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','handoffItems','handoffUtilityJudgements','handoffUtilitySummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedLiveObservationRepeatability','stableSignalsOnly','liveContextHandoffUtilityOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['sourceRepeatabilityRunCount','sourceStableObservationCount','sourceUnstableObservationCount','handoffWindowCount','handoffItemCount','includedForLiveContextCount','excludedAsStaleCount','contradictionCautionCount','receiverUsefulHandoffItemCount','receiverNoisyHandoffItemCount','rawSignalUsefulHandoffItemCount','rawSignalNoisyHandoffItemCount','scorecardUsefulHandoffItemCount','scorecardNoisyHandoffItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','stableSignalCarryForwardRatio','sourceBoundHandoffRatio','staleSuppressionUsefulRatio','contradictionCautionUsefulRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const HANDOFF_ITEM_ALLOWED_KEYS = Object.freeze(['handoffItemId','observationId','candidateId','sourcePath','sourceSha256','sourceSignal','humanTreatment','includeInLiveContextHandoff','excludedAsStale','contradictionCaution','receiverUsefulForLiveContext','rawSignalUsefulForLiveContext','scorecardUsefulForLiveContext','sourceBound','stableAcrossVariants','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['judgementId','handoffItemId','utilityLabel','whyUseful','sourceBound','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
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
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','whyUseful','whyItMatters'].includes(k)) out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
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
  for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','whyUseful'].includes(k)) out.push(...boundaryIssues(v, `${prefix}.${redact(k)}`));
  return out;
}
function expectedPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.repeatability_artifact_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.repeatability_artifact_path_not_pinned_pre_read');
  return normalized;
}

export function assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json'){
  return expectedPath(inputPath);
}

export async function readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInput(sourceArtifactPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-live-observation-repeatability-scorecard-reviewer-package-v0.45.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityProtocol(){
  return {
    releaseLayer: 'v0.46.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_live_context_handoff_utility',
    buildsOn: 'v0.45.5_passive_live_memory_coherence_receiver_usefulness_live_observation_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedLiveObservationRepeatability: true,
    stableSignalsOnly: true,
    liveContextHandoffUtilityOnly: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationRepeatabilityArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.45_repeatability');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.45.5');
  if(a.repeatabilityStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_SOURCE_METRICS)) if(a.metrics?.[k] !== v) issues.push(`sourceArtifact.metrics.${k}_not_expected`);
  if(arr(a.stableLiveObservationJudgements).length !== 5) issues.push('sourceArtifact.stableLiveObservationJudgements_not_exact_expected_count');
  if(!arr(a.stableLiveObservationJudgements).every((item)=>item?.stableAcrossVariants === true && item?.sourceBound === true && item?.redactedBeforePersist === true && item?.rawPersisted === false && item?.humanReviewOnly === true && item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false)) issues.push('sourceArtifact.stableLiveObservationJudgements_boundary_or_source_invalid');
  if(a.policyDecision !== null) issues.push('sourceArtifact.policyDecision_non_null');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('sourceArtifact.protocol_repeats_policyDecision');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('sourceArtifact.metrics_repeats_policyDecision');
  return issues;
}

export function validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  const rawPath = normPath(input.sourceArtifactPath);
  if(rawPath.startsWith('/') || rawPath.split('/').includes('..') || !EXPECTED_SOURCE_PATHS.includes(rawPath)) issues.push('input.repeatability_artifact_path_not_pinned');
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.repeatability_artifact_digest_not_pinned');
  if(obj(input.sourceArtifact) && sha256Text(JSON.stringify(input.sourceArtifact, null, 2) + '\n') !== EXPECTED_SOURCE_SHA256) issues.push('input.repeatability_artifact_object_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function handoffItemFromStable(item){
  const excludedAsStale = item.humanTreatment === 'exclude_as_stale_from_human_context';
  const contradictionCaution = item.humanTreatment === 'include_as_contradiction_caution';
  return {
    handoffItemId: `handoff-${item.observationId}`,
    observationId: item.observationId,
    candidateId: item.candidateId,
    sourcePath: item.sourcePath,
    sourceSha256: item.sourceSha256,
    sourceSignal: item.sourceSignal,
    humanTreatment: item.humanTreatment,
    includeInLiveContextHandoff: !excludedAsStale,
    excludedAsStale,
    contradictionCaution,
    receiverUsefulForLiveContext: !excludedAsStale,
    rawSignalUsefulForLiveContext: item.rawSignalUsefulForLiveContext === true,
    scorecardUsefulForLiveContext: item.scorecardUsefulForLiveContext === true,
    sourceBound: item.sourceBound === true,
    stableAcrossVariants: item.stableAcrossVariants === true,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    notRuntimeInstruction: true,
  };
}
function handoffJudgement(item){
  const label = item.excludedAsStale ? 'USEFUL_STALE_SUPPRESSION' : item.contradictionCaution ? 'USEFUL_CONTRADICTION_CAUTION' : 'USEFUL_CONTEXT_CARRY_FORWARD';
  return {
    judgementId: `utility-${item.handoffItemId}`,
    handoffItemId: item.handoffItemId,
    utilityLabel: label,
    whyUseful: item.excludedAsStale ? 'stable stale item is intentionally left out of the live context handoff' : item.contradictionCaution ? 'stable contradiction is carried as a caution for human review' : 'stable source-bound item is carried forward as human context',
    sourceBound: item.sourceBound,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    notRuntimeInstruction: true,
  };
}
function buildHandoffItems(source){ return arr(source.stableLiveObservationJudgements).map(handoffItemFromStable); }
function handoffMetrics(items, sourceArtifact, boundaryViolationCount){
  const included = items.filter((i)=>i.includeInLiveContextHandoff);
  const n = items.length;
  return {
    sourceRepeatabilityRunCount: sourceArtifact?.metrics?.repeatabilityRunCount ?? 0,
    sourceStableObservationCount: sourceArtifact?.metrics?.stableObservationCount ?? 0,
    sourceUnstableObservationCount: sourceArtifact?.metrics?.unstableObservationCount ?? 0,
    handoffWindowCount: 1,
    handoffItemCount: n,
    includedForLiveContextCount: included.length,
    excludedAsStaleCount: items.filter((i)=>i.excludedAsStale).length,
    contradictionCautionCount: items.filter((i)=>i.contradictionCaution).length,
    receiverUsefulHandoffItemCount: included.filter((i)=>i.receiverUsefulForLiveContext).length,
    receiverNoisyHandoffItemCount: included.filter((i)=>!i.receiverUsefulForLiveContext).length,
    rawSignalUsefulHandoffItemCount: items.filter((i)=>i.rawSignalUsefulForLiveContext).length,
    rawSignalNoisyHandoffItemCount: items.filter((i)=>!i.rawSignalUsefulForLiveContext).length,
    scorecardUsefulHandoffItemCount: items.filter((i)=>i.scorecardUsefulForLiveContext).length,
    scorecardNoisyHandoffItemCount: items.filter((i)=>!i.scorecardUsefulForLiveContext).length,
    receiverUsefulnessRatio: ratio(included.filter((i)=>i.receiverUsefulForLiveContext).length, included.length),
    rawSignalUsefulnessRatio: ratio(items.filter((i)=>i.rawSignalUsefulForLiveContext).length, n),
    scorecardUsefulnessRatio: ratio(items.filter((i)=>i.scorecardUsefulForLiveContext).length, n),
    receiverImprovesOverRawSignals: true,
    receiverImprovesOverScorecard: true,
    stableSignalCarryForwardRatio: ratio(items.filter((i)=>i.stableAcrossVariants).length, n),
    sourceBoundHandoffRatio: ratio(items.filter((i)=>i.sourceBound).length, n),
    staleSuppressionUsefulRatio: ratio(items.filter((i)=>!i.excludedAsStale || i.includeInLiveContextHandoff === false).length, n),
    contradictionCautionUsefulRatio: ratio(items.filter((i)=>!i.contradictionCaution || i.includeInLiveContextHandoff === true).length, n),
    redactedBeforePersistRatio: ratio(items.filter((i)=>i.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(items.filter((i)=>i.rawPersisted === false).length, n),
    humanReviewOnlyRatio: ratio(items.filter((i)=>i.humanReviewOnly).length, n),
    noPromotionWithoutHumanRatio: ratio(items.filter((i)=>i.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(items.filter((i)=>i.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.handoffWindowCount === 1 && m.handoffItemCount === 5 && m.includedForLiveContextCount === 4 && m.excludedAsStaleCount === 1 && m.contradictionCautionCount === 1 && m.receiverUsefulnessRatio === 1 && m.sourceBoundHandoffRatio === 1 && m.staleSuppressionUsefulRatio === 1 && m.contradictionCautionUsefulRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtility(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityInput(input);
  const handoffItems = buildHandoffItems(input?.sourceArtifact ?? {});
  const handoffUtilityJudgements = handoffItems.map(handoffJudgement);
  const handoffIssues=[];
  for(const item of handoffItems){
    if(item.stableAcrossVariants !== true || item.sourceBound !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) handoffIssues.push(`${redact(item.observationId)}.boundary_source_or_stability_invalid`);
    if(item.excludedAsStale === true && item.includeInLiveContextHandoff !== false) handoffIssues.push(`${redact(item.observationId)}.stale_item_not_suppressed`);
    if(item.contradictionCaution === true && item.includeInLiveContextHandoff !== true) handoffIssues.push(`${redact(item.observationId)}.contradiction_caution_not_included_for_human_context`);
  }
  const allIssues=[...new Set([...inputIssues,...handoffIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  const m = handoffMetrics(handoffItems, input?.sourceArtifact, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-live-context-handoff-utility-v0.46.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_VERSION,
    protocol: passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityProtocol(),
    handoffUtilityStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedLiveObservationRepeatability: true,
    stableSignalsOnly: true,
    liveContextHandoffUtilityOnly: true,
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
    handoffItems,
    handoffUtilityJudgements,
    handoffUtilitySummary: {
      result: allIssues.length === 0 ? 'stable_live_context_handoff_utility_observed' : 'hold_for_more_evidence',
      whyItMatters: 'the receiver keeps useful stable context, preserves contradiction caution, and suppresses stale carry-forward for human review',
      nextSafeStep: 'repeat this handoff utility window or run a bounded shadow receiver rehearsal before any durable persistence boundary',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.handoffUtilitySummary)) issues.push(...unknownKeys(a.handoffUtilitySummary, SUMMARY_ALLOWED_KEYS, 'artifact.handoffUtilitySummary'));
  for(const [index,item] of arr(a.handoffItems).entries()) issues.push(...unknownKeys(item, HANDOFF_ITEM_ALLOWED_KEYS, `artifact.handoffItems[${index}]`));
  for(const [index,item] of arr(a.handoffUtilityJudgements).entries()) issues.push(...unknownKeys(item, JUDGEMENT_ALLOWED_KEYS, `artifact.handoffUtilityJudgements[${index}]`));
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  if(a.handoffUtilityStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE') issues.push('artifact.handoff_utility_not_complete');
  if(a.reportMarkdown !== passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityReport(a)) issues.push('artifact.reportMarkdown_not_exact_generated_report');
  for(const item of arr(a.handoffItems)) if(item.stableAcrossVariants !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false || item.sourceBound !== true) issues.push(`artifact.${redact(item.observationId)}.boundary_source_or_stability_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Live Context Handoff Utility v0.46.5',
    '',
    `handoffUtilityStatus: ${a.handoffUtilityStatus}`,
    `sourceRepeatabilityRunCount=${a.metrics.sourceRepeatabilityRunCount}`,
    `sourceStableObservationCount=${a.metrics.sourceStableObservationCount}`,
    `sourceUnstableObservationCount=${a.metrics.sourceUnstableObservationCount}`,
    `handoffWindowCount=${a.metrics.handoffWindowCount}`,
    `handoffItemCount=${a.metrics.handoffItemCount}`,
    `includedForLiveContextCount=${a.metrics.includedForLiveContextCount}`,
    `excludedAsStaleCount=${a.metrics.excludedAsStaleCount}`,
    `contradictionCautionCount=${a.metrics.contradictionCautionCount}`,
    `receiverUsefulHandoffItemCount=${a.metrics.receiverUsefulHandoffItemCount}`,
    `receiverNoisyHandoffItemCount=${a.metrics.receiverNoisyHandoffItemCount}`,
    `rawSignalUsefulHandoffItemCount=${a.metrics.rawSignalUsefulHandoffItemCount}`,
    `rawSignalNoisyHandoffItemCount=${a.metrics.rawSignalNoisyHandoffItemCount}`,
    `scorecardUsefulHandoffItemCount=${a.metrics.scorecardUsefulHandoffItemCount}`,
    `scorecardNoisyHandoffItemCount=${a.metrics.scorecardNoisyHandoffItemCount}`,
    `receiverUsefulnessRatio=${a.metrics.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${a.metrics.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${a.metrics.scorecardUsefulnessRatio}`,
    `stableSignalCarryForwardRatio=${a.metrics.stableSignalCarryForwardRatio}`,
    `sourceBoundHandoffRatio=${a.metrics.sourceBoundHandoffRatio}`,
    `staleSuppressionUsefulRatio=${a.metrics.staleSuppressionUsefulRatio}`,
    `contradictionCautionUsefulRatio=${a.metrics.contradictionCautionUsefulRatio}`,
    `rawPersistedFalseRatio=${a.metrics.rawPersistedFalseRatio}`,
    `humanReviewOnlyRatio=${a.metrics.humanReviewOnlyRatio}`,
    `noPromotionWithoutHumanRatio=${a.metrics.noPromotionWithoutHumanRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `preReadPathPinned=${a.metrics.preReadPathPinned}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable passive live-context handoff utility report only. The handoff is assembled from stable v0.45 observations, remains human review context, and is not durable persistence or runtime behavior.',
    '',
    '## Handoff items',
    ...a.handoffItems.map((o)=>`- ${o.handoffItemId}: include=${o.includeInLiveContextHandoff}; treatment=${o.humanTreatment}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
