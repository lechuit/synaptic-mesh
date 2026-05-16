# Passive Live Memory/Coherence Usefulness Window — Reviewer Package v0.38.5

Reviewer package target: `PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE`.

Pinned evidence:

- `usefulnessWindowCount: 1`
- `handoffItemCount: 4`
- `usefulHandoffItemCount: 4`
- `noisyHandoffItemCount: 0`
- `includeForHumanHandoffCount: 3`
- `cautionOnlyCount: 1`
- `sourceBoundHandoffRatio: 1`
- `stableSignalCarryForwardRatio: 1`
- `usefulHandoffRatio: 1`
- `redactedBeforePersistRatio: 1`
- `rawPersistedFalseRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- human-readable report only

This package measures bounded usefulness of stable passive memory/coherence signals for human handoff. It does not write memory, create live runtime behavior, or authorize any decision.
