
# Status v0.8.1 — First real framework adapter design note

Status: first real framework adapter design note; MCP read-only candidate; design-only.

## Summary

`v0.8.1` selects `mcp_read_only_candidate` as the first candidate to design. This is deliberately a design note only.

- `designOnly: true`
- `implementationAuthorized: false`
- `selectedCandidate: mcp_read_only_candidate`
- `sdkImported: false`
- `networkAllowed: false`
- `toolExecution: false`
- `resourceFetch: false`

## Boundary

No adapter code. No SDK imports. No MCP server/client. No network/resource/tool. No runtime graph execution. No memory/config writes. No external publication. No agent consumption. No machine-readable policy. No approval/block/allow, authorization, or enforcement.

## Evidence

- `implementation/synaptic-mesh-shadow-v0/evidence/first-real-framework-adapter-design-v0.8.1.out.json`

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:first-real-framework-adapter-design-v081
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.1
```
