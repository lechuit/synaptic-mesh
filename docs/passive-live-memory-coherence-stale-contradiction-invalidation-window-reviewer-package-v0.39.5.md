# Passive Live Memory/Coherence Stale/Contradiction Invalidation Window — Reviewer Package v0.39.5

Reviewer package target: `PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE`.

Pinned evidence:

- `invalidationWindowCount: 1`
- `candidateSignalCount: 5`
- `validCarryForwardCount: 3`
- `staleSignalCount: 1`
- `contradictionSignalCount: 1`
- `staleInvalidatedCount: 1`
- `contradictionCautionCount: 1`
- `includedForHumanHandoffCount: 3`
- `invalidatedOrCautionedSignalCount: 2`
- `sourceBoundInvalidationRatio: 1`
- `staleInvalidationRatio: 1`
- `contradictionCautionRatio: 1`
- `validCarryForwardRatio: 1`
- `redactedBeforePersistRatio: 1`
- `rawPersistedFalseRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- human-readable report only

This package measures whether a passive memory/coherence handoff can carry forward current signals while invalidating stale claims and caution-labeling contradictions. It does not write memory, create live runtime behavior, or authorize any decision.
