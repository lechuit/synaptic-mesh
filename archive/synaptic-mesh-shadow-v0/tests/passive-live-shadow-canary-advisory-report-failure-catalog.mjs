import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-report-failure-catalog-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-advisory-report-failure-catalog.json');
const advisoryEvidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.json');
const advisoryReportPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.md');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const baselineEvidence = JSON.parse(await readFile(advisoryEvidencePath, 'utf8'));
const baselineReport = await readFile(advisoryReportPath, 'utf8');

assert.equal(fixture.releaseLayer, 'v0.3.2');
assert.equal(fixture.dependsOn, 'v0.3.1-advisory-unicode-bidi-guard');
assert.equal(fixture.mode, 'manual_local_advisory_report_failure_catalog_record_only');
assert.equal(fixture.rejectCases.length, 12);
assert.equal(baselineEvidence.summary.machineReadablePolicyDecision, false);
assert.equal(baselineEvidence.summary.consumedByAgent, false);
assert.equal(baselineEvidence.summary.nonAuthoritative, true);
assert.equal(baselineEvidence.summary.humanReadableOnly, true);

const authorityFlagFields = [
  ['machineReadablePolicyDecision', 'ADVISORY_REPORT_MACHINE_POLICY_FORBIDDEN'],
  ['consumedByAgent', 'ADVISORY_REPORT_AGENT_CONSUMPTION_FORBIDDEN'],
  ['automaticAgentConsumptionImplemented', 'ADVISORY_REPORT_AGENT_CONSUMPTION_FORBIDDEN'],
  ['authoritative', 'ADVISORY_REPORT_AUTHORITY_FLAG_FORBIDDEN'],
  ['mayApprove', 'ADVISORY_REPORT_APPROVAL_PATH_FORBIDDEN'],
  ['approvalPathImplemented', 'ADVISORY_REPORT_APPROVAL_PATH_FORBIDDEN'],
  ['mayBlock', 'ADVISORY_REPORT_BLOCK_ALLOW_FLAG_FORBIDDEN'],
  ['blockingImplemented', 'ADVISORY_REPORT_BLOCK_ALLOW_FLAG_FORBIDDEN'],
  ['mayAllow', 'ADVISORY_REPORT_BLOCK_ALLOW_FLAG_FORBIDDEN'],
  ['allowingImplemented', 'ADVISORY_REPORT_BLOCK_ALLOW_FLAG_FORBIDDEN'],
  ['mayAuthorize', 'ADVISORY_REPORT_AUTHORIZATION_FORBIDDEN'],
  ['authorizationImplemented', 'ADVISORY_REPORT_AUTHORIZATION_FORBIDDEN'],
  ['mayEnforce', 'ADVISORY_REPORT_ENFORCEMENT_FORBIDDEN'],
  ['enforcementImplemented', 'ADVISORY_REPORT_ENFORCEMENT_FORBIDDEN'],
  ['mayExecuteTool', 'ADVISORY_REPORT_TOOL_COMMAND_FORBIDDEN'],
  ['toolExecutionImplemented', 'ADVISORY_REPORT_TOOL_COMMAND_FORBIDDEN'],
  ['mayWriteMemory', 'ADVISORY_REPORT_MEMORY_WRITE_COMMAND_FORBIDDEN'],
  ['memoryWriteImplemented', 'ADVISORY_REPORT_MEMORY_WRITE_COMMAND_FORBIDDEN'],
  ['mayWriteConfig', 'ADVISORY_REPORT_CONFIG_WRITE_COMMAND_FORBIDDEN'],
  ['configWriteImplemented', 'ADVISORY_REPORT_CONFIG_WRITE_COMMAND_FORBIDDEN'],
  ['mayPublishExternally', 'ADVISORY_REPORT_PUBLICATION_AUTOMATION_FORBIDDEN'],
  ['externalPublicationImplemented', 'ADVISORY_REPORT_PUBLICATION_AUTOMATION_FORBIDDEN'],
  ['mayMutateAgentInstruction', 'ADVISORY_REPORT_AGENT_INSTRUCTION_MUTATION_FORBIDDEN'],
  ['agentInstructionWriteImplemented', 'ADVISORY_REPORT_AGENT_INSTRUCTION_MUTATION_FORBIDDEN'],
];

