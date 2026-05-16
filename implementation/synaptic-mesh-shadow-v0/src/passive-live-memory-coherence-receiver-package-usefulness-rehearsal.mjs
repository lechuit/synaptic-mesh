import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact } from './passive-live-memory-coherence-stable-invalidation-receiver-package.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_VERSION = 'v0.42.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-package-usefulness-rehearsal-v0.42.5';

const EXPECTED_RECEIVER_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-stable-invalidation-receiver-package-v0.41.5';
const EXPECTED_RECEIVER_SCHEMA = 'passive-live-memory-coherence-stable-invalidation-receiver-package-v0.41.0-alpha';
const EXPECTED_RECEIVER_RELEASE = 'v0.41.5';
const EXPECTED_RECEIVER_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE';
const EXPECTED_RECEIVER_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json',
]);
const EXPECTED_RECEIVER_SHA256 = '58c2de3f864bfcb225560458ecd65b552d1ca891697dc73e497e7d326453f26c';
const EXPECTED_RECEIVER_REPORT_SHA256 = '271f4f586b7ef1367f1dbc0a874ab36fd8e67513883ea2185a0a53c344465f00';
const EXPECTED_RECEIVER_METRICS = Object.freeze({
  receiverPackageItemCount: 5,
  stableCarryForwardItemCount: 3,
  stableStaleInvalidatedItemCount: 1,
  stableContradictionCautionItemCount: 1,
  includedForHumanHandoffCount: 4,
  excludedAsStaleCount: 1,
  contradictionCautionCount: 1,
  sourceBoundItemRatio: 1,
  stableSignalRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_ITEMS = Object.freeze({
  'candidate-current-release-continuity': 'stable_carry_forward',
  'candidate-boundary-invariants': 'stable_carry_forward',
  'candidate-repeatability-evidence': 'stable_carry_forward',
  'candidate-stale-prior-release-anchor': 'stable_stale_invalidated',
  'candidate-contradictory-boundary-claim': 'stable_contradiction_caution',
});
const INPUT_ALLOWED_KEYS = Object.freeze(['receiverPackageArtifact','receiverPackageArtifactPath','receiverPackageArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','rehearsalStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedReceiverPackage','usefulnessRehearsalOnly','comparesReceiverPackageToRawSignalsAndScorecard','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','comparisonModes','usefulnessJudgements','rehearsalSummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedReceiverPackage','usefulnessRehearsalOnly','comparesReceiverPackageToRawSignalsAndScorecard','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const METRICS_ALLOWED_KEYS = Object.freeze(['rehearsalWindowCount','comparisonModeCount','receiverPackageItemCount','receiverUsefulHandoffItemCount','receiverNoisyHandoffItemCount','receiverExcludedStaleItemCount','receiverContradictionCautionItemCount','rawSignalUsefulHandoffItemCount','rawSignalNoisyHandoffItemCount','scorecardUsefulHandoffItemCount','scorecardNoisyHandoffItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','sourceBoundRehearsalRatio','staleSuppressionUsefulRatio','contradictionCautionUsefulRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount','policyDecision']);
const MODE_ALLOWED_KEYS = Object.freeze(['modeId','description','includedItems','usefulItems','noisyItems','excludedStaleItems','contradictionCautionItems','usefulnessRatio','reviewBurden','humanContinuityValue','failureMode']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['candidateId','receiverPackageTreatment','rawSignalTreatment','scorecardTreatment','receiverUsefulForHandoff','rawSignalUsefulForHandoff','scorecardUsefulForHandoff','rationale','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction','policyDecision']);
const SUMMARY_ALLOWED_KEYS = Object.freeze(['bestMode','whyReceiverPackageHelps','nextSafeStep','notRuntimeInstruction','policyDecision']);
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
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(k !== 'reportMarkdown' && k !== 'rationale' && k !== 'whyReceiverPackageHelps') out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
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
  for(const [k,v] of Object.entries(value)) if(k !== 'reportMarkdown') out.push(...boundaryIssues(v, `${prefix}.${redact(k)}`));
  return out;
}

export function assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json'){
  const normalized = normPath(inputPath);
  if(!EXPECTED_RECEIVER_PATHS.includes(normalized)) throw new Error('input.receiver_package_artifact_path_not_pinned_pre_read');
  return normalized;
}

export async function readPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput(receiverPackageArtifactPath = 'evidence/passive-live-memory-coherence-stable-invalidation-receiver-package-reviewer-package-v0.41.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInputPathPinned(receiverPackageArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { receiverPackageArtifact: JSON.parse(raw), receiverPackageArtifactPath: pinnedPath, receiverPackageArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalProtocol(){
  return {
    releaseLayer: 'v0.42.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_package_usefulness_rehearsal',
    buildsOn: 'v0.41.5_passive_live_memory_coherence_stable_invalidation_receiver_package',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedReceiverPackage: true,
    usefulnessRehearsalOnly: true,
    comparesReceiverPackageToRawSignalsAndScorecard: true,
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

function validateReceiverArtifact(a){
  const issues=[];
  if(!obj(a)) return ['receiverPackageArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceStableInvalidationReceiverPackageArtifact(a).map((i)=>`receiverPackageArtifact.${i}`));
  if(a.artifact !== EXPECTED_RECEIVER_ARTIFACT) issues.push('receiverPackageArtifact.artifact_not_expected_v0.41_receiver_package');
  if(a.schemaVersion !== EXPECTED_RECEIVER_SCHEMA) issues.push('receiverPackageArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_RECEIVER_RELEASE) issues.push('receiverPackageArtifact.release_layer_not_v0.41.5');
  if(a.receiverPackageStatus !== EXPECTED_RECEIVER_STATUS) issues.push('receiverPackageArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('receiverPackageArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_RECEIVER_REPORT_SHA256) issues.push('receiverPackageArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_RECEIVER_METRICS)) if(a.metrics?.[k] !== v) issues.push(`receiverPackageArtifact.metrics.${k}_not_expected`);
  const items = arr(a.receiverPackageItems);
  if(items.length !== 5) issues.push('receiverPackageArtifact.items_not_exact_expected_count');
  for(const [id,lane] of Object.entries(EXPECTED_ITEMS)){
    const item = items.find((x)=>x?.candidateId === id);
    if(!item) issues.push(`receiverPackageArtifact.item_missing:${redact(id)}`);
    else {
      if(item.packageLane !== lane) issues.push(`receiverPackageArtifact.${redact(id)}.lane_not_expected`);
      if(item.sourceBound !== true || item.stableAcrossRuns !== true || item.redactedBeforePersist !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.notRuntimeInstruction !== true || item.policyDecision !== null) issues.push(`receiverPackageArtifact.${redact(id)}.boundary_flags_invalid`);
    }
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_RECEIVER_PATHS.includes(normPath(input.receiverPackageArtifactPath))) issues.push('input.receiver_package_artifact_path_not_pinned');
  if(input.receiverPackageArtifactSha256 !== EXPECTED_RECEIVER_SHA256) issues.push('input.receiver_package_artifact_digest_not_pinned');
  if(obj(input.receiverPackageArtifact) && sha256Text(JSON.stringify(input.receiverPackageArtifact, null, 2) + '\n') !== EXPECTED_RECEIVER_SHA256) issues.push('input.receiver_package_artifact_object_digest_not_pinned');
  issues.push(...validateReceiverArtifact(input.receiverPackageArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function usefulnessJudgements(receiverItems){
  return receiverItems.map((item)=>{
    const stale = item.packageLane === 'stable_stale_invalidated';
    const contradiction = item.packageLane === 'stable_contradiction_caution';
    return {
      candidateId: item.candidateId,
      receiverPackageTreatment: item.handoffInclusion,
      rawSignalTreatment: 'unfiltered_signal_available_to_receiver',
      scorecardTreatment: item.packageLane === 'stable_carry_forward' ? 'scorecard_signal_requires_receiver_interpretation' : 'scorecard_signal_not_packaged_for_handoff_lane',
      receiverUsefulForHandoff: !stale,
      rawSignalUsefulForHandoff: !stale && !contradiction,
      scorecardUsefulForHandoff: item.packageLane === 'stable_carry_forward',
      rationale: stale ? 'receiver package suppresses stale prior-release anchor from handoff' : contradiction ? 'receiver package preserves contradiction as caution instead of ambiguous raw signal' : 'receiver package carries stable current signal forward with explicit handoff lane',
      sourceBound: item.sourceBound === true,
      redactedBeforePersist: true,
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
function comparisonModes(judgements){
  const receiverIncluded = judgements.filter((j)=>j.receiverPackageTreatment !== 'exclude_from_handoff_as_stale');
  const rawIncluded = judgements;
  const scorecardIncluded = judgements;
  const mode = (modeId, description, included, useful, noisy, excludedStale, contradictionCaution, failureMode='none') => ({
    modeId, description, includedItems: included, usefulItems: useful, noisyItems: noisy, excludedStaleItems: excludedStale, contradictionCautionItems: contradictionCaution, usefulnessRatio: ratio(useful, included), reviewBurden: included <= 4 && noisy === 0 ? 'low' : 'medium', humanContinuityValue: useful > noisy ? 'useful' : 'mixed', failureMode,
  });
  return [
    mode('receiver_package', 'Use v0.41 receiver package lanes for handoff.', receiverIncluded.length, receiverIncluded.filter((j)=>j.receiverUsefulForHandoff).length, receiverIncluded.filter((j)=>!j.receiverUsefulForHandoff).length, 1, 1),
    mode('raw_stable_signals', 'Expose raw stable signals without receiver-side stale/contradiction packaging.', rawIncluded.length, rawIncluded.filter((j)=>j.rawSignalUsefulForHandoff).length, rawIncluded.filter((j)=>!j.rawSignalUsefulForHandoff).length, 0, 0, 'stale_and_contradiction_signals_are_not_actionably_laned'),
    mode('repeatability_scorecard', 'Use prior scorecard evidence without the receiver-side package.', scorecardIncluded.length, scorecardIncluded.filter((j)=>j.scorecardUsefulForHandoff).length, scorecardIncluded.filter((j)=>!j.scorecardUsefulForHandoff).length, 0, 0, 'requires_receiver_to_reinfer_handoff_lanes'),
  ];
}
function metrics(judgements, modes, validationIssues){
  const receiver = modes.find((m)=>m.modeId === 'receiver_package');
  const raw = modes.find((m)=>m.modeId === 'raw_stable_signals');
  const scorecard = modes.find((m)=>m.modeId === 'repeatability_scorecard');
  const n = judgements.length;
  const boundaryViolationCount = validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  return {
    rehearsalWindowCount: 1,
    comparisonModeCount: modes.length,
    receiverPackageItemCount: n,
    receiverUsefulHandoffItemCount: receiver.usefulItems,
    receiverNoisyHandoffItemCount: receiver.noisyItems,
    receiverExcludedStaleItemCount: receiver.excludedStaleItems,
    receiverContradictionCautionItemCount: receiver.contradictionCautionItems,
    rawSignalUsefulHandoffItemCount: raw.usefulItems,
    rawSignalNoisyHandoffItemCount: raw.noisyItems,
    scorecardUsefulHandoffItemCount: scorecard.usefulItems,
    scorecardNoisyHandoffItemCount: scorecard.noisyItems,
    receiverUsefulnessRatio: receiver.usefulnessRatio,
    rawSignalUsefulnessRatio: raw.usefulnessRatio,
    scorecardUsefulnessRatio: scorecard.usefulnessRatio,
    receiverImprovesOverRawSignals: receiver.usefulnessRatio > raw.usefulnessRatio && receiver.noisyItems < raw.noisyItems,
    receiverImprovesOverScorecard: receiver.usefulnessRatio > scorecard.usefulnessRatio && receiver.noisyItems < scorecard.noisyItems,
    sourceBoundRehearsalRatio: ratio(judgements.filter((j)=>j.sourceBound).length, n),
    staleSuppressionUsefulRatio: ratio(judgements.filter((j)=>j.candidateId === 'candidate-stale-prior-release-anchor' && j.receiverUsefulForHandoff === false && j.receiverPackageTreatment === 'exclude_from_handoff_as_stale').length, 1),
    contradictionCautionUsefulRatio: ratio(judgements.filter((j)=>j.candidateId === 'candidate-contradictory-boundary-claim' && j.receiverUsefulForHandoff === true && j.receiverPackageTreatment === 'include_as_contradiction_caution').length, 1),
    redactedBeforePersistRatio: ratio(judgements.filter((j)=>j.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(judgements.filter((j)=>j.rawPersisted === false).length, n),
    humanReviewOnlyRatio: ratio(judgements.filter((j)=>j.humanReviewOnly).length, n),
    noPromotionWithoutHumanRatio: ratio(judgements.filter((j)=>j.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(judgements.filter((j)=>j.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
    policyDecision: null,
  };
}

export function scorePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsal(input={}){
  const validationIssues = validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalInput(input);
  const protocol = passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalProtocol();
  const judgements = usefulnessJudgements(arr(input.receiverPackageArtifact?.receiverPackageItems));
  const modes = comparisonModes(judgements);
  const m = metrics(judgements, modes, validationIssues);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-package-usefulness-rehearsal-v0.42.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_VERSION,
    protocol,
    rehearsalStatus: validationIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE' : 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_REJECTED',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedReceiverPackage: true,
    usefulnessRehearsalOnly: true,
    comparesReceiverPackageToRawSignalsAndScorecard: true,
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
    comparisonModes: modes,
    usefulnessJudgements: judgements,
    rehearsalSummary: {
      bestMode: 'receiver_package',
      whyReceiverPackageHelps: 'It suppresses the stale prior-release anchor, carries three current stable signals forward, and preserves the contradictory boundary claim as a caution instead of an ambiguous raw signal.',
      nextSafeStep: 'If reviewed, run a passive live observation rehearsal using the receiver package as human-readable context only.',
      notRuntimeInstruction: true,
      policyDecision: null,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalArtifact(artifact={}){
  const issues=[];
  if(!obj(artifact)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(artifact, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(artifact.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_ARTIFACT) issues.push('artifact.id_unexpected');
  if(artifact.schemaVersion !== 'passive-live-memory-coherence-receiver-package-usefulness-rehearsal-v0.42.0-alpha') issues.push('artifact.schema_unexpected');
  if(artifact.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_VERSION) issues.push('artifact.release_unexpected');
  issues.push(...unknownKeys(artifact.protocol ?? {}, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  for(const [k,v] of Object.entries(passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalProtocol())){
    if(artifact.protocol?.[k] !== v) issues.push(`artifact.protocol_flag_mismatch:${redact(k)}`);
    if(!['releaseLayer','barrierCrossed','buildsOn'].includes(k) && artifact[k] !== v) issues.push(`artifact.top_level_protocol_flag_mismatch:${redact(k)}`);
  }
  if(artifact.rehearsalStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE') issues.push('artifact.status_not_complete');
  if(artifact.recommendation !== 'ADVANCE_OBSERVATION_ONLY') issues.push('artifact.recommendation_not_observation_only');
  if(!Array.isArray(artifact.validationIssues) || artifact.validationIssues.length !== 0) issues.push('artifact.validation_issues_not_empty');
  issues.push(...unknownKeys(artifact.metrics ?? {}, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  const expectedMetrics = { rehearsalWindowCount: 1, comparisonModeCount: 3, receiverPackageItemCount: 5, receiverUsefulHandoffItemCount: 4, receiverNoisyHandoffItemCount: 0, receiverExcludedStaleItemCount: 1, receiverContradictionCautionItemCount: 1, rawSignalUsefulHandoffItemCount: 3, rawSignalNoisyHandoffItemCount: 2, scorecardUsefulHandoffItemCount: 3, scorecardNoisyHandoffItemCount: 2, receiverUsefulnessRatio: 1, rawSignalUsefulnessRatio: 0.6, scorecardUsefulnessRatio: 0.6, receiverImprovesOverRawSignals: true, receiverImprovesOverScorecard: true, sourceBoundRehearsalRatio: 1, staleSuppressionUsefulRatio: 1, contradictionCautionUsefulRatio: 1, redactedBeforePersistRatio: 1, rawPersistedFalseRatio: 1, humanReviewOnlyRatio: 1, noPromotionWithoutHumanRatio: 1, agentConsumedOutputFalseRatio: 1, preReadPathPinned: true, boundaryViolationCount: 0, policyDecision: null };
  for(const [k,v] of Object.entries(expectedMetrics)) if(artifact.metrics?.[k] !== v) issues.push(`artifact.metrics.${k}_unexpected`);
  for(const mode of arr(artifact.comparisonModes)) issues.push(...unknownKeys(mode ?? {}, MODE_ALLOWED_KEYS, `artifact.mode.${redact(mode?.modeId)}`));
  for(const judgement of arr(artifact.usefulnessJudgements)){
    issues.push(...unknownKeys(judgement ?? {}, JUDGEMENT_ALLOWED_KEYS, `artifact.judgement.${redact(judgement?.candidateId)}`));
    if(judgement.sourceBound !== true || judgement.redactedBeforePersist !== true || judgement.rawPersisted !== false || judgement.humanReviewOnly !== true || judgement.promoteToMemory !== false || judgement.agentConsumedOutput !== false || judgement.recommendationIsAuthority !== false || judgement.notRuntimeInstruction !== true || judgement.policyDecision !== null) issues.push(`artifact.judgement.${redact(judgement?.candidateId)}.boundary_flags_invalid`);
  }
  issues.push(...unknownKeys(artifact.rehearsalSummary ?? {}, SUMMARY_ALLOWED_KEYS, 'artifact.rehearsalSummary'));
  if(typeof artifact.reportMarkdown !== 'string' || !artifact.reportMarkdown.includes('PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE')) issues.push('artifact.report_missing_status');
  issues.push(...boundaryIssues(artifact,'artifact'), ...tokenIssues(artifact,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalReport(artifact){
  const m = artifact.metrics ?? {};
  const lines = [
    '# Passive Live Memory Coherence Receiver Package Usefulness Rehearsal v0.42.5','',
    `rehearsalStatus: ${artifact.rehearsalStatus}`,
    `rehearsalWindowCount=${m.rehearsalWindowCount}`,
    `comparisonModeCount=${m.comparisonModeCount}`,
    `receiverPackageItemCount=${m.receiverPackageItemCount}`,
    `receiverUsefulHandoffItemCount=${m.receiverUsefulHandoffItemCount}`,
    `receiverNoisyHandoffItemCount=${m.receiverNoisyHandoffItemCount}`,
    `receiverExcludedStaleItemCount=${m.receiverExcludedStaleItemCount}`,
    `receiverContradictionCautionItemCount=${m.receiverContradictionCautionItemCount}`,
    `rawSignalUsefulHandoffItemCount=${m.rawSignalUsefulHandoffItemCount}`,
    `rawSignalNoisyHandoffItemCount=${m.rawSignalNoisyHandoffItemCount}`,
    `scorecardUsefulHandoffItemCount=${m.scorecardUsefulHandoffItemCount}`,
    `scorecardNoisyHandoffItemCount=${m.scorecardNoisyHandoffItemCount}`,
    `receiverUsefulnessRatio=${m.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${m.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${m.scorecardUsefulnessRatio}`,
    `receiverImprovesOverRawSignals=${m.receiverImprovesOverRawSignals}`,
    `receiverImprovesOverScorecard=${m.receiverImprovesOverScorecard}`,
    `sourceBoundRehearsalRatio=${m.sourceBoundRehearsalRatio}`,
    `staleSuppressionUsefulRatio=${m.staleSuppressionUsefulRatio}`,
    `contradictionCautionUsefulRatio=${m.contradictionCautionUsefulRatio}`,
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
    'policyDecision: null','',
    'Human-readable usefulness rehearsal only. The receiver package appears more useful than raw signals or prior scorecard handoff because it reduces stale/contradiction noise without becoming memory, runtime instruction, or policy authority.','',
    '## Comparison modes',
    ...arr(artifact.comparisonModes).map((mode)=>`- ${mode.modeId}: useful=${mode.usefulItems}; noisy=${mode.noisyItems}; usefulnessRatio=${mode.usefulnessRatio}; failureMode=${mode.failureMode}`),'',
    '## Validation issues',
    ...(arr(artifact.validationIssues).length ? arr(artifact.validationIssues).map((i)=>`- ${redact(i)}`) : ['- none']),
  ];
  return lines.join('\n');
}
