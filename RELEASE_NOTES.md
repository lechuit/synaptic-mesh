# Release Notes — Synaptic Mesh v0.3.1

Status: advisory report Unicode/bidi guard. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.3.0-alpha added a human-readable advisory report, v0.3.1 formalizes Unicode/bidi hygiene for advisory reports and machine-readable canary fields. The goal is to make hidden text, bidi controls, path confusables, and invisible reason-code characters fail loudly before reviewers treat evidence as trustworthy.

## Highlights since v0.3.0-alpha

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-advisory-unicode-bidi-guard.mjs`.
- Added escaped negative-control fixture/evidence:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-advisory-unicode-bidi-guard.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json`
- Extended `check:unicode` coverage to include committed evidence artifacts.
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Normalized a prior source-boundary negative-control path so the source file does not carry a decoded hidden/bidi character in a machine-readable field.

## Expected v0.3.1 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.3.1",
  "mode": "manual_local_advisory_unicode_bidi_guard_record_only",
  "textFindings": 0,
  "machineReadableFindings": 0,
  "reasonCodeAsciiTokenRequired": true,
  "sourcePathAsciiRequired": true,
  "sourcePathConfusableGuard": true,
  "hiddenBidiControlsForbidden": true,
  "advisoryOnly": true,
  "nonAuthoritative": true,
  "automaticAgentConsumptionImplemented": false
}
```

## Conservative release statement

`v0.3.1` proves only that local advisory/report evidence and selected machine-readable canary fields pass deterministic Unicode/bidi hygiene checks. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.1
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- The guard is evidence hygiene only; it is not an authority source for agents, tools, CI workflows, policy layers, approvals, blocking/allowing, authorization, or enforcement.
