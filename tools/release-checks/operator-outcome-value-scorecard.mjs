import { readFileSync } from 'node:fs';
import path from 'node:path';

export const operatorOutcomeValueScorecardScripts = Object.freeze([
  'test:operator-outcome-value-scorecard-protocol',
  'test:operator-outcome-value-scorecard-metrics',
  'test:operator-outcome-value-scorecard-recommendations',
  'test:operator-outcome-value-scorecard-negative-controls',
  'test:operator-outcome-value-scorecard-output-boundary',
  'test:operator-outcome-value-scorecard-reviewer-package'
]);

export const operatorOutcomeValueScorecardRequiredManifestPaths = Object.freeze([
  'tools/release-checks/operator-outcome-value-scorecard.mjs',
  'docs/operator-outcome-value-scorecard-protocol-v0.25.0-alpha.md',
  'docs/operator-outcome-value-scorecard-metrics-v0.25.1.md',
  'docs/operator-outcome-value-scorecard-recommendations-v0.25.2.md',
  'docs/operator-outcome-value-scorecard-negative-controls-v0.25.3.md',
  'docs/operator-outcome-value-scorecard-output-boundary-v0.25.4.md',
  'docs/operator-outcome-value-scorecard-reviewer-package-v0.25.5.md',
  'docs/operator-outcome-value-scorecard-local-review-notes-v0.25.5.md',
  'docs/status-v0.25.0-alpha.md',
  'docs/status-v0.25.1.md',
  'docs/status-v0.25.2.md',
  'docs/status-v0.25.3.md',
  'docs/status-v0.25.4.md',
  'docs/status-v0.25.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/operator-outcome-value-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/operator-outcome-value-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-fixtures.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-protocol-v0.25.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-metrics-v0.25.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-recommendations-v0.25.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-negative-controls-v0.25.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-output-boundary-v0.25.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/operator-outcome-value-scorecard-reviewer-package-v0.25.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-protocol-v0.25.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-metrics-v0.25.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-recommendations-v0.25.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-negative-controls-v0.25.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-output-boundary-v0.25.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-reviewer-package-v0.25.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/operator-outcome-value-scorecard-report-v0.25.5.out.md'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertOperatorOutcomeValueScorecardManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.25.5') return;
  all(manifest.reproducibility, ['v0.25.5','operator_outcome_value_scorecard','VALUE_SCORECARD_COMPLETE','usefulOutcomes_2','noiseOutcomes_1','reviewedItemCount_3','usefulRatio_0.6667','noiseRatio_0.3333','ADVANCE_OBSERVATION_ONLY','policy_decision_null','authorization_false','enforcement_false','tool_execution_false','external_effects_false','raw_persisted_false','raw_output_false'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','one_shot_only','bounded_items_3','redacted_evidence_only','non_authoritative','human_readable_only','value_scorecard_only','not_policy_artifact','no_authorization','no_enforcement','no_tool_execution','no_agent_consumed_machine_readable_policy_decisions','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertOperatorOutcomeValueScorecardRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.25.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/operator-outcome-value-scorecard-reviewer-package-v0.25.5.out.json'));
  assert(phase?.scorecardStatus === 'VALUE_SCORECARD_COMPLETE', 'v0.25.5 scorecard status must complete');
  assert(phase?.metrics?.reviewedItemCount === 3, 'v0.25.5 must score 3 reviewed outcomes');
  assert(phase?.metrics?.usefulOutcomes === 2, 'v0.25.5 useful outcome count must be 2');
  assert(phase?.metrics?.noiseOutcomes === 1, 'v0.25.5 noise outcome count must be 1');
  assert(phase?.metrics?.usefulRatio === 0.6667, 'v0.25.5 useful ratio must be bounded');
  assert(phase?.metrics?.noiseRatio === 0.3333, 'v0.25.5 noise ratio must be bounded');
  assert(phase?.recommendation === 'ADVANCE_OBSERVATION_ONLY', 'v0.25.5 recommendation must be observation-only advance');
  assert(phase?.recommendationIsAuthority === false, 'v0.25.5 recommendation must not be authority');
  assert(phase?.humanReadableOnly === true && phase?.nonAuthoritative === true && phase?.valueScorecardOnly === true, 'v0.25.5 boundary flags required');
  assert(phase?.policyDecision === null, 'v0.25.5 policyDecision must be null');
  for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert(phase?.[key] === false, 'v0.25.5 ' + key + ' must be false');
  assert((phase?.falseAuthorityLeakage ?? []).length === 0, 'v0.25.5 must have no false authority leakage');
  const negative = readJson(path.join(packageRoot, 'evidence/operator-outcome-value-scorecard-negative-controls-v0.25.3.out.json'));
  assert((negative?.rejectedNegativeControls ?? []).length >= 26, 'v0.25.3 must include expanded negative controls');
  const report = readFileSync(path.join(packageRoot, 'evidence/operator-outcome-value-scorecard-report-v0.25.5.out.md'), 'utf8');
  all(report, ['Operator Outcome Value Scorecard v0.25.5','VALUE_SCORECARD_COMPLETE','ADVANCE_OBSERVATION_ONLY','usefulOutcomes=2','noiseOutcomes=1','reviewedItemCount=3','policyDecision: null'], 'operator outcome value report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['operator outcome value scorecard','scorecardStatus: VALUE_SCORECARD_COMPLETE','usefulOutcomes: 2','noiseOutcomes: 1','reviewedItemCount: 3','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'operator outcome value scorecard','scorecardStatus: VALUE_SCORECARD_COMPLETE','usefulOutcomes: 2','noiseOutcomes: 1','reviewedItemCount: 3','recommendation: ADVANCE_OBSERVATION_ONLY','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','externalEffects: false','rawPersisted: false','rawOutput: false'], 'RELEASE_NOTES.md', assertIncludes);
}

export const operatorOutcomeValueScorecardSuite = Object.freeze({
  name: 'operator-outcome-value-scorecard',
  gatePhase: 'post-real-redacted',
  gateScripts: operatorOutcomeValueScorecardScripts,
  requiredManifestPaths: operatorOutcomeValueScorecardRequiredManifestPaths,
  assertManifestMetadata: assertOperatorOutcomeValueScorecardManifestMetadata,
  assertRelease: assertOperatorOutcomeValueScorecardRelease
});
