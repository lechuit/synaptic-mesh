import { readFileSync } from 'node:fs';
import path from 'node:path';

export const liveAdapterShadowReadGateScripts = Object.freeze([
  'test:live-adapter-shadow-read-protocol',
  'test:live-adapter-shadow-read-packet',
  'test:live-adapter-shadow-read-preflight-abort',
  'test:live-adapter-shadow-read-redaction-retention',
  'test:live-adapter-shadow-read-negative-controls',
  'test:live-adapter-shadow-read-reviewer-package'
]);

export const liveAdapterShadowReadRequiredManifestPaths = Object.freeze([
  'tools/release-checks/live-adapter-shadow-read.mjs',
  'docs/live-adapter-shadow-read-protocol-v0.19.0-alpha.md',
  'docs/live-adapter-shadow-read-packet-v0.19.1.md',
  'docs/live-adapter-shadow-read-preflight-abort-v0.19.2.md',
  'docs/live-adapter-shadow-read-redaction-retention-v0.19.3.md',
  'docs/live-adapter-shadow-read-negative-controls-v0.19.4.md',
  'docs/live-adapter-shadow-read-reviewer-package-v0.19.5.md',
  'docs/live-adapter-shadow-read-local-review-notes-v0.19.5.md',
  'docs/status-v0.19.0-alpha.md',
  'docs/status-v0.19.1.md',
  'docs/status-v0.19.2.md',
  'docs/status-v0.19.3.md',
  'docs/status-v0.19.4.md',
  'docs/status-v0.19.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/live-adapter-shadow-read.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/live-adapter-shadow-read.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/live-adapter-shadow-read-negative-controls-v0.19.4.json',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-protocol-v0.19.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-packet-v0.19.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-preflight-abort-v0.19.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-redaction-retention-v0.19.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-negative-controls-v0.19.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-adapter-shadow-read-reviewer-package-v0.19.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-protocol-v0.19.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-packet-v0.19.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-report-v0.19.1.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-preflight-abort-v0.19.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-redaction-retention-v0.19.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-negative-controls-v0.19.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-adapter-shadow-read-reviewer-package-v0.19.5.out.json'
]);

function all(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertLiveAdapterShadowReadManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.19.5') return;
  all(manifest.reproducibility, [
    'v0.19.5',
    'live_adapter_shadow_read',
    'local_adapter_shadow_read_barrier_crossed_true',
    'constrained_local_read_adapter',
    'one_shot_explicit_repo_local_source',
    'bounded_window_count',
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
    'constrained_local_read_adapter_only',
    'single_explicit_local_source_only',
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

export function assertLiveAdapterShadowReadRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.19.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/live-adapter-shadow-read-reviewer-package-v0.19.5.out.json'));
  assert(phase?.summary?.liveAdapterShadowReadBarrierCrossed === true, 'v0.19.5 adapter shadow-read barrier crossing must pass');
  assert(phase?.summary?.localAdapterShadowReadGate === true, 'v0.19.5 local adapter shadow-read gate must pass');
  assert(phase?.summary?.constrainedLocalReadAdapter === true, 'v0.19.5 constrained local adapter must pass');
  assert(phase?.summary?.humanReadableReport === true, 'v0.19.5 human-readable report must exist');
  assert(phase?.summary?.policyDecision === null, 'v0.19.5 policyDecision must be null');
  for (const key of ['rawPersisted', 'rawOutput', 'agentConsumedOutput', 'externalEffects', 'enforcement', 'authorization', 'approvalBlockAllow', 'toolExecution', 'memoryConfigWrite', 'watcherDaemon', 'autonomousLiveMode', 'networkResourceFetch', 'batchMode']) assert(phase?.summary?.[key] === false, 'v0.19.5 ' + key + ' must be false');
  assert(phase?.summary?.unexpectedPermits === 0, 'v0.19.5 unexpectedPermits must be 0');
  const negative = readJson(path.join(packageRoot, 'evidence/live-adapter-shadow-read-negative-controls-v0.19.4.out.json'));
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.19.4 unexpectedPermits must be 0');
  assert(negative?.summary?.expectedRejects >= 30, 'v0.19.4 expected rejects must cover hazards');
  const report = readFileSync(path.join(packageRoot, 'evidence/live-adapter-shadow-read-report-v0.19.1.out.md'), 'utf8');
  all(report, ['Live Adapter Shadow-Read Report v0.19.5', 'policyDecision: null', 'agentConsumedOutput: false', 'unexpectedPermits: 0', 'Redacted evidence preview'], 'human report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['live-adapter shadow-read', 'minimal constrained local read adapter abstraction', 'operator-run one-shot', 'local-only', 'passive/read-only', 'bounded window/count', 'redaction-before-persist', 'redacted evidence only', 'human-readable report', 'policyDecision: null', 'agentConsumedOutput: false', 'unexpectedPermits: 0', 'no enforcement', 'no authorization', 'no approval/block/allow', 'no autonomous live mode', 'no watcher/daemon', 'no tool execution', 'no memory/config writes', 'no network/resource fetch', 'no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.19.5', 'live-adapter shadow-read', 'minimal constrained local read adapter abstraction', 'policyDecision: null', 'agentConsumedOutput: false', 'rawPersisted: false', 'unexpectedPermits: 0', 'two independent local review notes', 'no enforcement', 'no authorization', 'no external effects'], 'RELEASE_NOTES.md', assertIncludes);
}

export const liveAdapterShadowReadSuite = Object.freeze({
  name: 'live-adapter-shadow-read',
  gatePhase: 'post-real-redacted',
  gateScripts: liveAdapterShadowReadGateScripts,
  requiredManifestPaths: liveAdapterShadowReadRequiredManifestPaths,
  assertManifestMetadata: assertLiveAdapterShadowReadManifestMetadata,
  assertRelease: assertLiveAdapterShadowReadRelease
});
