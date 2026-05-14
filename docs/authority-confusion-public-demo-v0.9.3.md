# Authority Confusion Public Demo Package v0.9.3

Status: public review package. Local/redacted evidence only. human review only. No runtime authority.

## Public Demo Package

This package turns the v0.9.x Authority Confusion Benchmark into a simple before/after demonstration:

- before: 12 false permits from a deliberately naive baseline.
- after: 0 false permits from the Synaptic Mesh record-only comparison.
- 12/12 prevented false permits.
- False permit reduction: 100%.

## What the demo proves

Agents can confuse context, summaries, release notes, runbooks, CI evidence, or framework-shaped language with permission. Synaptic Mesh can represent the safer boundary in local evidence: context is not permission, and missing authority must abstain, degrade, or reject instead of permit.

## What the demo does not prove

It does not prove runtime safety, production readiness, framework integration readiness, or enforcement readiness. It does not authorize any MCP, LangGraph, A2A, GitHub bot, webhook, SDK, tool, policy, memory, config, or publication behavior.

## Boundary

The demo fields such as `beforeNaive`, `afterSynapticMesh`, and `publicClaim` are offline public-review labels. They are not runtime policy decisions, not agent-consumed instructions, and not authorization.

No runtime. No network. No SDK import. No resource fetch. No tool execution. No live traffic. No watcher/daemon. No memory/config writes. No external publication automation. No agent consumption. No machine-readable policy decision. No approval, block/allow, authorization, or enforcement.

## Review command

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-public-demo-v093
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.3
```
