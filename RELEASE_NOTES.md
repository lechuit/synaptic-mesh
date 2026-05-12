# Release Notes — Synaptic Mesh v0.2.4

Status: passive canary drift scorecard. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

Before expanding the passive canary pack or adding human-readable advisory reports, the canary needs a deterministic drift scorecard: unchanged normalized inputs should preserve route, reason-code set, boundary verdict, scorecard digest, trace hash, and normalized output.

## Highlights since v0.2.3

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-drift-scorecard.mjs`.
- Added committed fixture/evidence for passive canary drift scoring:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-drift-scorecard.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-drift-scorecard.out.json`
- Wired the drift scorecard gate into local `check`, `review:local`, and `release:check` validation.
- Kept v0.2.3 source-boundary stress evidence as the baseline dependency for v0.2.4.

## New v0.2.4 evidence

Expected output shape:

```json
{
  "verdict": "pass",
  "comparedRows": 6,
  "routeDriftCount": 0,
  "reasonCodeDriftCount": 0,
  "boundaryVerdictDriftCount": 0,
  "scorecardDriftCount": 0,
  "traceHashDriftCount": 0,
  "normalizedOutputMismatchCount": 0,
  "mayBlockCount": 0,
  "mayAllowCount": 0,
  "capabilityTrueCount": 0,
  "forbiddenEffects": 0,
  "scorecardAuthority": false,
  "consumedByAgent": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Conservative release statement

`v0.2.4` proves only local deterministic scorecard behavior over committed passive canary source-boundary fixtures. The drift scorecard is evidence, not authority. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

- Passive canary drift scorecard: pass.
- Compared rows: 6.
- Route drift: 0.
- Reason-code drift: 0.
- Boundary-verdict drift: 0.
- Scorecard drift: 0.
- Trace-hash drift: 0.
- Normalized-output mismatch: 0.
- Capability-true count: 0.
- Forbidden effects: 0.
- Automatic agent consumption implemented: false.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.4
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, automatic agent consumption, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
