import { readFileSync } from 'node:fs';
import path from 'node:path';

export const operatorReviewOutcomeCaptureScripts = Object.freeze([
  'test:operator-review-outcome-capture-protocol',
  'test:operator-review-outcome-capture-runner',
  'test:operator-review-outcome-capture-schema',
  'test:operator-review-outcome-capture-negative-controls',
  'test:operator-review-outcome-capture-output-boundary',
  'test:operator-review-outcome-capture-reviewer-package'
]);

export const operatorReviewOutcomeCaptureRequiredManifestPaths = Object.freeze([
  'tools/release-checks/operator-review-outcome-capture.mjs',
  'docs/operator-review-outcome-capture-protocol-v0.24.0-alpha.md',
  'docs/operator-review-outcome-capture-runner-v0.24.1.md',
  'docs/operator-review-outcome-capture-schema-v0.24.2.md',
  'docs/operator-review-outcome-capture-negative-controls-v0.24.3.md',
  'docs/operator-review-outcome-capture-output-boundary-v0.24.4.md',
  'docs/operator-review-outcome-capture-reviewer-package-v0.24.5.md',
  'docs/operator-review-outcome-capture-local-review-notes-v0.24.5.md',
  'docs/status-v0.24.0-alpha.md',
  'docs/status-v0.24.1.md',
  'docs/status-v0.24.2.md',
  'docs/status-v0.24.3.md',
  'docs/status-v0.24.4.md',
  'docs/status-v0.24.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/operator-review-outcome-capture.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/operator-review-outcome-capture.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-protocol-v0.24.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-runner-v0.24.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-schema-v0.24.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-negative-controls-v0.24.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-output-boundary-v0.24.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-review-outcome-capture-reviewer-package-v0.24.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-protocol-v0.24.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-runner-v0.24.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-schema-v0.24.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-negative-controls-v0.24.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-report-v0.24.4.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-reviewer-package-v0.24.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-review-outcome-capture-report-v0.24.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertOperatorReviewOutcomeCaptureManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.24.5') return;
  all(manifest.reproducibility, ['v0.24.5','operator_review_outcome_capture','capturedOutcomes_3','OUTCOME_CAPTURE_COMPLETE','redaction_before_persist_true','falseAuthorityLeakage_0','policy_decision_null','authorization_false','enforcement_false','tool_execution_false','external_effects_false','raw_persisted_false','raw_output_false'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','one_shot_only','bounded_items_3','redacted_evidence_only','redaction_before_persist','non_authoritative','human_readable_only','value_feedback_only','not_policy_artifact','no_tool_execution','no_agent_consumed_machine_readable_policy_decisions','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertOperatorReviewOutcomeCaptureRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.24.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/operator-review-outcome-capture-reviewer-package-v0.24.5.out.json'));
  assert(phase?.captureStatus === 'OUTCOME_CAPTURE_COMPLETE', 'v0.24.5 capture status must complete');
  assert(phase?.capturedOutcomes?.length === 3, 'v0.24.5 must capture exactly 3 operator outcomes');
  assert(phase?.valueFeedbackOnly === true, 'v0.24.5 must be value feedback only');
  assert(phase?.humanReadableOnly === true, 'v0.24.5 must remain human-readable only');
  assert(phase?.nonAuthoritative === true, 'v0.24.5 must remain non-authoritative');
  assert(phase?.policyDecision === null, 'v0.24.5 policyDecision must be null');
  for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert(phase?.[key] === false, 'v0.24.5 ' + key + ' must be false');
  assert((phase?.falseAuthorityLeakage ?? []).length === 0, 'v0.24.5 must have no false authority leakage');
  const negative = readJson(path.join(packageRoot, 'evidence/operator-review-outcome-capture-negative-controls-v0.24.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 29, 'v0.24.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/operator-review-outcome-capture-report-v0.24.5.out.md'), 'utf8');
  all(report, ['Operator Review Outcome Capture v0.24.5','OUTCOME_CAPTURE_COMPLETE','non-authoritative','human-readable report only','policyDecision: null','Redaction-before-persist: true'], 'operator outcome report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['operator review outcome capture','captureStatus: OUTCOME_CAPTURE_COMPLETE','capturedOutcomes: 3','redactionBeforePersist: true','valueFeedbackOnly: true','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'operator review outcome capture','captureStatus: OUTCOME_CAPTURE_COMPLETE','capturedOutcomes: 3','redactionBeforePersist: true','valueFeedbackOnly: true','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'RELEASE_NOTES.md', assertIncludes);
}

export const operatorReviewOutcomeCaptureSuite = Object.freeze({
  name: 'operator-review-outcome-capture',
  gatePhase: 'post-real-redacted',
  gateScripts: operatorReviewOutcomeCaptureScripts,
  requiredManifestPaths: operatorReviewOutcomeCaptureRequiredManifestPaths,
  assertManifestMetadata: assertOperatorReviewOutcomeCaptureManifestMetadata,
  assertRelease: assertOperatorReviewOutcomeCaptureRelease
});
