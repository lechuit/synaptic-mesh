# Repository structure guide

Synaptic Mesh keeps protocol, implementation, research, and evidence separate so future work can scale without mixing authority claims with runtime code.

## Current top-level layout

- `specs/` — protocol contracts and stable schema-facing documentation.
- `schemas/` — formal JSON schemas for local shadow evidence records; currently includes RouteDecision and ParserEvidence shape validation.
- `implementation/synaptic-mesh-shadow-v0/` — local shadow implementation, fixtures, tests, and generated evidence for the current adapter contract package.
- `research-package/` — public research notes, review worksheets, blocker ledgers, and citation support.
- `runs/` — experiment-specific artifacts kept immutable enough for reproduction.
- `evidence/` — top-level reproducibility snapshots that are intentionally separate from implementation-local evidence.
- `paper/` — manuscript-oriented material.
- `docs/` — repository operation, layout guidance, review vocabulary, and conservative coverage status that do not define runtime authority. ADRs live under `docs/adr/`; concept notes live under `docs/concepts/`.
- `design-notes/` — short implementation design notes for changes that should stay smaller than a full spec; `live-shadow-observer-v0.md` is design-only and adds no runtime observer.
- `tools/` — repo-local validation utilities, including the package-wired manifest verification guard.

## Architecture decisions

- [ADR 0001: Shadow receiver architecture](adr/0001-shadow-receiver-architecture.md) documents the pure core, strategy registry, contract-first evidence, manifest guard, and review-gate decisions now used by the local shadow implementation.
- [ADR 0002: Authority claim model](adr/0002-authority-claim-model.md) documents the local shadow authority-claim taxonomy, receiver verification rule, and boundary that keeps sender labels from becoming authority.
- [RouteDecision schema v0](concepts/route-decision-v0.md) documents the first formal schema and its local shadow shape-validation boundary.
- [Reason code vocabulary](reason-codes.md) documents current stable reason-code categories and representative codes without turning them into runtime authority.
- [Coverage matrix](coverage-matrix.md) separates covered, partial, pending, and out-of-scope claims before release decisions.
- [Parser normalization evidence](parser-normalization-evidence.md) documents the local-shadow bridge from raw handoffs to auditable `parserEvidence` / route-decision input shape.
- [Offline real-flow replay](real-flow-replay.md) documents naturalistic handoff replay with gold labels, scorecards, and audit logs without live observer behavior.
- [Deterministic route classifier](deterministic-route-classifier.md) documents the shadow-only classifier over parser evidence fixtures.
- [Adapter boundary for LangGraph and MCP v0](../design-notes/adapter-boundary-langgraph-mcp-v0.md) documents future adapter boundaries, prerequisites, and non-goals without adding runtime integration.
- [Manual dry-run pilot failure catalog](manual-dry-run-pilot-failure-catalog.md) documents local reject-only pilot cases that must not emit success evidence or add operational powers.
- [Manual dry-run pilot runbook](manual-dry-run-pilot-runbook.md) and [checklist](manual-dry-run-pilot-checklist.md) document the human process for running already-redacted bundles without changing the manual/local/offline/record-only boundary.
- [Manual dry-run pilot cases](manual-dry-run-pilot-cases.md) documents the expanded 12-case real-redacted pilot pack and its record-only thresholds.

## Scaling rules

1. Prefer adding new protocol contracts under `specs/` before implementation-specific fixtures depend on them.
2. Keep receiver policy core logic in `src/` pure: it should classify/evaluate packet data without filesystem, CLI, network, or evidence writes.
3. Keep IO at the edges: CLIs in `bin/`, contract/evidence writers in `tests/`, small filesystem/process adapters in `src/adapters/`, and historical outputs under `evidence/` or `runs/`.
4. Add adapter/framework mappings as narrow ports that translate framework packet shapes into the stable receiver-policy input shape; test runners may also use narrow adapters when that prevents orchestration IO from leaking into policy/core modules.
5. Avoid large file moves in behavior PRs. If a migration is needed, do it in a dedicated layout PR with manifest/evidence regeneration.
6. Keep `MANIFEST.json` current with tracked repository files; `npm run verify:manifest`, `npm run check`, and `npm run review:local` should fail when tracked file bytes or hashes drift.

## Suggested next package boundary

When the implementation grows past the current single package, prefer this path:

- `packages/receiver-policy-core/` for pure validators/classifiers.
- `packages/receiver-adapters/` for framework mapping ports.
- `tools/` for repo-local validation and manifest utilities.
- `evidence/` and `runs/` remain artifact stores, not import targets.
