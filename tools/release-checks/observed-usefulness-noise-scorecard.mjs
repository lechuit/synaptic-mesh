import { readFileSync } from 'node:fs';
import path from 'node:path';

export const observedUsefulnessNoiseScorecardScripts = Object.freeze([
  'test:observed-usefulness-noise-scorecard-protocol',
  'test:observed-usefulness-noise-scorecard-mixed-cases',
  'test:observed-usefulness-noise-scorecard-source-failure',
  'test:observed-usefulness-noise-scorecard-negative-controls',
  'test:observed-usefulness-noise-scorecard-recommendation-boundary',
  'test:observed-usefulness-noise-scorecard-reviewer-package'
]);

export const observedUsefulnessNoiseScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/observed-usefulness-noise-scorecard.mjs',
  'docs/observed-usefulness-noise-scorecard-protocol-v0.22.0-alpha.md',
  'docs/observed-usefulness-noise-scorecard-mixed-cases-v0.22.1.md',
  'docs/observed-usefulness-noise-scorecard-source-failure-v0.22.2.md',
  'docs/observed-usefulness-noise-scorecard-negative-controls-v0.22.3.md',
  'docs/observed-usefulness-noise-scorecard-recommendation-boundary-v0.22.4.md',
  'docs/observed-usefulness-noise-scorecard-reviewer-package-v0.22.5.md',
  'docs/observed-usefulness-noise-scorecard-local-review-notes-v0.22.5.md',
  'docs/status-v0.22.0-alpha.md',
  'docs/status-v0.22.1.md',
  'docs/status-v0.22.2.md',
  'docs/status-v0.22.3.md',
  'docs/status-v0.22.4.md',
  'docs/status-v0.22.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/observed-usefulness-noise-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/observed-usefulness-noise-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-protocol-v0.22.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-mixed-cases-v0.22.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-source-failure-v0.22.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-negative-controls-v0.22.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-recommendation-boundary-v0.22.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/observed-usefulness-noise-scorecard-reviewer-package-v0.22.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-protocol-v0.22.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-mixed-cases-v0.22.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-source-failure-v0.22.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-negative-controls-v0.22.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-recommendation-boundary-v0.22.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-reviewer-package-v0.22.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/observed-usefulness-noise-scorecard-report-v0.22.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertObservedUsefulnessNoiseScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.22.5') return;
  all(manifest.reproducibility, ['v0.22.5','observed_usefulness_noise_scorecard','trueUsefulPasses_3','falsePasses_0','noiseRejected_6','falseValueWarnings_0','passPrecision_1','recommendation_advance','policy_decision_null','authorization_false','enforcement_false','tool_execution_false','agent_consumed_output_false','external_effects_false','raw_persisted_false'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','one_shot_only','non_authoritative','human_readable_only','scorecard_only','not_policy_allow_block_approve_gate','no_authorization','no_enforcement','no_tool_execution','no_agent_consumed_machine_readable_policy_decisions','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertObservedUsefulnessNoiseScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.22.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/observed-usefulness-noise-scorecard-reviewer-package-v0.22.5.out.json'));
  assert(phase?.humanReadableOnly === true, 'v0.22.5 must remain human-readable only');
  assert(phase?.scorecardOnly === true, 'v0.22.5 must remain scorecard only');
  assert(phase?.nonAuthoritative === true, 'v0.22.5 must remain non-authoritative');
  assert(phase?.policyDecision === null, 'v0.22.5 policyDecision must be null');
  for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert(phase?.[key] === false, 'v0.22.5 ' + key + ' must be false');
  assert(phase?.metrics?.trueUsefulPasses === 3, 'v0.22.5 trueUsefulPasses must be 3');
  assert(phase?.metrics?.falsePasses === 0, 'v0.22.5 falsePasses must be 0');
  assert(phase?.metrics?.noiseRejected === 6, 'v0.22.5 noiseRejected must be 6');
  assert(phase?.metrics?.falseValueWarnings === 0, 'v0.22.5 falseValueWarnings must be 0');
  assert(phase?.metrics?.passPrecision === 1, 'v0.22.5 passPrecision must be 1');
  assert(phase?.recommendation === 'advance', 'v0.22.5 recommendation must be advance');
  assert(phase?.recommendationIsAuthority === false, 'v0.22.5 recommendation must not be authority');
  const negative = readJson(path.join(packageRoot, 'evidence/observed-usefulness-noise-scorecard-negative-controls-v0.22.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length === 3, 'v0.22.3 must include malformed/forbidden negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/observed-usefulness-noise-scorecard-report-v0.22.5.out.md'), 'utf8');
  all(report, ['Observed Usefulness and Noise Scorecard v0.22.5','trueUsefulPasses: 3','falsePasses: 0','noiseRejected: 6','falseValueWarnings: 0','passPrecision: 1','human-readable signal only; not authority'], 'observed usefulness human report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['observed usefulness/noise scorecard','trueUsefulPasses','falsePasses','noiseRejected','falseValueWarnings','passPrecision','recommendation: advance','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'observed usefulness/noise scorecard','trueUsefulPasses: 3','falsePasses: 0','noiseRejected: 6','falseValueWarnings: 0','passPrecision: 1','recommendation: advance','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false','rawPersisted: false'], 'RELEASE_NOTES.md', assertIncludes);
}

export const observedUsefulnessNoiseScorecardSuite = Object.freeze({
  name: 'observed-usefulness-noise-scorecard',
  gatePhase: 'post-real-redacted',
  gateScripts: observedUsefulnessNoiseScorecardScripts,
  requiredManifestPaths: observedUsefulnessNoiseScorecardRequiredManifestPaths,
  assertManifestMetadata: assertObservedUsefulnessNoiseScorecardManifestMetadata,
  assertRelease: assertObservedUsefulnessNoiseScorecardRelease
});
