# Passive Live Memory Coherence Repeatability Scorecard v0.37.5

repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_COMPLETE
repeatabilityRunCount=3
observationItemCount=4
totalObservationJudgementCount=12
stableObservationCount=4
unstableObservationCount=0
stableIncludeForHumanContextCount=3
stableHardeningCautionCount=1
labelAgreementRatio=1
stableObservationRatio=1
sourceBoundRepeatabilityRatio=1
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

Human-readable passive repeatability scorecard only. Repeated judgements are source-bound and redacted before persist; they are not memory writes, runtime instructions, or agent-consumed policy decisions.

## Repeatability items
- obs-current-release-continuity: stable=true; receiverLabel=include_for_human_context; promoteToMemory=false
- obs-boundary-invariants: stable=true; receiverLabel=include_for_human_context; promoteToMemory=false
- obs-repeatability-evidence: stable=true; receiverLabel=include_for_human_context; promoteToMemory=false
- obs-review-hardening-caution: stable=true; receiverLabel=caution_for_future_hardening; promoteToMemory=false

## Validation issues
- none
