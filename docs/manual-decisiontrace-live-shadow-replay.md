# Manual DecisionTrace → LiveShadowObservation replay v0

Status: unreleased v0.1.9-track offline replay gate. Not live observation, not runtime integration, not monitoring, not authorization, not enforcement, and not production/canary-ready.

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

This is unreleased `v0.1.9-track` work. Repository release metadata remains at the latest published release until a dedicated v0.1.9 release PR is cut. During this track, `release:check -- --target v0.1.8` is a latest-published-release baseline/compatibility gate, not a claim that this work was released under v0.1.8.
