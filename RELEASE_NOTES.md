# Release Notes — Synaptic Mesh v0.51.5

v0.51.5 adds a local reversible receiver runtime invocation shim rehearsal on top of published v0.50.5. It pins the v0.50.5 reviewer package and report by exact path and SHA-256 before read, rejects absolute/traversal paths, and invokes a deterministic local receiver shim function over the harness-consumed blocks only.

Pinned evidence: `PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_INVOCATION_SHIM_REHEARSAL_COMPLETE`, `localShimInvocationCount: 4`, `shimOutputCount: 4`, `contextHandoffResultCount: 1`, `invokedConsumedBlockCount: 4`, `effectsBlockedCount: 10`, `sourceBoundInvocationRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `boundaryViolationCount: 0`, `operatorApprovalScope: local_receiver_runtime_invocation_shim_rehearsal_only`.

Boundary: local-only, reversible, read-only, non-authoritative, no-effect context handoff result for human review only, no production runtime integration, no daemon, no SDK/framework adapter, no MCP/A2A client/server, no network/resource fetch, no tool execution, no memory/config writes, no external effects, no authorization/enforcement semantics, no allow/block decisions, and no automatic agent consumption. The operator preflight record is scoped only to this local shim rehearsal and is not runtime approval or general permission.

Recommended next barrier: bounded no-effect receiver runtime shim adapter fixture suite after local invocation rehearsal.

# Release Notes — Synaptic Mesh v0.50.5

v0.50.5 adds a local, reversible receiver/runtime test harness consumption rehearsal on top of published v0.49.5. It pins the v0.49.5 reviewer package and report by exact path and SHA-256 before read, rejects absolute/traversal paths, and consumes the receiver-facing blocks as deterministic local test input only.

Pinned evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_COMPLETE`, `sourceReceiverBlockCountConsumedAsLocalTestInput: 4`, `harnessParseSuccessCount: 4`, `consumedContextBlockCount: 4`, `consumptionDecisionCount: 4`, `effectsBlockedCount: 10`, `sourceBoundConsumedBlockRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `boundaryViolationCount: 0`, `operatorApprovalScope: local_test_harness_rehearsal_only`.

Boundary: local-only, reversible, read-only, non-authoritative, no production runtime integration, no daemon, no SDK/framework adapter, no MCP/A2A client/server, no network/resource fetch, no tool execution, no memory/config writes, no external effects, no authorization/enforcement semantics, no allow/block decisions, and no automatic agent consumption. The operator preflight record is scoped only to this local test harness rehearsal and is not runtime approval or general permission.

Recommended next barrier: bounded receiver/runtime test harness or fixture suite after local consumption rehearsal.

# Release Notes — Synaptic Mesh v0.49.5

v0.49.5 adds a local runtime-context injection rehearsal on top of published v0.48.5. It pins the v0.48.5 reviewer package and report by path and SHA-256, consumes the v0.48 runtime context cards in a deterministic local adapter harness, and emits one machine-shaped adapter rehearsal envelope for a future receiver/runtime test harness.

Pinned evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE`, `contextCardsConsumedByLocalRehearsalCount: 5`, `injectionEnvelopeCount: 1`, `receiverFacingContextBlockCount: 4`, `allEffectsBlockedUntilNextBarrierCount: 10`, `sourceBoundReceiverBlockRatio: 1`, `boundaryViolationCount: 0`.

Boundary: local-only, reversible, read-only, non-authoritative, no production runtime integration, no daemon, no SDK/framework adapter, no MCP/A2A client/server, no network/resource fetch, no tool execution, no memory/config writes, no external effects, no authorization/enforcement semantics, and no automatic agent consumption.

Recommended next barrier: receiver/runtime test harness consumption rehearsal.

# Release Notes — Synaptic Mesh v0.48.5

## Summary

