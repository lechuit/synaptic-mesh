import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-decision-counterfactual-checklist-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/decision-counterfactual-checklist.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/decision-counterfactual-checklist.json');
const evidencePath = resolve(packageRoot, 'evidence/decision-counterfactual-checklist.out.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const checklist = JSON.parse(await readFile(fixturePath, 'utf8'));
const requiredBoundary = [
  'local_markdown_json_node_only',
  'no_memory_writes',
  'no_memory_atom',
  'no_runtime',
  'no_live_observer',
  'no_adapter_integration',
  'no_tool_authorization',
  'no_publication',
  'no_enforcement',
];
const requiredSlots = [
  'exact_current_action',
  'active_lane_source',
  'local_boundary',
  'blocked_effects',
  'fallback_or_fetch_path',
  'new_user_correction',
  'mutable_external_fact_status',
];
const forbiddenPromotions = [
  'memory_write',
  'MemoryAtom',
  'runtime',
  'live_observer',
  'adapter_integration',
  'tool_authorization',
  'publication',
  'enforcement',
];

assert.equal(schema.title, 'DecisionCounterfactualReceiverChecklist local advisory contract');
assert.match(schema.description, /local advisory decision-counterfactual memory retrieval checklist/);
assert.match(schema.description, /does not implement memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement/);
assert.equal(schema.additionalProperties, false);
assert.equal(checklist.schemaVersion, 'decision-counterfactual-checklist-v0.5');
assert.equal(checklist.mode, 'local_advisory_fixture_checklist_only');

const validationErrors = validateSchemaValue(schema, checklist);
assert.deepEqual(validationErrors, [], 'decision-counterfactual checklist fixture must validate');
for (const label of requiredBoundary) assert.ok(checklist.boundary.includes(label), `boundary must include ${label}`);
for (const slot of requiredSlots) assert.ok(checklist.requiredSlots.includes(slot), `requiredSlots must include ${slot}`);
for (const forbidden of forbiddenPromotions) assert.ok(checklist.forbiddenPromotions.includes(forbidden), `forbiddenPromotions must include ${forbidden}`);
assert.equal(checklist.fixtures.length, 16);
assert.equal(new Set(checklist.fixtures.map((fixture) => fixture.id)).size, 16, 'fixture IDs must be unique');

const coreAllowSlots = ['exact_current_action', 'active_lane_source', 'local_boundary', 'blocked_effects', 'fallback_or_fetch_path'];

function hasCoreAllowTuple(present) {
  return coreAllowSlots.every((slot) => present.has(slot));
}

function classify(fixture) {
  const signals = new Set(fixture.signals);
  const present = new Set(fixture.presentSlots);
  if ([
    'wrong_lane_pressure',
    'science_to_prototype_lure',
    'paused_project_pressure',
    'runtime_promotion_pressure',
    'publication_pressure',
    'memory_write_pressure',
  ].some((signal) => signals.has(signal))) return 'reject_sensitive_pressure';
  if (signals.has('stale_memory_thread') && signals.has('current_user_correction')) return 'retire_stale_memory_no_action';
  if (signals.has('mutable_external_fact') && !signals.has('source_verified')) return 'fetch_source_before_answer';
  if (signals.has('old_pr_memory_similarity_lure') || signals.has('wrong_project_context')) return 'fetch_or_abstain';
  if (hasCoreAllowTuple(present)) return 'allow_local_advisory';
  return 'fetch_or_abstain';
}

const cases = checklist.fixtures.map((fixture) => {
  const actualDecision = classify(fixture);
  return {
    id: fixture.id,
    sourceExperiment: fixture.sourceExperiment,
    expectedDecision: fixture.expectedDecision,
    actualDecision,
    pass: actualDecision === fixture.expectedDecision,
    expectedReasonCodes: fixture.expectedReasonCodes,
  };
});

for (const result of cases) assert.equal(result.actualDecision, result.expectedDecision, `${result.id} decision must match expected`);
for (const fixture of checklist.fixtures.filter((entry) => entry.expectedDecision === 'allow_local_advisory')) {
  assert(
    hasCoreAllowTuple(new Set(fixture.presentSlots)),
    `${fixture.id} allow_local_advisory fixture must include every core allow slot`,
  );
}
const unsafeAllows = cases.filter((result) => result.actualDecision === 'allow_local_advisory' && result.expectedDecision !== 'allow_local_advisory');
assert.deepEqual(unsafeAllows, []);

const negativeControls = [
  ['live mode', (value) => { value.mode = 'runtime_receiver_integration'; }, '$.mode: const mismatch'],
  ['missing no runtime boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_runtime'); }, '$.boundary: allOf'],
  ['missing no memory atom boundary', (value) => { value.boundary = value.boundary.filter((entry) => entry !== 'no_memory_atom'); }, '$.boundary: allOf'],
  ['unknown top-level capability', (value) => { value.mayWriteMemory = true; }, '$: unknown field mayWriteMemory'],
  ['too few fixtures', (value) => { value.fixtures = value.fixtures.slice(0, 15); }, '$.fixtures: too few items'],
  ['too many fixtures', (value) => { value.fixtures = [...value.fixtures, structuredClone(value.fixtures[0])]; }, '$.fixtures: too many items'],
  ['bad decision vocabulary', (value) => { value.fixtures[0].expectedDecision = 'write_memory'; }, '$.fixtures[0].expectedDecision: enum mismatch'],
  ['free-form reason code', (value) => { value.fixtures[0].expectedReasonCodes = ['this is prose']; }, '$.fixtures[0].expectedReasonCodes[0]: pattern mismatch'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, checklist, mutation, needle);

const reasonCodesCovered = [...new Set(checklist.fixtures.flatMap((fixture) => fixture.expectedReasonCodes))].sort();
const output = {
  summary: {
    artifact,
    timestamp: '2026-05-12T03:15:00.000Z',
    verdict: 'pass',
    schema: 'schemas/decision-counterfactual-checklist.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/decision-counterfactual-checklist.json',
    validationErrorCount: validationErrors.length,
    fixtureCount: checklist.fixtures.length,
    passCount: cases.filter((result) => result.pass).length,
    unsafeAllows: unsafeAllows.length,
    negativeControlCount: negativeControls.length,
    sourceExperiments: [...new Set(checklist.fixtures.map((fixture) => fixture.sourceExperiment))].sort(),
    reasonCodesCovered: reasonCodesCovered.length,
    coreAllowTupleRequired: true,
    allowCaseCount: cases.filter((result) => result.actualDecision === 'allow_local_advisory').length,
    memoryWriteImplemented: false,
    memoryAtomImplemented: false,
    runtimeImplemented: false,
    liveObserverImplemented: false,
    adapterIntegrationImplemented: false,
    toolAuthorizationImplemented: false,
    externalPublicationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'local_advisory_fixture_behavior_only_not_runtime_not_memory_not_publication_not_enforcement',
  },
  cases,
  reasonCodesCovered,
  boundary: checklist.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
