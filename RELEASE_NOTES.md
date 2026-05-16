# Release Notes — Synaptic Mesh v0.40.5

## Summary

`v0.40.5` adds a **passive live memory/coherence invalidation repeatability scorecard** over the completed pinned v0.39.5 stale/contradiction invalidation artifact. It measures whether carry-forward, stale invalidation, and contradiction caution labels stay stable under paraphrased rationale and reverse-order runs before any move toward live memory.

## Evidence

- `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `candidateSignalCount: 5`
- `totalInvalidationJudgementCount: 15`
- `stableCandidateCount: 5`
- `unstableCandidateCount: 0`
- `stableValidCarryForwardCount: 3`
- `stableStaleInvalidatedCount: 1`
- `stableContradictionCautionCount: 1`
- `labelAgreementJudgementCount: 15`
- `labelAgreementRatio: 1`
- `stableInvalidationTreatmentRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
- `staleInvalidationRepeatabilityRatio: 1`
- `contradictionCautionRepeatabilityRatio: 1`
- `validCarryForwardRepeatabilityRatio: 1`
- `redactedBeforePersistRepeatabilityRatio: 1`
- `humanReviewOnlyRepeatabilityRatio: 1`
- `noPromotionWithoutHumanRepeatabilityRatio: 1`
- `agentConsumedOutputFalseRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for malformed or spoofed pinned v0.39 invalidation artifact, traversal-shaped paths, digest drift, object digest mismatch, report digest drift, candidate/source/redaction/boundary drift, stale-not-invalidated, contradiction-not-cautioned, valid carry-forward drift, metric drift, unknown-field smuggling, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, and memory-promotion flags

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.39.5 invalidation artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may assemble a stricter receiver-side memory/coherence package from stable invalidation signals or test a tiny passive live observation against real session/project continuity if evidence justifies it. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
