# Synaptic Mesh v0.19.5

This is the public review release `v0.19.5`. Current v0.19.5 status is narrower than live runtime but crosses the next smallest safe barrier after v0.18: a **live-adapter shadow-read** through a minimal constrained local read adapter abstraction.

The v0.19.x ladder is still gated, disabled/manual/operator-run/local/passive/read-only. It performs an operator-run one-shot read from one explicit repo-local real source through `repo-local-file-read-adapter-v0`, with bounded window/count, redaction-before-persist, redacted evidence only, and a human-readable report.

Boundaries: no enforcement, no authorization, no approval/block/allow, no autonomous live mode, no watcher/daemon, no network/resource fetch, no SDK/framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no tool execution, no memory/config writes, no agent-consumed machine-readable policy decisions, no external effects, and not runtime authority.

Final evidence: live-adapter shadow-read; minimal constrained local read adapter abstraction; operator-run one-shot; local-only; passive/read-only; bounded window/count; redaction-before-persist; redacted evidence only; human-readable report; policyDecision: null; agentConsumedOutput: false; rawPersisted: false; unexpectedPermits: 0; no enforcement; no authorization; no approval/block/allow; no autonomous live mode; no watcher/daemon; no tool execution; no memory/config writes; no network/resource fetch; no external effects.

## v0.19.5 phase close

Live-adapter shadow-read is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The v0.18 live-read gate remains valid as the direct local source baseline. v0.19 intentionally adds only a constrained local read adapter boundary over that source, not authorization, enforcement, or readiness theater.

Limited passive live capture readiness from v0.17 remains valid. Tiny operator-run passive pilot constraints remain: operatorReviewRequired: true; single explicit input; rawPersisted: false; unexpectedPermits: 0; no enforcement; no tool execution; no authorization; no external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
