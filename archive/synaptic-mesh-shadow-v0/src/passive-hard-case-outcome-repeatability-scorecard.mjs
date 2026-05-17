import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_VERSION = 'v0.35.5';
export const PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_ARTIFACT = 'T-synaptic-mesh-passive-hard-case-outcome-repeatability-scorecard-v0.35.5';

const EXPECTED_OUTCOME_VALUE_ARTIFACT = 'T-synaptic-mesh-passive-hard-case-outcome-value-scorecard-v0.34.5';
const EXPECTED_SCHEMA = 'passive-hard-case-outcome-value-scorecard-v0.34.0-alpha';
const EXPECTED_RELEASE = 'v0.34.5';
const EXPECTED_OUTCOME_VALUE_ARTIFACT_PATHS = Object.freeze([
  'evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-hard-case-outcome-value-scorecard-reviewer-package-v0.34.5.out.json',
]);
const EXPECTED_OUTCOME_VALUE_ARTIFACT_SHA256 = 'cb6d4165d14b0747f1b739abf1c79be0b60d0f28eefdbcaf4436361f5fef92e2';
const EXPECTED_OUTCOME_VALUE_REPORT_MARKDOWN_SHA256 = '470ce1844e3b86ced192aa2a9996b5619392a048b230a8cf45a9514c72c42ecc';
const EXPECTED_HARD_CASE_IDS = Object.freeze([
  'hard-active-project-rule-vs-old-context',
  'hard-partial-contradiction-thread',
  'hard-source-bound-decision-carry-forward',
  'hard-stale-caution-not-instruction',
  'hard-tempting-noise-suppression',
]);
const EXPECTED_OUTCOME_VALUE_ITEMS = Object.freeze({
  'hard-active-project-rule-vs-old-context': Object.freeze({ receiverLabel: 'useful_for_human_continuity', outcomeValue: 'useful' }),
  'hard-partial-contradiction-thread': Object.freeze({ receiverLabel: 'needs_more_evidence', outcomeValue: 'evidence_gap' }),
  'hard-source-bound-decision-carry-forward': Object.freeze({ receiverLabel: 'useful_for_human_continuity', outcomeValue: 'useful' }),
  'hard-stale-caution-not-instruction': Object.freeze({ receiverLabel: 'useful_for_human_continuity', outcomeValue: 'useful' }),
  'hard-tempting-noise-suppression': Object.freeze({ receiverLabel: 'noise_for_human_context', outcomeValue: 'noise' }),
});
const EXPECTED_RUNS = Object.freeze({
  'repeat-baseline-v034-labels': 'baseline_replay',
  'repeat-paraphrased-rationales': 'rationale_paraphrase_same_labels',
  'repeat-order-invariant-human-context': 'order_invariant_replay',
});
const EXPECTED_METRICS = Object.freeze({
  outcomeCount: 5,
  usefulOutcomeCount: 3,
  noiseOutcomeCount: 1,
  evidenceGapOutcomeCount: 1,
  usefulOutcomeRatio: 0.6,
  noiseOutcomeRatio: 0.2,
  evidenceGapRatio: 0.2,
  sourceBoundOutcomeRatio: 1,
  humanReviewOnlyRatio: 1,
  minimalContextRatio: 1,
  noPromotionWithoutHumanRatio: 1,
  boundaryViolationCount: 0,
  policyDecision: null,
});
const EXPECTED_OUTCOME_VALUE_ARTIFACT_FIELDS = Object.freeze({
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedHardCaseArtifact: true,
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
  rawSourceCache: 'excluded',
  rawPersisted: false,
});
const EXPECTED_OUTCOME_VALUE_PROTOCOL_FIELDS = Object.freeze({
  releaseLayer: 'v0.34.0-alpha',
  barrierCrossed: 'passive_hard_case_receiver_outcome_value_measurement',
  buildsOn: 'v0.33.5_passive_context_assembly_hard_cases',
  disabledByDefault: true,
  operatorRunOneShotOnly: true,
  localOnly: true,
  passiveOnly: true,
  readOnly: true,
  explicitArtifactsOnly: true,
  acceptsOnlyPinnedCompletedHardCaseArtifact: true,
  producesHumanReceiverOutcomeValueScorecardOnly: true,
  measuresUsefulnessNoiseAndEvidenceGapsWithoutRuntimeConsumption: true,
  humanReadableReportOnly: true,
  nonAuthoritative: true,
  recommendationIsAuthority: false,
  agentConsumedOutput: false,
  notRuntimeInstruction: true,
  noRuntimeAuthority: true,
  noMemoryWrites: true,
  noRuntimeIntegration: true,
  policyDecision: null,
});
const OUTCOME_VALUE_ARTIFACT_ALLOWED_KEYS = Object.freeze(['artifact','schemaVersion','releaseLayer','protocol','outcomeValueStatus','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedHardCaseArtifact','humanReadableReportOnly','humanReviewOnly','nonAuthoritative','recommendation','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision','validationIssues','metrics','outcomeItems','rawSourceCache','rawPersisted','reportMarkdown']);
const OUTCOME_VALUE_PROTOCOL_ALLOWED_KEYS = Object.freeze(['releaseLayer','barrierCrossed','buildsOn','disabledByDefault','operatorRunOneShotOnly','localOnly','passiveOnly','readOnly','explicitArtifactsOnly','acceptsOnlyPinnedCompletedHardCaseArtifact','producesHumanReceiverOutcomeValueScorecardOnly','measuresUsefulnessNoiseAndEvidenceGapsWithoutRuntimeConsumption','humanReadableReportOnly','nonAuthoritative','recommendationIsAuthority','agentConsumedOutput','notRuntimeInstruction','noRuntimeAuthority','noMemoryWrites','noRuntimeIntegration','policyDecision']);
const OUTCOME_VALUE_METRICS_ALLOWED_KEYS = Object.freeze(['outcomeCount','usefulOutcomeCount','noiseOutcomeCount','evidenceGapOutcomeCount','usefulOutcomeRatio','noiseOutcomeRatio','evidenceGapRatio','sourceBoundOutcomeRatio','humanReviewOnlyRatio','minimalContextRatio','noPromotionWithoutHumanRatio','boundaryViolationCount','policyDecision']);
const OUTCOME_VALUE_ITEM_ALLOWED_KEYS = Object.freeze(['hardCaseId','receiverLabel','outcomeValue','receiverRationale','sourceBound','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const INPUT_ALLOWED_KEYS = Object.freeze(['outcomeValueArtifact','outcomeValueArtifactPath','outcomeValueArtifactSha256','repeatabilityRuns']);
const RUN_ALLOWED_KEYS = Object.freeze(['runId','runKind','receiverOutcomes','sourceBound','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const RUN_OUTCOME_ALLOWED_KEYS = Object.freeze(['hardCaseId','receiverLabel','receiverRationale','sourceBound','humanReviewOnly','minimalContextOnly','promoteToMemory','agentConsumedOutput','recommendationIsAuthority','policyDecision']);
const VALID_LABELS = Object.freeze(['useful_for_human_continuity','noise_for_human_context','needs_more_evidence']);
const AUTHORITY_TOKENS = Object.freeze(['approve','approval','allow','authorize','authorization','block','deny','permit','enforce','enforcement','execute','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','runtimeAuthority','runtimeIntegration','agentConsumedPolicyDecision','machineReadablePolicyDecision','rawOutput','rawPersisted','sourceText','mayAllow','mayBlock']);
const FORBIDDEN_FIELDS = Object.freeze(['authorization','enforcement','approval','allow','block','approve','toolExecution','networkFetch','resourceFetch','memoryWrite','memoryConfigWrite','configWrite','externalEffects','rawPersisted','rawOutput','sourceText','agentConsumedOutput','agentConsumedPolicyDecision','machineReadablePolicyDecision','runtimeAuthority','runtimeIntegration','autonomousRuntime','daemon','watch','mayAllow','mayBlock']);

function arr(v){ return Array.isArray(v) ? v : []; }
function obj(v){ return v && typeof v === 'object' && !Array.isArray(v); }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o ?? {}, k); }
function ratio(n,d){ return d ? Number((n/d).toFixed(4)) : 0; }
function esc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hit(text, token){ return new RegExp(`(^|[^A-Za-z0-9])${esc(token)}([^A-Za-z0-9]|$)`, 'i').test(String(text)); }
function redact(v){ return AUTHORITY_TOKENS.some((t)=>hit(v,t)) ? '[authority-token-redacted]' : String(v ?? ''); }
function normPath(p){ return String(p ?? '').replace(/\\/g,'/').replace(/^\.\//,''); }
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
function expectedOutcomeLabel(id){ return EXPECTED_OUTCOME_VALUE_ITEMS[id]?.receiverLabel; }
function labelToOutcomeValue(label){ return label === 'useful_for_human_continuity' ? 'useful' : label === 'noise_for_human_context' ? 'noise' : 'evidence_gap'; }

export function passiveHardCaseOutcomeRepeatabilityScorecardProtocol(){
  return {
    releaseLayer: 'v0.35.0-alpha',
    barrierCrossed: 'passive_hard_case_receiver_outcome_repeatability_measurement',
    buildsOn: 'v0.34.5_passive_hard_case_outcome_value_scorecard',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedOutcomeValueArtifact: true,
    producesHumanOutcomeRepeatabilityScorecardOnly: true,
    measuresStableUsefulnessNoiseEvidenceGapLabelsWithoutRuntimeConsumption: true,
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

export async function readPassiveHardCaseOutcomeRepeatabilityScorecardInput(path, repeatabilityRuns = canonicalRepeatabilityRuns()){
  const raw = await readFile(path, 'utf8');
  return { outcomeValueArtifact: JSON.parse(raw), outcomeValueArtifactPath: path, outcomeValueArtifactSha256: createHash('sha256').update(raw).digest('hex'), repeatabilityRuns };
}

function runOutcome(hardCaseId, receiverLabel, receiverRationale){
  return { hardCaseId, receiverLabel, receiverRationale, sourceBound: true, humanReviewOnly: true, minimalContextOnly: true, promoteToMemory: false, agentConsumedOutput: false, recommendationIsAuthority: false, policyDecision: null };
}
export function canonicalRepeatabilityRuns(){
  const baseline = [
    runOutcome('hard-active-project-rule-vs-old-context','useful_for_human_continuity','baseline replay keeps active rule useful for continuity'),
    runOutcome('hard-partial-contradiction-thread','needs_more_evidence','baseline replay keeps contradiction as evidence gap'),
    runOutcome('hard-source-bound-decision-carry-forward','useful_for_human_continuity','baseline replay keeps source-bound decision useful'),
    runOutcome('hard-stale-caution-not-instruction','useful_for_human_continuity','baseline replay keeps stale material caution-shaped'),
    runOutcome('hard-tempting-noise-suppression','noise_for_human_context','baseline replay keeps tempting context classified as noise'),
  ];
  const paraphrased = [
    runOutcome('hard-active-project-rule-vs-old-context','useful_for_human_continuity','paraphrased rationale still prefers the active project rule'),
    runOutcome('hard-partial-contradiction-thread','needs_more_evidence','paraphrased rationale still needs source followup'),
    runOutcome('hard-source-bound-decision-carry-forward','useful_for_human_continuity','paraphrased rationale still carries forward the sourced decision'),
    runOutcome('hard-stale-caution-not-instruction','useful_for_human_continuity','paraphrased rationale still treats stale material as a caution'),
    runOutcome('hard-tempting-noise-suppression','noise_for_human_context','paraphrased rationale still suppresses plausible but noisy context'),
  ];
  const orderInvariant = [paraphrased[4], paraphrased[2], paraphrased[0], paraphrased[3], paraphrased[1]].map((o)=>({ ...o, receiverRationale: `order-invariant replay: ${o.receiverRationale}` }));
  return [
    { runId: 'repeat-baseline-v034-labels', runKind: 'baseline_replay', receiverOutcomes: baseline, sourceBound: true, humanReviewOnly: true, minimalContextOnly: true, promoteToMemory: false, agentConsumedOutput: false, recommendationIsAuthority: false, policyDecision: null },
    { runId: 'repeat-paraphrased-rationales', runKind: 'rationale_paraphrase_same_labels', receiverOutcomes: paraphrased, sourceBound: true, humanReviewOnly: true, minimalContextOnly: true, promoteToMemory: false, agentConsumedOutput: false, recommendationIsAuthority: false, policyDecision: null },
    { runId: 'repeat-order-invariant-human-context', runKind: 'order_invariant_replay', receiverOutcomes: orderInvariant, sourceBound: true, humanReviewOnly: true, minimalContextOnly: true, promoteToMemory: false, agentConsumedOutput: false, recommendationIsAuthority: false, policyDecision: null },
  ];
}

function validateOutcomeValueArtifact(a){
  const issues=[];
  if(!obj(a)) return ['outcomeValueArtifact.explicit_object_required'];
  issues.push(...unknownKeys(a, OUTCOME_VALUE_ARTIFACT_ALLOWED_KEYS, 'outcomeValueArtifact'));
  if(obj(a.protocol)) issues.push(...unknownKeys(a.protocol, OUTCOME_VALUE_PROTOCOL_ALLOWED_KEYS, 'outcomeValueArtifact.protocol'));
  if(obj(a.metrics)) issues.push(...unknownKeys(a.metrics, OUTCOME_VALUE_METRICS_ALLOWED_KEYS, 'outcomeValueArtifact.metrics'));
  if(a.artifact !== EXPECTED_OUTCOME_VALUE_ARTIFACT) issues.push('outcomeValueArtifact.artifact_not_expected_v0.34_outcome_value');
  if(a.schemaVersion !== EXPECTED_SCHEMA) issues.push('outcomeValueArtifact.schema_not_expected');
  if(a.releaseLayer !== EXPECTED_RELEASE) issues.push('outcomeValueArtifact.release_layer_not_v0.34.5');
  if(a.outcomeValueStatus !== 'PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE') issues.push('outcomeValueArtifact.status_not_complete');
  if(typeof a.reportMarkdown !== 'string') issues.push('outcomeValueArtifact.reportMarkdown_not_string');
  else if(sha256Text(a.reportMarkdown) !== EXPECTED_OUTCOME_VALUE_REPORT_MARKDOWN_SHA256) issues.push('outcomeValueArtifact.reportMarkdown_digest_not_expected');
  issues.push(...expectedFieldIssues(a, EXPECTED_OUTCOME_VALUE_ARTIFACT_FIELDS, 'outcomeValueArtifact'));
  if(!obj(a.protocol)) issues.push('outcomeValueArtifact.protocol_not_object');
  else issues.push(...expectedFieldIssues(a.protocol, EXPECTED_OUTCOME_VALUE_PROTOCOL_FIELDS, 'outcomeValueArtifact.protocol'));
  if(Array.isArray(a.validationIssues) && a.validationIssues.length !== 0) issues.push('outcomeValueArtifact.prior_validation_issues_present');
  for(const [k,v] of Object.entries(EXPECTED_METRICS)) if(a.metrics?.[k] !== v) issues.push(`outcomeValueArtifact.metrics.${k}_not_expected`);
  const items = arr(a.outcomeItems);
  if(items.length !== EXPECTED_HARD_CASE_IDS.length) issues.push('outcomeValueArtifact.outcome_items_not_exact_expected_count');
  const ids = new Set(items.map((c)=>c?.hardCaseId));
  for(const id of EXPECTED_HARD_CASE_IDS) if(!ids.has(id)) issues.push(`outcomeValueArtifact.expected_hard_case_missing:${redact(id)}`);
  items.forEach((c, index)=>{
    if(obj(c)) issues.push(...unknownKeys(c, OUTCOME_VALUE_ITEM_ALLOWED_KEYS, `outcomeValueArtifact.outcomeItems[${index}]`));
    if(!EXPECTED_HARD_CASE_IDS.includes(c?.hardCaseId)) issues.push(`outcomeValueArtifact.unexpected_hard_case:${redact(c?.hardCaseId ?? 'missing')}`);
    const expected = EXPECTED_OUTCOME_VALUE_ITEMS[c?.hardCaseId];
    if(expected) for(const [field, expectedValue] of Object.entries(expected)) if(c?.[field] !== expectedValue) issues.push(`outcomeValueArtifact.${redact(c?.hardCaseId)}.${field}_not_expected`);
    if(c?.sourceBound !== true) issues.push(`outcomeValueArtifact.${redact(c?.hardCaseId)}.source_not_bound`);
    if(c?.humanReviewOnly !== true || c?.minimalContextOnly !== true || c?.promoteToMemory !== false || c?.agentConsumedOutput !== false || c?.recommendationIsAuthority !== false || c?.policyDecision !== null) issues.push(`outcomeValueArtifact.${redact(c?.hardCaseId)}.boundary_flags_invalid`);
  });
  return issues;
}

function validateRepeatabilityRuns(runs){
  const issues=[];
  if(!Array.isArray(runs)) return ['repeatabilityRuns.array_required'];
  if(runs.length !== Object.keys(EXPECTED_RUNS).length) issues.push('repeatabilityRuns.not_exact_expected_count');
  const seenRuns = new Set();
  runs.forEach((run, runIndex)=>{
    if(!obj(run)){ issues.push(`repeatabilityRuns[${runIndex}].object_required`); return; }
    issues.push(...unknownKeys(run, RUN_ALLOWED_KEYS, `repeatabilityRuns[${runIndex}]`));
    if(!own(EXPECTED_RUNS, run.runId)) issues.push(`repeatabilityRuns[${runIndex}].run_id_not_expected:${redact(run.runId)}`);
    if(seenRuns.has(run.runId)) issues.push(`repeatabilityRuns[${runIndex}].duplicate_run_id:${redact(run.runId)}`);
    seenRuns.add(run.runId);
    if(EXPECTED_RUNS[run.runId] !== run.runKind) issues.push(`repeatabilityRuns[${runIndex}].run_kind_not_expected`);
    if(run.sourceBound !== true || run.humanReviewOnly !== true || run.minimalContextOnly !== true || run.promoteToMemory !== false || run.agentConsumedOutput !== false || run.recommendationIsAuthority !== false || run.policyDecision !== null) issues.push(`repeatabilityRuns[${runIndex}].boundary_flags_invalid`);
    const outcomes = arr(run.receiverOutcomes);
    if(outcomes.length !== EXPECTED_HARD_CASE_IDS.length) issues.push(`repeatabilityRuns[${runIndex}].receiver_outcomes_not_exact_expected_count`);
    const seenItems = new Set();
    outcomes.forEach((o, outcomeIndex)=>{
      if(!obj(o)){ issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].object_required`); return; }
      issues.push(...unknownKeys(o, RUN_OUTCOME_ALLOWED_KEYS, `repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}]`));
      if(!EXPECTED_HARD_CASE_IDS.includes(o.hardCaseId)) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].hard_case_id_not_expected:${redact(o.hardCaseId)}`);
      if(seenItems.has(o.hardCaseId)) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].duplicate_hard_case_id:${redact(o.hardCaseId)}`);
      seenItems.add(o.hardCaseId);
      if(!VALID_LABELS.includes(o.receiverLabel)) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].receiver_label_not_expected`);
      if(EXPECTED_OUTCOME_VALUE_ITEMS[o.hardCaseId] && o.receiverLabel !== expectedOutcomeLabel(o.hardCaseId)) issues.push(`repeatabilityRuns[${runIndex}].${redact(o.hardCaseId)}.label_drift_from_v0.34`);
      if(typeof o.receiverRationale !== 'string' || o.receiverRationale.length < 6) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].receiver_rationale_required`);
      if(o.sourceBound !== true) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].source_not_bound`);
      if(o.humanReviewOnly !== true || o.minimalContextOnly !== true || o.promoteToMemory !== false || o.agentConsumedOutput !== false || o.recommendationIsAuthority !== false || o.policyDecision !== null) issues.push(`repeatabilityRuns[${runIndex}].receiverOutcomes[${outcomeIndex}].boundary_flags_invalid`);
    });
    for(const id of EXPECTED_HARD_CASE_IDS) if(!seenItems.has(id)) issues.push(`repeatabilityRuns[${runIndex}].expected_hard_case_missing:${redact(id)}`);
  });
  for(const runId of Object.keys(EXPECTED_RUNS)) if(!seenRuns.has(runId)) issues.push(`repeatabilityRuns.expected_run_missing:${redact(runId)}`);
  return issues;
}

