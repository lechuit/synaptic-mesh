# Release Notes — Synaptic Mesh v0.7.2

Status: simulated framework-shaped adapter public review release. Fake/local/already-redacted fixtures only, record-only evidence. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Added a simulated framework-shaped adapter module.
- Added positive `mcp_like` and `langgraph_like` local fixture cases.
- Produced parserEvidence, classifierDecision, DecisionTrace, and human-readable advisory report records for both cases.
- Kept all operational capability outputs false.

## Conservative release statement

`v0.7.2` does not add MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.2
```
