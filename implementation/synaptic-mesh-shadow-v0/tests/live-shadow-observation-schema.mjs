import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectInvalid, requiredForbiddenPaths, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-live-shadow-observation-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/live-shadow-observation.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/live-shadow-observations.json');
const evidencePath = resolve(packageRoot, 'evidence/live-shadow-observation-schema.out.json');

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'LiveShadowObservation evidence record');
assert.match(schema.description, /Offline schema/);
assert.match(schema.description, /does not observe live traffic/);
assert.match(schema.description, /execute tools/);
assert.equal(schema.additionalProperties, false);

for (const required of ['schemaVersion', 'observationId', 'flowId', 'observedAt', 'observerMode', 'effectBoundary', 'writeBoundary', 'sourceArtifactId', 'parserEvidenceRef', 'routeDecisionInputHash', 'classifierDecisionHash', 'decisionTraceHash', 'forbiddenPaths', 'auditReasonCodes']) {
  assert.ok(schema.required.includes(required), `schema must require ${required}`);
}

const validationErrors = [];
for (const observation of fixture.observations) {
  const errors = validateSchemaValue(schema, observation);
  if (errors.length > 0) validationErrors.push({ observationId: observation.observationId, errors });
  assert.equal(observation.observerMode, 'passive');
  assert.equal(observation.effectBoundary, 'no_effects');
  assert.equal(observation.writeBoundary, 'local_shadow_only');
  for (const pathName of requiredForbiddenPaths) assert.ok(observation.forbiddenPaths.includes(pathName), `${observation.observationId} must forbid ${pathName}`);
}
assert.deepEqual(validationErrors, [], 'all live-shadow observations must validate');

const valid = fixture.observations[0];
const negativeControls = [
  ['observerMode active', (record) => { record.observerMode = 'active'; }, '$.observerMode: enum mismatch'],
  ['effectBoundary runtime', (record) => { record.effectBoundary = 'runtime'; }, '$.effectBoundary: enum mismatch'],
  ['writeBoundary memory_write', (record) => { record.writeBoundary = 'memory_write'; }, '$.writeBoundary: enum mismatch'],
  ['missing decisionTraceHash', (record) => { delete record.decisionTraceHash; }, '$: missing required field decisionTraceHash'],
  ['missing forbiddenPaths', (record) => { delete record.forbiddenPaths; }, '$: missing required field forbiddenPaths'],
  ['unknown property', (record) => { record.runtimeHook = 'watcher'; }, '$: unknown field runtimeHook'],
  ['forbidden path tool_execution', (record) => { record.forbiddenPaths = [...record.forbiddenPaths, 'tool_execution']; }, '$.forbiddenPaths[7]: enum mismatch'],
];
for (const [label, mutation, needle] of negativeControls) expectInvalid(schema, valid, mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T00:55:00.000Z',
    verdict: 'pass',
    schema: 'schemas/live-shadow-observation.schema.json',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-observations.json',
    observationCount: fixture.observations.length,
    validObservationCount: fixture.observations.length - validationErrors.length,
    negativeControlCount: negativeControls.length,
    mode: 'offline_schema_fixture_only',
    observerImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    blockingOrApprovalImplemented: false,
    safetyClaimScope: 'live_shadow_observation_schema_shape_only_not_runtime_not_observer_not_enforcement',
  },
  validationErrors,
  requiredForbiddenPaths,
  negativeControls: negativeControls.map(([label]) => label),
  boundary: ['passive', 'record_shape_only', 'no_effects', 'local_shadow_only', 'not_live_observer', 'not_runtime', 'not_tools', 'not_memory_write', 'not_config_write', 'not_publication', 'not_approval'],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
