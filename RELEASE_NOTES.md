# Release Notes — Synaptic Mesh v0.37.5

## Summary

`v0.37.5` adds **passive live memory/coherence repeatability scorecard** over the completed pinned v0.36.5 passive live memory/coherence observation rehearsal artifact. It measures whether the four passive observation labels remain stable across repeated receiver variations without becoming memory promotion, authority, runtime behavior, or agent-consumed policy.

## Evidence

- `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `observationItemCount: 4`
- `totalObservationJudgementCount: 12`
- `stableObservationCount: 4`
- `unstableObservationCount: 0`
- `stableIncludeForHumanContextCount: 3`
- `stableHardeningCautionCount: 1`
- `labelAgreementRatio: 1`
- `stableObservationRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
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
- negative controls for missing/malformed v0.36 observation artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics/report digest, wrong artifact path/digest/object digest, unknown fields, report markdown poisoning, observation item label drift, benign-looking semantic/source-path/source-sha/source-signal drift, source-bound failures, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.36.5 observation rehearsal artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may begin a carefully bounded live passive memory/coherence usefulness window only if repeatability evidence survives review. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
