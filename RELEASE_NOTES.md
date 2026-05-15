# Release Notes — Synaptic Mesh v0.28.5

## Summary

`v0.28.5` adds **passive memory recall usefulness probe** over explicit redacted passive observation evidence and human-authored recall need cards. It tests whether the evidence helps recover continuity-relevant memory for AI agents: decisions, project rules, contradictions, and stale negative context.

## Evidence

- `probeStatus: MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE`
- `cardCount: 4`
- `evidenceCount: 5`
- `sourceArtifactCount: 1`
- `source-anchor digest verified`
- `usefulRecallRatio: 0.75`
- `contradictionSurfacingRatio: 1`
- `staleNegativeMarkedRatio: 1`
- `sourceBoundMatchRatio: 1`
- `irrelevantMatchRatio: 0`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed cards, missing evidence/source artifacts, non-null policyDecision, authority tokens in nested/report fields, raw persistence/output/source text, unsafe CLI paths, network/tool/memory/config/runtime flags, invalid/NaN metrics, unsourced matches, source anchor/digest mismatch, stale evidence not marked stale, contradiction evidence not surfaced, and recommendation treated as authority

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to explicit repo-local redacted artifacts and explicit recall need cards, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, durable memory writes, or agent-consumed machine-readable policy decisions.

## Next

The next gate may harden source/authority binding, contradiction handling, stale-memory invalidation, or receiver-side handoff decisions. It must not convert recommendations into authority or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