const textRules = [
  [/\bapprove this action\b|\bapproved for execution\b|\bapproval instruction\b/i, 'ADVISORY_REPORT_APPROVAL_LANGUAGE_FORBIDDEN'],
  [/\bblock unsafe\b|\ballow safe\b|\bblock\/allow\b|\bdeny requests\b/i, 'ADVISORY_REPORT_BLOCK_ALLOW_LANGUAGE_FORBIDDEN'],
  [/\brun tool\b|\bexecute tool\b|\bshell to\b|\btool command\b/i, 'ADVISORY_REPORT_TOOL_COMMAND_FORBIDDEN'],
  [/\bwrite (this result|.*) to memory\b|\bmemory write\b/i, 'ADVISORY_REPORT_MEMORY_WRITE_COMMAND_FORBIDDEN'],
  [/\bupdate config\b|\bwrite config\b|\bconfig write\b/i, 'ADVISORY_REPORT_CONFIG_WRITE_COMMAND_FORBIDDEN'],
  [/\bpublish this report externally\b|\bauto-publish\b/i, 'ADVISORY_REPORT_PUBLICATION_AUTOMATION_FORBIDDEN'],
  [/\breplace the agent instructions\b|\bagent instruction mutation\b|\bwrite agent instructions\b/i, 'ADVISORY_REPORT_AGENT_INSTRUCTION_MUTATION_FORBIDDEN'],
  [/\bthis report is authority\b|\buse this report as authority\b/i, 'ADVISORY_REPORT_AUTHORITY_LANGUAGE_FORBIDDEN'],
  [/\bauthorize this action\b|\bauthorization granted\b/i, 'ADVISORY_REPORT_AUTHORIZATION_FORBIDDEN'],
  [/\benforce this report\b|\benforcement instruction\b/i, 'ADVISORY_REPORT_ENFORCEMENT_FORBIDDEN'],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function candidateFor(control) {
  const summary = { ...clone(baselineEvidence.summary), ...(control.mutateSummary ?? {}) };
  let reportText = baselineReport;
  for (const text of control.removeReportText ?? []) reportText = reportText.replaceAll(text, '');
  if (control.appendReportText) reportText += control.appendReportText;
  return { summary, reportText };
}

function evaluate(candidate) {
  const reasonCodes = [];
  for (const [field, reasonCode] of authorityFlagFields) {
    if (candidate.summary[field] === true) reasonCodes.push(reasonCode);
  }
  if (candidate.summary.nonAuthoritative !== true || !candidate.reportText.includes('Advisory no es authority')) {
    reasonCodes.push('ADVISORY_REPORT_NON_AUTHORITY_DISCLAIMER_REQUIRED');
  }
  if (candidate.summary.humanReadableOnly !== true || !candidate.reportText.includes('human-readable evidence')) {
    reasonCodes.push('ADVISORY_REPORT_HUMAN_READABLE_ONLY_REQUIRED');
  }
  for (const [pattern, reasonCode] of textRules) {
    if (pattern.test(candidate.reportText)) reasonCodes.push(reasonCode);
  }
  return [...new Set(reasonCodes)].sort();
}

const baselineReasonCodes = evaluate({ summary: baselineEvidence.summary, reportText: baselineReport });
assert.deepEqual(baselineReasonCodes, [], 'baseline advisory report must not trip misuse failure catalog');

const rejectResults = fixture.rejectCases.map((control) => {
  const reasonCodes = evaluate(candidateFor(control));
  const accepted = reasonCodes.length === 0;
  return { caseId: control.caseId, accepted, reasonCodes };
});

for (const [index, result] of rejectResults.entries()) {
  const expected = fixture.rejectCases[index].expectedReasonCodes;
  assert.equal(result.accepted, false, `${result.caseId} must reject`);
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.caseId} must include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const unexpectedAccepts = rejectResults.filter((result) => result.accepted).length;
const expectedReasonCodeMisses = rejectResults.reduce((count, result, index) => {
  const expected = fixture.rejectCases[index].expectedReasonCodes;
  return count + expected.filter((code) => !result.reasonCodes.includes(code)).length;
}, 0);

const summary = {
  artifact,
  timestamp: '2026-05-13T04:45:00.000Z',
  advisoryReportFailureCatalog: 'pass',
  verdict: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  mode: fixture.mode,
  expectedRejects: fixture.rejectCases.length,
  unexpectedAccepts,
  expectedReasonCodeMisses,
  machineReadablePolicyDecision: false,
  consumedByAgent: false,
  authoritative: false,
  mayApprove: false,
  mayBlock: false,
  mayAllow: false,
  mayAuthorize: false,
  mayEnforce: false,
  mayExecuteTool: false,
  mayWriteMemory: false,
  mayWriteConfig: false,
  mayPublishExternally: false,
  mayMutateAgentInstruction: false,
  runtimeIntegrated: false,
  toolExecutionImplemented: false,
  memoryWriteImplemented: false,
  configWriteImplemented: false,
  externalPublicationImplemented: false,
  approvalPathImplemented: false,
  blockingImplemented: false,
  allowingImplemented: false,
  authorizationImplemented: false,
  enforcementImplemented: false,
  automaticAgentConsumptionImplemented: false,
  safetyClaimScope: 'advisory_report_failure_catalog_only_not_authority_not_runtime_not_agent_consumed',
};

assert.equal(summary.expectedRejects, 12);
assert.equal(summary.unexpectedAccepts, 0);
assert.equal(summary.expectedReasonCodeMisses, 0);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.consumedByAgent, false);
assert.equal(summary.authoritative, false);
assert.equal(summary.mayBlock, false);
assert.equal(summary.mayAllow, false);

const output = {
  summary,
  rejectResults,
  boundary: [
    'manual_local_failure_catalog_only',
    'not_authority',
    'not_machine_policy',
    'not_agent_consumed',
    'no_runtime',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
