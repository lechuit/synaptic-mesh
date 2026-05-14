import { readFileSync } from 'node:fs';
import path from 'node:path';

export const frameworkShapedAdapterGateScripts = Object.freeze([
  'test:framework-shaped-adapter-boundary-schema',
]);

export const frameworkShapedAdapterRequiredManifestPaths = Object.freeze([
  'tools/release-checks/framework-shaped-adapter.mjs',
  'schemas/framework-shaped-adapter-boundary.schema.json',
  'docs/framework-shaped-adapter-boundary.md',
  'docs/status-v0.7.0-alpha.md',
  'docs/repo-structure.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/framework-shaped-adapter-boundaries.json',
  'implementation/synaptic-mesh-shadow-v0/tests/framework-shaped-adapter-boundary-schema.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/framework-shaped-adapter-boundary-schema.out.json',
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
  if (manifestReleaseTag !== 'v0.7.0-alpha') return;

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
    'no_approval_blocking_allowing_authorization_deletion_retention_scheduler_or_enforcement',
  ], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertFrameworkShapedAdapterRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
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