export function validatePassiveHardCaseOutcomeRepeatabilityScorecardInput(input={}){
  const issues=[];
  if(!obj(input)) return ['input.malformed_not_object'];
  issues.push(...unknownKeys(input, INPUT_ALLOWED_KEYS, 'input'));
  if(!EXPECTED_OUTCOME_VALUE_ARTIFACT_PATHS.includes(normPath(input.outcomeValueArtifactPath))) issues.push('input.outcome_value_artifact_path_not_pinned');
  if(input.outcomeValueArtifactSha256 !== EXPECTED_OUTCOME_VALUE_ARTIFACT_SHA256) issues.push('input.outcome_value_artifact_digest_not_pinned');
  issues.push(...validateOutcomeValueArtifact(input.outcomeValueArtifact));
  issues.push(...validateRepeatabilityRuns(input.repeatabilityRuns));
  if(input.externalEffects === true || input.toolExecution === true || input.networkFetch === true || input.resourceFetch === true) issues.push('input.external_or_tool_effect_requested');
  if(input.memoryWrite === true || input.memoryConfigWrite === true || input.configWrite === true) issues.push('input.memory_or_config_write_requested');
  if(input.runtimeIntegration === true || input.autonomousRuntime === true || input.daemon === true || input.watch === true) issues.push('input.runtime_or_daemon_requested');
  if(input.rawPersist === true || input.rawOutput === true) issues.push('input.raw_persistence_or_output_requested');
  issues.push(...boundaryIssues(input,'input'), ...tokenIssues(input,'input'));
  return [...new Set(issues)];
}

