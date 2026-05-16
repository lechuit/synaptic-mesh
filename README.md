# Synaptic Mesh v0.39.5

This is the public review release `v0.39.5`. Current v0.39.5 status is narrower than live runtime and crosses the next safe barrier after v0.38: **passive live memory/coherence stale/contradiction invalidation window**.

The v0.39 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.38.5 passive live memory/coherence usefulness window artifact, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.39.5 evidence: `invalidationWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE`, `invalidationWindowCount: 1`, `candidateSignalCount: 5`, `validCarryForwardCount: 3`, `staleSignalCount: 1`, `contradictionSignalCount: 1`, `staleInvalidatedCount: 1`, `contradictionCautionCount: 1`, `includedForHumanHandoffCount: 3`, `invalidatedOrCautionedSignalCount: 2`, `sourceBoundInvalidationRatio: 1`, `staleInvalidationRatio: 1`, `contradictionCautionRatio: 1`, `validCarryForwardRatio: 1`, `redactedBeforePersistRatio: 1`, `rawPersistedFalseRatio: 1`, `humanReviewOnlyRatio: 1`, `noPromotionWithoutHumanRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The invalidation window tests whether passive memory/coherence handoffs can preserve current useful signals while rejecting stale claims and labeling contradictions for human review. This is bounded usefulness/invalidation measurement only. It is not memory promotion, agent-consumed instruction, authorization, approval/block/allow, enforcement, or live runtime behavior.

## v0.39.5 phase close

Passive live memory/coherence stale/contradiction invalidation window is prepared as a local review package. It tests whether a handoff can discard or caution contradictory/stale signals before any step closer to live memory, without adding authority, effects, daemon/watchers, autonomous runtime, raw output, memory writes, runtime integration, durable memory promotion, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.38 bounded passive live memory/coherence usefulness window remains the upstream signal source: `usefulnessWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE`, one window, four handoff items, four useful items, zero noisy items, three include-for-human-handoff, one caution-only, source-bound handoff ratio 1, stable signal carry-forward ratio 1, useful handoff ratio 1, zero boundary violations, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
