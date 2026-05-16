import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveHandoffReceiverShadowRubricScripts = Object.freeze([
  'test:passive-handoff-receiver-shadow-rubric-protocol',
  'test:passive-handoff-receiver-shadow-rubric-decisions',
  'test:passive-handoff-receiver-shadow-rubric-metrics',
  'test:passive-handoff-receiver-shadow-rubric-negative-controls',
  'test:passive-handoff-receiver-shadow-rubric-output-boundary',
  'test:passive-handoff-receiver-shadow-rubric-reviewer-package'
]);

export const passiveHandoffReceiverShadowRubricRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-handoff-receiver-shadow-rubric.mjs',
  'docs/passive-handoff-receiver-shadow-rubric-protocol-v0.30.0-alpha.md',
  'docs/passive-handoff-receiver-shadow-rubric-decisions-v0.30.1.md',
  'docs/passive-handoff-receiver-shadow-rubric-metrics-v0.30.2.md',
  'docs/passive-handoff-receiver-shadow-rubric-negative-controls-v0.30.3.md',
  'docs/passive-handoff-receiver-shadow-rubric-output-boundary-v0.30.4.md',
  'docs/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.md',
  'docs/passive-handoff-receiver-shadow-rubric-local-review-notes-v0.30.5.md',
  'docs/status-v0.30.0-alpha.md',
  'docs/status-v0.30.1.md',
  'docs/status-v0.30.2.md',
  'docs/status-v0.30.3.md',
  'docs/status-v0.30.4.md',
  'docs/status-v0.30.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-handoff-receiver-shadow-rubric.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-handoff-receiver-shadow-rubric.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-protocol-v0.30.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-decisions-v0.30.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-metrics-v0.30.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-negative-controls-v0.30.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-output-boundary-v0.30.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-protocol-v0.30.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-decisions-v0.30.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-metrics-v0.30.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-negative-controls-v0.30.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-output-boundary-v0.30.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-handoff-receiver-shadow-rubric-report-v0.30.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPassiveHandoffReceiverShadowRubricManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.30.5') return;
  all(manifest.reproducibility, ['v0.30.5','passive_handoff_receiver_shadow_rubric','PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE','receiverItemCount_4','includeForHumanContextCount_2','contradictionReviewCount_1','staleCautionReviewCount_1','excludedUpstreamNoiseCount_1','sourceBoundReceiverRatio_1','contradictionHandledRatio_1','staleHandledRatio_1','noPromotionWithoutHumanRatio_1','boundaryViolationCount_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','agent_consumed_output_false','not_runtime_instruction','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.30.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_pinned_completed_handoff_artifact_only','human_receiver_rubric_only','source_bound','contradiction_handled','stale_handled','no_memory_promotion_without_human','no_memory_writes','no_runtime_integration','agent_consumed_output_false','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPassiveHandoffReceiverShadowRubricRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.30.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.out.json'));
  assert(phase?.receiverStatus === 'PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE', 'v0.30.5 receiver rubric must complete');
  assert(phase?.metrics?.receiverItemCount === 4, 'v0.30.5 must include four receiver items');
  assert(phase?.metrics?.includeForHumanContextCount === 2, 'v0.30.5 must include two human-context items');
  assert(phase?.metrics?.contradictionReviewCount === 1, 'v0.30.5 must surface one contradiction review item');
  assert(phase?.metrics?.staleCautionReviewCount === 1, 'v0.30.5 must include one stale caution item');
  assert(phase?.metrics?.excludedUpstreamNoiseCount === 1, 'v0.30.5 must preserve upstream noise exclusion');
  assert(phase?.metrics?.sourceBoundReceiverRatio === 1, 'v0.30.5 source-bound receiver ratio must be pinned');
  assert(phase?.metrics?.contradictionHandledRatio === 1, 'v0.30.5 contradiction handled ratio must be pinned');
  assert(phase?.metrics?.staleHandledRatio === 1, 'v0.30.5 stale handled ratio must be pinned');
  assert(phase?.metrics?.noPromotionWithoutHumanRatio === 1, 'v0.30.5 must not promote memory without human review');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.30.5 boundary violations must be zero');
  assert(phase?.recommendation === 'ADVANCE_OBSERVATION_ONLY', 'v0.30.5 recommendation must remain observation-only');
  assert(phase?.recommendationIsAuthority === false, 'v0.30.5 recommendation must not be authority');
  assert(phase?.agentConsumedOutput === false, 'v0.30.5 must not be agent-consumed output');
  assert(phase?.notRuntimeInstruction === true, 'v0.30.5 must not be a runtime instruction');
  assert(phase?.policyDecision === null, 'v0.30.5 policyDecision must be null');
  assert((phase?.receiverItems ?? []).every((item) => item.promoteToMemory === false), 'v0.30.5 receiver items must not promote memory');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-handoff-receiver-shadow-rubric-negative-controls-v0.30.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 25, 'v0.30.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-handoff-receiver-shadow-rubric-report-v0.30.5.out.md'), 'utf8');
  all(report, ['Passive Handoff Receiver Shadow Rubric v0.30.5','PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE','receiverItemCount=4','includeForHumanContextCount=2','contradictionReviewCount=1','staleCautionReviewCount=1','excludedUpstreamNoiseCount=1','sourceBoundReceiverRatio=1','contradictionHandledRatio=1','staleHandledRatio=1','noPromotionWithoutHumanRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','agentConsumedOutput=false','notRuntimeInstruction=true','policyDecision: null'], 'receiver rubric report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive handoff receiver shadow rubric','receiverStatus: PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE','receiverItemCount: 4','includeForHumanContextCount: 2','contradictionReviewCount: 1','staleCautionReviewCount: 1','excludedUpstreamNoiseCount: 1','sourceBoundReceiverRatio: 1','contradictionHandledRatio: 1','staleHandledRatio: 1','noPromotionWithoutHumanRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive handoff receiver shadow rubric','receiverStatus: PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE','receiverItemCount: 4','includeForHumanContextCount: 2','contradictionReviewCount: 1','staleCautionReviewCount: 1','excludedUpstreamNoiseCount: 1','sourceBoundReceiverRatio: 1','contradictionHandledRatio: 1','staleHandledRatio: 1','noPromotionWithoutHumanRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','agentConsumedOutput: false','notRuntimeInstruction: true','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}

export const passiveHandoffReceiverShadowRubricSuite = Object.freeze({
  name: 'passive-handoff-receiver-shadow-rubric',
  gatePhase: 'post-real-redacted',
  gateScripts: passiveHandoffReceiverShadowRubricScripts,
  requiredManifestPaths: passiveHandoffReceiverShadowRubricRequiredManifestPaths,
  assertManifestMetadata: assertPassiveHandoffReceiverShadowRubricManifestMetadata,
  assertRelease: assertPassiveHandoffReceiverShadowRubricRelease
});
