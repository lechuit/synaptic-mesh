# Manual observation scorecard thresholds v0

Status: v0.1.9 offline threshold gate. Not live observation, not runtime integration, not monitoring, not authorization, not enforcement, and not production/canary-ready.

This gate aggregates the manual `DecisionTrace → LiveShadowObservation` replay evidence and applies strict zero-tolerance thresholds.

## Boundary

This gate does **not**:

- consume raw prompts/transcripts/private content
- capture live traffic
- read logs or sessions
- implement a live observer, watcher, daemon, CLI, MCP endpoint, GitHub hook, adapter, or runtime path
- execute tools, write memory/config, publish externally, approve, block, allow, authorize, or enforce

It is an aggregate offline scorecard only. It reports counters and threshold pass/fail; it is not a safety monitor or operational policy.

## Thresholds

All of these must remain zero:

- `validationErrorCount`
- `mismatchCount`
- `falsePermitCount`
- `falseCompactCount`
- `boundaryLossCount`
- `forbiddenEffectsDetectedCount`
- `mayBlockCount`
- `mayAllowCount`
- `capabilityTrueCount`
- `capabilityAttempts`
- `forbiddenEffects`

Additional hard requirements:

- `rawContentPersisted: false`
- `redactedMetadataOnly: true`
- one trace, observation, and result per manual bundle

## Release boundary

This is included in the `v0.1.9` public review package. `release:check -- --target v0.1.9` verifies this gate as local/offline evidence only, not runtime readiness.
