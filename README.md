# Synaptic Mesh v0.48.5

This is the public review release `v0.48.5`. Current v0.48.5 status is narrower than production live runtime, but crosses a real runtime-adjacent boundary after v0.47: **local runtime-adjacent context injection dry-run**.

The v0.48 ladder is opt-in, operator-run one-shot, local-only, dry-run/read-only, bounded to the pinned completed v0.47.5 repeatability artifact, pre-read path pinned, redacted-before-persist, machine-shaped local dry-run context payload, test-harness-only, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.48.5 evidence: `dryRunStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE`, `sourceRepeatabilityRunCount: 3`, `sourceStableHandoffItemCount: 5`, `sourceIncludedForLiveContextCount: 4`, `sourceExcludedAsStaleCount: 1`, `sourceContradictionCautionCount: 1`, `runtimeContextCardCount: 5`, `harnessConsumableCandidateCount: 4`, `runtimeBridgeSignalCount: 4`, `runtimeBlockedUntilNextBarrierCount: 5`, `staleSuppressionCarriedForwardCount: 1`, `contradictionCautionCarriedForwardCount: 1`, `harnessConsumablePayloadRatio: 0.8`, `nextBarrierSpecificityRatio: 1`, `sourceBoundCardRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_TO_RUNTIME_ADJACENT_DRY_RUN_OR_LIVE_CONTEXT_INJECTION_REHEARSAL`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and top-level sentinel kept null.

The dry-run converts stable v0.47 handoff judgements into a machine-shaped local dry-run context payload that a receiver/runtime test harness could consume next: four harness-consumable context candidates, one stale-suppressed card, and every card blocked until the next barrier. This is intentionally not another generic readiness scorecard; it rehearses local agent-context injection shape while still preventing external effects, production runtime integration, config writes, memory writes, authorization/enforcement/approve/block/allow semantics, and network/resource fetch.

## Carry-forward prior release boundaries

The v0.47 repeatability scorecard remains the pinned upstream source: three runs, five stable handoff items, four included for live context, one stale item suppressed, one contradiction caution, receiver usefulness ratio 1, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No production runtime integration, durable memory promotion, config writes, memory writes, network/resource fetch, tool execution, authorization, approval/block/allow semantics, enforcement, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.47.5

This is the public review release `v0.47.5`. Current v0.47.5 status is narrower than live runtime and crosses the next safe barrier after v0.46: **passive live memory/coherence receiver live-context handoff utility repeatability scorecard**.

The v0.47 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.46.5 receiver live-context handoff utility artifact, pre-read path pinned, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.47.5 evidence: `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `sourceHandoffWindowCount: 1`, `handoffItemCount: 5`, `totalHandoffUtilityJudgementCount: 15`, `stableHandoffItemCount: 5`, `unstableHandoffItemCount: 0`, `stableIncludedForLiveContextCount: 4`, `stableExcludedAsStaleCount: 1`, `stableContradictionCautionCount: 1`, `stableReceiverUsefulHandoffItemCount: 4`, `stableReceiverNoisyHandoffItemCount: 0`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `receiverUsefulnessRatio: 1`, `stableHandoffUtilityTreatmentRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The repeatability scorecard checks the v0.46 handoffItems / handoffUtilityJudgements under baseline, paraphrased rationale/whyUseful, and reverse-order variants. It keeps all five handoff items stable: four included for live context, one stale item suppressed, and one contradiction preserved as human caution. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.46 passive live memory/coherence receiver live-context handoff utility remains the upstream signal source: one handoff window, five handoff items, four included for live context, one stale suppressed, one contradiction caution, receiver usefulness ratio 1, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.46.5

This is the public review release `v0.46.5`. Current v0.46.5 status is narrower than live runtime and crosses the next safe barrier after v0.45: **passive live memory/coherence receiver live-context handoff utility**.

The v0.46 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.45.5 receiver usefulness live observation repeatability artifact, pre-read path pinned, stable-signals-only, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.46.5 evidence: `handoffUtilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE`, `sourceRepeatabilityRunCount: 3`, `sourceStableObservationCount: 5`, `sourceUnstableObservationCount: 0`, `handoffWindowCount: 1`, `handoffItemCount: 5`, `includedForLiveContextCount: 4`, `excludedAsStaleCount: 1`, `contradictionCautionCount: 1`, `receiverUsefulHandoffItemCount: 4`, `receiverNoisyHandoffItemCount: 0`, `rawSignalUsefulHandoffItemCount: 3`, `rawSignalNoisyHandoffItemCount: 2`, `scorecardUsefulHandoffItemCount: 3`, `scorecardNoisyHandoffItemCount: 2`, `receiverUsefulnessRatio: 1`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `stableSignalCarryForwardRatio: 1`, `sourceBoundHandoffRatio: 1`, `staleSuppressionUsefulRatio: 1`, `contradictionCautionUsefulRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The handoff utility assembles stable v0.45 observations into bounded human live context: three normal context items, one contradiction caution, and one stale item intentionally suppressed. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.45 passive live memory/coherence receiver usefulness live observation repeatability scorecard remains the upstream signal source: three repeatability runs, fifteen judgements, five stable observations, zero unstable observations, receiver usefulness ratio 1, stale suppression and contradiction caution preserved, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.45.5

This is the public review release `v0.45.5`. Current v0.45.5 status is narrower than live runtime and crosses the next safe barrier after v0.44: **passive live memory/coherence receiver usefulness live observation repeatability scorecard**.

The v0.45 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.44.5 receiver usefulness live observation artifact, pre-read path pinned, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.45.5 evidence: `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `sourceLiveObservationWindowCount: 1`, `candidateCount: 5`, `totalLiveObservationJudgementCount: 15`, `stableObservationCount: 5`, `unstableObservationCount: 0`, `stableIncludedForHumanContextCount: 3`, `stableStaleSuppressedObservationCount: 1`, `stableContradictionCautionObservationCount: 1`, `stableReceiverUsefulLiveContextItemCount: 4`, `stableReceiverNoisyLiveContextItemCount: 0`, `stableRawSignalUsefulItemCount: 3`, `stableRawSignalNoisyItemCount: 2`, `stableScorecardUsefulItemCount: 3`, `stableScorecardNoisyItemCount: 2`, `receiverUsefulnessRatio: 1`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `labelAgreementRatio: 1`, `stableLiveObservationTreatmentRatio: 1`, `receiverUsefulnessRepeatabilityRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `staleSuppressionRepeatabilityRatio: 1`, `contradictionCautionRepeatabilityRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The repeatability scorecard repeats the v0.44 live observation under baseline, paraphrased-observation, and reverse-order variants. It keeps all five live observations stable: three included for human context, one stale prior-release anchor suppressed, and one contradiction preserved as human caution. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.44 passive live memory/coherence receiver usefulness live observation remains the upstream signal source: four explicit repo-local sources, five source-bound observation items, receiver usefulness ratio 1, stale suppression and contradiction caution preserved, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
