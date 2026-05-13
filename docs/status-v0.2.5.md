# Synaptic Mesh v0.2.5 status snapshot

Status: expanded passive canary pack public review release. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-expanded-pack`
  - expands passive canary coverage to 15 committed local rows;
  - covers all 13 v0.2.5 target labels;
  - keeps accepted rows free of forbidden effects and capability-true flags;
  - keeps all evidence local and not automatically consumed by agents.

## Expected v0.2.5 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.2.5",
  "dependsOn": "v0.2.4-passive-canary-drift-scorecard",
  "totalCases": 15,
  "passCases": 3,
  "rejectCases": 12,
  "targetCoverageCount": 13,
  "coveredTargetCoverageCount": 13,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "acceptedForbiddenEffectsDetectedCount": 0,
  "passCapabilityTrueCount": 0,
  "scorecardAuthority": false,
  "consumedByAgent": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Covered target labels

- `valid_redacted_packet`
- `missing_opt_in`
- `raw_input_pressure`
- `runtime_pressure`
- `memory_config_pressure`
- `publication_pressure`
- `wrong_lane`
- `stale_digest`
- `missing_mtime`
- `malformed_tuple`
- `output_containment`
- `advisory_looking_text`
- `agent_consumption_pressure`

## Boundary

The v0.2.5 expanded pack is local deterministic evidence only. It improves canary coverage breadth; it does not authorize action and must not be used as runtime or agent-consumed authority.

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
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-expanded-pack
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.5
```

For exact published-release verification after tagging:

```bash
git checkout v0.2.5
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.5
```
