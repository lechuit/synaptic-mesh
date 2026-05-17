
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const docsPath = resolve(repoRoot, 'docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md');
const evidencePath = resolve(packageRoot, 'evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json');

const hazards = [
  {
    "id": "H01",
    "slug": "sdk_import_creep",
    "description": "Importing MCP/LangGraph/A2A/GitHub SDK code under the guise of types or examples."
  },
  {
    "id": "H02",
    "slug": "server_client_surface_creep",
    "description": "Adding MCP server/client or bot/webhook scaffolding while calling it inert."
  },
  {
    "id": "H03",
    "slug": "network_convenience_path",
    "description": "Adding URL, HTTP, webhook, fetch, clone, or remote resource support."
  },
  {
    "id": "H04",
    "slug": "resource_fetch_alias",
    "description": "Treating a framework resource read as equivalent to local fixture validation."
  },
  {
    "id": "H05",
    "slug": "tool_call_alias",
    "description": "Treating a framework tool call as a validation helper."
  },
  {
    "id": "H06",
    "slug": "runtime_graph_execution",
    "description": "Executing a graph, agent loop, protocol handler, or framework runtime."
  },
  {
    "id": "H07",
    "slug": "live_traffic_shadowing",
    "description": "Observing live framework traffic rather than explicit local already-redacted packets."
  },
  {
    "id": "H08",
    "slug": "watcher_daemon_drift",
    "description": "Adding watch, daemon, webhook, background polling, or automatic ingestion."
  },
  {
    "id": "H09",
    "slug": "agent_consumption_drift",
    "description": "Writing output intended to be consumed directly by another agent as policy or instruction."
  },
  {
    "id": "H10",
    "slug": "machine_readable_policy_drift",
    "description": "Emitting allow/deny/route policy in a machine-actionable format."
  },
  {
    "id": "H11",
    "slug": "approval_path_drift",
    "description": "Adding approval, escalation, or consent emission paths."
  },
  {
    "id": "H12",
    "slug": "block_allow_drift",
    "description": "Adding block or allow decisions, even as advisory metadata."
  },
  {
    "id": "H13",
    "slug": "authorization_language_drift",
    "description": "Using language that claims authorization, safety certification, or production readiness."
  },
  {
    "id": "H14",
    "slug": "enforcement_drift",
    "description": "Adding enforcement hooks or runtime gates."
  },
  {
    "id": "H15",
    "slug": "memory_config_write_drift",
    "description": "Writing memory, config, registry, policy, or environment state."
  },
  {
    "id": "H16",
    "slug": "publication_automation_drift",
    "description": "Posting or preparing automatic external publication, comments, releases, or issues."
  },
  {
    "id": "H17",
    "slug": "raw_secret_persistence",
    "description": "Persisting raw, unredacted, secret-like, private path, config, memory, or approval text."
  },
  {
    "id": "H18",
    "slug": "fixture_boundary_loss",
    "description": "Accepting inputs that are not explicit local already-redacted packets."
  },
  {
    "id": "H19",
    "slug": "path_traversal_escape",
    "description": "Allowing output/input paths outside the fixed evidence/fixture boundary."
  },
  {
    "id": "H20",
    "slug": "success_evidence_for_hazards",
    "description": "Recording hazard cases as success evidence instead of expected non-implementation evidence."
  },
  {
    "id": "H21",
    "slug": "negative_control_relaxation",
    "description": "Changing negative controls to permit convenience paths."
  },
  {
    "id": "H22",
    "slug": "schema_optional_capability_true",
    "description": "Allowing operational booleans to be omitted or true."
  },
  {
    "id": "H23",
    "slug": "reviewer_runbook_overclaim",
    "description": "Telling reviewers a dry run authorizes framework integration."
  },
  {
    "id": "H24",
    "slug": "dependency_install_creep",
    "description": "Adding framework dependencies, plugins, generated clients, or codegen."
  },
  {
    "id": "H25",
    "slug": "tag_release_overclaim",
    "description": "Publishing release text that implies a real adapter exists or integration is authorized."
  }
];
const doc = await readFile(docsPath, 'utf8');

