# Release Notes — Synaptic Mesh v0.9.5

Status: authority confusion phase close. Local/redacted evidence only. Human review only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Closes the v0.9.x Authority Confusion Benchmark phase.
- Aggregates five evidence artifacts from v0.9.0 through v0.9.4.
- Shows total evaluated cases: 60.
- Shows baseline false permits: 60.
- Shows Synaptic Mesh false permits: 0.
- Shows prevented false permits: 60 and 100% false-permit reduction in local record-only evidence.
- Records proof-of-value achieved while framework integration remains unauthorized.

## Conservative release statement

`v0.9.5` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.5
```
