# Release Notes — Synaptic Mesh v0.7.1

Status: framework adapter hazard catalog public review release. Framework-shaped local fixture hazards only, rejected before simulated pipeline, record-only evidence. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Added a 25-case framework adapter hazard catalog.
- Verified every hazard rejects or downgrades.
- Pinned `pipelineRunsForRejectedCases: 0`.
- Pinned `sourceReadsForRejectedCases: 0` and `successOutputsForRejectedCases: 0`.
- Kept all operational capability outputs false.

## Conservative release statement

`v0.7.1` does not add MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.1
```
