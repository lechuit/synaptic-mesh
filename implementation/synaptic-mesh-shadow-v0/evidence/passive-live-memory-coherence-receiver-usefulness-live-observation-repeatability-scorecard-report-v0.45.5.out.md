# Passive Live Memory Coherence Receiver Usefulness Live Observation Repeatability Scorecard v0.45.5

repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE
repeatabilityRunCount=3
sourceLiveObservationWindowCount=1
candidateCount=5
totalLiveObservationJudgementCount=15
stableObservationCount=5
unstableObservationCount=0
stableIncludedForHumanContextCount=3
stableStaleSuppressedObservationCount=1
stableContradictionCautionObservationCount=1
stableReceiverUsefulLiveContextItemCount=4
stableReceiverNoisyLiveContextItemCount=0
stableRawSignalUsefulItemCount=3
stableRawSignalNoisyItemCount=2
stableScorecardUsefulItemCount=3
stableScorecardNoisyItemCount=2
receiverUsefulnessRatio=1
rawSignalUsefulnessRatio=0.6
scorecardUsefulnessRatio=0.6
labelAgreementRatio=1
stableLiveObservationTreatmentRatio=1
receiverUsefulnessRepeatabilityRatio=1
sourceBoundRepeatabilityRatio=1
staleSuppressionRepeatabilityRatio=1
contradictionCautionRepeatabilityRatio=1
rawPersistedFalseRatio=1
humanReviewOnlyRepeatabilityRatio=1
noPromotionWithoutHumanRepeatabilityRatio=1
agentConsumedOutputFalseRatio=1
preReadPathPinned=true
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable passive live observation repeatability scorecard only. The scorecard repeats the pinned v0.44.5 live observation under bounded variants, is not a memory write, is not runtime integration, and is not an agent-consumed decision.

## Stable live observation judgements
- live-observation-boundary-invariants: stable=true; treatment=include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-contradictory-boundary-claim: stable=true; treatment=include_as_contradiction_caution; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-current-release-continuity: stable=true; treatment=include_for_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false
- live-observation-repeatability-evidence: stable=true; treatment=include_for_human_context; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md; sourceBound=true; promoteToMemory=false
- live-observation-stale-prior-release-anchor: stable=true; treatment=exclude_as_stale_from_human_context; source=docs/status-v0.43.5.md; sourceBound=true; promoteToMemory=false

## Validation issues
- none
