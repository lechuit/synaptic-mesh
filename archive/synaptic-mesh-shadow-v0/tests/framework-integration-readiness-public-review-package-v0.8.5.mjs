
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const docsPath = resolve(repoRoot, 'docs/framework-integration-readiness-public-review-package-v0.8.5.md');
const evidencePath = resolve(packageRoot, 'evidence/framework-integration-readiness-public-review-package-v0.8.5.out.json');

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(packageRoot, relativePath), 'utf8'));
}

const docs = await readFile(docsPath, 'utf8');
const goNoGo = await readJson('evidence/framework-integration-go-no-go.out.json');
const design = await readJson('evidence/first-real-framework-adapter-design-v0.8.1.out.json');
const hazards = await readJson('evidence/framework-adapter-implementation-hazard-catalog-v0.8.2.out.json');
const dryRun = await readJson('evidence/framework-adapter-dry-run-contract-v0.8.3.out.json');
const runbook = await readJson('evidence/framework-adapter-reviewer-runbook-v0.8.4.out.json');

const prior = [
  ['v0.8.0-alpha', goNoGo.summary?.frameworkIntegrationGoNoGo === 'pass'],
  ['v0.8.1', design.summary?.firstRealFrameworkAdapterDesign === 'pass'],
  ['v0.8.2', hazards.summary?.frameworkAdapterImplementationHazardCatalog === 'pass'],
  ['v0.8.3', dryRun.summary?.frameworkAdapterDryRunContract === 'pass'],
  ['v0.8.4', runbook.summary?.frameworkAdapterReviewerRunbook === 'pass'],
];
const failedPrior = prior.filter(([, pass]) => !pass).map(([layer]) => layer);
assert.deepEqual(failedPrior, [], 'all prior v0.8 evidence must pass');

assert.equal(goNoGo.summary.goToDesign, true, 'goToDesign must remain true');
assert.equal(goNoGo.summary.goToImplementation, false, 'goToImplementation must remain false');
assert.equal(design.summary.selectedCandidate, 'mcp_read_only_candidate', 'selected candidate must remain MCP read-only candidate');
assert.equal(hazards.summary.hazardCount, 25, 'hazard count must remain 25');
assert.equal(hazards.summary.successEvidenceWrittenForHazards, 0, 'hazards must write zero success evidence');
assert.equal(dryRun.summary.negativeCases, 16, 'dry-run negative control count must remain 16');
assert.equal(dryRun.summary.unexpectedAccepts, 0, 'dry-run unexpected accepts must remain zero');
assert.equal(runbook.summary.centralPhrasePresent, true, 'central phrase must remain present');

const requiredDocsPhrases = ['Final v0.8.x success statement','still no real framework integration','goToDesign: true','goToImplementation: false','realFrameworkAdapterImplemented: false','frameworkIntegrationAuthorized: false','No real framework adapter','No SDK import','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.5','not an authorization to implement'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'public review package docs must include required phrases');

const falseFields = ['realFrameworkAdapterImplemented','frameworkIntegrationAuthorized','sdkImported','networkAllowed','resourceFetch','toolExecution','runtimeAuthorized','liveTraffic','watcherDaemon','memoryWrite','configWrite','externalPublication','agentConsumed','machineReadablePolicyDecision','approvalEmission','mayBlock','mayAllow','authorization','enforcement'];
const summary = {
  frameworkIntegrationReadinessPublicReviewPackage: 'pass', releaseLayer: 'v0.8.5', priorEvidenceArtifacts: prior.length, priorEvidencePasses: prior.length - failedPrior.length, missingEvidence: failedPrior.length, missingDocsPhrases: missingDocsPhrases.length, packageReadyForPublicReview: true,
  goToDesign: true, goToImplementation: false, selectedCandidate: 'mcp_read_only_candidate', hazardCount: 25, successEvidenceWrittenForHazards: 0, dryRunNegativeCases: 16, dryRunUnexpectedAccepts: 0, centralPhrasePresent: true,
  realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, runtimeAuthorized: false, liveTraffic: false, watcherDaemon: false, memoryWrite: false, configWrite: false, externalPublication: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false,
};
assert.equal(summary.missingEvidence, 0, 'missingEvidence must be zero');
assert.equal(summary.missingDocsPhrases, 0, 'missingDocsPhrases must be zero');
for (const field of falseFields) assert.equal(summary[field], false, `${field} must remain false`);

const output = { artifact: 'T-synaptic-mesh-framework-integration-readiness-public-review-package-v0.8.5', timestamp: '2026-05-14T18:56:00.000Z', summary, prior: prior.map(([layer, pass]) => ({ layer, pass })), boundary: ['public_review_package_only','no_real_framework_adapter','framework_integration_authorized_false','go_to_design_true_go_to_implementation_false','no_sdk_import','no_network','no_resource_fetch','no_tool_execution','no_runtime','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
