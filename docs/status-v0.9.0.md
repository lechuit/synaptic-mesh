# Status v0.9.0 — Authority confusion benchmark spec

Status: benchmark spec only. Local/redacted fixture evidence only. Not runtime-ready.

## Summary

- `authorityConfusionBenchmarkSpec: pass`
- `benchmarkCases: 12`
- `categories: 12`
- `localRedactedCases: 12`
- `temptingPhraseCases: 12`
- `missingAuthorityCases: 12`
- `naivePermitExpected: 12`
- `safePermitExpected: 0`
- `capabilityTrueCount: 0`

## Boundary

No runtime, no network, no SDK import, no resource fetch, no tool execution, no live traffic, no watcher/daemon, no memory/config writes, no external publication automation, no agent consumption, no machine-readable policy decision, no approval, no block/allow, no authorization, and no enforcement.

## Evidence

- `implementation/synaptic-mesh-shadow-v0/evidence/authority-confusion-benchmark-spec-v0.9.0.out.json`

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:authority-confusion-benchmark-spec-v090
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.0
```
