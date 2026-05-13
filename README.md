# Synaptic Mesh v0.4.6

Status: human review findings / go-no-go public review release `v0.4.6`; **manual, local, explicit/redacted input only, record-only, no effects**; **not runtime-ready**; **not production/enforcement-ready**.

## What this is

Synaptic Mesh / Multi-Agent Memory Authority Protocol is a protocol proposal for preserving authority, source status, and boundary receipts through multi-agent memory transforms: retrieval, summary, compression, handoff, and review.

Current v0.4.6 status is narrower than the long-term protocol goal: this repository ships a **human review findings / go-no-go record** for the read-only adapter boundary package. It records go for public review-only status and go for designing the first real adapter boundary, while keeping implementation, framework integration, and runtime behavior unauthorized without a separate explicit maintainer decision.

## Quick local review

From the repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

For adapter-shaped contract coverage:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:receiver-adapters
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-adapter-human-review-go-no-go
```

For exact published-release verification, check out the release tag first:

```bash
git checkout v0.4.6
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.4.6
```

For unreleased PRs, use the [release checklist](docs/release-checklist.md) with the next intended target.

## What this is not

- not production software;
- not runtime/tooling integration;
- not a real adapter;
- not MCP, LangGraph, GitHub bot, watcher, daemon, webhook, or framework integration;
- not live monitoring;
- not an autonomous/live/runtime canary;
- not an agent-consumed advisory authority;
- not approval, blocking, allowing, authorization, or enforcement;
- not a safety certification.

## Where to read next

- [Full v0.4.6 status snapshot](docs/status-v0.4.6.md) — complete release snapshot, included gates, expected review results, and boundaries.
- [Human review findings / go-no-go record](docs/read-only-adapter-human-review-findings-go-no-go-v0.4.6.md) — human review findings and go/no-go status for v0.4.x.
- [Read-only adapter reviewer runbook](docs/read-only-adapter-reviewer-runbook-v0.4.3.md) — human-facing boundary review checklist.
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

Runtime/tooling integration, live observation, config changes, permanent memory promotion, automatic agent consumption, autonomous/live/runtime canary, real adapter implementation, MCP/LangGraph/GitHub-bot/framework integration, approval paths, blocking, allowing, authorization, enforcement, production, or L2+ operational use require a separate explicit maintainer approval track.

This package is for protocol, citation, fixture, adapter-boundary design, and reference-implementation review only.
