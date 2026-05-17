import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-live-shadow-drift-scorecard-shape-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/live-shadow-drift-scorecard.json');
const replayEvidencePath = resolve(packageRoot, 'evidence/live-shadow-synthetic-replay.out.json');
const schemaPath = resolve(repoRoot, 'schemas/live-shadow-drift-scorecard.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/live-shadow-drift-scorecard-shape.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const replayEvidence = JSON.parse(await readFile(replayEvidencePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(fixture.scorecardMode, 'offline_scorecard_shape_only');
assert.match(fixture.description, /Offline scorecard-shape fixture/);
assert.match(fixture.description, /does not observe live traffic or implement a live observer/);
assert.equal(replayEvidence.summary?.verdict, 'pass', 'source synthetic replay evidence must pass');
assert.equal(replayEvidence.summary?.mode, 'synthetic_offline_replay_only');
assert.equal(replayEvidence.summary?.observerImplemented, false);
assert.equal(replayEvidence.summary?.liveTrafficRead, false);
assert.equal(schema.additionalProperties, false);
assert.match(schema.description, /Offline scorecard-shape schema/);
assert.match(schema.description, /does not observe live traffic/);

const results = replayEvidence.results ?? [];
assert.ok(results.length >= 20 && results.length <= 30, 'scorecard shape should aggregate the current synthetic replay result set');

const capabilityCounts = Object.fromEntries(effectCapabilityFields.map((field) => [`${field.replace(/^may/, 'may')}Count`, 0]));
for (const result of results) {
  for (const field of effectCapabilityFields) if (result[field] !== false) capabilityCounts[`${field}Count`] += 1;
}

const driftBuckets = {
  none: 0,
  classifierDecisionChanged: 0,
  redactionWarning: 0,
  forbiddenEffect: 0,
  capabilityAttempt: 0,
  unknown: 0,
};
for (const result of results) {
  if ((result.forbiddenEffectsDetected ?? []).length > 0) driftBuckets.forbiddenEffect += 1;
  const capabilityAttempt = effectCapabilityFields.some((field) => result[field] !== false);
  if (capabilityAttempt) driftBuckets.capabilityAttempt += 1;
  if ((result.warnings ?? []).some((warning) => warning.includes('redaction'))) driftBuckets.redactionWarning += 1;
  if ((result.driftSignals ?? []).includes('classifier_decision_not_shadow_only_recorded_without_effect')) driftBuckets.classifierDecisionChanged += 1;
  if ((result.driftSignals ?? []).length === 0 && (result.warnings ?? []).length === 0 && !capabilityAttempt && (result.forbiddenEffectsDetected ?? []).length === 0) driftBuckets.none += 1;
}

const scorecard = {
  schemaVersion: 'live-shadow-drift-scorecard-v0',
  scorecardId: 'lsds_synthetic_replay_v0',
  generatedAt: '2026-05-08T01:30:00.000Z',
  mode: 'offline_scorecard_shape_only',
  sourceEvidence: {
    syntheticReplay: 'implementation/synaptic-mesh-shadow-v0/evidence/live-shadow-synthetic-replay.out.json',
    observationSchema: 'schemas/live-shadow-observation.schema.json',
    resultSchema: 'schemas/live-shadow-observation-result.schema.json',
  },
  observationCount: replayEvidence.observations.length,
  resultCount: results.length,
  driftBuckets,
  capabilitySummary: {
    mayBlockCount: results.filter((result) => result.mayBlock !== false).length,
    mayAllowCount: results.filter((result) => result.mayAllow !== false).length,
    mayExecuteToolCount: results.filter((result) => result.mayExecuteTool !== false).length,
    mayWriteMemoryCount: results.filter((result) => result.mayWriteMemory !== false).length,
    mayWriteConfigCount: results.filter((result) => result.mayWriteConfig !== false).length,
    mayPublishExternallyCount: results.filter((result) => result.mayPublishExternally !== false).length,
    mayModifyAgentInstructionsCount: results.filter((result) => result.mayModifyAgentInstructions !== false).length,
    mayEnterApprovalPathCount: results.filter((result) => result.mayEnterApprovalPath !== false).length,
    capabilityTrueCount: results.reduce((sum, result) => sum + effectCapabilityFields.filter((field) => result[field] !== false).length, 0),
  },
  redactionRetentionBoundary: {
    rawContentPersisted: false,
    retentionSchedulerImplemented: false,
    redactionImplementationAdded: false,
    designReference: 'design-notes/live-shadow-redaction-retention-v0.md',
  },
  auditReasonCodes: ['LIVE_SHADOW_TRACE_ONLY', 'LIVE_SHADOW_NO_EFFECTS', 'LIVE_SHADOW_LOCAL_ONLY', 'LIVE_SHADOW_DECISION_PATH_SEPARATED'],
  boundary: fixture.boundary,
};

const validationErrors = validateSchemaValue(schema, scorecard);
assert.deepEqual(validationErrors, [], 'drift scorecard must validate');
assert.equal(scorecard.driftBuckets.forbiddenEffect, 0, 'drift scorecard must not record forbidden effects');
assert.equal(scorecard.driftBuckets.capabilityAttempt, 0, 'drift scorecard must not record capability attempts');
assert.equal(scorecard.driftBuckets.unknown, 0, 'drift scorecard must not include unknown drift buckets');
assert.equal(scorecard.capabilitySummary.capabilityTrueCount, 0, 'drift scorecard must keep capabilityTrueCount at zero');
assert.equal(scorecard.redactionRetentionBoundary.rawContentPersisted, false, 'scorecard must not persist raw content');
assert.equal(scorecard.redactionRetentionBoundary.retentionSchedulerImplemented, false, 'scorecard must not implement retention scheduling');
assert.equal(scorecard.redactionRetentionBoundary.redactionImplementationAdded, false, 'scorecard must not implement redaction code');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T01:30:00.000Z',
    verdict: 'pass',
    schema: 'schemas/live-shadow-drift-scorecard.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-drift-scorecard.json',
    sourceEvidence: 'implementation/synaptic-mesh-shadow-v0/evidence/live-shadow-synthetic-replay.out.json',
    observationCount: scorecard.observationCount,
    resultCount: scorecard.resultCount,
    validationErrorCount: validationErrors.length,
    forbiddenEffectCount: scorecard.driftBuckets.forbiddenEffect,
    capabilityAttemptCount: scorecard.driftBuckets.capabilityAttempt,
    capabilityTrueCount: scorecard.capabilitySummary.capabilityTrueCount,
    rawContentPersisted: false,
    redactionImplementationAdded: false,
    retentionSchedulerImplemented: false,
    mode: 'offline_scorecard_shape_only',
    observerImplemented: false,
    liveTrafficRead: false,
    liveLogsRead: false,
    daemonImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'live_shadow_drift_scorecard_shape_only_not_live_observer_not_runtime_not_authorization',
  },
  scorecard,
  validationErrors,
  knownUncoveredRisks: [
    'scorecard_aggregates_synthetic_replay_evidence_not_live_traffic',
    'drift_buckets_are_shape_vocabulary_not_runtime_monitoring_results',
    'redaction_retention_fields_are_boundary_flags_not_implemented_policy',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_or_enforcement_added',
  ],
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
