import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_VERSION = 'v0.36.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-observation-rehearsal-v0.36.5';

const EXPECTED_REPEATABILITY_ARTIFACT = 'T-synaptic-mesh-passive-hard-case-outcome-repeatability-scorecard-v0.35.5';
const EXPECTED_REPEATABILITY_SCHEMA = 'passive-hard-case-outcome-repeatability-scorecard-v0.35.0-alpha';
const EXPECTED_REPEATABILITY_RELEASE = 'v0.35.5';
const EXPECTED_REPEATABILITY_ARTIFACT_PATHS = Object.freeze([
  'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json',
]);
const EXPECTED_REPEATABILITY_ARTIFACT_SHA256 = '0e5320b2799bc9744f44f9560945f13724ead18bc38a3a09e7dfa741c0bca4a9';
const EXPECTED_REPEATABILITY_REPORT_SHA256 = 'c1e9f026e5143d20d4667df5af56fb651dd0e582502c609548057e6df9dd866b';
const EXPECTED_SOURCE_FILES = Object.freeze({
  'docs/status-v0.35.5.md': Object.freeze({ sha256: '28b96c449b01ed621f64db2f950649f8ed9c9c8b035afe881b7f34eeadfe5a66', signal: 'current_release_status' }),
  'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md': Object.freeze({ sha256: '89e187ca1d6505e8d06c1ff53e2e8a689b07fbfae3db496e00f94d71522ad3b4', signal: 'reviewer_package_evidence' }),
  'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md': Object.freeze({ sha256: 'bbf7de87a092e9b83be84dc58189fc3f645bc8206b8f21c4e8fbaa028785141b', signal: 'metrics_evidence_summary' }),
  'docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md': Object.freeze({ sha256: '1acebe6d9f521ce72ec2f4a6b34b1741777d8e2b43e8495af10d287e5a4a428d', signal: 'review_hardening_caution' }),
});
const EXPECTED_REPEATABILITY_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  expectedRepeatabilityRunCount: 3,
  hardCaseCount: 5,
  totalOutcomeJudgementCount: 15,
  expectedOutcomeJudgementCount: 15,
  stableHardCaseCount: 5,
  unstableHardCaseCount: 0,
  stableUsefulHardCaseCount: 3,
  stableNoiseHardCaseCount: 1,
  stableEvidenceGapHardCaseCount: 1,
  labelAgreementJudgementCount: 15,
  labelAgreementRatio: 1,
  stableHardCaseRatio: 1,
  sourceBoundRepeatabilityRatio: 1,
  humanReviewOnlyRepeatabilityRatio: 1,
  noPromotionWithoutHumanRepeatabilityRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_REPEATABILITY_FIELDS = Object.freeze({
  disabledByDefault: true, operatorRunOneShotOnly: true, localOnly: true, passiveOnly: true, readOnly: true,
  explicitArtifactsOnly: true, acceptsOnlyPinnedCompletedOutcomeValueArtifact: true,
  humanReadableReportOnly: true, humanReviewOnly: true, nonAuthoritative: true,
  recommendation: 'ADVANCE_OBSERVATION_ONLY', recommendationIsAuthority: false, agentConsumedOutput: false,
  notRuntimeInstruction: true, noRuntimeAuthority: true, noMemoryWrites: true, noRuntimeIntegration: true,
  policyDecision: null, rawSourceCache: 'excluded', rawPersisted: false,
});
const REPEATABILITY_ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','repeatabilityStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedOutcomeValueArtifact','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','runSummaries','repeatabilityItems','rawSourceCache','rawPersisted','reportMarkdown']);
const REPEATABILITY_METRICS_ALLOWED_KEYS = Object.freeze(['repeatabilityRunCount','expectedRepeatabilityRunCount','hardCaseCount','totalOutcomeJudgementCount','expectedOutcomeJudgementCount','stableHardCaseCount','unstableHardCaseCount','stableUsefulHardCaseCount','stableNoiseHardCaseCount','stableEvidenceGapHardCaseCount','labelAgreementJudgementCount','labelAgreementRatio','stableHardCaseRatio','stableUsefulHardCaseRatio','stableNoiseHardCaseRatio','stableEvidenceGapHardCaseRatio','sourceBoundRepeatabilityRatio','humanReviewOnlyRepeatabilityRatio','minimalContextRepeatabilityRatio','noPromotionWithoutHumanRepeatabilityRatio','agentConsumedOutputFalseRatio','boundaryViolationCount','policyDecision']);
const INPUT_ALLOWED_KEYS = Object.freeze(['repeatabilityArtifact','repeatabilityArtifactPath','repeatabilityArtifactSha256','sourcePacks']);
const SOURCE_PACK_ALLOWED_KEYS = Object.freeze(['path','sha256','bytes','redactedBeforePersist','rawPersisted','explicitSource','localOnly','readOnly','anchorPhrases','redactedExcerpt']);
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
function sha256Buffer(v){ return createHash('sha256').update(v).digest('hex'); }
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
function redactedExcerptFor(path, text){
  const map = {
    'docs/status-v0.35.5.md': 'current release v0.35.5; repeatability complete; policyDecision null; human-readable report only',
    'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md': 'reviewer package evidence repeats stable labels and zero boundary violations; no runtime authority',
    'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md': 'metrics evidence confirms stable hard cases and no agent-consumed output',
    'docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md': 'local reviews approved; future hardening caution is pre-check normalized CLI path before read',
  };
  return map[path] ?? `redacted digest-bound source ${sha256Text(text).slice(0,12)}`;
}

