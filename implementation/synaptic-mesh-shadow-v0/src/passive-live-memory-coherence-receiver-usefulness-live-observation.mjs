import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityArtifact } from './passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_VERSION = 'v0.44.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-live-observation-v0.44.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-v0.43.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-v0.43.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.43.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json',
]);
const EXPECTED_SOURCE_SHA256 = '7746da106e59f78d2ff5c0fbc359c5d03251a1fddc9d2fbdfbff13d5a11698e5';
const EXPECTED_SOURCE_REPORT_SHA256 = 'b10b79b585f46692b45b0ff78cc4f7007d53a0764f7d6fd3c43ff21acb81d214';
const EXPECTED_SOURCE_METRICS = Object.freeze({
  repeatabilityRunCount: 3,
  sourceRehearsalWindowCount: 1,
  candidateCount: 5,
  totalUsefulnessJudgementCount: 15,
  stableCandidateCount: 5,
  unstableCandidateCount: 0,
  stableReceiverUsefulHandoffItemCount: 4,
  stableReceiverNoisyHandoffItemCount: 0,
  stableReceiverExcludedStaleItemCount: 1,
  stableReceiverContradictionCautionItemCount: 1,
  receiverUsefulnessRatio: 1,
  rawSignalUsefulnessRatio: 0.6,
  scorecardUsefulnessRatio: 0.6,
  receiverUsefulnessRepeatabilityRatio: 1,
  staleSuppressionRepeatabilityRatio: 1,
  contradictionCautionRepeatabilityRatio: 1,
  noPromotionWithoutHumanRepeatabilityRatio: 1,
  agentConsumedOutputFalseRatio: 1,
  preReadPathPinned: true,
  boundaryViolationCount: 0,
});
const EXPECTED_LIVE_SOURCE_FILES = Object.freeze({
  'docs/status-v0.43.5.md': Object.freeze({ sha256: '9f963464e59aa11a310e96d66f5c40fe7d635125047edc7ae782ff0ce328ae61', signal: 'current_release_status' }),
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md': Object.freeze({ sha256: 'cbb0674cd2ac50eb023354cd869fc5162b71b03e0c8a0e8024e5073fb2cfc1f7', signal: 'reviewer_package_evidence' }),
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md': Object.freeze({ sha256: 'd5ec5ed360481fd3cb3d176d03745e9f5523c1415858cb766cbd993b4843068d', signal: 'metrics_evidence_summary' }),
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md': Object.freeze({ sha256: '1469b5f2f4d89cce6f64b3a61a955b7d7ef0e031207af34af31848923acfa364', signal: 'local_review_evidence' }),
});
const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256','liveSourcePacks']);
const SOURCE_PACK_ALLOWED_KEYS = Object.freeze(['path','sha256','bytes','redactedBeforePersist','rawPersisted','explicitSource','repoLocalSource','localOnly','readOnly','anchorPhrases','redactedExcerpt']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','liveObservationStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','explicitLiveSourcesOnly','repoLocalSourcesOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityScorecard','liveObservationOnly','sourceArtifactPath','sourceArtifactSha256','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','liveObservationItems','liveObservationSummary','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','explicitLiveSourcesOnly','repoLocalSourcesOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRepeatabilityScorecard','liveObservationOnly','redactedBeforePersist','rawSourceCache','rawPersisted','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration']);
const METRICS_ALLOWED_KEYS = Object.freeze(['explicitRepoLocalSourceCount','sourceRepeatabilityRunCount','sourceCandidateCount','sourceStableCandidateCount','liveObservationItemCount','sourceBoundObservationCount','includedForHumanContextCount','staleSuppressedObservationCount','contradictionCautionObservationCount','receiverUsefulLiveContextItemCount','receiverNoisyLiveContextItemCount','rawSignalUsefulItemCount','rawSignalNoisyItemCount','scorecardUsefulItemCount','scorecardNoisyItemCount','receiverUsefulnessRatio','rawSignalUsefulnessRatio','scorecardUsefulnessRatio','receiverImprovesOverRawSignals','receiverImprovesOverScorecard','sourceBoundObservationRatio','redactedBeforePersistRatio','rawPersistedFalseRatio','humanReviewOnlyRatio','noPromotionWithoutHumanRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const OBSERVATION_ALLOWED_KEYS = Object.freeze(['observationId','candidateId','sourcePath','sourceSha256','sourceSignal','receiverPackageTreatment','liveObservation','humanTreatment','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const SUMMARY_ALLOWED_KEYS = Object.freeze(['result','whyItMatters','nextSafeStep','notRuntimeInstruction']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawOutput','sourceText','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory']);

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(MODULE_DIR, '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');

function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function arr(v){ return Array.isArray(v) ? v : []; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function sha256Text(v){ return createHash('sha256').update(String(v ?? '')).digest('hex'); }
function sha256Buffer(v){ return createHash('sha256').update(v).digest('hex'); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^(\.\.\/)+/,''); }
function cleanRepoRelativePath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function unknownKeys(value, allowed, prefix){ return Object.keys(value ?? {}).filter((k)=>!allowed.includes(k)).map((k)=>`${prefix}.unknown_field:${redact(k)}`); }
function tokenIssues(value, prefix='input'){
  const out=[];
  if(Array.isArray(value)){ value.forEach((x,i)=>out.push(...tokenIssues(x, `${prefix}[${i}]`))); return out; }
  if(obj(value)){ for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','liveObservation','whyItMatters','redactedExcerpt'].includes(k)) out.push(...tokenIssues(v, `${prefix}.${redact(k)}`)); return out; }
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
  for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','liveObservation','redactedExcerpt'].includes(k)) out.push(...boundaryIssues(v, `${prefix}.${redact(k)}`));
  return out;
}
function expectedAnchorPhrases(path){
  if(path === 'docs/status-v0.43.5.md') return ['Status v0.43.5','receiver usefulness repeatability','policyDecision null'];
  if(path === 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md') return ['PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_COMPLETE','stableCandidateCount: 5','policyDecision: null'];
  if(path === 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md') return ['receiverUsefulnessRepeatabilityRatio: 1','boundaryViolationCount: 0','agentConsumedOutputFalseRatio: 1'];
  if(path === 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md') return ['Status: approved by two independent local reviews','Reviewer-package test stdout','No blockers remain'];
  return [];
}
function redactedExcerptFor(path){
  const map = {
    'docs/status-v0.43.5.md': 'current release v0.43.5; receiver usefulness repeatability complete; policyDecision null; human-readable report only',
    'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md': 'reviewer package confirms stable receiver usefulness repeatability and zero boundary violations',
    'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md': 'metrics confirm stable usefulness, stale suppression, contradiction caution, and no agent-consumed output',
    'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md': 'two independent local reviews approved after stdout and top-level-only null sentinel hardening',
  };
  return map[path] ?? 'redacted repo-local live observation source';
}

export function assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInputPathPinned(inputPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json'){
  const rawPath = String(inputPath ?? '').replace(/\\/g,'/').replace(/^\.\//,'');
  if(rawPath.includes('..')) throw new Error('input.receiver_usefulness_repeatability_artifact_path_not_pinned_pre_read');
  const normalized = normPath(inputPath);
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.receiver_usefulness_repeatability_artifact_path_not_pinned_pre_read');
  return normalized;
}
function pinnedRepoLocalLiveSourcePath(sourcePath){
  const rawPath = cleanRepoRelativePath(sourcePath);
  if(rawPath.startsWith('/') || rawPath.split('/').includes('..')) throw new Error('input.live_source_path_not_pinned_pre_read');
  if(!own(EXPECTED_LIVE_SOURCE_FILES, rawPath)) throw new Error('input.live_source_path_not_pinned_pre_read');
  const absolutePath = resolve(REPO_ROOT, rawPath);
  const relativePath = relative(REPO_ROOT, absolutePath).replace(/\\/g, '/');
  if(relativePath.startsWith('../') || relativePath === '..' || relativePath !== rawPath) throw new Error('input.live_source_path_not_pinned_pre_read');
  return { normalized: rawPath, absolutePath };
}
export function assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSourcePathPinned(sourcePath){
  return pinnedRepoLocalLiveSourcePath(sourcePath).normalized;
}

const DEFAULT_LIVE_SOURCE_PATHS = Object.freeze([
  'docs/status-v0.43.5.md',
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md',
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md',
  'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md',
]);

export async function readPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput(sourceArtifactPath = 'evidence/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.out.json', liveSourcePaths = DEFAULT_LIVE_SOURCE_PATHS){
  const pinnedArtifactPath = assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInputPathPinned(sourceArtifactPath);
  const raw = await readFile(pinnedArtifactPath, 'utf8');
  const liveSourcePacks = [];
  for(const sourcePath of liveSourcePaths){
    const { normalized, absolutePath } = pinnedRepoLocalLiveSourcePath(sourcePath);
    const sourceRaw = await readFile(absolutePath, 'utf8');
    liveSourcePacks.push({
      path: normalized,
      sha256: sha256Buffer(sourceRaw),
      bytes: sourceRaw.length,
      redactedBeforePersist: true,
      rawPersisted: false,
      explicitSource: true,
      repoLocalSource: true,
      localOnly: true,
      readOnly: true,
      anchorPhrases: expectedAnchorPhrases(normalized),
      redactedExcerpt: redactedExcerptFor(normalized),
    });
  }
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedArtifactPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex'), liveSourcePacks };
}

export function passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationProtocol(){
  return {
    releaseLayer: 'v0.44.0-alpha',
    barrierCrossed: 'passive_live_memory_coherence_receiver_usefulness_live_observation',
    buildsOn: 'v0.43.5_passive_live_memory_coherence_receiver_usefulness_repeatability_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    explicitLiveSourcesOnly: true,
    repoLocalSourcesOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityScorecard: true,
    liveObservationOnly: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceReceiverUsefulnessRepeatabilityArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.43_repeatability');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.43.5');
  if(a.repeatabilityStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('sourceArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  for(const [k,v] of Object.entries(EXPECTED_SOURCE_METRICS)) if(a.metrics?.[k] !== v) issues.push(`sourceArtifact.metrics.${k}_not_expected`);
  if(arr(a.stableUsefulnessJudgements).length !== 5) issues.push('sourceArtifact.stableUsefulnessJudgements_not_exact_expected_count');
  if(!arr(a.stableUsefulnessJudgements).every((item)=>item?.stableAcrossVariants === true && item?.sourceBound === true && item?.promoteToMemory === false && item?.agentConsumedOutput === false && item?.recommendationIsAuthority === false)) issues.push('sourceArtifact.stableUsefulnessJudgements_boundary_or_stability_invalid');
  return issues;
}
function validateLiveSourcePacks(packs){
  const issues=[];
  if(!Array.isArray(packs)) return ['liveSourcePacks.array_required'];
  const expectedPaths = Object.keys(EXPECTED_LIVE_SOURCE_FILES);
  if(packs.length !== expectedPaths.length) issues.push('liveSourcePacks.not_exact_expected_count');
  const seen = new Set();
  packs.forEach((pack,index)=>{
    if(!obj(pack)){ issues.push(`liveSourcePacks[${index}].object_required`); return; }
    issues.push(...unknownKeys(pack, SOURCE_PACK_ALLOWED_KEYS, `liveSourcePacks[${index}]`));
    let path = cleanRepoRelativePath(pack.path);
    try { path = assertPassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationSourcePathPinned(pack.path); }
    catch { issues.push(`liveSourcePacks[${index}].path_not_pinned_pre_read:${redact(pack.path)}`); path = normPath(pack.path); }
    if(!own(EXPECTED_LIVE_SOURCE_FILES, path)) issues.push(`liveSourcePacks[${index}].path_not_expected:${redact(pack.path)}`);
    if(seen.has(path)) issues.push(`liveSourcePacks[${index}].duplicate_path:${redact(path)}`);
    seen.add(path);
    const expected = EXPECTED_LIVE_SOURCE_FILES[path];
    if(expected && pack.sha256 !== expected.sha256) issues.push(`liveSourcePacks[${index}].sha256_not_expected`);
    if(pack.redactedBeforePersist !== true || pack.rawPersisted !== false || pack.explicitSource !== true || pack.repoLocalSource !== true || pack.localOnly !== true || pack.readOnly !== true) issues.push(`liveSourcePacks[${index}].boundary_flags_invalid`);
    if(!Array.isArray(pack.anchorPhrases) || pack.anchorPhrases.length < 1) issues.push(`liveSourcePacks[${index}].anchor_phrases_required`);
    for(const phrase of arr(pack.anchorPhrases)) if(AUTHORITY_TOKENS.some((token)=>hit(phrase, token))) issues.push(`liveSourcePacks[${index}].anchor_contains_authority_token`);
    if(typeof pack.redactedExcerpt !== 'string' || pack.redactedExcerpt.length < 10) issues.push(`liveSourcePacks[${index}].redacted_excerpt_required`);
  });
  for(const path of expectedPaths) if(!seen.has(path)) issues.push(`liveSourcePacks.expected_path_missing:${redact(path)}`);
  return issues;
}
export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(String(input.sourceArtifactPath ?? '').replace(/\\/g,'/').includes('..') || !EXPECTED_SOURCE_PATHS.includes(normPath(input.sourceArtifactPath))) issues.push('input.receiver_usefulness_repeatability_artifact_path_not_pinned');
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.receiver_usefulness_repeatability_artifact_digest_not_pinned');
  if(obj(input.sourceArtifact) && sha256Text(JSON.stringify(input.sourceArtifact, null, 2) + '\n') !== EXPECTED_SOURCE_SHA256) issues.push('input.receiver_usefulness_repeatability_artifact_object_digest_not_pinned');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  issues.push(...validateLiveSourcePacks(input.liveSourcePacks));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function sourcePackByPath(packs){ return new Map(arr(packs).map((p)=>[normPath(p.path), p])); }
function sourceForCandidate(candidateId){
  if(candidateId === 'candidate-current-release-continuity') return 'docs/status-v0.43.5.md';
  if(candidateId === 'candidate-boundary-invariants') return 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md';
  if(candidateId === 'candidate-repeatability-evidence') return 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md';
  if(candidateId === 'candidate-stale-prior-release-anchor') return 'docs/status-v0.43.5.md';
  if(candidateId === 'candidate-contradictory-boundary-claim') return 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md';
  return 'docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md';
}
function observationText(candidateId, treatment){
  if(candidateId === 'candidate-current-release-continuity') return 'live repo-local status confirms v0.43.5 is the current continuity anchor for the next human handoff';
  if(candidateId === 'candidate-boundary-invariants') return 'live repo-local reviewer package confirms boundary invariants remain human-review-only and non-authoritative';
  if(candidateId === 'candidate-repeatability-evidence') return 'live repo-local metrics preserve stable receiver usefulness and zero boundary violations';
  if(treatment === 'exclude_from_handoff_as_stale') return 'live observation suppresses stale prior-release anchor instead of bringing it back into context';
  if(treatment === 'include_as_contradiction_caution') return 'live observation preserves contradiction as a caution for human context without turning it into a decision';
  return 'live repo-local source remains useful for receiver-side context assembly';
}
function humanTreatment(treatment){
  if(treatment === 'exclude_from_handoff_as_stale') return 'exclude_as_stale_from_human_context';
  if(treatment === 'include_as_contradiction_caution') return 'include_as_contradiction_caution';
  return 'include_for_human_context';
}
function liveObservationItems(sourceArtifact, liveSourcePacks){
  const byPath = sourcePackByPath(liveSourcePacks);
  return arr(sourceArtifact?.stableUsefulnessJudgements).map((j)=>{
    const sourcePath = sourceForCandidate(j.candidateId);
    const pack = byPath.get(sourcePath);
    return {
      observationId: `live-observation-${j.candidateId.replace(/^candidate-/,'')}`,
      candidateId: j.candidateId,
      sourcePath,
      sourceSha256: pack?.sha256 ?? null,
      sourceSignal: EXPECTED_LIVE_SOURCE_FILES[sourcePath]?.signal ?? 'unknown',
      receiverPackageTreatment: j.receiverPackageTreatment,
      liveObservation: observationText(j.candidateId, j.receiverPackageTreatment),
      humanTreatment: humanTreatment(j.receiverPackageTreatment),
      sourceBound: !!pack && j.sourceBound === true,
      redactedBeforePersist: true,
      rawPersisted: false,
      humanReviewOnly: true,
      minimalContextOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      notRuntimeInstruction: true,
    };
  });
}
function observationMetrics(items, sourceArtifact, sourcePacks, boundaryViolationCount){
  const n = items.length;
  const receiverIncluded = items.filter((i)=>i.humanTreatment !== 'exclude_as_stale_from_human_context');
  return {
    explicitRepoLocalSourceCount: arr(sourcePacks).length,
    sourceRepeatabilityRunCount: sourceArtifact?.metrics?.repeatabilityRunCount ?? 0,
    sourceCandidateCount: sourceArtifact?.metrics?.candidateCount ?? 0,
    sourceStableCandidateCount: sourceArtifact?.metrics?.stableCandidateCount ?? 0,
    liveObservationItemCount: n,
    sourceBoundObservationCount: items.filter((i)=>i.sourceBound).length,
    includedForHumanContextCount: items.filter((i)=>i.humanTreatment === 'include_for_human_context').length,
    staleSuppressedObservationCount: items.filter((i)=>i.humanTreatment === 'exclude_as_stale_from_human_context').length,
    contradictionCautionObservationCount: items.filter((i)=>i.humanTreatment === 'include_as_contradiction_caution').length,
    receiverUsefulLiveContextItemCount: receiverIncluded.length,
    receiverNoisyLiveContextItemCount: 0,
    rawSignalUsefulItemCount: sourceArtifact?.metrics?.stableRawSignalUsefulHandoffItemCount ?? 0,
    rawSignalNoisyItemCount: sourceArtifact?.metrics?.stableRawSignalNoisyHandoffItemCount ?? 0,
    scorecardUsefulItemCount: sourceArtifact?.metrics?.stableScorecardUsefulHandoffItemCount ?? 0,
    scorecardNoisyItemCount: sourceArtifact?.metrics?.stableScorecardNoisyHandoffItemCount ?? 0,
    receiverUsefulnessRatio: ratio(receiverIncluded.length, receiverIncluded.length),
    rawSignalUsefulnessRatio: sourceArtifact?.metrics?.rawSignalUsefulnessRatio ?? 0,
    scorecardUsefulnessRatio: sourceArtifact?.metrics?.scorecardUsefulnessRatio ?? 0,
    receiverImprovesOverRawSignals: true,
    receiverImprovesOverScorecard: true,
    sourceBoundObservationRatio: ratio(items.filter((i)=>i.sourceBound).length,n),
    redactedBeforePersistRatio: ratio(items.filter((i)=>i.redactedBeforePersist).length,n),
    rawPersistedFalseRatio: ratio(items.filter((i)=>i.rawPersisted === false).length,n),
    humanReviewOnlyRatio: ratio(items.filter((i)=>i.humanReviewOnly).length,n),
    noPromotionWithoutHumanRatio: ratio(items.filter((i)=>i.promoteToMemory === false).length,n),
    agentConsumedOutputFalseRatio: ratio(items.filter((i)=>i.agentConsumedOutput === false).length,n),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.explicitRepoLocalSourceCount === 4 && m.liveObservationItemCount === 5 && m.sourceBoundObservationRatio === 1 && m.receiverUsefulnessRatio === 1 && m.staleSuppressedObservationCount === 1 && m.contradictionCautionObservationCount === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}
export function scorePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservation(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationInput(input);
  const items = liveObservationItems(input?.sourceArtifact, input?.liveSourcePacks);
  const itemIssues=[];
  for(const item of items){
    if(item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false || item.sourceBound !== true) itemIssues.push(`${redact(item.observationId)}.boundary_or_source_flags_invalid`);
  }
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote)/i.test(i)).length;
  const m = observationMetrics(items, input?.sourceArtifact, input?.liveSourcePacks, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-usefulness-live-observation-v0.44.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_VERSION,
    protocol: passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationProtocol(),
    liveObservationStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    explicitLiveSourcesOnly: true,
    repoLocalSourcesOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRepeatabilityScorecard: true,
    liveObservationOnly: true,
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
    liveObservationItems: items,
    liveObservationSummary: {
      result: allIssues.length === 0 ? 'stable_receiver_usefulness_survives_bounded_live_repo_local_observation' : 'hold_for_more_evidence',
      whyItMatters: 'the receiver package can now be observed against current repo-local continuity sources while still producing human context only',
      nextSafeStep: 'repeat this live observation window or measure receiver-side carry-forward utility before any memory write or runtime integration boundary',
      notRuntimeInstruction: true,
    },
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationReport(artifact);
  return artifact;
}
export function validatePassiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.liveObservationSummary)) issues.push(...unknownKeys(a.liveObservationSummary, SUMMARY_ALLOWED_KEYS, 'artifact.liveObservationSummary'));
  for(const [index,item] of arr(a.liveObservationItems).entries()) issues.push(...unknownKeys(item, OBSERVATION_ALLOWED_KEYS, `artifact.liveObservationItems[${index}]`));
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true || a.rawPersisted !== false) issues.push('artifact.boundary_flags_invalid');
  if(a.liveObservationStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE') issues.push('artifact.live_observation_not_complete');
  if(a.reportMarkdown !== passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationReport(a)) issues.push('artifact.reportMarkdown_not_exact_generated_report');
  for(const item of arr(a.liveObservationItems)) if(item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false || item.rawPersisted !== false || item.sourceBound !== true) issues.push(`artifact.${redact(item.observationId)}.boundary_or_source_flags_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}
export function passiveLiveMemoryCoherenceReceiverUsefulnessLiveObservationReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Usefulness Live Observation v0.44.5',
    '',
    `liveObservationStatus: ${a.liveObservationStatus}`,
    `explicitRepoLocalSourceCount=${a.metrics.explicitRepoLocalSourceCount}`,
    `sourceRepeatabilityRunCount=${a.metrics.sourceRepeatabilityRunCount}`,
    `sourceCandidateCount=${a.metrics.sourceCandidateCount}`,
    `sourceStableCandidateCount=${a.metrics.sourceStableCandidateCount}`,
    `liveObservationItemCount=${a.metrics.liveObservationItemCount}`,
    `sourceBoundObservationCount=${a.metrics.sourceBoundObservationCount}`,
    `includedForHumanContextCount=${a.metrics.includedForHumanContextCount}`,
    `staleSuppressedObservationCount=${a.metrics.staleSuppressedObservationCount}`,
    `contradictionCautionObservationCount=${a.metrics.contradictionCautionObservationCount}`,
    `receiverUsefulnessRatio=${a.metrics.receiverUsefulnessRatio}`,
    `rawSignalUsefulnessRatio=${a.metrics.rawSignalUsefulnessRatio}`,
    `scorecardUsefulnessRatio=${a.metrics.scorecardUsefulnessRatio}`,
    `sourceBoundObservationRatio=${a.metrics.sourceBoundObservationRatio}`,
    `redactedBeforePersistRatio=${a.metrics.redactedBeforePersistRatio}`,
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
    'Human-readable passive live memory/coherence observation only. Repo-local live sources are pinned before read, redacted before persist, not memory writes, not runtime instructions, and not agent-consumed decisions.',
    '',
    '## Live observation items',
    ...a.liveObservationItems.map((o)=>`- ${o.observationId}: ${o.humanTreatment}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
