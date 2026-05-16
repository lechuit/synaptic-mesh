# Release Notes — Synaptic Mesh v0.39.5

## Summary

`v0.39.5` adds a **passive live memory/coherence stale/contradiction invalidation window** over the completed pinned v0.38.5 usefulness window artifact. It measures whether passive handoff can preserve current useful signals while invalidating stale claims and caution-labeling contradictions before any move toward live memory.

## Evidence

- `invalidationWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE`
- `invalidationWindowCount: 1`
- `candidateSignalCount: 5`
- `validCarryForwardCount: 3`
- `staleSignalCount: 1`
- `contradictionSignalCount: 1`
- `staleInvalidatedCount: 1`
- `contradictionCautionCount: 1`
- `includedForHumanHandoffCount: 3`
- `invalidatedOrCautionedSignalCount: 2`
- `sourceBoundInvalidationRatio: 1`
- `staleInvalidationRatio: 1`
- `contradictionCautionRatio: 1`
- `validCarryForwardRatio: 1`
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
- `human-readable report only`
- negative controls for missing/malformed v0.38 usefulness artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics/report digest, wrong artifact path/digest/object digest, report markdown poisoning, usefulness handoff label/source/boundary drift, stale-not-invalidated, contradiction-not-cautioned, unknown-field smuggling, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.38.5 usefulness window artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test repeatability of stale/contradiction invalidation or a stricter receiver-side memory package if this invalidation package survives review. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
