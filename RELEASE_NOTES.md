# Release Notes — Synaptic Mesh v0.38.5

## Summary

`v0.38.5` adds a **bounded passive live memory/coherence usefulness window** over the completed pinned v0.37.5 passive live memory/coherence repeatability scorecard artifact. It measures whether the stable passive observations form a useful source-bound human handoff package without becoming memory promotion, authority, runtime behavior, or agent-consumed policy.

## Evidence

- `usefulnessWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_USEFULNESS_WINDOW_COMPLETE`
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
- `human-readable report only`
- negative controls for missing/malformed v0.37 repeatability artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics/report digest, wrong artifact path/digest/object digest, unknown fields, report markdown poisoning, repeatability item label/stability/source drift, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.37.5 repeatability scorecard artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test a stricter human receiver/handoff usefulness judgement or a stale/contradiction invalidation window if the usefulness package survives review. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
