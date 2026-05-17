# Passive Context Assembly Rehearsal Scorecard v0.32.5

assemblyStatus: PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE
assemblyItemCount=4
includeForHumanContextCount=2
conflictReviewCount=1
staleCautionCount=1
sourceBoundAssemblyRatio=1
minimalContextRatio=1
conflictFlaggedRatio=1
staleCautionRatio=1
noiseSuppressedCount=2
noiseSuppressionRatio=1
humanReviewOnlyRatio=1
noPromotionWithoutHumanRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable context assembly rehearsal only. Assembly suggestions are for human review, not runtime instructions, not memory promotion, and not authority.

## Assembly items
- context-source-bound-decision: include_for_human_continuity_context; role=core_context; sourceBound=true; promoteToMemory=false
- context-project-rule: include_for_human_project_rule_context; role=core_context; sourceBound=true; promoteToMemory=false
- context-explicit-contradiction: flag_for_human_conflict_resolution; role=conflict_review; sourceBound=true; promoteToMemory=false
- context-stale-negative-caution: include_as_stale_caution_not_instruction; role=stale_caution; sourceBound=true; promoteToMemory=false

## Validation issues
- none
