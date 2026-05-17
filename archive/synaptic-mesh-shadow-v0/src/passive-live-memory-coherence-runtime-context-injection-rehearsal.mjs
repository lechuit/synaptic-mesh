import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunArtifact } from './passive-live-memory-coherence-runtime-context-injection-dry-run.mjs';

export const PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_VERSION = 'v0.49.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-runtime-context-injection-rehearsal-v0.49.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-runtime-context-injection-dry-run-v0.48.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-runtime-context-injection-dry-run-v0.48.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.48.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json',
]);
const EXPECTED_SOURCE_REPORT_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md',
]);
const EXPECTED_SOURCE_SHA256 = 'c5bf8d40f3d400de02ce048f2881e90ed612e2739f8367a3f7a6fc48713f2462';
const EXPECTED_SOURCE_REPORT_MARKDOWN_SHA256 = 'ba9d922963075396b29a6618637e3198ddf382dde923606b16798ddb0d17709f';
const EXPECTED_SOURCE_REPORT_SHA256 = 'ab490cd1a9663313397acae02a32430ef900c384d6d6eb79fc90b9142039be3c';
const NEXT_BARRIER = 'receiver_runtime_test_harness_consumption_rehearsal_with_explicit_operator_approval';

const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256','sourceReport','sourceReportPath','sourceReportSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','rehearsalStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextDryRun','sourceArtifactPath','sourceArtifactSha256','sourceReportPath','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','machineShapedAdapterRehearsalEnvelope','humanReviewOnly','nonAuthoritative','nextBarrier','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects','policyDecision','validationIssues','metrics','contextCards','injectionEnvelope','harnessTrace','receiverFacingContextBlocks','blockedEffects','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextDryRun','machineShapedAdapterRehearsalEnvelope','humanReviewOnly','nonAuthoritative','nextBarrier','redactedBeforePersist','rawSourceCache','rawPersisted','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects']);
const METRICS_ALLOWED_KEYS = Object.freeze(['sourceRuntimeContextCardCount','sourceHarnessConsumableCandidateCount','sourceRuntimeBridgeSignalCount','sourceRuntimeBlockedUntilNextBarrierCount','sourceBoundaryViolationCount','contextCardsConsumedByLocalRehearsalCount','injectionEnvelopeCount','injectionEnvelopeContextBlockCount','receiverFacingContextBlockCount','allEffectsBlockedUntilNextBarrierCount','blockedEffectKindCount','forbiddenEffectCount','sourceBoundContextCardRatio','sourceBoundReceiverBlockRatio','rawPersistedFalseRatio','agentConsumedOutputFalseRatio','preReadPathPinned','boundaryViolationCount']);
const CONTEXT_CARD_ALLOWED_KEYS = Object.freeze(['cardId','sourceCardId','handoffItemId','sourcePath','sourceSha256','eligibleForReceiverFacingBlock','rehearsalLocalOnly','blockedUntilNextBarrier','nextBarrier','sourceBound','redactedBeforePersist','rawPersisted','humanReviewOnly','agentConsumedOutput','recommendationIsAuthority','notRuntimeInstruction']);
const ENVELOPE_ALLOWED_KEYS = Object.freeze(['envelopeId','schemaVersion','adapterHarnessKind','localOnly','rehearsalOnly','receiverHarnessCanParseNext','contextBlockRefs','effectDisposition','nextBarrier','notRuntimeInstruction']);
const TRACE_ALLOWED_KEYS = Object.freeze(['traceId','sourceCardId','operation','result','blockedUntilNextBarrier','sourceBound','notRuntimeInstruction']);
const BLOCK_ALLOWED_KEYS = Object.freeze(['blockId','sourceCardId','handoffItemId','receiverFacingKind','contentDigest','sourcePath','sourceSha256','blockedUntilNextBarrier','sourceBound','rawPersisted','agentConsumedOutput','notRuntimeInstruction']);
const EFFECT_ALLOWED_KEYS = Object.freeze(['effectKind','status','reason','nextBarrier']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawOutput','sourceText','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory','runtimeAdapter','mcpClient','mcpServer','a2aClient','a2aServer']);

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
  if(own(value,'policyDecision') && value.policyDecision !== null) out.push(`${prefix}.top_level_compat_sentinel_non_null`);
  if(own(value,'recommendationIsAuthority') && value.recommendationIsAuthority !== false) out.push(`${prefix}.recommendation_treated_as_authority`);
  if(own(value,'agentConsumedOutput') && value.agentConsumedOutput !== false) out.push(`${prefix}.agent_consumed_output_true`);
  if(own(value,'rawPersisted') && value.rawPersisted !== false) out.push(`${prefix}.raw_persisted_true`);
  for(const k of FORBIDDEN_FIELDS) if(own(value,k) && value[k] !== false) out.push(`${prefix}.forbidden_boundary_field_set:${k}`);
  for(const [k,v] of Object.entries(value)) if(!['reportMarkdown','whyUsefulForEventualAgentContext','whatThisProvesForLiveRuntime'].includes(k)) out.push(...boundaryIssues(v, `${prefix}.${k}`));
  return out;
}
function expectedPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.source_artifact_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_PATHS.includes(normalized)) throw new Error('input.source_artifact_path_not_pinned_pre_read');
  return normalized;
}
function expectedReportPath(inputPath){
  const normalized = normPath(inputPath);
  if(normalized.startsWith('/') || normalized.split('/').includes('..')) throw new Error('input.source_report_path_not_pinned_pre_read');
  if(!EXPECTED_SOURCE_REPORT_PATHS.includes(normalized)) throw new Error('input.source_report_path_not_pinned_pre_read');
  return normalized;
}

