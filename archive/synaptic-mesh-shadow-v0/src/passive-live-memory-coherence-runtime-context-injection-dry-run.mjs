import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityArtifact } from './passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_VERSION = 'v0.48.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-runtime-context-injection-dry-run-v0.48.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-v0.47.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-v0.47.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.47.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard-reviewer-package-v0.47.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = 'bd625607d7b0f5f49e918a2279818f126d7577c473b5b9964296537e56364cae';
const EXPECTED_SOURCE_REPORT_SHA256 = 'bdaed50ec30e2299c6f096358b6520bf1d609a7fa190b7df78139a12d0474da0';
const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','dryRunStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','dryRunOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityScorecard','liveRuntimeBridgeIntent','localDryRunHarnessOnly','nextBarrier','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','machineShapedDryRunPayload','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','runtimeContextCards','runtimeBridgeSummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','dryRunOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityScorecard','liveRuntimeBridgeIntent','localDryRunHarnessOnly','nextBarrier','redactedBeforePersist','rawSourceCache','rawPersisted','machineShapedDryRunPayload','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['sourceRepeatabilityRunCount','sourceStableHandoffItemCount','sourceIncludedForLiveContextCount','sourceExcludedAsStaleCount','sourceContradictionCautionCount','runtimeContextCardCount','harnessConsumableCandidateCount','runtimeBridgeSignalCount','runtimeBlockedUntilNextBarrierCount','staleSuppressionCarriedForwardCount','contradictionCautionCarriedForwardCount','sourceBoundCardRatio','harnessConsumablePayloadRatio','nextBarrierSpecificityRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const CARD_ALLOWED_KEYS = Object.freeze(['cardId','handoffItemId','observationId','candidateId','sourcePath','sourceSha256','includeInLiveContextHandoff','excludedAsStale','contradictionCaution','utilityLabel','harnessConsumableContextCandidate','runtimeBridgeSignal','runtimeBlockedUntilNextBarrier','nextBarrier','whyUsefulForEventualAgentContext','sourceBound','stableAcrossVariants','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const SUMMARY_ALLOWED_KEYS = Object.freeze(['result','whatThisProvesForLiveRuntime','nextSafeBarrier','notRuntimeInstruction']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawOutput','sourceText','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory']);

function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function arr(v){ return Array.isArray(v) ? v : []; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function unknownKeys(value, allowed, prefix){ return Object.keys(value ?? {}).filter((k)=>!allowed.includes(k)).map((k)=>`${prefix}.unknown_field:${k}`); }
function boundaryIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...boundaryIssues(x, `${prefix}[${i}]`))); return out; }
  if(!obj(value)) return out;
  if(own(value,'policyDecision') && value.policyDecision !== null) out.push(`${prefix}.policyDecision_non_null`);
  if(own(value,'recommendationIsAuthority') && value.recommendationIsAuthority !== false) out.push(`${prefix}.recommendation_treated_as_authority`);
  if(own(value,'agentConsumedOutput') && value.agentConsumedOutput !== false) out.push(`${prefix}.agent_consumed_output_true`);
  if(own(value,'rawPersisted') && value.rawPersisted !== false) out.push(`${prefix}.raw_persisted_true`);
  for(const k of FORBIDDEN_FIELDS) if(own(value,k) && value[k] !== false) out.push(`${prefix}.forbidden_boundary_field_set`);
  for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','whyUsefulForEventualAgentContext','whatThisProvesForLiveRuntime'].includes(k)) out.push(...boundaryIssues(v, `${prefix}.${k}`));
  return out;
}
function expectedPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.repeatability_artifact_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.repeatability_artifact_path_not_pinned_pre_read');
  return normalized;
}

export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInputPathPinned(inputPath = EXPECTED_SOURCE_PATHS[0]){ return expectedPath(inputPath); }

