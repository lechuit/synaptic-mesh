# Passive Live Memory Coherence Receiver Package Usefulness Rehearsal v0.42.5

rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_PACKAGE_USEFULNESS_REHEARSAL_COMPLETE
rehearsalWindowCount=1
comparisonModeCount=3
receiverPackageItemCount=5
receiverUsefulHandoffItemCount=4
receiverNoisyHandoffItemCount=0
receiverExcludedStaleItemCount=1
receiverContradictionCautionItemCount=1
rawSignalUsefulHandoffItemCount=3
rawSignalNoisyHandoffItemCount=2
scorecardUsefulHandoffItemCount=3
scorecardNoisyHandoffItemCount=2
receiverUsefulnessRatio=1
rawSignalUsefulnessRatio=0.6
scorecardUsefulnessRatio=0.6
receiverImprovesOverRawSignals=true
receiverImprovesOverScorecard=true
sourceBoundRehearsalRatio=1
staleSuppressionUsefulRatio=1
contradictionCautionUsefulRatio=1
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

Human-readable usefulness rehearsal only. The receiver package appears more useful than raw signals or prior scorecard handoff because it reduces stale/contradiction noise without becoming memory, runtime instruction, or policy authority.

## Comparison modes
- receiver_package: useful=4; noisy=0; usefulnessRatio=1; failureMode=none
- raw_stable_signals: useful=3; noisy=2; usefulnessRatio=0.6; failureMode=stale_and_contradiction_signals_are_not_actionably_laned
- repeatability_scorecard: useful=3; noisy=2; usefulnessRatio=0.6; failureMode=requires_receiver_to_reinfer_handoff_lanes

## Validation issues
- none
