
# Framework Integration Go/No-Go Record v0.8.0-alpha

Status: design allowed, implementation blocked.

This record exists because the `v0.7.x` framework-shaped adapter evidence is only boundary evidence. Framework-shaped adapter evidence does not authorize framework integration.

## Decision

- `goToDesign: true`
- `goToImplementation: false`
- `selectedFrameworkCandidate: none_selected_yet`

The correct transition is:

```text
framework-shaped adapter passed
-> may design a real adapter candidate
-> implementation remains blocked
```

## Permitted scope

- schema
- fixtures
- local validation test
- committed record-only evidence
- human-readable docs
- release metadata

## Prohibited scope

- No real adapter.
- No MCP server/client.
- No LangGraph SDK.
- No A2A runtime.
- No GitHub bot or webhook.
- No SDK import.
- No network, resource fetch, or tool execution.
- No framework runtime.
- No memory/config writes.
- No external publication automation.
- No agent-consumed output.
- No machine-readable policy.
- No approval, block/allow, authorization, or enforcement.

## Local validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-integration-go-no-go
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.0-alpha
```

## What a pass means

A pass means the repository has an explicit, reviewable decision that design may continue while implementation remains blocked.

## What a pass does not mean

A pass does not authorize framework integration, runtime integration, SDK import, network access, tool/resource use, agent consumption, policy output, approval paths, block/allow behavior, authorization, or enforcement.
