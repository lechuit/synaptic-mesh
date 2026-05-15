import { readFileSync } from 'node:fs';
import path from 'node:path';

export const passiveLiveShadowLocalPilotGateScripts = Object.freeze([
  'test:passive-live-shadow-source-contract',
  'test:passive-live-shadow-redaction-gate',
  'test:passive-live-shadow-observation-cli',
  'test:passive-live-shadow-no-enforcement-invariants',
  'test:passive-live-shadow-reviewer-package',
  'test:passive-live-shadow-phase-close',
  'test:passive-live-shadow-output-boundary'
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
  'docs/passive-live-shadow-output-boundary-v0.15.6.md',
  'docs/status-v0.15.0-alpha.md',
  'docs/status-v0.15.1.md',
  'docs/status-v0.15.2.md',
  'docs/status-v0.15.3.md',
  'docs/status-v0.15.4.md',
  'docs/status-v0.15.5.md',
  'docs/status-v0.15.6.md',
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
  'implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-output-boundary-v0.15.6.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-source-contract-v0.15.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-redaction-gate-v0.15.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-observation-cli-v0.15.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-no-enforcement-invariants-v0.15.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-reviewer-package-v0.15.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-phase-close-v0.15.5.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-output-boundary-v0.15.6.out.json'
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveShadowLocalPilotManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (!['v0.15.5','v0.15.6'].includes(manifestReleaseTag)) return;
  all(manifest.reproducibility, ['v0.15.6','passive_live_shadow_output_boundary_hardening','local_operator_run_pilot_only','redaction_before_persistence_true','raw_persisted_false','unsafe_flags_rejected_8','no_symlink_output_escape_true','semantic_decision_tokens_persisted_false','no_enforcement_true'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_local_input_only','no_network_fetch','no_sdk_framework_adapter','no_daemon_watcher','no_tool_execution','no_memory_config_writes','no_machine_readable_policy_decision','no_approval_block_allow_authorization_enforcement','no_external_effects','output_evidence_directory_only_or_stdout','no_output_path_escape','no_symlink_output_escape','no_raw_decision_verbs_in_persisted_input','no_autonomous_live_mode'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveShadowLocalPilotRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (!['v0.15.5','v0.15.6'].includes(manifestReleaseTag)) return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-phase-close-v0.15.5.out.json'));
  if (manifestReleaseTag === 'v0.15.6') {
    const boundary = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-output-boundary-v0.15.6.out.json'));
    assert(boundary?.summary?.outputBoundaryHardening === 'pass', 'v0.15.6 output boundary hardening must pass');
    assert(boundary?.summary?.evidenceDirectoryOnly === true, 'v0.15.6 evidenceDirectoryOnly must be true');
    assert(boundary?.summary?.outputPathEscapeRejected === true, 'v0.15.6 output path escapes must be rejected');
    assert(boundary?.summary?.symlinkParentRejected === true, 'v0.15.6 symlink parent escapes must be rejected');
    assert(boundary?.summary?.symlinkOutputFileRejected === true, 'v0.15.6 symlink output file escapes must be rejected');
    assert(boundary?.summary?.memoryConfigWrite === false && boundary?.summary?.externalEffects === false && boundary?.summary?.enforcement === false, 'v0.15.6 must not add memory/config writes, external effects, or enforcement');
  }
  assert(phase?.summary?.phaseClose === 'pass', 'v0.15.5 phase close must pass');
  assert(phase?.summary?.passiveLiveShadowReadinessAchieved === true, 'passive live shadow readiness must be achieved');
  assert(phase?.summary?.localOperatorRunPilotOnly === true, 'local operator-run pilot only must be true');
  for (const key of ['toolExecution','authorization','externalEffects','productionLiveDeployment']) assert(phase?.summary?.[key] === false, `${key} must remain false`);
  assert(phase?.summary?.noEnforcement === true, 'noEnforcement must remain true');
  const noEnforcement = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-no-enforcement-invariants-v0.15.3.out.json'));
  assert(noEnforcement?.summary?.semanticDecisionTokensPersisted === false, 'semantic decision tokens must not persist in redacted text');
  assert(noEnforcement?.summary?.decisionVerbRedactions >= 5, 'decision verb redaction controls must run');
  const cli = readJson(path.join(packageRoot, 'evidence/passive-live-shadow-observation-cli-v0.15.2.out.json'));
  assert(cli?.summary?.unsafeFlagsRejected === 8, 'unsafe flag rejection count must be 8');
  assert(cli?.summary?.network === false && cli?.summary?.toolExecution === false && cli?.summary?.enforcement === false, 'CLI must remain no network/tools/enforcement');
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['passive live shadow readiness achieved','local operator-run pilot only','no enforcement','no tool execution','no authorization','no daemon/watcher by default','no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.15.6','passive live shadow readiness achieved','output boundary hardening','local operator-run pilot only','unsafeFlagsRejected: 8','outputPathEscapeRejected: true','symlinkParentRejected: true','symlinkOutputFileRejected: true','semanticDecisionTokensPersisted: false','no enforcement','no tool execution','no authorization'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveShadowLocalPilotSuite = Object.freeze({ name:'passive-live-shadow-local-pilot', gatePhase:'post-real-redacted', gateScripts:passiveLiveShadowLocalPilotGateScripts, requiredManifestPaths:passiveLiveShadowLocalPilotRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveShadowLocalPilotManifestMetadata, assertRelease:assertPassiveLiveShadowLocalPilotRelease });
