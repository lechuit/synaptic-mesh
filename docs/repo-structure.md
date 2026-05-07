# Repository structure guide

Synaptic Mesh keeps protocol, implementation, research, and evidence separate so future work can scale without mixing authority claims with runtime code.

## Current top-level layout

- `specs/` — protocol contracts and stable schema-facing documentation.
- `implementation/synaptic-mesh-shadow-v0/` — local shadow implementation, fixtures, tests, and generated evidence for the current adapter contract package.
- `research-package/` — public research notes, review worksheets, blocker ledgers, and citation support.
- `runs/` — experiment-specific artifacts kept immutable enough for reproduction.
- `evidence/` — top-level reproducibility snapshots that are intentionally separate from implementation-local evidence.
- `paper/` — manuscript-oriented material.
- `docs/` — repository operation and layout guidance that does not define protocol authority.
- `design-notes/` — short implementation design notes for changes that should stay smaller than a full spec.

## Scaling rules

1. Prefer adding new protocol contracts under `specs/` before implementation-specific fixtures depend on them.
2. Keep receiver policy core logic in `src/` pure: it should classify/evaluate packet data without filesystem, CLI, network, or evidence writes.
3. Keep IO at the edges: CLIs in `bin/`, contract/evidence writers in `tests/`, and historical outputs under `evidence/` or `runs/`.
4. Add adapter/framework mappings as narrow ports that translate framework packet shapes into the stable receiver-policy input shape.
5. Avoid large file moves in behavior PRs. If a migration is needed, do it in a dedicated layout PR with manifest/evidence regeneration.

## Suggested next package boundary

When the implementation grows past the current single package, prefer this path:

- `packages/receiver-policy-core/` for pure validators/classifiers.
- `packages/receiver-adapters/` for framework mapping ports.
- `tools/` for repo-local validation and manifest utilities.
- `evidence/` and `runs/` remain artifact stores, not import targets.
