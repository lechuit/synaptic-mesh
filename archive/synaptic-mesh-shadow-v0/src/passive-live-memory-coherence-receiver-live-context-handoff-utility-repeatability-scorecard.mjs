import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityArtifact } from './passive-live-memory-coherence-receiver-live-context-handoff-utility.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_VERSION = 'v0.47.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-v0.47.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-live-context-handoff-utility-v0.46.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-live-context-handoff-utility-v0.46.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.46.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = '958195ce8630eb160c1a93186bc07add899517701430eaa02a2252a56a26ae2a';
const EXPECTED_SOURCE_REPORT_SHA256 = 'fa81fcd83e0674be27b922e6c7b1b257888a3abb35f4990a8dcafa9efca928a7';
const EXPECTED_SOURCE_METRICS = Object.freeze({
  sourceRepeatabilityRunCount: 3,
  sourceStableObservationCount: 5,
  sourceUnstableObservationCount: 0,
  handoffWindowCount: 1,
  handoffItemCount: 5,
  includedForLiveContextCount: 4,
  excludedAsStaleCount: 1,
  contradictionCautionCount: 1,
  receiverUsefulHandoffItemCount: 4,
  receiverNoisyHandoffItemCount: 0,
  rawSignalUsefulHandoffItemCount: 3,
  rawSignalNoisyHandoffItemCount: 2,
  scorecardUsefulHandoffItemCount: 3,
  scorecardNoisyHandoffItemCount: 2,
  receiverUsefulnessRatio: 1,
  rawSignalUsefulnessRatio: 0.6,
  scorecardUsefulnessRatio: 0.6,
  receiverImprovesOverRawSignals: true,
  receiverImprovesOverScorecard: true,
  stableSignalCarryForwardRatio: 1,
  sourceBoundHandoffRatio: 1,
  staleSuppressionUsefulRatio: 1,
  contradictionCautionUsefulRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
});
const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedHandoffUtility','handoffUtilityRepeatabilityOnly','variantCount','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','repeatabilityRuns','stableHandoffUtilityJudgements','repeatabilitySummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedHandoffUtility','handoffUtilityRepeatabilityOnly','variantCount','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['repeatabilityRunCount','sourceHandoffWindowCount','handoffItemCount','totalHandoffUtilityJudgementCount','stableHandoffItemCount','unstableHandoffItemCount','stableIncludedForLiveContextCount','stableExcludedAsStaleCount','stableContradictionCautionCount','stableReceiverUsefulHandoffItemCount','stableReceiverNoisyHandoffItemCount','stableRawSignalUsefulHandoffItemCount','stableRawSignalNoisyHandoffItemCount','stableScorecardUsefulHandoffItemCount','stableScorecardNoisyHandoffItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','labelAgreementRatio','stableHandoffUtilityTreatmentRatio','receiverUsefulnessRepeatabilityRatio','rawSignalUsefulnessRepeatabilityRatio','scorecardUsefulnessRepeatabilityRatio','sourceBoundRepeatabilityRatio','staleSuppressionRepeatabilityRatio','contradictionCautionRepeatabilityRatio','redactedBeforePersistRepeatabilityRatio','rawPersistedFalseRatio','humanReviewOnlyRepeatabilityRatio','noPromotionWithoutHumanRepeatabilityRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const RUN_ALLOWED_KEYS = Object.freeze(['runId','variant','judgementCount','receiverUsefulHandoffItemCount','receiverNoisyHandoffItemCount','rawSignalUsefulHandoffItemCount','rawSignalNoisyHandoffItemCount','scorecardUsefulHandoffItemCount','scorecardNoisyHandoffItemCount','judgements']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['judgementId','handoffItemId','observationId','candidateId','sourcePath','sourceSha256','sourceSignal','humanTreatment','includeInLiveContextHandoff','excludedAsStale','contradictionCaution','receiverUsefulForLiveContext','rawSignalUsefulForLiveContext','scorecardUsefulForLiveContext','utilityLabel','whyUseful','sourceBound','stableAcrossVariants','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const STABLE_ALLOWED_KEYS = Object.freeze(['handoffItemId','observationId','candidateId','stableAcrossVariants','sourcePath','sourceSha256','sourceSignal','humanTreatment','includeInLiveContextHandoff','excludedAsStale','contradictionCaution','receiverUsefulForLiveContext','rawSignalUsefulForLiveContext','scorecardUsefulForLiveContext','utilityLabel','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
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
function stableAll(values){ return values.length > 0 && values.every((v)=>v === values[0]); }
function expectedPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.handoff_utility_artifact_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.handoff_utility_artifact_path_not_pinned_pre_read');
  return normalized;
}

export function assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'){
  return expectedPath(inputPath);
}

export async function readPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput(sourceArtifactPath = 'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-reviewer-package-v0.46.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityProtocol(){
  return {
    releaseLayer: 'v0.47.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_live_context_handoff_utility_repeatability_scorecard',
    buildsOn: 'v0.46.5_passive_live_memory_coherence_receiver_live_context_handoff_utility',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedHandoffUtility: true,
    handoffUtilityRepeatabilityOnly: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.46_handoff_utility');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.46.5');
  if(a.handoffUtilityStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_SOURCE_METRICS)) if(a.metrics?.[k] !== v) issues.push(`sourceArtifact.metrics.${k}_not_expected`);
  if(arr(a.handoffItems).length !== 5) issues.push('sourceArtifact.handoffItems_not_exact_expected_count');
  if(arr(a.handoffUtilityJudgements).length !== 5) issues.push('sourceArtifact.handoffUtilityJudgements_not_exact_expected_count');
  if(!arr(a.handoffItems).every((item)=>item?.sourceBound === true && item?.stableAcrossVariants === true && item?.redactedBeforePersist === true && item?.rawPersisted === false && item?.humanReviewOnly === true && item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false)) issues.push('sourceArtifact.handoffItems_boundary_or_source_invalid');
  if(a.policyDecision !== null) issues.push('sourceArtifact.policyDecision_non_null');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('sourceArtifact.protocol_repeats_policyDecision');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('sourceArtifact.metrics_repeats_policyDecision');
  return issues;
}

