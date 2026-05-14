# Status v0.9.1 — Authority confusion naive baseline

Status: local simulation only. Failure evidence, not success evidence. Not runtime-ready.

## Summary

- `authorityConfusionNaiveBaseline: pass`
- `benchmarkCases: 12`
- `baselinePermits: 12`
- `baselineFalsePermits: 12`
- `baselineFalsePermitRate: 1`
- `capturedFailureModes: 12`
- `expectedSafePermits: 0`
- `naiveSuccessClaims: 0`
- `capabilityTrueCount: 0`

## Boundary

No runtime, no network, no SDK import, no resource fetch, no tool execution, no live traffic, no watcher/daemon, no memory/config writes, no external publication automation, no agent consumption, no machine-readable policy decision, no approval, no block/allow, no authorization, and no enforcement.

## Evidence

- `implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-naive-baseline-v0.9.1.out.json`

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-naive-baseline-v091
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.1
```
