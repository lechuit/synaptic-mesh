# Framework-shaped adapter boundary v0.7.0-alpha

`v0.7.0-alpha` defines a framework-shaped adapter input contract without implementing any real framework adapter.

The contract answers one narrow question: how would a framework-like input look after reducing it to a local, fake, already-redacted, no-effects artifact?

It does **not** answer how to integrate MCP, LangGraph, A2A, GitHub bots, webhooks, live traffic, SDKs, tools, memory, config, publication, approval, blocking, allowing, authorization, or enforcement.

## Allowed shape

A valid boundary record is:

- `schemaVersion: framework-shaped-adapter-boundary-v0`
- `adapterShape: framework_shaped_local_fixture`
- `frameworkKind`: one of `mcp_like`, `langgraph_like`, `a2a_like`, `github_bot_like`
- `inputMode: local_redacted_fixture_only`
- `outputMode: record_only_evidence`

Every operational capability flag is pinned to `false`.

## Prohibited behavior

This release does not add:

- MCP server/client
- LangGraph SDK
- A2A runtime
- GitHub bot
- webhook
- network call
- resource fetch
- live traffic
- watcher or daemon
- tool call
- memory/config writes
- publication automation
- approval path
- block/allow decisions
- authorization or enforcement

## Gate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-shaped-adapter-boundary-schema
```

The gate validates two positive local fixture shapes and ten negative controls for operational capability flags.
