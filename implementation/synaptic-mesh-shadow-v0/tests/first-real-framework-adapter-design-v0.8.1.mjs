
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const designPath = resolve(repoRoot, 'design-notes/first-real-framework-adapter-design-v0.8.1.md');
const comparisonPath = resolve(repoRoot, 'docs/framework-adapter-candidate-comparison.md');
const evidencePath = resolve(packageRoot, 'evidence/first-real-framework-adapter-design-v0.8.1.out.json');

const design = await readFile(designPath, 'utf8');
const comparison = await readFile(comparisonPath, 'utf8');
const designLower = design.toLowerCase();

const requiredPhrases = [
  'Status: design-only',
  'Candidate: `mcp_read_only_candidate`',
  'No implementation',
  'No SDK imports',
  'No MCP server/client',
  'No tool calls',
  'No resource fetch',
  'No network or live traffic',
  'No memory/config writes',
  'No machine-readable policy',
  'No approval/block/allow',
  'No enforcement',
  'release:check -- --target v0.8.1',
];
const forbiddenPhrases = [
  'implementation is authorized',
  'runtime authorization is granted',
  'framework integration is authorized',
  'agents may consume this as policy',
  'may enforce',
  'production ready',
  'safety certified',
];
const comparisonPhrases = ['MCP-like', 'LangGraph-like', 'A2A-like', 'GitHub-bot-like', 'implementation allowed: no'];

const missingRequiredPhrases = requiredPhrases.filter((phrase) => !design.includes(phrase));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => designLower.includes(phrase.toLowerCase()));
const missingComparisonPhrases = comparisonPhrases.filter((phrase) => !comparison.includes(phrase));

assert.deepEqual(missingRequiredPhrases, [], 'design note must include all required boundary phrases');
assert.deepEqual(forbiddenPhraseFindings, [], 'design note must not overclaim implementation authority');
assert.deepEqual(missingComparisonPhrases, [], 'candidate comparison must include required candidate rows and implementation denial');

const summary = {
  firstRealFrameworkAdapterDesign: 'pass',
  releaseLayer: 'v0.8.1',
  designOnly: true,
  implementationAuthorized: false,
  selectedCandidate: 'mcp_read_only_candidate',
  requiredPhrases: requiredPhrases.length,
  missingRequiredPhrases: missingRequiredPhrases.length,
  missingComparisonPhrases: missingComparisonPhrases.length,
  forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  sdkImported: false,
  networkAllowed: false,
  toolExecution: false,
  resourceFetch: false,
  runtimeAuthorized: false,
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

for (const field of ['missingRequiredPhrases', 'missingComparisonPhrases', 'forbiddenPhraseFindings']) assert.equal(summary[field], 0, `${field} must be zero`);
for (const field of ['implementationAuthorized', 'sdkImported', 'networkAllowed', 'toolExecution', 'resourceFetch', 'runtimeAuthorized', 'memoryWrite', 'configWrite', 'externalPublication', 'agentConsumed', 'machineReadablePolicyDecision', 'approvalEmission', 'mayBlock', 'mayAllow', 'authorization', 'enforcement']) assert.equal(summary[field], false, `${field} must remain false`);

const output = {
  artifact: 'T-synaptic-mesh-first-real-framework-adapter-design-v0.8.1',
  timestamp: '2026-05-14T18:56:00.000Z',
  summary,
  boundary: [
    'design_note_only',
    'mcp_read_only_candidate_design_only',
    'no_adapter_code',
    'no_sdk',
    'no_mcp_server_client',
    'no_network',
    'no_resource_fetch',
    'no_tools',
    'no_runtime',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_agent_consumption',
    'no_machine_policy',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement'
  ]
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
