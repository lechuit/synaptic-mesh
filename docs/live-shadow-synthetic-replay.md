# Synthetic live-shadow replay v0

Status: unreleased v0.1.8-track offline replay only. Not a live observer, not runtime integration, not enforcement, and not production/canary-ready. This is not a v0.1.8 release cut yet.

This gate checks that existing offline `DecisionTrace` evidence can be transformed into future live-shadow-shaped artifacts while preserving the passive boundary:

```text
DecisionTrace evidence
  ↓
LiveShadowObservation synthetic record
  ↓
LiveShadowObservationResult synthetic record
  ↓
record_only / no_effects / local_shadow_only
```

## What this adds

- A replay plan fixture: `implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-synthetic-replay.json`
- A local test: `implementation/synaptic-mesh-shadow-v0/tests/live-shadow-synthetic-replay.mjs`
- Evidence: `implementation/synaptic-mesh-shadow-v0/evidence/live-shadow-synthetic-replay.out.json`
- Script: `npm run test:live-shadow-synthetic-replay`

The replay consumes tracked offline `DecisionTrace` evidence and validates generated observation/result records against the #54 schemas.

## Boundary

This does **not**:

- observe live traffic
- read live logs or sessions
- create a watcher, daemon, CLI, MCP endpoint, GitHub hook, or adapter
- import runtime/adapters/tools modules
- execute tools
- write memory
- write config
- publish externally
- block, allow, approve, grant, or enforce anything
- modify agent instructions or approval paths

All result records remain `observerAction: "record_only"`; all operational `may*` fields remain `false`; `forbiddenEffectsDetected` remains empty.

## Why this exists

#54 built the schema cage. This PR tests that a synthetic replay can live inside that cage without turning observation output into authority. The useful claim is narrow: offline DecisionTrace-shaped evidence can be represented as passive live-shadow-shaped audit records.

It is not evidence that a real observer works, that live traffic is safe to inspect, or that runtime integration is ready.


## Release boundary

This work is part of the unreleased `v0.1.8-track` live-shadow contract-hardening line. The repository still reports `v0.1.7` in release metadata until the dedicated v0.1.8 metadata-release PR is cut. During this track, `npm run release:check -- --target v0.1.7` is used as a compatibility/baseline gate against the latest published release target, not as evidence that new v0.1.8-track work has been released under v0.1.7.

## Merge criteria

Merge only if:

- `npm run check` passes
- `npm run review:local` passes
- `npm run release:check -- --target v0.1.7` passes as a baseline check against the latest published release target; this does not claim that #55 belongs to the already-published v0.1.7 release
- no `src/live-shadow-*.mjs` files are added
- no runtime/adapters/tools imports are added
- documentation keeps the claim to synthetic offline replay only
