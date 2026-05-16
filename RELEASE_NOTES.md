# Release Notes — Synaptic Mesh v0.41.5

## Summary

`v0.41.5` adds a **passive live memory/coherence stable invalidation receiver package** over the completed pinned v0.40.5 invalidation repeatability scorecard. It packages stable carry-forward, stale invalidation, and contradiction caution signals into a minimal receiver-side human handoff before any move toward live memory.

## Evidence

- `receiverPackageStatus: PASSIVE_LIVE_MEMORY_COHERENCE_STABLE_INVALIDATION_RECEIVER_PACKAGE_COMPLETE`
- `receiverPackageItemCount: 5`
- `stableCarryForwardItemCount: 3`
- `stableStaleInvalidatedItemCount: 1`
- `stableContradictionCautionItemCount: 1`
- `includedForHumanHandoffCount: 4`
- `excludedAsStaleCount: 1`
- `contradictionCautionCount: 1`
- `sourceBoundItemRatio: 1`
- `stableSignalRatio: 1`
- `redactedBeforePersistRatio: 1`
- `rawPersistedFalseRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `preReadPathPinned: true`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for pre-read path traversal, implementation-path traversal, malformed/spoofed pinned v0.40 repeatability artifact, digest drift, object digest drift, report digest drift, repeatability metric drift, candidate/source/redaction/boundary drift, stale-not-invalidated, contradiction-not-cautioned, unknown-field smuggling, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, and memory-promotion flags

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.40.5 repeatability artifact, pre-read path pinned, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may measure whether this receiver-side package is useful to a human/agent handoff in a passive live continuity rehearsal, or perform a narrow live passive observation against real session/project continuity if evidence justifies it. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
