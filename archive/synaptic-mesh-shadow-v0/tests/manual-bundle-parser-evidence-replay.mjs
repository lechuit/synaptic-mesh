import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-bundle-parser-evidence-replay-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const replayFixturePath = resolve(packageRoot, 'fixtures/manual-bundle-parser-evidence-replay.json');
const bundleFixturePath = resolve(packageRoot, 'fixtures/manual-observation-bundles.json');
const redactionFixturePath = resolve(packageRoot, 'fixtures/manual-observation-redaction-fixtures.json');
const parserSchemaPath = resolve(repoRoot, 'schemas/parser-evidence.schema.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-bundle-parser-evidence-replay.out.json');

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

const replayFixture = JSON.parse(await readFile(replayFixturePath, 'utf8'));
const bundleFixture = JSON.parse(await readFile(bundleFixturePath, 'utf8'));
const redactionFixture = JSON.parse(await readFile(redactionFixturePath, 'utf8'));
const parserSchema = JSON.parse(await readFile(parserSchemaPath, 'utf8'));

assert.equal(replayFixture.replayMode, 'manual_offline_parser_evidence_replay_only');
assert.equal(replayFixture.rawContentIncluded, false);
assert.equal(replayFixture.humanReviewRequiredForCapture, true);
assert.equal(replayFixture.allowedProcessing, 'local_shadow_only');
assert.match(replayFixture.description, /redacted bundle metadata only/);
assert.equal(redactionFixture.rawContentIncluded, false);
assert.equal(redactionFixture.humanReviewRequiredForCapture, true);

const acceptedRedactionByBundle = new Map(redactionFixture.positiveCases.map((entry) => [entry.bundleRef, entry]));
const replayRows = [];
const validationErrors = [];

for (const bundle of bundleFixture.bundles) {
  assert.equal(bundle.captureMode, 'manual_offline');
  assert.equal(bundle.rawContentIncluded, false);
  assert.equal(bundle.redactedContentIncluded, true);
  assert.equal(bundle.humanReviewRequiredForCapture, true);
  const accepted = acceptedRedactionByBundle.get(bundle.bundleId);
  assert.ok(accepted, `${bundle.bundleId} must have accepted redaction fixture`);
  assert.equal(accepted.expectedAccepted, true);

  const routeDecisionInput = {
    normalizedAuthorityLevel: 'local_shadow',
    normalizedActionEffect: 'text_only',
    candidateSummary: {
      validReceipts: 1,
      invalidReceipts: 0,
      sensitiveSignals: [],
      manualCapture: true,
      redactedSnapshotOnly: true,
    },
    recommendedRoute: 'shadow_only',
  };
  const parserEvidence = {
    rawArtifactId: `manual-observation/${bundle.bundleId}`,
    rawInputShape: 'redacted_manual_observation_bundle',
    receiptCandidatesFound: 1,
    validReceipts: 1,
    invalidReceipts: 0,
    freeTextAuthorityAttempts: [],
    sensitiveSignals: [],
    foldedIndex: null,
    normalizationWarnings: ['MANUAL_OFFLINE_CAPTURE', 'REDACTED_SNAPSHOT_ONLY', 'RAW_CONTENT_NOT_PERSISTED'],
    routeDecisionInputHash: sha256(routeDecisionInput),
  };

  const errors = validateSchemaValue(parserSchema, parserEvidence);
  if (errors.length > 0) validationErrors.push({ bundleId: bundle.bundleId, errors });
  replayRows.push({
    bundleId: bundle.bundleId,
    redactedSnapshotRef: bundle.redactedSnapshotRef,
    redactedSnapshotHash: bundle.redactedSnapshotHash,
    parserEvidence,
    routeDecisionInput,
  });
}

assert.deepEqual(validationErrors, [], 'manual bundle parserEvidence rows must validate');
assert.equal(replayRows.length, bundleFixture.bundles.length);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T02:20:00.000Z',
    verdict: 'pass',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-bundle-parser-evidence-replay.json',
    sourceBundles: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-bundles.json',
    sourceRedactionFixtures: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-observation-redaction-fixtures.json',
    replayRows: replayRows.length,
    validationErrorCount: validationErrors.length,
    parserEvidenceValidCount: replayRows.length - validationErrors.length,
    routeDecisionInputHashBound: true,
    manualBundles: bundleFixture.bundles.length,
    redactionFailures: 0,
    rawContentPersisted: false,
    privatePathPersisted: false,
    secretLikeValuePersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    capabilityAttempts: 0,
    forbiddenEffects: 0,
    humanReviewRequiredForCapture: true,
    mode: 'manual_offline_parser_evidence_replay_only',
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
    enforcementImplemented: false,
    classifierDecisionComputed: false,
    decisionTraceGenerated: false,
    safetyClaimScope: 'manual_bundle_to_parser_evidence_replay_only_not_classifier_not_decision_trace_not_live_observer_not_runtime'
  },
  replayRows,
  validationErrors,
  knownUncoveredRisks: [
    'manual_bundle_parser_evidence_replay_uses_redacted_metadata_not_raw_content',
    'parserEvidence_shape_does_not_prove_parser_robustness_or_source_authenticity',
    'classifier_decision_and_decision_trace_are_future_prs',
    'no_daemon_watcher_adapter_mcp_tool_memory_config_publication_or_enforcement_added'
  ],
  boundary: replayFixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
