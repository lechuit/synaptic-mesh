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
  'test:read-only-local-file-adapter-reproducibility',
  'test:read-only-local-file-adapter-failure-catalog',
  'test:read-only-local-file-adapter-reviewer-runbook',
  'test:read-only-local-file-adapter-public-review-package',
  'test:read-only-local-file-batch-manifest-schema',
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
  'docs/status-v0.5.1.md',
  'docs/status-v0.5.2.md',
  'docs/status-v0.5.3.md',
  'docs/status-v0.5.4.md',
  'docs/status-v0.6.0-alpha.md',
  'docs/read-only-local-file-adapter-canary-runbook.md',
  'docs/read-only-local-file-adapter-reviewer-runbook.md',
  'docs/read-only-local-file-adapter-public-review-package.md',
  'docs/read-only-local-file-batch-manifest.md',
  'implementation/synaptic-mesh-shadow-v0/tests/adapter-implementation-hazard-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/adapter-implementation-hazard-catalog-v0.4.8.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/adapter-implementation-hazard-catalog-v0.4.8.out.json',
  'schemas/read-only-local-file-adapter-input.schema.json',
  'schemas/read-only-local-file-adapter-result.schema.json',
  'schemas/read-only-local-file-batch-manifest.schema.json',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-schema.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-negative-controls.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-canary.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-canary-runbook.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-reproducibility.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-failure-catalog.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-reviewer-runbook.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-adapter-public-review-package.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/read-only-local-file-batch-manifest-schema.mjs',
  'implementation/synaptic-mesh-shadow-v0/src/adapters/read-only-local-file-adapter.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-inputs.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-results.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-adapter-canary-runbook.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-batch-manifests.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-schema.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-canary-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-negative-controls.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-reproducibility.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-failure-catalog.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-reviewer-runbook.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-public-review-package.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-batch-manifest-schema.out.json',
]);

const V060_ALPHA_REPRODUCIBILITY_TOKENS = Object.freeze([
  'batch_manifest_schema_v0_6_0_alpha',
  'manifest_only_true',
  'schema_only_true',
  'batch_adapter_implemented_false',
  'batch_behavior_authorized_false',
  'manual_explicit_redacted_file_list',
  'explicit_input_list_only_true',
  'positive_cases_2',
  'negative_cases_8',
  'unexpected_accepts_0',
  'unexpected_rejects_0',
  'source_files_read_for_schema_cases_0',
  'max_input_count_5',
]);

const V060_ALPHA_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_batch_manifest_schema_alpha',
  'manifest_only',
  'schema_only',
  'no_batch_execution_yet',
  'no_batch_adapter_logic',
  'manual_explicit_redacted_file_list_only',
  'explicit_input_list_only',
  'max_input_count_5',
  'no_directory_discovery',
  'no_glob',
  'no_watcher',
  'no_daemon',
  'no_network_call',
  'no_live_traffic',
  'no_runtime_authorization',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V054_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_public_review_package_v0_5_4',
  'adapter_implemented_true',
  'framework_integration_authorized_false',
  'runtime_authorized_false',
  'tool_execution_false',
  'memory_write_false',
  'config_write_false',
  'external_publication_false',
  'agent_consumed_false',
  'machine_readable_policy_decision_false',
  'may_block_false',
  'may_allow_false',
  'enforcement_false',
]);

const V054_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_adapter_public_review_package_only',
  'phase_close_only',
  'explicit_already_redacted_file_only',
  'record_only_evidence_only',
  'no_runtime_authorization',
  'no_framework_integration_authorization',
  'no_enforcement',
  'no_network_call',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V053_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_reviewer_runbook_v0_5_3',
  'required_phrase_present',
  'missing_required_phrases_0',
  'missing_required_sections_0',
  'missing_commands_0',
  'forbidden_phrase_findings_0',
  'failure_cases_30',
  'source_files_read_for_rejected_cases_0',
]);

const V053_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_adapter_reviewer_runbook_only',
  'human_review_guidance_only',
  'explicit_already_redacted_file_only',
  'record_only_evidence_only',
  'no_runtime_authorization',
  'no_enforcement',
  'no_network_call',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V052_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_failure_catalog_v0_5_2',
  'failure_cases_30',
  'unexpected_accepts_0',
  'source_files_read_for_rejected_cases_0',
  'forbidden_effects_0',
  'capability_true_count_0',
]);

