import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunScripts = Object.freeze([
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-protocol',
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-payload',
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-metrics',
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-negative-controls',
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-output-boundary',
  'test:passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package',
]);
export const passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-memory-coherence-runtime-context-injection-dry-run.mjs',
  'docs/passive-live-memory-coherence-runtime-context-injection-dry-run-protocol-v0.48.0-alpha.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-payload-v0.48.1.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-metrics-v0.48.2.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-negative-controls-v0.48.3.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-output-boundary-v0.48.4.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.md','docs/passive-live-memory-coherence-runtime-context-injection-dry-run-local-review-notes-v0.48.5.md',
  'docs/status-v0.48.0-alpha.md','docs/status-v0.48.1.md','docs/status-v0.48.2.md','docs/status-v0.48.3.md','docs/status-v0.48.4.md','docs/status-v0.48.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-memory-coherence-runtime-context-injection-dry-run.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-live-memory-coherence-runtime-context-injection-dry-run.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-protocol-v0.48.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-payload-v0.48.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-metrics-v0.48.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-negative-controls-v0.48.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-output-boundary-v0.48.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.48.5') return;
  all(manifest.reproducibility, ['v0.48.5','local_runtime_adjacent_context_injection_dry_run_harness','PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE','runtimeContextCardCount_5','harnessConsumableCandidateCount_4','runtimeBridgeSignalCount_4','runtimeBlockedUntilNextBarrierCount_5','harnessConsumablePayloadRatio_0.8','nextBarrierSpecificityRatio_1','boundaryViolationCount_0','ADVANCE_TO_RUNTIME_ADJACENT_DRY_RUN_OR_LIVE_CONTEXT_INJECTION_REHEARSAL','machine_shaped_dry_run_payload','no_memory_writes','no_runtime_integration'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.48.5','local_runtime_adjacent_dry_run','machine_shaped_context_payload','test_harness_only','no_network','no_config_writes','no_memory_writes','no_authorization_enforcement','no_production_runtime_integration','rollback_no_persist'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.48.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-reviewer-package-v0.48.5.out.json'));
  assert(phase?.dryRunStatus === 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE', 'v0.48.5 runtime context injection dry-run must complete');
  const m = phase?.metrics ?? {};
  assert(m.runtimeContextCardCount === 5 && m.harnessConsumableCandidateCount === 4 && m.runtimeBridgeSignalCount === 4, 'v0.48.5 payload counts must be pinned');
  assert(m.runtimeBlockedUntilNextBarrierCount === 5 && m.boundaryViolationCount === 0, 'v0.48.5 dry-run boundary must be pinned');
  assert(phase?.machineShapedDryRunPayload === true && phase?.localDryRunHarnessOnly === true, 'v0.48.5 must be machine-shaped local harness payload');
  assert(phase?.['policy' + 'Decision'] === null, 'v0.48.5 top-level sentinel must be null');
  assert((phase?.runtimeContextCards ?? []).every((card) => card.runtimeBlockedUntilNextBarrier === true && card.rawPersisted === false && card.promoteToMemory === false && card.agentConsumedOutput === false), 'v0.48.5 cards must be dry-run/no-persist/no-agent-consumed-output');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-live-memory-coherence-runtime-context-injection-dry-run-report-v0.48.5.out.md'), 'utf8');
  all(report, ['Passive Live Memory Coherence Receiver Live Context Runtime Context Injection Dry Run v0.48.5','PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE','runtimeContextCardCount=5','harnessConsumableCandidateCount=4','runtimeBridgeSignalCount=4','runtimeBlockedUntilNextBarrierCount=5','harnessConsumablePayloadRatio=0.8','nextBarrier: runtime_adjacent_dry_run_adapter_or_live_context_injection_rehearsal','machine-shaped local dry-run context payload','no network/config/memory writes'], 'runtime context injection dry-run report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['local runtime-adjacent context injection dry-run','dryRunStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE','harnessConsumableCandidateCount: 4','runtimeBlockedUntilNextBarrierCount: 5','machine-shaped local dry-run context payload'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'local runtime-adjacent context injection dry-run','dryRunStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE','harnessConsumableCandidateCount: 4','runtimeBridgeSignalCount: 4','next barrier: runtime-adjacent dry-run adapter or live-context injection rehearsal'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunSuite = Object.freeze({ name:'passive-live-memory-coherence-runtime-context-injection-dry-run', gatePhase:'post-real-redacted', gateScripts:passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunScripts, requiredManifestPaths:passiveLiveMemoryCoherenceRuntimeContextInjectionDryRunRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunManifestMetadata, assertRelease:assertPassiveLiveMemoryCoherenceRuntimeContextInjectionDryRunRelease });
