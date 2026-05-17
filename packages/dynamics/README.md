# @aletheia/dynamics

Deterministic memory dynamics for Aletheia.

> **Status**: `0.1.0` public baseline. Dynamics engine, deterministic sleep-cycle reports, explicit multi-cycle runs, and human-confirmed reconsolidation apply are live.

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

- Computes pure decayed authority scores for recall ranking without mutating memory status.
- Walks visible memory atoms in a caller-provided scope.
- Scans lifecycle candidates without `validAt` filtering so expired or corrupt validity windows can be decommissioned.
- Plans status transitions from explicit policy and evidence.
- Applies transitions only through `MemoryStore.transitionStatus`.
- Treats unresolved or human-required conflicts that touch an atom as authority blockers.
- Counts source-consistent recall evidence from an append-only `EventLedger`.
- Provides `SleepCycleRunner` for deterministic dry-run/apply reports over a host-provided store.
- Runs explicit multi-cycle sleep sequences when the host provides each cycle input; no hidden scheduler is started.
- Provides `ReconsolidationPlanner` for successor drafts with `supersedes` lineage and planned transitions.
- Provides `ReconsolidationApplier` for explicit human-confirmed successor insertion plus audited prior-atom deprecation.
- Provides `LineageTracer` for permission-guarded reconstruction of `supersedes` chains.
- Keeps `@aletheia/core` SDK-free and free of background scheduling.

## Decayed Recall Ranking

Memory ages. `decayedAuthority(atom, now)` returns an effective authority score
for ranking atoms that have already passed core visibility, scope, status, and
freshness filters. It is not a permission check and it never mutates status.

```ts
import { AletheiaAuthority } from '@aletheia/core';
import { decayedAuthority } from '@aletheia/dynamics';

const authority = new AletheiaAuthority({
  eventLedger,
  memoryStore,
  conflictRegistry,
  visibilityPolicy,
  clock,
  authorityScorer: (atom, now) => decayedAuthority(atom, now),
});
```

Defaults decay candidates fastest, verified memories over weeks, and trusted
memories over months. Sealed memory does not decay; rejected, deprecated, and
human-required memory scores zero.

## Recall Evidence

`LedgerRecallEvidenceProvider` turns host-recorded recall events into lifecycle
evidence. It queries the ledger by scope and visibility before inspecting
payloads, then counts only events whose payload cites the target atom and all of
its `sourceEventIds`.

```ts
import {
  LedgerRecallEvidenceProvider,
  sourceConsistentRecallPayload,
} from '@aletheia/dynamics';

await eventLedger.append({
  eventId,
  kind: 'decision',
  agentId,
  occurredAt,
  scope: atom.scope,
  visibility: atom.visibility,
  payload: sourceConsistentRecallPayload(atom),
});

const engine = new DynamicsEngine({
  stores,
  policy,
  evidenceProvider: new LedgerRecallEvidenceProvider({ eventLedger }),
});
```

The event is evidence that a host used a memory with its original sources still
present. It is not permission, not semantic relevance, and not model confidence.

## Lineage

Reconsolidation never overwrites an atom. A successor carries a `supersedes`
link to the prior atom, and the prior atom is deprecated through audited status
history. `LineageTracer` reconstructs that chain only through visible atoms:

```ts
import { LineageTracer } from '@aletheia/dynamics';

const lineage = await new LineageTracer({ memoryStore }).traceBack({
  memoryId: successorId,
  permittedVisibilities,
});
```

If an ancestor is missing, invisible, cyclic, or too deep, the tracer returns
`fetch_abstain` with the partial chain instead of inventing continuity.

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
- `decayedAuthority`
- `DEFAULT_AUTHORITY_DECAY_POLICY`
- `AuthorityDecayPolicy` and `AuthorityDecayPolicyOverrides`
- `DynamicsEngine`
- `SleepCycleRunner`
- `LedgerRecallEvidenceProvider`
- `sourceConsistentRecallPayload`
- `SOURCE_CONSISTENT_RECALL_EVENT`
- `ReconsolidationPlanner`
- `ReconsolidationApplier`
- `LineageTracer`
- policy, decision, report, and evidence-provider types

Everything else is lifecycle plumbing and may change during the `0.x` line. Dynamics can change persisted memory status, so hosts should treat policy changes as operationally significant even when TypeScript signatures stay stable.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/dynamics typecheck
pnpm -F @aletheia/dynamics test
pnpm -F @aletheia/dynamics build
```
