# Release Notes — Synaptic Mesh v0.42.5

## Summary

`v0.42.5` adds a **passive live memory/coherence receiver package usefulness rehearsal** over the completed pinned v0.41.5 receiver package. It measures whether the receiver-side package improves human continuity handoff versus raw stable signals or the prior scorecard without receiver lanes.

## Evidence

- `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE`
- `rehearsalWindowCount: 1`
- `comparisonModeCount: 3`
- `receiverPackageItemCount: 5`
- `receiverUsefulHandoffItemCount: 4`
- `receiverNoisyHandoffItemCount: 0`
- `receiverExcludedStaleItemCount: 1`
- `receiverContradictionCautionItemCount: 1`
- `rawSignalUsefulHandoffItemCount: 3`
- `rawSignalNoisyHandoffItemCount: 2`
- `scorecardUsefulHandoffItemCount: 3`
- `scorecardNoisyHandoffItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `receiverImprovesOverRawSignals: true`
- `receiverImprovesOverScorecard: true`
- `sourceBoundRehearsalRatio: 1`
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
- `policyDecision: null`
- negative controls for pre-read path traversal, implementation-path traversal, malformed/spoofed pinned v0.41 receiver package artifact, digest drift, object/report drift, receiver metric drift, lane drift, boundary flag drift, unknown-field smuggling, runtime/tool/network/memory/config requests, raw output, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, and memory-promotion flags

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.41.5 receiver package artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate may run a passive live observation rehearsal using the receiver package as human-readable context only, or further stress the usefulness result under paraphrase/order variants. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.
