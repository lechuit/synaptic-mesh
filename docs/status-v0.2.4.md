# Synaptic Mesh v0.2.4 status snapshot

Status: passive canary drift scorecard public review release. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-drift-scorecard`
  - compares repeated evaluations of unchanged normalized passive canary source-boundary rows;
  - records `routeDriftCount`, `reasonCodeDriftCount`, `boundaryVerdictDriftCount`, `scorecardDriftCount`, `traceHashDriftCount`, and `normalizedOutputMismatchCount`;
  - keeps the scorecard evidence-only and not automatically consumed by agents.

## Expected v0.2.4 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.2.4",
  "dependsOn": "v0.2.3-canary-source-boundary-stress",
  "comparedRows": 6,
  "routeDriftCount": 0,
  "reasonCodeDriftCount": 0,
  "boundaryVerdictDriftCount": 0,
  "scorecardDriftCount": 0,
  "traceHashDriftCount": 0,
  "normalizedOutputMismatchCount": 0,
  "mayBlockCount": 0,
  "mayAllowCount": 0,
  "capabilityTrueCount": 0,
  "forbiddenEffects": 0,
  "scorecardAuthority": false,
  "consumedByAgent": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Boundary

The v0.2.4 scorecard is local deterministic evidence only. It does not authorize action and must not be used as runtime or agent-consumed authority.

Not included:

- live traffic/log/session reads;
- raw input persistence;
- runtime, daemon, watcher, adapter, or tool integration;
- memory/config writes;
- external publication or publication automation;
- agent-instruction writes;
- automatic agent consumption;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-drift-scorecard
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.4
```

For exact published-release verification after tagging:

```bash
git checkout v0.2.4
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.4
```
