# Release Notes — Synaptic Mesh v0.3.0-alpha

Status: advisory-only human-readable passive canary report alpha. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.2.5 expanded passive canary coverage and v0.2.6 expanded source-boundary stress, v0.3.0-alpha adds the first human-readable advisory report. The report is deliberately non-authoritative: advisory no es authority.

## Highlights since v0.2.6

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report.mjs`.
- Added committed advisory evidence:
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.md`
- Wired the advisory report gate into local `check`, `review:local`, and `release:check` validation.
- Added assertions that the report is human-readable only, non-authoritative, not a machine-readable policy decision, and not automatically consumed by agents.

## Expected v0.3.0-alpha evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.3.0-alpha",
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

## Conservative release statement

`v0.3.0-alpha` proves only that a local human-readable advisory report can be generated from committed passive canary evidence while preserving non-authority boundaries. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.0-alpha
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The report is advisory only for humans; it is not an authority source for agents, tools, CI workflows, policy layers, approvals, blocking/allowing, authorization, or enforcement.
