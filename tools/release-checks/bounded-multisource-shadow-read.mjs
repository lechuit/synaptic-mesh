import { readFileSync } from 'node:fs';
import path from 'node:path';

export const boundedMultisourceShadowReadGateScripts = Object.freeze([
  'test:bounded-multisource-shadow-read-protocol',
  'test:bounded-multisource-shadow-read-packet',
  'test:bounded-multisource-shadow-read-preflight-abort',
  'test:bounded-multisource-shadow-read-redaction-retention',
  'test:bounded-multisource-shadow-read-negative-controls',
  'test:bounded-multisource-shadow-read-reviewer-package'
]);

export const boundedMultisourceShadowReadRequiredManifestPaths = Object.freeze([
  'tools/release-checks/bounded-multisource-shadow-read.mjs',
  'docs/bounded-multisource-shadow-read-protocol-v0.20.0-alpha.md',
  'docs/bounded-multisource-shadow-read-packet-v0.20.1.md',
  'docs/bounded-multisource-shadow-read-preflight-abort-v0.20.2.md',
  'docs/bounded-multisource-shadow-read-redaction-retention-v0.20.3.md',
  'docs/bounded-multisource-shadow-read-negative-controls-v0.20.4.md',
  'docs/bounded-multisource-shadow-read-reviewer-package-v0.20.5.md',
  'docs/bounded-multisource-shadow-read-local-review-notes-v0.20.5.md',
  'docs/status-v0.20.0-alpha.md',
  'docs/status-v0.20.1.md',
  'docs/status-v0.20.2.md',
  'docs/status-v0.20.3.md',
  'docs/status-v0.20.4.md',
  'docs/status-v0.20.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/bounded-multisource-shadow-read.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/bounded-multisource-shadow-read.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/bounded-multisource-shadow-read-negative-controls-v0.20.4.json',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-protocol-v0.20.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-packet-v0.20.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-preflight-abort-v0.20.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-redaction-retention-v0.20.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-negative-controls-v0.20.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/bounded-multisource-shadow-read-reviewer-package-v0.20.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-protocol-v0.20.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-packet-v0.20.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-report-v0.20.1.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-preflight-abort-v0.20.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-redaction-retention-v0.20.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-negative-controls-v0.20.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/bounded-multisource-shadow-read-reviewer-package-v0.20.5.out.json'
]);

