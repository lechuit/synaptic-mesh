# Passive Live Memory/Coherence Invalidation Repeatability Scorecard — Reviewer Package v0.40.5

Reviewer package target: `PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE`.

Pinned evidence:

- `repeatabilityRunCount: 3`
- `candidateSignalCount: 5`
- `totalInvalidationJudgementCount: 15`
- `stableCandidateCount: 5`
- `unstableCandidateCount: 0`
- `stableValidCarryForwardCount: 3`
- `stableStaleInvalidatedCount: 1`
- `stableContradictionCautionCount: 1`
- `labelAgreementJudgementCount: 15`
- `labelAgreementRatio: 1`
- `stableInvalidationTreatmentRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
- `staleInvalidationRepeatabilityRatio: 1`
- `contradictionCautionRepeatabilityRatio: 1`
- `validCarryForwardRepeatabilityRatio: 1`
- `redactedBeforePersistRepeatabilityRatio: 1`
- `humanReviewOnlyRepeatabilityRatio: 1`
- `noPromotionWithoutHumanRepeatabilityRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- human-readable report only

This package measures whether passive memory/coherence invalidation decisions remain stable under paraphrase and order changes. It does not write memory, create live runtime behavior, or authorize any decision.
