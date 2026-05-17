import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-observation-scorecard-thresholds-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const fixturePath = resolve(packageRoot, 'fixtures/manual-observation-scorecard-thresholds.json');
const sourceEvidencePath = resolve(packageRoot, 'evidence/manual-decisiontrace-live-shadow-replay.out.json');
const schemaPath = resolve(repoRoot, 'schemas/manual-observation-scorecard-thresholds.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-observation-scorecard-thresholds.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const sourceEvidence = JSON.parse(await readFile(sourceEvidencePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

assert.equal(fixture.scorecardMode, 'manual_offline_scorecard_thresholds_only');
assert.match(fixture.description, /redacted manual replay counters only/);
assert.match(fixture.description, /does not observe live traffic/);
assert.match(fixture.description, /authorization, or enforcement/);
assert.equal(sourceEvidence.summary?.verdict, 'pass');
assert.equal(sourceEvidence.summary?.mode, 'manual_offline_decisiontrace_live_shadow_replay_only');
assert.equal(sourceEvidence.summary?.redactedMetadataOnly, true);
assert.equal(sourceEvidence.summary?.rawContentPersisted, false);
assert.equal(sourceEvidence.summary?.observerImplemented, false);
assert.equal(sourceEvidence.summary?.liveObserverImplemented, false);
assert.equal(sourceEvidence.summary?.liveTrafficRead, false);
assert.equal(sourceEvidence.summary?.liveLogsRead, false);
assert.equal(sourceEvidence.summary?.toolExecutionImplemented, false);
assert.equal(sourceEvidence.summary?.memoryWriteImplemented, false);
assert.equal(sourceEvidence.summary?.configWriteImplemented, false);
assert.equal(sourceEvidence.summary?.externalPublicationImplemented, false);
assert.equal(sourceEvidence.summary?.approvalPathImplemented, false);
assert.equal(sourceEvidence.summary?.blockingOrAllowingImplemented, false);
assert.equal(sourceEvidence.summary?.enforcementImplemented, false);

const thresholds = fixture.thresholds;
const observed = {
  manualBundles: sourceEvidence.summary.manualBundles,
  traceCount: sourceEvidence.summary.traceCount,
  observationCount: sourceEvidence.summary.observationCount,
  resultCount: sourceEvidence.summary.resultCount,
  validationErrorCount: sourceEvidence.summary.validationErrorCount,
  mismatchCount: sourceEvidence.summary.mismatchCount,
  falsePermitCount: sourceEvidence.summary.falsePermitCount,
  falseCompactCount: sourceEvidence.summary.falseCompactCount,
  boundaryLossCount: sourceEvidence.summary.boundaryLossCount,
  forbiddenEffectsDetectedCount: sourceEvidence.summary.forbiddenEffectsDetectedCount,
  mayBlockCount: sourceEvidence.summary.mayBlockCount,
  mayAllowCount: sourceEvidence.summary.mayAllowCount,
  capabilityTrueCount: sourceEvidence.summary.capabilityTrueCount,
  rawContentPersisted: sourceEvidence.summary.rawContentPersisted,
  redactedMetadataOnly: sourceEvidence.summary.redactedMetadataOnly,
  capabilityAttempts: sourceEvidence.summary.capabilityAttempts,
  forbiddenEffects: sourceEvidence.summary.forbiddenEffects,
};

assert.equal(observed.manualBundles, observed.traceCount, 'manual scorecard must cover all manual bundles');
assert.equal(observed.traceCount, observed.observationCount, 'manual scorecard must have one observation per trace');
assert.equal(observed.traceCount, observed.resultCount, 'manual scorecard must have one result per trace');
assert.ok(observed.traceCount > 0, 'manual scorecard must aggregate at least one manual replay row');

const thresholdFailures = [];
for (const [observedKey, thresholdKey] of [
  ['validationErrorCount', 'validationErrorCountMax'],
  ['mismatchCount', 'mismatchCountMax'],
  ['falsePermitCount', 'falsePermitCountMax'],
  ['falseCompactCount', 'falseCompactCountMax'],
  ['boundaryLossCount', 'boundaryLossCountMax'],
  ['forbiddenEffectsDetectedCount', 'forbiddenEffectsDetectedCountMax'],
  ['mayBlockCount', 'mayBlockCountMax'],
  ['mayAllowCount', 'mayAllowCountMax'],
  ['capabilityTrueCount', 'capabilityTrueCountMax'],
]) {
  if (observed[observedKey] > thresholds[thresholdKey]) thresholdFailures.push(`${observedKey}=${observed[observedKey]} exceeds ${thresholdKey}=${thresholds[thresholdKey]}`);
}
if (observed.rawContentPersisted !== thresholds.rawContentPersistedAllowed) thresholdFailures.push('rawContentPersisted must remain false');
if (observed.redactedMetadataOnly !== thresholds.redactedMetadataOnlyRequired) thresholdFailures.push('redactedMetadataOnly must remain true');
if (observed.capabilityAttempts !== 0) thresholdFailures.push('capabilityAttempts must remain zero');
if (observed.forbiddenEffects !== 0) thresholdFailures.push('forbiddenEffects must remain zero');
assert.deepEqual(thresholdFailures, [], 'manual observation thresholds must pass');

const scorecard = {
  schemaVersion: 'manual-observation-scorecard-thresholds-v0',
  scorecardId: 'most_manual_replay_v0',
  generatedAt: '2026-05-08T02:45:00.000Z',
  mode: 'manual_offline_scorecard_thresholds_only',
  sourceEvidence: {
    manualDecisionTraceLiveShadowReplay: 'implementation/synaptic-mesh-shadow-v0/evidence/manual-decisiontrace-live-shadow-replay.out.json',
    decisionTraceSchema: 'schemas/decision-trace.schema.json',
    observationSchema: 'schemas/live-shadow-observation.schema.json',
    resultSchema: 'schemas/live-shadow-observation-result.schema.json',
  },
  thresholds,
  observed,
  verdict: 'pass',
  auditReasonCodes: [
    'MANUAL_OBSERVATION_OFFLINE_ONLY',
    'MANUAL_OBSERVATION_REDACTED_METADATA_ONLY',
    'MANUAL_OBSERVATION_ZERO_FORBIDDEN_EFFECTS',
    'MANUAL_OBSERVATION_RECORD_ONLY',
    'MANUAL_OBSERVATION_NO_RUNTIME',
  ],
  boundary: fixture.boundary,
};
const validationErrors = validateSchemaValue(schema, scorecard);
assert.deepEqual(validationErrors, [], 'manual observation threshold scorecard must validate');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T02:45:00.000Z',
    verdict: 'pass',
    schema: 'schemas/manual-observation-scorecard-thresholds.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-scorecard-thresholds.json',
    sourceEvidence: 'implementation/synaptic-mesh-shadow-v0/evidence/manual-decisiontrace-live-shadow-replay.out.json',
    manualBundles: observed.manualBundles,
    traceCount: observed.traceCount,
    observationCount: observed.observationCount,
    resultCount: observed.resultCount,
    thresholdFailureCount: thresholdFailures.length,
    validationErrorCount: validationErrors.length,
    mismatchCount: observed.mismatchCount,
    falsePermitCount: observed.falsePermitCount,
    falseCompactCount: observed.falseCompactCount,
    boundaryLossCount: observed.boundaryLossCount,
    forbiddenEffectsDetectedCount: observed.forbiddenEffectsDetectedCount,
    mayBlockCount: observed.mayBlockCount,
    mayAllowCount: observed.mayAllowCount,
    capabilityTrueCount: observed.capabilityTrueCount,
    rawContentPersisted: false,
    redactedMetadataOnly: true,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    mode: 'manual_offline_scorecard_thresholds_only',
    observerImplemented: false,
    liveObserverImplemented: false,
    liveTrafficRead: false,
    liveLogsRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingOrAllowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_observation_scorecard_thresholds_only_not_live_observer_not_runtime_not_authorization',
  },
  scorecard,
  thresholdFailures,
  validationErrors,
  knownUncoveredRisks: [
    'manual_scorecard_aggregates_offline_replay_evidence_not_live_traffic',
    'thresholds_are_local_shadow_evidence_gates_not_runtime_monitoring_or_safety_claims',
    'redacted_metadata_only_counter_does_not_prove_general_redaction_robustness',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_approval_authorization_or_enforcement_added',
  ],
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
