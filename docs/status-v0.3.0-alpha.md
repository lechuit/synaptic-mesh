# Synaptic Mesh v0.3.0-alpha status snapshot

Status: advisory-only human-readable passive canary report alpha. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-report`
  - produces a committed human-readable local report;
  - summarizes v0.2.5 expanded passive canary evidence and v0.2.6 source-boundary expansion evidence;
  - explicitly states: `ADVISORY ONLY` and `Advisory no es authority`;
  - asserts the report is not a machine-readable policy decision and is not automatically consumed by agents.

## Expected v0.3.0-alpha evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.3.0-alpha",
  "dependsOn": "v0.2.6-source-boundary-stress-expansion",
  "mode": "human_readable_advisory_only_non_authoritative_record_only",
  "sourceEvidenceCount": 4,
  "advisoryOnly": true,
  "humanReadableOnly": true,
  "nonAuthoritative": true,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Boundary

The v0.3.0-alpha report is local deterministic evidence for human review only. It does not authorize action and must not be used as runtime or agent-consumed authority.

Not included:

- live traffic/log/session reads;
- raw input persistence;
- runtime, daemon, watcher, adapter, or tool integration;
- memory/config writes;
- external publication or publication automation;
- agent-instruction writes;
- automatic agent consumption;
- machine-readable policy decisions;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.0-alpha
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.0-alpha
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.0-alpha
```
