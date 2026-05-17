# Passive Live Memory Coherence Stable Invalidation Receiver Package v0.41.5

receiverPackageStatus: PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE
receiverPackageItemCount=5
stableCarryForwardItemCount=3
stableStaleInvalidatedItemCount=1
stableContradictionCautionItemCount=1
includedForHumanHandoffCount=4
excludedAsStaleCount=1
contradictionCautionCount=1
sourceBoundItemRatio=1
stableSignalRatio=1
redactedBeforePersistRatio=1
humanReviewOnlyRatio=1
noPromotionWithoutHumanRatio=1
agentConsumedOutputFalseRatio=1
preReadPathPinned=true
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable receiver-side package only. Stable signals are arranged for human continuity review; they are not memory writes, runtime instructions, or agent-consumed policy decisions.

## Receiver package items
- candidate-current-release-continuity: lane=stable_carry_forward; receiverTreatment=carry_forward_for_human_context; handoffInclusion=include_for_human_handoff; promoteToMemory=false
- candidate-boundary-invariants: lane=stable_carry_forward; receiverTreatment=carry_forward_for_human_context; handoffInclusion=include_for_human_handoff; promoteToMemory=false
- candidate-repeatability-evidence: lane=stable_carry_forward; receiverTreatment=carry_forward_for_human_context; handoffInclusion=include_for_human_handoff; promoteToMemory=false
- candidate-stale-prior-release-anchor: lane=stable_stale_invalidated; receiverTreatment=suppress_from_handoff_as_stale; handoffInclusion=exclude_from_handoff_as_stale; promoteToMemory=false
- candidate-contradictory-boundary-claim: lane=stable_contradiction_caution; receiverTreatment=include_as_contradiction_caution; handoffInclusion=include_as_contradiction_caution; promoteToMemory=false

## Validation issues
- none
