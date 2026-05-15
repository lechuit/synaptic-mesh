import { readFileSync } from 'node:fs';
import path from 'node:path';

export const positiveUtilityPassGateScripts = Object.freeze([
  'test:positive-utility-pass-gate-protocol',
  'test:positive-utility-pass-gate-positive-cases',
  'test:positive-utility-pass-gate-bounds',
  'test:positive-utility-pass-gate-redaction-negative',
  'test:positive-utility-pass-gate-negative-controls',
  'test:positive-utility-pass-gate-reviewer-package'
]);

export const positiveUtilityPassGateRequiredManifestPaths = Object.freeze([
  'tools/release-checks/positive-utility-pass-gate.mjs',
  'docs/positive-utility-pass-gate-protocol-v0.21.0-alpha.md',
  'docs/positive-utility-pass-gate-positive-cases-v0.21.1.md',
  'docs/positive-utility-pass-gate-bounds-v0.21.2.md',
  'docs/positive-utility-pass-gate-redaction-negative-v0.21.3.md',
  'docs/positive-utility-pass-gate-negative-controls-v0.21.4.md',
  'docs/positive-utility-pass-gate-reviewer-package-v0.21.5.md',
  'docs/positive-utility-pass-gate-local-review-notes-v0.21.5.md',
  'docs/status-v0.21.0-alpha.md',
  'docs/status-v0.21.1.md',
  'docs/status-v0.21.2.md',
  'docs/status-v0.21.3.md',
  'docs/status-v0.21.4.md',
  'docs/status-v0.21.5.md',
  'positive-utility-samples/source-a.md',
  'positive-utility-samples/source-b.md',
  'positive-utility-samples/source-c.md',
  'implementation/synaptic-mesh-shadow-v0/src/positive-utility-pass-gate.mjs',
  'implementation/synaptic-mesh-shadow-v0/bin/positive-utility-pass-gate.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-protocol-v0.21.0-alpha.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-positive-cases-v0.21.1.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-bounds-v0.21.2.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-redaction-negative-v0.21.3.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-negative-controls-v0.21.4.mjs',
  'implementation/synaptic-mesh-shadow-v0/tests/positive-utility-pass-gate-reviewer-package-v0.21.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-protocol-v0.21.0-alpha.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-positive-cases-v0.21.1.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-report-v0.21.1.out.md',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-bounds-v0.21.2.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-redaction-negative-v0.21.3.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-negative-controls-v0.21.4.out.json',
  'implementation/synaptic-mesh-shadow-v0/evidence/positive-utility-pass-gate-reviewer-package-v0.21.5.out.json'
]);

function all(text, phrases, label, assertIncludes) { for (const phrase of phrases) assertIncludes(text, phrase, label); }

export function assertPositiveUtilityPassGateManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.21.5') return;
  all(manifest.reproducibility, ['v0.21.5','positive_utility_pass_gate','PASS_TO_HUMAN_REVIEW','observationAccepted_true','includedInReport_true','readyForHumanReview_true','policy_decision_null','authorization_false','enforcement_false','tool_execution_false','agent_consumed_output_false','external_effects_false','raw_persisted_false','unexpected_permits_0'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['disabled_by_default','manual_operator_run','local_only','passive_only','read_only','one_shot_only','non_authoritative','not_policy_allow_block_approve_gate','no_authorization','no_enforcement','no_tool_execution','no_agent_consumed_machine_readable_policy_decisions','no_external_effects','not_runtime_authority'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}

export function assertPositiveUtilityPassGateRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.21.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/positive-utility-pass-gate-reviewer-package-v0.21.5.out.json'));
  assert(phase?.classification === 'PASS_TO_HUMAN_REVIEW', 'v0.21.5 must pass positive utility evidence to human review');
  assert(phase?.summary?.nonAuthoritative === true, 'v0.21.5 must be non-authoritative');
  assert(phase?.summary?.classificationOnly === true, 'v0.21.5 must be classification only');
  assert(phase?.summary?.policyDecision === null, 'v0.21.5 policyDecision must be null');
  for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','memoryConfigWrite','networkResourceFetch','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert(phase?.summary?.[key] === false, 'v0.21.5 ' + key + ' must be false');
  assert(phase?.summary?.unexpectedPermits === 0, 'v0.21.5 unexpectedPermits must be 0');
  const negative = readJson(path.join(packageRoot, 'evidence/positive-utility-pass-gate-negative-controls-v0.21.4.out.json'));
  assert(negative?.summary?.unexpectedPasses === 0, 'v0.21.4 unexpectedPasses must be 0');
  assert(negative?.summary?.unexpectedPermits === 0, 'v0.21.4 unexpectedPermits must be 0');
  const report = readFileSync(path.join(packageRoot, 'evidence/positive-utility-pass-gate-report-v0.21.1.out.md'), 'utf8');
  all(report, ['Positive Utility Pass-to-Human-Review Report v0.21.5','PASS_TO_HUMAN_REVIEW','Observation accepted: true','Included in report: true','Ready for human review: true','policyDecision: null'], 'positive utility human report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['positive utility pass-to-human-review','PASS_TO_HUMAN_REVIEW','observationAccepted','includedInReport','readyForHumanReview','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false'], 'README.md', assertIncludes);
  all(notes, ['v0.21.5','positive utility pass-to-human-review','PASS_TO_HUMAN_REVIEW','observationAccepted','includedInReport','readyForHumanReview','policyDecision: null','authorization: false','enforcement: false','toolExecution: false','agentConsumedOutput: false','externalEffects: false','rawPersisted: false'], 'RELEASE_NOTES.md', assertIncludes);
}

export const positiveUtilityPassGateSuite = Object.freeze({
  name: 'positive-utility-pass-gate',
  gatePhase: 'post-real-redacted',
  gateScripts: positiveUtilityPassGateScripts,
  requiredManifestPaths: positiveUtilityPassGateRequiredManifestPaths,
  assertManifestMetadata: assertPositiveUtilityPassGateManifestMetadata,
  assertRelease: assertPositiveUtilityPassGateRelease
});
