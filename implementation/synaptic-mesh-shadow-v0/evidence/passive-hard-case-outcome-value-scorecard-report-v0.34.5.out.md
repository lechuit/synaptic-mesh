# Passive Hard-Case Outcome Value Scorecard v0.34.5

outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE
outcomeCount=5
usefulOutcomeCount=3
noiseOutcomeCount=1
evidenceGapOutcomeCount=1
usefulOutcomeRatio=0.6
noiseOutcomeRatio=0.2
evidenceGapRatio=0.2
sourceBoundOutcomeRatio=1
humanReviewOnlyRatio=1
minimalContextRatio=1
noPromotionWithoutHumanRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable receiver outcome value scorecard only. Outcome labels measure usefulness/noise/evidence gaps for human review; they are not policy decisions, not memory promotion, and not runtime instructions.

## Receiver outcomes
- hard-active-project-rule-vs-old-context: useful; label=useful_for_human_continuity; sourceBound=true; promoteToMemory=false
- hard-partial-contradiction-thread: evidence_gap; label=needs_more_evidence; sourceBound=true; promoteToMemory=false
- hard-source-bound-decision-carry-forward: useful; label=useful_for_human_continuity; sourceBound=true; promoteToMemory=false
- hard-stale-caution-not-instruction: useful; label=useful_for_human_continuity; sourceBound=true; promoteToMemory=false
- hard-tempting-noise-suppression: noise; label=noise_for_human_context; sourceBound=true; promoteToMemory=false

## Validation issues
- none

