# Synaptic Mesh v0.6.0-alpha

Status: explicit batch manifest schema public review release `v0.6.0-alpha`; **manual, local, manifest only, no batch execution yet, schema-only, explicit already-redacted input list only, record-only evidence, no batch adapter behavior, no effects**; **not runtime-ready**; **not production/enforcement-ready**.

## What this is

Synaptic Mesh / Multi-Agent Memory Authority Protocol is a protocol proposal for preserving authority, source status, and boundary receipts through multi-agent memory transforms: retrieval, summary, compression, handoff, and review.

Current v0.6.0-alpha status is narrower than the long-term protocol goal: this repository now defines a minimal **explicit batch manifest schema** for a future read-only local-file batch adapter. The batch shape is intentionally boring: a reviewed manifest lists explicit already-redacted local file paths, sha256 digests, and redaction review record IDs. It is manifest only, no batch execution yet. It does not implement batch adapter behavior.

## Quick local review

From the repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

For batch-manifest-shaped coverage:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-batch-manifest-schema
```

For adapter-shaped coverage from the previous phase:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-schema
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-negative-controls
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-failure-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-reviewer-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-public-review-package
```

For exact release-candidate verification:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.0-alpha
```

For an already-published release, check out the release tag before re-running the exact target check.

## What this is not

- not production software;
- not runtime/tooling integration;
- not a batch adapter implementation;
- not a general-purpose adapter;
- not MCP, A2A, LangGraph, GitHub bot, watcher, daemon, webhook, or framework integration;
- not live monitoring;
- not raw input processing or raw input persistence;
- not directory discovery, glob input, URL input, network input, or live traffic;
- not an autonomous/live/runtime canary;
- not an agent-consumed advisory authority;
- not approval, blocking, allowing, authorization, or enforcement;
- not a safety certification.

## Where to read next

- [Full v0.6.0-alpha status snapshot](docs/status-v0.6.0-alpha.md) — explicit batch manifest schema alpha.
- [Read-only local-file explicit batch manifest](docs/read-only-local-file-batch-manifest.md) — contract-only batch manifest review note.
- [Read-only local-file adapter public review package](docs/read-only-local-file-adapter-public-review-package.md) — previous conservative phase-close record.
- [Read-only local-file adapter reviewer runbook](docs/read-only-local-file-adapter-reviewer-runbook.md) — human review guidance for the real adapter.
- [Read-only local-file adapter canary runbook](docs/read-only-local-file-adapter-canary-runbook.md) — human-facing canary review guidance.
- [Adapter implementation hazard catalog](docs/adapter-implementation-hazard-catalog-v0.4.8.md) — pre-implementation expected failure catalog that negative controls exercise.
- [First real adapter design note](docs/first-real-adapter-design-note-v0.4.7.md) — design-only origin of the adapter shape.
- [Read-only adapter reviewer runbook](docs/read-only-adapter-reviewer-runbook-v0.4.3.md) — earlier human-facing boundary review checklist.
- [Release ladder](docs/release-ladder.md) — roadmap from passive canary work toward advisory-only reporting, with explicit non-authority boundaries.
- [Coverage matrix](docs/coverage-matrix.md) — covered, partial, pending, and out-of-scope claims.
- [Release checklist](docs/release-checklist.md) — release-local validation and conservative claim checks.

Included repository areas:

- `paper/` — paper draft material;
- `specs/` and `schemas/` — protocol contracts and evidence schemas;
- `implementation/synaptic-mesh-shadow-v0/` — local shadow/reference implementation, tests, fixtures, and evidence;
- `research-package` and `evidence/` — bibliography/review artifacts and reproducibility snapshots;
- `docs/` — status, coverage, runbooks, roadmap, and boundary notes.

## v0.6.x roadmap

- `v0.6.0-alpha` — batch manifest schema.
- `v0.6.1` — batch negative controls.
- `v0.6.2` — batch adapter canary.
- `v0.6.3` — batch reproducibility gate.
- `v0.6.4` — batch failure isolation.
- `v0.6.5` — batch public review package.

## Runtime boundary

Runtime/tooling integration, live observation, config changes, permanent memory promotion, automatic agent consumption, autonomous/live/runtime canary, batch adapter behavior, generalized adapter behavior, MCP/A2A/LangGraph/GitHub-bot/framework integration, approval paths, blocking, allowing, authorization, enforcement, production, or L2+ operational use require a separate explicit maintainer approval track.

This package is for protocol, citation, fixture, adapter-boundary design, batch-manifest schema, and reference-implementation review only.
