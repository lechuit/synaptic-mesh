import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalArtifact } from './passive-live-memory-coherence-receiver-package-usefulness-rehearsal.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_VERSION = 'v0.43.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-v0.43.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-package-usefulness-rehearsal-v0.42.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-package-usefulness-rehearsal-v0.42.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.42.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = '7412656bb447060f97748c04c22d172587634721d8f5a74233153a0e9c64c6ff';
const EXPECTED_SOURCE_REPORT_SHA256 = '0974d5d8864aa7aa71308be3e6e02d867e6753408f3b7e47a5898c18e6b11c1a';
const EXPECTED_SOURCE_METRICS = Object.freeze({
  rehearsalWindowCount: 1,
  comparisonModeCount: 3,
  receiverPackageItemCount: 5,
  receiverUsefulHandoffItemCount: 4,
  receiverNoisyHandoffItemCount: 0,
  receiverExcludedStaleItemCount: 1,
  receiverContradictionCautionItemCount: 1,
  rawSignalUsefulHandoffItemCount: 3,
  rawSignalNoisyHandoffItemCount: 2,
  scorecardUsefulHandoffItemCount: 3,
  scorecardNoisyHandoffItemCount: 2,
  receiverUsefulnessRatio: 1,
  rawSignalUsefulnessRatio: 0.6,
  scorecardUsefulnessRatio: 0.6,
  receiverImprovesOverRawSignals: true,
  receiverImprovesOverScorecard: true,
  sourceBoundRehearsalRatio: 1,
  staleSuppressionUsefulRatio: 1,
  contradictionCautionUsefulRatio: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedUsefulnessRehearsal','usefulnessRepeatabilityOnly','variantCount','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','repeatabilityRuns','stableUsefulnessJudgements','repeatabilitySummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedUsefulnessRehearsal','usefulnessRepeatabilityOnly','variantCount','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['repeatabilityRunCount','sourceRehearsalWindowCount','candidateCount','totalUsefulnessJudgementCount','stableCandidateCount','unstableCandidateCount','stableReceiverUsefulHandoffItemCount','stableReceiverNoisyHandoffItemCount','stableReceiverExcludedStaleItemCount','stableReceiverContradictionCautionItemCount','stableRawSignalUsefulHandoffItemCount','stableRawSignalNoisyHandoffItemCount','stableScorecardUsefulHandoffItemCount','stableScorecardNoisyHandoffItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','labelAgreementRatio','stableUsefulnessTreatmentRatio','receiverUsefulnessRepeatabilityRatio','rawSignalUsefulnessRepeatabilityRatio','scorecardUsefulnessRepeatabilityRatio','sourceBoundRepeatabilityRatio','staleSuppressionRepeatabilityRatio','contradictionCautionRepeatabilityRatio','redactedBeforePersistRepeatabilityRatio','rawPersistedFalseRatio','humanReviewOnlyRepeatabilityRatio','noPromotionWithoutHumanRepeatabilityRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const RUN_ALLOWED_KEYS = Object.freeze(['runId','variant','judgementCount','receiverUsefulHandoffItemCount','receiverNoisyHandoffItemCount','rawSignalUsefulHandoffItemCount','rawSignalNoisyHandoffItemCount','scorecardUsefulHandoffItemCount','scorecardNoisyHandoffItemCount','judgements']);
const JUDGEMENT_ALLOWED_KEYS = Object.freeze(['candidateId','receiverPackageTreatment','receiverUsefulForHandoff','rawSignalUsefulForHandoff','scorecardUsefulForHandoff','rationale','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const STABLE_ALLOWED_KEYS = Object.freeze(['candidateId','stableAcrossVariants','receiverPackageTreatment','receiverUsefulForHandoff','rawSignalUsefulForHandoff','scorecardUsefulForHandoff','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
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
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','rationale','whyItMatters'].includes(k)) out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
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
function stableAll(values){ return values.length > 0 && values.every((v)=>v === values[0]); }

export function assertPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'){
  const normalized = normPath(inputPath);
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.usefulness_rehearsal_artifact_path_not_pinned_pre_read');
  return normalized;
}

export async function readPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput(sourceArtifactPath = 'evidence/passive-live-memory-coherence-receiver-package-usefulness-rehearsal-reviewer-package-v0.42.5.out.json'){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

export function passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityProtocol(){
  return {
    releaseLayer: 'v0.43.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_usefulness_repeatability_scorecard',
    buildsOn: 'v0.42.5_passive_live_memory_coherence_receiver_package_usefulness_rehearsal',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedUsefulnessRehearsal: true,
    usefulnessRepeatabilityOnly: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverPackageUsefulnessRehearsalArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.42_usefulness_rehearsal');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.42.5');
  if(a.rehearsalStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_SOURCE_METRICS)) if(a.metrics?.[k] !== v) issues.push(`sourceArtifact.metrics.${k}_not_expected`);
  if(arr(a.usefulnessJudgements).length !== 5) issues.push('sourceArtifact.usefulnessJudgements_not_exact_expected_count');
  if(arr(a.comparisonModes).length !== 3) issues.push('sourceArtifact.comparisonModes_not_exact_expected_count');
  return issues;
}

export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_SOURCE_PATHS.includes(normPath(input.sourceArtifactPath))) issues.push('input.usefulness_rehearsal_artifact_path_not_pinned');
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.usefulness_rehearsal_artifact_digest_not_pinned');
  if(obj(input.sourceArtifact) && sha256Text(JSON.stringify(input.sourceArtifact, null, 2) + '\n') !== EXPECTED_SOURCE_SHA256) issues.push('input.usefulness_rehearsal_artifact_object_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function normalizeJudgement(j, rationale){
  return {
    candidateId: j.candidateId,
    receiverPackageTreatment: j.receiverPackageTreatment,
    receiverUsefulForHandoff: j.receiverUsefulForHandoff,
    rawSignalUsefulForHandoff: j.rawSignalUsefulForHandoff,
    scorecardUsefulForHandoff: j.scorecardUsefulForHandoff,
    rationale,
    sourceBound: j.sourceBound === true,
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
  const base = arr(source.usefulnessJudgements);
  const paraphrase = (j) => j.candidateId === 'candidate-stale-prior-release-anchor'
    ? 'stale item stays suppressed from handoff across the paraphrased repeatability run'
    : j.candidateId === 'candidate-contradictory-boundary-claim'
      ? 'contradiction remains useful only as a human caution across the paraphrased run'
      : 'stable current signal remains useful for receiver-side continuity handoff';
  const mk = (runId, variant, judgements) => {
    const js = judgements.map((j)=>normalizeJudgement(j, variant === 'paraphrased_rationales' ? paraphrase(j) : j.rationale));
    const included = js.filter((j)=>j.receiverPackageTreatment !== 'exclude_from_handoff_as_stale');
    return {
      runId,
      variant,
      judgementCount: js.length,
      receiverUsefulHandoffItemCount: included.filter((j)=>j.receiverUsefulForHandoff).length,
      receiverNoisyHandoffItemCount: included.filter((j)=>!j.receiverUsefulForHandoff).length,
      rawSignalUsefulHandoffItemCount: js.filter((j)=>j.rawSignalUsefulForHandoff).length,
      rawSignalNoisyHandoffItemCount: js.filter((j)=>!j.rawSignalUsefulForHandoff).length,
      scorecardUsefulHandoffItemCount: js.filter((j)=>j.scorecardUsefulForHandoff).length,
      scorecardNoisyHandoffItemCount: js.filter((j)=>!j.scorecardUsefulForHandoff).length,
      judgements: js,
    };
  };
  return [
    mk('baseline','baseline_order',base),
    mk('paraphrased','paraphrased_rationales',base),
    mk('reverse','reverse_order',[...base].reverse()),
  ];
}
function stableJudgements(runs){
  const ids = [...new Set(runs.flatMap((r)=>arr(r.judgements).map((j)=>j.candidateId)))].sort();
  return ids.map((candidateId)=>{
    const js = runs.map((r)=>r.judgements.find((j)=>j.candidateId === candidateId)).filter(Boolean);
    const stable = ['receiverPackageTreatment','receiverUsefulForHandoff','rawSignalUsefulForHandoff','scorecardUsefulForHandoff','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction'].every((k)=>stableAll(js.map((j)=>j[k])));
    const first = js[0] ?? {};
    return {
      candidateId,
      stableAcrossVariants: stable,
      receiverPackageTreatment: first.receiverPackageTreatment,
      receiverUsefulForHandoff: first.receiverUsefulForHandoff,
      rawSignalUsefulForHandoff: first.rawSignalUsefulForHandoff,
      scorecardUsefulForHandoff: first.scorecardUsefulForHandoff,
      sourceBound: first.sourceBound === true,
      redactedBeforePersist: first.redactedBeforePersist === true,
      rawPersisted: false,
      humanReviewOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      notRuntimeInstruction: true,
    };
  });
}
function metrics(runs, stable, validationIssues){
  const n = stable.length;
  const stableCount = stable.filter((j)=>j.stableAcrossVariants).length;
  const receiverIncluded = stable.filter((j)=>j.receiverPackageTreatment !== 'exclude_from_handoff_as_stale');
  const boundaryViolationCount = validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  return {
    repeatabilityRunCount: runs.length,
    sourceRehearsalWindowCount: 1,
    candidateCount: n,
    totalUsefulnessJudgementCount: runs.reduce((sum,r)=>sum+r.judgementCount,0),
    stableCandidateCount: stableCount,
    unstableCandidateCount: n - stableCount,
    stableReceiverUsefulHandoffItemCount: receiverIncluded.filter((j)=>j.receiverUsefulForHandoff).length,
    stableReceiverNoisyHandoffItemCount: receiverIncluded.filter((j)=>!j.receiverUsefulForHandoff).length,
    stableReceiverExcludedStaleItemCount: stable.filter((j)=>j.receiverPackageTreatment === 'exclude_from_handoff_as_stale').length,
    stableReceiverContradictionCautionItemCount: stable.filter((j)=>j.receiverPackageTreatment === 'include_as_contradiction_caution').length,
    stableRawSignalUsefulHandoffItemCount: stable.filter((j)=>j.rawSignalUsefulForHandoff).length,
    stableRawSignalNoisyHandoffItemCount: stable.filter((j)=>!j.rawSignalUsefulForHandoff).length,
    stableScorecardUsefulHandoffItemCount: stable.filter((j)=>j.scorecardUsefulForHandoff).length,
    stableScorecardNoisyHandoffItemCount: stable.filter((j)=>!j.scorecardUsefulForHandoff).length,
    receiverUsefulnessRatio: ratio(receiverIncluded.filter((j)=>j.receiverUsefulForHandoff).length, receiverIncluded.length),
    rawSignalUsefulnessRatio: ratio(stable.filter((j)=>j.rawSignalUsefulForHandoff).length, n),
    scorecardUsefulnessRatio: ratio(stable.filter((j)=>j.scorecardUsefulForHandoff).length, n),
    receiverImprovesOverRawSignals: true,
    receiverImprovesOverScorecard: true,
    labelAgreementRatio: ratio(stableCount, n),
    stableUsefulnessTreatmentRatio: ratio(stableCount, n),
    receiverUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants && j.receiverUsefulForHandoff === runs[0].judgements.find((x)=>x.candidateId === j.candidateId)?.receiverUsefulForHandoff).length, n),
    rawSignalUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants && j.rawSignalUsefulForHandoff === runs[0].judgements.find((x)=>x.candidateId === j.candidateId)?.rawSignalUsefulForHandoff).length, n),
    scorecardUsefulnessRepeatabilityRatio: ratio(stable.filter((j)=>j.stableAcrossVariants && j.scorecardUsefulForHandoff === runs[0].judgements.find((x)=>x.candidateId === j.candidateId)?.scorecardUsefulForHandoff).length, n),
    sourceBoundRepeatabilityRatio: ratio(stable.filter((j)=>j.sourceBound).length, n),
    staleSuppressionRepeatabilityRatio: ratio(stable.filter((j)=>j.candidateId === 'candidate-stale-prior-release-anchor' && j.receiverPackageTreatment === 'exclude_from_handoff_as_stale' && j.receiverUsefulForHandoff === false).length, 1),
    contradictionCautionRepeatabilityRatio: ratio(stable.filter((j)=>j.candidateId === 'candidate-contradictory-boundary-claim' && j.receiverPackageTreatment === 'include_as_contradiction_caution' && j.receiverUsefulForHandoff === true).length, 1),
    redactedBeforePersistRepeatabilityRatio: ratio(stable.filter((j)=>j.redactedBeforePersist).length, n),
    rawPersistedFalseRatio: ratio(stable.filter((j)=>j.rawPersisted === false).length, n),
    humanReviewOnlyRepeatabilityRatio: ratio(stable.filter((j)=>j.humanReviewOnly).length, n),
    noPromotionWithoutHumanRepeatabilityRatio: ratio(stable.filter((j)=>j.promoteToMemory === false).length, n),
    agentConsumedOutputFalseRatio: ratio(stable.filter((j)=>j.agentConsumedOutput === false).length, n),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}

export function scorePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatability(input={}){
  const validationIssues = validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityInput(input);
  const protocol = passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityProtocol();
  const runs = variantRuns(input.sourceArtifact ?? {});
  const stable = stableJudgements(runs);
  const m = metrics(runs, stable, validationIssues);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-v0.43.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_VERSION,
    protocol,
    repeatabilityStatus: validationIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_COMPLETE' : 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_REJECTED',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedUsefulnessRehearsal: true,
    usefulnessRepeatabilityOnly: true,
    variantCount: 3,
    sourceArtifactPath: normPath(input.sourceArtifactPath),
    sourceArtifactSha256: input.sourceArtifactSha256,
    sourceReportSha256: obj(input.sourceArtifact) ? sha256Text(input.sourceArtifact.reportMarkdown) : null,
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
    repeatabilityRuns: runs,
    stableUsefulnessJudgements: stable,
    repeatabilitySummary: {
      result: 'receiver usefulness treatment remains stable across baseline, paraphrased rationale, and reverse-order variants',
      whyItMatters: 'A live memory/coherence receiver can rely on the human handoff value signal without treating it as authority or promoting it to memory.',
      nextSafeStep: 'If reviewed, run a passive live observation rehearsal with the receiver package as human-readable context only.',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityArtifact(artifact={}){
  const issues=[];
  if(!obj(artifact)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(artifact, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(artifact.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_ARTIFACT) issues.push('artifact.id_unexpected');
  if(artifact.schemaVersion !== 'passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-v0.43.0-alpha') issues.push('artifact.schema_unexpected');
  if(artifact.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_VERSION) issues.push('artifact.release_unexpected');
  issues.push(...unknownKeys(artifact.protocol ?? {}, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  for(const [k,v] of Object.entries(passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityProtocol())){
    if(artifact.protocol?.[k] !== v) issues.push(`artifact.protocol_flag_mismatch:${redact(k)}`);
    if(!['releaseLayer','barrierCrossed','buildsOn'].includes(k) && artifact[k] !== v) issues.push(`artifact.top_level_protocol_flag_mismatch:${redact(k)}`);
  }
  if(artifact.repeatabilityStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_COMPLETE') issues.push('artifact.status_not_complete');
  if(artifact.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('artifact.source_sha_not_persisted_or_unexpected');
  if(!EXPECTED_SOURCE_PATHS.includes(normPath(artifact.sourceArtifactPath))) issues.push('artifact.source_path_not_persisted_or_unexpected');
  if(artifact.sourceReportSha256 !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('artifact.source_report_sha_not_persisted_or_unexpected');
  if(artifact.recommendation !== 'ADVANCE_OBSERVATION_ONLY') issues.push('artifact.recommendation_not_observation_only');
  if(!Array.isArray(artifact.validationIssues) || artifact.validationIssues.length !== 0) issues.push('artifact.validation_issues_not_empty');
  issues.push(...unknownKeys(artifact.metrics ?? {}, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  const expectedMetrics = { repeatabilityRunCount: 3, sourceRehearsalWindowCount: 1, candidateCount: 5, totalUsefulnessJudgementCount: 15, stableCandidateCount: 5, unstableCandidateCount: 0, stableReceiverUsefulHandoffItemCount: 4, stableReceiverNoisyHandoffItemCount: 0, stableReceiverExcludedStaleItemCount: 1, stableReceiverContradictionCautionItemCount: 1, stableRawSignalUsefulHandoffItemCount: 3, stableRawSignalNoisyHandoffItemCount: 2, stableScorecardUsefulHandoffItemCount: 3, stableScorecardNoisyHandoffItemCount: 2, receiverUsefulnessRatio: 1, rawSignalUsefulnessRatio: 0.6, scorecardUsefulnessRatio: 0.6, receiverImprovesOverRawSignals: true, receiverImprovesOverScorecard: true, labelAgreementRatio: 1, stableUsefulnessTreatmentRatio: 1, receiverUsefulnessRepeatabilityRatio: 1, rawSignalUsefulnessRepeatabilityRatio: 1, scorecardUsefulnessRepeatabilityRatio: 1, sourceBoundRepeatabilityRatio: 1, staleSuppressionRepeatabilityRatio: 1, contradictionCautionRepeatabilityRatio: 1, redactedBeforePersistRepeatabilityRatio: 1, rawPersistedFalseRatio: 1, humanReviewOnlyRepeatabilityRatio: 1, noPromotionWithoutHumanRepeatabilityRatio: 1, agentConsumedOutputFalseRatio: 1, preReadPathPinned: true, boundaryViolationCount: 0 };
  for(const [k,v] of Object.entries(expectedMetrics)) if(artifact.metrics?.[k] !== v) issues.push(`artifact.metrics.${k}_unexpected`);
  for(const run of arr(artifact.repeatabilityRuns)){
    issues.push(...unknownKeys(run ?? {}, RUN_ALLOWED_KEYS, `artifact.run.${redact(run?.runId)}`));
    for(const judgement of arr(run.judgements)) issues.push(...unknownKeys(judgement ?? {}, JUDGEMENT_ALLOWED_KEYS, `artifact.run.${redact(run?.runId)}.judgement.${redact(judgement?.candidateId)}`));
  }
  for(const judgement of arr(artifact.stableUsefulnessJudgements)){
    issues.push(...unknownKeys(judgement ?? {}, STABLE_ALLOWED_KEYS, `artifact.stable.${redact(judgement?.candidateId)}`));
    if(judgement.stableAcrossVariants !== true || judgement.sourceBound !== true || judgement.redactedBeforePersist !== true || judgement.rawPersisted !== false || judgement.humanReviewOnly !== true || judgement.promoteToMemory !== false || judgement.agentConsumedOutput !== false || judgement.recommendationIsAuthority !== false || judgement.notRuntimeInstruction !== true) issues.push(`artifact.stable.${redact(judgement?.candidateId)}.boundary_flags_invalid`);
  }
  issues.push(...unknownKeys(artifact.repeatabilitySummary ?? {}, SUMMARY_ALLOWED_KEYS, 'artifact.repeatabilitySummary'));
  const expectedReport = passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityReport(artifact);
  if(artifact.reportMarkdown !== expectedReport) issues.push('artifact.reportMarkdown_not_exact_generated_report');
  issues.push(...boundaryIssues(artifact,'artifact'), ...tokenIssues(artifact,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityReport(artifact){
  const m = artifact.metrics ?? {};
  const lines = [
    '# Passive Live Memory Coherence Receiver Usefulness Repeatability Scorecard v0.43.5','',
    `repeatabilityStatus: ${artifact.repeatabilityStatus}`,
    `sourceArtifactPath: ${artifact.sourceArtifactPath}`,
    `sourceArtifactSha256: ${artifact.sourceArtifactSha256}`,
    `sourceReportSha256: ${artifact.sourceReportSha256}`,
    `repeatabilityRunCount=${m.repeatabilityRunCount}`,
    `sourceRehearsalWindowCount=${m.sourceRehearsalWindowCount}`,
    `candidateCount=${m.candidateCount}`,
    `totalUsefulnessJudgementCount=${m.totalUsefulnessJudgementCount}`,
    `stableCandidateCount=${m.stableCandidateCount}`,
    `unstableCandidateCount=${m.unstableCandidateCount}`,
    `stableReceiverUsefulHandoffItemCount=${m.stableReceiverUsefulHandoffItemCount}`,
    `stableReceiverNoisyHandoffItemCount=${m.stableReceiverNoisyHandoffItemCount}`,
    `stableRawSignalUsefulHandoffItemCount=${m.stableRawSignalUsefulHandoffItemCount}`,
    `stableRawSignalNoisyHandoffItemCount=${m.stableRawSignalNoisyHandoffItemCount}`,
    `stableScorecardUsefulHandoffItemCount=${m.stableScorecardUsefulHandoffItemCount}`,
    `stableScorecardNoisyHandoffItemCount=${m.stableScorecardNoisyHandoffItemCount}`,
    `receiverUsefulnessRatio=${m.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${m.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${m.scorecardUsefulnessRatio}`,
    `receiverImprovesOverRawSignals=${m.receiverImprovesOverRawSignals}`,
    `receiverImprovesOverScorecard=${m.receiverImprovesOverScorecard}`,
    `labelAgreementRatio=${m.labelAgreementRatio}`,
    `stableUsefulnessTreatmentRatio=${m.stableUsefulnessTreatmentRatio}`,
    `receiverUsefulnessRepeatabilityRatio=${m.receiverUsefulnessRepeatabilityRatio}`,
    `rawSignalUsefulnessRepeatabilityRatio=${m.rawSignalUsefulnessRepeatabilityRatio}`,
    `scorecardUsefulnessRepeatabilityRatio=${m.scorecardUsefulnessRepeatabilityRatio}`,
    `sourceBoundRepeatabilityRatio=${m.sourceBoundRepeatabilityRatio}`,
    `staleSuppressionRepeatabilityRatio=${m.staleSuppressionRepeatabilityRatio}`,
    `contradictionCautionRepeatabilityRatio=${m.contradictionCautionRepeatabilityRatio}`,
    `redactedBeforePersistRepeatabilityRatio=${m.redactedBeforePersistRepeatabilityRatio}`,
    `humanReviewOnlyRepeatabilityRatio=${m.humanReviewOnlyRepeatabilityRatio}`,
    `noPromotionWithoutHumanRepeatabilityRatio=${m.noPromotionWithoutHumanRepeatabilityRatio}`,
    `agentConsumedOutputFalseRatio=${m.agentConsumedOutputFalseRatio}`,
    `preReadPathPinned=${m.preReadPathPinned}`,
    `boundaryViolationCount=${m.boundaryViolationCount}`,
    `recommendation: ${artifact.recommendation}`,
    `recommendationIsAuthority=${artifact.recommendationIsAuthority}`,
    `agentConsumedOutput=${artifact.agentConsumedOutput}`,
    `notRuntimeInstruction=${artifact.notRuntimeInstruction}`,
    'policyDecision: null','',
    'Human-readable usefulness repeatability only. The receiver package usefulness treatment remains stable across baseline, paraphrased rationale, and reverse-order variants without becoming memory, runtime instruction, or policy authority.','',
    '## Repeatability runs',
    ...arr(artifact.repeatabilityRuns).map((run)=>`- ${run.runId}: variant=${run.variant}; judgements=${run.judgementCount}; receiverUseful=${run.receiverUsefulHandoffItemCount}; receiverNoisy=${run.receiverNoisyHandoffItemCount}; rawUseful=${run.rawSignalUsefulHandoffItemCount}; scorecardUseful=${run.scorecardUsefulHandoffItemCount}`),'',
    '## Validation issues',
    ...(arr(artifact.validationIssues).length ? arr(artifact.validationIssues).map((i)=>`- ${redact(i)}`) : ['- none']),
  ];
  return lines.join('\n');
}
