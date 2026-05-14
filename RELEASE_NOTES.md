
# Release Notes — Synaptic Mesh v0.8.3

Status: framework adapter dry-run contract. No real framework adapter. No implementation authorization. Committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds the v0.8.3 dry-run contract.
- Permits only framework-like local/redacted packet to local validation to record-only evidence.
- Adds 16 negative controls for SDK, MCP server/client, network, resource, tool, runtime, live traffic, watcher/daemon, memory/config, publication, agent consumption, machine policy, approval, block/allow, authorization, and enforcement drift.
- Keeps integration authorization false and all operational capability outputs false.

## Conservative release statement

`v0.8.3` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.3
```
