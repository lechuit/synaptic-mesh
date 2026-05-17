# Passive Source Authority Conflict Scorecard v0.31.5

conflictStatus: PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE
conflictCaseCount=4
sourceBoundConflictRatio=1
authorityConflictSurfacedRatio=1
newerSourcePreferredRatio=1
contradictionConflictSurfacedRatio=1
staleInvalidationCautionRatio=1
humanReviewOnlyRatio=1
noPromotionWithoutHumanRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable conflict scorecard only. Precedence suggestions are for human review, not runtime instructions, not memory promotion, and not authority.

## Conflict items
- conflict-source-bound-decision-vs-inference: prefer_source_bound_decision_for_human_review; sourceBound=true; promoteToMemory=false
- conflict-project-rule-vs-generic-prior: prefer_project_rule_over_generic_prior_for_human_review; sourceBound=true; promoteToMemory=false
- conflict-explicit-contradiction: surface_conflict_for_human_review; sourceBound=true; promoteToMemory=false
- conflict-stale-negative-context: mark_stale_as_caution_not_instruction; sourceBound=true; promoteToMemory=false

## Validation issues
- none
