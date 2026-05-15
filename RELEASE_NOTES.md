# Release Notes — Synaptic Mesh v0.27.5

## Summary

`v0.27.5` adds **passive observation repeatability scorecard** over v0.26 passive observation window artifacts. It aggregates several bounded local/manual/operator-run windows to measure repeatability and useful signal before any stronger live behavior.

## Evidence

- `scorecardStatus: REPEATABILITY_SCORECARD_COMPLETE`
- `completed windows: 3`
- `degraded windows: 1`
- `usefulOutcomeRatio: 1`
- `repeatabilityRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `policyDecision: null`
- `human-readable report only`
- negative controls for malformed window artifacts, non-null policyDecision, authority tokens in nested/report fields, raw persistence/output, unsafe CLI paths, invalid counts/NaN, missing degradation cause, and recommendation treated as authority

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to explicit redacted v0.26 passive observation window artifacts, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, external effects, daemon/watchers, autonomous runtime, raw persistence/output, or agent-consumed machine-readable policy decisions.

## Next

The next gate may continue observation-only repeatability evidence or improve reviewer ergonomics. It must not convert recommendations into authority or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
