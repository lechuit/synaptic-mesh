# Passive Memory Handoff Candidate Scorecard v0.29.5

handoffStatus: MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE
candidateCount=4
carryForwardCandidateCount=2
contradictionCandidateCount=1
staleCautionCandidateCount=1
sourceBoundCandidateRatio=1
contradictionFlagRatio=1
staleCautionRatio=1
noiseSuppressedCount=1
noiseSuppressionRatio=1
humanReviewCandidateRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable local handoff candidates only. This scorecard does not write memory, does not feed a runtime, and does not grant authority.

## Candidates
- card-north-star-decision: carry_forward_candidate; sourceBound=true; contradictionFlagged=false; staleCautionFlagged=false
- card-boundary-project-rule: carry_forward_candidate; sourceBound=true; contradictionFlagged=false; staleCautionFlagged=false
- card-readiness-theater-contradiction: surface_contradiction_candidate; sourceBound=true; contradictionFlagged=true; staleCautionFlagged=false
- card-stale-rag-negative-context: stale_caution_candidate; sourceBound=true; contradictionFlagged=false; staleCautionFlagged=true

## Validation issues
- none
