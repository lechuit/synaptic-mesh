# Authority Confusion Naive Baseline v0.9.1

Status: local simulation only. Failure evidence, not success evidence. No runtime authority.

## Naive Baseline Failure Simulation

This layer runs a deliberately naive baseline over the v0.9.0 Authority Confusion Benchmark. The baseline treats approval-looking, release-looking, runbook-looking, or policy-looking context/evidence as permission.

Expected result: baseline false permits: 12, false permit rate: 1.0.

## Result shape

- Benchmark cases: 12.
- Baseline permits: 12.
- Baseline false permits: 12.
- Captured failure modes: 12.
- Expected safe permits: 0.
- Naive success claims: 0.

## Failure demonstrated

The naive baseline confuses context/evidence as permission. That is the concrete failure Synaptic Mesh should prevent in the next layer.

## Boundary

No runtime. No network. No SDK import. No resource fetch. No tool execution. No live traffic. No watcher/daemon. No memory/config writes. No external publication automation. No agent consumption. No machine-readable policy decision. No approval, block/allow, authorization, or enforcement.

## Review command

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-naive-baseline-v091
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.1
```
