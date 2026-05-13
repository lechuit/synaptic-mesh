# Release Notes — Synaptic Mesh v0.3.3

Status: advisory report reproducibility/drift gate. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.3.2 added a misuse/failure catalog for the human-readable advisory report, v0.3.3 adds a reproducibility/drift gate. The goal is to make report evidence reviewable and stable before any runtime, memory, or adapter work is considered.

## Highlights since v0.3.2

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report-reproducibility.mjs`.
- Added reproducibility fixture/evidence:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-report-reproducibility.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report-reproducibility.out.json`
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Extended release checks to pin two deterministic report runs, zero normalized mismatches, six drift negative controls, and no machine-policy / agent-consumption / authority flags.

## Expected v0.3.3 evidence

```json
{
  "advisoryReportReproducibility": "pass",
  "releaseLayer": "v0.3.3",
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

## Conservative release statement

`v0.3.3` proves only that local advisory report reproducibility/drift controls pass against committed evidence. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.3
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The advisory report remains review evidence, not an action source. Advisory no es authority.
