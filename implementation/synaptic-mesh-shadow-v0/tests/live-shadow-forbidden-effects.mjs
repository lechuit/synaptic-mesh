import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields, requiredForbiddenPaths } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-live-shadow-forbidden-effects-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const observationFixturePath = resolve(packageRoot, 'fixtures/live-shadow-observations.json');
const resultFixturePath = resolve(packageRoot, 'fixtures/live-shadow-observation-results.json');
const evidencePath = resolve(packageRoot, 'evidence/live-shadow-forbidden-effects.out.json');

const observations = JSON.parse(await readFile(observationFixturePath, 'utf8')).observations;
const results = JSON.parse(await readFile(resultFixturePath, 'utf8')).results;

const forbiddenOperationalTokens = [
  'tool_execution',
  'memory_write',
  'config_write',
  'external_publication',
  'agent_instruction_write',
  'approval_grant',
  'block',
  'allow',
  'enforce',
];

const violations = [];
for (const observation of observations) {
  assert.equal(observation.observerMode, 'passive');
  assert.equal(observation.effectBoundary, 'no_effects');
  assert.equal(observation.writeBoundary, 'local_shadow_only');
  for (const pathName of requiredForbiddenPaths) assert.ok(observation.forbiddenPaths.includes(pathName), `${observation.observationId} must explicitly forbid ${pathName}`);
  for (const [field, value] of Object.entries(observation)) {
    const serialized = JSON.stringify(value);
    for (const token of forbiddenOperationalTokens) {
      if (['memory_write', 'config_write', 'external_publication'].includes(token) && field === 'forbiddenPaths') continue;
      if (serialized.includes(token)) violations.push({ fixture: observation.observationId, field, token });
    }
  }
}
for (const result of results) {
  assert.equal(result.observerAction, 'record_only');
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  for (const field of effectCapabilityFields) assert.equal(result[field], false, `${result.resultId}.${field} must remain false`);
  for (const token of forbiddenOperationalTokens) {
    const serialized = JSON.stringify(result);
    if (serialized.includes(token)) violations.push({ fixture: result.resultId, token });
  }
}
assert.deepEqual(violations, [], 'live-shadow fixtures must not contain operational capability tokens outside explicit observation forbiddenPaths');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T00:57:00.000Z',
    verdict: 'pass',
    observationCount: observations.length,
    resultCount: results.length,
    forbiddenOperationalTokens,
    violationCount: violations.length,
    mode: 'offline_fixture_forbidden_effects_gate',
    observerImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    blockingAllowingOrApprovalImplemented: false,
  },
  violations,
  boundary: ['offline_fixture_only', 'no_runtime', 'no_tool_execution', 'no_memory_write', 'no_config_write', 'no_publication', 'no_agent_instruction_write', 'no_approval_grant', 'no_block', 'no_allow', 'no_enforce'],
};
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
