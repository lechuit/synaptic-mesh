# Manual observation bundles v0

Status: v0.1.9 offline schema gate. Not a live observer, not runtime integration, not monitoring, not enforcement, and not production/canary-ready.

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

This schema is the first step. Later v0.1.9 offline gates add redaction fixture packs and offline replay from manual bundles into parser evidence, DecisionTrace, LiveShadowObservationResult, and scorecards. Those follow-ups must remain manual/offline/local-shadow only.

## Release boundary

This is included in the `v0.1.9` public review package. `release:check -- --target v0.1.9` verifies this gate as local/offline evidence only, not runtime readiness.

## Redaction fixture follow-up

The next v0.1.9 offline gate is [Manual observation redaction fixture pack v0](manual-observation-redaction-fixtures.md). It adds positive redacted cases and synthetic negative leakage labels only; it does not implement redaction code, capture live traffic, read logs/sessions, execute tools, write memory/config, publish, approve, block, allow, or enforce.
