import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-decision-counterfactual-failure-catalog-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/decision-counterfactual-failure-catalog.json');
const evidencePath = resolve(packageRoot, 'evidence/decision-counterfactual-failure-catalog.out.json');

const catalog = JSON.parse(await readFile(fixturePath, 'utf8'));
const coreAllowSlots = ['exact_current_action', 'active_lane_source', 'local_boundary', 'blocked_effects', 'fallback_or_fetch_path'];
const forbiddenImplementationFlags = [
  'memoryWriteImplemented',
  'memoryAtomImplemented',
  'runtimeImplemented',
  'liveObserverImplemented',
  'adapterIntegrationImplemented',
  'toolAuthorizationImplemented',
  'externalPublicationImplemented',
  'enforcementImplemented',
];

function classify(entry) {
  const signals = new Set(entry.signals);
  const present = new Set(entry.presentSlots);
  if ([
    'wrong_lane_pressure',
    'paused_project_pressure',
    'runtime_promotion_pressure',
    'config_promotion_pressure',
    'publication_pressure',
    'memory_write_pressure',
  ].some((signal) => signals.has(signal))) return 'reject_sensitive_pressure';
  if (signals.has('stale_memory_thread') && signals.has('current_user_correction')) return 'retire_stale_memory_no_action';
  if (signals.has('mutable_external_fact') && !signals.has('source_verified')) return 'fetch_source_before_answer';
  if (signals.has('high_similarity_score') || signals.has('similarity_lure')) return 'fetch_or_abstain';
  if (signals.has('wall_clock_recency_only') || signals.has('recency_lure')) return 'fetch_or_abstain';
  if (coreAllowSlots.every((slot) => present.has(slot))) return 'allow_local_advisory';
  return 'fetch_or_abstain';
}

assert.equal(catalog.schemaVersion, 'decision-counterfactual-failure-catalog-v0.1');
assert.equal(catalog.mode, 'local_failure_catalog_only');
assert.equal(catalog.expectedRejects, 10);
assert.equal(catalog.cases.length, 10);
for (const boundary of ['no_memory_writes', 'no_memory_atom', 'no_runtime', 'no_live_observer', 'no_adapter_integration', 'no_tool_authorization', 'no_external_publication', 'no_enforcement']) {
  assert(catalog.boundary.includes(boundary), `boundary must include ${boundary}`);
}

const rows = catalog.cases.map((entry) => {
  const actualDecision = classify(entry);
  const allowed = actualDecision === 'allow_local_advisory';
  const expectedRejected = entry.expectedDecision !== 'allow_local_advisory';
  return {
    id: entry.id,
    expectedDecision: entry.expectedDecision,
    actualDecision,
    rejected: expectedRejected && !allowed,
    unexpectedAllow: expectedRejected && allowed,
    expectedReasonCodes: entry.expectedReasonCodes,
  };
});

for (const row of rows) assert.equal(row.actualDecision, row.expectedDecision, `${row.id} must classify as expected`);
const expectedRejects = rows.filter((row) => row.rejected).length;
const unexpectedAllows = rows.filter((row) => row.unexpectedAllow).length;
const unsafeAllows = rows.filter((row) => row.actualDecision === 'allow_local_advisory').length;
assert.equal(expectedRejects, 10);
assert.equal(unexpectedAllows, 0);
assert.equal(unsafeAllows, 0);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T03:45:00.000Z',
    decisionCounterfactualFailureCatalog: 'pass',
    verdict: 'pass',
    expectedRejects,
    cases: rows.length,
    unexpectedAllows,
    unsafeAllows,
    coreAllowTupleRequired: true,
    coveredPressures: catalog.cases.map((entry) => entry.id),
    memoryWriteImplemented: false,
    memoryAtomImplemented: false,
    runtimeImplemented: false,
    liveObserverImplemented: false,
    adapterIntegrationImplemented: false,
    toolAuthorizationImplemented: false,
    externalPublicationImplemented: false,
    enforcementImplemented: false,
  },
  rows,
  boundary: catalog.boundary,
};

for (const flag of forbiddenImplementationFlags) assert.equal(output.summary[flag], false, `${flag} must remain false`);

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
