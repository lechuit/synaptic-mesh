# Passive Live Memory Coherence Invalidation Repeatability Scorecard v0.40.5

repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE
repeatabilityRunCount=3
candidateSignalCount=5
totalInvalidationJudgementCount=15
stableCandidateCount=5
unstableCandidateCount=0
stableValidCarryForwardCount=3
stableStaleInvalidatedCount=1
stableContradictionCautionCount=1
labelAgreementRatio=1
stableInvalidationTreatmentRatio=1
sourceBoundRepeatabilityRatio=1
staleInvalidationRepeatabilityRatio=1
contradictionCautionRepeatabilityRatio=1
validCarryForwardRepeatabilityRatio=1
redactedBeforePersistRepeatabilityRatio=1
humanReviewOnlyRepeatabilityRatio=1
noPromotionWithoutHumanRepeatabilityRatio=1
agentConsumedOutputFalseRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable passive repeatability scorecard only. Repeated invalidation judgements are source-bound and redacted before persist; they are not memory writes, runtime instructions, or agent-consumed policy decisions.

## Repeatability items
- candidate-current-release-continuity: stable=true; treatment=carry_forward_valid; humanTreatment=include_for_human_handoff; promoteToMemory=false
- candidate-boundary-invariants: stable=true; treatment=carry_forward_valid; humanTreatment=include_for_human_handoff; promoteToMemory=false
- candidate-repeatability-evidence: stable=true; treatment=carry_forward_valid; humanTreatment=include_for_human_handoff; promoteToMemory=false
- candidate-stale-prior-release-anchor: stable=true; treatment=invalidate_as_stale; humanTreatment=exclude_from_handoff_as_stale; promoteToMemory=false
- candidate-contradictory-boundary-claim: stable=true; treatment=label_contradiction_for_human_review; humanTreatment=include_as_contradiction_caution; promoteToMemory=false

## Validation issues
- none
