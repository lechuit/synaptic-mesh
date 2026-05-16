# Release Notes — Synaptic Mesh v0.34.5

## Summary

`v0.34.5` adds **passive hard-case outcome value scorecard** over the completed v0.33.5 hard-case context assembly artifact. It measures whether hard-case context packages are actually useful to a human/shadow receiver versus noisy or under-evidenced, without converting outcome labels into authority.

## Evidence

- `outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`
- `outcomeCount: 5`
- `usefulOutcomeCount: 3`
- `noiseOutcomeCount: 1`
- `evidenceGapOutcomeCount: 1`
- `usefulOutcomeRatio: 0.6`
- `noiseOutcomeRatio: 0.2`
- `evidenceGapRatio: 0.2`
- `sourceBoundOutcomeRatio: 1`
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
- negative controls for missing/malformed v0.33 hard-case artifact, fabricated/wrong upstream artifact identity/release layer/schema/status/metrics, wrong hard-case artifact path/digest, missing/unexpected/duplicated receiver outcomes, invalid labels, source-bound failures, runtime/tool/network/memory/config requests, raw persistence/output requests, non-null `policyDecision`, recommendation-as-authority, agent-consumed output, memory-promotion flags, and authority-token text that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.33.5 hard-case artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, durable memory promotion, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, or agent-consumed machine-readable policy decisions.

## Next

The next gate may expand receiver outcome measurement across repeated hard-case windows or test whether usefulness/noise/evidence-gap signals remain stable under contradictory/stale project contexts, without turning them into memory writes or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