function summarizeRuns(runs){
  return arr(runs).map((run)=>({
    runId: redact(run?.runId),
    runKind: redact(run?.runKind),
    outcomeCount: arr(run?.receiverOutcomes).length,
    sourceBound: run?.sourceBound === true,
    humanReviewOnly: true,
    minimalContextOnly: true,
    promoteToMemory: false,
    agentConsumedOutput: false,
    recommendationIsAuthority: false,
    policyDecision: null,
  }));
}
function repeatabilityItems(runs){
  return EXPECTED_HARD_CASE_IDS.map((id)=>{
    const labelsByRun = arr(runs).map((run)=>{
      const item = arr(run?.receiverOutcomes).find((o)=>o?.hardCaseId === id);
      return { runId: redact(run?.runId), receiverLabel: item?.receiverLabel, outcomeValue: VALID_LABELS.includes(item?.receiverLabel) ? labelToOutcomeValue(item.receiverLabel) : 'invalid' };
    });
    const labels = labelsByRun.map((x)=>x.receiverLabel).filter(Boolean);
    const values = labelsByRun.map((x)=>x.outcomeValue).filter(Boolean);
    return {
      hardCaseId: id,
      expectedReceiverLabel: expectedOutcomeLabel(id),
      expectedOutcomeValue: EXPECTED_OUTCOME_VALUE_ITEMS[id].outcomeValue,
      stableReceiverLabel: labels.length === Object.keys(EXPECTED_RUNS).length && new Set(labels).size === 1,
      stableOutcomeValue: values.length === Object.keys(EXPECTED_RUNS).length && new Set(values).size === 1,
      agreesWithV034Outcome: labels.length === Object.keys(EXPECTED_RUNS).length && labels.every((label)=>label === expectedOutcomeLabel(id)),
      labelsByRun,
      humanReviewOnly: true,
      minimalContextOnly: true,
      promoteToMemory: false,
      agentConsumedOutput: false,
      recommendationIsAuthority: false,
      policyDecision: null,
    };
  });
}
function metrics(runs, items, boundaryViolationCount){
  const expectedRunCount = Object.keys(EXPECTED_RUNS).length;
  const judgements = arr(runs).flatMap((run)=>arr(run?.receiverOutcomes).map((outcome)=>({ run, outcome })));
  const stableHardCaseCount = items.filter((item)=>item.stableReceiverLabel && item.stableOutcomeValue && item.agreesWithV034Outcome).length;
  const stableUsefulHardCaseCount = items.filter((item)=>item.expectedOutcomeValue === 'useful' && item.stableReceiverLabel && item.agreesWithV034Outcome).length;
  const stableNoiseHardCaseCount = items.filter((item)=>item.expectedOutcomeValue === 'noise' && item.stableReceiverLabel && item.agreesWithV034Outcome).length;
  const stableEvidenceGapHardCaseCount = items.filter((item)=>item.expectedOutcomeValue === 'evidence_gap' && item.stableReceiverLabel && item.agreesWithV034Outcome).length;
  const labelAgreementJudgementCount = judgements.filter(({ outcome })=>outcome?.receiverLabel === expectedOutcomeLabel(outcome?.hardCaseId)).length;
  return {
    repeatabilityRunCount: arr(runs).length,
    expectedRepeatabilityRunCount: expectedRunCount,
    hardCaseCount: EXPECTED_HARD_CASE_IDS.length,
    totalOutcomeJudgementCount: judgements.length,
    expectedOutcomeJudgementCount: expectedRunCount * EXPECTED_HARD_CASE_IDS.length,
    stableHardCaseCount,
    unstableHardCaseCount: EXPECTED_HARD_CASE_IDS.length - stableHardCaseCount,
    stableUsefulHardCaseCount,
    stableNoiseHardCaseCount,
    stableEvidenceGapHardCaseCount,
    labelAgreementJudgementCount,
    labelAgreementRatio: ratio(labelAgreementJudgementCount, judgements.length),
    stableHardCaseRatio: ratio(stableHardCaseCount, EXPECTED_HARD_CASE_IDS.length),
    stableUsefulHardCaseRatio: ratio(stableUsefulHardCaseCount, 3),
    stableNoiseHardCaseRatio: ratio(stableNoiseHardCaseCount, 1),
    stableEvidenceGapHardCaseRatio: ratio(stableEvidenceGapHardCaseCount, 1),
    sourceBoundRepeatabilityRatio: ratio(judgements.filter(({ outcome })=>outcome?.sourceBound === true).length, judgements.length),
    humanReviewOnlyRepeatabilityRatio: ratio(judgements.filter(({ outcome })=>outcome?.humanReviewOnly === true).length, judgements.length),
    minimalContextRepeatabilityRatio: ratio(judgements.filter(({ outcome })=>outcome?.minimalContextOnly === true).length, judgements.length),
    noPromotionWithoutHumanRepeatabilityRatio: ratio(judgements.filter(({ outcome })=>outcome?.promoteToMemory === false).length, judgements.length),
    agentConsumedOutputFalseRatio: ratio(judgements.filter(({ outcome })=>outcome?.agentConsumedOutput === false).length, judgements.length),
    boundaryViolationCount,
    policyDecision: null,
  };
}
function recommendation(m, issues){
  return issues.length === 0 && m.repeatabilityRunCount === 3 && m.totalOutcomeJudgementCount === 15 && m.stableHardCaseCount === 5 && m.labelAgreementRatio === 1 && m.sourceBoundRepeatabilityRatio === 1 && m.humanReviewOnlyRepeatabilityRatio === 1 && m.noPromotionWithoutHumanRepeatabilityRatio === 1 && m.boundaryViolationCount === 0 ? 'ADVANCE_OBSERVATION_ONLY' : 'HOLD_FOR_MORE_EVIDENCE';
}

