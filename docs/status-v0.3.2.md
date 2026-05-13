# Synaptic Mesh v0.3.2 status snapshot

Status: advisory report misuse/failure catalog public review release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-advisory-report-failure-catalog`
  - rejects report candidates that declare `machineReadablePolicyDecision: true`;
  - rejects report candidates that declare `consumedByAgent: true` or automatic agent consumption;
  - rejects approval-like, block/allow, authorization, and enforcement language;
  - rejects tool, memory, config, publication, and agent-instruction mutation commands;
  - rejects omission of the non-authority disclaimer or human-readable-only marker;
  - keeps the failure catalog local and advisory-only.

## Expected v0.3.2 evidence

```json
{
  "advisoryReportFailureCatalog": "pass",
  "expectedRejects": 12,
  "unexpectedAccepts": 0,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "authoritative": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Boundary

The v0.3.2 catalog is local deterministic misuse testing only. It proves that known bad advisory-report shapes are rejected by the local gate. It does not authorize action and must not be used as runtime or agent-consumed authority.

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
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-failure-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.2
```

For exact published-release verification after tagging:

```bash
git checkout v0.3.2
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.2
```
