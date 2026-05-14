import { readFileSync } from 'node:fs';
import path from 'node:path';

export const frameworkShapedAdapterGateScripts = Object.freeze([
  'test:framework-shaped-adapter-boundary-schema',
  'test:framework-shaped-adapter-hazard-catalog',
  'test:simulated-framework-shaped-adapter',
  'test:simulated-framework-shaped-adapter-reproducibility',
  'test:framework-shaped-adapter-reviewer-runbook',
]);

export const frameworkShapedAdapterRequiredManifestPaths = Object.freeze([
  'tools/release-checks/framework-shaped-adapter.mjs',
  'schemas/framework-shaped-adapter-boundary.schema.json',
  'docs/framework-shaped-adapter-boundary.md',
  'docs/status-v0.7.0-alpha.md',
  'docs/status-v0.7.1.md',
  'docs/framework-shaped-adapter-hazard-catalog.md',
  'docs/status-v0.7.2.md',
  'docs/simulated-framework-shaped-adapter.md',
  'docs/status-v0.7.3.md',
  'docs/simulated-framework-shaped-adapter-reproducibility.md',
  'docs/status-v0.7.4.md',
  'docs/framework-shaped-adapter-reviewer-runbook.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-shaped-adapter-boundaries.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-shaped-adapter-hazard-catalog.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/simulated-framework-shaped-adapter.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/simulated-framework-shaped-adapter-reproducibility.json',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-shaped-adapter-boundary-schema.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-shaped-adapter-hazard-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/simulated-framework-shaped-adapter.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/simulated-framework-shaped-adapter-reproducibility.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-shaped-adapter-reviewer-runbook.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-boundary-schema.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-hazard-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/simulated-framework-shaped-adapter.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/simulated-framework-shaped-adapter-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-reviewer-runbook.out.json',
]);

function assertSummary(summary, expected, label, assert) {
  for (const [field, expectedValue] of Object.entries(expected)) {
    assert(summary?.[field] === expectedValue, `${label} ${field} must be ${JSON.stringify(expectedValue)}`);
  }
}

