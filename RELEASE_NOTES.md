# Release Notes — Synaptic Mesh v0.33.5

## Summary

`v0.33.5` adds **passive context assembly hard cases scorecard** over the completed v0.32.5 context assembly rehearsal artifact. It tests whether the minimal human context package can survive harder long-continuity cases: active project rule versus old context, partial contradiction, source-bound decision carry-forward, stale caution preservation, and tempting noise suppression.

## Evidence

- `hardCaseStatus: PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE`
- `hardCaseCount: 5`
- `activeRulePreferredCount: 1`
- `partialContradictionFlagCount: 1`
- `sourceBoundDecisionCarryForwardCount: 1`
- `staleCautionPreservedCount: 1`
- `temptingNoiseSuppressedCount: 1`
- `sourceBoundHardCaseRatio: 1`
- `hardCaseCoverageRatio: 1`
- `humanReviewOnlyRatio: 1`
- `minimalContextRatio: 1`
- `noPromotionWithoutHumanRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed v0.32 context assembly artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics, wrong context assembly artifact path/digest, unknown top-level/protocol/metric/item fields, unexpected or missing assembly items, wrong treatments/roles/source conflicts, source-bound failures, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text/IDs that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.32.5 context assembly artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test hard-case assembly on a broader fixture set or introduce passive human receiver outcome capture for whether hard-case context packages were actually helpful, without converting suggestions into authority, memory writes, or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
