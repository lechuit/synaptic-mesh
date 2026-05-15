# Release Notes — Synaptic Mesh v0.19.5

## Summary

`v0.19.5` introduces the **live-adapter shadow-read** gate: a minimal constrained local read adapter abstraction over the prior explicit repo-local source read. It is operator-run, one-shot, local-only, passive/read-only, bounded by window/count, and persists only redacted evidence plus a human-readable report.

## Evidence

- `policyDecision: null`
- `agentConsumedOutput: false`
- `rawPersisted: false`
- `unexpectedPermits: 0`
- live-adapter shadow-read through minimal constrained local read adapter abstraction
- redaction-before-persist and redacted evidence only
- human-readable report
- two independent local review notes included; not GitHub UI reviews and not deployment approvals

## Boundary

No enforcement, no authorization, no approval/block/allow, no autonomous live mode, no watcher/daemon, no tool execution, no memory/config writes, no network/resource fetch, no agent-consumed machine-readable policy decisions, and no external effects.

## Next

The next gate should collect observed failure modes around the adapter shadow-read boundary without adding authority, enforcement, daemon behavior, network/resource fetch, or agent-consumed policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
