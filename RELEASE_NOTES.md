
# Release Notes — Synaptic Mesh v0.8.5

Status: framework integration readiness public review package. No real framework adapter. No implementation authorization. Committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Closes the v0.8.x design/dry-run/public-review ladder.
- Verifies five prior v0.8 evidence artifacts pass.
- Preserves `goToDesign: true` and `goToImplementation: false`.
- Preserves `realFrameworkAdapterImplemented: false` and `frameworkIntegrationAuthorized: false`.
- Packages the go/no-go record, MCP read-only candidate design, 25-hazard catalog, dry-run contract, reviewer runbook, and final public review statement.

## Conservative release statement

`v0.8.5` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.5
```
