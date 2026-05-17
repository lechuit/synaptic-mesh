# Passive Hard-Case Outcome Repeatability Scorecard v0.35.5

repeatabilityStatus: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE
repeatabilityRunCount=3
hardCaseCount=5
totalOutcomeJudgementCount=15
stableHardCaseCount=5
unstableHardCaseCount=0
stableUsefulHardCaseCount=3
stableNoiseHardCaseCount=1
stableEvidenceGapHardCaseCount=1
labelAgreementJudgementCount=15
labelAgreementRatio=1
stableHardCaseRatio=1
sourceBoundRepeatabilityRatio=1
humanReviewOnlyRepeatabilityRatio=1
noPromotionWithoutHumanRepeatabilityRatio=1
agentConsumedOutputFalseRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable repeatability scorecard only. Repeated usefulness/noise/evidence-gap labels measure stability for human review; they are not policy decisions, not memory promotion, and not runtime instructions.

## Repeatability items
- hard-active-project-rule-vs-old-context: stable=true; agreesWithV034=true; expected=useful; promoteToMemory=false
- hard-partial-contradiction-thread: stable=true; agreesWithV034=true; expected=evidence_gap; promoteToMemory=false
- hard-source-bound-decision-carry-forward: stable=true; agreesWithV034=true; expected=useful; promoteToMemory=false
- hard-stale-caution-not-instruction: stable=true; agreesWithV034=true; expected=useful; promoteToMemory=false
- hard-tempting-noise-suppression: stable=true; agreesWithV034=true; expected=noise; promoteToMemory=false

## Validation issues
- none
