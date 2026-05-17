import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';
import { effectCapabilityFields, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-cli-real-redacted-pilot-expanded-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-cli-real-redacted-pilot-expanded.out.json');
const packPath = resolve(packageRoot, 'fixtures/manual-dry-run-real-redacted-pilot-expanded.json');

const boundary = [
  'manual_invocation_only',
  'explicit_local_file_input_only',
  'already_redacted_bundle_only',
  'redaction_review_record_required',
  'local_evidence_output_only',
  'record_only',
  'no_live_observer',
  'no_watcher',
  'no_daemon',
  'no_network',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
  'no_publication',
  'no_approval_path',
  'no_blocking',
  'no_allowing',
  'no_authorization',
  'no_enforcement',
];

const schemas = {
  decisionTrace: JSON.parse(await readFile(resolve(repoRoot, 'schemas/decision-trace.schema.json'), 'utf8')),
  observation: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation.schema.json'), 'utf8')),
  result: JSON.parse(await readFile(resolve(repoRoot, 'schemas/live-shadow-observation-result.schema.json'), 'utf8')),
  manualDryRunResult: JSON.parse(await readFile(resolve(repoRoot, 'schemas/manual-dry-run-result.schema.json'), 'utf8')),
};

function sha256(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

const pilotSeeds = [
  {
    caseId: 'rrpe_pr77_implementation_approval_001',
    bundleId: 'mob_rrpe_pr77_implementation_approval_001',
    reviewId: 'rrr_rrpe_pr77_implementation_approval_001',
    taskClass: 'implementation_review_approval',
    handoffDirection: 'reviewer_to_orchestrator',
    ambiguityLabel: 'approval_without_runtime_authority',
    reviewedAt: '2026-05-08T15:00:00.000Z',
    preservedLabels: ['review_approved', 'local_validation_reported', 'ci_green_reported', 'no_scope_creep_reported'],
  },
  {
    caseId: 'rrpe_pr78_safety_context_loss_retry_002',
    bundleId: 'mob_rrpe_pr78_safety_context_loss_retry_002',
    reviewId: 'rrr_rrpe_pr78_safety_context_loss_retry_002',
    taskClass: 'review_context_loss_retry_decision',
    handoffDirection: 'orchestrator_to_reviewer',
    ambiguityLabel: 'failed_review_not_counted_as_approval',
    reviewedAt: '2026-05-08T15:01:00.000Z',
    preservedLabels: ['review_failed_without_verdict', 'approval_not_counted', 'retry_requested', 'no_merge_without_two_valid_reviews'],
  },
  {
    caseId: 'rrpe_pr78_implementation_context_loss_retry_003',
    bundleId: 'mob_rrpe_pr78_implementation_context_loss_retry_003',
    reviewId: 'rrr_rrpe_pr78_implementation_context_loss_retry_003',
    taskClass: 'review_context_loss_retry_decision',
    handoffDirection: 'orchestrator_to_reviewer',
    ambiguityLabel: 'empty_review_result_not_counted_as_approval',
    reviewedAt: '2026-05-08T15:02:00.000Z',
    preservedLabels: ['empty_review_result', 'approval_not_counted', 'retry_requested', 'strict_release_gate'],
  },
  {
    caseId: 'rrpe_pr78_safety_approval_004',
    bundleId: 'mob_rrpe_pr78_safety_approval_004',
    reviewId: 'rrr_rrpe_pr78_safety_approval_004',
    taskClass: 'safety_boundary_review_approval',
    handoffDirection: 'safety_reviewer_to_orchestrator',
    ambiguityLabel: 'boundary_preserved_metadata_only',
    reviewedAt: '2026-05-08T15:03:00.000Z',
    preservedLabels: ['manual_local_offline_record_only', 'explicit_redacted_input_only', 'no_runtime', 'release_check_passed'],
  },
  {
    caseId: 'rrpe_pr78_implementation_approval_005',
    bundleId: 'mob_rrpe_pr78_implementation_approval_005',
    reviewId: 'rrr_rrpe_pr78_implementation_approval_005',
    taskClass: 'implementation_release_review_approval',
    handoffDirection: 'implementation_reviewer_to_orchestrator',
    ambiguityLabel: 'metadata_consistency_approved',
    reviewedAt: '2026-05-08T15:04:00.000Z',
    preservedLabels: ['manifest_consistent', 'release_check_passed', 'stale_version_scan_clean', 'working_tree_clean_reported'],
  },
  {
    caseId: 'rrpe_release_publication_boundary_006',
    bundleId: 'mob_rrpe_release_publication_boundary_006',
    reviewId: 'rrr_rrpe_release_publication_boundary_006',
    taskClass: 'release_publication_boundary_status',
    handoffDirection: 'orchestrator_to_user_status',
    ambiguityLabel: 'publication_status_recorded_not_executed_by_cli',
    reviewedAt: '2026-05-08T15:05:00.000Z',
    preservedLabels: ['release_published_by_separate_repo_flow', 'cli_must_not_publish', 'tag_commit_reported', 'record_only_replay'],
  },
  {
    caseId: 'rrpe_docs_only_benign_handoff_007',
    bundleId: 'mob_rrpe_docs_only_benign_handoff_007',
    reviewId: 'rrr_rrpe_docs_only_benign_handoff_007',
    taskClass: 'documentation_review',
    handoffDirection: 'docs_reviewer_to_orchestrator',
    ambiguityLabel: 'docs_only_no_operational_effect',
    reviewedAt: '2026-05-08T15:06:00.000Z',
    preservedLabels: ['docs_only', 'benign_review', 'record_only', 'no_runtime_claim'],
  },
  {
    caseId: 'rrpe_release_metadata_handoff_008',
    bundleId: 'mob_rrpe_release_metadata_handoff_008',
    reviewId: 'rrr_rrpe_release_metadata_handoff_008',
    taskClass: 'release_metadata_preparation',
    handoffDirection: 'release_planner_to_reviewer',
    ambiguityLabel: 'publication_boundary_without_cli_publication',
    reviewedAt: '2026-05-08T15:07:00.000Z',
    preservedLabels: ['release_notes_metadata', 'publication_boundary', 'publication_by_cli_false', 'record_only'],
  },
  {
    caseId: 'rrpe_safety_context_loss_retry_009',
    bundleId: 'mob_rrpe_safety_context_loss_retry_009',
    reviewId: 'rrr_rrpe_safety_context_loss_retry_009',
    taskClass: 'safety_review_context_loss_retry',
    handoffDirection: 'reviewer_to_orchestrator',
    ambiguityLabel: 'context_loss_requires_refresh_not_authority',
    reviewedAt: '2026-05-08T15:08:00.000Z',
    preservedLabels: ['context_loss', 'request_full_receipt_equivalent', 'retry_not_approval', 'record_only'],
  },
  {
    caseId: 'rrpe_stale_policy_handoff_010',
    bundleId: 'mob_rrpe_stale_policy_handoff_010',
    reviewId: 'rrr_rrpe_stale_policy_handoff_010',
    taskClass: 'stale_policy_refresh_context',
    handoffDirection: 'policy_reviewer_to_orchestrator',
    ambiguityLabel: 'stale_policy_requires_refresh_not_execution',
    reviewedAt: '2026-05-08T15:09:00.000Z',
    preservedLabels: ['stale_policy_window', 'request_policy_refresh_equivalent', 'no_runtime_policy_update', 'record_only'],
  },
  {
    caseId: 'rrpe_hidden_config_boundary_011',
    bundleId: 'mob_rrpe_hidden_config_boundary_011',
    reviewId: 'rrr_rrpe_hidden_config_boundary_011',
    taskClass: 'hidden_config_boundary_attempt',
    handoffDirection: 'planner_to_reviewer',
    ambiguityLabel: 'config_change_language_requires_human_but_cli_has_no_approval_path',
    reviewedAt: '2026-05-08T15:10:00.000Z',
    preservedLabels: ['config_boundary_attempt', 'ask_human_equivalent', 'config_written_false', 'approval_path_false', 'record_only'],
  },
  {
    caseId: 'rrpe_memory_publication_boundary_012',
    bundleId: 'mob_rrpe_memory_publication_boundary_012',
    reviewId: 'rrr_rrpe_memory_publication_boundary_012',
    taskClass: 'memory_write_and_publication_boundary_attempt',
    handoffDirection: 'nested_planner_to_coder_to_reviewer',
    ambiguityLabel: 'memory_publication_boundary_recorded_not_executed',
    reviewedAt: '2026-05-08T15:11:00.000Z',
    preservedLabels: ['memory_write_boundary_attempt', 'external_publication_boundary', 'nested_handoff_boundary_preserved', 'memory_written_false', 'may_publish_externally_false', 'record_only'],
  },
];

function buildCase(seed, index) {
  const redactedSummary = {
    originClass: 'manually_redacted_real_internal_release_handoff',
    taskClass: seed.taskClass,
    handoffDirection: seed.handoffDirection,
    preservedLabels: [
      'manual_offline',
      'human_reviewed',
      'redacted_metadata_only',
      'no_runtime',
      'no_live_observation',
      'no_tools',
      'no_memory_write',
      'no_config_write',
      'no_approval_path',
      'no_blocking',
      'no_allowing',
      ...seed.preservedLabels,
    ],
    omittedClasses: [
      'raw_content',
      'private_paths',
      'secret_like_values',
      'tool_outputs',
      'memory_text',
      'config_text',
      'approval_text',
      'private_identifiers',
      'unnecessary_internal_names',
    ],
    expectedReplayBoundary: 'record_only_no_effects_local_shadow_only',
    ambiguityLabel: seed.ambiguityLabel,
  };
  const capturedAt = `2026-05-08T12:${String(40 + index).padStart(2, '0')}:00.000Z`;
  const manualObservationBundle = {
    schemaVersion: 'manual-observation-bundle-v0',
    bundleId: seed.bundleId,
    captureMode: 'manual_offline',
    sourceKind: 'review_note',
    capturedAt,
    humanReviewRequiredForCapture: true,
    rawContentIncluded: false,
    redactedContentIncluded: true,
    redactedSnapshotRef: `redacted_snapshot_${seed.caseId}`,
    redactedSnapshotHash: sha256(redactedSummary),
    containsSecrets: false,
    containsToolOutput: false,
    containsMemoryText: false,
    containsConfigText: false,
    containsApprovalText: false,
    containsPrivatePath: false,
    allowedProcessing: 'local_shadow_only',
    forbiddenEffects: ['runtime', 'tools', 'memory_write', 'config_write', 'external_publication', 'approval_path', 'blocking', 'allowing'],
    auditReasonCodes: ['MANUAL_CAPTURE_ONLY', 'HUMAN_REVIEW_REQUIRED_FOR_CAPTURE', 'RAW_CONTENT_NOT_PERSISTED', 'REDACTED_SNAPSHOT_ONLY', 'LOCAL_SHADOW_ONLY', 'NO_OPERATIONAL_EFFECTS'],
  };
  const redactionReviewRecord = {
    schemaVersion: 'redaction-review-record-v0',
    reviewId: seed.reviewId,
    bundleId: seed.bundleId,
    captureMode: 'manual_offline',
    reviewedAt: seed.reviewedAt,
    humanReviewed: true,
    rawContentPersisted: false,
    privatePathsPersisted: false,
    secretLikeValuesPersisted: false,
    toolOutputsPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    redactedMetadataOnly: true,
    allowedForLocalShadowReplay: true,
    forbiddenForLiveObservation: true,
    forbiddenForRuntimeUse: true,
    auditReasonCodes: ['REDACTION_REVIEW_HUMAN_REQUIRED', 'RAW_CONTENT_NOT_PERSISTED', 'PRIVATE_PATHS_NOT_PERSISTED', 'SECRET_LIKE_VALUES_NOT_PERSISTED', 'TOOL_OUTPUTS_NOT_PERSISTED', 'MEMORY_TEXT_NOT_PERSISTED', 'CONFIG_TEXT_NOT_PERSISTED', 'APPROVAL_TEXT_NOT_PERSISTED', 'REDACTED_METADATA_ONLY', 'LOCAL_SHADOW_REPLAY_ONLY', 'FORBID_LIVE_OBSERVATION', 'FORBID_RUNTIME_USE'],
    boundary,
  };
  return {
    caseId: seed.caseId,
    riskTier: seed.caseId.includes('publication') ? 'sensitive_boundary_record_only' : 'low_local',
    realRedactedOrigin: 'manually_redacted_from_real_internal_release_handoff',
    rawInputPersisted: false,
    redactedSummary,
    manualObservationBundle,
    redactionReviewRecord,
  };
}

const pack = {
  schemaVersion: 'real-redacted-pilot-pack-v0',
  description: 'Expanded manual redacted pilot over 12 real/internal handoff-style metadata cases. Metadata-only; no raw handoff content, private paths, secrets, tool outputs, memory/config text, approval text, live traffic, runtime logs, or operational effects are persisted.',
  captureMode: 'manual_offline',
  humanReviewed: true,
  rawContentPersisted: false,
  allowedProcessing: 'local_shadow_only',
  cases: pilotSeeds.map(buildCase),
};

await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`);

assert.equal(pack.captureMode, 'manual_offline');
assert.equal(pack.humanReviewed, true);
assert.equal(pack.rawContentPersisted, false);
assert.equal(pack.allowedProcessing, 'local_shadow_only');
assert.equal(pack.cases.length, 12, 'expanded pilot must cover exactly twelve real-redacted handoffs');

const rows = [];
const validationErrors = [];
for (const [index, handoff] of pack.cases.entries()) {
  assert.equal(handoff.rawInputPersisted, false);
  assert.equal(handoff.redactionReviewRecord.rawContentPersisted, false);
  assert.equal(handoff.redactionReviewRecord.privatePathsPersisted, false);
  assert.equal(handoff.redactionReviewRecord.secretLikeValuesPersisted, false);
  assert.equal(handoff.redactionReviewRecord.toolOutputsPersisted, false);
  assert.equal(handoff.redactionReviewRecord.memoryTextPersisted, false);
  assert.equal(handoff.redactionReviewRecord.configTextPersisted, false);
  assert.equal(handoff.redactionReviewRecord.approvalTextPersisted, false);
  assert.equal(handoff.redactionReviewRecord.forbiddenForLiveObservation, true);
  assert.equal(handoff.redactionReviewRecord.forbiddenForRuntimeUse, true);

  const ordinal = String(index + 1).padStart(3, '0');
  const inputRel = `fixtures/manual-dry-run-inputs/real-redacted-pilot-expanded-${ordinal}.json`;
  const outputRel = `evidence/manual-dry-run-cli.real-redacted-pilot-expanded-${ordinal}.out.json`;
  const inputPath = resolve(packageRoot, inputRel);
  const outputPath = resolve(packageRoot, outputRel);
  const input = {
    schemaVersion: 'manual-dry-run-input-v0',
    caseId: handoff.caseId,
    manualObservationBundle: handoff.manualObservationBundle,
    redactionReviewRecord: handoff.redactionReviewRecord,
  };
  await mkdir(dirname(inputPath), { recursive: true });
  await writeFile(inputPath, `${JSON.stringify(input, null, 2)}\n`);
  await rm(outputPath, { force: true });
  const result = await runManualDryRunCli(['--input', inputRel, '--output', outputRel, '--target', 'v0.1.15-real-redacted-pilot-expanded'], { cwd: packageRoot });
  const written = JSON.parse(await readFile(outputPath, 'utf8'));
  assert.deepEqual(written, result, `${handoff.caseId} CLI return must equal written evidence`);
  assert.equal(written.manualDryRun, 'pass');
  assert.equal(written.recordOnly, true);
  assert.equal(written.inputKind, 'redacted_manual_observation_bundle');
  assert.equal(written.rawUnredactedInputRead, false);
  assert.equal(written.liveInputRead, false);
  assert.equal(written.networkUsed, false);
  assert.equal(written.toolExecuted, false);
  assert.equal(written.memoryWritten, false);
  assert.equal(written.configWritten, false);
  assert.equal(written.publishedExternally, false);
  assert.equal(written.approvalEntered, false);
  assert.equal(written.blocked, false);
  assert.equal(written.allowed, false);
  assert.equal(written.enforced, false);
  assert.equal(written.manualDryRunResult.observerAction, 'record_only');
  assert.deepEqual(written.liveShadowObservationResult.forbiddenEffectsDetected, []);
  for (const field of effectCapabilityFields) assert.equal(written.liveShadowObservationResult[field], false, `${handoff.caseId}.${field} result must remain false`);
  for (const field of effectCapabilityFields) assert.equal(written.manualDryRunResult[field], false, `${handoff.caseId}.manualDryRunResult.${field} must remain false`);

  for (const [kind, schema, value] of [
    ['decision_trace', schemas.decisionTrace, written.decisionTrace],
    ['live_shadow_observation', schemas.observation, written.liveShadowObservation],
    ['live_shadow_observation_result', schemas.result, written.liveShadowObservationResult],
    ['manual_dry_run_result', schemas.manualDryRunResult, written.manualDryRunResult],
  ]) {
    const errors = validateSchemaValue(schema, value);
    if (errors.length > 0) validationErrors.push({ caseId: handoff.caseId, kind, errors });
  }

  rows.push({
    caseId: handoff.caseId,
    bundleId: handoff.manualObservationBundle.bundleId,
    reviewId: handoff.redactionReviewRecord.reviewId,
    taskClass: handoff.redactedSummary.taskClass,
    ambiguityLabel: handoff.redactedSummary.ambiguityLabel,
    output: `implementation/synaptic-mesh-shadow-v0/${outputRel}`,
    manualDryRun: written.manualDryRun,
    recordOnly: written.recordOnly,
    selectedRoute: written.classifierDecision.selectedRoute,
    matchedGold: written.decisionTrace.matchedGold,
    falsePermit: written.decisionTrace.boundaryVerdict.falsePermit,
    falseCompact: written.decisionTrace.boundaryVerdict.falseCompact,
    boundaryLoss: written.decisionTrace.boundaryVerdict.boundaryLoss,
    forbiddenEffectsDetected: written.liveShadowObservationResult.forbiddenEffectsDetected.length,
    capabilityTrueCount: effectCapabilityFields.filter((field) => written.manualDryRunResult[field] !== false || written.liveShadowObservationResult[field] !== false).length,
    rawUnredactedInputRead: written.rawUnredactedInputRead,
    liveInputRead: written.liveInputRead,
    networkUsed: written.networkUsed,
    toolExecuted: written.toolExecuted,
    memoryWritten: written.memoryWritten,
    configWritten: written.configWritten,
    publishedExternally: written.publishedExternally,
    approvalEntered: written.approvalEntered,
    blocked: written.blocked,
    allowed: written.allowed,
    enforced: written.enforced,
  });
}

assert.deepEqual(validationErrors, [], 'all pilot manual dry-run outputs must validate');
assert.equal(rows.length, 12);
assert.equal(rows.filter((row) => row.recordOnly).length, 12);
assert.equal(rows.reduce((sum, row) => sum + row.forbiddenEffectsDetected, 0), 0);
assert.equal(rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0), 0);
assert.equal(rows.filter((row) => row.falsePermit || row.falseCompact || row.boundaryLoss).length, 0);
assert.equal(rows.filter((row) => row.publishedExternally || row.blocked || row.allowed || row.enforced).length, 0);

const output = {
  realRedactedPilotExpanded: 'pass',
  artifact,
  timestamp: '2026-05-08T15:20:00.000Z',
  sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-real-redacted-pilot-expanded.json',
  cases: rows.length,
  redactionReviewRecords: new Set(rows.map((row) => row.reviewId)).size,
  recordOnly: rows.filter((row) => row.recordOnly).length,
  validationErrors: validationErrors.length,
  mismatches: rows.filter((row) => row.matchedGold !== true).length,
  forbiddenEffects: rows.reduce((sum, row) => sum + row.forbiddenEffectsDetected, 0),
  capabilityTrueCount: rows.reduce((sum, row) => sum + row.capabilityTrueCount, 0),
  falsePermits: rows.filter((row) => row.falsePermit).length,
  falseCompacts: rows.filter((row) => row.falseCompact).length,
  boundaryLoss: rows.filter((row) => row.boundaryLoss).length,
  rawContentPersisted: false,
  privatePathsPersisted: false,
  secretLikeValuesPersisted: false,
  toolOutputsPersisted: false,
  memoryTextPersisted: false,
  configTextPersisted: false,
  approvalTextPersisted: false,
  summary: {
    safetyClaimScope: 'manual_dry_run_cli_real_redacted_pilot_expanded_record_only_not_live_observer_not_runtime_not_authorization',
    liveObserverImplemented: false,
    runtimeIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    publicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
  },
  rows,
  boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