`v0.48.5` adds a **local runtime-adjacent context injection dry-run** over the completed pinned v0.47.5 handoff utility repeatability artifact. It is not another passive readiness loop: it produces a machine-shaped local dry-run context payload a receiver/runtime test harness could consume next, while blocking production runtime integration and persistent effects.

## Evidence

- `dryRunStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE`
- `runtimeContextCardCount: 5`
- `harnessConsumableCandidateCount: 4`
- `runtimeBridgeSignalCount: 4`
- `runtimeBlockedUntilNextBarrierCount: 5`
- `staleSuppressionCarriedForwardCount: 1`
- `contradictionCautionCarriedForwardCount: 1`
- `harnessConsumablePayloadRatio: 0.8`
- `nextBarrierSpecificityRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_TO_RUNTIME_ADJACENT_DRY_RUN_OR_LIVE_CONTEXT_INJECTION_REHEARSAL`
- top-level sentinel kept null

## Runtime-adjacent boundary

The local runtime-adjacent context injection dry-run shapes five context payload cards from pinned evidence. Four are harness-consumable candidates; one stale card remains suppressed. The next barrier: runtime-adjacent dry-run adapter or live-context injection rehearsal.

Hard stops remain: no network/resource fetch, no external effects, no production runtime integration, no config writes, no memory writes, no authorization/enforcement/approve/block/allow semantics, and rollback/no-persist behavior.

# Release Notes — Synaptic Mesh v0.47.5

## Summary

`v0.47.5` adds a **passive live memory/coherence receiver live-context handoff utility repeatability scorecard** over the completed pinned v0.46.5 handoff utility artifact. It repeats the v0.46 handoffItems / handoffUtilityJudgements under baseline, paraphrased rationale/whyUseful, and reverse-order variants before any memory write or runtime integration boundary.

## Evidence

- `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `sourceHandoffWindowCount: 1`
- `handoffItemCount: 5`
- `totalHandoffUtilityJudgementCount: 15`
- `stableHandoffItemCount: 5`
- `unstableHandoffItemCount: 0`
- `stableIncludedForLiveContextCount: 4`
- `stableExcludedAsStaleCount: 1`
- `stableContradictionCautionCount: 1`
- `stableReceiverUsefulHandoffItemCount: 4`
- `stableReceiverNoisyHandoffItemCount: 0`
- `stableRawSignalUsefulHandoffItemCount: 3`
- `stableRawSignalNoisyHandoffItemCount: 2`
- `stableScorecardUsefulHandoffItemCount: 3`
- `stableScorecardNoisyHandoffItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `stableHandoffUtilityTreatmentRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
- `staleSuppressionRepeatabilityRatio: 1`
- `contradictionCautionRepeatabilityRatio: 1`
- `rawPersistedFalseRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `preReadPathPinned: true`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- top-level sentinel kept null retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, runs, judgement items, stable items, or CLI stdout
- Negative controls for traversal-like unpinned artifact paths, malformed/spoofed pinned v0.46 handoff utility artifacts, digest drift, metric drift, handoff item tampering, nested policyDecision repetition, raw persistence, external effects, tool execution, memory/config writes, runtime integration, unknown runtime/boundary fields, raw output, and non-null `policyDecision`.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.46.5 handoff utility artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate should keep this as local reviewer evidence or run a separate bounded shadow receiver rehearsal before any memory write or runtime integration boundary.

# Release Notes — Synaptic Mesh v0.46.5

## Summary

`v0.46.5` adds a **passive live memory/coherence receiver live-context handoff utility** gate over the completed pinned v0.45.5 live-observation repeatability scorecard. It assembles only stable observations into a bounded human live-context handoff, preserving contradiction caution and suppressing stale carry-forward before any memory write or runtime integration boundary.

## Evidence

