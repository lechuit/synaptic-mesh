import { readFileSync } from 'node:fs';
import path from 'node:path';

export const authorityConfusionBenchmarkGateScripts = Object.freeze([
  'test:authority-confusion-benchmark-spec-v090',
  'test:authority-confusion-naive-baseline-v091',
  'test:authority-confusion-synaptic-comparison-v092',
]);

export const authorityConfusionBenchmarkRequiredManifestPaths = Object.freeze([
  'tools/release-checks/authority-confusion-benchmark.mjs',
  'schemas/authority-confusion-benchmark-case.schema.json',
  'docs/authority-confusion-benchmark-spec-v0.9.0.md',
  'docs/authority-confusion-naive-baseline-v0.9.1.md',
  'docs/authority-confusion-synaptic-comparison-v0.9.2.md',
  'docs/status-v0.9.0.md',
  'docs/status-v0.9.1.md',
  'docs/status-v0.9.2.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/authority-confusion-benchmark-v0.9.0.json',
  'implementation/synaptic-mesh-shadow-v0/tests/authority-confusion-benchmark-spec-v0.9.0.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/authority-confusion-naive-baseline-v0.9.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/authority-confusion-synaptic-comparison-v0.9.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-benchmark-spec-v0.9.0.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-naive-baseline-v0.9.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json',
]);