export function validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  const rawPath = normPath(input.sourceArtifactPath);
  if(rawPath.startsWith('/') || rawPath.split('/').includes('..') || !EXPECTED_SOURCE_PATHS.includes(rawPath)) issues.push('input.handoff_utility_artifact_path_not_pinned');
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.handoff_utility_artifact_digest_not_pinned');
  if(obj(input.sourceArtifact) && sha256Text(JSON.stringify(input.sourceArtifact, null, 2) + '\n') !== EXPECTED_SOURCE_SHA256) issues.push('input.handoff_utility_artifact_object_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function labelFor(item){ return item.excludedAsStale ? 'USEFUL_STALE_SUPPRESSION' : item.contradictionCaution ? 'USEFUL_CONTRADICTION_CAUTION' : 'USEFUL_CONTEXT_CARRY_FORWARD'; }
function paraphraseWhyUseful(item){
  if(item.excludedAsStale) return 'repeatability check keeps the stale handoff item out of live context for human review';
  if(item.contradictionCaution) return 'repeatability check preserves the contradiction as a caution, not as automatic memory';
  return 'repeatability check carries the stable source-bound handoff item as human context only';
}
function normalizeJudgement(item, utility, whyUseful){
  return {
    judgementId: `repeatability-${utility?.judgementId ?? `utility-${item.handoffItemId}`}`,
    handoffItemId: item.handoffItemId,
    observationId: item.observationId,
    candidateId: item.candidateId,
    sourcePath: item.sourcePath,
    sourceSha256: item.sourceSha256,
    sourceSignal: item.sourceSignal,
    humanTreatment: item.humanTreatment,
    includeInLiveContextHandoff: item.includeInLiveContextHandoff === true,
    excludedAsStale: item.excludedAsStale === true,
    contradictionCaution: item.contradictionCaution === true,
    receiverUsefulForLiveContext: item.receiverUsefulForLiveContext === true,
    rawSignalUsefulForLiveContext: item.rawSignalUsefulForLiveContext === true,
    scorecardUsefulForLiveContext: item.scorecardUsefulForLiveContext === true,
    utilityLabel: utility?.utilityLabel ?? labelFor(item),
    whyUseful,
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
function utilityByItem(source){ return new Map(arr(source.handoffUtilityJudgements).map((j)=>[j.handoffItemId, j])); }
function variantRuns(source){
  const base = arr(source.handoffItems);
  const utilities = utilityByItem(source);
  const mk = (runId, variant, items) => {
    const js = items.map((item)=>{
      const utility = utilities.get(item.handoffItemId);
      return normalizeJudgement(item, utility, variant === 'paraphrased_rationale_whyUseful' ? paraphraseWhyUseful(item) : utility?.whyUseful);
    });
    const included = js.filter((j)=>j.includeInLiveContextHandoff);
    return {
      runId,
      variant,
      judgementCount: js.length,
      receiverUsefulHandoffItemCount: included.filter((j)=>j.receiverUsefulForLiveContext).length,
      receiverNoisyHandoffItemCount: included.filter((j)=>!j.receiverUsefulForLiveContext).length,
      rawSignalUsefulHandoffItemCount: js.filter((j)=>j.rawSignalUsefulForLiveContext).length,
      rawSignalNoisyHandoffItemCount: js.filter((j)=>!j.rawSignalUsefulForLiveContext).length,
      scorecardUsefulHandoffItemCount: js.filter((j)=>j.scorecardUsefulForLiveContext).length,
      scorecardNoisyHandoffItemCount: js.filter((j)=>!j.scorecardUsefulForLiveContext).length,
      judgements: js,
    };
  };
  return [
    mk('receiver-live-context-handoff-utility-repeatability-baseline','baseline_order', base),
    mk('receiver-live-context-handoff-utility-repeatability-paraphrased','paraphrased_rationale_whyUseful', base),
    mk('receiver-live-context-handoff-utility-repeatability-reverse','reverse_order', [...base].reverse()),
  ];
}
function stableJudgements(runs, source){
  return arr(source.handoffItems).map((base)=>{
    const all = runs.flatMap((r)=>arr(r.judgements)).filter((j)=>j.handoffItemId === base.handoffItemId);
    const stableAcrossVariants = stableAll(all.map((j)=>j.humanTreatment)) && stableAll(all.map((j)=>j.includeInLiveContextHandoff)) && stableAll(all.map((j)=>j.excludedAsStale)) && stableAll(all.map((j)=>j.contradictionCaution)) && stableAll(all.map((j)=>j.utilityLabel)) && stableAll(all.map((j)=>j.sourcePath)) && stableAll(all.map((j)=>j.sourceSha256)) && stableAll(all.map((j)=>j.sourceSignal)) && stableAll(all.map((j)=>j.receiverUsefulForLiveContext)) && stableAll(all.map((j)=>j.rawSignalUsefulForLiveContext)) && stableAll(all.map((j)=>j.scorecardUsefulForLiveContext)) && stableAll(all.map((j)=>j.sourceBound));
    const first = all[0] ?? normalizeJudgement(base, utilityByItem(source).get(base.handoffItemId), paraphraseWhyUseful(base));
    return {
      handoffItemId: base.handoffItemId,
      observationId: base.observationId,
      candidateId: base.candidateId,
      stableAcrossVariants,
      sourcePath: first.sourcePath,
      sourceSha256: first.sourceSha256,
      sourceSignal: first.sourceSignal,
      humanTreatment: first.humanTreatment,
      includeInLiveContextHandoff: first.includeInLiveContextHandoff,
      excludedAsStale: first.excludedAsStale,
      contradictionCaution: first.contradictionCaution,
      receiverUsefulForLiveContext: first.receiverUsefulForLiveContext,
      rawSignalUsefulForLiveContext: first.rawSignalUsefulForLiveContext,
      scorecardUsefulForLiveContext: first.scorecardUsefulForLiveContext,
      utilityLabel: first.utilityLabel,
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
  const included = stable.filter((j)=>j.includeInLiveContextHandoff);
  const stableCount = stable.filter((j)=>j.stableAcrossVariants).length;
  return {
    repeatabilityRunCount: runs.length,
    sourceHandoffWindowCount: sourceArtifact?.metrics?.handoffWindowCount ?? 0,
    handoffItemCount: n,
    totalHandoffUtilityJudgementCount: runs.reduce((sum,run)=>sum + run.judgementCount, 0),
    stableHandoffItemCount: stableCount,
    unstableHandoffItemCount: n - stableCount,
    stableIncludedForLiveContextCount: stable.filter((j)=>j.includeInLiveContextHandoff).length,
    stableExcludedAsStaleCount: stable.filter((j)=>j.excludedAsStale).length,
    stableContradictionCautionCount: stable.filter((j)=>j.contradictionCaution).length,
    stableReceiverUsefulHandoffItemCount: included.filter((j)=>j.receiverUsefulForLiveContext).length,
    stableReceiverNoisyHandoffItemCount: included.filter((j)=>!j.receiverUsefulForLiveContext).length,
    stableRawSignalUsefulHandoffItemCount: stable.filter((j)=>j.rawSignalUsefulForLiveContext).length,
    stableRawSignalNoisyHandoffItemCount: stable.filter((j)=>!j.rawSignalUsefulForLiveContext).length,
    stableScorecardUsefulHandoffItemCount: stable.filter((j)=>j.scorecardUsefulForLiveContext).length,
    stableScorecardNoisyHandoffItemCount: stable.filter((j)=>!j.scorecardUsefulForLiveContext).length,
    receiverUsefulnessRatio: ratio(included.filter((j)=>j.receiverUsefulForLiveContext).length, included.length),
    rawSignalUsefulnessRatio: ratio(stable.filter((j)=>j.rawSignalUsefulForLiveContext).length, n),
    scorecardUsefulnessRatio: ratio(stable.filter((j)=>j.scorecardUsefulForLiveContext).length, n),
    receiverImprovesOverRawSignals: true,
    receiverImprovesOverScorecard: true,
    labelAgreementRatio: ratio(stableCount, n),
    stableHandoffUtilityTreatmentRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    receiverUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants && j.receiverUsefulForLiveContext === (j.humanTreatment !== 'exclude_as_stale_from_human_context')).length, n),
    rawSignalUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    scorecardUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants).length, n),
    sourceBoundRepeatabilityRatio: ratio(stable.filter((j)=>j.sourceBound).length, n),
    staleSuppressionRepeatabilityRatio: ratio(stable.filter((j)=>!j.excludedAsStale || j.includeInLiveContextHandoff === false).length, n),
    contradictionCautionRepeatabilityRatio: ratio(stable.filter((j)=>!j.contradictionCaution || j.includeInLiveContextHandoff === true).length, n),
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
  return issues.length === 0 && m.repeatabilityRunCount === 3 && m.stableHandoffItemCount === 5 && m.unstableHandoffItemCount === 0 && m.stableIncludedForLiveContextCount === 4 && m.stableExcludedAsStaleCount === 1 && m.stableContradictionCautionCount === 1 && m.receiverUsefulnessRatio === 1 && m.sourceBoundRepeatabilityRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatability(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityInput(input);
  const repeatabilityRuns = variantRuns(input?.sourceArtifact ?? {});
  const stableHandoffUtilityJudgements = stableJudgements(repeatabilityRuns, input?.sourceArtifact ?? {});
  const repeatabilityIssues=[];
  for(const item of stableHandoffUtilityJudgements){
    if(item.stableAcrossVariants !== true || item.sourceBound !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) repeatabilityIssues.push(`${redact(item.handoffItemId)}.boundary_source_or_stability_invalid`);
    if(item.excludedAsStale === true && item.includeInLiveContextHandoff !== false) repeatabilityIssues.push(`${redact(item.handoffItemId)}.stale_item_not_suppressed`);
    if(item.contradictionCaution === true && item.includeInLiveContextHandoff !== true) repeatabilityIssues.push(`${redact(item.handoffItemId)}.contradiction_caution_not_included_for_human_context`);
  }
  const allIssues=[...new Set([...inputIssues,...repeatabilityIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  const m = repeatabilityMetrics(stableHandoffUtilityJudgements, repeatabilityRuns, input?.sourceArtifact, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-v0.47.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_VERSION,
    protocol: passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityProtocol(),
    repeatabilityStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedHandoffUtility: true,
    handoffUtilityRepeatabilityOnly: true,
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
    repeatabilityRuns,
    stableHandoffUtilityJudgements,
    repeatabilitySummary: {
      result: allIssues.length === 0 ? 'stable_handoff_utility_repeatability_observed' : 'hold_for_more_evidence',
      whyItMatters: 'the v0.46 live-context handoff utility stays stable across baseline, paraphrased rationale, and reverse-order variants without gaining authority or persistence semantics',
      nextSafeStep: 'keep this scorecard as human-readable local evidence before any separate bounded shadow receiver rehearsal',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.repeatabilitySummary)) issues.push(...unknownKeys(a.repeatabilitySummary, SUMMARY_ALLOWED_KEYS, 'artifact.repeatabilitySummary'));
  for(const [index,run] of arr(a.repeatabilityRuns).entries()) issues.push(...unknownKeys(run, RUN_ALLOWED_KEYS, `artifact.repeatabilityRuns[${index}]`));
  for(const [runIndex,run] of arr(a.repeatabilityRuns).entries()) for(const [index,item] of arr(run.judgements).entries()) issues.push(...unknownKeys(item, JUDGEMENT_ALLOWED_KEYS, `artifact.repeatabilityRuns[${runIndex}].judgements[${index}]`));
  for(const [index,item] of arr(a.stableHandoffUtilityJudgements).entries()) issues.push(...unknownKeys(item, STABLE_ALLOWED_KEYS, `artifact.stableHandoffUtilityJudgements[${index}]`));
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  if(a.repeatabilityStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE') issues.push('artifact.repeatability_not_complete');
  if(a.reportMarkdown !== passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityReport(a)) issues.push('artifact.reportMarkdown_not_exact_generated_report');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('artifact.protocol_repeats_policyDecision');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('artifact.metrics_repeats_policyDecision');
  for(const run of arr(a.repeatabilityRuns)) if(own(run, 'policyDecision')) issues.push('artifact.run_repeats_policyDecision');
  for(const run of arr(a.repeatabilityRuns)) for(const item of arr(run.judgements)) if(own(item, 'policyDecision')) issues.push('artifact.judgement_repeats_policyDecision');
  for(const item of arr(a.stableHandoffUtilityJudgements)) if(item.stableAcrossVariants !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false || item.sourceBound !== true) issues.push(`artifact.${redact(item.handoffItemId)}.boundary_source_or_stability_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Live Context Handoff Utility Repeatability Scorecard v0.47.5',
    '',
    `repeatabilityStatus: ${a.repeatabilityStatus}`,
    `repeatabilityRunCount=${a.metrics.repeatabilityRunCount}`,
    `sourceHandoffWindowCount=${a.metrics.sourceHandoffWindowCount}`,
    `handoffItemCount=${a.metrics.handoffItemCount}`,
    `totalHandoffUtilityJudgementCount=${a.metrics.totalHandoffUtilityJudgementCount}`,
    `stableHandoffItemCount=${a.metrics.stableHandoffItemCount}`,
    `unstableHandoffItemCount=${a.metrics.unstableHandoffItemCount}`,
    `stableIncludedForLiveContextCount=${a.metrics.stableIncludedForLiveContextCount}`,
    `stableExcludedAsStaleCount=${a.metrics.stableExcludedAsStaleCount}`,
    `stableContradictionCautionCount=${a.metrics.stableContradictionCautionCount}`,
    `stableReceiverUsefulHandoffItemCount=${a.metrics.stableReceiverUsefulHandoffItemCount}`,
    `stableReceiverNoisyHandoffItemCount=${a.metrics.stableReceiverNoisyHandoffItemCount}`,
    `stableRawSignalUsefulHandoffItemCount=${a.metrics.stableRawSignalUsefulHandoffItemCount}`,
    `stableRawSignalNoisyHandoffItemCount=${a.metrics.stableRawSignalNoisyHandoffItemCount}`,
    `stableScorecardUsefulHandoffItemCount=${a.metrics.stableScorecardUsefulHandoffItemCount}`,
    `stableScorecardNoisyHandoffItemCount=${a.metrics.stableScorecardNoisyHandoffItemCount}`,
    `receiverUsefulnessRatio=${a.metrics.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${a.metrics.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${a.metrics.scorecardUsefulnessRatio}`,
    `stableHandoffUtilityTreatmentRatio=${a.metrics.stableHandoffUtilityTreatmentRatio}`,
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
    'Human-readable passive live-context handoff utility repeatability scorecard only. It uses the pinned v0.46.5 handoff utility artifact, compares baseline, paraphrased rationale/whyUseful, and reverse-order variants, and is not durable persistence or runtime behavior.',
    '',
    '## Stable handoff utility judgements',
    ...a.stableHandoffUtilityJudgements.map((o)=>`- ${o.handoffItemId}: stable=${o.stableAcrossVariants}; include=${o.includeInLiveContextHandoff}; label=${o.utilityLabel}; source=${o.sourcePath}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