function all(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertBoundedMultisourceShadowReadManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.20.5') return;
  all(manifest.reproducibility, [
    'v0.20.5',
    'bounded_explicit_multisource_shadow_read',
    'multisource_barrier_crossed_true',
    'constrained_local_read_adapter',
    'multiple_explicit_repo_local_sources',
    'max_sources_3',
    'max_records_per_source_5',
    'max_total_records_12',
    'per_source_isolation',
    'failure_isolation',
    'redaction_before_persist',
    'redacted_evidence_only',
    'human_readable_report',
    'policy_decision_null',
    'agent_consumed_output_false',
    'raw_persisted_false',
    'unexpected_permits_0',
    'no_enforcement',
    'no_authorization',
    'no_external_effects'
  ], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, [
    'disabled_by_default',
    'manual_operator_run',
    'local_only',
    'passive_only',
    'read_only',
    'one_shot_only',
    'explicit_multisource_only',
    'no_globs_recursive_discovery',
    'no_implicit_sources',
    'no_outside_repo_paths',
    'no_symlinks',
    'no_network_resource_fetch',
    'no_daemon_watcher',
    'no_tool_execution',
    'no_memory_config_writes',
    'no_agent_consumed_machine_readable_policy_decisions',
    'no_approval_block_allow_authorization_enforcement',
    'no_external_effects',
    'not_runtime_authority'
  ], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertBoundedMultisourceShadowReadRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.20.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/bounded-multisource-shadow-read-reviewer-package-v0.20.5.out.json'));
  assert(phase?.summary?.boundedExplicitMultisourceShadowReadBarrierCrossed === true, 'v0.20.5 multisource barrier crossing must pass');
  assert(phase?.summary?.constrainedLocalReadAdapter === true, 'v0.20.5 constrained local adapter must pass');
  assert(phase?.summary?.sourceCount >= 2, 'v0.20.5 must read multiple explicit sources');
  assert(phase?.summary?.sourceCount <= 3, 'v0.20.5 max source count must hold');
  assert(phase?.summary?.recordsPerSourceLimit <= 5, 'v0.20.5 per-source record bound must hold');
  assert(phase?.summary?.totalRecordLimit <= 12, 'v0.20.5 total record bound must hold');
  assert(phase?.summary?.perSourceIsolation === true, 'v0.20.5 per-source isolation must pass');
  assert(phase?.summary?.perSourceFailureIsolation === true, 'v0.20.5 failure isolation must pass');
  assert(phase?.summary?.humanReadableReport === true, 'v0.20.5 human-readable report must exist');
  assert(phase?.summary?.redactionBeforePersist === true, 'v0.20.5 redaction-before-persist must hold');
  assert(phase?.summary?.policyDecision === null, 'v0.20.5 policyDecision must be null');
  for (const key of ['rawPersisted', 'rawOutput', 'agentConsumedOutput', 'externalEffects', 'enforcement', 'authorization', 'approvalBlockAllow', 'toolExecution', 'memoryConfigWrite', 'watcherDaemon', 'autonomousLiveMode', 'networkResourceFetch', 'globRecursiveDiscovery', 'implicitSources', 'outsideRepoPaths', 'symlinks']) assert(phase?.summary?.[key] === false, 'v0.20.5 ' + key + ' must be false');
  assert(phase?.summary?.unexpectedPermits === 0, 'v0.20.5 unexpectedPermits must be 0');
  const negative = readJson(path.join(packageRoot, 'evidence/bounded-multisource-shadow-read-negative-controls-v0.20.4.out.json'));
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.20.4 unexpectedPermits must be 0');
  assert(negative?.summary?.expectedRejects >= 30, 'v0.20.4 expected rejects must cover hazards');
  const report = readFileSync(path.join(packageRoot, 'evidence/bounded-multisource-shadow-read-report-v0.20.1.out.md'), 'utf8');
  all(report, ['Bounded Explicit Multisource Shadow-Read Report v0.20.5', 'Per-source isolation: true', 'policyDecision: null', 'agentConsumedOutput: false', 'unexpectedPermits: 0', 'Redacted evidence preview'], 'human report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['bounded explicit multisource shadow-read', 'multiple explicit repo-local file sources', 'max sources 3', 'max records per source 5', 'max total records 12', 'per-source isolation', 'per-source failure isolation', 'redaction-before-persist', 'redacted evidence only', 'human-readable report', 'policyDecision: null', 'agentConsumedOutput: false', 'unexpectedPermits: 0', 'no enforcement', 'no authorization', 'no approval/block/allow', 'no globs/recursive discovery', 'no implicit sources', 'no autonomous live mode', 'no watcher/daemon', 'no tool execution', 'no memory/config writes', 'no network/resource fetch', 'no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.20.5', 'bounded explicit multisource shadow-read', 'multiple explicit repo-local file sources', 'max sources 3', 'max records per source 5', 'max total records 12', 'per-source isolation', 'per-source failure isolation', 'policyDecision: null', 'agentConsumedOutput: false', 'rawPersisted: false', 'unexpectedPermits: 0', 'two independent local review notes', 'no enforcement', 'no authorization', 'no external effects'], 'RELEASE_NOTES.md', assertIncludes);
}

export const boundedMultisourceShadowReadSuite = Object.freeze({
  name: 'bounded-multisource-shadow-read',
  gatePhase: 'post-real-redacted',
  gateScripts: boundedMultisourceShadowReadGateScripts,
  requiredManifestPaths: boundedMultisourceShadowReadRequiredManifestPaths,
  assertManifestMetadata: assertBoundedMultisourceShadowReadManifestMetadata,
  assertRelease: assertBoundedMultisourceShadowReadRelease
});
