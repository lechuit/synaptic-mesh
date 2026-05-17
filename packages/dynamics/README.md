# @aletheia/dynamics

Deterministic memory dynamics for Aletheia.

> **Status**: Phase 2.4. Dynamics engine, deterministic sleep-cycle reports, explicit multi-cycle runs, and human-confirmed reconsolidation apply are live.

## What this package does

- Walks visible memory atoms in a caller-provided scope.
- Scans lifecycle candidates without `validAt` filtering so expired or corrupt validity windows can be decommissioned.
- Plans status transitions from explicit policy and evidence.
- Applies transitions only through `MemoryStore.transitionStatus`.
- Treats unresolved conflicts that touch an atom as authority blockers.
- Provides `SleepCycleRunner` for deterministic dry-run/apply reports over a host-provided store.
- Runs explicit multi-cycle sleep sequences when the host provides each cycle input; no hidden scheduler is started.
- Provides `ReconsolidationPlanner` for successor drafts with `supersedes` lineage and planned transitions.
- Provides `ReconsolidationApplier` for explicit human-confirmed successor insertion plus audited prior-atom deprecation.
- Keeps `@aletheia/core` SDK-free and free of background scheduling.

## What this package does NOT do

- No hidden daemon.
- No semantic ranking.
- No automatic use of `confidence` or `consensus` as authority.
- No automatic background mutation: hosts must explicitly call `tick({ applyTransitions: true })` or `ReconsolidationApplier.apply({ humanConfirmation })`.
- No reconsolidation authority upgrade: successors start as `candidate`.
- No silent reconsolidation partial success: if successor insertion succeeds but a prior-atom transition rejects, the applier returns `partial_applied`.
- No direct mutation of atom content, scores, visibility, scope, or links.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/dynamics build
pnpm -F @aletheia/dynamics test
pnpm -F @aletheia/dynamics typecheck
```
