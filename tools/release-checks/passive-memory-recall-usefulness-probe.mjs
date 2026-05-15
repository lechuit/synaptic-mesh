import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveMemoryRecallUsefulnessProbeScripts = Object.freeze([
  'test:passive-memory-recall-usefulness-probe-protocol',
  'test:passive-memory-recall-usefulness-probe-cards-evidence',
  'test:passive-memory-recall-usefulness-probe-metrics',
  'test:passive-memory-recall-usefulness-probe-negative-controls',
  'test:passive-memory-recall-usefulness-probe-output-boundary',
  'test:passive-memory-recall-usefulness-probe-reviewer-package'
]);

export const passiveMemoryRecallUsefulnessProbeRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-memory-recall-usefulness-probe.mjs',
  'docs/passive-memory-recall-usefulness-probe-protocol-v0.28.0-alpha.md',
  'docs/passive-memory-recall-usefulness-probe-cards-evidence-v0.28.1.md',
  'docs/passive-memory-recall-usefulness-probe-metrics-v0.28.2.md',
  'docs/passive-memory-recall-usefulness-probe-negative-controls-v0.28.3.md',
  'docs/passive-memory-recall-usefulness-probe-output-boundary-v0.28.4.md',
  'docs/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.md',
  'docs/passive-memory-recall-usefulness-probe-local-review-notes-v0.28.5.md',
  'docs/status-v0.28.0-alpha.md',
  'docs/status-v0.28.1.md',
  'docs/status-v0.28.2.md',
  'docs/status-v0.28.3.md',
  'docs/status-v0.28.4.md',
  'docs/status-v0.28.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-memory-recall-usefulness-probe.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-memory-recall-usefulness-probe.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-memory-recall-need-cards-v0.28.1.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-memory-recall-evidence-v0.28.1.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-protocol-v0.28.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-cards-evidence-v0.28.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-metrics-v0.28.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-negative-controls-v0.28.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-output-boundary-v0.28.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-protocol-v0.28.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-cards-evidence-v0.28.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-metrics-v0.28.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-negative-controls-v0.28.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-output-boundary-v0.28.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-memory-recall-usefulness-probe-report-v0.28.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPassiveMemoryRecallUsefulnessProbeManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.28.5') return;
  all(manifest.reproducibility, ['v0.28.5','passive_memory_recall_usefulness_probe','MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE','cardCount_4','evidenceCount_5','usefulRecallRatio_0.75','contradictionSurfacingRatio_1','staleNegativeMarkedRatio_1','sourceBoundMatchRatio_1','irrelevantMatchRatio_0','ADVANCE_OBSERVATION_ONLY','recommendation_not_authority','policy_decision_null','non_authoritative','human_readable_report_only'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.28.5','disabled_by_default','operator_run_one_shot','local_only','passive_only','read_only','explicit_redacted_artifacts_only','source_bound_recall_cards','no_memory_writes','no_runtime_integration','non_authoritative','human_readable_report_only','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPassiveMemoryRecallUsefulnessProbeRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.28.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-memory-recall-usefulness-probe-reviewer-package-v0.28.5.out.json'));
  assert(phase?.probeStatus === 'MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE', 'v0.28.5 recall usefulness probe must complete');
  assert(phase?.metrics?.cardCount === 4, 'v0.28.5 must include four recall need cards');
  assert(phase?.metrics?.evidenceCount === 5, 'v0.28.5 must include five evidence items including noise');
  assert(phase?.metrics?.usefulRecallRatio === 0.75, 'v0.28.5 useful recall ratio must be pinned');
  assert(phase?.metrics?.contradictionSurfacingRatio === 1, 'v0.28.5 contradiction surfacing ratio must be pinned');
  assert(phase?.metrics?.staleNegativeMarkedRatio === 1, 'v0.28.5 stale/negative context ratio must be pinned');
  assert(phase?.metrics?.sourceBoundMatchRatio === 1, 'v0.28.5 source-bound match ratio must be pinned');
  assert(phase?.metrics?.irrelevantMatchRatio === 0, 'v0.28.5 irrelevant matched ratio must be zero');
  assert(phase?.metrics?.boundaryViolationCount === 0, 'v0.28.5 boundary violations must be zero');
  assert(phase?.recommendation === 'ADVANCE_OBSERVATION_ONLY', 'v0.28.5 recommendation must remain observation-only');
  assert(phase?.recommendationIsAuthority === false, 'v0.28.5 recommendation must not be authority');
  assert(phase?.policyDecision === null, 'v0.28.5 policyDecision must be null');
  const negative = readJson(path.join(packageRoot, 'evidence/passive-memory-recall-usefulness-probe-negative-controls-v0.28.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 20, 'v0.28.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-memory-recall-usefulness-probe-report-v0.28.5.out.md'), 'utf8');
  all(report, ['Passive Memory Recall Usefulness Probe v0.28.5','MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE','cardCount=4','evidenceCount=5','usefulRecallRatio=0.75','contradictionSurfacingRatio=1','staleNegativeMarkedRatio=1','sourceBoundMatchRatio=1','irrelevantMatchRatio=0','boundaryViolationCount=0','ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority=false','policyDecision: null'], 'recall usefulness report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive memory recall usefulness probe','probeStatus: MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE','cardCount: 4','evidenceCount: 5','usefulRecallRatio: 0.75','contradictionSurfacingRatio: 1','staleNegativeMarkedRatio: 1','sourceBoundMatchRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','policyDecision: null','human-readable report only'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'passive memory recall usefulness probe','probeStatus: MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE','cardCount: 4','evidenceCount: 5','usefulRecallRatio: 0.75','contradictionSurfacingRatio: 1','staleNegativeMarkedRatio: 1','sourceBoundMatchRatio: 1','recommendation: ADVANCE_OBSERVATION_ONLY','recommendationIsAuthority: false','policyDecision: null','human-readable report only'], 'RELEASE_NOTES.md', assertIncludes);
}

export const passiveMemoryRecallUsefulnessProbeSuite = Object.freeze({
  name: 'passive-memory-recall-usefulness-probe',
  gatePhase: 'post-real-redacted',
  gateScripts: passiveMemoryRecallUsefulnessProbeScripts,
  requiredManifestPaths: passiveMemoryRecallUsefulnessProbeRequiredManifestPaths,
  assertManifestMetadata: assertPassiveMemoryRecallUsefulnessProbeManifestMetadata,
  assertRelease: assertPassiveMemoryRecallUsefulnessProbeRelease
});
