# Live-like Shadow/Sandbox Observation Envelope v0.14.0-alpha

This layer defines a local observation envelope schema for live-like shadow/sandbox inputs.

Required boundary:

- offline/frozen/already-redacted only
- manual-or-frozen only
- no raw private content
- no live traffic
- no network
- no watcher/daemon
- no SDK import
- no framework adapter
- no tools
- not runtime authority
- no machine-readable policy decision
- no approval/block/allow/authorization/enforcement

The envelope is a review artifact for local tests and manual fixtures only. It is not a real framework adapter, not an MCP server/client, not a LangGraph SDK path, not an A2A runtime, and not a GitHub bot/webhook.

Evidence target: `release:check -- --target v0.14.0-alpha`.
