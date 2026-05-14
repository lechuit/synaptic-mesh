
# Release Notes — Synaptic Mesh v0.8.4

Status: framework adapter reviewer runbook. No real framework adapter. No implementation authorization. Committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds the v0.8.4 human reviewer runbook.
- Centers the phrase: “Framework dry-run evidence is not framework authorization.”
- Defines reviewer preflight, local validation, evidence-reading steps, NO-GO triggers, and human decision checkpoint.
- Keeps integration authorization false and all operational capability outputs false.

## Conservative release statement

`v0.8.4` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.4
```
