# @aletheia/dynamics

Deterministic memory dynamics for Aletheia.

> **Status**: Phase 2.2. Dynamics engine, deterministic sleep-cycle reports, and planner-only reconsolidation are live.

## What this package does

- Walks visible memory atoms in a caller-provided scope.
- Scans lifecycle candidates without `validAt` filtering so expired or corrupt validity windows can be decommissioned.
- Plans status transitions from explicit policy and evidence.
- Applies transitions only through `MemoryStore.transitionStatus`.
- Treats unresolved conflicts that touch an atom as authority blockers.
- Provides `SleepCycleRunner` for deterministic dry-run/apply reports over a host-provided store.
- Provides `ReconsolidationPlanner` for successor drafts with `supersedes` lineage and planned transitions, without mutating the store.
- Keeps `@aletheia/core` SDK-free and free of background scheduling.

## What this package does NOT do

- No hidden daemon.
- No semantic ranking.
- No automatic use of `confidence` or `consensus` as authority.
- No automatic background mutation: hosts must explicitly call `tick({ applyTransitions: true })`.
- No direct mutation of atom content, scores, visibility, scope, or links.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/dynamics build
pnpm -F @aletheia/dynamics test
pnpm -F @aletheia/dynamics typecheck
```
