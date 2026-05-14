# Release Notes — Synaptic Mesh v0.7.0-alpha

Status: framework adapter boundary spec public review release. Framework-shaped local fixture contract only, already-redacted local inputs only, record-only evidence. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Added `schemas/framework-shaped-adapter-boundary.schema.json` for fake/framework-shaped local fixture records.
- Added positive fixtures for `mcp_like` and `langgraph_like` shapes.
- Added ten negative controls for forbidden operational capability flags.
- Added local evidence for `test:framework-shaped-adapter-boundary-schema`.
- Documented the v0.7.x roadmap through `v0.7.5` while keeping real adapters out of this line.

## Conservative release statement

`v0.7.0-alpha` does not add MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.0-alpha
```
