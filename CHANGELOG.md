# Changelog

Current Aletheia changes only. The pre-Aletheia release ladder was intentionally
removed from the active tree during repo hygiene cleanup so new readers see the
live TypeScript library, not historical review scaffolding. Those artifacts
remain recoverable through git history.

## Unreleased

- Added an `@aletheia-labs/episodic` continuity brief projection that combines
  current self-state, recent visible episode anchors, and optional status
  changes since a prior instant without adding authority or action permission.
- Added an explicit experience index projection that maps visible scoped
  episode anchors to the visible atoms grounded in those events.

## 0.1.1 - 2026-05-17

- Documented package runtime requirements across the published READMEs:
  Node 20+ and ESM-only consumption via `import`, `.mjs`, `"type": "module"`,
  or an ESM-aware toolchain.
- Clarified that CommonJS `require()` is not shipped in `0.1.x`; dual package
  output remains a future compatibility track rather than part of the initial
  public baseline.

## 0.1.0 - 2026-05-17

- Removed inactive pre-Aletheia research/release artifacts from the active repo
  surface: archived JS shadow implementation, historical ladder docs, generated
  manifests, old JSON schemas, publication package, fixture runs, and
  release-check tooling.
- Replaced the old shadow-baseline CI workflow with active Aletheia monorepo
  gates.
- Added `@aletheia-labs/core`, with zod-backed domain schemas, storage interfaces,
  WriteGate, RetrievalRouter, ActionAuthorizer, proposal safety, and the
  `AletheiaAuthority` facade.
- Added `@aletheia-labs/store-sqlite`, with versioned idempotent migrations,
  append-only event/memory/conflict stores, status-transition audit history,
  and permission-filtered queries.
- Added `@aletheia-labs/adapters-anthropic` and `@aletheia-labs/adapters-openai`,
  both accepting caller-provided clients and preserving governed
  `propose()` / `recall()` / `tryAct()` boundaries.
- Added no-key demos plus live Anthropic happy-path and adversarial evidence
  under `evidence/live-llm-e2e/`.
- Added `@aletheia-labs/dynamics`, with deterministic authority decay,
  source-consistent recall evidence, audited sleep-cycle transitions, and
  human-confirmed reconsolidation.
- Added `@aletheia-labs/episodic`, with permission-guarded episodic projections,
  status-history timelines, and restart self-state reconstruction.
- Aligned protocol specs with the executable TypeScript baseline and set the
  workspace/package release version to `0.1.0`.
