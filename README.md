# Synaptic Mesh v0.42.5

This is the public review release `v0.42.5`. Current v0.42.5 status is narrower than live runtime and crosses the next safe barrier after v0.41: **passive live memory/coherence receiver package usefulness rehearsal**.

The v0.42 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.41.5 receiver package artifact, pre-read path pinned, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.42.5 evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE`, `rehearsalWindowCount: 1`, `comparisonModeCount: 3`, `receiverPackageItemCount: 5`, `receiverUsefulHandoffItemCount: 4`, `receiverNoisyHandoffItemCount: 0`, `receiverExcludedStaleItemCount: 1`, `receiverContradictionCautionItemCount: 1`, `rawSignalUsefulHandoffItemCount: 3`, `rawSignalNoisyHandoffItemCount: 2`, `scorecardUsefulHandoffItemCount: 3`, `scorecardNoisyHandoffItemCount: 2`, `receiverUsefulnessRatio: 1`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `receiverImprovesOverRawSignals: true`, `receiverImprovesOverScorecard: true`, `sourceBoundRehearsalRatio: 1`, `staleSuppressionUsefulRatio: 1`, `contradictionCautionUsefulRatio: 1`, `redactedBeforePersistRatio: 1`, `rawPersistedFalseRatio: 1`, `humanReviewOnlyRatio: 1`, `noPromotionWithoutHumanRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The receiver package usefulness rehearsal compares three handoff modes: using the v0.41 receiver package, exposing raw stable signals, and relying on the prior scorecard without receiver-side lanes. In this bounded rehearsal, the receiver package improves continuity handoff by suppressing a stale prior-release anchor, carrying forward three stable current signals, and preserving one contradictory boundary claim as a caution rather than ambiguous raw signal.

This is rehearsal evidence only. It is not memory promotion, agent-consumed instruction, authorization, approval/block/allow, enforcement, or live runtime behavior.

## Carry-forward prior release boundaries

The v0.41 passive live memory/coherence stable invalidation receiver package remains the upstream signal source: five receiver items, three stable carry-forward, one stale invalidated/excluded, one contradiction caution, four included for human handoff/caution, one excluded as stale, zero boundary violations, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
