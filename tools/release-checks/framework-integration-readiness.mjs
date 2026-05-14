
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const frameworkIntegrationReadinessGateScripts = Object.freeze([
  'test:framework-integration-go-no-go',
  'test:first-real-framework-adapter-design-v081',
  'test:framework-adapter-implementation-hazard-catalog-v082',
]);

export const frameworkIntegrationReadinessRequiredManifestPaths = Object.freeze([
  'tools/release-checks/framework-integration-readiness.mjs',
  'schemas/framework-integration-go-no-go.schema.json',
  'docs/framework-integration-go-no-go-v0.8.0-alpha.md',
  'docs/status-v0.8.0-alpha.md',
  'design-notes/first-real-framework-adapter-design-v0.8.1.md',
  'docs/framework-adapter-candidate-comparison.md',
  'docs/status-v0.8.1.md',
  'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md',
  'docs/status-v0.8.2.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-integration-go-no-go.json',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-integration-go-no-go.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/first-real-framework-adapter-design-v0.8.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-adapter-implementation-hazard-catalog-v0.8.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-integration-go-no-go.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/first-real-framework-adapter-design-v0.8.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json',
]);

function assertSummary(summary, expected, label, assert) {
  for (const [field, expectedValue] of Object.entries(expected)) {
    assert(summary?.[field] === expectedValue, `${label} ${field} must be ${JSON.stringify(expectedValue)}`);
  }
}

function assertAllIncluded(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

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
  if (manifestReleaseTag !== 'v0.8.2') return;
  const hazards = readJson(path.join(packageRoot, 'evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json'));
  assertSummary(hazards?.summary, { frameworkAdapterImplementationHazardCatalog: 'pass', releaseLayer: 'v0.8.2', hazardCount: 25, successEvidenceWrittenForHazards: 0, implementationAuthorized: false, realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, enforcement: false }, 'framework adapter implementation hazard catalog evidence', assert);
  const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.2.md'), 'utf8');
  const docs = readFileSync(path.join(repoRoot, 'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md'), 'utf8');
  assertAllIncluded(status, ['hazard catalog only','hazardCount: 25','successEvidenceWrittenForHazards: 0','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false'], 'docs/status-v0.8.2.md', assertIncludes);
  assertAllIncluded(docs, ['Status: implementation hazard catalog only','successEvidenceWrittenForHazards: 0','Hazard cases must not produce success evidence','H25','No real framework adapter','No MCP server/client','No SDK import','No network','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.2'], 'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md', assertIncludes);
}

export const frameworkIntegrationReadinessSuite = Object.freeze({ name: 'framework-integration-readiness', gateScripts: frameworkIntegrationReadinessGateScripts, requiredManifestPaths: frameworkIntegrationReadinessRequiredManifestPaths, assertManifestMetadata: assertFrameworkIntegrationReadinessManifestMetadata, assertRelease: assertFrameworkIntegrationReadinessRelease });
