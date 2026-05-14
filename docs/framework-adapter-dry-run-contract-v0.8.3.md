
# Framework Adapter Dry-Run Contract v0.8.3

Status: dry-run contract only. No real framework adapter and no framework authorization.

## Contract

The only permitted flow is:

1. framework-like local/redacted packet
2. local validation
3. record-only evidence

This contract is deliberately not an MCP server/client, not a framework SDK integration, and not a runtime.

## Required boundary

- Explicit local file only.
- Already-redacted packet only.
- Human-review evidence only.
- Record-only output.
- No real framework adapter.
- No SDK import.
- No MCP server/client.
- No network.
- No resource fetch.
- No tool execution.
- No live traffic.
- No watcher/daemon.
- No runtime.
- No memory/config writes.
- No external publication.
- No agent consumption.
- No machine-readable policy.
- No approval, block/allow, authorization, or enforcement.

## Negative controls

Any contract variant that enables SDK import, MCP server/client behavior, network, resource fetch, tool execution, runtime, live traffic, watcher/daemon, memory/config writes, external publication, agent consumption, machine-readable policy, approval, block/allow, authorization, or enforcement must fail validation.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-adapter-dry-run-contract-v083
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.3
```
