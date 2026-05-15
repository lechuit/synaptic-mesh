# Synaptic Mesh v0.18.5

This is the public review release `v0.18.5`. Current v0.18.5 status is narrower than live runtime but crosses the first live barrier: a **live-read gate** for one-shot ingestion from one explicit repo-local real source.

The v0.18.x ladder is still gated, disabled/manual/operator-run/local/passive/read-only. It reads bounded records from one explicit local source, redacts before persistence, and writes only redacted local evidence plus a human-readable report.

Boundaries: no enforcement, no authorization, no approval/block/allow, no autonomous live mode, no watcher/daemon, no network/resource fetch, no SDK/framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no tool execution, no memory/config writes, no agent-consumed machine-readable policy decisions, no external effects, and not runtime authority.

Final evidence: live-read gate; first controlled crossing of the live input ingestion barrier; one-shot explicit repo-local source; bounded records; redacted evidence only; policyDecision: null; agentConsumedOutput: false; rawPersisted: false; unexpectedPermits: 0; no enforcement; no authorization; no approval/block/allow; no autonomous live mode; no watcher/daemon; no tool execution; no memory/config writes; no external effects.

## v0.18.5 phase close

Live-read gate is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

Limited passive live capture readiness from v0.17 remains valid, but v0.18 intentionally moves beyond readiness-only by reading bounded records from a real repo-local source. The output remains human-review evidence, not policy.

Tiny operator-run passive pilot constraints remain: operatorReviewRequired: true; single explicit input; rawPersisted: false; unexpectedPermits: 0; no enforcement; no tool execution; no authorization; no external effects.

Compatibility note for prior release gates: passive live shadow readiness achieved; local operator-run pilot only; no daemon/watcher by default.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
