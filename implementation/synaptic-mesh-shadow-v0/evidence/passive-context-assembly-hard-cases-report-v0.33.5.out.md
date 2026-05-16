# Passive Context Assembly Hard Cases Scorecard v0.33.5

hardCaseStatus: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE
hardCaseCount=5
activeRulePreferredCount=1
partialContradictionFlagCount=1
sourceBoundDecisionCarryForwardCount=1
staleCautionPreservedCount=1
temptingNoiseSuppressedCount=1
sourceBoundHardCaseRatio=1
hardCaseCoverageRatio=1
humanReviewOnlyRatio=1
minimalContextRatio=1
noPromotionWithoutHumanRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable hard-case context assembly scorecard only. Hard-case treatments are for human review, not runtime instructions, not memory promotion, and not authority.

## Hard cases
- hard-active-project-rule-vs-old-context: active_rule_preferred_for_human_context; type=active_project_rule; outcome=include; sourceBound=true; promoteToMemory=false
- hard-partial-contradiction-thread: partial_contradiction_flagged_for_human_resolution; type=partial_contradiction; outcome=flag; sourceBound=true; promoteToMemory=false
- hard-source-bound-decision-carry-forward: source_bound_decision_carried_forward_for_human_context; type=source_bound_decision; outcome=include; sourceBound=true; promoteToMemory=false
- hard-stale-caution-not-instruction: stale_context_preserved_as_caution_not_instruction; type=stale_caution; outcome=caution; sourceBound=true; promoteToMemory=false
- hard-tempting-noise-suppression: tempting_noise_suppressed_from_minimal_context; type=noise_suppression; outcome=suppress; sourceBound=true; promoteToMemory=false

## Validation issues
- none