export function passiveLiveMemoryCoherenceObservationRehearsalProtocol(){
  return {
    releaseLayer: 'v0.36.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_observation_rehearsal',
    buildsOn: 'v0.35.5_passive_hard_case_outcome_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitSourcesOnly: true,
    repoLocalSourcesOnly: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    producesHumanMemoryCoherenceObservationOnly: true,
    humanReadableReportOnly: true,
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

const DEFAULT_SOURCE_PATHS = Object.freeze(['../../docs/status-v0.35.5.md','../../docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md','../../docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md','../../docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md']);

export async function readPassiveLiveMemoryCoherenceObservationRehearsalInput(repeatabilityPath = 'evidence/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.out.json', sourcePaths = DEFAULT_SOURCE_PATHS){
  const raw = await readFile(repeatabilityPath, 'utf8');
  const sourcePacks = [];
  for(const sourcePath of sourcePaths){
    const normalized = normPath(sourcePath);
    const sourceRaw = await readFile(sourcePath, 'utf8');
    sourcePacks.push({
      path: normalized,
      sha256: sha256Buffer(sourceRaw),
      bytes: sourceRaw.length,
      redactedBeforePersist: true,
      rawPersisted: false,
      explicitSource: true,
      localOnly: true,
      readOnly: true,
      anchorPhrases: expectedAnchorPhrases(normalized),
      redactedExcerpt: redactedExcerptFor(normalized, sourceRaw),
    });
  }
  return { repeatabilityArtifact: JSON.parse(raw), repeatabilityArtifactPath: repeatabilityPath, repeatabilityArtifactSha256: createHash('sha256').update(raw).digest('hex'), sourcePacks };
}

function expectedAnchorPhrases(path){
  if(path === 'docs/status-v0.35.5.md') return ['Status v0.35.5','passive hard-case outcome repeatability','policyDecision null'];
  if(path === 'docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md') return ['PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE','stableHardCaseCount: 5','policyDecision: null'];
  if(path === 'docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md') return ['stableHardCaseCount: 5','boundaryViolationCount: 0','agentConsumedOutputFalseRatio: 1'];
  if(path === 'docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md') return ['Status: approved by two independent local reviews','prevalidar ruta CLI normalizada antes de leer archivo local','No blockers found'];
  return [];
}

function validateRepeatabilityArtifact(a){
  const issues=[];
  if(!obj(a)) return ['repeatabilityArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, REPEATABILITY_ARTIFACT_ALLOWED_KEYS, 'repeatabilityArtifact'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, REPEATABILITY_METRICS_ALLOWED_KEYS, 'repeatabilityArtifact.metrics'));
  if(a.artifact !== EXPECTED_REPEATABILITY_ARTIFACT) issues.push('repeatabilityArtifact.artifact_not_expected_v0.35_repeatability');
  if(a.schemaVersion !== EXPECTED_REPEATABILITY_SCHEMA) issues.push('repeatabilityArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_REPEATABILITY_RELEASE) issues.push('repeatabilityArtifact.release_layer_not_v0.35.5');
  if(a.repeatabilityStatus !== 'PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE') issues.push('repeatabilityArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('repeatabilityArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_REPEATABILITY_REPORT_SHA256) issues.push('repeatabilityArtifact.reportMarkdown_digest_not_expected');
  issues.push(...expectedFieldIssues(a, EXPECTED_REPEATABILITY_FIELDS, 'repeatabilityArtifact'));
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('repeatabilityArtifact.prior_validation_issues_present');
  for(const [k,v] of Object.entries(EXPECTED_REPEATABILITY_METRICS)) if(a.metrics?.[k] !== v) issues.push(`repeatabilityArtifact.metrics.${k}_not_expected`);
  const items = arr(a.repeatabilityItems);
  if(items.length !== 5) issues.push('repeatabilityArtifact.repeatability_items_not_exact_expected_count');
  if(!items.every((item)=>item?.stableReceiverLabel === true && item?.stableOutcomeValue === true && item?.agreesWithV034Outcome === true)) issues.push('repeatabilityArtifact.repeatability_items_not_all_stable');
  if(!items.every((item)=>item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false && item?.policyDecision === null)) issues.push('repeatabilityArtifact.repeatability_item_boundary_flags_invalid');
  return issues;
}

function validateSourcePacks(packs){
  const issues=[];
  if(!Array.isArray(packs)) return ['sourcePacks.array_required'];
  const expectedPaths = Object.keys(EXPECTED_SOURCE_FILES);
  if(packs.length !== expectedPaths.length) issues.push('sourcePacks.not_exact_expected_count');
  const seen = new Set();
  packs.forEach((pack, index)=>{
    if(!obj(pack)){ issues.push(`sourcePacks[${index}].object_required`); return; }
    issues.push(...unknownKeys(pack, SOURCE_PACK_ALLOWED_KEYS, `sourcePacks[${index}]`));
    const path = normPath(pack.path);
    if(!own(EXPECTED_SOURCE_FILES, path)) issues.push(`sourcePacks[${index}].path_not_expected:${redact(pack.path)}`);
    if(seen.has(path)) issues.push(`sourcePacks[${index}].duplicate_path:${redact(path)}`);
    seen.add(path);
    const expected = EXPECTED_SOURCE_FILES[path];
    if(expected && pack.sha256 !== expected.sha256) issues.push(`sourcePacks[${index}].sha256_not_expected`);
    if(pack.redactedBeforePersist !== true || pack.rawPersisted !== false || pack.explicitSource !== true || pack.localOnly !== true || pack.readOnly !== true) issues.push(`sourcePacks[${index}].boundary_flags_invalid`);
    if(!Array.isArray(pack.anchorPhrases) || pack.anchorPhrases.length < 1) issues.push(`sourcePacks[${index}].anchor_phrases_required`);
    for(const phrase of arr(pack.anchorPhrases)) if(AUTHORITY_TOKENS.some((token)=>hit(phrase, token))) issues.push(`sourcePacks[${index}].anchor_contains_authority_token`);
    if(typeof pack.redactedExcerpt !== 'string' || pack.redactedExcerpt.length < 10) issues.push(`sourcePacks[${index}].redacted_excerpt_required`);
  });
  for(const path of expectedPaths) if(!seen.has(path)) issues.push(`sourcePacks.expected_path_missing:${redact(path)}`);
  return issues;
}

export function validatePassiveLiveMemoryCoherenceObservationRehearsalInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_REPEATABILITY_ARTIFACT_PATHS.includes(normPath(input.repeatabilityArtifactPath))) issues.push('input.repeatability_artifact_path_not_pinned');
  if(input.repeatabilityArtifactSha256 !== EXPECTED_REPEATABILITY_ARTIFACT_SHA256) issues.push('input.repeatability_artifact_digest_not_pinned');
  issues.push(...validateRepeatabilityArtifact(input.repeatabilityArtifact));
  issues.push(...validateSourcePacks(input.sourcePacks));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function observationItems(sourcePacks){
  const byPath = new Map(arr(sourcePacks).map((pack)=>[normPath(pack.path), pack]));
  return [
    ['obs-current-release-continuity','docs/status-v0.35.5.md','current release continuity is v0.35.5 with completed repeatability evidence','include_for_human_context'],
    ['obs-boundary-invariants','docs/passive-hard-case-outcome-repeatability-scorecard-reviewer-package-v0.35.5.md','release boundary continues to exclude memory writes, runtime integration, and agent-consumed output','include_for_human_context'],
    ['obs-repeatability-evidence','docs/passive-hard-case-outcome-repeatability-scorecard-metrics-v0.35.2.md','stable outcome labels support another observation-only step toward memory coherence','include_for_human_context'],
    ['obs-review-hardening-caution','docs/passive-hard-case-outcome-repeatability-scorecard-local-review-notes-v0.35.5.md','non-blocking caution: pre-check normalized CLI path before reading local file','caution_for_future_hardening'],
  ].map(([observationId, sourcePath, observation, humanTreatment])=>({
    observationId,
    sourcePath,
    sourceSha256: byPath.get(sourcePath)?.sha256 ?? null,
    sourceSignal: EXPECTED_SOURCE_FILES[sourcePath]?.signal ?? 'unknown',
    observation: redact(observation),
    humanTreatment,
    sourceBound: !!byPath.get(sourcePath),
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    minimalContextOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function metrics(items, sourcePacks, boundaryViolationCount){
  const n = items.length;
  return {
    explicitRepoLocalSourceCount: arr(sourcePacks).length,
    observationItemCount: n,
    sourceBoundObservationCount: items.filter((item)=>item.sourceBound).length,
    includeForHumanContextCount: items.filter((item)=>item.humanTreatment === 'include_for_human_context').length,
    hardeningCautionCount: items.filter((item)=>item.humanTreatment === 'caution_for_future_hardening').length,
    redactedBeforePersistRatio: ratio(items.filter((item)=>item.redactedBeforePersist).length,n),
    rawPersistedFalseRatio: ratio(items.filter((item)=>item.rawPersisted === false).length,n),
    humanReviewOnlyRatio: ratio(items.filter((item)=>item.humanReviewOnly).length,n),
    noPromotionWithoutHumanRatio: ratio(items.filter((item)=>item.promoteToMemory === false).length,n),
    agentConsumedOutputFalseRatio: ratio(items.filter((item)=>item.agentConsumedOutput === false).length,n),
    sourceBoundObservationRatio: ratio(items.filter((item)=>item.sourceBound).length,n),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.explicitRepoLocalSourceCount === 4 && m.observationItemCount === 4 && m.sourceBoundObservationCount === 4 && m.redactedBeforePersistRatio === 1 && m.rawPersistedFalseRatio === 1 && m.humanReviewOnlyRatio === 1 && m.noPromotionWithoutHumanRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveLiveMemoryCoherenceObservationRehearsal(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceObservationRehearsalInput(input);
  const items = observationItems(input?.sourcePacks);
  const itemIssues=[];
  for(const item of items) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) itemIssues.push(`${item.observationId}.boundary_flags_invalid`);
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  const m=metrics(items, input?.sourcePacks, boundaryViolationCount);
  const artifact={
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-observation-rehearsal-v0.36.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_VERSION,
    protocol: passiveLiveMemoryCoherenceObservationRehearsalProtocol(),
    rehearsalStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_OBSERVATION_REHEARSAL',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitSourcesOnly: true,
    repoLocalSourcesOnly: true,
    acceptsOnlyPinnedCompletedRepeatabilityArtifact: true,
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
    observationItems: items,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceObservationRehearsalReport(artifact);
  return artifact;
}

export function validatePassiveLiveMemoryCoherenceObservationRehearsalArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  for(const item of arr(a.observationItems)) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false) issues.push(`artifact.${redact(item.observationId)}.boundary_flags_invalid`);
  if(typeof a.reportMarkdown !== 'string') issues.push('artifact.reportMarkdown_not_string');
  else issues.push(...tokenIssues(a.reportMarkdown, 'artifact.reportMarkdown'));
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveLiveMemoryCoherenceObservationRehearsalReport(a){
  return [
    '# Passive Live Memory Coherence Observation Rehearsal v0.36.5',
    '',
    `rehearsalStatus: ${a.rehearsalStatus}`,
    `explicitRepoLocalSourceCount=${a.metrics.explicitRepoLocalSourceCount}`,
    `observationItemCount=${a.metrics.observationItemCount}`,
    `sourceBoundObservationCount=${a.metrics.sourceBoundObservationCount}`,
    `includeForHumanContextCount=${a.metrics.includeForHumanContextCount}`,
    `hardeningCautionCount=${a.metrics.hardeningCautionCount}`,
    `redactedBeforePersistRatio=${a.metrics.redactedBeforePersistRatio}`,
    `rawPersistedFalseRatio=${a.metrics.rawPersistedFalseRatio}`,
    `humanReviewOnlyRatio=${a.metrics.humanReviewOnlyRatio}`,
    `noPromotionWithoutHumanRatio=${a.metrics.noPromotionWithoutHumanRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `sourceBoundObservationRatio=${a.metrics.sourceBoundObservationRatio}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    'policyDecision: null',
    '',
    'Human-readable passive live memory/coherence observation rehearsal only. Source-bound observations are redacted before persist, not memory writes, not runtime instructions, and not agent-consumed policy decisions.',
    '',
    '## Observation items',
    ...a.observationItems.map((o)=>`- ${o.observationId}: ${o.humanTreatment}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
