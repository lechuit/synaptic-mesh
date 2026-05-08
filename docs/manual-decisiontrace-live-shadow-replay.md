# Manual DecisionTrace → LiveShadowObservation replay v0

Status: v0.1.9 offline offline replay gate. Not live observation, not runtime integration, not monitoring, not authorization, not enforcement, and not production/canary-ready.

This gate replays manual bundle `parserEvidence` evidence into offline `DecisionTrace` records and then into `LiveShadowObservation` / `LiveShadowObservationResult` record shapes.

```text
ManualObservationBundle
  → parserEvidence replay evidence
  → DecisionTrace
  → LiveShadowObservation + LiveShadowObservationResult
```

## Boundary

This gate does **not**:

- consume raw prompts/transcripts/private content
- capture live traffic
- read logs or sessions
- implement a live observer, watcher, daemon, CLI, MCP endpoint, GitHub hook, adapter, or runtime path
- execute tools, write memory/config, publish externally, approve, block, allow, authorize, or enforce

`LiveShadowObservationResult` records are `record_only`; all capability booleans must remain `false`.

## Current evidence

The gate expects:

- `manualBundles: 2`
- `traceCount: 2`
- `observationCount: 2`
- `resultCount: 2`
- `validationErrorCount: 0`
- `mismatchCount: 0`
- `falsePermitCount: 0`
- `falseCompactCount: 0`
- `boundaryLossCount: 0`
- `forbiddenEffectsDetectedCount: 0`
- `mayBlockCount: 0`
- `mayAllowCount: 0`
- `capabilityTrueCount: 0`
- `redactedMetadataOnly: true`
- `rawContentPersisted: false`

## Release boundary

This is included in the `v0.1.9` public review package. `release:check -- --target v0.1.9` verifies this gate as local/offline evidence only, not runtime readiness.

## Manual scorecard threshold follow-up

The next v0.1.9 offline gate is [Manual observation scorecard thresholds v0](manual-observation-scorecard-thresholds.md). It aggregates manual replay evidence into strict zero-tolerance counters; it does not observe live traffic, execute tools, write memory/config, publish, approve, block, allow, authorize, or enforce.
