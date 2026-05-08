# Manual observation bundles v0

Status: unreleased v0.1.9-track offline schema gate. Not a live observer, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

A manual observation bundle is a hand-created, manually redacted bridge between synthetic fixtures and future real-world observation. It exists so real handoff-like artifacts can be represented safely before any live observer, daemon, watcher, adapter, MCP endpoint, tool integration, memory write, config write, publication, approval path, blocking, allowing, or enforcement exists.

## Boundary

This gate validates shape only. It does **not**:

- capture live traffic
- read live logs or sessions
- implement a live observer, watcher, daemon, CLI, MCP endpoint, GitHub hook, or adapter
- execute tools
- write memory
- write config
- publish externally
- block, allow, approve, grant, authorize, or enforce anything

## Required safety invariants

A valid `ManualObservationBundle` must have:

- `captureMode: "manual_offline"`
- `humanReviewRequiredForCapture: true`
- `rawContentIncluded: false`
- `redactedContentIncluded: true`
- `allowedProcessing: "local_shadow_only"`
- `containsSecrets: false`
- `containsToolOutput: false`
- `containsMemoryText: false`
- `containsConfigText: false`
- `containsApprovalText: false`
- `containsPrivatePath: false`

It must explicitly forbid:

- `runtime`
- `tools`
- `memory_write`
- `config_write`
- `external_publication`
- `approval_path`
- `blocking`
- `allowing`

## Why this exists

The next safety question is not “can we observe live flows?” It is narrower:

> Can we manually ingest redacted real-ish handoff artifacts without retaining raw/private content or creating authority?

This schema is the first step. Later v0.1.9-track PRs may add redaction fixture packs and offline replay from manual bundles into parser evidence, DecisionTrace, LiveShadowObservationResult, and scorecards. Those follow-ups must remain manual/offline/local-shadow only.

## Release boundary

This is unreleased `v0.1.9-track` work. Repository release metadata remains at the latest published release until a dedicated v0.1.9 release PR is cut. During this track, `release:check -- --target v0.1.8` is a latest-published-release baseline/compatibility gate, not a claim that this work was released under v0.1.8.

## Redaction fixture follow-up

The next unreleased v0.1.9-track gate is [Manual observation redaction fixture pack v0](manual-observation-redaction-fixtures.md). It adds positive redacted cases and synthetic negative leakage labels only; it does not implement redaction code, capture live traffic, read logs/sessions, execute tools, write memory/config, publish, approve, block, allow, or enforce.
