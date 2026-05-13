# Release Notes — Synaptic Mesh v0.4.8

Status: adapter implementation hazard catalog. Pre-implementation only, manual, local, explicit/redacted input only, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.4.7 designed the first possible real adapter shape, v0.4.8 catalogs the expected failures that must be rejected before implementation.

This release still does not implement the adapter.

## Highlights since the previous release

- Added `docs/adapter-implementation-hazard-catalog-v0.4.8.md`.
- Added `docs/status-v0.4.8.md`.
- Added `implementation/synaptic-mesh-shadow-v0/tests/adapter-implementation-hazard-catalog.mjs`.
- Added fixture/evidence for the v0.4.8 hazard catalog.
- Wired the new gate into local `check` and `release:check` validation.

## Expected v0.4.8 evidence

```json
{
  "adapterImplementationHazardCatalog": "pass",
  "releaseLayer": "v0.4.8",
  "basedOnDesignNote": "v0.4.7",
  "implementationAuthorized": false,
  "goToV050AlphaCanaryIfStillGreen": true,
  "hazardCases": 17,
  "rejectedOrDowngraded": 17,
  "unexpectedAccepts": 0
}
```

## Conservative release statement

`v0.4.8` proves only that the pre-implementation hazard catalog checks pass against committed docs/evidence. It does not add v0.5.0-alpha implementation, a real adapter, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob, directory traversal, symlink escape, URL input, network call, live traffic reads, raw input persistence, runtime integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.4.8
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not implemented.
- Not production/enforcement/L2+ ready.
- The hazard catalog remains review evidence, not an action source. Advisory no es authority.
- Next possible step, if still green: `v0.5.0-alpha — first real read-only local-file adapter canary`.