- `handoffUtilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE`
- `sourceRepeatabilityRunCount: 3`
- `sourceStableObservationCount: 5`
- `sourceUnstableObservationCount: 0`
- `handoffWindowCount: 1`
- `handoffItemCount: 5`
- `includedForLiveContextCount: 4`
- `excludedAsStaleCount: 1`
- `contradictionCautionCount: 1`
- `receiverUsefulHandoffItemCount: 4`
- `receiverNoisyHandoffItemCount: 0`
- `rawSignalUsefulHandoffItemCount: 3`
- `rawSignalNoisyHandoffItemCount: 2`
- `scorecardUsefulHandoffItemCount: 3`
- `scorecardNoisyHandoffItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `receiverImprovesOverRawSignals: true`
- `receiverImprovesOverScorecard: true`
- `stableSignalCarryForwardRatio: 1`
- `sourceBoundHandoffRatio: 1`
- `staleSuppressionUsefulRatio: 1`
- `contradictionCautionUsefulRatio: 1`
- `redactedBeforePersistRatio: 1`
- `rawPersistedFalseRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `preReadPathPinned: true`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- top-level sentinel kept null retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, handoff items, judgement items, or CLI stdout
- Negative controls for traversal-like unpinned artifact paths, malformed/spoofed pinned v0.45 repeatability artifacts, digest drift, metric drift, stable observation tampering, raw persistence, external effects, tool execution, memory/config writes, runtime integration, unknown runtime/boundary fields, raw output, and non-null `policyDecision`.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.45.5 repeatability artifact, pre-read path pinned, stable-signals-only, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate should repeat this handoff utility window or run a bounded shadow receiver rehearsal before any memory write or runtime integration boundary.

# Release Notes — Synaptic Mesh v0.45.5

## Summary

`v0.45.5` adds a **passive live memory/coherence receiver usefulness live observation repeatability scorecard** over the completed pinned v0.44.5 live observation. It repeats the five live-observation judgements under bounded order/wording variants to check drift before any memory write or runtime integration boundary.

## Evidence

- `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `sourceLiveObservationWindowCount: 1`
- `candidateCount: 5`
- `totalLiveObservationJudgementCount: 15`
- `stableObservationCount: 5`
- `unstableObservationCount: 0`
- `stableIncludedForHumanContextCount: 3`
- `stableStaleSuppressedObservationCount: 1`
- `stableContradictionCautionObservationCount: 1`
- `stableReceiverUsefulLiveContextItemCount: 4`
- `stableReceiverNoisyLiveContextItemCount: 0`
- `stableRawSignalUsefulItemCount: 3`
- `stableRawSignalNoisyItemCount: 2`
- `stableScorecardUsefulItemCount: 3`
- `stableScorecardNoisyItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `receiverImprovesOverRawSignals: true`
- `receiverImprovesOverScorecard: true`
- `labelAgreementRatio: 1`
- `stableLiveObservationTreatmentRatio: 1`
- `receiverUsefulnessRepeatabilityRatio: 1`
- `rawSignalUsefulnessRepeatabilityRatio: 1`
- `scorecardUsefulnessRepeatabilityRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
- `staleSuppressionRepeatabilityRatio: 1`
- `contradictionCautionRepeatabilityRatio: 1`
- `redactedBeforePersistRepeatabilityRatio: 1`
- `rawPersistedFalseRatio: 1`
- `humanReviewOnlyRepeatabilityRatio: 1`
- `noPromotionWithoutHumanRepeatabilityRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `preReadPathPinned: true`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- top-level sentinel kept null retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, runs, judgement items, or CLI stdout
- Negative controls for traversal-like unpinned artifact paths, malformed/spoofed pinned v0.44 live observation artifacts, digest drift, metric drift, live-observation item tampering, raw persistence, external effects, tool execution, memory/config writes, runtime integration, unknown runtime/boundary fields, raw output, and non-null `policyDecision`.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.44.5 live observation artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate should either repeat another bounded live-observation window or measure receiver-side live-context handoff utility before any memory write or runtime integration boundary.
