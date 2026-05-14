
# First Real Framework Adapter Design Note v0.8.1

Status: design-only. No real framework adapter. No implementation, SDK imports, network, tools, resource fetch, runtime, memory/config writes, approval/block/allow/enforcement.

Candidate: `mcp_read_only_candidate`.

## Why MCP first

MCP is the most useful candidate to cage first because it strongly tempts tool execution, resource fetch, network paths, and server/client behavior. Choosing it for design review exposes the highest-risk boundary questions early while keeping implementation blocked.

## Allowed future shape

A future candidate, if separately authorized, may only accept an explicit local already-redacted framework-like artifact and produce record-only evidence. The adapter design must translate local packet shape into review evidence without live resource fetch, tool execution, framework runtime, or agent-consumed output.

## Forbidden paths

- No implementation.
- No SDK imports.
- No MCP server/client.
- No tool calls.
- No resource fetch.
- No network or live traffic.
- No runtime graph execution.
- No memory/config writes.
- No external publication.
- No agent-consumed output.
- No machine-readable policy.
- No approval/block/allow.
- No authorization.
- No enforcement.

## NO-GO criteria

Any import from a framework SDK, MCP server/client surface, network/resource/tool path, runtime graph execution, live traffic, memory/config write, public posting path, approval/block/allow emission, agent-consumed output, machine-readable policy, authorization, or enforcement must be treated as NO-GO for this phase.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:first-real-framework-adapter-design-v081
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.1
```

## What a pass means

A pass means the MCP read-only candidate is documented as a design-only candidate with explicit NO-GO criteria.

## What a pass does not mean

A pass does not authorize implementation, framework integration, SDK import, runtime, network, resource fetch, tool execution, agent consumption, approval, block/allow, authorization, or enforcement.
