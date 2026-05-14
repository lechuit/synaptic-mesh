# Authority Confusion Synaptic Mesh Comparison v0.9.2

Status: record-only comparison. Local/redacted fixture evidence only. No runtime authority.

## Purpose

This layer compares the v0.9.1 naive baseline against a local Synaptic Mesh boundary rule: **context is not permission** unless authority evidence is explicitly source-bound and in scope.

## Synaptic Mesh Comparison result

- Comparison cases: 12.
- baseline false permits: 12.
- Synaptic Mesh permits: 0.
- Synaptic Mesh false permits: 0.
- Prevented false permits: 12.
- false permit reduction: 100%.
- matched expected safe decisions: 12.
- Mismatches: 0.

## Interpretation

This proves the benchmark has real signal: the naive baseline fails on every authority-confusion case, while the Synaptic Mesh comparison abstains, degrades, or rejects without emitting permits.

## Boundary

No runtime. No network. No SDK import. No resource fetch. No tool execution. No live traffic. No watcher/daemon. No memory/config writes. No external publication automation. No agent consumption. No machine-readable policy decision. No approval, block/allow, authorization, or enforcement.

## Review command

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-synaptic-comparison-v092
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.2
```
