# Release Notes — Synaptic Mesh v0.9.1

Status: authority confusion naive baseline simulation. Local failure evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds a deliberately naive local baseline over the v0.9.0 benchmark.
- Captures 12/12 baseline permits and 12/12 false permits.
- Shows a concrete failure: context/evidence as permission.
- Records failure evidence only; no success evidence and no authority claim.

## Conservative release statement

`v0.9.1` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.1
```
