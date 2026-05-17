import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_VERSION = 'v0.37.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-repeatability-scorecard-v0.37.5';

const EXPECTED_OBSERVATION_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-observation-rehearsal-v0.36.5';
const EXPECTED_OBSERVATION_SCHEMA = 'passive-live-memory-coherence-observation-rehearsal-v0.36.0-alpha';
const EXPECTED_OBSERVATION_RELEASE = 'v0.36.5';
const EXPECTED_OBSERVATION_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE';
const EXPECTED_OBSERVATION_ARTIFACT_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json',
]);
const EXPECTED_OBSERVATION_ARTIFACT_SHA256 = '46dba4aca8d478ad01b214eaee4a80172269d83fc4e85033dc055cf4ae2022aa';
const EXPECTED_OBSERVATION_REPORT_SHA256 = '0308c8ab294c3c3c0ab8ccb33a4f69c52f204db8e7d5fa49a4c267ec1e2bd991';
const EXPECTED_OBSERVATION_METRICS = Object.freeze({
  explicitRepoLocalSourceCount: 4,
  observationItemCount: 4,
  sourceBoundObservationCount: 4,
  includeForHumanContextCount: 3,
  hardeningCautionCount: 1,
  redactedBeforePersistRatio: 1,
  rawPersistedFalseRatio: 1,
  humanReviewOnlyRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  sourceBoundObservationRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_OBSERVATION_FIELDS = Object.freeze({
  disabledByDefault: true, operatorRunOneShotOnly: true, localOnly: true, passiveOnly: true, readOnly: true,
  explicitSourcesOnly: true, repoLocalSourcesOnly: true, acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
  redactedBeforePersist: true, rawSourceCache: 'excluded', rawPersisted: false,
  humanReadableReportOnly: true, humanReviewOnly: true, nonAuthoritative: true,
  recommendation: 'ADVANCE_OBSERVATION_ONLY', recommendationIsAuthority: false, agentConsumedOutput: false,
  notRuntimeInstruction: true, noRuntimeAuthority: true, noMemoryWrites: true, noRuntimeIntegration: true,
  policyDecision: null,
});
const EXPECTED_OBSERVATION_ITEMS = Object.freeze({
  'obs-current-release-continuity': Object.freeze({
    sourcePath: 'docs/status-v0.35.5.md',
    sourceSha256: '28b96c449b01ed621f64db2f950649f8ed9c9c8b035afe881b7f34eeadfe5a66',
    sourceSignal: 'current_release_status',
    observation: 'current release continuity is v0.35.5 with completed repeatability evidence',
    humanTreatment: 'include_for_human_context',
  }),
  'obs-boundary-invariants': Object.freeze({
    sourcePath: 'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md',
    sourceSha256: '89e187ca1d6505e8d06c1ff53e2e8a689b07fbfae3db496e00f94d71522ad3b4',
    sourceSignal: 'reviewer_package_evidence',
    observation: 'release boundary continues to exclude memory writes, runtime integration, and agent-consumed output',
    humanTreatment: 'include_for_human_context',
  }),
  'obs-repeatability-evidence': Object.freeze({
    sourcePath: 'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md',
    sourceSha256: 'bbf7de87a092e9b83be84dc58189fc3f645bc8206b8f21c4e8fbaa028785141b',
    sourceSignal: 'metrics_evidence_summary',
    observation: 'stable outcome labels support another observation-only step toward memory coherence',
    humanTreatment: 'include_for_human_context',
  }),
  'obs-review-hardening-caution': Object.freeze({
    sourcePath: 'docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md',
    sourceSha256: '1acebe6d9f521ce72ec2f4a6b34b1741777d8e2b43e8495af10d287e5a4a428d',
    sourceSignal: 'review_hardening_caution',
    observation: 'non-blocking caution: pre-check normalized CLI path before reading local file',
    humanTreatment: 'caution_for_future_hardening',
  }),
});
const EXPECTED_OBSERVATION_ITEM_IDS = Object.freeze(Object.keys(EXPECTED_OBSERVATION_ITEMS));
const OBSERVATION_ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','rehearsalStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitSourcesOnly','repoLocalSourcesOnly','acceptsOnlyPinnedCompletedRepeatabilityArtifact','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','observationItems','reportMarkdown']);
const OBSERVATION_METRICS_ALLOWED_KEYS = Object.freeze(Object.keys(EXPECTED_OBSERVATION_METRICS));
const OBSERVATION_ITEM_ALLOWED_KEYS = Object.freeze(['observationId','sourcePath','sourceSha256','sourceSignal','observation','humanTreatment','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const INPUT_ALLOWED_KEYS = Object.freeze(['observationArtifact','observationArtifactPath','observationArtifactSha256']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);

function arr(v){ return Array.isArray(v) ? v : []; }
function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^(\.\.\/)+/,''); }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
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

export function passiveLiveMemoryCoherenceRepeatabilityScorecardProtocol(){
  return {
    releaseLayer: 'v0.37.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_repeatability_scorecard',
    buildsOn: 'v0.36.5_passive_live_memory_coherence_observation_rehearsal',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedObservationArtifact: true,
    repeatedObservationJudgementsOnly: true,
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

export async function readPassiveLiveMemoryCoherenceRepeatabilityScorecardInput(observationArtifactPath = 'evidence/passive-live-memory-coherence-observation-rehearsal-reviewer-package-v0.36.5.out.json'){
  const raw = await readFile(observationArtifactPath, 'utf8');
  return { observationArtifact: JSON.parse(raw), observationArtifactPath, observationArtifactSha256: createHash('sha256').update(raw).digest('hex') };
}

function validateObservationArtifact(a){
  const issues=[];
  if(!obj(a)) return ['observationArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, OBSERVATION_ARTIFACT_ALLOWED_KEYS, 'observationArtifact'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, OBSERVATION_METRICS_ALLOWED_KEYS, 'observationArtifact.metrics'));
  if(a.artifact !== EXPECTED_OBSERVATION_ARTIFACT) issues.push('observationArtifact.artifact_not_expected_v0.36_observation');
  if(a.schemaVersion !== EXPECTED_OBSERVATION_SCHEMA) issues.push('observationArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_OBSERVATION_RELEASE) issues.push('observationArtifact.release_layer_not_v0.36.5');
  if(a.rehearsalStatus !== EXPECTED_OBSERVATION_STATUS) issues.push('observationArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('observationArtifact.reportMarkdown_not_string');
  else {
    if(sha256Text(a.reportMarkdown) !== EXPECTED_OBSERVATION_REPORT_SHA256) issues.push('observationArtifact.reportMarkdown_digest_not_expected');
    issues.push(...tokenIssues(a.reportMarkdown, 'observationArtifact.reportMarkdown'));
  }
  issues.push(...expectedFieldIssues(a, EXPECTED_OBSERVATION_FIELDS, 'observationArtifact'));
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('observationArtifact.prior_validation_issues_present');
  for(const [k,v] of Object.entries(EXPECTED_OBSERVATION_METRICS)) if(a.metrics?.[k] !== v) issues.push(`observationArtifact.metrics.${k}_not_expected`);
  const items = arr(a.observationItems);
  if(items.length !== 4) issues.push('observationArtifact.observation_items_not_exact_expected_count');
  const ids = items.map((item)=>item?.observationId);
  for(const id of EXPECTED_OBSERVATION_ITEM_IDS) if(!ids.includes(id)) issues.push(`observationArtifact.observation_item_missing:${redact(id)}`);
  for(const item of items){
    if(!obj(item)){ issues.push('observationArtifact.observation_item_not_object'); continue; }
    issues.push(...unknownKeys(item, OBSERVATION_ITEM_ALLOWED_KEYS, `observationArtifact.${redact(item.observationId ?? 'item')}`));
    const expectedItem = EXPECTED_OBSERVATION_ITEMS[item.observationId];
    if(!expectedItem) issues.push(`observationArtifact.${redact(item.observationId)}.observation_item_not_expected`);
    else {
      for (const [field, expectedValue] of Object.entries(expectedItem)) if (item[field] !== expectedValue) issues.push(`observationArtifact.${redact(item.observationId)}.${field}_not_pinned`);
    }
    if(item.sourceBound !== true || item.redactedBeforePersist !== true || item.rawPersisted !== false || item.humanReviewOnly !== true || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.policyDecision !== null) issues.push(`observationArtifact.${redact(item.observationId)}.boundary_flags_invalid`);
    if(!['include_for_human_context','caution_for_future_hardening'].includes(item.humanTreatment)) issues.push(`observationArtifact.${redact(item.observationId)}.humanTreatment_not_expected`);
  }
  return issues;
}

export function validatePassiveLiveMemoryCoherenceRepeatabilityScorecardInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_OBSERVATION_ARTIFACT_PATHS.includes(normPath(input.observationArtifactPath))) issues.push('input.observation_artifact_path_not_pinned');
  if(input.observationArtifactSha256 !== EXPECTED_OBSERVATION_ARTIFACT_SHA256) issues.push('input.observation_artifact_digest_not_pinned');
  if(obj(input.observationArtifact) && sha256Text(JSON.stringify(input.observationArtifact, null, 2) + '\n') !== EXPECTED_OBSERVATION_ARTIFACT_SHA256) issues.push('input.observation_artifact_object_digest_not_pinned');
  issues.push(...validateObservationArtifact(input.observationArtifact));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function runVariants(items){
  const base = arr(items);
  const paraphrase = base.map((item)=>({ ...item, observation: `paraphrased: ${item.observation}` }));
  const reversed = [...base].reverse();
  return [
    { runId: 'memory-coherence-repeatability-baseline', variant: 'baseline_order', items: base },
    { runId: 'memory-coherence-repeatability-paraphrased-rationale', variant: 'paraphrased_observation_text', items: paraphrase },
    { runId: 'memory-coherence-repeatability-reverse-order', variant: 'reverse_order', items: reversed },
  ];
}
function judgeRun(run){
  return run.items.map((item, index)=>({
    judgementId: `${run.runId}:${item.observationId}`,
    runId: run.runId,
    variant: run.variant,
    ordinal: index + 1,
    sourceObservationId: item.observationId,
    sourcePath: item.sourcePath,
    receiverLabel: item.humanTreatment,
    sourceBound: item.sourceBound === true,
    redactedBeforePersist: item.redactedBeforePersist === true,
    rawPersisted: false,
    humanReviewOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function repeatabilityItems(judgements){
  return EXPECTED_OBSERVATION_ITEM_IDS.map((id)=>{
    const rows = judgements.filter((j)=>j.sourceObservationId === id);
    const labels = [...new Set(rows.map((j)=>j.receiverLabel))];
    const expectedLabel = id === 'obs-review-hardening-caution' ? 'caution_for_future_hardening' : 'include_for_human_context';
    return {
      observationId: id,
      runCount: rows.length,
      expectedRunCount: 3,
      stableReceiverLabel: rows.length === 3 && labels.length === 1,
      receiverLabel: labels[0] ?? null,
      expectedReceiverLabel: expectedLabel,
      agreesWithV036Observation: labels.length === 1 && labels[0] === expectedLabel,
      sourceBoundAcrossRuns: rows.every((j)=>j.sourceBound),
      redactedBeforePersistAcrossRuns: rows.every((j)=>j.redactedBeforePersist),
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
  const stable = items.filter((item)=>item.stableReceiverLabel && item.agreesWithV036Observation).length;
  const include = items.filter((item)=>item.receiverLabel === 'include_for_human_context' && item.stableReceiverLabel).length;
  const caution = items.filter((item)=>item.receiverLabel === 'caution_for_future_hardening' && item.stableReceiverLabel).length;
  const boundaryViolationCount = validationIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  return {
    repeatabilityRunCount: runs.length,
    expectedRepeatabilityRunCount: 3,
    observationItemCount: n,
    totalObservationJudgementCount: judgements.length,
    expectedObservationJudgementCount: 12,
    stableObservationCount: stable,
    unstableObservationCount: n - stable,
    stableIncludeForHumanContextCount: include,
    stableHardeningCautionCount: caution,
    labelAgreementJudgementCount: judgements.filter((j)=>items.find((item)=>item.observationId === j.sourceObservationId)?.receiverLabel === j.receiverLabel).length,
    labelAgreementRatio: ratio(judgements.filter((j)=>items.find((item)=>item.observationId === j.sourceObservationId)?.receiverLabel === j.receiverLabel).length, judgements.length),
    stableObservationRatio: ratio(stable,n),
    sourceBoundRepeatabilityRatio: ratio(judgements.filter((j)=>j.sourceBound).length, judgements.length),
    redactedBeforePersistRepeatabilityRatio: ratio(judgements.filter((j)=>j.redactedBeforePersist).length, judgements.length),
    humanReviewOnlyRepeatabilityRatio: ratio(judgements.filter((j)=>j.humanReviewOnly).length, judgements.length),
    noPromotionWithoutHumanRepeatabilityRatio: ratio(judgements.filter((j)=>j.promoteToMemory === false).length, judgements.length),
    agentConsumedOutputFalseRatio: ratio(judgements.filter((j)=>j.agentConsumedOutput === false).length, judgements.length),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.repeatabilityRunCount === 3 && m.observationItemCount === 4 && m.totalObservationJudgementCount === 12 && m.stableObservationCount === 4 && m.unstableObservationCount === 0 && m.labelAgreementRatio === 1 && m.sourceBoundRepeatabilityRatio === 1 && m.redactedBeforePersistRepeatabilityRatio === 1 && m.noPromotionWithoutHumanRepeatabilityRatio === 1 && m.agentConsumedOutputFalseRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceRepeatabilityScorecard(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceRepeatabilityScorecardInput(input);
  const runs = runVariants(input?.observationArtifact?.observationItems ?? []);
  const judgements = runs.flatMap(judgeRun);
  const items = repeatabilityItems(judgements);
  const itemIssues=[];
  for(const item of items) {
    if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) itemIssues.push(`${item.observationId}.boundary_flags_invalid`);
    if(item.stableReceiverLabel !== true || item.agreesWithV036Observation !== true) itemIssues.push(`${item.observationId}.observation_repeatability_label_drift`);
    if(item.sourceBoundAcrossRuns !== true || item.redactedBeforePersistAcrossRuns !== true) itemIssues.push(`${item.observationId}.observation_repeatability_source_or_redaction_drift`);
  }
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const m = metrics(runs, judgements, items, allIssues);
  const artifact={
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-repeatability-scorecard-v0.37.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_VERSION,
    protocol: passiveLiveMemoryCoherenceRepeatabilityScorecardProtocol(),
    repeatabilityStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedObservationArtifact: true,
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
    runSummaries: runs.map((run)=>({ runId: run.runId, variant: run.variant, observationJudgementCount: run.items.length, policyDecision: null, agentConsumedOutput: false })),
    repeatabilityItems: items,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceRepeatabilityScorecardReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceRepeatabilityScorecardArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  for(const item of arr(a.repeatabilityItems)) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) issues.push(`artifact.${redact(item.observationId)}.boundary_flags_invalid`);
  if(typeof a.reportMarkdown !== 'string') issues.push('artifact.reportMarkdown_not_string');
  else issues.push(...tokenIssues(a.reportMarkdown, 'artifact.reportMarkdown'));
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceRepeatabilityScorecardReport(a){
  return [
    '# Passive Live Memory Coherence Repeatability Scorecard v0.37.5',
    '',
    `repeatabilityStatus: ${a.repeatabilityStatus}`,
    `repeatabilityRunCount=${a.metrics.repeatabilityRunCount}`,
    `observationItemCount=${a.metrics.observationItemCount}`,
    `totalObservationJudgementCount=${a.metrics.totalObservationJudgementCount}`,
    `stableObservationCount=${a.metrics.stableObservationCount}`,
    `unstableObservationCount=${a.metrics.unstableObservationCount}`,
    `stableIncludeForHumanContextCount=${a.metrics.stableIncludeForHumanContextCount}`,
    `stableHardeningCautionCount=${a.metrics.stableHardeningCautionCount}`,
    `labelAgreementRatio=${a.metrics.labelAgreementRatio}`,
    `stableObservationRatio=${a.metrics.stableObservationRatio}`,
    `sourceBoundRepeatabilityRatio=${a.metrics.sourceBoundRepeatabilityRatio}`,
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
    'Human-readable passive repeatability scorecard only. Repeated judgements are source-bound and redacted before persist; they are not memory writes, runtime instructions, or agent-consumed policy decisions.',
    '',
    '## Repeatability items',
    ...a.repeatabilityItems.map((o)=>`- ${o.observationId}: stable=${o.stableReceiverLabel}; receiverLabel=${o.receiverLabel}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
