import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveObservationWindowScripts = Object.freeze([
  'test:passive-observation-window-protocol',
  'test:passive-observation-window-redacted-evidence',
  'test:passive-observation-window-chain',
  'test:passive-observation-window-negative-controls',
  'test:passive-observation-window-output-boundary',
  'test:passive-observation-window-reviewer-package'
]);

export const passiveObservationWindowRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-observation-window.mjs',
  'docs/passive-observation-window-protocol-v0.26.0-alpha.md',
  'docs/passive-observation-window-redacted-evidence-v0.26.1.md',
  'docs/passive-observation-window-chain-v0.26.2.md',
  'docs/passive-observation-window-negative-controls-v0.26.3.md',
  'docs/passive-observation-window-output-boundary-v0.26.4.md',
  'docs/passive-observation-window-reviewer-package-v0.26.5.md',
  'docs/passive-observation-window-local-review-notes-v0.26.5.md',
  'docs/status-v0.26.0-alpha.md',
  'docs/status-v0.26.1.md',
  'docs/status-v0.26.2.md',
  'docs/status-v0.26.3.md',
  'docs/status-v0.26.4.md',
  'docs/status-v0.26.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-observation-window.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-observation-window.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-protocol-v0.26.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-redacted-evidence-v0.26.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-chain-v0.26.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-negative-controls-v0.26.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-output-boundary-v0.26.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-window-reviewer-package-v0.26.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-protocol-v0.26.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-redacted-evidence-v0.26.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-chain-v0.26.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-negative-controls-v0.26.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-output-boundary-v0.26.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-reviewer-package-v0.26.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-window-report-v0.26.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPassiveObservationWindowManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.26.5') return;
  all(manifest.reproducibility, ['v0.26.5','passive_observation_window','OBSERVATION_WINDOW_COMPLETE','stage_chain_6','VALUE_SCORECARD_COMPLETE','HOLD_FOR_MORE_EVIDENCE','policy_decision_null','redacted_evidence_packet','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_repo_local_sources_only','bounded_sources_3','bounded_items_3','local_manual_outcome_fixtures_only','redaction_before_persist','redacted_evidence_packet_only','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPassiveObservationWindowRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.26.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-observation-window-reviewer-package-v0.26.5.out.json'));
  assert(phase?.windowStatus === 'OBSERVATION_WINDOW_COMPLETE', 'v0.26.5 window status must complete');
  assert((phase?.stageSummaries ?? []).length === 6, 'v0.26.5 must include six stage summaries');
  assert(phase?.valueSignal?.scorecardStatus === 'VALUE_SCORECARD_COMPLETE', 'v0.26.5 value scorecard must complete');
  assert(phase?.valueSignal?.recommendation === 'HOLD_FOR_MORE_EVIDENCE', 'v0.26.5 recommendation must remain evidence-only hold');
  assert(phase?.valueSignal?.recommendationIsAuthority === false, 'v0.26.5 recommendation must not be authority');
  assert(phase?.policyDecision === null, 'v0.26.5 policyDecision must be null');
  assert(phase?.nonAuthoritative === true && phase?.humanReadableReportOnly === true, 'v0.26.5 boundary flags required');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-observation-window-negative-controls-v0.26.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 30, 'v0.26.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-observation-window-report-v0.26.5.out.md'), 'utf8');
  all(report, ['Passive Observation Window v0.26.5','OBSERVATION_WINDOW_COMPLETE','explicit_repo_local_multisource_read: COMPLETE','positive_pass_gate: PASS','operator_review_queue: READY_FOR_OPERATOR_REVIEW','manual_local_outcome_capture: OUTCOME_CAPTURE_COMPLETE','value_scorecard: VALUE_SCORECARD_COMPLETE','policyDecision: null'], 'passive observation window report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive observation window','windowStatus: OBSERVATION_WINDOW_COMPLETE','stage chain: 6','value scorecard: VALUE_SCORECARD_COMPLETE','recommendation: HOLD_FOR_MORE_EVIDENCE','policyDecision: null','redacted evidence packet','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive observation window','windowStatus: OBSERVATION_WINDOW_COMPLETE','stage chain: 6','value scorecard: VALUE_SCORECARD_COMPLETE','recommendation: HOLD_FOR_MORE_EVIDENCE','policyDecision: null','redacted evidence packet','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}

export const passiveObservationWindowSuite = Object.freeze({
  name: 'passive-observation-window',
  gatePhase: 'post-real-redacted',
  gateScripts: passiveObservationWindowScripts,
  requiredManifestPaths: passiveObservationWindowRequiredManifestPaths,
  assertManifestMetadata: assertPassiveObservationWindowManifestMetadata,
  assertRelease: assertPassiveObservationWindowRelease
});
