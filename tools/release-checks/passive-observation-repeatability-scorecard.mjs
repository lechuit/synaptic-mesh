import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveObservationRepeatabilityScorecardScripts = Object.freeze([
  'test:passive-observation-repeatability-scorecard-protocol',
  'test:passive-observation-repeatability-scorecard-windows',
  'test:passive-observation-repeatability-scorecard-metrics',
  'test:passive-observation-repeatability-scorecard-negative-controls',
  'test:passive-observation-repeatability-scorecard-output-boundary',
  'test:passive-observation-repeatability-scorecard-reviewer-package'
]);

export const passiveObservationRepeatabilityScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-observation-repeatability-scorecard.mjs',
  'docs/passive-observation-repeatability-scorecard-protocol-v0.27.0-alpha.md',
  'docs/passive-observation-repeatability-scorecard-windows-v0.27.1.md',
  'docs/passive-observation-repeatability-scorecard-metrics-v0.27.2.md',
  'docs/passive-observation-repeatability-scorecard-negative-controls-v0.27.3.md',
  'docs/passive-observation-repeatability-scorecard-output-boundary-v0.27.4.md',
  'docs/passive-observation-repeatability-scorecard-reviewer-package-v0.27.5.md',
  'docs/passive-observation-repeatability-scorecard-local-review-notes-v0.27.5.md',
  'docs/status-v0.27.0-alpha.md',
  'docs/status-v0.27.1.md',
  'docs/status-v0.27.2.md',
  'docs/status-v0.27.3.md',
  'docs/status-v0.27.4.md',
  'docs/status-v0.27.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-observation-repeatability-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-observation-repeatability-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-protocol-v0.27.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-windows-v0.27.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-metrics-v0.27.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-negative-controls-v0.27.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-output-boundary-v0.27.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-observation-repeatability-scorecard-reviewer-package-v0.27.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-protocol-v0.27.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-windows-v0.27.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-metrics-v0.27.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-negative-controls-v0.27.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-output-boundary-v0.27.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-reviewer-package-v0.27.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-observation-repeatability-scorecard-report-v0.27.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPassiveObservationRepeatabilityScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.27.5') return;
  all(manifest.reproducibility, ['v0.27.5','passive_observation_repeatability_scorecard','REPEATABILITY_SCORECARD_COMPLETE','completed_windows_3','degraded_windows_1','usefulOutcomeRatio_1','repeatabilityRatio_1','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_redacted_artifacts_only','bounded_windows_6','accepts_only_v0.26_redacted_window_artifacts','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPassiveObservationRepeatabilityScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.27.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-observation-repeatability-scorecard-reviewer-package-v0.27.5.out.json'));
  assert(phase?.scorecardStatus === 'REPEATABILITY_SCORECARD_COMPLETE', 'v0.27.5 repeatability scorecard must complete');
  assert(phase?.metrics?.completedWindows === 3, 'v0.27.5 must aggregate three completed windows');
  assert(phase?.metrics?.degradedWindows === 1, 'v0.27.5 must include one degraded/noise window');
  assert(phase?.metrics?.usefulOutcomeRatio === 1, 'v0.27.5 useful outcome ratio must be pinned');
  assert(phase?.metrics?.repeatabilityRatio === 1, 'v0.27.5 repeatability ratio must be pinned');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.27.5 boundary violations must be zero');
  assert(phase?.recommendation === 'ADVANCE_OBSERVATION_ONLY', 'v0.27.5 recommendation must remain observation-only');
  assert(phase?.recommendationIsAuthority === false, 'v0.27.5 recommendation must not be authority');
  assert(phase?.policyDecision === null, 'v0.27.5 policyDecision must be null');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-observation-repeatability-scorecard-negative-controls-v0.27.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 15, 'v0.27.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-observation-repeatability-scorecard-report-v0.27.5.out.md'), 'utf8');
  all(report, ['Passive Observation Repeatability Scorecard v0.27.5','REPEATABILITY_SCORECARD_COMPLETE','completedWindows=3','degradedWindows=1','usefulOutcomeRatio=1','repeatabilityRatio=1','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','policyDecision: null'], 'repeatability scorecard report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive observation repeatability scorecard','scorecardStatus: REPEATABILITY_SCORECARD_COMPLETE','completed windows: 3','degraded windows: 1','usefulOutcomeRatio: 1','repeatabilityRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive observation repeatability scorecard','scorecardStatus: REPEATABILITY_SCORECARD_COMPLETE','completed windows: 3','degraded windows: 1','usefulOutcomeRatio: 1','repeatabilityRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}

export const passiveObservationRepeatabilityScorecardSuite = Object.freeze({
  name: 'passive-observation-repeatability-scorecard',
  gatePhase: 'post-real-redacted',
  gateScripts: passiveObservationRepeatabilityScorecardScripts,
  requiredManifestPaths: passiveObservationRepeatabilityScorecardRequiredManifestPaths,
  assertManifestMetadata: assertPassiveObservationRepeatabilityScorecardManifestMetadata,
  assertRelease: assertPassiveObservationRepeatabilityScorecardRelease
});
