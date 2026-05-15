# Dry-run Harness Contract — v0.12.3

Status: local evidence package only. This layer is explanatory / benchmark / harness review material, not a runtime authority.

## Evidence summary

- contractReady: true
- dryRunOnly: true
- realIntegration: false

## Boundary

- No runtime
- No network
- No SDK import
- No real framework adapter
- No MCP server/client
- No LangGraph SDK
- No A2A runtime
- No GitHub bot/webhook
- No tool execution
- No memory/config writes
- No agent-consumed output
- No machine-readable policy decision
- No approval, block/allow, authorization, or enforcement

Run: `npm run test:integration-dry-run-harness-contract` and `npm run release:check -- --target v0.12.3`.
