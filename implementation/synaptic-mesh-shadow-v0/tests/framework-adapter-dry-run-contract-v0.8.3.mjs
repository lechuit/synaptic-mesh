
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const schemaPath = resolve(repoRoot, 'schemas/framework-adapter-dry-run-contract.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/framework-adapter-dry-run-contract.json');
const docsPath = resolve(repoRoot, 'docs/framework-adapter-dry-run-contract-v0.8.3.md');
const evidencePath = resolve(packageRoot, 'evidence/framework-adapter-dry-run-contract-v0.8.3.out.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');
const falseCapabilityFields = ['realFrameworkAdapterImplemented','frameworkIntegrationAuthorized','sdkImported','mcpServerClientImplemented','networkUsed','resourceFetched','toolExecuted','runtimeExecuted','liveTrafficRead','watcherDaemonImplemented','memoryWritten','configWritten','publishedExternally','agentConsumed','machineReadablePolicyDecision','approvalEmitted','mayBlock','mayAllow','authorization','enforcement'];

function validateContract(contract) {
  const reasons = [];
  if (contract.schemaVersion !== 'framework-adapter-dry-run-contract-v0') reasons.push('schemaVersion mismatch');
  if (contract.releaseLayer !== 'v0.8.3') reasons.push('releaseLayer mismatch');
  if (contract.contractMode !== 'dry_run_record_only') reasons.push('contractMode must be dry_run_record_only');
  if (contract.candidateFramework !== 'mcp_read_only_candidate') reasons.push('candidateFramework must be mcp_read_only_candidate');
  if (contract.inputBoundary?.frameworkLikeLocalPacket !== true) reasons.push('frameworkLikeLocalPacket must be true');
  if (contract.inputBoundary?.alreadyRedacted !== true) reasons.push('alreadyRedacted must be true');
  if (contract.inputBoundary?.explicitLocalFileOnly !== true) reasons.push('explicitLocalFileOnly must be true');
  for (const field of ['liveTrafficAllowed','networkAllowed','resourceFetchAllowed','toolExecutionAllowed']) if (contract.inputBoundary?.[field] !== false) reasons.push(`${field} must be false`);
  const expectedPipeline = ['accept_explicit_local_already_redacted_framework_like_packet','validate_contract_boundary','produce_record_only_human_review_evidence'];
  if (JSON.stringify(contract.pipeline) !== JSON.stringify(expectedPipeline)) reasons.push('pipeline mismatch');
  for (const field of falseCapabilityFields) if (contract.capabilities?.[field] !== false) reasons.push(`${field} must be false`);
  if (contract.outputBoundary?.recordOnly !== true) reasons.push('recordOnly must be true');
  if (contract.outputBoundary?.humanReviewOnly !== true) reasons.push('humanReviewOnly must be true');
  if (contract.outputBoundary?.machineReadablePolicyDecision !== false) reasons.push('output machineReadablePolicyDecision must be false');
  if (contract.outputBoundary?.agentConsumed !== false) reasons.push('output agentConsumed must be false');
  return { accepted: reasons.length === 0, reasons };
}

const positive = validateContract(fixture);
assert.equal(positive.accepted, true, `fixture must validate: ${positive.reasons.join('; ')}`);

const negativeControls = [
  ['sdk_imported', (c) => { c.capabilities.sdkImported = true; }],
  ['mcp_server_client', (c) => { c.capabilities.mcpServerClientImplemented = true; }],
  ['network_allowed', (c) => { c.inputBoundary.networkAllowed = true; c.capabilities.networkUsed = true; }],
  ['resource_fetch', (c) => { c.inputBoundary.resourceFetchAllowed = true; c.capabilities.resourceFetched = true; }],
  ['tool_execution', (c) => { c.inputBoundary.toolExecutionAllowed = true; c.capabilities.toolExecuted = true; }],
  ['runtime_execution', (c) => { c.capabilities.runtimeExecuted = true; }],
  ['live_traffic', (c) => { c.inputBoundary.liveTrafficAllowed = true; c.capabilities.liveTrafficRead = true; }],
  ['watcher_daemon', (c) => { c.capabilities.watcherDaemonImplemented = true; }],
  ['memory_write', (c) => { c.capabilities.memoryWritten = true; }],
  ['config_write', (c) => { c.capabilities.configWritten = true; }],
  ['external_publication', (c) => { c.capabilities.publishedExternally = true; }],
  ['agent_consumed', (c) => { c.capabilities.agentConsumed = true; c.outputBoundary.agentConsumed = true; }],
  ['machine_policy', (c) => { c.capabilities.machineReadablePolicyDecision = true; c.outputBoundary.machineReadablePolicyDecision = true; }],
  ['approval', (c) => { c.capabilities.approvalEmitted = true; }],
  ['block_allow', (c) => { c.capabilities.mayBlock = true; c.capabilities.mayAllow = true; }],
  ['authorization_enforcement', (c) => { c.capabilities.authorization = true; c.capabilities.enforcement = true; }],
];
const negativeRows = negativeControls.map(([id, mutate]) => {
  const candidate = JSON.parse(JSON.stringify(fixture));
  mutate(candidate);
  const result = validateContract(candidate);
  return { id, accepted: result.accepted, reasons: result.reasons };
});
const unexpectedAccepts = negativeRows.filter((row) => row.accepted);
assert.deepEqual(unexpectedAccepts, [], 'negative controls must be rejected');

const requiredDocsPhrases = ['framework-like local/redacted packet','local validation','record-only evidence','No real framework adapter','No SDK import','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.3'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'docs must include dry-run boundary phrases');
assert.equal(schema.title, 'Framework Adapter Dry-Run Contract v0.8.3', 'schema title must identify v0.8.3');

const summary = {
  frameworkAdapterDryRunContract: 'pass', releaseLayer: 'v0.8.3', positiveCases: 1, negativeCases: negativeRows.length, unexpectedAccepts: unexpectedAccepts.length, missingDocsPhrases: missingDocsPhrases.length, contractMode: 'dry_run_record_only', frameworkLikeLocalPacket: true, recordOnly: true,
  realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, runtimeAuthorized: false, liveTraffic: false, watcherDaemon: false, memoryWrite: false, configWrite: false, externalPublication: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false,
};
for (const field of ['unexpectedAccepts','missingDocsPhrases']) assert.equal(summary[field], 0, `${field} must be zero`);
for (const field of ['realFrameworkAdapterImplemented','frameworkIntegrationAuthorized','sdkImported','networkAllowed','resourceFetch','toolExecution','runtimeAuthorized','liveTraffic','watcherDaemon','memoryWrite','configWrite','externalPublication','agentConsumed','machineReadablePolicyDecision','approvalEmission','mayBlock','mayAllow','authorization','enforcement']) assert.equal(summary[field], false, `${field} must remain false`);

const output = { artifact: 'T-synaptic-mesh-framework-adapter-dry-run-contract-v0.8.3', timestamp: '2026-05-14T18:56:00.000Z', summary, negativeRows, boundary: ['dry_run_contract_only','framework_like_local_redacted_packet_only','local_validation_only','record_only_evidence','no_real_framework_adapter','no_sdk_import','no_network','no_resource_fetch','no_tool_execution','no_runtime','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
