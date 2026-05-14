import { readFileSync } from 'node:fs';
import path from 'node:path';

export const readOnlyLocalFileAdapterGateScripts = Object.freeze([
  'test:read-only-adapter-public-review-package',
  'test:read-only-adapter-human-review-go-no-go',
  'test:first-real-adapter-design-note',
  'test:adapter-implementation-hazard-catalog',
  'test:read-only-local-file-adapter-schema',
  'test:read-only-local-file-adapter',
  'test:read-only-local-file-adapter-negative-controls',
  'test:read-only-local-file-adapter-canary',
  'test:read-only-local-file-adapter-canary-runbook',
]);

export const readOnlyLocalFileAdapterRequiredManifestPaths = Object.freeze([
  'tools/release-checks/read-only-local-file-adapter.mjs',
  'docs/status-v0.4.5.md',
  'docs/read-only-adapter-boundary-contracts-v0.4.0-alpha.md',
  'docs/read-only-adapter-misuse-failure-catalog-v0.4.1.md',
  'docs/read-only-adapter-reproducibility-drift-gate-v0.4.2.md',
  'docs/read-only-adapter-reviewer-runbook-v0.4.3.md',
  'docs/read-only-adapter-public-review-package-v0.4.5.md',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-adapter-public-review-package.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-contracts.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-misuse-failure-catalog-v0.4.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-reproducibility-drift-gate-v0.4.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-simulated-v0.4.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-public-review-package-v0.4.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-adapter-public-review-package-v0.4.5.json',
  'docs/status-v0.4.6.md',
  'docs/read-only-adapter-human-review-findings-go-no-go-v0.4.6.md',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-adapter-human-review-go-no-go.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-adapter-human-review-go-no-go-v0.4.6.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-adapter-human-review-go-no-go-v0.4.6.out.json',
  'docs/status-v0.4.7.md',
  'docs/first-real-adapter-design-note-v0.4.7.md',
  'implementation/synaptic-mesh-shadow-v0/tests/first-real-adapter-design-note.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/first-real-adapter-design-note-v0.4.7.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/first-real-adapter-design-note-v0.4.7.out.json',
  'docs/status-v0.4.8.md',
  'docs/adapter-implementation-hazard-catalog-v0.4.8.md',
  'docs/status-v0.5.0-alpha.md',
  'docs/read-only-local-file-adapter-canary-runbook.md',
  'implementation/synaptic-mesh-shadow-v0/tests/adapter-implementation-hazard-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/adapter-implementation-hazard-catalog-v0.4.8.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/adapter-implementation-hazard-catalog-v0.4.8.out.json',
  'schemas/read-only-local-file-adapter-input.schema.json',
  'schemas/read-only-local-file-adapter-result.schema.json',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-schema.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-negative-controls.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-canary.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-canary-runbook.mjs',
  'implementation/synaptic-mesh-shadow-v0/src/adapters/read-only-local-file-adapter.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-inputs.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-results.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-canary-runbook.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-schema.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-canary-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-negative-controls.out.json',
]);

const V050_ALPHA_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_schema_pr1',
  'adapter_skeleton_pr2',
  'negative_controls_pr3',
  'positive_canary_pr4',
  'canary_runbook_pr5',
  'release_metadata_pr6',
  'one_explicit_already_redacted_local_file',
  'source_files_read_1',
  'negative_cases_17',
  'unexpected_accepts_0',
  'forbidden_effects_0',
  'capability_true_count_0',
]);

const V050_ALPHA_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_adapter_alpha',
  'explicit_already_redacted_file_only',
  'record_only_evidence_only',
  'no_runtime_authorization',
  'no_enforcement',
  'no_url_input',
  'no_network_call',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V048_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_implementation_hazard_catalog',
  'reject_raw_input',
  'url_input',
  'directory_input',
  'symlink_escape',
  'machine_policy_leak',
  'unexpected_accepts_0',
  'go_to_v0_5_alpha_canary_if_still_green',
]);

const V048_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'pre_implementation',
  'no_real_adapter_implementation',
  'no_url_input',
  'no_network_call',
]);

