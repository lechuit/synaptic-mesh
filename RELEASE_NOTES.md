# Release Notes — Synaptic Mesh v0.3.2

Status: advisory report misuse/failure catalog. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.3.0-alpha added the human-readable advisory report and v0.3.1 added Unicode/bidi hygiene, v0.3.2 tests the next risk: someone treating advisory evidence as authority. This release adds a failure catalog that rejects report candidates when they attempt to become machine-readable policy, agent-consumed instructions, approvals, block/allow signals, authorization, enforcement, tool commands, memory/config writes, publication automation, or agent-instruction mutations.

## Highlights since v0.3.1

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-report-failure-catalog.mjs`.
- Added failure-catalog fixture/evidence:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-report-failure-catalog.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report-failure-catalog.out.json`
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Extended release checks to pin zero unexpected accepts and no machine-policy / agent-consumption / authority flags.

## Expected v0.3.2 evidence

```json
{
  "advisoryReportFailureCatalog": "pass",
  "releaseLayer": "v0.3.2",
  "expectedRejects": 12,
  "unexpectedAccepts": 0,
  "machineReadablePolicyDecision": false,
  "consumedByAgent": false,
  "authoritative": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Conservative release statement

`v0.3.2` proves only that local advisory report misuse negative controls are rejected by deterministic local gates. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.2
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The advisory report remains review evidence, not an action source. Advisory no es authority.
