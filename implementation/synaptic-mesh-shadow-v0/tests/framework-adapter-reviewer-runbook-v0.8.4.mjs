
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const runbookPath = resolve(repoRoot, 'docs/framework-adapter-reviewer-runbook-v0.8.4.md');
const evidencePath = resolve(packageRoot, 'evidence/framework-adapter-reviewer-runbook-v0.8.4.out.json');
const runbook = await readFile(runbookPath, 'utf8');

const centralPhrase = 'Framework dry-run evidence is not framework authorization.';
const requiredSections = ['## 1. Purpose','## 2. Quick boundary','## 3. Preflight','## 4. Run local validation','## 5. Read the evidence','## 6. NO-GO triggers','## 7. Human decision checkpoint','## 8. What this does not authorize'];
const requiredPhrases = [centralPhrase,'No real framework adapter','No SDK imports','No MCP server/client','No network','No resource fetch','No tool execution','No agent consumption','No machine-readable policy','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.8.4','does not authorize real framework integration'];
const forbiddenPhrases = ['implementation is authorized','framework integration is authorized','runtime authorization is granted','may enforce','production ready','safety certified'];

const missingRequiredSections = requiredSections.filter((section) => !runbook.includes(section));
const missingRequiredPhrases = requiredPhrases.filter((phrase) => !runbook.includes(phrase));
const forbiddenPhraseFindings = forbiddenPhrases.filter((phrase) => runbook.toLowerCase().includes(phrase.toLowerCase()));

assert.deepEqual(missingRequiredSections, [], 'runbook must include all required sections');
assert.deepEqual(missingRequiredPhrases, [], 'runbook must include all required phrases');
assert.deepEqual(forbiddenPhraseFindings, [], 'runbook must not overclaim authority');

const summary = {
  frameworkAdapterReviewerRunbook: 'pass', releaseLayer: 'v0.8.4', centralPhrasePresent: runbook.includes(centralPhrase), requiredSections: requiredSections.length, missingRequiredSections: missingRequiredSections.length, requiredPhrases: requiredPhrases.length, missingRequiredPhrases: missingRequiredPhrases.length, forbiddenPhraseFindings: forbiddenPhraseFindings.length,
  realFrameworkAdapterImplemented: false, frameworkIntegrationAuthorized: false, sdkImported: false, networkAllowed: false, resourceFetch: false, toolExecution: false, runtimeAuthorized: false, liveTraffic: false, watcherDaemon: false, memoryWrite: false, configWrite: false, externalPublication: false, agentConsumed: false, machineReadablePolicyDecision: false, approvalEmission: false, mayBlock: false, mayAllow: false, authorization: false, enforcement: false,
};
assert.equal(summary.centralPhrasePresent, true, 'central phrase must be present');
for (const field of ['missingRequiredSections','missingRequiredPhrases','forbiddenPhraseFindings']) assert.equal(summary[field], 0, `${field} must be zero`);
for (const field of ['realFrameworkAdapterImplemented','frameworkIntegrationAuthorized','sdkImported','networkAllowed','resourceFetch','toolExecution','runtimeAuthorized','liveTraffic','watcherDaemon','memoryWrite','configWrite','externalPublication','agentConsumed','machineReadablePolicyDecision','approvalEmission','mayBlock','mayAllow','authorization','enforcement']) assert.equal(summary[field], false, `${field} must remain false`);

const output = { artifact: 'T-synaptic-mesh-framework-adapter-reviewer-runbook-v0.8.4', timestamp: '2026-05-14T18:56:00.000Z', summary, boundary: ['human_reviewer_runbook_only','framework_dry_run_evidence_is_not_framework_authorization','no_real_framework_adapter','no_sdk_import','no_network','no_resource_fetch','no_tool_execution','no_runtime','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement'] };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
