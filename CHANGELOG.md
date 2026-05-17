# Changelog

Current Aletheia changes only. The pre-Aletheia release ladder was intentionally
removed from the active tree during repo hygiene cleanup so new readers see the
live TypeScript library, not historical review scaffolding. Those artifacts
remain recoverable through git history.

## Unreleased

- Removed inactive pre-Aletheia research/release artifacts from the active repo
  surface: archived JS shadow implementation, historical ladder docs, generated
  manifests, old JSON schemas, publication package, fixture runs, and
  release-check tooling.
- Replaced the old shadow-baseline CI workflow with active Aletheia monorepo
  gates.

## 0.0.0

- Added `@aletheia/core`, with zod-backed domain schemas, storage interfaces,
  WriteGate, RetrievalRouter, ActionAuthorizer, proposal safety, and the
  `AletheiaAuthority` facade.
- Added `@aletheia/store-sqlite`, with versioned idempotent migrations,
  append-only event/memory/conflict stores, status-transition audit history,
  and permission-filtered queries.
- Added `@aletheia/adapters-anthropic` and `@aletheia/adapters-openai`,
  both accepting caller-provided clients and preserving governed
  `propose()` / `recall()` / `tryAct()` boundaries.
- Added no-key demos plus live Anthropic happy-path and adversarial evidence
  under `evidence/live-llm-e2e/`.
- Added `@aletheia/dynamics`, with deterministic authority decay,
  source-consistent recall evidence, audited sleep-cycle transitions, and
  human-confirmed reconsolidation.
- Added `@aletheia/episodic`, with permission-guarded episodic projections,
  status-history timelines, and restart self-state reconstruction.
