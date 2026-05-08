# Manual bundle parserEvidence replay v0

Status: v0.1.9 offline offline replay gate. Not classifier, not DecisionTrace generation, not live observation, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

This gate replays valid manual observation bundles into `parserEvidence` shape using redacted bundle metadata only.

```text
ManualObservationBundle
  + accepted redaction fixture
  ↓
parserEvidence
  + routeDecisionInput hash
```

## Boundary

This gate does **not**:

- consume raw prompts/transcripts/private content
- capture live traffic
- read logs or sessions
- compute classifier decisions
- generate DecisionTrace records
- implement a live observer, watcher, daemon, CLI, MCP endpoint, GitHub hook, adapter, or runtime path
- execute tools, write memory/config, publish externally, approve, block, allow, authorize, or enforce

## Current evidence

The gate expects:

- `manualBundles: 2`
- `parserEvidenceValidCount: 2`
- `validationErrorCount: 0`
- `routeDecisionInputHashBound: true`
- `rawContentPersisted: false`
- `capabilityAttempts: 0`
- `forbiddenEffects: 0`
- `humanReviewRequiredForCapture: true`

## Release boundary

This is included in the `v0.1.9` public review package. `release:check -- --target v0.1.9` verifies this gate as local/offline evidence only, not runtime readiness.

## DecisionTrace / live-shadow replay follow-up

The next v0.1.9 offline gate is [Manual DecisionTrace → LiveShadowObservation replay v0](manual-decisiontrace-live-shadow-replay.md). It maps redacted parserEvidence replay rows into offline DecisionTrace and record-only LiveShadowObservation shapes; it does not observe live traffic, execute tools, write memory/config, publish, approve, block, allow, authorize, or enforce.