function assertSummary(summary, expected, label, assert) {
  for (const [field, expectedValue] of Object.entries(expected)) assert(summary?.[field] === expectedValue, label + ' ' + field + ' must be ' + JSON.stringify(expectedValue));
}
function assertAllIncluded(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertAuthorityConfusionBenchmarkManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag === 'v0.9.0') {
    assertAllIncluded(manifest.reproducibility, ['v0.9.0','authority_confusion_benchmark_spec','benchmark_cases_12','categories_12','local_redacted_cases_12','tempting_phrase_cases_12','missing_authority_cases_12','naive_permit_expected_12','safe_permit_expected_0','capability_true_count_0','benchmark_spec_ready_true'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['authority_confusion_benchmark_spec_only','context_is_not_permission','local_redacted_fixture_only','no_runtime','no_network_call','no_sdk_import','no_resource_fetch','no_tool_call','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.9.1') {
    assertAllIncluded(manifest.reproducibility, ['v0.9.1','authority_confusion_naive_baseline','benchmark_cases_12','baseline_permits_12','baseline_false_permits_12','baseline_false_permit_rate_1','captured_failure_modes_12','expected_safe_permits_0','naive_success_claims_0','capability_true_count_0','baseline_failure_captured_true'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['authority_confusion_naive_baseline_simulation_only','failure_evidence_not_success_evidence','context_evidence_as_permission','no_runtime','no_network_call','no_sdk_import','no_resource_fetch','no_tool_call','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.9.2') {
    assertAllIncluded(manifest.reproducibility, ['v0.9.2','authority_confusion_synaptic_comparison','comparison_cases_12','baseline_false_permits_12','synaptic_mesh_permits_0','synaptic_mesh_false_permits_0','prevented_false_permits_12','false_permit_reduction_percent_100','matched_expected_safe_decisions_12','mismatches_0','capability_true_count_0','record_only_comparison_true'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['authority_confusion_synaptic_comparison_record_only','local_fixture_only','context_is_not_permission','false_permit_reduction_100_percent','no_runtime','no_network_call','no_sdk_import','no_resource_fetch','no_tool_call','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
}

export function assertAuthorityConfusionBenchmarkRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag === 'v0.9.0') {
    const evidence = readJson(path.join(packageRoot, 'evidence/authority-confusion-benchmark-spec-v0.9.0.out.json'));
    assertSummary(evidence?.summary, { authorityConfusionBenchmarkSpec: 'pass', releaseLayer: 'v0.9.0', benchmarkCases: 12, categories: 12, localRedactedCases: 12, temptingPhraseCases: 12, missingAuthorityCases: 12, naivePermitExpected: 12, safePermitExpected: 0, capabilityTrueCount: 0, benchmarkSpecReady: true, runtimeImplemented: false, networkAllowed: false, sdkImported: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false }, 'authority confusion benchmark spec evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.9.0.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/authority-confusion-benchmark-spec-v0.9.0.md'), 'utf8');
    assertAllIncluded(status, ['benchmark spec only','benchmarkCases: 12','naivePermitExpected: 12','safePermitExpected: 0','capabilityTrueCount: 0'], 'docs/status-v0.9.0.md', assertIncludes);
    assertAllIncluded(docs, ['Authority Confusion Benchmark','context is not permission','12 local/redacted cases','naive baseline should be tempted to permit','expected safe decision is never permit','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.0'], 'docs/authority-confusion-benchmark-spec-v0.9.0.md', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.9.1') {
    const evidence = readJson(path.join(packageRoot, 'evidence/authority-confusion-naive-baseline-v0.9.1.out.json'));
    assertSummary(evidence?.summary, { authorityConfusionNaiveBaseline: 'pass', releaseLayer: 'v0.9.1', benchmarkCases: 12, baselinePermits: 12, baselineFalsePermits: 12, baselineFalsePermitRate: 1, capturedFailureModes: 12, expectedSafePermits: 0, naiveSuccessClaims: 0, capabilityTrueCount: 0, baselineFailureCaptured: true, runtimeImplemented: false, networkAllowed: false, sdkImported: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false }, 'authority confusion naive baseline evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.9.1.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/authority-confusion-naive-baseline-v0.9.1.md'), 'utf8');
    assertAllIncluded(status, ['local simulation only','baselinePermits: 12','baselineFalsePermits: 12','baselineFalsePermitRate: 1','naiveSuccessClaims: 0','capabilityTrueCount: 0'], 'docs/status-v0.9.1.md', assertIncludes);
    assertAllIncluded(docs, ['Naive Baseline Failure Simulation','baseline false permits: 12','false permit rate: 1.0','context/evidence as permission','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.1'], 'docs/authority-confusion-naive-baseline-v0.9.1.md', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.9.2') {
    const evidence = readJson(path.join(packageRoot, 'evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json'));
    assertSummary(evidence?.summary, { authorityConfusionSynapticComparison: 'pass', releaseLayer: 'v0.9.2', comparisonCases: 12, baselineFalsePermits: 12, synapticMeshPermits: 0, synapticMeshFalsePermits: 0, preventedFalsePermits: 12, falsePermitReductionPercent: 100, matchedExpectedSafeDecisions: 12, mismatches: 0, capabilityTrueCount: 0, recordOnlyComparison: true, runtimeImplemented: false, networkAllowed: false, sdkImported: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false }, 'authority confusion synaptic comparison evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.9.2.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/authority-confusion-synaptic-comparison-v0.9.2.md'), 'utf8');
    assertAllIncluded(status, ['record-only comparison','baselineFalsePermits: 12','synapticMeshPermits: 0','synapticMeshFalsePermits: 0','falsePermitReductionPercent: 100','mismatches: 0','capabilityTrueCount: 0'], 'docs/status-v0.9.2.md', assertIncludes);
    assertAllIncluded(docs, ['Synaptic Mesh Comparison','record-only comparison','baseline false permits: 12','Synaptic Mesh false permits: 0','false permit reduction: 100%','matched expected safe decisions: 12','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.2'], 'docs/authority-confusion-synaptic-comparison-v0.9.2.md', assertIncludes);
  }
}

export const authorityConfusionBenchmarkSuite = Object.freeze({ name: 'authority-confusion-benchmark', gateScripts: authorityConfusionBenchmarkGateScripts, requiredManifestPaths: authorityConfusionBenchmarkRequiredManifestPaths, assertManifestMetadata: assertAuthorityConfusionBenchmarkManifestMetadata, assertRelease: assertAuthorityConfusionBenchmarkRelease });
