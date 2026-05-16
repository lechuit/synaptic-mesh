# Release Notes — Synaptic Mesh v0.30.5

## Summary

`v0.30.5` adds **passive handoff receiver shadow rubric** over the completed v0.29.5 handoff candidate scorecard artifact. It tests whether passive handoff candidates help a human receiver assemble safe continuity context: include source-bound carry-forward context, surface contradictions for conflict review, keep stale negative context as stale caution, and preserve upstream noise exclusion.

## Evidence

- `receiverStatus: PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE`
- `receiverItemCount: 4`
- `includeForHumanContextCount: 2`
- `contradictionReviewCount: 1`
- `staleCautionReviewCount: 1`
- `excludedUpstreamNoiseCount: 1`
- `sourceBoundReceiverRatio: 1`
- `contradictionHandledRatio: 1`
- `staleHandledRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed handoff artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics, unexpected or missing cards, wrong treatments, source-bound failures, contradiction/stale failures, source-anchor/digest mismatches, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, and authority-token text/card IDs that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.29.5 handoff candidate artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test authority/source conflict handling across competing memories, stale-memory invalidation over newer evidence, or a receiver-side usefulness comparison on harder long-context cases. It must not convert recommendations or receiver items into authority, memory writes, or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