function assertAllIncluded(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertFrameworkShapedAdapterManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag === 'v0.7.0-alpha') {
    assertAllIncluded(manifest.reproducibility, [
      'v0.7.0-alpha',
      'framework_adapter_boundary_schema',
      'positive_cases_2',
      'negative_cases_10',
      'unexpected_accepts_0',
      'unexpected_rejects_0',
      'framework_shaped_local_fixture',
      'record_only',
      'real_framework_integration_false',
      'sdk_imported_false',
      'network_allowed_false',
      'tool_execution_allowed_false',
      'agent_consumed_allowed_false',
      'machine_readable_policy_allowed_false',
      'authorization_false',
      'enforcement_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);

    assertAllIncluded(manifest.runtimeBoundary, [
      'framework_adapter_boundary_spec_only',
      'framework_shaped_local_fixture_only',
      'local_redacted_fixture_only',
      'record_only_evidence_only',
      'no_mcp_server_client',
      'no_langgraph_sdk',
      'no_a2a_runtime',
      'no_github_bot',
      'no_webhook',
      'no_network_call',
      'no_resource_fetch',
      'no_live_traffic',
      'no_watcher',
      'no_daemon',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'classifier_compactAllowed_false',
      'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.7.1') {
    assertAllIncluded(manifest.reproducibility, [
      'v0.7.1',
      'framework_adapter_hazard_catalog',
      'hazard_cases_25',
      'rejected_or_downgraded_25',
      'unexpected_accepts_0',
      'pipeline_runs_for_rejected_cases_0',
      'source_reads_for_rejected_cases_0',
      'success_outputs_for_rejected_cases_0',
      'record_only',
      'authorization_false',
      'enforcement_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, [
      'framework_adapter_hazard_catalog_only',
      'reject_or_downgrade_before_pipeline',
      'no_real_framework_integration',
      'no_sdk_import',
      'no_network_call',
      'no_resource_fetch',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.2') {
    assertAllIncluded(manifest.reproducibility, [
      'v0.7.2',
      'simulated_framework_shaped_adapter',
      'positive_cases_2',
      'parser_evidence_produced_2',
      'classifier_decisions_produced_2',
      'decision_traces_produced_2',
      'advisory_reports_produced_2',
      'record_only',
      'network_used_false',
      'tool_execution_false',
      'agent_consumed_false',
      'classifier_compactAllowed_true_0',
      'machine_readable_policy_decision_false',
      'authorization_false',
      'enforcement_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, [
      'simulated_framework_shaped_adapter_only',
      'fake_local_redacted_fixture_only',
      'record_only_evidence_only',
      'no_real_framework_integration',
      'no_sdk_import',
      'no_network_call',
      'no_live_traffic',
      'no_resource_fetch',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.3') {
    assertAllIncluded(manifest.reproducibility, [
      'v0.7.3',
      'simulated_framework_adapter_reproducibility',
      'runs_2',
      'normalized_output_mismatches_0',
      'baseline_mismatches_0',
      'negative_controls_8',
      'unexpected_accepts_0',
      'expected_reason_code_misses_0',
      'classifier_compactAllowed_true_0',
      'record_only',
      'machine_readable_policy_decision_false',
      'agent_consumed_false',
      'authorization_false',
      'enforcement_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, [
      'simulated_framework_adapter_reproducibility_only',
      'fake_local_redacted_fixture_only',
      'committed_record_only_evidence_only',
      'no_real_framework_integration',
      'no_sdk_import',
      'no_network_call',
      'no_live_traffic',
      'no_resource_fetch',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.4') {
    assertAllIncluded(manifest.reproducibility, [
      'v0.7.4',
      'framework_shaped_adapter_reviewer_runbook',
      'missing_required_phrases_0',
      'missing_required_sections_0',
      'missing_commands_0',
      'forbidden_phrase_findings_0',
      'hazard_cases_25',
      'pipeline_runs_for_rejected_cases_0',
      'classifier_compactAllowed_true_0',
      'normalized_output_mismatches_0',
      'baseline_mismatches_0',
      'drift_controls_8',
      'record_only',
      'machine_readable_policy_decision_false',
      'agent_consumed_false',
      'authorization_false',
      'enforcement_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, [
      'framework_shaped_adapter_reviewer_runbook_only',
      'human_readable_reviewer_runbook_only',
      'fake_local_redacted_fixture_only',
      'committed_record_only_evidence_only',
      'no_real_framework_integration',
      'no_sdk_import',
      'no_network_call',
      'no_live_traffic',
      'no_resource_fetch',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
}

export function assertFrameworkShapedAdapterRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {

  if (manifestReleaseTag === 'v0.7.4') {
    const runbook = readJson(path.join(packageRoot, 'evidence/framework-shaped-adapter-reviewer-runbook.out.json'));
    assertSummary(runbook?.summary, {
      frameworkShapedAdapterReviewerRunbook: 'pass',
      releaseLayer: 'v0.7.4',
      missingRequiredPhrases: 0,
      missingRequiredSections: 0,
      missingCommands: 0,
      forbiddenPhraseFindings: 0,
      hazardCases: 25,
      rejectedOrDowngraded: 25,
      pipelineRunsForRejectedCases: 0,
      sourceReadsForRejectedCases: 0,
      successOutputsForRejectedCases: 0,
      positiveCases: 2,
      classifierCompactAllowedTrue: 0,
      reproducibilityRuns: 2,
      normalizedOutputMismatches: 0,
      baselineMismatches: 0,
      driftControls: 8,
      unexpectedAccepts: 0,
      expectedReasonCodeMisses: 0,
      recordOnly: true,
      realFrameworkIntegration: false,
      sdkImported: false,
      networkAllowed: false,
      toolExecution: false,
      resourceFetch: false,
      memoryWrite: false,
      configWrite: false,
      externalPublication: false,
      approvalEmission: false,
      machineReadablePolicyDecision: false,
      agentConsumed: false,
      mayBlock: false,
      mayAllow: false,
      authorization: false,
      enforcement: false,
    }, 'framework-shaped adapter reviewer runbook evidence', assert);
    const statusV074 = readFileSync(path.join(repoRoot, 'docs/status-v0.7.4.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-shaped-adapter-reviewer-runbook.md'), 'utf8');
    assertAllIncluded(statusV074, [
      'framework-shaped adapter reviewer runbook',
      'human reviewer runbook',
      'required phrases',
      '25 hazard cases',
      'pipelineRunsForRejectedCases: 0',
      'classifier compactAllowed true count: 0',
      'normalizedOutputMismatches: 0',
      'baselineMismatches: 0',
      'No real framework integration',
    ], 'docs/status-v0.7.4.md', assertIncludes);
    assertAllIncluded(docs, [
      'A passing framework-shaped adapter review is evidence of local boundary preservation, not runtime authorization.',
      'The reviewer is checking boundary preservation, not granting authority.',
      'Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.',
      'test:framework-shaped-adapter-reviewer-runbook',
      'release:check -- --target v0.7.4',
      'Do not convert this runbook into machine-readable policy or agent instructions.',
    ], 'docs/framework-shaped-adapter-reviewer-runbook.md', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.3') {
    const reproducibility = readJson(path.join(packageRoot, 'evidence/simulated-framework-shaped-adapter-reproducibility.out.json'));
    assertSummary(reproducibility?.summary, {
      simulatedFrameworkAdapterReproducibility: 'pass',
      releaseLayer: 'v0.7.3',
      dependsOn: 'v0.7.2-simulated-framework-shaped-adapter',
      runs: 2,
      normalizedOutputMismatches: 0,
      baselineMismatches: 0,
      negativeControls: 8,
      expectedRejects: 8,
      unexpectedAccepts: 0,
      expectedReasonCodeMisses: 0,
      positiveCases: 2,
      classifierCompactAllowedTrue: 0,
      parserEvidenceProduced: 2,
      classifierDecisionsProduced: 2,
      decisionTracesProduced: 2,
      advisoryReportsProduced: 2,
      recordOnly: true,
      realFrameworkIntegration: false,
      sdkImported: false,
      networkUsed: false,
      toolExecution: false,
      resourceFetch: false,
      memoryWrite: false,
      configWrite: false,
      externalPublication: false,
      approvalEmission: false,
      machineReadablePolicyDecision: false,
      agentConsumed: false,
      mayBlock: false,
      mayAllow: false,
      authorization: false,
      enforcement: false,
    }, 'simulated framework-shaped adapter reproducibility evidence', assert);
    assert(JSON.stringify(reproducibility?.summary?.frameworkKinds) === JSON.stringify(['mcp_like', 'langgraph_like']), 'simulated framework-shaped adapter reproducibility must preserve mcp_like and langgraph_like');
    const statusV073 = readFileSync(path.join(repoRoot, 'docs/status-v0.7.3.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/simulated-framework-shaped-adapter-reproducibility.md'), 'utf8');
    assertAllIncluded(statusV073, [
      'simulated framework-shaped adapter reproducibility/drift',
      'normalizedOutputMismatches: 0',
      'baselineMismatches: 0',
      'rejects eight drift controls',
      'unexpectedAccepts: 0',
      'expectedReasonCodeMisses: 0',
      'classifier compactAllowed true count: 0',
      'No real framework integration',
    ], 'docs/status-v0.7.3.md', assertIncludes);
    assertAllIncluded(docs, [
      'reruns the fake/local/already-redacted fixtures twice',
      'normalize parserEvidence / classifierDecision / DecisionTrace / advisory report fields',
      'reject drift controls',
      'classifier `compactAllowed`',
      'machine-policy flags',
      'agent consumption',
      'authorization/enforcement capability flags',
      'It does not authorize a real adapter',
    ], 'docs/simulated-framework-shaped-adapter-reproducibility.md', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.2') {
    const simulated = readJson(path.join(packageRoot, 'evidence/simulated-framework-shaped-adapter.out.json'));
    assertSummary(simulated?.summary, {
      simulatedFrameworkShapedAdapter: 'pass',
      releaseLayer: 'v0.7.2',
      positiveCases: 2,
      parserEvidenceProduced: 2,
      classifierDecisionsProduced: 2,
      classifierCompactAllowedTrue: 0,
      decisionTracesProduced: 2,
      advisoryReportsProduced: 2,
      recordOnly: true,
      realFrameworkIntegration: false,
      sdkImported: false,
      networkUsed: false,
      toolExecution: false,
      resourceFetch: false,
      memoryWrite: false,
      configWrite: false,
      externalPublication: false,
      approvalEmission: false,
      machineReadablePolicyDecision: false,
      agentConsumed: false,
      mayBlock: false,
      mayAllow: false,
      authorization: false,
      enforcement: false,
    }, 'simulated framework-shaped adapter evidence', assert);
    assert(JSON.stringify(simulated?.summary?.frameworkKinds) === JSON.stringify(['mcp_like', 'langgraph_like']), 'simulated framework-shaped adapter must cover mcp_like and langgraph_like');
    const statusV072 = readFileSync(path.join(repoRoot, 'docs/status-v0.7.2.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/simulated-framework-shaped-adapter.md'), 'utf8');
    assertAllIncluded(statusV072, [
      'simulated framework-shaped adapter',
      'fake/local/already-redacted',
      'two parserEvidence records',
      'two classifier decisions',
      'two DecisionTraces',
      'two advisory reports',
      'No real framework integration',
      'compactAllowed true count: 0',
    ], 'docs/status-v0.7.2.md', assertIncludes);
    assertAllIncluded(docs, [
      'fake framework-shaped local fixture',
      'parserEvidence',
      'classifierDecision',
      'DecisionTrace',
      'advisory report',
      'record-only evidence',
      'This is still not real framework integration',
      'compactAllowed=false',
    ], 'docs/simulated-framework-shaped-adapter.md', assertIncludes);
  }


  if (manifestReleaseTag === 'v0.7.1') {
    const hazard = readJson(path.join(packageRoot, 'evidence/framework-shaped-adapter-hazard-catalog.out.json'));
    assertSummary(hazard?.summary, {
      frameworkAdapterHazardCatalog: 'pass',
      releaseLayer: 'v0.7.1',
      hazardCases: 25,
      rejectedOrDowngraded: 25,
      unexpectedAccepts: 0,
      pipelineRunsForRejectedCases: 0,
      sourceReadsForRejectedCases: 0,
      successOutputsForRejectedCases: 0,
      realFrameworkIntegration: false,
      sdkImported: false,
      networkAllowed: false,
      toolExecution: false,
      resourceFetch: false,
      memoryWrite: false,
      configWrite: false,
      externalPublication: false,
      approvalEmission: false,
      mayBlock: false,
      mayAllow: false,
      authorization: false,
      enforcement: false,
      agentConsumed: false,
      machineReadablePolicyDecision: false,
    }, 'framework-shaped adapter hazard catalog evidence', assert);
    const statusV071 = readFileSync(path.join(repoRoot, 'docs/status-v0.7.1.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-shaped-adapter-hazard-catalog.md'), 'utf8');
    assertAllIncluded(statusV071, [
      'framework adapter hazard catalog',
      '25 hazards',
      'pipelineRunsForRejectedCases: 0',
      'sourceReadsForRejectedCases: 0',
      'successOutputsForRejectedCases: 0',
      'No real framework integration',
    ], 'docs/status-v0.7.1.md', assertIncludes);
    assertAllIncluded(docs, [
      'Rejected hazard cases must not run simulated pipeline',
      'pipelineRunsForRejectedCases: 0',
      'sourceReadsForRejectedCases: 0',
      'successOutputsForRejectedCases: 0',
      'does not authorize real framework integration',
    ], 'docs/framework-shaped-adapter-hazard-catalog.md', assertIncludes);
  }

  if (manifestReleaseTag !== 'v0.7.0-alpha') return;

  const evidence = readJson(path.join(packageRoot, 'evidence/framework-shaped-adapter-boundary-schema.out.json'));
  assertSummary(evidence?.summary, {
    frameworkShapedAdapterBoundarySchema: 'pass',
    releaseLayer: 'v0.7.0-alpha',
    schemaOnly: true,
    shapeOnly: true,
    frameworkShapedOnly: true,
    localRedactedFixtureOnly: true,
    positiveCases: 2,
    negativeCases: 10,
    unexpectedAccepts: 0,
    unexpectedRejects: 0,
    realFrameworkIntegration: false,
    sdkImported: false,
    networkAllowed: false,
    toolExecutionAllowed: false,
    resourceFetchAllowed: false,
    agentConsumedAllowed: false,
    machineReadablePolicyAllowed: false,
    approvalAllowed: false,
    blockingAllowed: false,
    allowingAllowed: false,
    authorizationAllowed: false,
    enforcementAllowed: false,
    realAdapterImplemented: false,
    mcpAdapterImplemented: false,
    langGraphAdapterImplemented: false,
    a2aAdapterImplemented: false,
    githubBotAdapterImplemented: false,
    frameworkSdkDependencyCount: 0,
    outputMode: 'record_only_evidence',
  }, 'framework-shaped adapter boundary schema evidence', assert);

  const status = readFileSync(path.join(repoRoot, 'docs/status-v0.7.0-alpha.md'), 'utf8');
  const docs = readFileSync(path.join(repoRoot, 'docs/framework-shaped-adapter-boundary.md'), 'utf8');
  assertAllIncluded(status, [
    'framework adapter boundary spec',
    'framework-shaped local fixture inputs only',
    'additionalProperties: false',
    'No MCP server/client',
    'no network call',
    'record-only evidence only',
    'no authorization',
    'enforcement',
  ], 'docs/status-v0.7.0-alpha.md', assertIncludes);
  assertAllIncluded(docs, [
    'without implementing any real framework adapter',
    'local_redacted_fixture_only',
    'record_only_evidence',
    'Every operational capability flag is pinned to `false`',
    'MCP server/client',
    'LangGraph SDK',
    'A2A runtime',
    'GitHub bot',
    'network call',
    'authorization or enforcement',
  ], 'docs/framework-shaped-adapter-boundary.md', assertIncludes);
}

export const frameworkShapedAdapterSuite = Object.freeze({
  name: 'framework-shaped-adapter',
  gateScripts: frameworkShapedAdapterGateScripts,
  requiredManifestPaths: frameworkShapedAdapterRequiredManifestPaths,
  assertManifestMetadata: assertFrameworkShapedAdapterManifestMetadata,
  assertRelease: assertFrameworkShapedAdapterRelease,
});