export async function readPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput(sourceArtifactPath = EXPECTED_SOURCE_PATHS[0]){
  const pinnedPath = assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunProtocol(){
  return {
    releaseLayer: 'v0.48.0-alpha',
    barrierCrossed: 'local_runtime_adjacent_context_injection_dry_run_harness',
    buildsOn: 'v0.47.5_passive_live_memory_coherence_receiver_live_context_handoff_utility_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    dryRunOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityScorecard: true,
    liveRuntimeBridgeIntent: true,
    localDryRunHarnessOnly: true,
    nextBarrier: 'runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal',
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    machineShapedDryRunPayload: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverLiveContextHandoffUtilityRepeatabilityArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.47_repeatability_scorecard');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.47.5');
  if(a.repeatabilityStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  if(a.metrics?.repeatabilityRunCount !== 3) issues.push('sourceArtifact.metrics.repeatabilityRunCount_not_expected');
  if(a.metrics?.stableHandoffItemCount !== 5) issues.push('sourceArtifact.metrics.stableHandoffItemCount_not_expected');
  if(a.metrics?.stableIncludedForLiveContextCount !== 4) issues.push('sourceArtifact.metrics.stableIncludedForLiveContextCount_not_expected');
  if(a.metrics?.stableExcludedAsStaleCount !== 1) issues.push('sourceArtifact.metrics.stableExcludedAsStaleCount_not_expected');
  if(a.metrics?.stableContradictionCautionCount !== 1) issues.push('sourceArtifact.metrics.stableContradictionCautionCount_not_expected');
  if(a.metrics?.boundaryViolationCount !== 0) issues.push('sourceArtifact.metrics.boundaryViolationCount_not_zero');
  if(arr(a.stableHandoffUtilityJudgements).length !== 5) issues.push('sourceArtifact.stableHandoffUtilityJudgements_not_exact_expected_count');
  if(!arr(a.stableHandoffUtilityJudgements).every((item)=>item?.sourceBound === true && item?.stableAcrossVariants === true && item?.redactedBeforePersist === true && item?.rawPersisted === false && item?.humanReviewOnly === true && item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false)) issues.push('sourceArtifact.stableHandoffUtilityJudgements_boundary_or_source_invalid');
  if(a.policyDecision !== null) issues.push('sourceArtifact.policyDecision_non_null');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('sourceArtifact.protocol_repeats_policyDecision');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('sourceArtifact.metrics_repeats_policyDecision');
  return issues;
}

export function validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  try { expectedPath(input.sourceArtifactPath); } catch { issues.push('input.repeatability_artifact_path_not_pinned_pre_read'); }
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.repeatability_artifact_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  issues.push(...boundaryIssues(input,'input'));
  return [...new Set(issues)];
}

function dryRunPayloadCards(source){
  return arr(source.stableHandoffUtilityJudgements).map((item)=>{
    const candidate = item.includeInLiveContextHandoff === true && item.excludedAsStale === false;
    return {
      cardId: `dryrun-${item.handoffItemId}`,
      handoffItemId: item.handoffItemId,
      observationId: item.observationId,
      candidateId: item.candidateId,
      sourcePath: item.sourcePath,
      sourceSha256: item.sourceSha256,
      includeInLiveContextHandoff: item.includeInLiveContextHandoff,
      excludedAsStale: item.excludedAsStale,
      contradictionCaution: item.contradictionCaution,
      utilityLabel: item.utilityLabel,
      harnessConsumableContextCandidate: candidate,
      runtimeBridgeSignal: candidate,
      runtimeBlockedUntilNextBarrier: true,
      nextBarrier: 'runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal',
      whyUsefulForEventualAgentContext: candidate
        ? 'stable source-bound human-reviewed card suitable to rehearse as injected live context in a dry-run adapter without granting runtime authority'
        : 'stale card proves suppression must carry forward before any eventual agent-consumed live context injection',
      sourceBound: item.sourceBound,
      stableAcrossVariants: item.stableAcrossVariants,
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

function metrics(cards, source, boundaryViolationCount){
  const n = cards.length;
  return {
    sourceRepeatabilityRunCount: source?.metrics?.repeatabilityRunCount ?? 0,
    sourceStableHandoffItemCount: source?.metrics?.stableHandoffItemCount ?? 0,
    sourceIncludedForLiveContextCount: source?.metrics?.stableIncludedForLiveContextCount ?? 0,
    sourceExcludedAsStaleCount: source?.metrics?.stableExcludedAsStaleCount ?? 0,
    sourceContradictionCautionCount: source?.metrics?.stableContradictionCautionCount ?? 0,
    runtimeContextCardCount: n,
    harnessConsumableCandidateCount: cards.filter((c)=>c.harnessConsumableContextCandidate).length,
    runtimeBridgeSignalCount: cards.filter((c)=>c.runtimeBridgeSignal).length,
    runtimeBlockedUntilNextBarrierCount: cards.filter((c)=>c.runtimeBlockedUntilNextBarrier).length,
    staleSuppressionCarriedForwardCount: cards.filter((c)=>c.excludedAsStale && !c.harnessConsumableContextCandidate).length,
    contradictionCautionCarriedForwardCount: cards.filter((c)=>c.contradictionCaution).length,
    sourceBoundCardRatio: ratio(cards.filter((c)=>c.sourceBound).length, n),
    harnessConsumablePayloadRatio: ratio(cards.filter((c)=>c.harnessConsumableContextCandidate).length, n),
    nextBarrierSpecificityRatio: ratio(cards.filter((c)=>c.nextBarrier === 'runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal').length, n),
    redactedBeforePersistRatio: ratio(cards.filter((c)=>c.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(cards.filter((c)=>c.rawPersisted === false).length, n),
    humanReviewOnlyRatio: ratio(cards.filter((c)=>c.humanReviewOnly).length, n),
    noPromotionWithoutHumanRatio: ratio(cards.filter((c)=>c.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(cards.filter((c)=>c.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.runtimeContextCardCount === 5 && m.harnessConsumableCandidateCount === 4 && m.runtimeBridgeSignalCount === 4 && m.runtimeBlockedUntilNextBarrierCount === 5 && m.nextBarrierSpecificityRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_TO_RUNTIME_ADJACENT_DRY_RUN_OR_LIVE_CONTEXT_INJECTION_REHEARSAL' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRun(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunInput(input);
  const cards = dryRunPayloadCards(input?.sourceArtifact ?? {});
  const cardIssues=[];
  for(const card of cards){
    if(card.sourceBound !== true || card.stableAcrossVariants !== true || card.promoteToMemory !== false || card.agentConsumedOutput !== false || card.recommendationIsAuthority !== false || card.rawPersisted !== false) cardIssues.push(`${card.handoffItemId}.boundary_source_or_stability_invalid`);
    if(card.excludedAsStale === true && card.harnessConsumableContextCandidate !== false) cardIssues.push(`${card.handoffItemId}.stale_item_marked_agent_consumable`);
    if(card.runtimeBlockedUntilNextBarrier !== true) cardIssues.push(`${card.handoffItemId}.runtime_not_blocked_until_next_barrier`);
  }
  const allIssues=[...new Set([...inputIssues,...cardIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  const m = metrics(cards, input?.sourceArtifact, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-runtime-context-injection-dry-run-v0.48.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_VERSION,
    protocol: passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunProtocol(),
    dryRunStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    dryRunOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityScorecard: true,
    liveRuntimeBridgeIntent: true,
    localDryRunHarnessOnly: true,
    nextBarrier: 'runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal',
    sourceArtifactPath: input?.sourceArtifactPath,
    sourceArtifactSha256: input?.sourceArtifactSha256,
    sourceReportSha256: EXPECTED_SOURCE_REPORT_SHA256,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    machineShapedDryRunPayload: true,
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
    runtimeContextCards: cards,
    runtimeBridgeSummary: {
      result: allIssues.length === 0 ? 'stable_human_reviewed_cards_rehearsed_as_future_agent_context_input' : 'hold_for_more_evidence',
      whatThisProvesForLiveRuntime: 'four stable source-bound context cards can be treated as candidates for eventual agent-consumed live context injection, while the stale card stays suppressed and all runtime authority remains blocked',
      nextSafeBarrier: 'runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.runtimeBridgeSummary)) issues.push(...unknownKeys(a.runtimeBridgeSummary, SUMMARY_ALLOWED_KEYS, 'artifact.runtimeBridgeSummary'));
  for(const [index,card] of arr(a.runtimeContextCards).entries()) issues.push(...unknownKeys(card, CARD_ALLOWED_KEYS, `artifact.runtimeContextCards[${index}]`));
  if(a.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_ARTIFACT) issues.push('artifact.artifact_id_unexpected');
  if(a.schemaVersion !== 'passive-live-memory-coherence-runtime-context-injection-dry-run-v0.48.0-alpha') issues.push('artifact.schema_unexpected');
  if(a.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_VERSION) issues.push('artifact.release_unexpected');
  if(a.dryRunStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE') issues.push('artifact.status_not_complete');
  if(a.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('artifact.source_digest_unexpected');
  if(a.sourceReportSha256 !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('artifact.source_report_digest_unexpected');
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(obj(a.protocol) && own(a.protocol,'policyDecision')) issues.push('artifact.protocol_repeats_policyDecision');
  if(obj(a.metrics) && own(a.metrics,'policyDecision')) issues.push('artifact.metrics_repeats_policyDecision');
  const m = a.metrics ?? {};
  if(m.runtimeContextCardCount !== 5 || m.harnessConsumableCandidateCount !== 4 || m.runtimeBridgeSignalCount !== 4 || m.runtimeBlockedUntilNextBarrierCount !== 5) issues.push('artifact.bridge_metrics_unexpected');
  if(m.nextBarrierSpecificityRatio !== 1 || m.sourceBoundCardRatio !== 1 || m.boundaryViolationCount !== 0) issues.push('artifact.boundary_or_next_barrier_metrics_unexpected');
  for(const card of arr(a.runtimeContextCards)) if(card.runtimeBlockedUntilNextBarrier !== true || card.promoteToMemory !== false || card.agentConsumedOutput !== false || card.recommendationIsAuthority !== false || card.rawPersisted !== false || card.sourceBound !== true) issues.push(`artifact.${card.handoffItemId}.boundary_source_or_bridge_invalid`);
  issues.push(...boundaryIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Live Context Runtime Context Injection Dry Run v0.48.5',
    '',
    `dryRunStatus: ${a.dryRunStatus}`,
    `sourceRepeatabilityRunCount=${a.metrics.sourceRepeatabilityRunCount}`,
    `sourceStableHandoffItemCount=${a.metrics.sourceStableHandoffItemCount}`,
    `sourceIncludedForLiveContextCount=${a.metrics.sourceIncludedForLiveContextCount}`,
    `sourceExcludedAsStaleCount=${a.metrics.sourceExcludedAsStaleCount}`,
    `sourceContradictionCautionCount=${a.metrics.sourceContradictionCautionCount}`,
    `runtimeContextCardCount=${a.metrics.runtimeContextCardCount}`,
    `harnessConsumableCandidateCount=${a.metrics.harnessConsumableCandidateCount}`,
    `runtimeBridgeSignalCount=${a.metrics.runtimeBridgeSignalCount}`,
    `runtimeBlockedUntilNextBarrierCount=${a.metrics.runtimeBlockedUntilNextBarrierCount}`,
    `staleSuppressionCarriedForwardCount=${a.metrics.staleSuppressionCarriedForwardCount}`,
    `contradictionCautionCarriedForwardCount=${a.metrics.contradictionCautionCarriedForwardCount}`,
    `harnessConsumablePayloadRatio=${a.metrics.harnessConsumablePayloadRatio}`,
    `nextBarrierSpecificityRatio=${a.metrics.nextBarrierSpecificityRatio}`,
    `sourceBoundCardRatio=${a.metrics.sourceBoundCardRatio}`,
    `preReadPathPinned=${a.metrics.preReadPathPinned}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `nextBarrier: ${a.nextBarrier}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    '',
    'Runtime bridge claim: this is not another generic readiness scorecard. It converts the stable v0.47 handoff judgements into a machine-shaped local dry-run context payload: five payload cards, four harness-consumable candidates, one stale-suppressed card, no network/config/memory writes, no production runtime connection, and no authorization/enforcement semantics. This directly rehearses the boundary a receiver/runtime test harness could consume next.',
    '',
    '## Runtime context payload cards',
    ...a.runtimeContextCards.map((o)=>`- ${o.cardId}: candidate=${o.harnessConsumableContextCandidate}; runtimeBridgeSignal=${o.runtimeBridgeSignal}; blockedUntilNextBarrier=${o.runtimeBlockedUntilNextBarrier}; nextBarrier=${o.nextBarrier}; source=${o.sourcePath}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
