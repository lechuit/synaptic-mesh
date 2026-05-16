# Passive Live Memory Coherence Receiver Live Context Handoff Utility Repeatability Scorecard v0.47.5

repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE
repeatabilityRunCount=3
sourceHandoffWindowCount=1
handoffItemCount=5
totalHandoffUtilityJudgementCount=15
stableHandoffItemCount=5
unstableHandoffItemCount=0
stableIncludedForLiveContextCount=4
stableExcludedAsStaleCount=1
stableContradictionCautionCount=1
stableReceiverUsefulHandoffItemCount=4
stableReceiverNoisyHandoffItemCount=0
stableRawSignalUsefulHandoffItemCount=3
stableRawSignalNoisyHandoffItemCount=2
stableScorecardUsefulHandoffItemCount=3
stableScorecardNoisyHandoffItemCount=2
receiverUsefulnessRatio=1
rawSignalUsefulnessRatio=0.6
scorecardUsefulnessRatio=0.6
stableHandoffUtilityTreatmentRatio=1
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

Human-readable passive live-context handoff utility repeatability scorecard only. It uses the pinned v0.46.5 handoff utility artifact, compares baseline, paraphrased rationale/whyUseful, and reverse-order variants, and is not durable persistence or runtime behavior.

## Stable handoff utility judgements
- handoff-live-observation-boundary-invariants: stable=true; include=true; label=USEFUL_CONTEXT_CARRY_FORWARD; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-reviewer-package-v0.43.5.md; promoteToMemory=false
- handoff-live-observation-contradictory-boundary-claim: stable=true; include=true; label=USEFUL_CONTRADICTION_CAUTION; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-local-review-notes-v0.43.5.md; promoteToMemory=false
- handoff-live-observation-current-release-continuity: stable=true; include=true; label=USEFUL_CONTEXT_CARRY_FORWARD; source=docs/status-v0.43.5.md; promoteToMemory=false
- handoff-live-observation-repeatability-evidence: stable=true; include=true; label=USEFUL_CONTEXT_CARRY_FORWARD; source=docs/passive-live-memory-coherence-receiver-usefulness-repeatability-scorecard-metrics-v0.43.2.md; promoteToMemory=false
- handoff-live-observation-stale-prior-release-anchor: stable=true; include=false; label=USEFUL_STALE_SUPPRESSION; source=docs/status-v0.43.5.md; promoteToMemory=false

## Validation issues
- none
