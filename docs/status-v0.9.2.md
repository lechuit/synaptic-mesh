# Status v0.9.2 — Authority confusion Synaptic Mesh comparison

Status: record-only comparison. Local/redacted fixture evidence only. Not runtime-ready.

## Summary

- `authorityConfusionSynapticComparison: pass`
- `comparisonCases: 12`
- `baselineFalsePermits: 12`
- `synapticMeshPermits: 0`
- `synapticMeshFalsePermits: 0`
- `preventedFalsePermits: 12`
- `falsePermitReductionPercent: 100`
- `matchedExpectedSafeDecisions: 12`
- `mismatches: 0`
- `capabilityTrueCount: 0`

## Boundary

No runtime, no network, no SDK import, no resource fetch, no tool execution, no live traffic, no watcher/daemon, no memory/config writes, no external publication automation, no agent consumption, no machine-readable policy decision, no approval, no block/allow, no authorization, and no enforcement.

## Evidence

- `implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-synaptic-comparison-v0.9.2.out.json`

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-synaptic-comparison-v092
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.2
```
