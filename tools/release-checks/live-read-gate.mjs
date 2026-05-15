import { readFileSync } from 'node:fs';
import path from 'node:path';

export const liveReadGateGateScripts = Object.freeze([
  'test:live-read-gate-protocol',
  'test:live-read-gate-packet',
  'test:live-read-gate-preflight-abort',
  'test:live-read-gate-redaction-retention',
  'test:live-read-gate-negative-controls',
  'test:live-read-gate-reviewer-package'
]);

export const liveReadGateRequiredManifestPaths = Object.freeze([
  'tools/release-checks/live-read-gate.mjs',
  'docs/live-read-gate-protocol-v0.18.0-alpha.md',
  'docs/live-read-gate-packet-v0.18.1.md',
  'docs/live-read-gate-preflight-abort-v0.18.2.md',
  'docs/live-read-gate-redaction-retention-v0.18.3.md',
  'docs/live-read-gate-negative-controls-v0.18.4.md',
  'docs/live-read-gate-reviewer-package-v0.18.5.md',
  'docs/live-read-gate-local-review-notes-v0.18.5.md',
  'docs/status-v0.18.0-alpha.md',
  'docs/status-v0.18.1.md',
  'docs/status-v0.18.2.md',
  'docs/status-v0.18.3.md',
  'docs/status-v0.18.4.md',
  'docs/status-v0.18.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/live-read-gate.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/live-read-gate.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/live-read-gate-negative-controls-v0.18.4.json',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-protocol-v0.18.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-packet-v0.18.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-preflight-abort-v0.18.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-redaction-retention-v0.18.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-negative-controls-v0.18.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-read-gate-reviewer-package-v0.18.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-protocol-v0.18.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-packet-v0.18.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-preflight-abort-v0.18.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-redaction-retention-v0.18.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-negative-controls-v0.18.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-read-gate-reviewer-package-v0.18.5.out.json'
]);

function all(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertLiveReadGateManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.18.5') return;
  all(manifest.reproducibility, [
    'v0.18.5',
    'live_read_gate',
    'live_input_ingestion_barrier_crossed_true',
    'one_shot_explicit_repo_local_source',
    'bounded_records',
    'redacted_evidence_only',
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

export function assertLiveReadGateRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.18.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/live-read-gate-reviewer-package-v0.18.5.out.json'));
  assert(phase?.summary?.liveReadBarrierCrossed === true, 'v0.18.5 live-read barrier crossing must pass');
  assert(phase?.summary?.liveInputIngestionReadGate === true, 'v0.18.5 live input ingestion read gate must pass');
  assert(phase?.summary?.disabledManualOperatorRunLocalPassiveReadOnly === true, 'v0.18.5 boundary must pass');
  assert(phase?.summary?.policyDecision === null, 'v0.18.5 policyDecision must be null');
  for (const key of ['rawPersisted', 'rawOutput', 'agentConsumedOutput', 'externalEffects', 'enforcement', 'authorization', 'approvalBlockAllow', 'toolExecution', 'memoryConfigWrite', 'watcherDaemon', 'autonomousLiveMode', 'networkResourceFetch', 'batchMode']) assert(phase?.summary?.[key] === false, 'v0.18.5 ' + key + ' must be false');
  assert(phase?.summary?.unexpectedPermits === 0, 'v0.18.5 unexpectedPermits must be 0');
  const negative = readJson(path.join(packageRoot, 'evidence/live-read-gate-negative-controls-v0.18.4.out.json'));
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.18.4 unexpectedPermits must be 0');
  assert(negative?.summary?.expectedRejects >= 20, 'v0.18.4 expected rejects must cover hazards');
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['live-read gate', 'first controlled crossing of the live input ingestion barrier', 'one-shot explicit repo-local source', 'bounded records', 'redacted evidence only', 'policyDecision: null', 'agentConsumedOutput: false', 'rawPersisted: false', 'unexpectedPermits: 0', 'no enforcement', 'no authorization', 'no approval/block/allow', 'no autonomous live mode', 'no watcher/daemon', 'no tool execution', 'no memory/config writes', 'no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.18.5', 'live-read gate', 'first controlled crossing of the live input ingestion barrier', 'policyDecision: null', 'agentConsumedOutput: false', 'rawPersisted: false', 'unexpectedPermits: 0', 'two independent local review notes', 'no enforcement', 'no authorization', 'no external effects'], 'RELEASE_NOTES.md', assertIncludes);
}

export const liveReadGateSuite = Object.freeze({
  name: 'live-read-gate',
  gatePhase: 'post-real-redacted',
  gateScripts: liveReadGateGateScripts,
  requiredManifestPaths: liveReadGateRequiredManifestPaths,
  assertManifestMetadata: assertLiveReadGateManifestMetadata,
  assertRelease: assertLiveReadGateRelease
});
