# Live-shadow drift scorecard shape v0

Status: unreleased v0.1.8-track offline scorecard-shape gate. Not a live observer, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

This gate defines an aggregate scorecard shape over synthetic live-shadow replay evidence:

```text
Synthetic LiveShadowObservationResult records
  ↓
aggregate drift buckets and no-effect counters
  ↓
LiveShadowDriftScorecard shape
```

## What this adds

- `schemas/live-shadow-drift-scorecard.schema.json`
- `implementation/synaptic-mesh-shadow-v0/fixtures/live-shadow-drift-scorecard.json`
- `implementation/synaptic-mesh-shadow-v0/tests/live-shadow-drift-scorecard-shape.mjs`
- `implementation/synaptic-mesh-shadow-v0/evidence/live-shadow-drift-scorecard-shape.out.json`
- `npm run test:live-shadow-drift-scorecard`

## Boundary

This is aggregate shape validation only. It does **not**:

- observe live traffic
- read live logs or sessions
- implement a live observer, daemon, watcher, CLI, MCP endpoint, GitHub hook, or adapter
- import runtime/adapters/tools modules
- execute tools
- write memory
- write config
- publish externally
- block, allow, approve, grant, or enforce anything
- implement redaction code or retention scheduling

The scorecard is intentionally aggregate-only. It reports counts and bucket labels, not raw prompts, transcripts, secrets, tool outputs, memory/config text, approval text, or private paths.

## Drift buckets

Initial bucket vocabulary:

- `none`
- `classifierDecisionChanged`
- `redactionWarning`
- `forbiddenEffect` — must be `0`
- `capabilityAttempt` — must be `0`
- `unknown` — must be `0`

The zero buckets are hard boundaries: any forbidden effect or capability attempt should fail the gate, not become a tolerated scorecard row.

## Capability summary

All capability counters must stay zero:

- `mayBlockCount`
- `mayAllowCount`
- `mayExecuteToolCount`
- `mayWriteMemoryCount`
- `mayWriteConfigCount`
- `mayPublishExternallyCount`
- `mayModifyAgentInstructionsCount`
- `mayEnterApprovalPathCount`
- `capabilityTrueCount`

## Release boundary

This remains unreleased `v0.1.8-track` work. Repository release metadata stays at the latest published release until the dedicated v0.1.8 release PR. During this track, `release:check -- --target v0.1.7` is a latest-published-release baseline/compatibility gate, not a claim that this scorecard shape was released under v0.1.7.

## Manual ingestion follow-up

The next unreleased v0.1.9-track gate is [Manual observation bundles v0](manual-observation-bundles.md). It defines a manual/offline/redacted bundle shape for handoff-like artifacts before any live observer, watcher, daemon, runtime adapter, tool execution, memory/config write, publication, approval path, blocking, allowing, or enforcement exists.