export function scorePassiveHardCaseOutcomeRepeatabilityScorecard(input={}){
  const inputIssues = validatePassiveHardCaseOutcomeRepeatabilityScorecardInput(input);
  const runs = summarizeRuns(input?.repeatabilityRuns);
  const items = repeatabilityItems(input?.repeatabilityRuns);
  const itemIssues=[];
  for(const item of items) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false) itemIssues.push(`${item.hardCaseId}.boundary_flags_invalid`);
  const allIssues=[...new Set([...inputIssues,...itemIssues])];
  const boundaryViolationCount = allIssues.filter((i)=>/(policyDecision|authority|boundary|raw|effect|write|runtime|daemon|watch|source|artifact|digest)/i.test(i)).length;
  const m=metrics(input?.repeatabilityRuns, items, boundaryViolationCount);
  const artifact={
    artifact: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_ARTIFACT,
    schemaVersion: 'passive-hard-case-outcome-repeatability-scorecard-v0.35.0-alpha',
    releaseLayer: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_VERSION,
    protocol: passiveHardCaseOutcomeRepeatabilityScorecardProtocol(),
    repeatabilityStatus: allIssues.length === 0 ? 'PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE' : 'DEGRADED_PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD',
    disabledByDefault: true,
    operatorRunOneShotOnly: true,
    localOnly: true,
    passiveOnly: true,
    readOnly: true,
    explicitArtifactsOnly: true,
    acceptsOnlyPinnedCompletedOutcomeValueArtifact: true,
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
    runSummaries: runs,
    repeatabilityItems: items,
    rawSourceCache: 'excluded',
    rawPersisted: false,
  };
  artifact.reportMarkdown = passiveHardCaseOutcomeRepeatabilityScorecardReport(artifact);
  return artifact;
}