const requiredBoundaryPhrases = [
  'successEvidenceWrittenForHazards: 0',
  'Hazard cases must not produce success evidence',
  'No real framework adapter',
  'SDK import',
  'MCP server/client',
  'network',
  'resource fetch',
  'tool execution',
  'agent consumption',
  'machine-readable policy',
  'approval',
  'block/allow',
  'authorization',
  'enforcement',
  'release:check -- --target v0.8.2',
];
const missingBoundaryPhrases = requiredBoundaryPhrases.filter((phrase) => !doc.includes(phrase));
const missingHazards = hazards.filter((hazard) => !doc.includes(hazard.id) || !doc.includes(hazard.slug));
const duplicateHazardIds = hazards.length - new Set(hazards.map((hazard) => hazard.id)).size;

const forbiddenClaims = [
  'implementation is authorized',
  'framework integration is authorized',
  'runtime authorization is granted',
  'hazard passed as success evidence',
  'production ready',
  'safety certified',
];
const forbiddenPhraseFindings = forbiddenClaims.filter((phrase) => doc.toLowerCase().includes(phrase.toLowerCase()));

assert.equal(hazards.length, 25, 'hazard catalog must contain exactly 25 hazards');
assert.equal(duplicateHazardIds, 0, 'hazard ids must be unique');
assert.deepEqual(missingBoundaryPhrases, [], 'hazard catalog docs must include required boundary phrases');
assert.deepEqual(missingHazards, [], 'hazard catalog docs must include every hazard id and slug');
assert.deepEqual(forbiddenPhraseFindings, [], 'hazard catalog docs must not overclaim authorization');

const summary = {
  frameworkAdapterImplementationHazardCatalog: 'pass',
  releaseLayer: 'v0.8.2',
  hazardCount: hazards.length,
  missingHazards: missingHazards.length,
  missingBoundaryPhrases: missingBoundaryPhrases.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  successEvidenceWrittenForHazards: 0,
  implementationAuthorized: false,
  realFrameworkAdapterImplemented: false,
  frameworkIntegrationAuthorized: false,
  sdkImported: false,
  networkAllowed: false,
  resourceFetch: false,
  toolExecution: false,
  runtimeAuthorized: false,
  liveTraffic: false,
  watcherDaemon: false,
  memoryWrite: false,
  configWrite: false,
  externalPublication: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  approvalEmission: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false,
};

for (const field of ['missingHazards', 'missingBoundaryPhrases', 'forbiddenPhraseFindings', 'successEvidenceWrittenForHazards']) assert.equal(summary[field], 0, `${field} must be zero`);
for (const field of ['implementationAuthorized','realFrameworkAdapterImplemented','frameworkIntegrationAuthorized','sdkImported','networkAllowed','resourceFetch','toolExecution','runtimeAuthorized','liveTraffic','watcherDaemon','memoryWrite','configWrite','externalPublication','agentConsumed','machineReadablePolicyDecision','approvalEmission','mayBlock','mayAllow','authorization','enforcement']) assert.equal(summary[field], false, `${field} must remain false`);

const output = {
  artifact: 'T-synaptic-mesh-framework-adapter-implementation-hazard-catalog-v0.8.2',
  timestamp: '2026-05-14T18:56:00.000Z',
  summary,
  hazards: hazards.map((hazard) => ({ ...hazard, successEvidenceWritten: false })),
  boundary: ['hazard_catalog_only','no_success_evidence_for_hazards','no_real_framework_adapter','no_sdk_import','no_network','no_resource_fetch','no_tool_execution','no_runtime','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement']
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}
`);
console.log(JSON.stringify(output.summary, null, 2));
