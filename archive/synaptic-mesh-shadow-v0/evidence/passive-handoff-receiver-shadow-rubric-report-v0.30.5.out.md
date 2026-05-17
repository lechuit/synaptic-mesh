# Passive Handoff Receiver Shadow Rubric v0.30.5

receiverStatus: PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE
receiverItemCount=4
includeForHumanContextCount=2
contradictionReviewCount=1
staleCautionReviewCount=1
excludedUpstreamNoiseCount=1
sourceBoundReceiverRatio=1
contradictionHandledRatio=1
staleHandledRatio=1
noPromotionWithoutHumanRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable receiver rubric only. This artifact does not write memory, does not feed a runtime, and does not create authority.

## Receiver items
- card-north-star-decision: include_for_human_context; sourceBound=true; promoteToMemory=false
- card-boundary-project-rule: include_for_human_context; sourceBound=true; promoteToMemory=false
- card-readiness-theater-contradiction: surface_for_human_conflict_review; sourceBound=true; promoteToMemory=false
- card-stale-rag-negative-context: include_as_stale_caution_for_human_review; sourceBound=true; promoteToMemory=false

## Validation issues
- none
