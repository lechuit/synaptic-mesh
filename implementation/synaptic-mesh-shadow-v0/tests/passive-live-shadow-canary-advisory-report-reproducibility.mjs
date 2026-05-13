import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-report-reproducibility-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/passive-live-shadow-canary-advisory-report-reproducibility.json');
const advisoryEvidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.json');
const advisoryReportPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report.out.md');
const failureCatalogPath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json');
const evidencePath = resolve(packageRoot, 'evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const baselineEvidence = JSON.parse(await readFile(advisoryEvidencePath, 'utf8'));
const baselineReport = await readFile(advisoryReportPath, 'utf8');
const failureCatalog = JSON.parse(await readFile(failureCatalogPath, 'utf8'));

assert.equal(fixture.releaseLayer, 'v0.3.3');
assert.equal(fixture.dependsOn, 'v0.3.2-advisory-report-failure-catalog');
assert.equal(fixture.mode, 'manual_local_advisory_report_reproducibility_drift_record_only');
assert.equal(fixture.runs, 2);
assert.equal(fixture.negativeControls.length, 6);
assert.equal(failureCatalog.summary.advisoryReportFailureCatalog, 'pass');
assert.equal(failureCatalog.summary.expectedRejects, 12);
assert.equal(failureCatalog.summary.unexpectedAccepts, 0);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function hash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(stable(value));
  return `sha256:${createHash('sha256').update(text).digest('hex')}`;
}

