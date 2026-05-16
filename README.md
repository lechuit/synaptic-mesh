# Synaptic Mesh v0.40.5

This is the public review release `v0.40.5`. Current v0.40.5 status is narrower than live runtime and crosses the next safe barrier after v0.39: **passive live memory/coherence invalidation repeatability scorecard**.

The v0.40 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.39.5 passive live memory/coherence stale/contradiction invalidation artifact, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.40.5 evidence: `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `candidateSignalCount: 5`, `totalInvalidationJudgementCount: 15`, `stableCandidateCount: 5`, `unstableCandidateCount: 0`, `stableValidCarryForwardCount: 3`, `stableStaleInvalidatedCount: 1`, `stableContradictionCautionCount: 1`, `labelAgreementJudgementCount: 15`, `labelAgreementRatio: 1`, `stableInvalidationTreatmentRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `staleInvalidationRepeatabilityRatio: 1`, `contradictionCautionRepeatabilityRatio: 1`, `validCarryForwardRepeatabilityRatio: 1`, `redactedBeforePersistRepeatabilityRatio: 1`, `humanReviewOnlyRepeatabilityRatio: 1`, `noPromotionWithoutHumanRepeatabilityRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The invalidation repeatability scorecard tests whether passive memory/coherence invalidation handoffs remain stable under paraphrased rationale and order reversal. It verifies that three current signals carry forward, one stale signal stays invalidated, and one contradictory boundary claim stays caution-labeled for human review. This is bounded repeatability measurement only. It is not memory promotion, agent-consumed instruction, authorization, approval/block/allow, enforcement, or live runtime behavior.

## v0.40.5 phase close

Passive live memory/coherence invalidation repeatability scorecard is prepared as a local review package. It tests label stability before any step closer to live memory, without adding authority, effects, daemon/watchers, autonomous runtime, raw output, memory writes, runtime integration, durable memory promotion, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.39 passive live memory/coherence stale/contradiction invalidation window remains the upstream signal source: `invalidationWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE`, one invalidation window, five candidate signals, three valid carry-forward signals, one stale invalidated signal, one contradiction caution signal, zero boundary violations, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
