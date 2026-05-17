import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalArtifact } from './passive-live-memory-coherence-runtime-context-injection-rehearsal.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRootPrefix = 'implementation/synaptic-mesh-shadow-v0/';
function pinnedReadPath(normalizedPath){
  const packageRelative = normalizedPath.startsWith(repoRootPrefix) ? normalizedPath.slice(repoRootPrefix.length) : normalizedPath;
  return resolve(packageRoot, packageRelative);
}

export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_VERSION = 'v0.50.5';
export const PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-v0.50.5';

const EXPECTED_SOURCE_ARTIFACT = 'T-synaptic-mesh-passive-live-memory-coherence-runtime-context-injection-rehearsal-v0.49.5';
const EXPECTED_SOURCE_SCHEMA = 'passive-live-memory-coherence-runtime-context-injection-rehearsal-v0.49.0-alpha';
const EXPECTED_SOURCE_RELEASE = 'v0.49.5';
const EXPECTED_SOURCE_STATUS = 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE';
const EXPECTED_SOURCE_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json',
]);
const EXPECTED_SOURCE_REPORT_PATHS = Object.freeze([
  'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md',
]);
const EXPECTED_SOURCE_SHA256 = 'e0dbbfa1394f614dac521d3df58a6cb9e329e22d0db1b1640131eecbfcd9265e';
const EXPECTED_SOURCE_REPORT_SHA256 = '66d017404d1bde5d3a323caea40a2a3c0f168d4ce677815c2df1ea1a71d808c1';
const EXPECTED_SOURCE_REPORT_MARKDOWN_SHA256 = '0640531f38d54ddd328e5e5693e41d8b1b499018a1d80a0a49c5ecbab0a17c60';
const NEXT_BARRIER = 'bounded_receiver_runtime_test_harness_or_fixture_suite_after_local_consumption_rehearsal';