export function validatePassiveHardCaseOutcomeRepeatabilityScorecardArtifact(a){
  const issues=[];
  if(!obj(a)) return ['artifact.malformed_not_object'];
  if(a.policyDecision !== null) issues.push('artifact.policyDecision_non_null');
  if(a.recommendationIsAuthority !== false || a.agentConsumedOutput !== false || a.notRuntimeInstruction !== true) issues.push('artifact.boundary_flags_invalid');
  for(const item of arr(a.repeatabilityItems)) if(item.policyDecision !== null || item.promoteToMemory !== false || item.agentConsumedOutput !== false || item.recommendationIsAuthority !== false) issues.push(`artifact.${redact(item.hardCaseId)}.boundary_flags_invalid`);
  issues.push(...boundaryIssues(a,'artifact'), ...tokenIssues(a,'artifact'));
  return [...new Set(issues)];
}

export function passiveHardCaseOutcomeRepeatabilityScorecardReport(a){
  return [
    '# Passive Hard-Case Outcome Repeatability Scorecard v0.35.5',
    '',
    `repeatabilityStatus: ${a.repeatabilityStatus}`,
    `repeatabilityRunCount=${a.metrics.repeatabilityRunCount}`,
    `hardCaseCount=${a.metrics.hardCaseCount}`,
    `totalOutcomeJudgementCount=${a.metrics.totalOutcomeJudgementCount}`,
    `stableHardCaseCount=${a.metrics.stableHardCaseCount}`,
    `unstableHardCaseCount=${a.metrics.unstableHardCaseCount}`,
    `stableUsefulHardCaseCount=${a.metrics.stableUsefulHardCaseCount}`,
    `stableNoiseHardCaseCount=${a.metrics.stableNoiseHardCaseCount}`,
    `stableEvidenceGapHardCaseCount=${a.metrics.stableEvidenceGapHardCaseCount}`,
    `labelAgreementJudgementCount=${a.metrics.labelAgreementJudgementCount}`,
    `labelAgreementRatio=${a.metrics.labelAgreementRatio}`,
    `stableHardCaseRatio=${a.metrics.stableHardCaseRatio}`,
    `sourceBoundRepeatabilityRatio=${a.metrics.sourceBoundRepeatabilityRatio}`,
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
    'Human-readable repeatability scorecard only. Repeated usefulness/noise/evidence-gap labels measure stability for human review; they are not policy decisions, not memory promotion, and not runtime instructions.',
    '',
    '## Repeatability items',
    ...a.repeatabilityItems.map((o)=>`- ${o.hardCaseId}: stable=${o.stableReceiverLabel}; agreesWithV034=${o.agreesWithV034Outcome}; expected=${o.expectedOutcomeValue}; promoteToMemory=${o.promoteToMemory}`),
    '',
    '## Validation issues',
    ...(a.validationIssues.length ? a.validationIssues.map((i)=>`- ${i}`) : ['- none']),
  ].join('\n');
}
