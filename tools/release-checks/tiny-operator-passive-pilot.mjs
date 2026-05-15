import { readFileSync } from 'node:fs';
import path from 'node:path';

export const tinyOperatorPassivePilotGateScripts = Object.freeze([
  'test:tiny-operator-passive-pilot-protocol',
  'test:tiny-operator-passive-pilot-runner',
  'test:tiny-operator-passive-pilot-evidence-packet',
  'test:tiny-operator-passive-pilot-negative-controls',
  'test:tiny-operator-passive-pilot-reviewer-runbook',
  'test:tiny-operator-passive-pilot-phase-close'
]);

export const tinyOperatorPassivePilotRequiredManifestPaths = Object.freeze([
  'tools/release-checks/tiny-operator-passive-pilot.mjs',
  'schemas/tiny-operator-passive-pilot-evidence-v0.16.2.schema.json',
  'docs/tiny-operator-passive-pilot-protocol-v0.16.0-alpha.md',
  'docs/tiny-operator-passive-pilot-runner-v0.16.1.md',
  'docs/tiny-operator-passive-pilot-evidence-packet-v0.16.2.md',
  'docs/tiny-operator-passive-pilot-negative-controls-v0.16.3.md',
  'docs/tiny-operator-passive-pilot-reviewer-runbook-v0.16.4.md',
  'docs/tiny-operator-passive-pilot-phase-close-v0.16.5.md',
  'docs/status-v0.16.0-alpha.md',
  'docs/status-v0.16.1.md',
  'docs/status-v0.16.2.md',
  'docs/status-v0.16.3.md',
  'docs/status-v0.16.4.md',
  'docs/status-v0.16.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/tiny-operator-passive-pilot.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/tiny-passive-pilot.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/tiny-operator-passive-pilot-sample-v0.16.1.txt',
  'implementation/synaptic-mesh-shadow-v0/fixtures/tiny-operator-passive-pilot-negative-controls-v0.16.3.json',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-protocol-v0.16.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-runner-v0.16.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-evidence-packet-v0.16.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-negative-controls-v0.16.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-reviewer-runbook-v0.16.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/tiny-operator-passive-pilot-phase-close-v0.16.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-protocol-v0.16.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-runner-v0.16.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-evidence-packet-v0.16.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-negative-controls-v0.16.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-reviewer-runbook-v0.16.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-phase-close-v0.16.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/tiny-operator-passive-pilot-v0.16.5.out.json'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertTinyOperatorPassivePilotManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.16.5') return;
  all(manifest.reproducibility, ['v0.16.5','tiny_operator_run_passive_pilot_readiness','operator_review_required_true','single_sample_only_true','raw_persisted_false','unexpected_permits_0','no_agent_consumption','no_policy_decision','no_enforcement_true'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_local_input_only','single_sample_only','no_network_fetch','no_resource_fetch','no_sdk_framework_adapter','no_mcp_server_client','no_langgraph_sdk','no_a2a_runtime','no_github_bot_webhook','no_daemon_watcher','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_readable_policy_decision','no_approval_block_allow_authorization_enforcement','no_external_effects','no_autonomous_live_mode'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertTinyOperatorPassivePilotRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.16.5') return;
  const packet = readJson(path.join(packageRoot, 'evidence/tiny-operator-passive-pilot-v0.16.5.out.json'));
  assert(packet?.summary?.operatorReviewRequired === true, 'v0.16.5 operatorReviewRequired must be true');
  assert(packet?.summary?.singleSampleOnly === true, 'v0.16.5 singleSampleOnly must be true');
  assert(packet?.summary?.rawPersisted === false, 'v0.16.5 rawPersisted must be false');
  assert(packet?.summary?.policyDecision === null, 'v0.16.5 policyDecision must be null');
  assert(packet?.summary?.unexpectedPermits === 0, 'v0.16.5 unexpectedPermits must be 0');
  assert(packet?.pilot?.agentConsumedOutput === false, 'v0.16.5 must not produce agent-consumed output');
  const negative = readJson(path.join(packageRoot, 'evidence/tiny-operator-passive-pilot-negative-controls-v0.16.3.out.json'));
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.16.3 unexpectedPermits must be 0');
  assert(negative?.summary?.expectedRejects >= 20, 'v0.16.3 expected rejects must include unsafe, batch, output escape, and symlink controls');
  const phase = readJson(path.join(packageRoot, 'evidence/tiny-operator-passive-pilot-phase-close-v0.16.5.out.json'));
  assert(phase?.summary?.tinyOperatorRunPassivePilotReadiness === true, 'v0.16.5 readiness must pass');
  for (const key of ['noEffects','noEnforcement','noAuthorization','noToolExecution','noNetwork','noWatcherDaemon','noAutonomousLiveMode','noFrameworkSdkAdapter']) assert(phase?.summary?.[key] === true, `${key} must remain true`);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['tiny operator-run passive pilot readiness','one explicit local sample input at a time','operatorReviewRequired: true','singleSampleOnly: true','unexpectedPermits: 0','no enforcement','no tool execution','no authorization','no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.16.5','tiny operator-run passive pilot readiness','operatorReviewRequired: true','singleSampleOnly: true','rawPersisted: false','unexpectedPermits: 0','no agent-consumed output','no machine-readable policy decision','no enforcement','no external effects'], 'RELEASE_NOTES.md', assertIncludes);
}

export const tinyOperatorPassivePilotSuite = Object.freeze({
  name: 'tiny-operator-passive-pilot',
  gatePhase: 'post-real-redacted',
  gateScripts: tinyOperatorPassivePilotGateScripts,
  requiredManifestPaths: tinyOperatorPassivePilotRequiredManifestPaths,
  assertManifestMetadata: assertTinyOperatorPassivePilotManifestMetadata,
  assertRelease: assertTinyOperatorPassivePilotRelease
});
