
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const frameworkIntegrationReadinessGateScripts = Object.freeze([
  'test:framework-integration-go-no-go',
]);

export const frameworkIntegrationReadinessRequiredManifestPaths = Object.freeze([
  'tools/release-checks/framework-integration-readiness.mjs',
  'schemas/framework-integration-go-no-go.schema.json',
  'docs/framework-integration-go-no-go-v0.8.0-alpha.md',
  'docs/status-v0.8.0-alpha.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-integration-go-no-go.json',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-integration-go-no-go.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-integration-go-no-go.out.json',
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
    assertAllIncluded(manifest.reproducibility, [
      'v0.8.0-alpha',
      'framework_integration_go_no_go',
      'positive_cases_1',
      'negative_cases_12',
      'unexpected_accepts_0',
      'unexpected_rejects_0',
      'go_to_design_true',
      'go_to_implementation_false',
      'real_framework_adapter_authorized_false',
      'framework_sdk_import_authorized_false',
      'network_authorized_false',
      'tool_execution_authorized_false',
      'agent_consumption_authorized_false',
      'machine_readable_policy_authorized_false',
      'may_block_false',
      'may_allow_false',
      'enforcement_authorized_false',
    ], 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, [
      'framework_integration_go_no_go_record_only',
      'design_allowed_implementation_blocked',
      'no_real_framework_adapter',
      'no_framework_runtime',
      'no_mcp_server_client',
      'no_langgraph_sdk',
      'no_a2a_runtime',
      'no_github_bot',
      'no_sdk_import',
      'no_network_call',
      'no_resource_fetch',
      'no_tool_call',
      'no_memory_write',
      'no_config_write',
      'no_external_publication',
      'no_agent_consumption',
      'no_machine_readable_policy',
      'no_approval_blocking_allowing_authorization_or_enforcement',
    ], 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
}

export function assertFrameworkIntegrationReadinessRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.8.0-alpha') return;

  const evidence = readJson(path.join(packageRoot, 'evidence/framework-integration-go-no-go.out.json'));
  assertSummary(evidence?.summary, {
    frameworkIntegrationGoNoGo: 'pass',
    releaseLayer: 'v0.8.0-alpha',
    positiveCases: 1,
    negativeCases: 12,
    unexpectedAccepts: 0,
    unexpectedRejects: 0,
    goToDesign: true,
    goToImplementation: false,
    realFrameworkAdapterAuthorized: false,
    frameworkSdkImportAuthorized: false,
    networkAuthorized: false,
    toolExecutionAuthorized: false,
    agentConsumptionAuthorized: false,
    machineReadablePolicyAuthorized: false,
    mayBlock: false,
    mayAllow: false,
    authorizationAuthorized: false,
    enforcementAuthorized: false,
  }, 'framework integration go/no-go evidence', assert);

  const status = readFileSync(path.join(repoRoot, 'docs/status-v0.8.0-alpha.md'), 'utf8');
  const docs = readFileSync(path.join(repoRoot, 'docs/framework-integration-go-no-go-v0.8.0-alpha.md'), 'utf8');
  assertAllIncluded(status, [
    'framework integration go/no-go record',
    'design allowed, implementation blocked',
    'goToDesign: true',
    'goToImplementation: false',
    'No real framework adapter',
    'No framework integration',
  ], 'docs/status-v0.8.0-alpha.md', assertIncludes);
  assertAllIncluded(docs, [
    'design allowed, implementation blocked',
    'Framework-shaped adapter evidence does not authorize framework integration.',
    'test:framework-integration-go-no-go',
    'release:check -- --target v0.8.0-alpha',
    'No MCP server/client',
    'No SDK import',
    'No network, resource fetch, or tool execution',
    'No approval, block/allow, authorization, or enforcement',
  ], 'docs/framework-integration-go-no-go-v0.8.0-alpha.md', assertIncludes);
}

export const frameworkIntegrationReadinessSuite = Object.freeze({
  name: 'framework-integration-readiness',
  gateScripts: frameworkIntegrationReadinessGateScripts,
  requiredManifestPaths: frameworkIntegrationReadinessRequiredManifestPaths,
  assertManifestMetadata: assertFrameworkIntegrationReadinessManifestMetadata,
  assertRelease: assertFrameworkIntegrationReadinessRelease,
});
