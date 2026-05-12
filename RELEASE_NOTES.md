# Release Notes — Synaptic Mesh v0.2.3

Status: passive canary source-boundary stress. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

Do not move “more live” yet. Before any advisory report or expanded canary pack, passive canary packets need stronger source-boundary pressure: malformed source tuples, stale digests, missing mtimes, wrong source lanes, and output containment escapes must fail closed as local evidence only.

## Highlights since v0.2.1

- Added the passive canary operator runbook: `docs/passive-live-shadow-canary-runbook.md`.
- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-source-boundary-stress.mjs`.
- Added committed fixture/evidence for source-boundary stress:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-source-boundary-stress.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-stress.out.json`
- Wired the stress gate into local `check`, `review:local`, and `release:check` validation.
- Updated the release ladder through `v0.3.0-alpha`, keeping the first advisory report human-readable only: advisory is not authority.

## New v0.2.3 evidence

Expected output shape:

```json
{
  "verdict": "pass",
  "passCases": 1,
  "rejectCases": 5,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "malformedSourceTupleRejects": 2,
  "staleDigestRejects": 1,
  "missingMtimeRejects": 1,
  "wrongLaneRejects": 1,
  "outputContainmentRejects": 1,
  "passCapabilityTrueCount": 0,
  "automaticAgentConsumptionImplemented": false
}
```

## Conservative release statement

`v0.2.3` proves only local fixture behavior for passive canary source-boundary stress. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

- Passive canary source-boundary stress: pass.
- Malformed source tuple rejects: 2.
- Stale digest rejects: 1.
- Missing mtime rejects: 1.
- Wrong source lane rejects: 1.
- Output containment rejects: 1.
- Passing capability-true count: 0.
- Automatic agent consumption implemented: false.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.3
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, automatic agent consumption, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