const V052_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_adapter_failure_catalog_only',
  'explicit_already_redacted_file_only',
  'record_only_evidence_only',
  'no_runtime_authorization',
  'no_enforcement',
  'no_network_call',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
]);

const V051_REPRODUCIBILITY_TOKENS = Object.freeze([
  'adapter_reproducibility_v0_5_1',
  'same_input_same_normalized_evidence',
  'runs_2',
  'positive_cases_1',
  'normalized_output_mismatches_0',
  'decision_trace_hash_mismatches_0',
  'advisory_report_hash_mismatches_0',
  'forbidden_effects_0',
  'capability_true_count_0',
]);

const V051_RUNTIME_BOUNDARY_TOKENS = Object.freeze([
  'read_only_local_file_adapter_reproducibility_only',
  'explicit_already_redacted_file_only',
  'record_only_evidence_only',
  'no_runtime_authorization',
  'no_enforcement',
  'no_network_call',
  'no_tool_execution',
  'no_memory_write',
  'no_config_write',
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

const OUTPUT_CONTAINMENT_ROWS = Object.freeze([
  { id: 'O01', hazard: 'caller_selected_relative_parent_escape_evidence_path', reason: 'read-only local-file adapter evidence path is fixed' },
  { id: 'O02', hazard: 'caller_selected_relative_parent_escape_output_path', reason: 'read-only local-file adapter evidence path is fixed' },
  { id: 'O03', hazard: 'caller_selected_absolute_path_outside_evidence', reason: 'read-only local-file adapter evidence path is fixed' },
  { id: 'O04', hazard: 'caller_selected_output_in_fixtures_source', reason: 'read-only local-file adapter evidence path is fixed' },
  { id: 'O05', hazard: 'caller_selected_existing_file_overwrite', reason: 'read-only local-file adapter evidence path is fixed' },
  { id: 'O06', hazard: 'fixed_evidence_target_symlink_output', reason: 'evidence output path must not be symlink' },
  { id: 'O07', hazard: 'fixed_evidence_parent_symlink_escape', reason: 'adapter evidence directory must not be symlink' },
  { id: 'O08', hazard: 'evidence_root_symlink_escape', reason: 'evidence root must not be symlink' },
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
  if (manifestReleaseTag === 'v0.6.0-alpha') {
    assertAllIncluded(manifest.reproducibility, V060_ALPHA_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V060_ALPHA_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.4') {
    assertAllIncluded(manifest.reproducibility, V054_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V054_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.3') {
    assertAllIncluded(manifest.reproducibility, V053_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V053_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.2') {
    assertAllIncluded(manifest.reproducibility, V052_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V052_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.1') {
    assertAllIncluded(manifest.reproducibility, V051_REPRODUCIBILITY_TOKENS, 'MANIFEST.json reproducibility', assertIncludes);
    assertAllIncluded(manifest.runtimeBoundary, V051_RUNTIME_BOUNDARY_TOKENS, 'MANIFEST.json runtimeBoundary', assertIncludes);
  }

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
  const readOnlyLocalFileAdapterReproducibility = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-reproducibility.out.json'));
  const readOnlyLocalFileAdapterFailureCatalog = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-failure-catalog.out.json'));
  const readOnlyLocalFileAdapterReviewerRunbook = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-reviewer-runbook.out.json'));
  const readOnlyLocalFileAdapterPublicReviewPackage = readJson(path.join(packageRoot, 'evidence/read-only-local-file-adapter-public-review-package.out.json'));
  const readOnlyLocalFileBatchManifestSchema = readJson(path.join(packageRoot, 'evidence/read-only-local-file-batch-manifest-schema.out.json'));
  const readOnlyLocalFileAdapterCanaryRunbookText = readFileSync(path.join(repoRoot, 'docs/read-only-local-file-adapter-canary-runbook.md'), 'utf8');
  const readOnlyLocalFileAdapterReviewerRunbookText = readFileSync(path.join(repoRoot, 'docs/read-only-local-file-adapter-reviewer-runbook.md'), 'utf8');
  const readOnlyLocalFileAdapterPublicReviewPackageText = readFileSync(path.join(repoRoot, 'docs/read-only-local-file-adapter-public-review-package.md'), 'utf8');
  const readOnlyLocalFileBatchManifestText = readFileSync(path.join(repoRoot, 'docs/read-only-local-file-batch-manifest.md'), 'utf8');

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
    outputContainmentCases: 8,
    outputContainmentUnexpectedAccepts: 0,
    outputContainmentForbiddenPathCreations: 0,
    outputContainmentProtectedFileMutations: 0,
    networkPrimitiveFindings: 0,
    rawClassifierLeakFindings: 0,
  }, 'read-only local-file adapter negative controls', assert);
  assert(
    readOnlyLocalFileAdapterNegativeControls?.outputContainmentRows?.length === 8,
    'read-only local-file adapter output containment rows must cover exactly 8 cases',
  );
  const outputContainmentRows = readOnlyLocalFileAdapterNegativeControls?.outputContainmentRows ?? [];
  assert(
    new Set(outputContainmentRows.map((row) => row.id)).size === OUTPUT_CONTAINMENT_ROWS.length,
    'read-only local-file adapter output containment rows must not contain duplicate IDs',
  );
  for (const expected of OUTPUT_CONTAINMENT_ROWS) {
    const row = outputContainmentRows.find((candidate) => candidate.id === expected.id);
    assert(row, `read-only local-file adapter output containment must include ${expected.id}`);
    assert(row.hazard === expected.hazard, `read-only local-file adapter output containment ${expected.id} must keep hazard ${expected.hazard}`);
    assert(row.reasons?.includes(expected.reason), `read-only local-file adapter output containment ${expected.id} must include reason ${expected.reason}`);
  }
  for (const row of outputContainmentRows) {
    assert(row.accepted === false, `read-only local-file adapter output containment ${row.id} must reject`);
    assert(row.forbiddenPathCreated === false, `read-only local-file adapter output containment ${row.id} must not create forbidden paths`);
    assert(row.protectedFileMutated === false, `read-only local-file adapter output containment ${row.id} must not mutate protected files`);
    assert(row.forbiddenEffects === 0, `read-only local-file adapter output containment ${row.id} must have zero forbidden effects`);
  }
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

  assertSummary(readOnlyLocalFileAdapterReproducibility?.summary, {
    readOnlyLocalFileAdapterReproducibility: 'pass',
    runs: 2,
    positiveCases: 1,
    normalizedOutputMismatches: 0,
    decisionTraceHashMismatches: 0,
    advisoryReportHashMismatches: 0,
    forbiddenEffects: 0,
    capabilityTrueCount: 0,
  }, 'read-only local-file adapter reproducibility', assert);
  assert(
    readOnlyLocalFileAdapterReproducibility?.volatileFieldsExcludedFromHashes?.includes('generatedAt')
      && readOnlyLocalFileAdapterReproducibility?.volatileFieldsExcludedFromHashes?.includes('durationMs')
      && readOnlyLocalFileAdapterReproducibility?.volatileFieldsExcludedFromHashes?.includes('runId')
      && readOnlyLocalFileAdapterReproducibility?.volatileFieldsExcludedFromHashes?.includes('adapterRunId'),
    'read-only local-file adapter reproducibility must exclude generatedAt, durationMs, runId, and adapterRunId from hashes',
  );
  for (const required of ['inputDigest', 'sourceArtifactDigest', 'sourceArtifactContentDigest', 'selectedRoute', 'reasonCodes', 'classifierDecisionDigest', 'decisionTraceHash', 'advisoryReportHash', 'advisoryReportNormalizedContent', 'recordOnly', 'capabilityFlags', 'boundaryVerdicts']) {
    assert(
      readOnlyLocalFileAdapterReproducibility?.includedInNormalizedHash?.includes(required),
      `read-only local-file adapter reproducibility normalized hash must include ${required}`,
    );
  }
  const reproducibilityRuns = readOnlyLocalFileAdapterReproducibility?.runs ?? [];
  assert(reproducibilityRuns.length === 2, 'read-only local-file adapter reproducibility must record exactly two runs');
  assert(new Set(reproducibilityRuns.map((run) => run.normalizedOutputHash)).size === 1, 'read-only local-file adapter reproducibility normalized output hash must match across runs');
  assert(new Set(reproducibilityRuns.map((run) => run.decisionTraceHash)).size === 1, 'read-only local-file adapter reproducibility DecisionTrace hash must match across runs');
  assert(new Set(reproducibilityRuns.map((run) => run.advisoryReportHash)).size === 1, 'read-only local-file adapter reproducibility advisory report hash must match across runs');
  assert(readOnlyLocalFileAdapterReproducibility?.baselineNormalizedOutput?.sourceArtifactDigest === 'sha256:fc594bd17819b1005b813cbb195e9d12195766c4b0b05d020a590180f579cb75', 'read-only local-file adapter reproducibility baseline must bind source artifact digest');
  assert(readOnlyLocalFileAdapterReproducibility?.baselineNormalizedOutput?.recordOnly === true, 'read-only local-file adapter reproducibility baseline must stay record-only');
  assert(readOnlyLocalFileAdapterReproducibility?.baselineNormalizedOutput?.boundaryVerdicts?.notAuthority === true, 'read-only local-file adapter reproducibility advisory must remain non-authority');
  assert(readOnlyLocalFileAdapterReproducibility?.baselineNormalizedOutput?.capabilityFlags?.toolExecution === false, 'read-only local-file adapter reproducibility must keep toolExecution false');

  assertSummary(readOnlyLocalFileAdapterFailureCatalog?.summary, {
    readOnlyLocalFileAdapterFailureCatalog: 'pass',
    failureCases: 30,
    unexpectedAccepts: 0,
    sourceFilesReadForRejectedCases: 0,
    forbiddenEffects: 0,
    capabilityTrueCount: 0,
  }, 'read-only local-file adapter failure catalog', assert);
  assert(readOnlyLocalFileAdapterFailureCatalog?.rows?.length === 30, 'read-only local-file adapter failure catalog must contain exactly 30 rows');
  assert(new Set((readOnlyLocalFileAdapterFailureCatalog?.rows ?? []).map((row) => row.id)).size === 30, 'read-only local-file adapter failure catalog IDs must be unique');
  for (const row of readOnlyLocalFileAdapterFailureCatalog?.rows ?? []) {
    assert(row.accepted === false, `read-only local-file adapter failure catalog ${row.id} must reject`);
    assert(row.sourceFileRead === false, `read-only local-file adapter failure catalog ${row.id} must not read source files`);
    assert(row.forbiddenEffects === 0, `read-only local-file adapter failure catalog ${row.id} must have zero forbidden effects`);
    assert(row.capabilityTrueCount === 0, `read-only local-file adapter failure catalog ${row.id} must have zero capability true count`);
  }

  assertSummary(readOnlyLocalFileAdapterReviewerRunbook?.summary, {
    readOnlyLocalFileAdapterReviewerRunbook: 'pass',
    missingRequiredPhrases: 0,
    missingRequiredSections: 0,
    missingCommands: 0,
    forbiddenPhraseFindings: 0,
    failureCases: 30,
    sourceFilesReadForRejectedCases: 0,
    recordOnly: true,
  }, 'read-only local-file adapter reviewer runbook', assert);
  assertFalseFields(readOnlyLocalFileAdapterReviewerRunbook?.summary, RUNBOOK_FORBIDDEN_FLAGS, 'read-only local-file adapter reviewer runbook', assert);
  assertAllIncluded(readOnlyLocalFileAdapterReviewerRunbookText, [
    'A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.',
    'Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.',
    'test:read-only-local-file-adapter-reviewer-runbook',
  ], 'read-only local-file adapter reviewer runbook', assertIncludes);

  assertSummary(readOnlyLocalFileAdapterPublicReviewPackage?.summary, {
    readOnlyLocalFileAdapterPublicReviewPackage: 'pass',
    adapterImplemented: true,
    frameworkIntegrationAuthorized: false,
    runtimeAuthorized: false,
    toolExecution: false,
    memoryWrite: false,
    configWrite: false,
    externalPublication: false,
    agentConsumed: false,
    machineReadablePolicyDecision: false,
    mayBlock: false,
    mayAllow: false,
    enforcement: false,
  }, 'read-only local-file adapter public review package', assert);
  assertAllIncluded(readOnlyLocalFileAdapterPublicReviewPackageText, [
    'This package closes the read-only local-file adapter review phase',
    'A passing public review package is evidence that this local adapter review phase stayed within boundary.',
    'The next phase, if any, must be explicitly authorized separately and must not inherit permission from this package.',
    'test:read-only-local-file-adapter-public-review-package',
  ], 'read-only local-file adapter public review package', assertIncludes);

  assertSummary(readOnlyLocalFileBatchManifestSchema?.summary, {
    readOnlyLocalFileBatchManifestSchema: 'pass',
    releaseLayer: 'v0.6.0-alpha',
    manifestOnly: true,
    schemaOnly: true,
    batchAdapterImplemented: false,
    batchBehaviorAuthorized: false,
    positiveCases: 2,
    negativeCases: 8,
    unexpectedAccepts: 0,
    unexpectedRejects: 0,
    sourceFilesReadForSchemaCases: 0,
    maxInputCount: 5,
    directoryDiscovery: false,
    globAllowed: false,
    watcherAllowed: false,
    daemonAllowed: false,
    networkAllowed: false,
    liveTrafficAllowed: false,
    recordOnly: true,
    adapterRuntimeChanged: false,
    authorization: false,
    enforcement: false,
  }, 'read-only local-file batch manifest schema', assert);
  assertFalseFields(readOnlyLocalFileBatchManifestSchema?.summary, COMMON_FORBIDDEN_RESULT_FLAGS, 'read-only local-file batch manifest schema', assert);
  assertAllIncluded(readOnlyLocalFileBatchManifestText, [
    'A passing batch manifest schema gate is evidence that the batch contract is narrow and explicit, not authorization to process multiple files.',
    'manifest only, no batch execution yet',
    'manual_explicit_redacted_file_list',
    'test:read-only-local-file-batch-manifest-schema',
    'The next phase, if any, must be explicitly authorized separately.',
  ], 'read-only local-file batch manifest doc', assertIncludes);

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

  if (manifestReleaseTag === 'v0.6.0-alpha') {
    const statusV060Alpha = readFileSync(path.join(repoRoot, 'docs/status-v0.6.0-alpha.md'), 'utf8');
    assertAllIncluded(statusV060Alpha, [
      'explicit batch manifest schema alpha',
      'manifest only, no batch execution yet',
      'test:read-only-local-file-batch-manifest-schema',
      'readOnlyLocalFileBatchManifestSchema',
      'sourceFilesReadForSchemaCases',
      'maxInputCount',
      'batchAdapterImplemented',
      'batchBehaviorAuthorized',
      'A passing batch manifest schema gate is evidence that the batch contract is narrow and explicit, not authorization to process multiple files.',
    ], 'docs/status-v0.6.0-alpha.md', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.4') {
    const statusV054 = readFileSync(path.join(repoRoot, 'docs/status-v0.5.4.md'), 'utf8');
    assertAllIncluded(statusV054, [
      'public review package',
      'test:read-only-local-file-adapter-public-review-package',
      'readOnlyLocalFileAdapterPublicReviewPackage',
      'adapterImplemented',
      'frameworkIntegrationAuthorized',
      'runtimeAuthorized',
    ], 'docs/status-v0.5.4.md', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.3') {
    const statusV053 = readFileSync(path.join(repoRoot, 'docs/status-v0.5.3.md'), 'utf8');
    assertAllIncluded(statusV053, [
      'reviewer runbook',
      'test:read-only-local-file-adapter-reviewer-runbook',
      'readOnlyLocalFileAdapterReviewerRunbook',
      'A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.',
    ], 'docs/status-v0.5.3.md', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.2') {
    const statusV052 = readFileSync(path.join(repoRoot, 'docs/status-v0.5.2.md'), 'utf8');
    assertAllIncluded(statusV052, [
      'failure catalog',
      'test:read-only-local-file-adapter-failure-catalog',
      'failureCases',
      'sourceFilesReadForRejectedCases',
      'A passing failure catalog is evidence that the listed rejected/prohibited local adapter cases stayed rejected and record-only. It is not runtime authorization.',
    ], 'docs/status-v0.5.2.md', assertIncludes);
  }

  if (manifestReleaseTag === 'v0.5.1') {
    const statusV051 = readFileSync(path.join(repoRoot, 'docs/status-v0.5.1.md'), 'utf8');
    assertAllIncluded(statusV051, [
      'Adapter reproducibility',
      'test:read-only-local-file-adapter-reproducibility',
      'normalizedOutputMismatches',
      'decisionTraceHashMismatches',
      'advisoryReportHashMismatches',
      'A passing reproducibility gate is evidence of deterministic local record-only output, not runtime authorization.',
    ], 'docs/status-v0.5.1.md', assertIncludes);
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
