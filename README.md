# Synaptic Mesh v0.14.1

This is the public review release `v0.14.1`. Current v0.14.1 status is narrower than live runtime: live-like shadow/sandbox replay over offline/frozen/already-redacted local observation envelopes.

The v0.14.x ladder moves toward live-like shadow/sandbox readiness while preserving a hard no-effects boundary. This layer adds a manual CLI/test replay harness only; it is not a daemon, not a file watcher, and not runtime authority.

Boundaries: no runtime integration, no raw private content, no live traffic, no real framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no network/resource fetch, no tool execution, no watcher/daemon, no memory/config writes, no agent-consumed output, no machine-readable policy decision, not runtime authority, and no approval/block/allow/authorization/enforcement.

Final evidence: replayHarness: pass; totalEnvelopes: 1; validEnvelopes: 1; unexpectedPermits: 0; manual CLI/test only.
