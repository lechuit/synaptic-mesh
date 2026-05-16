import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceInvalidationWindowArtifact } from './passive-live-memory-coherence-stale-contradiction-invalidation-window.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_VERSION = 'v0.40.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-invalidation-repeatability-scorecard-v0.40.5';

const EXPECTED_INVALIDATION_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-stale-contradiction-invalidation-window-v0.39.5';
const EXPECTED_INVALIDATION_SCHEMA = 'passive-live-memory-coherence-stale-contradiction-invalidation-window-v0.39.0-alpha';
const EXPECTED_INVALIDATION_RELEASE = 'v0.39.5';
const EXPECTED_INVALIDATION_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE';
const EXPECTED_INVALIDATION_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json',
]);
const EXPECTED_INVALIDATION_SHA256 = '7624d2154ee31ce54d705571d16e6fc23343af6c27a7cb2c2cd7469debbf6f04';
const EXPECTED_INVALIDATION_REPORT_SHA256 = 'b5debf445a32dcf138c4a08fb13065faf90157a28bdcb24e97b710b6e1f0c257';
const EXPECTED_INVALIDATION_METRICS = Object.freeze({
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
const EXPECTED_CANDIDATES = Object.freeze({
  'candidate-current-release-continuity': Object.freeze({ signalKind: 'current_valid_continuity', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff', stale: false, contradictsActiveBoundary: false, validCarryForward: true, invalidated: false }),
  'candidate-boundary-invariants': Object.freeze({ signalKind: 'current_valid_boundary', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff', stale: false, contradictsActiveBoundary: false, validCarryForward: true, invalidated: false }),
  'candidate-repeatability-evidence': Object.freeze({ signalKind: 'current_valid_evidence', invalidationTreatment: 'carry_forward_valid', humanTreatment: 'include_for_human_handoff', stale: false, contradictsActiveBoundary: false, validCarryForward: true, invalidated: false }),
  'candidate-stale-prior-release-anchor': Object.freeze({ signalKind: 'stale_prior_release_anchor', invalidationTreatment: 'invalidate_as_stale', humanTreatment: 'exclude_from_handoff_as_stale', stale: true, contradictsActiveBoundary: false, validCarryForward: false, invalidated: true }),
  'candidate-contradictory-boundary-claim': Object.freeze({ signalKind: 'contradictory_boundary_claim', invalidationTreatment: 'label_contradiction_for_human_review', humanTreatment: 'include_as_contradiction_caution', stale: false, contradictsActiveBoundary: true, validCarryForward: false, invalidated: false }),
});
const EXPECTED_CANDIDATE_IDS = Object.freeze(Object.keys(EXPECTED_CANDIDATES));
const INPUT_ALLOWED_KEYS = Object.freeze(['invalidationArtifact','invalidationArtifactPath','invalidationArtifactSha256']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedInvalidationArtifact','repeatedInvalidationJudgementsOnly','staleInvalidationRepeatabilityOnly','contradictionCautionRepeatabilityOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedInvalidationArtifact','repeatedInvalidationJudgementsOnly','staleInvalidationRepeatabilityOnly','contradictionCautionRepeatabilityOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','runSummaries','repeatabilityItems','reportMarkdown']);
const METRICS_ALLOWED_KEYS = Object.freeze(['repeatabilityRunCount','expectedRepeatabilityRunCount','candidateSignalCount','totalInvalidationJudgementCount','expectedInvalidationJudgementCount','stableCandidateCount','unstableCandidateCount','stableValidCarryForwardCount','stableStaleInvalidatedCount','stableContradictionCautionCount','labelAgreementJudgementCount','labelAgreementRatio','stableInvalidationTreatmentRatio','sourceBoundRepeatabilityRatio','staleInvalidationRepeatabilityRatio','contradictionCautionRepeatabilityRatio','validCarryForwardRepeatabilityRatio','redactedBeforePersistRepeatabilityRatio','humanReviewOnlyRepeatabilityRatio','noPromotionWithoutHumanRepeatabilityRatio','agentConsumedOutputFalseRatio','boundaryViolationCount','policyDecision']);
const RUN_ALLOWED_KEYS = Object.freeze(['runId','variant','invalidationJudgementCount','policyDecision','agentConsumedOutput']);
const ITEM_ALLOWED_KEYS = Object.freeze(['candidateId','runCount','expectedRunCount','stableInvalidationTreatment','invalidationTreatment','expectedInvalidationTreatment','stableHumanTreatment','humanTreatment','expectedHumanTreatment','stableStaleDecision','stableContradictionDecision','stableCarryForwardDecision','stableInvalidationDecision','agreesWithV039Invalidation','sourceBoundAcrossRuns','redactedBeforePersistAcrossRuns','rawPersisted','humanReviewOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);

function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function arr(v){ return Array.isArray(v) ? v : []; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
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

export function passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardProtocol(){
  return {
    releaseLayer: 'v0.40.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_invalidation_repeatability_scorecard',
    buildsOn: 'v0.39.5_passive_live_memory_coherence_stale_contradiction_invalidation_window',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedInvalidationArtifact: true,
    repeatedInvalidationJudgementsOnly: true,
    staleInvalidationRepeatabilityOnly: true,
    contradictionCautionRepeatabilityOnly: true,
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

export async function readPassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(invalidationArtifactPath = 'evidence/passive-live-memory-coherence-stale-contradiction-invalidation-window-reviewer-package-v0.39.5.out.json'){
  const raw = await readFile(invalidationArtifactPath, 'utf8');
  return { invalidationArtifact: JSON.parse(raw), invalidationArtifactPath, invalidationArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

function validateInvalidationArtifact(a){
  const issues=[];
  if(!obj(a)) return ['invalidationArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceInvalidationWindowArtifact(a).map((i)=>`invalidationArtifact.${i}`));
  if(a.artifact !== EXPECTED_INVALIDATION_ARTIFACT) issues.push('invalidationArtifact.artifact_not_expected_v0.39_invalidation');
  if(a.schemaVersion !== EXPECTED_INVALIDATION_SCHEMA) issues.push('invalidationArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_INVALIDATION_RELEASE) issues.push('invalidationArtifact.release_layer_not_v0.39.5');
  if(a.invalidationWindowStatus !== EXPECTED_INVALIDATION_STATUS) issues.push('invalidationArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('invalidationArtifact.reportMarkdown_not_string');
  else {
    if(sha256Text(a.reportMarkdown) !== EXPECTED_INVALIDATION_REPORT_SHA256) issues.push('invalidationArtifact.reportMarkdown_digest_not_expected');
    issues.push(...tokenIssues(a.reportMarkdown, 'invalidationArtifact.reportMarkdown'));
  }
  for(const [k,v] of Object.entries(EXPECTED_INVALIDATION_METRICS)) if(a.metrics?.[k] !== v) issues.push(`invalidationArtifact.metrics.${k}_not_expected`);
  const candidates = arr(a.invalidationCandidates);
  if(candidates.length !== 5) issues.push('invalidationArtifact.candidates_not_exact_expected_count');
  const ids = candidates.map((candidate)=>candidate?.candidateId);
  for(const id of EXPECTED_CANDIDATE_IDS) if(!ids.includes(id)) issues.push(`invalidationArtifact.candidate_missing:${redact(id)}`);
  for(const candidate of candidates){
    if(!obj(candidate)){ issues.push('invalidationArtifact.candidate_not_object'); continue; }
    const expected = EXPECTED_CANDIDATES[candidate.candidateId];
    if(!expected) issues.push(`invalidationArtifact.${redact(candidate.candidateId)}.candidate_not_expected`);
    else issues.push(...expectedFieldIssues(candidate, expected, `invalidationArtifact.${redact(candidate.candidateId)}`));
    if(candidate.sourceBound !== true || candidate.stableSourceSignal !== true || candidate.redactedBeforePersist !== true || candidate.rawPersisted !== false || candidate.humanReviewOnly !== true || candidate.promoteToMemory !== false || candidate.agentConsumedOutput !== false || candidate.recommendationIsAuthority !== false || candidate.policyDecision !== null) issues.push(`invalidationArtifact.${redact(candidate.candidateId)}.boundary_flags_invalid`);
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_INVALIDATION_PATHS.includes(normPath(input.invalidationArtifactPath))) issues.push('input.invalidation_artifact_path_not_pinned');
  if(input.invalidationArtifactSha256 !== EXPECTED_INVALIDATION_SHA256) issues.push('input.invalidation_artifact_digest_not_pinned');
  if(obj(input.invalidationArtifact) && sha256Text(JSON.stringify(input.invalidationArtifact, null, 2) + '\n') !== EXPECTED_INVALIDATION_SHA256) issues.push('input.invalidation_artifact_object_digest_not_pinned');
  issues.push(...validateInvalidationArtifact(input.invalidationArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function runVariants(candidates){
  const base = arr(candidates);
  const paraphrase = base.map((candidate)=>({ ...candidate, variantRationale: candidate.stale ? 'older anchor should drop from handoff' : candidate.contradictsActiveBoundary ? 'conflicting boundary claim should be surfaced as caution' : 'current source-bound signal should remain available for human handoff' }));
  const reversed = [...base].reverse();
  return [
    { runId: 'invalidation-repeatability-baseline', variant: 'baseline_order', candidates: base },
    { runId: 'invalidation-repeatability-paraphrased-rationale', variant: 'paraphrased_invalidation_rationale', candidates: paraphrase },
    { runId: 'invalidation-repeatability-reverse-order', variant: 'reverse_order', candidates: reversed },
  ];
}
function judgeRun(run){
  return run.candidates.map((candidate, index)=>({
    judgementId: `${run.runId}:${candidate.candidateId}`,
    runId: run.runId,
    variant: run.variant,
    ordinal: index + 1,
    candidateId: candidate.candidateId,
    sourceHandoffId: candidate.sourceHandoffId,
    sourceObservationId: candidate.sourceObservationId,
    invalidationTreatment: candidate.invalidationTreatment,
    humanTreatment: candidate.humanTreatment,
    staleSignalDetected: candidate.stale === true,
    contradictionDetected: candidate.contradictsActiveBoundary === true,
    shouldCarryForward: candidate.validCarryForward === true,
    shouldInvalidate: candidate.invalidated === true,
    shouldCautionHuman: candidate.humanTreatment === 'include_as_contradiction_caution',
    sourceBound: candidate.sourceBound === true,
    redactedBeforePersist: candidate.redactedBeforePersist === true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function repeatabilityItems(judgements){
  return EXPECTED_CANDIDATE_IDS.map((id)=>{
    const rows = judgements.filter((judgement)=>judgement.candidateId === id);
    const treatmentLabels = [...new Set(rows.map((judgement)=>judgement.invalidationTreatment))];
    const humanLabels = [...new Set(rows.map((judgement)=>judgement.humanTreatment))];
    const staleLabels = [...new Set(rows.map((judgement)=>judgement.staleSignalDetected))];
    const contradictionLabels = [...new Set(rows.map((judgement)=>judgement.contradictionDetected))];
    const carryForwardLabels = [...new Set(rows.map((judgement)=>judgement.shouldCarryForward))];
    const invalidationLabels = [...new Set(rows.map((judgement)=>judgement.shouldInvalidate))];
    const expected = EXPECTED_CANDIDATES[id];
    const stableInvalidationTreatment = rows.length === 3 && treatmentLabels.length === 1;
    const stableHumanTreatment = rows.length === 3 && humanLabels.length === 1;
    const stableStaleDecision = rows.length === 3 && staleLabels.length === 1;
    const stableContradictionDecision = rows.length === 3 && contradictionLabels.length === 1;
    const stableCarryForwardDecision = rows.length === 3 && carryForwardLabels.length === 1;
    const stableInvalidationDecision = rows.length === 3 && invalidationLabels.length === 1;
    return {
      candidateId: id,
      runCount: rows.length,
      expectedRunCount: 3,
      stableInvalidationTreatment,
      invalidationTreatment: treatmentLabels[0] ?? null,
      expectedInvalidationTreatment: expected?.invalidationTreatment ?? null,
      stableHumanTreatment,
      humanTreatment: humanLabels[0] ?? null,
      expectedHumanTreatment: expected?.humanTreatment ?? null,
      stableStaleDecision,
      stableContradictionDecision,
      stableCarryForwardDecision,
      stableInvalidationDecision,
      agreesWithV039Invalidation: stableInvalidationTreatment && stableHumanTreatment && stableStaleDecision && stableContradictionDecision && stableCarryForwardDecision && stableInvalidationDecision && treatmentLabels[0] === expected?.invalidationTreatment && humanLabels[0] === expected?.humanTreatment && staleLabels[0] === expected?.stale && contradictionLabels[0] === expected?.contradictsActiveBoundary && carryForwardLabels[0] === expected?.validCarryForward && invalidationLabels[0] === expected?.invalidated,
      sourceBoundAcrossRuns: rows.every((judgement)=>judgement.sourceBound),
      redactedBeforePersistAcrossRuns: rows.every((judgement)=>judgement.redactedBeforePersist),
      rawPersisted: false,
      humanReviewOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      policyDecision: null,
    };
  });
}
function metrics(runs, judgements, items, validationIssues){
  const n = items.length;
  const stable = items.filter((item)=>item.agreesWithV039Invalidation).length;
  const staleInvalidated = items.filter((item)=>item.stableStaleDecision && item.stableInvalidationDecision && item.invalidationTreatment === 'invalidate_as_stale').length;
  const contradictionCaution = items.filter((item)=>item.stableContradictionDecision && item.humanTreatment === 'include_as_contradiction_caution').length;
  const validCarryForward = items.filter((item)=>item.stableCarryForwardDecision && item.invalidationTreatment === 'carry_forward_valid').length;
  const labelAgreementJudgementCount = judgements.filter((judgement)=>{
    const item = items.find((candidate)=>candidate.candidateId === judgement.candidateId);
    return item?.invalidationTreatment === judgement.invalidationTreatment && item?.humanTreatment === judgement.humanTreatment;
  }).length;
  const boundaryViolationCount = validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  return {
    repeatabilityRunCount: runs.length,
    expectedRepeatabilityRunCount: 3,
    candidateSignalCount: n,
    totalInvalidationJudgementCount: judgements.length,
    expectedInvalidationJudgementCount: 15,
    stableCandidateCount: stable,
    unstableCandidateCount: n - stable,
    stableValidCarryForwardCount: validCarryForward,
    stableStaleInvalidatedCount: staleInvalidated,
    stableContradictionCautionCount: contradictionCaution,
    labelAgreementJudgementCount,
    labelAgreementRatio: ratio(labelAgreementJudgementCount, judgements.length),
    stableInvalidationTreatmentRatio: ratio(items.filter((item)=>item.stableInvalidationTreatment && item.stableHumanTreatment && item.agreesWithV039Invalidation).length, n),
    sourceBoundRepeatabilityRatio: ratio(judgements.filter((judgement)=>judgement.sourceBound).length, judgements.length),
    staleInvalidationRepeatabilityRatio: ratio(staleInvalidated, 1),
    contradictionCautionRepeatabilityRatio: ratio(contradictionCaution, 1),
    validCarryForwardRepeatabilityRatio: ratio(validCarryForward, 3),
    redactedBeforePersistRepeatabilityRatio: ratio(judgements.filter((judgement)=>judgement.redactedBeforePersist).length, judgements.length),
    humanReviewOnlyRepeatabilityRatio: ratio(judgements.filter((judgement)=>judgement.humanReviewOnly).length, judgements.length),
    noPromotionWithoutHumanRepeatabilityRatio: ratio(judgements.filter((judgement)=>judgement.promoteToMemory === false).length, judgements.length),
    agentConsumedOutputFalseRatio: ratio(judgements.filter((judgement)=>judgement.agentConsumedOutput === false).length, judgements.length),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.repeatabilityRunCount === 3 && m.candidateSignalCount === 5 && m.totalInvalidationJudgementCount === 15 && m.stableCandidateCount === 5 && m.unstableCandidateCount === 0 && m.labelAgreementRatio === 1 && m.stableInvalidationTreatmentRatio === 1 && m.sourceBoundRepeatabilityRatio === 1 && m.staleInvalidationRepeatabilityRatio === 1 && m.contradictionCautionRepeatabilityRatio === 1 && m.validCarryForwardRepeatabilityRatio === 1 && m.agentConsumedOutputFalseRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecard(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardInput(input);
  const runs = runVariants(input?.invalidationArtifact?.invalidationCandidates ?? []);
  const judgements = runs.flatMap(judgeRun);
  const items = repeatabilityItems(judgements);
  const itemIssues=[];
  for(const item of items){
    if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) itemIssues.push(`${item.candidateId}.boundary_flags_invalid`);
    if(item.agreesWithV039Invalidation !== true) itemIssues.push(`${item.candidateId}.invalidation_repeatability_label_drift`);
    if(item.sourceBoundAcrossRuns !== true || item.redactedBeforePersistAcrossRuns !== true) itemIssues.push(`${item.candidateId}.invalidation_repeatability_source_or_redaction_drift`);
  }
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const m = metrics(runs, judgements, items, allIssues);
  const artifact={
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-invalidation-repeatability-scorecard-v0.40.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_VERSION,
    protocol: passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardProtocol(),
    repeatabilityStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedInvalidationArtifact: true,
    repeatedInvalidationJudgementsOnly: true,
    staleInvalidationRepeatabilityOnly: true,
    contradictionCautionRepeatabilityOnly: true,
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
    runSummaries: runs.map((run)=>({ runId: run.runId, variant: run.variant, invalidationJudgementCount: run.candidates.length, policyDecision: null, agentConsumedOutput: false })),
    repeatabilityItems: items,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardReport(artifact);
  return artifact;
}

const EXPECTED_ARTIFACT_FIELDS = Object.freeze({
  artifact: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_ARTIFACT,
  schemaVersion: 'passive-live-memory-coherence-invalidation-repeatability-scorecard-v0.40.0-alpha',
  releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_VERSION,
  repeatabilityStatus: 'PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE',
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedInvalidationArtifact: true,
  repeatedInvalidationJudgementsOnly: true,
  staleInvalidationRepeatabilityOnly: true,
  contradictionCautionRepeatabilityOnly: true,
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
const EXPECTED_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  expectedRepeatabilityRunCount: 3,
  candidateSignalCount: 5,
  totalInvalidationJudgementCount: 15,
  expectedInvalidationJudgementCount: 15,
  stableCandidateCount: 5,
  unstableCandidateCount: 0,
  stableValidCarryForwardCount: 3,
  stableStaleInvalidatedCount: 1,
  stableContradictionCautionCount: 1,
  labelAgreementJudgementCount: 15,
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
export function validatePassiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  issues.push(...expectedFieldIssues(a, EXPECTED_ARTIFACT_FIELDS, 'artifact'));
  if(!obj(a.protocol)) issues.push('artifact.protocol_not_object');
  else { issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol')); issues.push(...expectedFieldIssues(a.protocol, passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardProtocol(), 'artifact.protocol')); }
  if(!Array.isArray(a.validationIssues)) issues.push('artifact.validationIssues_not_array');
  else if(a.validationIssues.length !== 0) issues.push('artifact.validationIssues_not_empty');
  if(!obj(a.metrics)) issues.push('artifact.metrics_not_object');
  else { issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics')); issues.push(...expectedFieldIssues(a.metrics, EXPECTED_METRICS, 'artifact.metrics')); }
  const runs = arr(a.runSummaries);
  if(runs.length !== 3) issues.push('artifact.runSummaries_not_exact_expected_count');
  for(const run of runs){
    if(!obj(run)){ issues.push('artifact.runSummary_not_object'); continue; }
    issues.push(...unknownKeys(run, RUN_ALLOWED_KEYS, `artifact.${redact(run.runId ?? 'run')}`));
    if(run.invalidationJudgementCount !== 5 || run.policyDecision !== null || run.agentConsumedOutput !== false) issues.push(`artifact.${redact(run.runId)}.run_boundary_or_count_invalid`);
  }
  const items = arr(a.repeatabilityItems);
  if(items.length !== 5) issues.push('artifact.repeatabilityItems_not_exact_expected_count');
  for(const item of items){
    if(!obj(item)){ issues.push('artifact.repeatabilityItem_not_object'); continue; }
    issues.push(...unknownKeys(item, ITEM_ALLOWED_KEYS, `artifact.${redact(item.candidateId ?? 'item')}`));
    if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) issues.push(`artifact.${redact(item.candidateId)}.boundary_flags_invalid`);
    if(item.runCount !== 3 || item.agreesWithV039Invalidation !== true || item.stableInvalidationTreatment !== true || item.stableHumanTreatment !== true || item.stableStaleDecision !== true || item.stableContradictionDecision !== true || item.stableCarryForwardDecision !== true || item.stableInvalidationDecision !== true) issues.push(`artifact.${redact(item.candidateId)}.repeatability_not_stable`);
    if(item.sourceBoundAcrossRuns !== true || item.redactedBeforePersistAcrossRuns !== true) issues.push(`artifact.${redact(item.candidateId)}.source_or_redaction_not_stable`);
  }
  if(typeof a.reportMarkdown !== 'string') issues.push('artifact.reportMarkdown_not_string');
  else issues.push(...tokenIssues(a.reportMarkdown, 'artifact.reportMarkdown'));
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceInvalidationRepeatabilityScorecardReport(a){
  return [
    '# Passive Live Memory Coherence Invalidation Repeatability Scorecard v0.40.5',
    '',
    `repeatabilityStatus: ${a.repeatabilityStatus}`,
    `repeatabilityRunCount=${a.metrics.repeatabilityRunCount}`,
    `candidateSignalCount=${a.metrics.candidateSignalCount}`,
    `totalInvalidationJudgementCount=${a.metrics.totalInvalidationJudgementCount}`,
    `stableCandidateCount=${a.metrics.stableCandidateCount}`,
    `unstableCandidateCount=${a.metrics.unstableCandidateCount}`,
    `stableValidCarryForwardCount=${a.metrics.stableValidCarryForwardCount}`,
    `stableStaleInvalidatedCount=${a.metrics.stableStaleInvalidatedCount}`,
    `stableContradictionCautionCount=${a.metrics.stableContradictionCautionCount}`,
    `labelAgreementRatio=${a.metrics.labelAgreementRatio}`,
    `stableInvalidationTreatmentRatio=${a.metrics.stableInvalidationTreatmentRatio}`,
    `sourceBoundRepeatabilityRatio=${a.metrics.sourceBoundRepeatabilityRatio}`,
    `staleInvalidationRepeatabilityRatio=${a.metrics.staleInvalidationRepeatabilityRatio}`,
    `contradictionCautionRepeatabilityRatio=${a.metrics.contradictionCautionRepeatabilityRatio}`,
    `validCarryForwardRepeatabilityRatio=${a.metrics.validCarryForwardRepeatabilityRatio}`,
    `redactedBeforePersistRepeatabilityRatio=${a.metrics.redactedBeforePersistRepeatabilityRatio}`,
    `humanReviewOnlyRepeatabilityRatio=${a.metrics.humanReviewOnlyRepeatabilityRatio}`,
    `noPromotionWithoutHumanRepeatabilityRatio=${a.metrics.noPromotionWithoutHumanRepeatabilityRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable passive repeatability scorecard only. Repeated invalidation judgements are source-bound and redacted before persist; they are not memory writes, runtime instructions, or agent-consumed policy decisions.',
    '',
    '## Repeatability items',
    ...a.repeatabilityItems.map((o)=>`- ${o.candidateId}: stable=${o.agreesWithV039Invalidation}; treatment=${o.invalidationTreatment}; humanTreatment=${o.humanTreatment}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
