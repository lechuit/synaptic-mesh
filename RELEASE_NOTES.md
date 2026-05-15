# Release Notes — Synaptic Mesh v0.20.5

## Summary

`v0.20.5` introduces the **bounded explicit multisource shadow-read** gate: multiple explicit repo-local file sources in one operator-run, one-shot, local-only, passive/read-only run through the existing constrained local read adapter abstraction. It is bounded by max sources 3, max records per source 5, and max total records 12, with per-source isolation, per-source failure isolation, redaction-before-persist, redacted evidence only, and a human-readable report.

## Evidence

- `policyDecision: null`
- `agentConsumedOutput: false`
- `rawPersisted: false`
- `unexpectedPermits: 0`
- bounded explicit multisource shadow-read through `repo-local-file-read-adapter-v0`
- multiple explicit repo-local file sources
- max sources 3
- max records per source 5
- max total records 12
- per-source isolation
- per-source failure isolation
- redaction-before-persist and redacted evidence only
- human-readable report
- two independent local review notes included; not GitHub UI reviews and not deployment approvals

## Boundary

No enforcement, no authorization, no approval/block/allow, no globs/recursive discovery, no implicit sources, no outside-repo paths, no symlinks, no autonomous live mode, no watcher/daemon, no tool execution, no memory/config writes, no network/resource fetch, no agent-consumed machine-readable policy decisions, and no external effects.

## Next

The next gate should review multisource shadow-read failure modes without adding authority, enforcement, daemon behavior, network/resource fetch, external effects, or agent-consumed policy decisions.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