const V047_REPRODUCIBILITY_TOKENS = Object.freeze([
  'first_real_adapter_design_note',
  'read_only_local_file_adapter',
  'one_explicit_already_redacted_local_file',
  'go_to_hazard_catalog_true',
  'go_to_v0_5_alpha_implementation_false',
]);

const V047_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'no_real_adapter_implementation',
  'no_mcp',
  'no_langgraph',
  'no_github_bot',
  'no_watcher',
  'no_daemon',
  'no_directory_scan',
  'no_glob',
  'no_directory_traversal',
  'no_symlink_escape',
  'no_url_input',
  'no_network_call',
]);

const V046_REPRODUCIBILITY_TOKENS = Object.freeze([
  'human_review_findings_go_no_go_record',
  'v0.4.6',
  'go_to_real_adapter_design_true',
  'go_to_real_adapter_implementation_false',
]);

const V046_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'design_only_allowed',
  'no_v0_5_alpha_implementation',
  'no_real_adapter',
  'no_framework_integration',
  'no_live_traffic',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V045_REPRODUCIBILITY_TOKENS = Object.freeze([
  'read_only_adapter_boundary_public_review_package',
  'v0.4.5',
]);

const V045_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'no_real_adapter',
  'no_framework_integration',
  'no_live_traffic',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const COMMON_FORBIDDEN_RESULT_FLAGS = Object.freeze([
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

const FORBIDDEN_CONVENIENCE_CLI_FLAGS = Object.freeze([
  '--directory',
  '--glob',
  '--watch',
  '--daemon',
  '--url',
  '--repo',
  '--network',
  '--tool',
  '--memory',
  '--config',
  '--publish',
  '--approve',
  '--block',
  '--allow',
]);

const RUNBOOK_FORBIDDEN_FLAGS = Object.freeze([
  'machineReadablePolicyDecision',
  'consumedByAgent',
  'authoritative',
  'mayApprove',
  'mayBlock',
  'mayAllow',
  'mayAuthorize',
  'mayEnforce',
  'runtimeIntegrated',
  'toolExecutionImplemented',
  'memoryWriteImplemented',
  'configWriteImplemented',
  'externalPublicationImplemented',
  'approvalPathImplemented',
  'blockingImplemented',
  'allowingImplemented',
  'authorizationImplemented',
  'enforcementImplemented',
  'automaticAgentConsumptionImplemented',
]);

const HAZARD_CATALOG_FORBIDDEN_FLAGS = Object.freeze([
  'rawInputAllowed',
  'urlInputAllowed',
  'directoryInputAllowed',
  'globAllowed',
  'directoryTraversalAllowed',
  'symlinkEscapeAllowed',
  'outputOutsideEvidenceAllowed',
  'agentConsumed',
  'machineReadablePolicyDecision',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

const FIRST_REAL_ADAPTER_DESIGN_NOTE_FORBIDDEN_FLAGS = Object.freeze([
  'globAllowed',
  'directoryInputAllowed',
  'directoryTraversalAllowed',
  'symlinkEscapeAllowed',
  'urlInputAllowed',
  'networkAllowed',
  'watcherAllowed',
  'daemonAllowed',
  'frameworkSdkAllowed',
  'mcpAllowed',
  'langGraphAllowed',
  'githubBotAllowed',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'agentInstruction',
  'approvalEmission',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

const HUMAN_REVIEW_GO_NO_GO_FORBIDDEN_FLAGS = Object.freeze([
  'realAdapterAuthorized',
  'frameworkIntegrationAuthorized',
  'liveTrafficAuthorized',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublicationByAdapter',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'authorization',
  'enforcement',
]);

const READ_ONLY_ADAPTER_PUBLIC_REVIEW_FORBIDDEN_FLAGS = Object.freeze([
  'realAdapterAuthorized',
  'frameworkIntegrationAuthorized',
  'liveTrafficAuthorized',
  'toolExecution',
  'memoryWrite',
  'configWrite',
  'externalPublication',
  'approvalEmission',
  'machineReadablePolicyDecision',
  'agentConsumed',
  'mayBlock',
  'mayAllow',
  'enforcement',
]);

const RUNBOOK_REQUIRED_TEXT = Object.freeze([
  'PR #3 negative controls',
  'PR #4 positive canary',
  'v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls',
  'v0.5.0-alpha-pr4-read-only-local-file-adapter-canary',
  'This final release command is intentionally not an applicable PR #5 gate while `MANIFEST.json` still targets `v0.4.8`',
  'A passing adapter canary is evidence of local read-only boundary preservation, not runtime authorization.',
  'Un canary pass del adapter prueba preservación local de frontera read-only; no autoriza runtime.',
]);

const STATUS_V050_ALPHA_REQUIRED_TEXT = Object.freeze([
  'first read-only local-file adapter alpha',
  'test:read-only-local-file-adapter-negative-controls',
  'test:read-only-local-file-adapter-canary',
  'A passing adapter canary is evidence of local read-only boundary preservation, not runtime authorization.',
  'Un canary pass del adapter prueba preservación local de frontera read-only; no autoriza runtime.',
]);

function assertSummary(summary, expected, label, assert) {
  for (const [field, expectedValue] of Object.entries(expected)) {
    assert(summary?.[field] === expectedValue, `${label} ${field} must be ${JSON.stringify(expectedValue)}`);
  }
}

function assertFalseFields(summary, fields, label, assert) {
  for (const field of fields) {
    assert(summary?.[field] === false, `${label} must keep ${field} false`);
  }
}

function assertAllIncluded(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertReadOnlyLocalFileAdapterManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag === 'v0.5.0-alpha') {
    assertAllIncluded(manifest.reproducibility, V050_ALPHA_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V050_ALPHA_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.4.8') {
    assertAllIncluded(manifest.reproducibility, V048_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V048_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.4.7') {
    assertAllIncluded(manifest.reproducibility, V047_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V047_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.4.6') {
    assertAllIncluded(manifest.reproducibility, V046_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V046_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.4.5') {
    assertAllIncluded(manifest.reproducibility, V045_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V045_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }
}

export function assertReadOnlyLocalFileAdapterRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  const readOnlyAdapterPublicReview = readJson(path.join(packageRoot, 'evidence/read-only-adapter-public-review-package-v0.4.5.out.json'));
  const humanReviewGoNoGo = readJson(path.join(packageRoot, 'evidence/read-only-adapter-human-review-go-no-go-v0.4.6.out.json'));
  const firstRealAdapterDesignNote = readJson(path.join(packageRoot, 'evidence/first-real-adapter-design-note-v0.4.7.out.json'));
  const adapterImplementationHazardCatalog = readJson(path.join(packageRoot, 'evidence/adapter-implementation-hazard-catalog-v0.4.8.out.json'));
  const readOnlyLocalFileAdapterSchema = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-schema.out.json'));
  const readOnlyLocalFileAdapter = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json'));
  const readOnlyLocalFileAdapterNegativeControls = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-negative-controls.out.json'));
  const readOnlyLocalFileAdapterCanary = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json'));
  const readOnlyLocalFileAdapterCanaryRunbook = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-canary-runbook.out.json'));
  const readOnlyLocalFileAdapterCanaryRunbookText = readFileSync(path.join(repoRoot, 'docs/read-only-local-file-adapter-canary-runbook.md'), 'utf8');

  assertSummary(readOnlyLocalFileAdapterSchema?.summary, {
    readOnlyLocalFileAdapterSchema: 'pass',
    schemaOnly: true,
    sourceAlreadyRedacted: true,
    redactionReviewRecordPresent: true,
    rawContentPersisted: false,
    recordOnly: true,
  }, 'read-only local-file adapter schema', assert);

  assertSummary(readOnlyLocalFileAdapter?.summary, {
    readOnlyLocalFileAdapter: 'pass',
    adapterSkeleton: true,
    adapterDecidesAuthority: false,
    callsExistingPipeline: true,
    sourceFileRead: true,
    sourceArtifactDigestVerified: true,
    parserEvidenceProduced: true,
    classifierDecisionProduced: true,
    decisionTraceProduced: true,
    advisoryReportProduced: true,
    recordOnly: true,
  }, 'read-only local-file adapter skeleton', assert);

  assertSummary(readOnlyLocalFileAdapterNegativeControls?.summary, {
    readOnlyLocalFileAdapterNegativeControls: 'pass',
    negativeCases: 17,
    unexpectedAccepts: 0,
    forbiddenEffects: 0,
    capabilityTrueCount: 0,
    sourceFilesRead: 0,
    forbiddenConvenienceCliFlagCases: 14,
    forbiddenConvenienceCliFlagAccepts: 0,
    forbiddenConvenienceCliFlagSourceFilesRead: 0,
    forbiddenConvenienceCliFlagSurfaceFindings: 0,
    networkPrimitiveFindings: 0,
    rawClassifierLeakFindings: 0,
  }, 'read-only local-file adapter negative controls', assert);
  assert(
    readOnlyLocalFileAdapterNegativeControls?.summary?.forbiddenConvenienceCliFlags?.length === FORBIDDEN_CONVENIENCE_CLI_FLAGS.length,
    'read-only local-file adapter forbidden convenience CLI flags must match the exact required set length',
  );
  assertAllIncluded(
    readOnlyLocalFileAdapterNegativeControls?.summary?.forbiddenConvenienceCliFlags ?? [],
    FORBIDDEN_CONVENIENCE_CLI_FLAGS,
    'read-only local-file adapter forbidden convenience CLI flags',
    assertIncludes,
  );

  assertSummary(readOnlyLocalFileAdapterCanary?.summary, {
    readOnlyLocalFileAdapterCanary: 'pass',
    positiveCases: 1,
    sourceFilesRead: 1,
    recordOnly: true,
    parserEvidenceProduced: true,
    classifierDecisionProduced: true,
    decisionTraceProduced: true,
    advisoryReportProduced: true,
    forbiddenEffects: 0,
    capabilityTrueCount: 0,
    rawClassifierDecisionPersisted: false,
    rawClassifierLeakFindings: 0,
  }, 'read-only local-file adapter canary', assert);

  assertSummary(readOnlyLocalFileAdapterCanaryRunbook?.summary, {
    readOnlyLocalFileAdapterCanaryRunbook: 'pass',
    missingRequiredPhrases: 0,
    missingRequiredSections: 0,
    forbiddenPhraseFindings: 0,
    missingCommands: 0,
    positiveCanaryPass: true,
    negativeControlsPass: true,
    dependsOnNegativeControls: true,
    dependsOnPositiveCanary: true,
    releaseCheckDeferredToPr6: true,
    recordOnly: true,
  }, 'read-only local-file adapter canary runbook', assert);

  assert(readOnlyLocalFileAdapterCanaryRunbook?.summary?.dependsOnLabels?.includes('PR #3 negative controls'), 'read-only local-file adapter canary runbook evidence must include PR #3 negative controls label');
  assert(readOnlyLocalFileAdapterCanaryRunbook?.summary?.dependsOnLabels?.includes('PR #4 positive canary'), 'read-only local-file adapter canary runbook evidence must include PR #4 positive canary label');
  assert(readOnlyLocalFileAdapterCanaryRunbook?.summary?.dependsOnSlugs?.includes('v0.5.0-alpha-pr3-read-only-local-file-adapter-negative-controls'), 'read-only local-file adapter canary runbook evidence must include PR #3 dependency slug');
  assert(readOnlyLocalFileAdapterCanaryRunbook?.summary?.dependsOnSlugs?.includes('v0.5.0-alpha-pr4-read-only-local-file-adapter-canary'), 'read-only local-file adapter canary runbook evidence must include PR #4 dependency slug');

  assertAllIncluded(readOnlyLocalFileAdapterCanaryRunbookText, RUNBOOK_REQUIRED_TEXT, 'read-only local-file adapter canary runbook', assertIncludes);

  assert(readOnlyLocalFileAdapter?.decisionTrace?.rawClassifierDecisionPersisted === false, 'read-only local-file adapter must not persist raw classifier decision');
  assert(readOnlyLocalFileAdapter?.classifierDecision === undefined, 'read-only local-file adapter evidence must not persist classifierDecision');
  assert(readOnlyLocalFileAdapterCanary?.classifierDecision === undefined, 'read-only local-file adapter canary evidence must not persist classifierDecision');

  assertFalseFields(readOnlyLocalFileAdapterSchema?.summary, COMMON_FORBIDDEN_RESULT_FLAGS, 'read-only local-file adapter schema', assert);
  assertFalseFields(readOnlyLocalFileAdapter?.summary, COMMON_FORBIDDEN_RESULT_FLAGS, 'read-only local-file adapter', assert);
  assertFalseFields(readOnlyLocalFileAdapterCanary?.summary, COMMON_FORBIDDEN_RESULT_FLAGS, 'read-only local-file adapter canary', assert);
  assertFalseFields(readOnlyLocalFileAdapterCanaryRunbook?.summary, RUNBOOK_FORBIDDEN_FLAGS, 'read-only local-file adapter canary runbook', assert);

  if (manifestReleaseTag === 'v0.4.7') {
    assertSummary(firstRealAdapterDesignNote?.summary, {
      firstRealAdapterDesignNote: 'pass',
      candidateAdapter: 'read_only_local_file_adapter',
      designOnly: true,
      implementationAuthorized: false,
      goToHazardCatalog: true,
      goToV050AlphaImplementation: false,
      inputLimit: 'one_explicit_already_redacted_local_file',
      outputLimit: 'evidence_record_only',
    }, 'first real adapter design note', assert);
    assertFalseFields(firstRealAdapterDesignNote?.summary, FIRST_REAL_ADAPTER_DESIGN_NOTE_FORBIDDEN_FLAGS, 'first real adapter design note', assert);
  }

  if (manifestReleaseTag === 'v0.4.6') {
    assertSummary(humanReviewGoNoGo?.summary, {
      adapterBoundaryHumanReview: 'pass',
      humanReviewFindingsGoNoGo: 'pass',
      reviewedRelease: 'v0.4.5',
      goForPublicReviewOnly: true,
      goToRealAdapterDesign: true,
      goToRealAdapterImplementation: false,
      requiresMaintainerDecisionForImplementation: true,
      openBlockingRisks: 0,
      independentLocalReviews: 2,
    }, 'human review go/no-go', assert);
    assertFalseFields(humanReviewGoNoGo?.summary, HUMAN_REVIEW_GO_NO_GO_FORBIDDEN_FLAGS, 'human review go/no-go', assert);
  }

  if (manifestReleaseTag === 'v0.4.5') {
    assertSummary(readOnlyAdapterPublicReview?.summary, {
      verdict: 'pass',
    }, 'read-only adapter public review', assert);
    assertFalseFields(readOnlyAdapterPublicReview?.summary, READ_ONLY_ADAPTER_PUBLIC_REVIEW_FORBIDDEN_FLAGS, 'read-only adapter public review', assert);
  }

  if (manifestReleaseTag === 'v0.4.8') {
    assertSummary(adapterImplementationHazardCatalog?.summary, {
      adapterImplementationHazardCatalog: 'pass',
      implementationAuthorized: false,
      goToV050AlphaCanaryIfStillGreen: true,
      hazardCases: 17,
      rejectedOrDowngraded: 17,
      unexpectedAccepts: 0,
    }, 'adapter implementation hazard catalog', assert);
    assertFalseFields(adapterImplementationHazardCatalog?.summary, HAZARD_CATALOG_FORBIDDEN_FLAGS, 'adapter implementation hazard catalog', assert);
  }

  if (manifestReleaseTag === 'v0.5.0-alpha') {
    const statusV050Alpha = readFileSync(path.join(repoRoot, 'docs/status-v0.5.0-alpha.md'), 'utf8');
    assertAllIncluded(statusV050Alpha, STATUS_V050_ALPHA_REQUIRED_TEXT, 'docs/status-v0.5.0-alpha.md', assertIncludes);
  }
}

export const readOnlyLocalFileAdapterSuite = Object.freeze({
  name: 'read-only-local-file-adapter',
  gatePhase: 'pre-live-shadow-synthetic',
  assertReleasePhase: 'final',
  gateScripts: readOnlyLocalFileAdapterGateScripts,
  requiredManifestPaths: readOnlyLocalFileAdapterRequiredManifestPaths,
  assertManifestMetadata: assertReadOnlyLocalFileAdapterManifestMetadata,
  assertRelease: assertReadOnlyLocalFileAdapterRelease,
});
