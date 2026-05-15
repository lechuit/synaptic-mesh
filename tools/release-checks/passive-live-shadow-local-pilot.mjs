import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveLiveShadowLocalPilotGateScripts = Object.freeze([
  'test:passive-live-shadow-source-contract',
  'test:passive-live-shadow-redaction-gate',
  'test:passive-live-shadow-observation-cli',
  'test:passive-live-shadow-no-enforcement-invariants',
  'test:passive-live-shadow-reviewer-package',
  'test:passive-live-shadow-phase-close'
]);

export const passiveLiveShadowLocalPilotRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-shadow-local-pilot.mjs',
  'schemas/passive-live-shadow-observation-v0.15.0.schema.json',
  'docs/passive-live-shadow-source-contract-v0.15.0-alpha.md',
  'docs/passive-live-shadow-redaction-gate-v0.15.1.md',
  'docs/passive-live-shadow-observation-cli-v0.15.2.md',
  'docs/passive-live-shadow-no-enforcement-invariants-v0.15.3.md',
  'docs/passive-live-shadow-reviewer-package-v0.15.4.md',
  'docs/passive-live-shadow-phase-close-v0.15.5.md',
  'docs/status-v0.15.0-alpha.md',
  'docs/status-v0.15.1.md',
  'docs/status-v0.15.2.md',
  'docs/status-v0.15.3.md',
  'docs/status-v0.15.4.md',
  'docs/status-v0.15.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-shadow.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/passive-live-shadow-observe.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-source-v0.15.0-alpha.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-negative-controls-v0.15.1.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-sample-input-v0.15.2.txt',
  'implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-dangerous-cases-v0.15.3.json',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-source-contract-v0.15.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-redaction-gate-v0.15.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-observation-cli-v0.15.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-no-enforcement-invariants-v0.15.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-reviewer-package-v0.15.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-phase-close-v0.15.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-source-contract-v0.15.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-redaction-gate-v0.15.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-observation-cli-v0.15.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-no-enforcement-invariants-v0.15.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-reviewer-package-v0.15.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-phase-close-v0.15.5.out.json'
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveShadowLocalPilotManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.15.5') return;
  all(manifest.reproducibility, ['v0.15.5','passive_live_shadow_readiness_achieved','local_operator_run_pilot_only','redaction_before_persistence_true','raw_persisted_false','unsafe_flags_rejected_8','no_enforcement_true'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_local_input_only','no_network_fetch','no_sdk_framework_adapter','no_daemon_watcher','no_tool_execution','no_memory_config_writes','no_machine_readable_policy_decision','no_approval_block_allow_authorization_enforcement','no_external_effects','no_autonomous_live_mode'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveShadowLocalPilotRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.15.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-phase-close-v0.15.5.out.json'));
  assert(phase?.summary?.phaseClose === 'pass', 'v0.15.5 phase close must pass');
  assert(phase?.summary?.passiveLiveShadowReadinessAchieved === true, 'passive live shadow readiness must be achieved');
  assert(phase?.summary?.localOperatorRunPilotOnly === true, 'local operator-run pilot only must be true');
  for (const key of ['toolExecution','authorization','externalEffects','productionLiveDeployment']) assert(phase?.summary?.[key] === false, `${key} must remain false`);
  assert(phase?.summary?.noEnforcement === true, 'noEnforcement must remain true');
  const cli = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-observation-cli-v0.15.2.out.json'));
  assert(cli?.summary?.unsafeFlagsRejected === 8, 'unsafe flag rejection count must be 8');
  assert(cli?.summary?.network === false && cli?.summary?.toolExecution === false && cli?.summary?.enforcement === false, 'CLI must remain no network/tools/enforcement');
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive live shadow readiness achieved','local operator-run pilot only','no enforcement','no tool execution','no authorization','no daemon/watcher by default','no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.15.5','passive live shadow readiness achieved','local operator-run pilot only','unsafeFlagsRejected: 8','no enforcement','no tool execution','no authorization'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveShadowLocalPilotSuite = Object.freeze({ name:'passive-live-shadow-local-pilot', gatePhase:'post-real-redacted', gateScripts:passiveLiveShadowLocalPilotGateScripts, requiredManifestPaths:passiveLiveShadowLocalPilotRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveShadowLocalPilotManifestMetadata, assertRelease:assertPassiveLiveShadowLocalPilotRelease });
