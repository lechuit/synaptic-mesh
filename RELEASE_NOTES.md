
# Release Notes — Synaptic Mesh v0.8.0-alpha

Status: framework integration go/no-go record. Design may proceed; implementation remains blocked. Committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Adds the v0.8.0-alpha go/no-go record for framework integration readiness.
- Records `goToDesign: true` and `goToImplementation: false`.
- Keeps `realFrameworkAdapterAuthorized: false`, `frameworkSdkImportAuthorized: false`, `networkAuthorized: false`, `toolExecutionAuthorized: false`, `agentConsumptionAuthorized: false`, `machineReadablePolicyAuthorized: false`, `mayBlock: false`, `mayAllow: false`, and `enforcementAuthorized: false`.
- Validates one positive design-only fixture and twelve negative implementation/authority fixtures.

## Conservative release statement

`v0.8.0-alpha` does not add MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.0-alpha
```
