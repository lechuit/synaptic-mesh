import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-decision-counterfactual-reproducibility-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/decision-counterfactual-reproducibility.out.json');
const checklistTest = resolve(here, 'decision-counterfactual-checklist.mjs');

function runChecklist() {
  const stdout = execFileSync(process.execPath, [checklistTest], {
    cwd: packageRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(stdout);
}

function normalizeChecklistOutput(output) {
  return {
    summary: {
      verdict: output.summary.verdict,
      fixtureCount: output.summary.fixtureCount,
      passCount: output.summary.passCount,
      unsafeAllows: output.summary.unsafeAllows,
      negativeControlCount: output.summary.negativeControlCount,
      sourceExperiments: output.summary.sourceExperiments,
      reasonCodesCovered: output.summary.reasonCodesCovered,
      coreAllowTupleRequired: output.summary.coreAllowTupleRequired,
      allowCaseCount: output.summary.allowCaseCount,
      memoryWriteImplemented: output.summary.memoryWriteImplemented,
      memoryAtomImplemented: output.summary.memoryAtomImplemented,
      runtimeImplemented: output.summary.runtimeImplemented,
      liveObserverImplemented: output.summary.liveObserverImplemented,
      adapterIntegrationImplemented: output.summary.adapterIntegrationImplemented,
      toolAuthorizationImplemented: output.summary.toolAuthorizationImplemented,
      externalPublicationImplemented: output.summary.externalPublicationImplemented,
      enforcementImplemented: output.summary.enforcementImplemented,
      safetyClaimScope: output.summary.safetyClaimScope,
    },
    cases: output.cases.map((entry) => ({
      id: entry.id,
      expectedDecision: entry.expectedDecision,
      actualDecision: entry.actualDecision,
      pass: entry.pass,
      expectedReasonCodes: entry.expectedReasonCodes,
    })),
    reasonCodesCovered: output.reasonCodesCovered,
    boundary: output.boundary,
  };
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const first = normalizeChecklistOutput(runChecklist());
const second = normalizeChecklistOutput(runChecklist());
const firstDigest = digest(first);
const secondDigest = digest(second);

assert.equal(first.summary.verdict, 'pass');
assert.equal(first.summary.fixtureCount, 16);
assert.equal(first.summary.passCount, 16);
assert.equal(first.summary.unsafeAllows, 0);
assert.equal(first.summary.coreAllowTupleRequired, true);
assert.equal(first.summary.memoryWriteImplemented, false);
assert.equal(first.summary.memoryAtomImplemented, false);
assert.equal(first.summary.runtimeImplemented, false);
assert.equal(first.summary.liveObserverImplemented, false);
assert.equal(first.summary.adapterIntegrationImplemented, false);
assert.equal(first.summary.toolAuthorizationImplemented, false);
assert.equal(first.summary.externalPublicationImplemented, false);
assert.equal(first.summary.enforcementImplemented, false);
assert.equal(firstDigest, secondDigest, 'normalized checklist outputs must be reproducible across repeated runs');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T03:35:00.000Z',
    decisionCounterfactualReproducibility: 'pass',
    verdict: 'pass',
    runs: 2,
    fixtures: first.summary.fixtureCount,
    passCount: first.summary.passCount,
    normalizedOutputMismatches: firstDigest === secondDigest ? 0 : 1,
    unsafeAllows: first.summary.unsafeAllows,
    coreAllowTupleRequired: first.summary.coreAllowTupleRequired,
    checklistDigest: firstDigest,
    memoryWriteImplemented: false,
    memoryAtomImplemented: false,
    runtimeImplemented: false,
    liveObserverImplemented: false,
    adapterIntegrationImplemented: false,
    toolAuthorizationImplemented: false,
    externalPublicationImplemented: false,
    enforcementImplemented: false,
  },
  runs: [
    { run: 1, normalizedOutputDigest: firstDigest },
    { run: 2, normalizedOutputDigest: secondDigest },
  ],
  boundary: [
    'local_node_only',
    'reuses_committed_fixture_set',
    'no_memory_writes',
    'no_memory_atom',
    'no_runtime',
    'no_live_observer',
    'no_adapter_integration',
    'no_tool_authorization',
    'no_external_publication',
    'no_enforcement',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
