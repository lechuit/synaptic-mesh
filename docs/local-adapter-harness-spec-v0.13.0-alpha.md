# First Local Adapter Harness Spec — v0.13.0-alpha

Status: local evidence package only. This layer is explanatory / benchmark / harness review material, not a runtime authority.

## Evidence summary

- harnessSpecReady: true
- localFakeReadOnlyOnly: true

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

Run: `npm run test:local-adapter-harness-spec` and `npm run release:check -- --target v0.13.0-alpha`.
