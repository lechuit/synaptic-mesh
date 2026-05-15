# Release Notes — Synaptic Mesh v0.18.5

## Summary

`v0.18.5` introduces the **live-read gate**: the first controlled crossing of the live input ingestion barrier. It runs one-shot, operator-started, local/passive/read-only ingestion from one explicit repo-local source, bounded to a small N, with redaction before persistence.

## Evidence

- `policyDecision: null`
- `agentConsumedOutput: false`
- `rawPersisted: false`
- `unexpectedPermits: 0`
- redacted evidence only
- two independent local review notes included; not GitHub UI reviews and not deployment approvals

## Boundary

No enforcement, no authorization, no approval/block/allow, no autonomous live mode, no watcher/daemon, no tool execution, no memory/config writes, no network/resource fetch, no agent-consumed machine-readable policy decisions, and no external effects.

## Next

If useful, the next gate should expand source type or observation duration carefully, still without enforcement or authorization.

Compatibility note for prior release gates: passive live shadow readiness achieved; local operator-run pilot only; no daemon/watcher by default.
Compatibility constraints retained for legacy gates: no enforcement; no tool execution; no authorization; no external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
