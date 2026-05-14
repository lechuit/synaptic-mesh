# Synaptic Mesh v0.5.1

Status: adapter reproducibility public review release `v0.5.1`; **manual, local, one explicit already-redacted input file only, record-only evidence, deterministic normalized output, no effects**; **not runtime-ready**; **not production/enforcement-ready**.

## What this is

Synaptic Mesh / Multi-Agent Memory Authority Protocol is a protocol proposal for preserving authority, source status, and boundary receipts through multi-agent memory transforms: retrieval, summary, compression, handoff, and review.

Current v0.5.1 status is narrower than the long-term protocol goal: this repository ships a minimal **read-only local-file adapter** plus schema, negative controls, containment guards, positive canary, reviewer runbook, and an adapter reproducibility gate. The adapter path is intentionally boring: one explicit already-redacted local file becomes parser evidence, passes through the existing classifier stage, and emits DecisionTrace, human-readable advisory, and record-only local evidence.

## Quick local review

From the repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

For adapter-shaped coverage:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-schema
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-negative-controls
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-reproducibility
```

For exact release-candidate verification:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.1
```

For an already-published release, check out the release tag before re-running the exact target check.

## What this is not

- not production software;
- not runtime/tooling integration;
- not a general-purpose adapter;
- not MCP, A2A, LangGraph, GitHub bot, watcher, daemon, webhook, or framework integration;
- not live monitoring;
- not raw input processing or raw input persistence;
- not an autonomous/live/runtime canary;
- not an agent-consumed advisory authority;
- not approval, blocking, allowing, authorization, or enforcement;
- not a safety certification.

## Where to read next

- [Full v0.5.1 status snapshot](docs/status-v0.5.1.md) — reproducibility gate, expected evidence, and boundaries.
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
- `research-package/` and `evidence/` — bibliography/review artifacts and reproducibility snapshots;
- `docs/` — status, coverage, runbooks, roadmap, and boundary notes.

## Runtime boundary

Runtime/tooling integration, live observation, config changes, permanent memory promotion, automatic agent consumption, autonomous/live/runtime canary, generalized adapter behavior, MCP/A2A/LangGraph/GitHub-bot/framework integration, approval paths, blocking, allowing, authorization, enforcement, production, or L2+ operational use require a separate explicit maintainer approval track.

This package is for protocol, citation, fixture, adapter-boundary design, and reference-implementation review only.
