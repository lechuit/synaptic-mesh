# Release Notes — Synaptic Mesh v0.35.5

## Summary

`v0.35.5` adds **passive hard-case outcome repeatability scorecard** over the completed v0.34.5 hard-case outcome value artifact. It measures whether usefulness/noise/evidence-gap labels remain stable across repeated receiver passes, without converting labels into memory promotion, authority, or runtime behavior.

## Evidence

- `repeatabilityStatus: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE`
- `repeatabilityRunCount: 3`
- `hardCaseCount: 5`
- `totalOutcomeJudgementCount: 15`
- `stableHardCaseCount: 5`
- `unstableHardCaseCount: 0`
- `stableUsefulHardCaseCount: 3`
- `stableNoiseHardCaseCount: 1`
- `stableEvidenceGapHardCaseCount: 1`
- `labelAgreementRatio: 1`
- `stableHardCaseRatio: 1`
- `sourceBoundRepeatabilityRatio: 1`
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
- negative controls for missing/malformed v0.34 outcome value artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics/report digest, wrong artifact path/digest, unknown fields, semantic label/value spoofing, missing/unexpected/duplicated repeatability runs, receiver label drift, source-bound failures, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.34.5 outcome value artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may begin a carefully bounded live passive memory/coherence observation rehearsal only if repeatability evidence survives review. It should stay read-only, redacted-before-persist, human-readable, source-bound, non-authoritative, and `policyDecision: null` until an explicitly reviewed live boundary exists.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
