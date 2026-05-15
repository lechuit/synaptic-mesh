import { readFileSync } from 'node:fs';
import path from 'node:path';

export const controlledOperatorReviewQueueScripts = Object.freeze([
  'test:controlled-operator-review-queue-protocol',
  'test:controlled-operator-review-queue-items',
  'test:controlled-operator-review-queue-abstain',
  'test:controlled-operator-review-queue-negative-controls',
  'test:controlled-operator-review-queue-output-boundary',
  'test:controlled-operator-review-queue-reviewer-package'
]);

export const controlledOperatorReviewQueueRequiredManifestPaths = Object.freeze([
  'tools/release-checks/controlled-operator-review-queue.mjs',
  'docs/controlled-operator-review-queue-protocol-v0.23.0-alpha.md',
  'docs/controlled-operator-review-queue-items-v0.23.1.md',
  'docs/controlled-operator-review-queue-abstain-v0.23.2.md',
  'docs/controlled-operator-review-queue-negative-controls-v0.23.3.md',
  'docs/controlled-operator-review-queue-output-boundary-v0.23.4.md',
  'docs/controlled-operator-review-queue-reviewer-package-v0.23.5.md',
  'docs/controlled-operator-review-queue-local-review-notes-v0.23.5.md',
  'docs/status-v0.23.0-alpha.md',
  'docs/status-v0.23.1.md',
  'docs/status-v0.23.2.md',
  'docs/status-v0.23.3.md',
  'docs/status-v0.23.4.md',
  'docs/status-v0.23.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/controlled-operator-review-queue.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/controlled-operator-review-queue.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-protocol-v0.23.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-items-v0.23.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-abstain-v0.23.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-negative-controls-v0.23.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-output-boundary-v0.23.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/controlled-operator-review-queue-reviewer-package-v0.23.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-protocol-v0.23.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-items-v0.23.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-abstain-v0.23.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-negative-controls-v0.23.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-output-boundary-v0.23.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-reviewer-package-v0.23.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/controlled-operator-review-queue-report-v0.23.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertControlledOperatorReviewQueueManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.23.5') return;
  all(manifest.reproducibility, ['v0.23.5','controlled_operator_review_queue','queueItems_3','queueStatus_READY_FOR_OPERATOR_REVIEW','reviewBurden_low','falsePasses_0','authorityViolations_0','policy_decision_null','authorization_false','enforcement_false','tool_execution_false','agent_consumed_output_false','external_effects_false','raw_persisted_false','raw_output_false'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','one_shot_only','redacted_evidence_only','non_authoritative','human_readable_only','not_decision_queue','not_approval_queue','no_authorization','no_enforcement','no_tool_execution','no_agent_consumed_machine_readable_policy_decisions','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertControlledOperatorReviewQueueRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.23.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/controlled-operator-review-queue-reviewer-package-v0.23.5.out.json'));
  assert(phase?.queueStatus === 'READY_FOR_OPERATOR_REVIEW', 'v0.23.5 queue status must be ready for operator review');
  assert(phase?.queueItems?.length === 3, 'v0.23.5 must include exactly 3 queue items');
  assert(phase?.notDecisionApprovalQueue === true, 'v0.23.5 must not be a decision/approval queue');
  assert(phase?.humanReadableOnly === true, 'v0.23.5 must remain human-readable only');
  assert(phase?.nonAuthoritative === true, 'v0.23.5 must remain non-authoritative');
  assert(phase?.policyDecision === null, 'v0.23.5 policyDecision must be null');
  for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert(phase?.[key] === false, 'v0.23.5 ' + key + ' must be false');
  assert(phase?.reviewBurden?.qualitative === 'low', 'v0.23.5 review burden must be low');
  const negative = readJson(path.join(packageRoot, 'evidence/controlled-operator-review-queue-negative-controls-v0.23.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 23, 'v0.23.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/controlled-operator-review-queue-report-v0.23.5.out.md'), 'utf8');
  all(report, ['Controlled Operator Review Queue v0.23.5','READY_FOR_OPERATOR_REVIEW','not a decision queue','not authority','Review burden: low (3 item(s), ~21 minutes)','policyDecision: null'], 'controlled queue report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['controlled operator review queue','queueStatus: READY_FOR_OPERATOR_REVIEW','queueItems: 3','reviewBurden: low','not a decision queue','not an approval queue','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'controlled operator review queue','queueStatus: READY_FOR_OPERATOR_REVIEW','queueItems: 3','reviewBurden: low','not a decision queue','not an approval queue','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'RELEASE_NOTES.md', assertIncludes);
}

export const controlledOperatorReviewQueueSuite = Object.freeze({
  name: 'controlled-operator-review-queue',
  gatePhase: 'post-real-redacted',
  gateScripts: controlledOperatorReviewQueueScripts,
  requiredManifestPaths: controlledOperatorReviewQueueRequiredManifestPaths,
  assertManifestMetadata: assertControlledOperatorReviewQueueManifestMetadata,
  assertRelease: assertControlledOperatorReviewQueueRelease
});
