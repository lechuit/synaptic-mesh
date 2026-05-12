# Release Notes — Synaptic Mesh v0.2.1

Status: passive canary reproducibility and failure hardening. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

Do not move “more live” yet. A passive canary must be auditable first: the same canary packet must produce the same normalized output, same reason set, same scorecard, and same boundary verdict across runs.

## Highlights since v0.2.0-alpha

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-reproducibility.mjs`.
- Added committed evidence at `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-reproducibility.out.json`.
- Wired the reproducibility gate into local `check` and `release:check` validation.
- Kept the v0.2.0-alpha canary boundary unchanged: manual, local, opt-in, already-redacted canary packets only, record-only local evidence, no effects.

## New v0.2.1 evidence

Expected output shape:

```json
{
  "passiveCanaryReproducibility": "pass",
  "runs": 2,
  "passCases": 2,
  "rejectCases": 8,
  "normalizedOutputMismatches": 0,
  "scorecardMismatches": 0,
  "capabilityTrueCount": 0,
  "forbiddenEffects": 0
}
```

Additional enforced fields:

- `reasonSetMismatches: 0`
- `boundaryVerdictMismatches: 0`

## Conservative release statement

`v0.2.1` proves only local fixture reproducibility for the passive canary contract. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

- Passive live-shadow canary reproducibility: pass.
- Runs: 2.
- Pass cases: 2.
- Reject cases: 8.
- Normalized output mismatches: 0.
- Reason-set mismatches: 0.
- Scorecard mismatches: 0.
- Boundary verdict mismatches: 0.
- Passing capability-true count: 0.
- Passing forbidden effects: 0.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.1
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
