# Passive Live Memory Coherence Receiver Usefulness Live Observation v0.44.5

liveObservationStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_COMPLETE
explicitRepoLocalSourceCount=4
sourceRepeatabilityRunCount=3
sourceCandidateCount=5
sourceStableCandidateCount=5
liveObservationItemCount=5
sourceBoundObservationCount=5
includedForHumanContextCount=3
staleSuppressedObservationCount=1
contradictionCautionObservationCount=1
receiverUsefulnessRatio=1
rawSignalUsefulnessRatio=0.6
scorecardUsefulnessRatio=0.6
sourceBoundObservationRatio=1
redactedBeforePersistRatio=1
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

Human-readable passive live memory/coherence observation only. Repo-local live sources are pinned before read, redacted before persist, not memory writes, not runtime instructions, and not agent-consumed decisions.

## Live observation items
- live-observation-boundary-invariants: include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-contradictory-boundary-claim: include_as_contradiction_caution; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-current-release-continuity: include_for_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-repeatability-evidence: include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md; sourceBound=true; promoteToMemory=false
- live-observation-stale-prior-release-anchor: exclude_as_stale_from_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false

## Validation issues
- none
