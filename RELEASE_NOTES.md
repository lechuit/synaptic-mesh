# Release Notes — Synaptic Mesh v0.9.4

Status: authority confusion adversarial hardening. Local/redacted evidence only. Human review only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds 48 adversarial phrasing variants across all 12 authority-confusion categories.
- Shows baseline false permits: 48.
- Shows Synaptic Mesh false permits: 0.
- Shows prevented false permits: 48 and 100% false-permit reduction in local record-only evidence.
- Keeps all decisions as offline evaluation labels only; no permit, authorization, block/allow, or enforcement path is added.

## Conservative release statement

`v0.9.4` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.4
```
