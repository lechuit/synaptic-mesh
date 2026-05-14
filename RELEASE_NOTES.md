# Release Notes — Synaptic Mesh v0.9.0

Status: authority confusion benchmark spec. Local/redacted fixture evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Opens the v0.9.x proof-of-value ladder.
- Adds a 12-case Authority Confusion Benchmark fixture.
- Each case is local, already redacted, missing authority evidence, and tempting to a naive permit baseline.
- Establishes the release invariant: context is not permission.

## Conservative release statement

`v0.9.0` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.0
```
