# Passive Live Memory Coherence Receiver Live Context Handoff Utility v0.46.5

handoffUtilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE
sourceRepeatabilityRunCount=3
sourceStableObservationCount=5
sourceUnstableObservationCount=0
handoffWindowCount=1
handoffItemCount=5
includedForLiveContextCount=4
excludedAsStaleCount=1
contradictionCautionCount=1
receiverUsefulHandoffItemCount=4
receiverNoisyHandoffItemCount=0
rawSignalUsefulHandoffItemCount=3
rawSignalNoisyHandoffItemCount=2
scorecardUsefulHandoffItemCount=3
scorecardNoisyHandoffItemCount=2
receiverUsefulnessRatio=1
rawSignalUsefulnessRatio=0.6
scorecardUsefulnessRatio=0.6
stableSignalCarryForwardRatio=1
sourceBoundHandoffRatio=1
staleSuppressionUsefulRatio=1
contradictionCautionUsefulRatio=1
rawPersistedFalseRatio=1
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

Human-readable passive live-context handoff utility report only. The handoff is assembled from stable v0.45 observations, remains human review context, and is not durable persistence or runtime behavior.

## Handoff items
- handoff-live-observation-boundary-invariants: include=true; treatment=include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md; sourceBound=true; promoteToMemory=false
- handoff-live-observation-contradictory-boundary-claim: include=true; treatment=include_as_contradiction_caution; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md; sourceBound=true; promoteToMemory=false
- handoff-live-observation-current-release-continuity: include=true; treatment=include_for_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false
- handoff-live-observation-repeatability-evidence: include=true; treatment=include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md; sourceBound=true; promoteToMemory=false
- handoff-live-observation-stale-prior-release-anchor: include=false; treatment=exclude_as_stale_from_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false

## Validation issues
- none