export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInputPathPinned(inputPath = EXPECTED_SOURCE_PATHS[0]){ return expectedPath(inputPath); }
export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReportPathPinned(inputPath = EXPECTED_SOURCE_REPORT_PATHS[0]){ return expectedReportPath(inputPath); }
export async function readPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInput(sourceArtifactPath = EXPECTED_SOURCE_PATHS[0], sourceReportPath = EXPECTED_SOURCE_REPORT_PATHS[0]){
  const pinnedPath = assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInputPathPinned(sourceArtifactPath);
  const pinnedReportPath = assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReportPathPinned(sourceReportPath);
  const raw = await readFile(pinnedPath, 'utf8');
  const reportRaw = await readFile(pinnedReportPath, 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex'), sourceReport: reportRaw, sourceReportPath: pinnedReportPath, sourceReportSha256: createHash('sha256').update(reportRaw).digest('hex') };
}
export function passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalProtocol(){
  return {
    releaseLayer: 'v0.49.0-alpha',
    barrierCrossed: 'local_adapter_live_context_injection_envelope_rehearsal',
    buildsOn: 'v0.48.5_passive_live_memory_coherence_runtime_context_injection_dry_run',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    rehearsalOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRuntimeContextDryRun: true,
    machineShapedAdapterRehearsalEnvelope: true,
    humanReviewOnly: true,
    nonAuthoritative: true,
    nextBarrier: NEXT_BARRIER,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noToolExecution: true,
    noNetworkFetch: true,
    noResourceFetch: true,
    noMemoryWrites: true,
    noConfigWrites: true,
    noRuntimeIntegration: true,
    noExternalEffects: true,
  };
}
function validateSourceArtifact(a){
  const issues=[];
  if(!obj(a)) return ['sourceArtifact.explicit_object_required'];
  issues.push(...validatePassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.48_dry_run');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.48.5');
  if(a.dryRunStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string' || sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_MARKDOWN_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  const m=a.metrics ?? {};
  if(m.runtimeContextCardCount !== 5) issues.push('sourceArtifact.metrics.runtimeContextCardCount_not_expected');
  if(m.harnessConsumableCandidateCount !== 4) issues.push('sourceArtifact.metrics.harnessConsumableCandidateCount_not_expected');
  if(m.runtimeBridgeSignalCount !== 4) issues.push('sourceArtifact.metrics.runtimeBridgeSignalCount_not_expected');
  if(m.runtimeBlockedUntilNextBarrierCount !== 5) issues.push('sourceArtifact.metrics.runtimeBlockedUntilNextBarrierCount_not_expected');
  if(m.sourceBoundCardRatio !== 1) issues.push('sourceArtifact.metrics.sourceBoundCardRatio_not_expected');
  if(m.boundaryViolationCount !== 0) issues.push('sourceArtifact.metrics.boundaryViolationCount_not_zero');
  if(arr(a.runtimeContextCards).length !== 5) issues.push('sourceArtifact.runtimeContextCards_not_exact_expected_count');
  if(!arr(a.runtimeContextCards).every((card)=>card.sourceBound === true && card.redactedBeforePersist === true && card.rawPersisted === false && card.humanReviewOnly === true && card.agentConsumedOutput === false && card.recommendationIsAuthority === false && card.notRuntimeInstruction === true)) issues.push('sourceArtifact.runtimeContextCards_boundary_or_source_invalid');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('sourceArtifact.protocol_repeats_compat_sentinel');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('sourceArtifact.metrics_repeats_compat_sentinel');
  return issues;
}
export function validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  try { expectedPath(input.sourceArtifactPath); } catch { issues.push('input.source_artifact_path_not_pinned_pre_read'); }
  if(input.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('input.source_artifact_digest_not_pinned');
  try { expectedReportPath(input.sourceReportPath); } catch { issues.push('input.source_report_path_not_pinned_pre_read'); }
  if(input.sourceReportSha256 !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('input.source_report_digest_not_pinned');
  if(typeof input.sourceReport !== 'string' || createHash('sha256').update(input.sourceReport ?? '').digest('hex') !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('input.source_report_content_digest_not_expected');
  issues.push(...validateSourceArtifact(input.sourceArtifact));
  issues.push(...boundaryIssues(input,'input'));
  return [...new Set(issues)];
}
function makeContextCards(source){
  return arr(source.runtimeContextCards).map((card)=>({
    cardId: `rehearsal-${card.cardId}`,
    sourceCardId: card.cardId,
    handoffItemId: card.handoffItemId,
    sourcePath: card.sourcePath,
    sourceSha256: card.sourceSha256,
    eligibleForReceiverFacingBlock: card.harnessConsumableContextCandidate === true && card.excludedAsStale !== true,
    rehearsalLocalOnly: true,
    blockedUntilNextBarrier: true,
    nextBarrier: NEXT_BARRIER,
    sourceBound: card.sourceBound,
    redactedBeforePersist: true,
    rawPersisted: false,
    humanReviewOnly: true,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    notRuntimeInstruction: true,
  }));
}
function makeReceiverBlocks(cards){
  return cards.filter((card)=>card.eligibleForReceiverFacingBlock).map((card, index)=>({
    blockId: `receiver-context-block-${String(index + 1).padStart(2,'0')}`,
    sourceCardId: card.sourceCardId,
    handoffItemId: card.handoffItemId,
    receiverFacingKind: 'source_bound_context_block_for_future_harness',
    contentDigest: sha256Text([card.sourceCardId, card.handoffItemId, card.sourcePath, card.sourceSha256].join('|')),
    sourcePath: card.sourcePath,
    sourceSha256: card.sourceSha256,
    blockedUntilNextBarrier: true,
    sourceBound: true,
    rawPersisted: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
  }));
}
function makeHarnessTrace(cards, blocks){
  const blockRefs = new Set(blocks.map((b)=>b.sourceCardId));
  return cards.map((card)=>({
    traceId: `trace-${card.sourceCardId}`,
    sourceCardId: card.sourceCardId,
    operation: blockRefs.has(card.sourceCardId) ? 'card_to_receiver_facing_context_block' : 'card_suppressed_from_receiver_facing_block',
    result: blockRefs.has(card.sourceCardId) ? 'local_envelope_member_created' : 'stale_or_ineligible_card_kept_out_of_envelope',
    blockedUntilNextBarrier: true,
    sourceBound: card.sourceBound,
    notRuntimeInstruction: true,
  }));
}
function makeBlockedEffects(){
  return ['production_runtime_integration','daemon_or_watch_mode','sdk_or_framework_adapter','mcp_or_a2a_client_server','network_or_resource_fetch','tool_execution','memory_or_config_write','external_side_effect','authorization_enforcement_decision','automatic_agent_consumption'].map((effectKind)=>({
    effectKind,
    status: 'blocked_until_next_barrier',
    reason: 'v0.49 is local reversible adapter rehearsal evidence only',
    nextBarrier: NEXT_BARRIER,
  }));
}
function makeMetrics(source, cards, blocks, blockedEffects, boundaryViolationCount){
  return {
    sourceRuntimeContextCardCount: source?.metrics?.runtimeContextCardCount ?? 0,
    sourceHarnessConsumableCandidateCount: source?.metrics?.harnessConsumableCandidateCount ?? 0,
    sourceRuntimeBridgeSignalCount: source?.metrics?.runtimeBridgeSignalCount ?? 0,
    sourceRuntimeBlockedUntilNextBarrierCount: source?.metrics?.runtimeBlockedUntilNextBarrierCount ?? 0,
    sourceBoundaryViolationCount: source?.metrics?.boundaryViolationCount ?? -1,
    contextCardsConsumedByLocalRehearsalCount: cards.length,
    injectionEnvelopeCount: 1,
    injectionEnvelopeContextBlockCount: blocks.length,
    receiverFacingContextBlockCount: blocks.length,
    allEffectsBlockedUntilNextBarrierCount: blockedEffects.length,
    blockedEffectKindCount: blockedEffects.length,
    forbiddenEffectCount: 0,
    sourceBoundContextCardRatio: ratio(cards.filter((c)=>c.sourceBound).length, cards.length),
    sourceBoundReceiverBlockRatio: ratio(blocks.filter((b)=>b.sourceBound).length, blocks.length),
    rawPersistedFalseRatio: ratio([...cards,...blocks].filter((x)=>x.rawPersisted === false).length, cards.length + blocks.length),
    agentConsumedOutputFalseRatio: ratio([...cards,...blocks].filter((x)=>x.agentConsumedOutput === false).length, cards.length + blocks.length),
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.contextCardsConsumedByLocalRehearsalCount === 5 && m.injectionEnvelopeCount === 1 && m.receiverFacingContextBlockCount === 4 && m.allEffectsBlockedUntilNextBarrierCount === 10 && m.sourceBoundContextCardRatio === 1 && m.sourceBoundReceiverBlockRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_TO_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL' : 'HOLD_FOR_MORE_EVIDENCE';
}
export function scorePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsal(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalInput(input);
  const contextCards = makeContextCards(input?.sourceArtifact ?? {});
  const receiverFacingContextBlocks = makeReceiverBlocks(contextCards);
  const harnessTrace = makeHarnessTrace(contextCards, receiverFacingContextBlocks);
  const blockedEffects = makeBlockedEffects();
  const injectionEnvelope = {
    envelopeId: 'local-adapter-rehearsal-envelope-v0.49.5-001',
    schemaVersion: 'passive-live-memory-coherence-runtime-context-injection-rehearsal-envelope-v0.49.0-alpha',
    adapterHarnessKind: 'deterministic_local_receiver_context_injection_rehearsal',
    localOnly: true,
    rehearsalOnly: true,
    receiverHarnessCanParseNext: true,
    contextBlockRefs: receiverFacingContextBlocks.map((block)=>block.blockId),
    effectDisposition: 'all_effects_blocked_until_next_barrier',
    nextBarrier: NEXT_BARRIER,
    notRuntimeInstruction: true,
  };
  const cardIssues=[];
  if(receiverFacingContextBlocks.length !== 4) cardIssues.push('rehearsal.receiver_facing_context_block_count_unexpected');
  for(const card of contextCards){
    if(card.sourceBound !== true || card.rawPersisted !== false || card.agentConsumedOutput !== false || card.recommendationIsAuthority !== false || card.blockedUntilNextBarrier !== true) cardIssues.push(`${card.sourceCardId}.boundary_source_or_rehearsal_invalid`);
  }
  const allIssues=[...new Set([...inputIssues,...cardIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(compat_sentinel|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote|tool|network|config|memory|agent)/i.test(i)).length;
  const metrics = makeMetrics(input?.sourceArtifact, contextCards, receiverFacingContextBlocks, blockedEffects, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-runtime-context-injection-rehearsal-v0.49.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_VERSION,
    protocol: passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalProtocol(),
    rehearsalStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    rehearsalOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRuntimeContextDryRun: true,
    sourceArtifactPath: input?.sourceArtifactPath,
    sourceArtifactSha256: input?.sourceArtifactSha256,
    sourceReportPath: input?.sourceReportPath,
    sourceReportSha256: input?.sourceReportSha256,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    machineShapedAdapterRehearsalEnvelope: true,
    humanReviewOnly: true,
    nonAuthoritative: true,
    nextBarrier: NEXT_BARRIER,
    recommendation: recommendation(metrics, allIssues),
    recommendationIsAuthority: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
    noRuntimeAuthority: true,
    noToolExecution: true,
    noNetworkFetch: true,
    noResourceFetch: true,
    noMemoryWrites: true,
    noConfigWrites: true,
    noRuntimeIntegration: true,
    noExternalEffects: true,
    policyDecision: null,
    validationIssues: allIssues,
    metrics,
    contextCards,
    injectionEnvelope,
    harnessTrace,
    receiverFacingContextBlocks,
    blockedEffects,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReport(artifact);
  return artifact;
}
export function validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.injectionEnvelope)) issues.push(...unknownKeys(a.injectionEnvelope, ENVELOPE_ALLOWED_KEYS, 'artifact.injectionEnvelope'));
  for(const [index,card] of arr(a.contextCards).entries()) issues.push(...unknownKeys(card, CONTEXT_CARD_ALLOWED_KEYS, `artifact.contextCards[${index}]`));
  for(const [index,trace] of arr(a.harnessTrace).entries()) issues.push(...unknownKeys(trace, TRACE_ALLOWED_KEYS, `artifact.harnessTrace[${index}]`));
  for(const [index,block] of arr(a.receiverFacingContextBlocks).entries()) issues.push(...unknownKeys(block, BLOCK_ALLOWED_KEYS, `artifact.receiverFacingContextBlocks[${index}]`));
  for(const [index,effect] of arr(a.blockedEffects).entries()) issues.push(...unknownKeys(effect, EFFECT_ALLOWED_KEYS, `artifact.blockedEffects[${index}]`));
  if(a.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_ARTIFACT) issues.push('artifact.artifact_id_unexpected');
  if(a.schemaVersion !== 'passive-live-memory-coherence-runtime-context-injection-rehearsal-v0.49.0-alpha') issues.push('artifact.schema_unexpected');
  if(a.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_VERSION) issues.push('artifact.release_unexpected');
  if(a.rehearsalStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE') issues.push('artifact.status_not_complete');
  if(a.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('artifact.source_digest_unexpected');
  if(a.sourceReportSha256 !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('artifact.source_report_digest_unexpected');
  if(a.policyDecision !== null) issues.push('artifact.top_level_compat_sentinel_non_null');
  if(obj(a.protocol) && own(a.protocol,'policyDecision')) issues.push('artifact.protocol_repeats_compat_sentinel');
  if(obj(a.metrics) && own(a.metrics,'policyDecision')) issues.push('artifact.metrics_repeats_compat_sentinel');
  const m = a.metrics ?? {};
  if(m.contextCardsConsumedByLocalRehearsalCount !== 5 || m.injectionEnvelopeCount !== 1 || m.receiverFacingContextBlockCount !== 4) issues.push('artifact.rehearsal_shape_metrics_unexpected');
  if(m.allEffectsBlockedUntilNextBarrierCount !== 10 || m.forbiddenEffectCount !== 0 || m.boundaryViolationCount !== 0) issues.push('artifact.effect_or_boundary_metrics_unexpected');
  if(m.sourceBoundContextCardRatio !== 1 || m.sourceBoundReceiverBlockRatio !== 1) issues.push('artifact.source_bound_metrics_unexpected');
  if(arr(a.injectionEnvelope?.contextBlockRefs).length !== arr(a.receiverFacingContextBlocks).length) issues.push('artifact.envelope_refs_do_not_match_receiver_blocks');
  issues.push(...boundaryIssues(a,'artifact'));
  return [...new Set(issues)];
}
export function passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalReport(a){
  return [
    '# Passive Live Memory Coherence Runtime Context Injection Rehearsal v0.49.5',
    '',
    `rehearsalStatus: ${a.rehearsalStatus}`,
    `sourceRuntimeContextCardCount=${a.metrics.sourceRuntimeContextCardCount}`,
    `contextCardsConsumedByLocalRehearsalCount=${a.metrics.contextCardsConsumedByLocalRehearsalCount}`,
    `injectionEnvelopeCount=${a.metrics.injectionEnvelopeCount}`,
    `injectionEnvelopeContextBlockCount=${a.metrics.injectionEnvelopeContextBlockCount}`,
    `receiverFacingContextBlockCount=${a.metrics.receiverFacingContextBlockCount}`,
    `allEffectsBlockedUntilNextBarrierCount=${a.metrics.allEffectsBlockedUntilNextBarrierCount}`,
    `sourceBoundContextCardRatio=${a.metrics.sourceBoundContextCardRatio}`,
    `sourceBoundReceiverBlockRatio=${a.metrics.sourceBoundReceiverBlockRatio}`,
    `forbiddenEffectCount=${a.metrics.forbiddenEffectCount}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `nextBarrier: ${a.nextBarrier}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    '',
    'Rehearsal claim: v0.49 consumes the pinned v0.48.5 machine-shaped runtime context cards in a deterministic local adapter harness and emits one receiver-facing injection envelope with four source-bound context blocks. It remains local, reversible, read-only, non-authoritative, and blocked until the next explicit barrier; there is no production runtime, network, tool, memory, config, external effect, or automatic agent consumption.',
    '',
    '## Injection envelope',
    `- ${a.injectionEnvelope.envelopeId}: blocks=${a.injectionEnvelope.contextBlockRefs.length}; disposition=${a.injectionEnvelope.effectDisposition}; nextBarrier=${a.injectionEnvelope.nextBarrier}`,
    '',
    '## Receiver-facing context blocks',
    ...a.receiverFacingContextBlocks.map((o)=>`- ${o.blockId}: sourceCard=${o.sourceCardId}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; blockedUntilNextBarrier=${o.blockedUntilNextBarrier}; contentDigest=${o.contentDigest}`),
    '',
    '## Blocked effects',
    ...a.blockedEffects.map((o)=>`- ${o.effectKind}: ${o.status}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
