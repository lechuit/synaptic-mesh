
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const frameworkIntegrationReadinessGateScripts = Object.freeze([
  'test:framework-integration-go-no-go',
  'test:first-real-framework-adapter-design-v081',
  'test:framework-adapter-implementation-hazard-catalog-v082',
  'test:framework-adapter-dry-run-contract-v083',
  'test:framework-adapter-reviewer-runbook-v084',
  'test:framework-integration-readiness-public-review-package-v085',
]);

export const frameworkIntegrationReadinessRequiredManifestPaths = Object.freeze([
  'tools/release-checks/framework-integration-readiness.mjs',
  'schemas/framework-integration-go-no-go.schema.json',
  'schemas/framework-adapter-dry-run-contract.schema.json',
  'docs/framework-integration-go-no-go-v0.8.0-alpha.md',
  'docs/status-v0.8.0-alpha.md',
  'design-notes/first-real-framework-adapter-design-v0.8.1.md',
  'docs/framework-adapter-candidate-comparison.md',
  'docs/status-v0.8.1.md',
  'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md',
  'docs/status-v0.8.2.md',
  'docs/framework-adapter-dry-run-contract-v0.8.3.md',
  'docs/status-v0.8.3.md',
  'docs/framework-adapter-reviewer-runbook-v0.8.4.md',
  'docs/status-v0.8.4.md',
  'docs/framework-integration-readiness-public-review-package-v0.8.5.md',
  'docs/status-v0.8.5.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-integration-go-no-go.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-adapter-dry-run-contract.json',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-integration-go-no-go.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/first-real-framework-adapter-design-v0.8.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-adapter-implementation-hazard-catalog-v0.8.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-adapter-dry-run-contract-v0.8.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-adapter-reviewer-runbook-v0.8.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-integration-readiness-public-review-package-v0.8.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-integration-go-no-go.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/first-real-framework-adapter-design-v0.8.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-adapter-dry-run-contract-v0.8.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-adapter-reviewer-runbook-v0.8.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-integration-readiness-public-review-package-v0.8.5.out.json',
]);

