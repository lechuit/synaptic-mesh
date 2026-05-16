# Release Notes — Synaptic Mesh v0.43.5

## Summary

`v0.43.5` adds a **passive live memory/coherence receiver usefulness repeatability scorecard** over the completed pinned v0.42.5 receiver package usefulness rehearsal. It tests whether the receiver usefulness treatment remains stable across baseline order, paraphrased rationales, and reverse order before any passive live observation boundary.

## Evidence

- `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `sourceRehearsalWindowCount: 1`
- `candidateCount: 5`
- `totalUsefulnessJudgementCount: 15`
- `stableCandidateCount: 5`
- `unstableCandidateCount: 0`
- `stableReceiverUsefulHandoffItemCount: 4`
- `stableReceiverNoisyHandoffItemCount: 0`
- `stableReceiverExcludedStaleItemCount: 1`
- `stableReceiverContradictionCautionItemCount: 1`
- `stableRawSignalUsefulHandoffItemCount: 3`
- `stableRawSignalNoisyHandoffItemCount: 2`
- `stableScorecardUsefulHandoffItemCount: 3`
- `stableScorecardNoisyHandoffItemCount: 2`
- `receiverUsefulnessRatio: 1`
- `rawSignalUsefulnessRatio: 0.6`
- `scorecardUsefulnessRatio: 0.6`
- `receiverImprovesOverRawSignals: true`
- `receiverImprovesOverScorecard: true`
- `labelAgreementRatio: 1`
- `stableUsefulnessTreatmentRatio: 1`
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
- `policyDecision: null` retained only as a top-level compatibility/null sentinel; not repeated in protocol, metrics, per-run/per-judgement entries, or CLI stdout
- Negative controls for pre-read path traversal, implementation-path traversal, malformed/spoofed pinned v0.42 usefulness artifact, digest drift, object/report drift, source metric drift, judgement-count drift, unknown-field smuggling, runtime/tool/network/memory/config requests, raw output, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, and memory-promotion flags.

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.42.5 usefulness rehearsal artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

## Next

The next gate may run a passive live observation rehearsal using the receiver package as human-readable context only. It should stay read-only, redacted-before-persist, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.
