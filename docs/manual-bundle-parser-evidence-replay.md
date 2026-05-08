# Manual bundle parserEvidence replay v0

Status: unreleased v0.1.9-track offline replay gate. Not classifier, not DecisionTrace generation, not live observation, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

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

This is unreleased `v0.1.9-track` work. Repository release metadata remains at the latest published release until a dedicated v0.1.9 release PR is cut. During this track, `release:check -- --target v0.1.8` is a latest-published-release baseline/compatibility gate, not a claim that this work was released under v0.1.8.

## DecisionTrace / live-shadow replay follow-up

The next unreleased v0.1.9-track gate is [Manual DecisionTrace → LiveShadowObservation replay v0](manual-decisiontrace-live-shadow-replay.md). It maps redacted parserEvidence replay rows into offline DecisionTrace and record-only LiveShadowObservation shapes; it does not observe live traffic, execute tools, write memory/config, publish, approve, block, allow, authorize, or enforce.
