# Release Notes — Synaptic Mesh v0.9.2

Status: authority confusion Synaptic Mesh comparison. Local record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Compares the v0.9.1 naive baseline against Synaptic Mesh context-is-not-permission boundary handling.
- Preserves baseline false permits: 12.
- Records Synaptic Mesh false permits: 0.
- Records prevented false permits: 12 and false permit reduction: 100%.
- Keeps the comparison record-only; no permit, authorization, block/allow, or enforcement path is added.

## Conservative release statement

`v0.9.2` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.2
```
