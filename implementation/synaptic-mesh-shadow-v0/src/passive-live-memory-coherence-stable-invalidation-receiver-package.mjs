import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardArtifact } from './passive-live-memory-coherence-invalidation-repeatability-scorecard.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_VERSION = 'v0.41.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-stable-invalidation-receiver-package-v0.41.5';

const EXPECTED_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-invalidation-repeatability-scorecard-v0.40.5';
const EXPECTED_REPEATABILITY_SCHEMA = 'passive-live-memory-coherence-invalidation-repeatability-scorecard-v0.40.0-alpha';
const EXPECTED_REPEATABILITY_RELEASE = 'v0.40.5';
const EXPECTED_REPEATABILITY_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE';
const EXPECTED_REPEATABILITY_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json',
]);
const EXPECTED_REPEATABILITY_SHA256 = 'b5d033f9ef1719530f470c7612bde6be19fdd86daa855d751b3d6285b09fa401';
const EXPECTED_REPEATABILITY_REPORT_SHA256 = '2cdcec1d757e47de92fb8eaec528403699f006d39eb2c8143893f08ff02a9b69';
const EXPECTED_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  candidateSignalCount: 5,
  totalInvalidationJudgementCount: 15,
  stableCandidateCount: 5,
  unstableCandidateCount: 0,
  stableValidCarryForwardCount: 3,
  stableStaleInvalidatedCount: 1,
  stableContradictionCautionCount: 1,
  labelAgreementRatio: 1,
  stableInvalidationTreatmentRatio: 1,
  sourceBoundRepeatabilityRatio: 1,
  staleInvalidationRepeatabilityRatio: 1,
  contradictionCautionRepeatabilityRatio: 1,
  validCarryForwardRepeatabilityRatio: 1,
  redactedBeforePersistRepeatabilityRatio: 1,
  humanReviewOnlyRepeatabilityRatio: 1,
  noPromotionWithoutHumanRepeatabilityRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_ITEMS = Object.freeze({
  'candidate-current-release-continuity': Object.freeze({ receiverTreatment: 'carry_forward_for_human_context', packageLane: 'stable_carry_forward', handoffInclusion: 'include_for_human_handoff', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff' }),
  'candidate-boundary-invariants': Object.freeze({ receiverTreatment: 'carry_forward_for_human_context', packageLane: 'stable_carry_forward', handoffInclusion: 'include_for_human_handoff', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff' }),
  'candidate-repeatability-evidence': Object.freeze({ receiverTreatment: 'carry_forward_for_human_context', packageLane: 'stable_carry_forward', handoffInclusion: 'include_for_human_handoff', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff' }),
  'candidate-stale-prior-release-anchor': Object.freeze({ receiverTreatment: 'suppress_from_handoff_as_stale', packageLane: 'stable_stale_invalidated', handoffInclusion: 'exclude_from_handoff_as_stale', invalidationTreatment: 'invalidate_as_stale', humanTreatment: 'exclude_from_handoff_as_stale' }),
  'candidate-contradictory-boundary-claim': Object.freeze({ receiverTreatment: 'include_as_contradiction_caution', packageLane: 'stable_contradiction_caution', handoffInclusion: 'include_as_contradiction_caution', invalidationTreatment: 'label_contradiction_for_human_review', humanTreatment: 'include_as_contradiction_caution' }),
});
const EXPECTED_IDS = Object.freeze(Object.keys(EXPECTED_ITEMS));
const INPUT_ALLOWED_KEYS = Object.freeze(['repeatabilityArtifact','repeatabilityArtifactPath','repeatabilityArtifactSha256']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityArtifact','receiverSidePackageOnly','stableCarryForwardSignalsOnly','stableStaleInvalidationSignalsOnly','stableContradictionCautionSignalsOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','receiverPackageStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityArtifact','receiverSidePackageOnly','stableCarryForwardSignalsOnly','stableStaleInvalidationSignalsOnly','stableContradictionCautionSignalsOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','receiverPackageItems','receiverPackageSummary','reportMarkdown']);
const METRICS_ALLOWED_KEYS = Object.freeze(['receiverPackageItemCount','stableCarryForwardItemCount','stableStaleInvalidatedItemCount','stableContradictionCautionItemCount','includedForHumanHandoffCount','excludedAsStaleCount','contradictionCautionCount','sourceBoundItemRatio','stableSignalRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount','policyDecision']);
const ITEM_ALLOWED_KEYS = Object.freeze(['candidateId','packageLane','receiverTreatment','handoffInclusion','sourceBound','stableAcrossRuns','stableInvalidationTreatment','stableHumanTreatment','sourceRepeatabilityRuns','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction','policyDecision']);
const SUMMARY_ALLOWED_KEYS = Object.freeze(['carryForwardCandidateIds','staleInvalidatedCandidateIds','contradictionCautionCandidateIds','humanReviewCue','notRuntimeInstruction','policyDecision']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory']);

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
function exactMetricsIssues(metrics){
  const out=[];
  for(const [k,v] of Object.entries(EXPECTED_METRICS)) if(metrics?.[k] !== v) out.push(`repeatabilityArtifact.metrics.${k}_not_expected`);
  return out;
}

export function assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json'){
  const normalized = normPath(inputPath);
  if(!EXPECTED_REPEATABILITY_PATHS.includes(normalized)) throw new Error('input.repeatability_artifact_path_not_pinned_pre_read');
  return normalized;
}

export async function readPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput(repeatabilityArtifactPath = 'evidence/passive-live-memory-coherence-invalidation-repeatability-scorecard-reviewer-package-v0.40.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInputPathPinned(repeatabilityArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { repeatabilityArtifact: JSON.parse(raw), repeatabilityArtifactPath: pinnedPath, repeatabilityArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceStableInvalidationReceiverPackageProtocol(){
  return {
    releaseLayer: 'v0.41.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_stable_invalidation_receiver_package',
    buildsOn: 'v0.40.5_passive_live_memory_coherence_invalidation_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
    receiverSidePackageOnly: true,
    stableCarryForwardSignalsOnly: true,
    stableStaleInvalidationSignalsOnly: true,
    stableContradictionCautionSignalsOnly: true,
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

function validateRepeatabilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['repeatabilityArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardArtifact(a).map((i)=>`repeatabilityArtifact.${i}`));
  if(a.artifact !== EXPECTED_REPEATABILITY_ARTIFACT) issues.push('repeatabilityArtifact.artifact_not_expected_v0.40_repeatability');
  if(a.schemaVersion !== EXPECTED_REPEATABILITY_SCHEMA) issues.push('repeatabilityArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_REPEATABILITY_RELEASE) issues.push('repeatabilityArtifact.release_layer_not_v0.40.5');
  if(a.repeatabilityStatus !== EXPECTED_REPEATABILITY_STATUS) issues.push('repeatabilityArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('repeatabilityArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_REPEATABILITY_REPORT_SHA256) issues.push('repeatabilityArtifact.reportMarkdown_digest_not_expected');
  issues.push(...exactMetricsIssues(a.metrics));
  const items = arr(a.repeatabilityItems);
  if(items.length !== 5) issues.push('repeatabilityArtifact.items_not_exact_expected_count');
  const ids = items.map((item)=>item?.candidateId);
  for(const id of EXPECTED_IDS) if(!ids.includes(id)) issues.push(`repeatabilityArtifact.item_missing:${redact(id)}`);
  for(const item of items){
    if(!obj(item)){ issues.push('repeatabilityArtifact.item_not_object'); continue; }
    const expected = EXPECTED_ITEMS[item.candidateId];
    if(!expected) issues.push(`repeatabilityArtifact.${redact(item.candidateId)}.item_not_expected`);
    else {
      if(item.invalidationTreatment !== expected.invalidationTreatment) issues.push(`repeatabilityArtifact.${redact(item.candidateId)}.invalidation_treatment_not_expected`);
      if(item.humanTreatment !== expected.humanTreatment) issues.push(`repeatabilityArtifact.${redact(item.candidateId)}.human_treatment_not_expected`);
    }
    if(item.runCount !== 3 || item.expectedRunCount !== 3 || item.agreesWithV039Invalidation !== true || item.sourceBoundAcrossRuns !== true || item.redactedBeforePersistAcrossRuns !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.policyDecision !== null) issues.push(`repeatabilityArtifact.${redact(item.candidateId)}.stable_boundary_flags_invalid`);
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput(input={}){
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

function receiverItems(repeatabilityItems){
  return EXPECTED_IDS.map((id)=>{
    const source = repeatabilityItems.find((item)=>item.candidateId === id) ?? {};
    const expected = EXPECTED_ITEMS[id];
    return {
      candidateId: id,
      packageLane: expected.packageLane,
      receiverTreatment: expected.receiverTreatment,
      handoffInclusion: expected.handoffInclusion,
      sourceBound: source.sourceBoundAcrossRuns === true,
      stableAcrossRuns: source.agreesWithV039Invalidation === true,
      stableInvalidationTreatment: source.invalidationTreatment,
      stableHumanTreatment: source.humanTreatment,
      sourceRepeatabilityRuns: source.runCount,
      redactedBeforePersist: source.redactedBeforePersistAcrossRuns === true,
      rawPersisted: false,
      humanReviewOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      notRuntimeInstruction: true,
      policyDecision: null,
    };
  });
}
function receiverSummary(items){
  return {
    carryForwardCandidateIds: items.filter((item)=>item.packageLane === 'stable_carry_forward').map((item)=>item.candidateId),
    staleInvalidatedCandidateIds: items.filter((item)=>item.packageLane === 'stable_stale_invalidated').map((item)=>item.candidateId),
    contradictionCautionCandidateIds: items.filter((item)=>item.packageLane === 'stable_contradiction_caution').map((item)=>item.candidateId),
    humanReviewCue: 'Use as a human-readable receiver-side context package only; do not promote to memory or consume as a policy decision.',
    notRuntimeInstruction: true,
    policyDecision: null,
  };
}
function metrics(items, validationIssues){
  const n = items.length;
  const carry = items.filter((item)=>item.packageLane === 'stable_carry_forward').length;
  const stale = items.filter((item)=>item.packageLane === 'stable_stale_invalidated').length;
  const caution = items.filter((item)=>item.packageLane === 'stable_contradiction_caution').length;
  const included = items.filter((item)=>item.handoffInclusion === 'include_for_human_handoff' || item.handoffInclusion === 'include_as_contradiction_caution').length;
  const boundaryViolationCount = validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  return {
    receiverPackageItemCount: n,
    stableCarryForwardItemCount: carry,
    stableStaleInvalidatedItemCount: stale,
    stableContradictionCautionItemCount: caution,
    includedForHumanHandoffCount: included,
    excludedAsStaleCount: stale,
    contradictionCautionCount: caution,
    sourceBoundItemRatio: ratio(items.filter((item)=>item.sourceBound).length, n),
    stableSignalRatio: ratio(items.filter((item)=>item.stableAcrossRuns).length, n),
    redactedBeforePersistRatio: ratio(items.filter((item)=>item.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(items.filter((item)=>item.rawPersisted === false).length, n),
    humanReviewOnlyRatio: ratio(items.filter((item)=>item.humanReviewOnly === true).length, n),
    noPromotionWithoutHumanRatio: ratio(items.filter((item)=>item.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(items.filter((item)=>item.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
    policyDecision: null,
  };
}

export function scorePassiveLiveMemoryCoherenceStableInvalidationReceiverPackage(input={}){
  const validationIssues = validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageInput(input);
  const protocol = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageProtocol();
  const items = receiverItems(arr(input.repeatabilityArtifact?.repeatabilityItems));
  const summary = receiverSummary(items);
  const m = metrics(items, validationIssues);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-stable-invalidation-receiver-package-v0.41.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_VERSION,
    protocol,
    receiverPackageStatus: validationIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE' : 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_REJECTED',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
    receiverSidePackageOnly: true,
    stableCarryForwardSignalsOnly: true,
    stableStaleInvalidationSignalsOnly: true,
    stableContradictionCautionSignalsOnly: true,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    humanReadableReportOnly: true,
    humanReviewOnly: true,
    nonAuthoritative: true,
    recommendation: validationIssues.length === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'ABSTAIN_REQUIRES_HUMAN_REVIEW',
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noMemoryWrites: true,
    noRuntimeIntegration: true,
    policyDecision: null,
    validationIssues,
    metrics: m,
    receiverPackageItems: items,
    receiverPackageSummary: summary,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact(artifact={}){
  const issues=[];
  if(!obj(artifact)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(artifact, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(artifact.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_ARTIFACT) issues.push('artifact.id_unexpected');
  if(artifact.schemaVersion !== 'passive-live-memory-coherence-stable-invalidation-receiver-package-v0.41.0-alpha') issues.push('artifact.schema_unexpected');
  if(artifact.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_VERSION) issues.push('artifact.release_unexpected');
  issues.push(...unknownKeys(artifact.protocol ?? {}, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  for(const [k,v] of Object.entries(passiveLiveMemoryCoherenceStableInvalidationReceiverPackageProtocol())) {
    if(artifact.protocol?.[k] !== v) issues.push(`artifact.protocol_flag_mismatch:${redact(k)}`);
    if(!['releaseLayer','barrierCrossed','buildsOn'].includes(k) && artifact[k] !== v) issues.push(`artifact.top_level_protocol_flag_mismatch:${redact(k)}`);
  }
  if(artifact.receiverPackageStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE') issues.push('artifact.status_not_complete');
  if(artifact.recommendation !== 'ADVANCE_OBSERVATION_ONLY') issues.push('artifact.recommendation_not_observation_only');
  if(!Array.isArray(artifact.validationIssues) || artifact.validationIssues.length !== 0) issues.push('artifact.validation_issues_not_empty');
  issues.push(...unknownKeys(artifact.metrics ?? {}, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  const expectedMetrics = { receiverPackageItemCount: 5, stableCarryForwardItemCount: 3, stableStaleInvalidatedItemCount: 1, stableContradictionCautionItemCount: 1, includedForHumanHandoffCount: 4, excludedAsStaleCount: 1, contradictionCautionCount: 1, sourceBoundItemRatio: 1, stableSignalRatio: 1, redactedBeforePersistRatio: 1, rawPersistedFalseRatio: 1, humanReviewOnlyRatio: 1, noPromotionWithoutHumanRatio: 1, agentConsumedOutputFalseRatio: 1, preReadPathPinned: true, boundaryViolationCount: 0, policyDecision: null };
  for(const [k,v] of Object.entries(expectedMetrics)) if(artifact.metrics?.[k] !== v) issues.push(`artifact.metrics.${k}_unexpected`);
  const items = arr(artifact.receiverPackageItems);
  if(items.length !== 5) issues.push('artifact.items_count_unexpected');
  for(const item of items){
    issues.push(...unknownKeys(item ?? {}, ITEM_ALLOWED_KEYS, `artifact.item.${redact(item?.candidateId)}`));
    const expected = EXPECTED_ITEMS[item?.candidateId];
    if(!expected) issues.push(`artifact.item.${redact(item?.candidateId)}.unexpected`);
    else if(item.packageLane !== expected.packageLane || item.receiverTreatment !== expected.receiverTreatment || item.handoffInclusion !== expected.handoffInclusion) issues.push(`artifact.item.${redact(item.candidateId)}.receiver_treatment_unexpected`);
    if(item.sourceBound !== true || item.stableAcrossRuns !== true || item.redactedBeforePersist !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.notRuntimeInstruction !== true || item.policyDecision !== null) issues.push(`artifact.item.${redact(item?.candidateId)}.boundary_flags_invalid`);
  }
  issues.push(...unknownKeys(artifact.receiverPackageSummary ?? {}, SUMMARY_ALLOWED_KEYS, 'artifact.receiverPackageSummary'));
  if(typeof artifact.reportMarkdown !== 'string' || !artifact.reportMarkdown.includes('PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE')) issues.push('artifact.report_missing_status');
  issues.push(...boundaryIssues(artifact,'artifact'), ...tokenIssues(artifact,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceStableInvalidationReceiverPackageReport(artifact){
  const m = artifact.metrics ?? {};
  const lines = [
    '# Passive Live Memory Coherence Stable Invalidation Receiver Package v0.41.5',
    '',
    `receiverPackageStatus: ${artifact.receiverPackageStatus}`,
    `receiverPackageItemCount=${m.receiverPackageItemCount}`,
    `stableCarryForwardItemCount=${m.stableCarryForwardItemCount}`,
    `stableStaleInvalidatedItemCount=${m.stableStaleInvalidatedItemCount}`,
    `stableContradictionCautionItemCount=${m.stableContradictionCautionItemCount}`,
    `includedForHumanHandoffCount=${m.includedForHumanHandoffCount}`,
    `excludedAsStaleCount=${m.excludedAsStaleCount}`,
    `contradictionCautionCount=${m.contradictionCautionCount}`,
    `sourceBoundItemRatio=${m.sourceBoundItemRatio}`,
    `stableSignalRatio=${m.stableSignalRatio}`,
    `redactedBeforePersistRatio=${m.redactedBeforePersistRatio}`,
    `humanReviewOnlyRatio=${m.humanReviewOnlyRatio}`,
    `noPromotionWithoutHumanRatio=${m.noPromotionWithoutHumanRatio}`,
    `agentConsumedOutputFalseRatio=${m.agentConsumedOutputFalseRatio}`,
    `preReadPathPinned=${m.preReadPathPinned}`,
    `boundaryViolationCount=${m.boundaryViolationCount}`,
    `recommendation: ${artifact.recommendation}`,
    `recommendationIsAuthority=${artifact.recommendationIsAuthority}`,
    `agentConsumedOutput=${artifact.agentConsumedOutput}`,
    `notRuntimeInstruction=${artifact.notRuntimeInstruction}`,
    'policyDecision: null',
    '',
    'Human-readable receiver-side package only. Stable signals are arranged for human continuity review; they are not memory writes, runtime instructions, or agent-consumed policy decisions.',
    '',
    '## Receiver package items',
    ...arr(artifact.receiverPackageItems).map((item)=>`- ${item.candidateId}: lane=${item.packageLane}; receiverTreatment=${item.receiverTreatment}; handoffInclusion=${item.handoffInclusion}; promoteToMemory=${item.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(arr(artifact.validationIssues).length ? arr(artifact.validationIssues).map((i)=>`- ${redact(i)}`) : ['- none']),
  ];
  return lines.join('\n');
}