const requiredBoundaryFields = {
  advisoryOnly: true,
  humanReadableOnly: true,
  nonAuthoritative: true,
  machineReadablePolicyDecision: false,
  consumedByAgent: false,
  automaticAgentConsumptionImplemented: false,
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
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeRun() {
  const reportText = baselineReport;
  const reportTextHash = hash(reportText);
  const summary = clone(baselineEvidence.summary);
  const normalized = {
    summary,
    sourceEvidence: [...baselineEvidence.sourceEvidence],
    boundary: [...baselineEvidence.boundary],
    reportTextHash,
    reportBytes: Buffer.byteLength(reportText),
  };
  return {
    reportText,
    normalized,
    normalizedHash: hash(normalized),
  };
}

function evaluate(candidate) {
  const reasonCodes = [];
  const baseline = makeRun().normalized;
  if (candidate.reportBytes !== Buffer.byteLength(candidate.reportText)) reasonCodes.push('ADVISORY_REPORT_BYTE_COUNT_DRIFT');
  if (candidate.reportTextHash !== hash(candidate.reportText)) reasonCodes.push('ADVISORY_REPORT_TEXT_HASH_DRIFT');
  if (candidate.reportTextHash !== baseline.reportTextHash) reasonCodes.push('ADVISORY_REPORT_TEXT_HASH_DRIFT');
  if (candidate.reportBytes !== baseline.reportBytes) reasonCodes.push('ADVISORY_REPORT_BYTE_COUNT_DRIFT');
  if (hash(candidate.summary) !== hash(baseline.summary)) reasonCodes.push('ADVISORY_REPORT_SUMMARY_DRIFT');
  if (JSON.stringify(candidate.sourceEvidence) !== JSON.stringify(baseline.sourceEvidence)) reasonCodes.push('ADVISORY_REPORT_SOURCE_EVIDENCE_DRIFT');
  if (candidate.summary.reportPath !== baseline.summary.reportPath) reasonCodes.push('ADVISORY_REPORT_REPORT_PATH_DRIFT');
  for (const [field, expected] of Object.entries(requiredBoundaryFields)) {
    if (candidate.summary[field] !== expected) reasonCodes.push('ADVISORY_REPORT_AUTHORITY_BOUNDARY_DRIFT');
  }
  return [...new Set(reasonCodes)].sort();
}

const runs = Array.from({ length: fixture.runs }, (_, index) => ({ runId: `run-${index + 1}`, ...makeRun() }));
const normalizedOutputMismatches = runs.filter((run) => run.normalizedHash !== runs[0].normalizedHash).length;
assert.equal(normalizedOutputMismatches, 0, 'advisory report normalized output must be reproducible across local runs');
assert.equal(runs[0].normalized.reportBytes, baselineEvidence.summary.reportBytes, 'normalized report bytes must match advisory evidence summary');
assert.equal(runs[0].normalized.reportBytes, Buffer.byteLength(baselineReport), 'normalized report bytes must match committed markdown');
assert.equal(runs[0].normalized.reportTextHash, hash(baselineReport), 'report text hash must bind committed markdown');
assert.deepEqual(evaluate({ ...runs[0].normalized, reportText: baselineReport }), [], 'baseline advisory report must have zero reproducibility drift reasons');

const negativeResults = fixture.negativeControls.map((control) => {
  const candidate = clone(runs[0].normalized);
  let reportText = baselineReport;
  if (control.mutateReportTextAppend) reportText += control.mutateReportTextAppend;
  if (control.mutateSummary) candidate.summary = { ...candidate.summary, ...control.mutateSummary };
  if (control.reverseSourceEvidence) candidate.sourceEvidence = [...candidate.sourceEvidence].reverse();
  candidate.reportText = reportText;
  candidate.reportBytes = candidate.summary.reportBytes ?? candidate.reportBytes;
  const reasonCodes = evaluate(candidate);
  return { controlId: control.controlId, accepted: reasonCodes.length === 0, reasonCodes };
});

for (const [index, result] of negativeResults.entries()) {
  const expected = fixture.negativeControls[index].expectedReasonCodes;
  assert.equal(result.accepted, false, `${result.controlId} must reject`);
  for (const code of expected) assert.ok(result.reasonCodes.includes(code), `${result.controlId} must include ${code}; got ${result.reasonCodes.join(', ')}`);
}

const unexpectedAccepts = negativeResults.filter((result) => result.accepted).length;
const expectedReasonCodeMisses = negativeResults.reduce((count, result, index) => {
  const expected = fixture.negativeControls[index].expectedReasonCodes;
  return count + expected.filter((code) => !result.reasonCodes.includes(code)).length;
}, 0);

const summary = {
  artifact,
  timestamp: '2026-05-13T05:15:00.000Z',
  advisoryReportReproducibility: 'pass',
  verdict: 'pass',
  releaseLayer: fixture.releaseLayer,
  dependsOn: fixture.dependsOn,
  mode: fixture.mode,
  runs: fixture.runs,
  negativeControls: fixture.negativeControls.length,
  normalizedOutputMismatches,
  committedMarkdownBytes: Buffer.byteLength(baselineReport),
  advisorySummaryReportBytes: baselineEvidence.summary.reportBytes,
  reportTextHash: runs[0].normalized.reportTextHash,
  normalizedOutputHash: runs[0].normalizedHash,
  expectedRejects: fixture.negativeControls.length,
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
  safetyClaimScope: 'advisory_report_reproducibility_drift_only_not_authority_not_runtime_not_agent_consumed',
};

assert.equal(summary.runs, 2);
assert.equal(summary.negativeControls, 6);
assert.equal(summary.expectedRejects, 6);
assert.equal(summary.unexpectedAccepts, 0);
assert.equal(summary.expectedReasonCodeMisses, 0);
assert.equal(summary.normalizedOutputMismatches, 0);
assert.equal(summary.committedMarkdownBytes, summary.advisorySummaryReportBytes);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.consumedByAgent, false);
assert.equal(summary.mayBlock, false);
assert.equal(summary.mayAllow, false);

const output = {
  summary,
  runs: runs.map((run) => ({
    runId: run.runId,
    reportTextHash: run.normalized.reportTextHash,
    normalizedOutputHash: run.normalizedHash,
    reportBytes: run.normalized.reportBytes,
  })),
  negativeResults,
  boundary: [
    'manual_local_reproducibility_only',
    'committed_human_readable_report_only',
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
