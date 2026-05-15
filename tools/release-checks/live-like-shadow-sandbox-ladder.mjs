import { readFileSync } from 'node:fs';
import path from 'node:path';

export const liveLikeShadowSandboxGateScripts = Object.freeze([
  'test:live-like-shadow-observation-envelope',
  'test:live-like-shadow-replay-harness',
  'test:live-like-shadow-compare-only-scorecards',
  'test:live-like-shadow-sandbox-failure-catalog',
  'test:live-like-shadow-reviewer-package',
  'test:live-like-shadow-phase-close'
]);

export const liveLikeShadowSandboxRequiredManifestPaths = Object.freeze([
  'tools/release-checks/live-like-shadow-sandbox-ladder.mjs',
  'schemas/live-like-shadow-observation-envelope-v0.14.0.schema.json',
  'docs/live-like-shadow-observation-envelope-v0.14.0-alpha.md',
  'docs/live-like-shadow-replay-harness-v0.14.1.md',
  'docs/live-like-shadow-compare-only-scorecards-v0.14.2.md',
  'docs/live-like-shadow-sandbox-failure-catalog-v0.14.3.md',
  'docs/live-like-shadow-reviewer-package-v0.14.4.md',
  'docs/live-like-shadow-phase-close-v0.14.5.md',
  'docs/status-v0.14.0-alpha.md',
  'docs/status-v0.14.1.md',
  'docs/status-v0.14.2.md',
  'docs/status-v0.14.3.md',
  'docs/status-v0.14.4.md',
  'docs/status-v0.14.5.md',
  'implementation/synaptic-mesh-shadow-v0/fixtures/live-like-shadow-observation-v0.14.0-alpha.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/live-like-shadow-negative-controls-v0.14.3.json',
  'implementation/synaptic-mesh-shadow-v0/src/live-like-shadow-replay.mjs',
  'implementation/synaptic-mesh-shadow-v0/src/live-like-shadow-scorecard.mjs',
  'implementation/synaptic-mesh-shadow-v0/src/live-like-shadow-negative-controls.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/live-like-shadow-replay.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-observation-envelope-v0.14.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-replay-harness-v0.14.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-compare-only-scorecards-v0.14.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-sandbox-failure-catalog-v0.14.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-reviewer-package-v0.14.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/live-like-shadow-phase-close-v0.14.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-observation-envelope-v0.14.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-replay-harness-v0.14.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-compare-only-scorecards-v0.14.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-sandbox-failure-catalog-v0.14.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-reviewer-package-v0.14.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/live-like-shadow-phase-close-v0.14.5.out.json'
]);

function assertAllIncluded(text, phrases, label, assertIncludes) {
  for (const phrase of phrases) assertIncludes(text, phrase, label);
}

export function assertLiveLikeShadowSandboxManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.14.5') return;
  assertAllIncluded(manifest.reproducibility, [
    'v0.14.5',
    'live_like_shadow_sandbox_readiness_achieved',
    'ready_to_design_v0.15_passive_live_shadow_true',
    'negative_controls_5',
    'unexpected_permits_0',
    'live_traffic_false',
    'tools_false',
    'runtime_authority_false',
    'enforcement_false'
  ], 'MANIFEST.json reproducibility', assertIncludes);
  assertAllIncluded(manifest.runtimeBoundary, [
    'live_like_shadow_sandbox',
    'offline_frozen_already_redacted',
    'no_runtime',
    'no_real_framework_adapter',
    'no_mcp_server_client',
    'no_langgraph_sdk',
    'no_a2a_runtime',
    'no_github_bot_webhook',
    'no_network_call',
    'no_live_traffic',
    'no_tool_call',
    'no_watcher',
    'no_daemon',
    'no_memory_write',
    'no_config_write',
    'no_agent_consumption',
    'no_machine_readable_policy',
    'no_approval_blocking_allowing_authorization_or_enforcement',
    'not_runtime_authority'
  ], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertLiveLikeShadowSandboxRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.14.5') return;
  const evidence = readJson(path.join(packageRoot, 'evidence/live-like-shadow-phase-close-v0.14.5.out.json'));
  assert(evidence?.summary?.phaseClose === 'pass', 'phase close evidence must pass');
  assert(evidence?.summary?.liveLikeShadowSandboxReadinessAchieved === true, 'live-like shadow/sandbox readiness must be achieved');
  assert(evidence?.summary?.readyToDesignV015PassiveLiveShadow === true, 'v0.15 design readiness must be true');
  for (const key of ['liveTraffic', 'tools', 'runtimeAuthority', 'enforcement', 'runtimeIntegration', 'realFrameworkAdapter', 'networkAllowed', 'watcherDaemon', 'agentConsumed', 'machineReadablePolicyDecision', 'authorization']) assert(evidence?.summary?.[key] === false, `phase close ${key} must remain false`);
  assert(evidence?.summary?.negativeControls === 5, 'phase close negativeControls must be 5');
  assert(evidence?.summary?.unexpectedPermits === 0, 'phase close unexpectedPermits must be 0');
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  assertAllIncluded(readme, ['live-like shadow/sandbox readiness achieved', 'ready to design v0.15 passive live shadow', 'no live traffic', 'no tools', 'no runtime authority', 'no enforcement', 'not runtime authority'], 'README.md', assertIncludes);
  assertAllIncluded(notes, ['v0.14.5', 'live-like shadow/sandbox readiness achieved', 'ready to design v0.15 passive live shadow', 'no live traffic', 'no tools', 'no runtime authority', 'no enforcement', 'unexpectedPermits: 0'], 'RELEASE_NOTES.md', assertIncludes);
}

export const liveLikeShadowSandboxSuite = Object.freeze({
  name: 'live-like-shadow-sandbox-ladder',
  gatePhase: 'post-real-redacted',
  gateScripts: liveLikeShadowSandboxGateScripts,
  requiredManifestPaths: liveLikeShadowSandboxRequiredManifestPaths,
  assertManifestMetadata: assertLiveLikeShadowSandboxManifestMetadata,
  assertRelease: assertLiveLikeShadowSandboxRelease
});
