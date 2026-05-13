# Release Notes — Synaptic Mesh v0.2.6

Status: source-boundary stress expansion. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.2.5 broadened the passive canary pack, v0.2.6 expands source/output boundary stress before any human-readable advisory report work. The goal is to harden receiver distrust of source metadata and path-shaped inputs while staying entirely local and record-only.

## Highlights since v0.2.5

- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary-source-boundary-expansion.mjs`.
- Added committed fixture/evidence for the v0.2.6 expansion:
  - `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary-source-boundary-expansion.json`
  - `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-expansion.out.json`
- Wired the new gate into local `check`, `review:local`, and `release:check` validation.
- Kept v0.2.3 and v0.2.4 evidence as baseline layers while v0.2.6 adds a distinct rare-case expansion.

## Coverage

The source-boundary expansion covers:

- digest mismatch distinct from stale digest;
- suspicious future `sourceMtime`;
- invalid `sourceMtime` format;
- source path traversal;
- source path symlink pressure;
- source path Unicode/bidi/confusable pressure;
- source lane alias confusion;
- duplicate `sourceArtifactId`;
- correct source digest with wrong source lane;
- indirect symlink pressure in output path;
- syntactically valid output path whose parent is not allowed.

## Expected v0.2.6 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.2.6",
  "targetCoverageCount": 11,
  "coveredTargetCoverageCount": 11,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "passCapabilityTrueCount": 0,
  "readsLiveTraffic": false,
  "followsSourceSymlinkForAuthority": false,
  "followsOutputSymlinkForAuthority": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Conservative release statement

`v0.2.6` proves only local deterministic source-boundary expansion coverage over committed already-redacted passive canary metadata. It does not add live traffic reads, raw input persistence, runtime integration, live observer daemon, watcher, adapter integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, deletion, retention scheduler, symlink-following authority, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.6
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, automatic agent consumption, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
