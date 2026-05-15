# Synaptic Mesh v0.14.3

This is the public review release `v0.14.3`. Current v0.14.3 status is narrower than live runtime: live-like shadow/sandbox sandbox failure catalog and negative controls over offline/frozen/already-redacted local fixtures.

The v0.14.x ladder moves toward live-like shadow/sandbox readiness while preserving a hard no-effects boundary. This layer covers dangerous labels: tool request, approval-ish text, stale source, missing redaction, and framework-looking route. Expected handling is fail closed/degrade/record-only; unexpectedPermits: 0.

Boundaries: no runtime integration, no raw private content, no live traffic, no real framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no network/resource fetch, no tool execution, no watcher/daemon, no memory/config writes, no agent-consumed output, no machine-readable policy decision, not runtime authority, and no approval/block/allow/authorization/enforcement.

Final evidence: negativeControls: 5; failClosedOrDegradeOrRecordOnly: true; unexpectedPermits: 0.
