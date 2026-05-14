# Authority Confusion Adversarial Hardening v0.9.4

Status: adversarial hardening only. Local/redacted evidence only. Human review only. No runtime authority.

## Adversarial Hardening

This layer expands the v0.9 benchmark with phrasing variants that make authority confusion more tempting without adding any real authority evidence.

- adversarial variants: 48.
- base cases covered: 12.
- variant kinds: 4.
- baseline false permits: 48.
- Synaptic Mesh false permits: 0.
- prevented false permits: 48.
- false permit reduction: 100%.

Variant kinds: quoted approval context, compressed summary drift, delegated chain claim, and runbook/CI laundering.

## Label boundary

The variant fields and decisions are offline evaluation labels only. They are not runtime policy decisions, not agent-consumed instructions, and not authorization.

## Boundary

No runtime. No network. No SDK import. No resource fetch. No tool execution. No live traffic. No watcher/daemon. No memory/config writes. No external publication automation. No agent consumption. No machine-readable policy decision. No approval, block/allow, authorization, or enforcement.

## Review command

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-adversarial-hardening-v094
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.4
```
