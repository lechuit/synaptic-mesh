# Passive Live Memory Coherence Usefulness Window v0.38.5

usefulnessWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE
usefulnessWindowCount=1
handoffItemCount=4
usefulHandoffItemCount=4
noisyHandoffItemCount=0
includeForHumanHandoffCount=3
cautionOnlyCount=1
sourceBoundHandoffRatio=1
stableSignalCarryForwardRatio=1
usefulHandoffRatio=1
redactedBeforePersistRatio=1
rawPersistedFalseRatio=1
humanReviewOnlyRatio=1
noPromotionWithoutHumanRatio=1
agentConsumedOutputFalseRatio=1
boundaryViolationCount=0
recommendation: ADVANCE_OBSERVATION_ONLY
recommendationIsAuthority=false
agentConsumedOutput=false
notRuntimeInstruction=true
policyDecision: null

Human-readable passive usefulness window only. It packages stable source-bound observations for human handoff review and does not write memory, change runtime behavior, or create agent-consumed policy.

## Handoff items
- handoff-current-release-continuity: source=obs-current-release-continuity; label=continuity_anchor; treatment=include_for_human_handoff; useful=true; promoteToMemory=false
- handoff-boundary-invariants: source=obs-boundary-invariants; label=boundary_guardrail_anchor; treatment=include_for_human_handoff; useful=true; promoteToMemory=false
- handoff-repeatability-evidence: source=obs-repeatability-evidence; label=advance_evidence_anchor; treatment=include_for_human_handoff; useful=true; promoteToMemory=false
- handoff-review-hardening-caution: source=obs-review-hardening-caution; label=hardening_caution; treatment=include_as_caution_only; useful=true; promoteToMemory=false

## Validation issues
- none
