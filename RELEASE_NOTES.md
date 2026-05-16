# Release Notes — Synaptic Mesh v0.32.5

## Summary

`v0.32.5` adds **passive context assembly rehearsal scorecard** over the completed v0.31.5 source authority conflict scorecard artifact. It tests whether source/authority/conflict signals can help assemble a minimal human context package for AI continuity: include core source-bound context, flag explicit contradiction for human review, preserve stale context as caution, and suppress noisy competing context.

## Evidence

- `assemblyStatus: PASSIVE_CONTEXT_ASSEMBLY_REHEARSAL_SCORECARD_COMPLETE`
- `assemblyItemCount: 4`
- `includeForHumanContextCount: 2`
- `conflictReviewCount: 1`
- `staleCautionCount: 1`
- `sourceBoundAssemblyRatio: 1`
- `minimalContextRatio: 1`
- `conflictFlaggedRatio: 1`
- `staleCautionRatio: 1`
- `noiseSuppressedCount: 2`
- `noiseSuppressionRatio: 1`
- `humanReviewOnlyRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed conflict artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics, wrong conflict artifact path/digest, unknown top-level/protocol/metric/item fields, unexpected or missing conflict items, wrong treatments, source-bound failures, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text/IDs that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.31.5 conflict scorecard artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test the same context assembly rubric on harder long-context project/book continuity cases or rehearse receiver-side use by a human without converting suggestions into authority, memory writes, or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
