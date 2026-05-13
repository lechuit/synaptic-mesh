# Release Notes — Synaptic Mesh v0.2.5

Status: expanded passive canary pack. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.2.4 added a deterministic drift scorecard, the next risk is coverage breadth. v0.2.5 expands the passive canary pack to a small reviewable set of 15 already-redacted local packet rows while preserving the same no-effects boundary.

## Highlights since v0.2.4

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-expanded-pack.mjs`.
- Added committed fixture/evidence for the expanded passive canary pack:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-expanded-pack.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-expanded-pack.out.json`
- Wired the expanded pack gate into local `check`, `review:local`, and `release:check` validation.
- Kept the pack to 15 rows for reviewability while covering all target labels.

## Coverage

The expanded pack covers:

- valid redacted packet;
- missing opt-in;
- raw input pressure;
- runtime pressure;
- memory/config pressure;
- publication pressure;
- wrong lane;
- stale digest;
- missing mtime;
- malformed tuple;
- output containment;
- advisory-looking text;
- agent-consumption pressure.

## Expected v0.2.5 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.2.5",
  "totalCases": 15,
  "passCases": 3,
  "rejectCases": 12,
  "coveredTargetCoverageCount": 13,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "acceptedForbiddenEffectsDetectedCount": 0,
  "passCapabilityTrueCount": 0,
  "scorecardAuthority": false,
  "consumedByAgent": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Conservative release statement

`v0.2.5` proves only local deterministic expanded-pack coverage over committed passive canary fixtures. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.5
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, automatic agent consumption, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
