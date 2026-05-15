import { readFileSync } from 'node:fs';
import path from 'node:path';

export const limitedPassiveLiveCaptureGateScripts = Object.freeze([
  'test:limited-passive-live-capture-protocol',
  'test:limited-passive-live-capture-envelope',
  'test:limited-passive-live-capture-redaction-abort',
  'test:limited-passive-live-capture-negative-controls',
  'test:limited-passive-live-capture-reviewer-runbook',
  'test:limited-passive-live-capture-phase-close'
]);
export const limitedPassiveLiveCaptureRequiredManifestPaths = Object.freeze([
  'tools/release-checks/limited-passive-live-capture-readiness.mjs',
  'docs/limited-passive-live-capture-protocol-v0.17.0-alpha.md',
  'docs/limited-passive-live-capture-envelope-v0.17.1.md',
  'docs/limited-passive-live-capture-redaction-abort-v0.17.2.md',
  'docs/limited-passive-live-capture-negative-controls-v0.17.3.md',
  'docs/limited-passive-live-capture-reviewer-runbook-v0.17.4.md',
  'docs/limited-passive-live-capture-phase-close-v0.17.5.md',
  'docs/limited-passive-live-capture-local-review-notes-v0.17.5.md',
  'docs/status-v0.17.0-alpha.md','docs/status-v0.17.1.md','docs/status-v0.17.2.md','docs/status-v0.17.3.md','docs/status-v0.17.4.md','docs/status-v0.17.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/limited-passive-live-capture-readiness.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/limited-passive-capture-readiness.mjs',
  'implementation/synaptic-mesh-shadow-v0/fixtures/limited-passive-live-capture-envelope-v0.17.1.json',
  'implementation/synaptic-mesh-shadow-v0/fixtures/limited-passive-live-capture-negative-controls-v0.17.3.json',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-protocol-v0.17.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-envelope-v0.17.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-redaction-abort-v0.17.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-negative-controls-v0.17.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-reviewer-runbook-v0.17.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/limited-passive-live-capture-phase-close-v0.17.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-protocol-v0.17.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-envelope-v0.17.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-redaction-abort-v0.17.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-negative-controls-v0.17.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-reviewer-runbook-v0.17.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/limited-passive-live-capture-phase-close-v0.17.5.out.json'
]);
function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertLimitedPassiveLiveCaptureManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.17.5') return;
  all(manifest.reproducibility, ['v0.17.5','limited_passive_live_capture_readiness','design_readiness_only_true','disabled_manual_operator_run_local_passive_read_only_true','unexpected_permits_0','policy_decision_null','agent_consumed_output_false','no_enforcement','no_authorization','no_external_effects'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','no_autonomous_live_mode','no_tool_execution','no_memory_config_writes','no_agent_consumed_machine_readable_policy_decisions','no_approval_block_allow_authorization_enforcement','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertLimitedPassiveLiveCaptureRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.17.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/limited-passive-live-capture-phase-close-v0.17.5.out.json'));
  assert(phase?.summary?.limitedPassiveLiveCaptureReadiness === true, 'v0.17.5 readiness must pass');
  assert(phase?.summary?.designReadinessOnly === true, 'v0.17.5 design readiness only must be true');
  assert(phase?.summary?.disabledManualOperatorRunLocalPassiveReadOnly === true, 'v0.17.5 disabled/manual/operator/local/passive/read-only boundary must pass');
  assert(phase?.summary?.policyDecision === null, 'v0.17.5 policyDecision must be null');
  for (const key of ['rawPersisted','agentConsumedOutput','externalEffects','enforcement','authorization','approvalBlockAllow','toolExecution','memoryConfigWrite']) assert(phase?.summary?.[key] === false, `v0.17.5 ${key} must be false`);
  assert(phase?.summary?.unexpectedPermits === 0, 'v0.17.5 unexpectedPermits must be 0');
  const negative = readJson(path.join(packageRoot, 'evidence/limited-passive-live-capture-negative-controls-v0.17.3.out.json'));
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.17.3 unexpectedPermits must be 0');
  assert(negative?.summary?.expectedRejects >= 12, 'v0.17.3 expected rejects must cover boundary hazards');
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['limited passive live capture readiness','design/readiness only','disabled/manual/operator-run/local/passive/read-only','policyDecision: null','agentConsumedOutput: false','unexpectedPermits: 0','no enforcement','no authorization','no approval/block/allow','no autonomous live mode','no tool execution','no memory/config writes','no external effects'], 'README.md', assertIncludes);
  all(notes, ['v0.17.5','limited passive live capture readiness','design/readiness only','policyDecision: null','agentConsumedOutput: false','unexpectedPermits: 0','two independent local review notes','no enforcement','no authorization','no external effects'], 'RELEASE_NOTES.md', assertIncludes);
}
export const limitedPassiveLiveCaptureReadinessSuite = Object.freeze({ name:'limited-passive-live-capture-readiness', gatePhase:'post-real-redacted', gateScripts: limitedPassiveLiveCaptureGateScripts, requiredManifestPaths: limitedPassiveLiveCaptureRequiredManifestPaths, assertManifestMetadata: assertLimitedPassiveLiveCaptureManifestMetadata, assertRelease: assertLimitedPassiveLiveCaptureRelease });