const INPUT_ALLOWED_KEYS = Object.freeze(['sourceArtifact','sourceArtifactPath','sourceArtifactSha256','sourceReport','sourceReportPath','sourceReportSha256']);
const ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','rehearsalStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal','sourceArtifactPath','sourceArtifactSha256','sourceReportPath','sourceReportSha256','redactedBeforePersist','rawSourceCache','rawPersisted','receiverRuntimeTestHarnessConsumptionRehearsal','humanReviewOnly','nonAuthoritative','nextBarrier','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects','operatorApprovalRecord','policyDecision','validationIssues','metrics','harnessInputEnvelope','receiverHarnessTrace','consumedContextBlocks','consumptionDecisions','blockedEffects','reportMarkdown']);
const PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal','receiverRuntimeTestHarnessConsumptionRehearsal','humanReviewOnly','nonAuthoritative','nextBarrier','redactedBeforePersist','rawSourceCache','rawPersisted','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects']);
const METRICS_ALLOWED_KEYS = Object.freeze(['sourceReceiverFacingContextBlockCount','sourceInjectionEnvelopeCount','sourceContextCardsConsumedByLocalRehearsalCount','sourceAllEffectsBlockedUntilNextBarrierCount','sourceBoundaryViolationCount','sourceReportDigestPinned','sourceArtifactDigestPinned','harnessInputEnvelopeCount','sourceReceiverBlockCountConsumedAsLocalTestInput','harnessParseSuccessCount','consumedContextBlockCount','consumptionDecisionCount','effectsBlockedCount','forbiddenEffectCount','sourceBoundConsumedBlockRatio','rawPersistedFalseRatio','agentConsumedOutputFalseRatio','operatorApprovalScopeRecorded','preReadPathPinned','boundaryViolationCount']);
const OPERATOR_RECORD_ALLOWED_KEYS = Object.freeze(['operatorApprovalScope','recordKind','localOnly','rehearsalOnly','preflightOnly','notRuntimeApproval','notGeneralPermission','notAuthorizationDecision','notAllowBlockDecision','notEnforcement','recordedBeforeHarnessConsumption']);
const ENVELOPE_ALLOWED_KEYS = Object.freeze(['envelopeId','sourceEnvelopeId','schemaVersion','harnessKind','localOnly','rehearsalOnly','parseMode','receiverFacingBlockRefs','operatorApprovalScope','effectDisposition','nextBarrier','notRuntimeInstruction']);
const TRACE_ALLOWED_KEYS = Object.freeze(['traceId','blockId','operation','result','sourceBound','effectBlocked','notRuntimeInstruction']);
const BLOCK_ALLOWED_KEYS = Object.freeze(['blockId','sourceBlockId','sourceCardId','handoffItemId','receiverFacingKind','contentDigest','sourcePath','sourceSha256','consumedAsLocalTestInput','sourceBound','rawPersisted','agentConsumedOutput','notRuntimeInstruction']);
const DECISION_ALLOWED_KEYS = Object.freeze(['decisionId','blockId','decisionKind','nonAuthoritative','reason','effect','notRuntimeInstruction']);
const EFFECT_ALLOWED_KEYS = Object.freeze(['effectKind','status','reason','nextBarrier']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawOutput','sourceText','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock','promoteToMemory','runtimeAdapter','mcpClient','mcpServer','a2aClient','a2aServer']);

const EXPECTED_BLOCKED_EFFECT_KINDS = Object.freeze(['production_runtime_integration','daemon_or_watch_mode','sdk_or_framework_adapter','mcp_or_a2a_client_server','network_or_resource_fetch','tool_execution','memory_or_config_write','external_side_effect','authorization_enforcement_decision','automatic_agent_consumption']);
const TOP_LEVEL_TRUE_FLAGS = Object.freeze(['disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal','redactedBeforePersist','receiverRuntimeTestHarnessConsumptionRehearsal','humanReviewOnly','nonAuthoritative','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects']);
const TOP_LEVEL_FALSE_FLAGS = Object.freeze(['rawPersisted','recommendationIsAuthority','agentConsumedOutput']);
const PROTOCOL_TRUE_FLAGS = Object.freeze(['disabledByDefault','operatorRunOneShotOnly','localOnly','rehearsalOnly','readOnly','explicitArtifactsOnly','preReadPathPinned','acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal','receiverRuntimeTestHarnessConsumptionRehearsal','humanReviewOnly','nonAuthoritative','redactedBeforePersist','notRuntimeInstruction','noRuntimeAuthority','noToolExecution','noNetworkFetch','noResourceFetch','noMemoryWrites','noConfigWrites','noRuntimeIntegration','noExternalEffects']);
const PROTOCOL_FALSE_FLAGS = Object.freeze(['rawPersisted','recommendationIsAuthority','agentConsumedOutput']);
const OPERATOR_RECORD_TRUE_FLAGS = Object.freeze(['localOnly','rehearsalOnly','preflightOnly','notRuntimeApproval','notGeneralPermission','notAuthorizationDecision','notAllowBlockDecision','notEnforcement','recordedBeforeHarnessConsumption']);
function assertBooleanFlags(value, trueFlags, falseFlags, prefix, issues){
  for(const flag of trueFlags) if(value?.[flag] !== true) issues.push(`${prefix}.${flag}_not_true`);
  for(const flag of falseFlags) if(value?.[flag] !== false) issues.push(`${prefix}.${flag}_not_false`);
}

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
  if(!['artifact','input.sourceArtifact'].includes(prefix) && own(value,'policyDecision')) out.push(`${prefix}.nested_compat_sentinel_smuggling`);
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

export function assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInputPathPinned(inputPath = EXPECTED_SOURCE_PATHS[0]){ return expectedPath(inputPath); }
export function assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalReportPathPinned(inputPath = EXPECTED_SOURCE_REPORT_PATHS[0]){ return expectedReportPath(inputPath); }
export async function readPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput(sourceArtifactPath = EXPECTED_SOURCE_PATHS[0], sourceReportPath = EXPECTED_SOURCE_REPORT_PATHS[0]){
  const pinnedPath = assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInputPathPinned(sourceArtifactPath);
  const pinnedReportPath = assertPassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalReportPathPinned(sourceReportPath);
  const raw = await readFile(pinnedReadPath(pinnedPath), 'utf8');
  const reportRaw = await readFile(pinnedReadPath(pinnedReportPath), 'utf8');
  return { sourceArtifact: JSON.parse(raw), sourceArtifactPath: pinnedPath, sourceArtifactSha256: createHash('sha256').update(raw).digest('hex'), sourceReport: reportRaw, sourceReportPath: pinnedReportPath, sourceReportSha256: createHash('sha256').update(reportRaw).digest('hex') };
}
export function passiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalProtocol(){
  return {
    releaseLayer: 'v0.50.0-alpha',
    barrierCrossed: 'local_receiver_runtime_test_harness_consumption_rehearsal',
    buildsOn: 'v0.49.5_passive_live_memory_coherence_runtime_context_injection_rehearsal',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    rehearsalOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal: true,
    receiverRuntimeTestHarnessConsumptionRehearsal: true,
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
  issues.push(...validatePassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalArtifact(a).map((i)=>`sourceArtifact.${i}`));
  if(a.artifact !== EXPECTED_SOURCE_ARTIFACT) issues.push('sourceArtifact.artifact_not_expected_v0.49_rehearsal');
  if(a.schemaVersion !== EXPECTED_SOURCE_SCHEMA) issues.push('sourceArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_SOURCE_RELEASE) issues.push('sourceArtifact.release_layer_not_v0.49.5');
  if(a.rehearsalStatus !== EXPECTED_SOURCE_STATUS) issues.push('sourceArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string' || sha256Text(a.reportMarkdown) !== EXPECTED_SOURCE_REPORT_MARKDOWN_SHA256) issues.push('sourceArtifact.reportMarkdown_digest_not_expected');
  const m=a.metrics ?? {};
  if(m.contextCardsConsumedByLocalRehearsalCount !== 5) issues.push('sourceArtifact.metrics.contextCardsConsumedByLocalRehearsalCount_not_expected');
  if(m.injectionEnvelopeCount !== 1) issues.push('sourceArtifact.metrics.injectionEnvelopeCount_not_expected');
  if(m.receiverFacingContextBlockCount !== 4) issues.push('sourceArtifact.metrics.receiverFacingContextBlockCount_not_expected');
  if(m.allEffectsBlockedUntilNextBarrierCount !== 10) issues.push('sourceArtifact.metrics.allEffectsBlockedUntilNextBarrierCount_not_expected');
  if(m.sourceBoundReceiverBlockRatio !== 1) issues.push('sourceArtifact.metrics.sourceBoundReceiverBlockRatio_not_expected');
  if(m.boundaryViolationCount !== 0) issues.push('sourceArtifact.metrics.boundaryViolationCount_not_zero');
  if(arr(a.receiverFacingContextBlocks).length !== 4) issues.push('sourceArtifact.receiverFacingContextBlocks_not_exact_expected_count');
  if(!arr(a.receiverFacingContextBlocks).every((block)=>block.sourceBound === true && block.rawPersisted === false && block.agentConsumedOutput === false && block.notRuntimeInstruction === true)) issues.push('sourceArtifact.receiverFacingContextBlocks_boundary_or_source_invalid');
  if(obj(a.protocol) && own(a.protocol, 'policyDecision')) issues.push('sourceArtifact.protocol_repeats_compat_sentinel');
  if(obj(a.metrics) && own(a.metrics, 'policyDecision')) issues.push('sourceArtifact.metrics_repeats_compat_sentinel');
  return issues;
}
export function validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput(input={}){
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
function makeConsumedBlocks(source){
  return arr(source.receiverFacingContextBlocks).map((block)=>({
    blockId: `consumed-${block.blockId}`,
    sourceBlockId: block.blockId,
    sourceCardId: block.sourceCardId,
    handoffItemId: block.handoffItemId,
    receiverFacingKind: 'local_receiver_runtime_test_harness_input_block',
    contentDigest: block.contentDigest,
    sourcePath: block.sourcePath,
    sourceSha256: block.sourceSha256,
    consumedAsLocalTestInput: true,
    sourceBound: block.sourceBound,
    rawPersisted: false,
    agentConsumedOutput: false,
    notRuntimeInstruction: true,
  }));
}
function makeHarnessTrace(blocks){
  return blocks.map((block)=>({
    traceId: `receiver-harness-trace-${block.sourceBlockId}`,
    blockId: block.blockId,
    operation: 'parse_receiver_facing_block_as_local_test_input',
    result: 'parsed_and_consumed_by_deterministic_local_test_harness_simulator',
    sourceBound: block.sourceBound,
    effectBlocked: true,
    notRuntimeInstruction: true,
  }));
}
function makeConsumptionDecisions(blocks){
  return blocks.map((block)=>({
    decisionId: `non-authoritative-consumption-${block.sourceBlockId}`,
    blockId: block.blockId,
    decisionKind: 'local_test_input_consumed_no_runtime_authority',
    nonAuthoritative: true,
    reason: 'receiver-facing context block was parsed for deterministic local harness rehearsal only',
    effect: 'no_effect',
    notRuntimeInstruction: true,
  }));
}
function makeBlockedEffects(){
  return EXPECTED_BLOCKED_EFFECT_KINDS.map((effectKind)=>({
    effectKind,
    status: 'blocked_until_next_barrier',
    reason: 'v0.50 parses and consumes local receiver-facing blocks as deterministic test input only',
    nextBarrier: NEXT_BARRIER,
  }));
}
function makeMetrics(source, blocks, decisions, trace, blockedEffects, boundaryViolationCount){
  return {
    sourceReceiverFacingContextBlockCount: source?.metrics?.receiverFacingContextBlockCount ?? 0,
    sourceInjectionEnvelopeCount: source?.metrics?.injectionEnvelopeCount ?? 0,
    sourceContextCardsConsumedByLocalRehearsalCount: source?.metrics?.contextCardsConsumedByLocalRehearsalCount ?? 0,
    sourceAllEffectsBlockedUntilNextBarrierCount: source?.metrics?.allEffectsBlockedUntilNextBarrierCount ?? 0,
    sourceBoundaryViolationCount: source?.metrics?.boundaryViolationCount ?? -1,
    sourceReportDigestPinned: true,
    sourceArtifactDigestPinned: true,
    harnessInputEnvelopeCount: 1,
    sourceReceiverBlockCountConsumedAsLocalTestInput: arr(source?.receiverFacingContextBlocks).length,
    harnessParseSuccessCount: trace.filter((t)=>t.result === 'parsed_and_consumed_by_deterministic_local_test_harness_simulator').length,
    consumedContextBlockCount: blocks.length,
    consumptionDecisionCount: decisions.length,
    effectsBlockedCount: blockedEffects.length,
    forbiddenEffectCount: 0,
    sourceBoundConsumedBlockRatio: ratio(blocks.filter((b)=>b.sourceBound).length, blocks.length),
    rawPersistedFalseRatio: ratio(blocks.filter((b)=>b.rawPersisted === false).length, blocks.length),
    agentConsumedOutputFalseRatio: ratio(blocks.filter((b)=>b.agentConsumedOutput === false).length, blocks.length),
    operatorApprovalScopeRecorded: true,
    preReadPathPinned: true,
    boundaryViolationCount,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.sourceReceiverBlockCountConsumedAsLocalTestInput === 4 && m.harnessParseSuccessCount === 4 && m.consumedContextBlockCount === 4 && m.effectsBlockedCount === 10 && m.sourceBoundConsumedBlockRatio === 1 && m.agentConsumedOutputFalseRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_TO_BOUNDED_RECEIVER_RUNTIME_TEST_HARNESS_OR_FIXTURE_SUITE' : 'HOLD_FOR_MORE_EVIDENCE';
}
export function scorePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsal(input={}){
  const inputIssues = validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalInput(input);
  const consumedContextBlocks = makeConsumedBlocks(input?.sourceArtifact ?? {});
  const receiverHarnessTrace = makeHarnessTrace(consumedContextBlocks);
  const consumptionDecisions = makeConsumptionDecisions(consumedContextBlocks);
  const blockedEffects = makeBlockedEffects();
  const operatorApprovalRecord = {
    operatorApprovalScope: 'local_test_harness_rehearsal_only',
    recordKind: 'local_preflight_record',
    localOnly: true,
    rehearsalOnly: true,
    preflightOnly: true,
    notRuntimeApproval: true,
    notGeneralPermission: true,
    notAuthorizationDecision: true,
    notAllowBlockDecision: true,
    notEnforcement: true,
    recordedBeforeHarnessConsumption: true,
  };
  const harnessInputEnvelope = {
    envelopeId: 'local-receiver-runtime-test-harness-input-envelope-v0.50.5-001',
    sourceEnvelopeId: input?.sourceArtifact?.injectionEnvelope?.envelopeId,
    schemaVersion: 'passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-envelope-v0.50.0-alpha',
    harnessKind: 'deterministic_local_receiver_runtime_test_harness_simulator',
    localOnly: true,
    rehearsalOnly: true,
    parseMode: 'receiver_facing_blocks_as_test_input_only',
    receiverFacingBlockRefs: consumedContextBlocks.map((block)=>block.blockId),
    operatorApprovalScope: operatorApprovalRecord.operatorApprovalScope,
    effectDisposition: 'all_effects_blocked_no_runtime_authority',
    nextBarrier: NEXT_BARRIER,
    notRuntimeInstruction: true,
  };
  const shapeIssues=[];
  if(consumedContextBlocks.length !== 4) shapeIssues.push('rehearsal.consumed_context_block_count_unexpected');
  if(receiverHarnessTrace.length !== consumedContextBlocks.length) shapeIssues.push('rehearsal.trace_count_does_not_match_blocks');
  for(const block of consumedContextBlocks){
    if(block.consumedAsLocalTestInput !== true || block.sourceBound !== true || block.rawPersisted !== false || block.agentConsumedOutput !== false || block.notRuntimeInstruction !== true) shapeIssues.push(`${block.sourceBlockId}.local_consumption_boundary_invalid`);
  }
  if(operatorApprovalRecord.operatorApprovalScope !== 'local_test_harness_rehearsal_only' || operatorApprovalRecord.notRuntimeApproval !== true || operatorApprovalRecord.notAuthorizationDecision !== true || operatorApprovalRecord.notAllowBlockDecision !== true) shapeIssues.push('operatorApprovalRecord.scope_or_boundary_invalid');
  const allIssues=[...new Set([...inputIssues,...shapeIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(compat_sentinel|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest|promote|tool|network|config|memory|agent|approval|authorization|enforcement)/i.test(i)).length;
  const metrics = makeMetrics(input?.sourceArtifact, consumedContextBlocks, consumptionDecisions, receiverHarnessTrace, blockedEffects, boundaryViolationCount);
  const artifact = {
    artifact: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_ARTIFACT,
    schemaVersion: 'passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-v0.50.0-alpha',
    releaseLayer: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_VERSION,
    protocol: passiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalProtocol(),
    rehearsalStatus: allIssues.length === 0 ? 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_COMPLETE' : 'DEGRADED_PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    rehearsalOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    preReadPathPinned: true,
    acceptsOnlyPinnedCompletedRuntimeContextInjectionRehearsal: true,
    sourceArtifactPath: input?.sourceArtifactPath,
    sourceArtifactSha256: input?.sourceArtifactSha256,
    sourceReportPath: input?.sourceReportPath,
    sourceReportSha256: input?.sourceReportSha256,
    redactedBeforePersist: true,
    rawSourceCache: 'excluded',
    rawPersisted: false,
    receiverRuntimeTestHarnessConsumptionRehearsal: true,
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
    operatorApprovalRecord,
    policyDecision: null,
    validationIssues: allIssues,
    metrics,
    harnessInputEnvelope,
    receiverHarnessTrace,
    consumedContextBlocks,
    consumptionDecisions,
    blockedEffects,
  };
  artifact.reportMarkdown = passiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalReport(artifact);
  return artifact;
}
export function validatePassiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  issues.push(...unknownKeys(a, ARTIFACT_ALLOWED_KEYS, 'artifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, PROTOCOL_ALLOWED_KEYS, 'artifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, METRICS_ALLOWED_KEYS, 'artifact.metrics'));
  if(obj(a.operatorApprovalRecord)) issues.push(...unknownKeys(a.operatorApprovalRecord, OPERATOR_RECORD_ALLOWED_KEYS, 'artifact.operatorApprovalRecord'));
  if(obj(a.harnessInputEnvelope)) issues.push(...unknownKeys(a.harnessInputEnvelope, ENVELOPE_ALLOWED_KEYS, 'artifact.harnessInputEnvelope'));
  for(const [index,trace] of arr(a.receiverHarnessTrace).entries()) issues.push(...unknownKeys(trace, TRACE_ALLOWED_KEYS, `artifact.receiverHarnessTrace[${index}]`));
  for(const [index,block] of arr(a.consumedContextBlocks).entries()) issues.push(...unknownKeys(block, BLOCK_ALLOWED_KEYS, `artifact.consumedContextBlocks[${index}]`));
  for(const [index,decision] of arr(a.consumptionDecisions).entries()) issues.push(...unknownKeys(decision, DECISION_ALLOWED_KEYS, `artifact.consumptionDecisions[${index}]`));
  for(const [index,effect] of arr(a.blockedEffects).entries()) issues.push(...unknownKeys(effect, EFFECT_ALLOWED_KEYS, `artifact.blockedEffects[${index}]`));
  if(a.artifact !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_ARTIFACT) issues.push('artifact.artifact_id_unexpected');
  if(a.schemaVersion !== 'passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-v0.50.0-alpha') issues.push('artifact.schema_unexpected');
  if(a.releaseLayer !== PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_VERSION) issues.push('artifact.release_unexpected');
  if(a.rehearsalStatus !== 'PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_COMPLETE') issues.push('artifact.status_not_complete');
  assertBooleanFlags(a, TOP_LEVEL_TRUE_FLAGS, TOP_LEVEL_FALSE_FLAGS, 'artifact', issues);
  if(a.rawSourceCache !== 'excluded') issues.push('artifact.rawSourceCache_not_excluded');
  if(a.nextBarrier !== NEXT_BARRIER) issues.push('artifact.nextBarrier_unexpected');
  if(a.recommendation !== 'ADVANCE_TO_BOUNDED_RECEIVER_RUNTIME_TEST_HARNESS_OR_FIXTURE_SUITE') issues.push('artifact.recommendation_unexpected');
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('artifact.validationIssues_not_empty');
  if(obj(a.protocol)) {
    assertBooleanFlags(a.protocol, PROTOCOL_TRUE_FLAGS, PROTOCOL_FALSE_FLAGS, 'artifact.protocol', issues);
    if(a.protocol.releaseLayer !== 'v0.50.0-alpha') issues.push('artifact.protocol.releaseLayer_unexpected');
    if(a.protocol.barrierCrossed !== 'local_receiver_runtime_test_harness_consumption_rehearsal') issues.push('artifact.protocol.barrierCrossed_unexpected');
    if(a.protocol.buildsOn !== 'v0.49.5_passive_live_memory_coherence_runtime_context_injection_rehearsal') issues.push('artifact.protocol.buildsOn_unexpected');
    if(a.protocol.nextBarrier !== NEXT_BARRIER) issues.push('artifact.protocol.nextBarrier_unexpected');
    if(a.protocol.rawSourceCache !== 'excluded') issues.push('artifact.protocol.rawSourceCache_not_excluded');
  } else issues.push('artifact.protocol_missing');
  try { expectedPath(a.sourceArtifactPath); } catch { issues.push('artifact.source_artifact_path_not_pinned'); }
  try { expectedReportPath(a.sourceReportPath); } catch { issues.push('artifact.source_report_path_not_pinned'); }
  if(a.sourceArtifactSha256 !== EXPECTED_SOURCE_SHA256) issues.push('artifact.source_digest_unexpected');
  if(a.sourceReportSha256 !== EXPECTED_SOURCE_REPORT_SHA256) issues.push('artifact.source_report_digest_unexpected');
  if(a.policyDecision !== null) issues.push('artifact.top_level_compat_sentinel_non_null');
  if(obj(a.protocol) && own(a.protocol,'policyDecision')) issues.push('artifact.protocol_repeats_compat_sentinel');
  if(obj(a.metrics) && own(a.metrics,'policyDecision')) issues.push('artifact.metrics_repeats_compat_sentinel');
  const m = a.metrics ?? {};
  if(m.sourceReceiverBlockCountConsumedAsLocalTestInput !== 4 || m.harnessParseSuccessCount !== 4 || m.consumedContextBlockCount !== 4 || m.consumptionDecisionCount !== 4) issues.push('artifact.local_consumption_shape_metrics_unexpected');
  if(m.effectsBlockedCount !== 10 || m.forbiddenEffectCount !== 0 || m.boundaryViolationCount !== 0) issues.push('artifact.effect_or_boundary_metrics_unexpected');
  if(m.sourceBoundConsumedBlockRatio !== 1 || m.agentConsumedOutputFalseRatio !== 1 || m.rawPersistedFalseRatio !== 1) issues.push('artifact.consumed_block_boundary_metrics_unexpected');
  if(a.operatorApprovalRecord?.operatorApprovalScope !== 'local_test_harness_rehearsal_only' || a.operatorApprovalRecord?.recordKind !== 'local_preflight_record' || a.operatorApprovalRecord?.notRuntimeApproval !== true || a.operatorApprovalRecord?.notAuthorizationDecision !== true || a.operatorApprovalRecord?.notAllowBlockDecision !== true) issues.push('artifact.operator_preflight_record_boundary_unexpected');
  assertBooleanFlags(a.operatorApprovalRecord, OPERATOR_RECORD_TRUE_FLAGS, [], 'artifact.operatorApprovalRecord', issues);
  const envelope = a.harnessInputEnvelope ?? {};
  if(envelope.envelopeId !== 'local-receiver-runtime-test-harness-input-envelope-v0.50.5-001') issues.push('artifact.harnessInputEnvelope.envelopeId_unexpected');
  if(envelope.schemaVersion !== 'passive-live-memory-coherence-receiver-runtime-test-harness-consumption-rehearsal-envelope-v0.50.0-alpha') issues.push('artifact.harnessInputEnvelope.schemaVersion_unexpected');
  if(envelope.harnessKind !== 'deterministic_local_receiver_runtime_test_harness_simulator') issues.push('artifact.harnessInputEnvelope.harnessKind_unexpected');
  if(envelope.localOnly !== true || envelope.rehearsalOnly !== true || envelope.notRuntimeInstruction !== true) issues.push('artifact.harnessInputEnvelope.boundary_flags_unexpected');
  if(envelope.parseMode !== 'receiver_facing_blocks_as_test_input_only') issues.push('artifact.harnessInputEnvelope.parseMode_unexpected');
  if(envelope.effectDisposition !== 'all_effects_blocked_no_runtime_authority') issues.push('artifact.harnessInputEnvelope.effectDisposition_unexpected');
  if(envelope.operatorApprovalScope !== 'local_test_harness_rehearsal_only') issues.push('artifact.harnessInputEnvelope.operatorApprovalScope_unexpected');
  if(envelope.nextBarrier !== NEXT_BARRIER) issues.push('artifact.harnessInputEnvelope.nextBarrier_unexpected');
  if(arr(envelope.receiverFacingBlockRefs).length !== arr(a.consumedContextBlocks).length) issues.push('artifact.envelope_refs_do_not_match_consumed_blocks');
  const consumedBlocks = arr(a.consumedContextBlocks);
  const traces = arr(a.receiverHarnessTrace);
  const decisions = arr(a.consumptionDecisions);
  const effects = arr(a.blockedEffects);
  if(consumedBlocks.length !== 4) issues.push('artifact.consumedContextBlocks_count_unexpected');
  if(traces.length !== consumedBlocks.length) issues.push('artifact.receiverHarnessTrace_count_unexpected');
  if(decisions.length !== consumedBlocks.length) issues.push('artifact.consumptionDecisions_count_unexpected');
  if(effects.length !== EXPECTED_BLOCKED_EFFECT_KINDS.length) issues.push('artifact.blockedEffects_count_unexpected');
  consumedBlocks.forEach((block,index)=>{
    if(block.receiverFacingKind !== 'local_receiver_runtime_test_harness_input_block') issues.push(`artifact.consumedContextBlocks[${index}].receiverFacingKind_unexpected`);
    if(block.consumedAsLocalTestInput !== true || block.sourceBound !== true || block.rawPersisted !== false || block.agentConsumedOutput !== false || block.notRuntimeInstruction !== true) issues.push(`artifact.consumedContextBlocks[${index}].boundary_flags_unexpected`);
  });
  traces.forEach((trace,index)=>{
    if(trace.operation !== 'parse_receiver_facing_block_as_local_test_input') issues.push(`artifact.receiverHarnessTrace[${index}].operation_unexpected`);
    if(trace.result !== 'parsed_and_consumed_by_deterministic_local_test_harness_simulator') issues.push(`artifact.receiverHarnessTrace[${index}].result_unexpected`);
    if(trace.sourceBound !== true || trace.effectBlocked !== true || trace.notRuntimeInstruction !== true) issues.push(`artifact.receiverHarnessTrace[${index}].boundary_flags_unexpected`);
  });
  decisions.forEach((decision,index)=>{
    if(decision.decisionKind !== 'local_test_input_consumed_no_runtime_authority') issues.push(`artifact.consumptionDecisions[${index}].decisionKind_unexpected`);
    if(decision.nonAuthoritative !== true || decision.effect !== 'no_effect' || decision.notRuntimeInstruction !== true) issues.push(`artifact.consumptionDecisions[${index}].boundary_flags_unexpected`);
  });
  effects.forEach((effect,index)=>{
    if(effect.effectKind !== EXPECTED_BLOCKED_EFFECT_KINDS[index]) issues.push(`artifact.blockedEffects[${index}].effectKind_unexpected`);
    if(effect.status !== 'blocked_until_next_barrier') issues.push(`artifact.blockedEffects[${index}].status_unexpected`);
    if(effect.nextBarrier !== NEXT_BARRIER) issues.push(`artifact.blockedEffects[${index}].nextBarrier_unexpected`);
  });
  if(a.reportMarkdown !== passiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalReport(a)) issues.push('artifact.reportMarkdown_not_canonical');
  issues.push(...boundaryIssues(a,'artifact'));
  return [...new Set(issues)];
}
export function passiveLiveMemoryCoherenceReceiverRuntimeTestHarnessConsumptionRehearsalReport(a){
  return [
    '# Passive Live Memory Coherence Receiver Runtime Test Harness Consumption Rehearsal v0.50.5',
    '',
    `rehearsalStatus: ${a.rehearsalStatus}`,
    `sourceReceiverBlockCountConsumedAsLocalTestInput=${a.metrics.sourceReceiverBlockCountConsumedAsLocalTestInput}`,
    `harnessParseSuccessCount=${a.metrics.harnessParseSuccessCount}`,
    `consumedContextBlockCount=${a.metrics.consumedContextBlockCount}`,
    `consumptionDecisionCount=${a.metrics.consumptionDecisionCount}`,
    `effectsBlockedCount=${a.metrics.effectsBlockedCount}`,
    `sourceBoundConsumedBlockRatio=${a.metrics.sourceBoundConsumedBlockRatio}`,
    `agentConsumedOutputFalseRatio=${a.metrics.agentConsumedOutputFalseRatio}`,
    `forbiddenEffectCount=${a.metrics.forbiddenEffectCount}`,
    `boundaryViolationCount=${a.metrics.boundaryViolationCount}`,
    `operatorApprovalScope: ${a.operatorApprovalRecord.operatorApprovalScope}`,
    `nextBarrier: ${a.nextBarrier}`,
    `recommendation: ${a.recommendation}`,
    'recommendationIsAuthority=false',
    'agentConsumedOutput=false',
    'notRuntimeInstruction=true',
    '',
    'Rehearsal claim: v0.50 consumes the pinned v0.49.5 receiver-facing blocks as deterministic local receiver/runtime test harness input only. It parses the local envelope and records non-authoritative consumption decisions while blocking production runtime integration, network, tools, memory/config writes, external effects, authorization/enforcement, and automatic agent consumption.',
    '',
    '## Harness input envelope',
    `- ${a.harnessInputEnvelope.envelopeId}: blocks=${a.harnessInputEnvelope.receiverFacingBlockRefs.length}; parseMode=${a.harnessInputEnvelope.parseMode}; disposition=${a.harnessInputEnvelope.effectDisposition}`,
    '',
    '## Consumed context blocks',
    ...a.consumedContextBlocks.map((o)=>`- ${o.blockId}: sourceBlock=${o.sourceBlockId}; source=${o.sourcePath}; sourceBound=${o.sourceBound}; consumedAsLocalTestInput=${o.consumedAsLocalTestInput}; contentDigest=${o.contentDigest}`),
    '',
    '## Blocked effects',
    ...a.blockedEffects.map((o)=>`- ${o.effectKind}: ${o.status}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
