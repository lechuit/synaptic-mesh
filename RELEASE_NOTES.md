
# Release Notes — Synaptic Mesh v0.8.1

Status: first real framework adapter design note. MCP read-only candidate selected for design only. No implementation. Committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds the v0.8.1 design note for the first real framework adapter candidate.
- Selects `mcp_read_only_candidate` as the design-only candidate because MCP carries high temptation toward tools/resources/network/server-client behavior.
- Adds a candidate comparison across MCP-like, LangGraph-like, A2A-like, and GitHub-bot-like shapes.
- Keeps implementation authorization false and all operational capability outputs false.

## Conservative release statement

`v0.8.1` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.1
```