function assertSummary(summary, expected, label, assert) { for (const [field, expectedValue] of Object.entries(expected)) assert(summary?.[field] === expectedValue, `${label} ${field} must be ${JSON.stringify(expectedValue)}`); }
function assertAllIncluded(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertFrameworkIntegrationReadinessManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag === 'v0.8.0-alpha') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.0-alpha','framework_integration_go_no_go','positive_cases_1','negative_cases_12','unexpected_accepts_0','unexpected_rejects_0','go_to_design_true','go_to_implementation_false','real_framework_adapter_authorized_false','framework_sdk_import_authorized_false','network_authorized_false','tool_execution_authorized_false','agent_consumption_authorized_false','machine_readable_policy_authorized_false','may_block_false','may_allow_false','enforcement_authorized_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['framework_integration_go_no_go_record_only','design_allowed_implementation_blocked','no_real_framework_adapter','no_framework_runtime','no_mcp_server_client','no_langgraph_sdk','no_a2a_runtime','no_github_bot','no_sdk_import','no_network_call','no_resource_fetch','no_tool_call','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.1') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.1','first_real_framework_adapter_design','design_only_true','implementation_authorized_false','selected_candidate_mcp_read_only_candidate','sdk_imported_false','network_allowed_false','tool_execution_false','resource_fetch_false','agent_consumed_false','machine_readable_policy_decision_false','approval_emission_false','may_block_false','may_allow_false','enforcement_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['first_real_framework_adapter_design_note_only','mcp_read_only_candidate_design_only','no_adapter_code','no_mcp_server_client','no_sdk_import','no_network_call','no_resource_fetch','no_tool_call','no_framework_runtime','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.2') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.2','framework_adapter_implementation_hazard_catalog','hazard_count_25','success_evidence_written_for_hazards_0','implementation_authorized_false','real_framework_adapter_implemented_false','framework_integration_authorized_false','sdk_imported_false','network_allowed_false','resource_fetch_false','tool_execution_false','agent_consumed_false','machine_readable_policy_decision_false','approval_emission_false','may_block_false','may_allow_false','enforcement_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['framework_adapter_implementation_hazard_catalog_only','no_success_evidence_for_hazards','no_real_framework_adapter','no_sdk_import','no_mcp_server_client','no_network_call','no_resource_fetch','no_tool_call','no_framework_runtime','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.3') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.3','framework_adapter_dry_run_contract','positive_cases_1','negative_cases_16','unexpected_accepts_0','framework_like_local_packet_true','record_only_true','real_framework_adapter_implemented_false','framework_integration_authorized_false','sdk_imported_false','network_allowed_false','resource_fetch_false','tool_execution_false','agent_consumed_false','machine_readable_policy_decision_false','approval_emission_false','may_block_false','may_allow_false','enforcement_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['framework_adapter_dry_run_contract_only','framework_like_local_redacted_packet_only','local_validation_only','record_only_evidence','no_real_framework_adapter','no_sdk_import','no_mcp_server_client','no_network_call','no_resource_fetch','no_tool_call','no_framework_runtime','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.8.4') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.4','framework_adapter_reviewer_runbook','central_phrase_present_true','required_sections_8','missing_required_sections_0','missing_required_phrases_0','real_framework_adapter_implemented_false','framework_integration_authorized_false','sdk_imported_false','network_allowed_false','resource_fetch_false','tool_execution_false','agent_consumed_false','machine_readable_policy_decision_false','approval_emission_false','may_block_false','may_allow_false','enforcement_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['framework_adapter_reviewer_runbook_only','framework_dry_run_evidence_is_not_framework_authorization','no_real_framework_adapter','no_sdk_import','no_mcp_server_client','no_network_call','no_resource_fetch','no_tool_call','no_framework_runtime','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.8.5') {
    assertAllIncluded(manifest.reproducibility, ['v0.8.5','framework_integration_readiness_public_review_package','prior_evidence_artifacts_5','prior_evidence_passes_5','missing_evidence_0','go_to_design_true','go_to_implementation_false','real_framework_adapter_implemented_false','framework_integration_authorized_false','sdk_imported_false','network_allowed_false','resource_fetch_false','tool_execution_false','agent_consumed_false','machine_readable_policy_decision_false','approval_emission_false','may_block_false','may_allow_false','enforcement_false'], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, ['framework_integration_readiness_public_review_package_only','no_real_framework_adapter','framework_integration_authorized_false','go_to_design_true_go_to_implementation_false','no_sdk_import','no_mcp_server_client','no_network_call','no_resource_fetch','no_tool_call','no_framework_runtime','no_live_traffic','no_watcher','no_daemon','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_machine_readable_policy','no_approval_blocking_allowing_authorization_or_enforcement'], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
}

export function assertFrameworkIntegrationReadinessRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag === 'v0.8.0-alpha') {
    const evidence = readJson(path.join(packageRoot, 'evidence/framework-integration-go-no-go.out.json'));
    assertSummary(evidence?.summary, { frameworkIntegrationGoNoGo: 'pass', releaseLayer: 'v0.8.0-alpha', positiveCases: 1, negativeCases: 12, unexpectedAccepts: 0, unexpectedRejects: 0, goToDesign: true, goToImplementation: false, realFrameworkAdapterAuthorized: false, frameworkSdkImportAuthorized: false, networkAuthorized: false, toolExecutionAuthorized: false, agentConsumptionAuthorized: false, machineReadablePolicyAuthorized: false, mayBlock: false, mayAllow: false, authorizationAuthorized: false, enforcementAuthorized: false }, 'framework integration go/no-go evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.0-alpha.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-integration-go-no-go-v0.8.0-alpha.md'), 'utf8');
    assertAllIncluded(status, ['framework integration go/no-go record','design allowed, implementation blocked','goToDesign: true','goToImplementation: false','No real framework adapter','No framework integration'], 'docs/status-v0.8.0-alpha.md', assertIncludes);
    assertAllIncluded(docs, ['design allowed, implementation blocked','Framework-shaped adapter evidence does not authorize framework integration.','test:framework-integration-go-no-go','release:check -- --target v0.8.0-alpha','No MCP server/client','No SDK import','No network, resource fetch, or tool execution','No approval, block/allow, authorization, or enforcement'], 'docs/framework-integration-go-no-go-v0.8.0-alpha.md', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.1') {
    const design = readJson(path.join(packageRoot, 'evidence/first-real-framework-adapter-design-v0.8.1.out.json'));
    assertSummary(design?.summary, { firstRealFrameworkAdapterDesign: 'pass', releaseLayer: 'v0.8.1', designOnly: true, implementationAuthorized: false, selectedCandidate: 'mcp_read_only_candidate', sdkImported: false, networkAllowed: false, toolExecution: false, resourceFetch: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'first real framework adapter design evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.1.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'design-notes/first-real-framework-adapter-design-v0.8.1.md'), 'utf8');
    const comparison = readFileSync(path.join(repoRoot, 'docs/framework-adapter-candidate-comparison.md'), 'utf8');
    assertAllIncluded(status, ['first real framework adapter design note','MCP read-only candidate','design-only','No adapter code','No SDK imports','No network/resource/tool'], 'docs/status-v0.8.1.md', assertIncludes);
    assertAllIncluded(docs, ['Status: design-only','Candidate: `mcp_read_only_candidate`','No implementation','No SDK imports','No MCP server/client','No tool calls','No resource fetch','No network or live traffic','No memory/config writes','No machine-readable policy','No approval/block/allow','No enforcement','release:check -- --target v0.8.1'], 'design-notes/first-real-framework-adapter-design-v0.8.1.md', assertIncludes);
    assertAllIncluded(comparison, ['MCP-like','LangGraph-like','A2A-like','GitHub-bot-like','implementation allowed: no'], 'docs/framework-adapter-candidate-comparison.md', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.2') {
    const hazards = readJson(path.join(packageRoot, 'evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json'));
    assertSummary(hazards?.summary, { frameworkAdapterImplementationHazardCatalog: 'pass', releaseLayer: 'v0.8.2', hazardCount: 25, successEvidenceWrittenForHazards: 0, implementationAuthorized: false, realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'framework adapter implementation hazard catalog evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.2.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md'), 'utf8');
    assertAllIncluded(status, ['hazard catalog only','hazardCount: 25','successEvidenceWrittenForHazards: 0','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false'], 'docs/status-v0.8.2.md', assertIncludes);
    assertAllIncluded(docs, ['Status: implementation hazard catalog only','successEvidenceWrittenForHazards: 0','Hazard cases must not produce success evidence','H25','No real framework adapter','No MCP server/client','No SDK import','No network','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.2'], 'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md', assertIncludes);
  }
  if (manifestReleaseTag === 'v0.8.3') {
    const dryRun = readJson(path.join(packageRoot, 'evidence/framework-adapter-dry-run-contract-v0.8.3.out.json'));
    assertSummary(dryRun?.summary, { frameworkAdapterDryRunContract: 'pass', releaseLayer: 'v0.8.3', positiveCases: 1, negativeCases: 16, unexpectedAccepts: 0, frameworkLikeLocalPacket: true, recordOnly: true, realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'framework adapter dry-run contract evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.3.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-adapter-dry-run-contract-v0.8.3.md'), 'utf8');
    assertAllIncluded(status, ['framework adapter dry-run contract only','positiveCases: 1','negativeCases: 16','unexpectedAccepts: 0','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false'], 'docs/status-v0.8.3.md', assertIncludes);
    assertAllIncluded(docs, ['Status: dry-run contract only','framework-like local/redacted packet','local validation','record-only evidence','No real framework adapter','No SDK import','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.3'], 'docs/framework-adapter-dry-run-contract-v0.8.3.md', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.8.4') {
    const runbook = readJson(path.join(packageRoot, 'evidence/framework-adapter-reviewer-runbook-v0.8.4.out.json'));
    assertSummary(runbook?.summary, { frameworkAdapterReviewerRunbook: 'pass', releaseLayer: 'v0.8.4', centralPhrasePresent: true, requiredSections: 8, missingRequiredSections: 0, missingRequiredPhrases: 0, realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'framework adapter reviewer runbook evidence', assert);
    const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.4.md'), 'utf8');
    const docs = readFileSync(path.join(repoRoot, 'docs/framework-adapter-reviewer-runbook-v0.8.4.md'), 'utf8');
    assertAllIncluded(status, ['human reviewer runbook only','Framework dry-run evidence is not framework authorization.','centralPhrasePresent: true','missingRequiredSections: 0','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false'], 'docs/status-v0.8.4.md', assertIncludes);
    assertAllIncluded(docs, ['Status: human reviewer runbook only','Framework dry-run evidence is not framework authorization.','No real framework adapter','No SDK imports','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.4','does not authorize real framework integration'], 'docs/framework-adapter-reviewer-runbook-v0.8.4.md', assertIncludes);
  }
  if (manifestReleaseTag !== 'v0.8.5') return;
  const pkg = readJson(path.join(packageRoot, 'evidence/framework-integration-readiness-public-review-package-v0.8.5.out.json'));
  assertSummary(pkg?.summary, { frameworkIntegrationReadinessPublicReviewPackage: 'pass', releaseLayer: 'v0.8.5', priorEvidenceArtifacts: 5, priorEvidencePasses: 5, missingEvidence: 0, goToDesign: true, goToImplementation: false, realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'framework integration readiness public review package evidence', assert);
  const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.5.md'), 'utf8');
  const docs = readFileSync(path.join(repoRoot, 'docs/framework-integration-readiness-public-review-package-v0.8.5.md'), 'utf8');
  assertAllIncluded(status, ['public review package only','priorEvidenceArtifacts: 5','priorEvidencePasses: 5','missingEvidence: 0','goToDesign: true','goToImplementation: false','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false'], 'docs/status-v0.8.5.md', assertIncludes);
  assertAllIncluded(docs, ['Status: public review package only','Final v0.8.x success statement','still no real framework integration','goToDesign: true','goToImplementation: false','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false','No real framework adapter','No SDK import','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.5','not an authorization to implement'], 'docs/framework-integration-readiness-public-review-package-v0.8.5.md', assertIncludes);
}

export const frameworkIntegrationReadinessSuite = Object.freeze({ name: 'framework-integration-readiness', gateScripts: frameworkIntegrationReadinessGateScripts, requiredManifestPaths: frameworkIntegrationReadinessRequiredManifestPaths, assertManifestMetadata: assertFrameworkIntegrationReadinessManifestMetadata, assertRelease: assertFrameworkIntegrationReadinessRelease });
