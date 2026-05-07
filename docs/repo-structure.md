# Repository structure guide

Synaptic Mesh keeps protocol, implementation, research, and evidence separate so future work can scale without mixing authority claims with runtime code.

## Current top-level layout

- `specs/` — protocol contracts and stable schema-facing documentation.
- `schemas/` — formal JSON schemas for local shadow evidence records; currently limited to RouteDecision shape validation.
- `implementation/synaptic-mesh-shadow-v0/` — local shadow implementation, fixtures, tests, and generated evidence for the current adapter contract package.
- `research-package/` — public research notes, review worksheets, blocker ledgers, and citation support.
- `runs/` — experiment-specific artifacts kept immutable enough for reproduction.
- `evidence/` — top-level reproducibility snapshots that are intentionally separate from implementation-local evidence.
- `paper/` — manuscript-oriented material.
- `docs/` — repository operation and layout guidance that does not define protocol authority. ADRs live under `docs/adr/`; concept notes live under `docs/concepts/`.
- `design-notes/` — short implementation design notes for changes that should stay smaller than a full spec.
- `tools/` — repo-local validation utilities, including the package-wired manifest verification guard.

## Architecture decisions

- [ADR 0001: Shadow receiver architecture](adr/0001-shadow-receiver-architecture.md) documents the pure core, strategy registry, contract-first evidence, manifest guard, and review-gate decisions now used by the local shadow implementation.
- [ADR 0002: Authority claim model](adr/0002-authority-claim-model.md) documents the local shadow authority-claim taxonomy, receiver verification rule, and boundary that keeps sender labels from becoming authority.
- [RouteDecision schema v0](concepts/route-decision-v0.md) documents the first formal schema and its local shadow shape-validation boundary.

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
