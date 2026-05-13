# Synaptic Mesh v0.3.3 status snapshot

Status: advisory report reproducibility/drift public review release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-report-reproducibility`
  - runs the committed human-readable advisory report evidence twice through a deterministic normalizer;
  - verifies zero normalized-output mismatches;
  - binds the committed markdown bytes and report text hash to the JSON evidence;
  - rejects report text drift, byte-count drift, summary drift, authority-boundary drift, source-evidence order drift, machine-policy drift, and report-path drift;
  - keeps the report as local human-readable evidence only.

## Expected v0.3.3 evidence

```json
{
  "advisoryReportReproducibility": "pass",
  "runs": 2,
  "normalizedOutputMismatches": 0,
  "expectedRejects": 6,
  "unexpectedAccepts": 0,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Boundary

The v0.3.3 reproducibility gate is local deterministic evidence checking only. It does not authorize action and must not be used as runtime or agent-consumed authority.

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
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.3
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.3
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.3
```
