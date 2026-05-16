# Release Notes — Synaptic Mesh v0.44.5

## Summary

`v0.44.5` adds a **passive live memory/coherence receiver usefulness live observation** over the completed pinned v0.43.5 receiver usefulness repeatability scorecard. It observes current repo-local continuity sources while preserving receiver-side context treatment: include useful continuity evidence, suppress stale prior-release anchors, and preserve contradictions as human caution only.

## Evidence

- `liveObservationStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE`
- `explicitRepoLocalSourceCount: 4`
- `sourceRepeatabilityRunCount: 3`
- `sourceCandidateCount: 5`
- `sourceStableCandidateCount: 5`
- `liveObservationItemCount: 5`
- `sourceBoundObservationCount: 5`
- `includedForHumanContextCount: 3`
- `staleSuppressedObservationCount: 1`
- `contradictionCautionObservationCount: 1`
- `receiverUsefulLiveContextItemCount: 4`
- `receiverNoisyLiveContextItemCount: 0`
- `rawSignalUsefulItemCount: 3`
- `rawSignalNoisyItemCount: 2`
- `scorecardUsefulItemCount: 3`
- `scorecardNoisyItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `receiverImprovesOverRawSignals: true`
- `receiverImprovesOverScorecard: true`
- `sourceBoundObservationRatio: 1`
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
- `policyDecision: null` retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, observation items, or CLI stdout
- Negative controls for traversal-like unpinned artifact paths, unpinned source paths, malformed/spoofed pinned v0.43 repeatability artifact, digest drift, metric drift, source-count drift, repo-local source tampering, raw persistence, external effects, tool execution, memory/config writes, runtime integration, raw output, and non-null `policyDecision`.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.43.5 repeatability scorecard artifact plus explicit repo-local live sources, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate should either repeat this passive live observation window for drift/repeatability or measure receiver-side live-observation handoff utility before any memory write or runtime integration boundary.
