# Synaptic Mesh v0.20.5

This is the public review release `v0.20.5`. Current v0.20.5 status is narrower than live runtime but crosses the next smallest safe barrier after v0.19: a **bounded explicit multisource shadow-read** through the existing constrained local read adapter abstraction.

The v0.20.x ladder is still gated, disabled/manual/operator-run/local/passive/read-only. It performs an operator-run one-shot read from multiple explicit repo-local file sources through `repo-local-file-read-adapter-v0`, with max sources 3, max records per source 5, max total records 12, per-source isolation, per-source failure isolation, redaction-before-persist, redacted evidence only, and a human-readable report.

Boundaries: no enforcement, no authorization, no approval/block/allow, no globs/recursive discovery, no implicit sources, no outside-repo paths, no symlinks, no autonomous live mode, no watcher/daemon, no network/resource fetch, no SDK/framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no tool execution, no memory/config writes, no agent-consumed machine-readable policy decisions, no external effects, and not runtime authority.

Final evidence: bounded explicit multisource shadow-read; multiple explicit repo-local file sources; constrained local read adapter abstraction; operator-run one-shot; local-only; passive/read-only; max sources 3; max records per source 5; max total records 12; per-source isolation; per-source failure isolation; redaction-before-persist; redacted evidence only; human-readable report; policyDecision: null; agentConsumedOutput: false; rawPersisted: false; unexpectedPermits: 0; no enforcement; no authorization; no approval/block/allow; no globs/recursive discovery; no implicit sources; no autonomous live mode; no watcher/daemon; no tool execution; no memory/config writes; no network/resource fetch; no external effects.

## v0.20.5 phase close

Bounded explicit multisource shadow-read is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The v0.19 live-adapter shadow-read remains valid as the single-source adapter baseline. v0.20 intentionally adds only bounded explicit multisource operator-run reading with per-source isolation, not authorization, enforcement, or readiness theater.

The v0.18 live-read gate remains valid as the direct local source baseline. Limited passive live capture readiness from v0.17 remains valid. Tiny operator-run passive pilot constraints remain: operatorReviewRequired: true; explicit input only; rawPersisted: false; unexpectedPermits: 0; no enforcement; no tool execution; no authorization; no external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
