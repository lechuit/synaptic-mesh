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
- `policyDecision: null` retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, runs, judgement items, or CLI stdout
- Negative controls for traversal-like unpinned artifact paths, malformed/spoofed pinned v0.44 live observation artifacts, digest drift, metric drift, live-observation item tampering, raw persistence, external effects, tool execution, memory/config writes, runtime integration, unknown runtime/boundary fields, raw output, and non-null `policyDecision`.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.44.5 live observation artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate should either repeat another bounded live-observation window or measure receiver-side live-context handoff utility before any memory write or runtime integration boundary.
