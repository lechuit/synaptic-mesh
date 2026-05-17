# @aletheia/dynamics

Deterministic memory dynamics for Aletheia.

> **Status**: Phase 2. Dynamics engine, deterministic sleep-cycle reports, explicit multi-cycle runs, and human-confirmed reconsolidation apply are live. Package version is still `0.0.0` until the first release version is chosen.

## Quickstart

```bash
pnpm add @aletheia/core @aletheia/store-sqlite @aletheia/dynamics
```

```ts
import { AgentIdSchema, IsoTimestampSchema } from '@aletheia/core';
import { createDynamicsPolicy, DynamicsEngine, SleepCycleRunner } from '@aletheia/dynamics';
import { openSqliteStores } from '@aletheia/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const engine = new DynamicsEngine({
  stores,
  policy: createDynamicsPolicy(AgentIdSchema.parse('agent-dynamics')),
});
const runner = new SleepCycleRunner(engine);

const report = await runner.run({
  cycleId: 'sleep:demo:1',
  now: IsoTimestampSchema.parse('2026-05-17T12:00:00Z'),
  scope: { kind: 'project', projectId: 'demo' },
  permittedVisibilities: [{ kind: 'private:user' }],
  applyTransitions: false,
});

console.log(report.outcome, report.plannedCount, report.appliedCount);
stores.close();
```

Use `applyTransitions: true` only when the host wants audited status transitions written through `MemoryStore.transitionStatus()`.

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

## Stability

Public surface for the initial library cycle:

- `createDynamicsPolicy`
- `DynamicsEngine`
- `SleepCycleRunner`
- `ReconsolidationPlanner`
- `ReconsolidationApplier`
- policy, decision, report, and evidence-provider types

Everything else is lifecycle plumbing and may change before the first `0.1.0` release. Dynamics can change persisted memory status, so hosts should treat policy changes as operationally significant even when TypeScript signatures stay stable.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/dynamics typecheck
pnpm -F @aletheia/dynamics test
pnpm -F @aletheia/dynamics build
```
