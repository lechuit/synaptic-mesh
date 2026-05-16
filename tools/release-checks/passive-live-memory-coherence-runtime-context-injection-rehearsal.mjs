import { readFileSync } from 'node:fs';
import path from 'node:path';
export const passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalScripts = Object.freeze([
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-protocol',
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-envelope',
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-metrics',
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-negative-controls',
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-output-boundary',
  'test:passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package',
]);
export const passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalRequiredManifestPaths = Object.freeze([
  'tools/release-checks/passive-live-memory-coherence-runtime-context-injection-rehearsal.mjs',
  'docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-protocol-v0.49.0-alpha.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-envelope-v0.49.1.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-metrics-v0.49.2.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-negative-controls-v0.49.3.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-output-boundary-v0.49.4.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.md','docs/passive-live-memory-coherence-runtime-context-injection-rehearsal-local-review-notes-v0.49.5.md',
  'docs/status-v0.49.0-alpha.md','docs/status-v0.49.1.md','docs/status-v0.49.2.md','docs/status-v0.49.3.md','docs/status-v0.49.4.md','docs/status-v0.49.5.md',
  'implementation/synaptic-mesh-shadow-v0/src/passive-live-memory-coherence-runtime-context-injection-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/bin/passive-live-memory-coherence-runtime-context-injection-rehearsal.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-fixtures.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-protocol-v0.49.0-alpha.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-envelope-v0.49.1.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-metrics-v0.49.2.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-negative-controls-v0.49.3.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-output-boundary-v0.49.4.mjs','implementation/synaptic-mesh-shadow-v0/tests/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.mjs',
  'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json','implementation/synaptic-mesh-shadow-v0/evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md',
]);
function all(text, phrases, label, assertIncludes){ for (const phrase of phrases) assertIncludes(text, phrase, label); }
export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalManifestMetadata({ manifest, manifestReleaseTag, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.49.5') return;
  all(manifest.reproducibility, ['v0.49.5','local_adapter_live_context_injection_envelope_rehearsal','PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE','contextCardsConsumedByLocalRehearsalCount_5','injectionEnvelopeCount_1','receiverFacingContextBlockCount_4','allEffectsBlockedUntilNextBarrierCount_10','sourceBoundReceiverBlockRatio_1','boundaryViolationCount_0','ADVANCE_TO_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL','machine_shaped_adapter_rehearsal_envelope','no_tool_execution','no_network_fetch','no_memory_writes','no_config_writes','no_runtime_integration'], 'MANIFEST.json reproducibility', assertIncludes);
  all(manifest.runtimeBoundary, ['v0.49.5','local_reversible_adapter_rehearsal','receiver_facing_injection_envelope','test_harness_consumable_next','no_network','no_tool_execution','no_config_writes','no_memory_writes','no_authorization_enforcement','no_production_runtime_integration','rollback_no_persist'], 'MANIFEST.json runtimeBoundary', assertIncludes);
}
export function assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalRelease({ repoRoot, packageRoot, manifestReleaseTag, readJson, assert, assertIncludes }) {
  if (manifestReleaseTag !== 'v0.49.5') return;
  const phase = readJson(path.join(packageRoot, 'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-reviewer-package-v0.49.5.out.json'));
  assert(phase?.rehearsalStatus === 'PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE', 'v0.49.5 runtime context injection rehearsal must complete');
  const m = phase?.metrics ?? {};
  assert(m.contextCardsConsumedByLocalRehearsalCount === 5 && m.injectionEnvelopeCount === 1 && m.receiverFacingContextBlockCount === 4, 'v0.49.5 envelope counts must be pinned');
  assert(m.allEffectsBlockedUntilNextBarrierCount === 10 && m.forbiddenEffectCount === 0 && m.boundaryViolationCount === 0, 'v0.49.5 rehearsal boundary must be pinned');
  assert(m.sourceBoundContextCardRatio === 1 && m.sourceBoundReceiverBlockRatio === 1, 'v0.49.5 source-bound ratios must be pinned');
  assert(phase?.machineShapedAdapterRehearsalEnvelope === true && phase?.localOnly === true && phase?.rehearsalOnly === true, 'v0.49.5 must be a machine-shaped local adapter rehearsal envelope');
  assert(phase?.['policy' + 'Decision'] === null, 'v0.49.5 top-level compatibility sentinel must be null');
  assert((phase?.receiverFacingContextBlocks ?? []).every((block) => block.blockedUntilNextBarrier === true && block.rawPersisted === false && block.agentConsumedOutput === false && block.sourceBound === true), 'v0.49.5 receiver-facing blocks must remain blocked/source-bound/no-persist/no-agent-consumed-output');
  const report = readFileSync(path.join(packageRoot, 'evidence/passive-live-memory-coherence-runtime-context-injection-rehearsal-report-v0.49.5.out.md'), 'utf8');
  all(report, ['Passive Live Memory Coherence Runtime Context Injection Rehearsal v0.49.5','PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE','contextCardsConsumedByLocalRehearsalCount=5','injectionEnvelopeCount=1','receiverFacingContextBlockCount=4','allEffectsBlockedUntilNextBarrierCount=10','sourceBoundReceiverBlockRatio=1','boundaryViolationCount=0','deterministic local adapter harness','no production runtime, network, tool, memory, config, external effect'], 'runtime context injection rehearsal report', assertIncludes);
  const readme = readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const notes = readFileSync(path.join(repoRoot, 'RELEASE_NOTES.md'), 'utf8');
  all(readme, ['local runtime-context injection rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE','contextCardsConsumedByLocalRehearsalCount: 5','receiverFacingContextBlockCount: 4','machine-shaped adapter rehearsal envelope'], 'README.md', assertIncludes);
  all(notes, [manifestReleaseTag,'local runtime-context injection rehearsal','rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE','injectionEnvelopeCount: 1','receiverFacingContextBlockCount: 4','next barrier: receiver/runtime test harness consumption rehearsal'], 'RELEASE_NOTES.md', assertIncludes);
}
export const passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalSuite = Object.freeze({ name:'passive-live-memory-coherence-runtime-context-injection-rehearsal', gatePhase:'post-real-redacted', gateScripts:passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalScripts, requiredManifestPaths:passiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalRequiredManifestPaths, assertManifestMetadata:assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalManifestMetadata, assertRelease:assertPassiveLiveMemoryCoherenceRuntimeContextInjectionRehearsalRelease });
