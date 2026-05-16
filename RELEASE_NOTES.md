# Release Notes — Synaptic Mesh v0.31.5

## Summary

`v0.31.5` adds **passive source authority conflict scorecard** over the completed v0.30.5 receiver rubric artifact. It tests whether competing memory/source situations can be surfaced safely for a human receiver: source-bound decision versus unsourced inference, project rule versus generic prior, explicit contradiction, and stale-memory invalidation.

## Evidence

- `conflictStatus: PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE`
- `conflictCaseCount: 4`
- `sourceBoundConflictRatio: 1`
- `authorityConflictSurfacedRatio: 1`
- `newerSourcePreferredRatio: 1`
- `contradictionConflictSurfacedRatio: 1`
- `staleInvalidationCautionRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed receiver artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics, wrong receiver artifact path/digest, unknown top-level/item fields, unexpected or missing receiver items, wrong treatments, source-bound failures, source-anchor/digest mismatches, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text/IDs that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.30.5 receiver rubric artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test stale-memory invalidation across a broader set of time-ordered evidence, or compare conflict-scorecard usefulness on harder long-context cases. It must not convert suggestions into authority, memory writes, or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
