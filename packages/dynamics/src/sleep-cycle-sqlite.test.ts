import type {
  AgentId,
  ConflictId,
  ConflictRecord,
  Event,
  EventId,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  Visibility,
} from '@aletheia/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from '../../store-sqlite/src/index.js';
import { DynamicsEngine, type DynamicsEvidenceProvider } from './dynamics-engine.js';
import { createDynamicsPolicy } from './policy.js';
import { LedgerRecallEvidenceProvider, sourceConsistentRecallPayload } from './recall-evidence.js';
import { SleepCycleRunner } from './sleep-cycle.js';

const ACTOR = 'agent-sleep-cycle' as AgentId;
const NOW = '2026-05-17T04:00:00Z' as IsoTimestamp;
const VISIBILITY: Visibility = { kind: 'team', name: 'core' };
const PERMITTED: readonly Visibility[] = [VISIBILITY];

let stores: SqliteStores;

beforeEach(() => {
  stores = openSqliteStores(':memory:');
});

afterEach(() => {
  stores.close();
});

describe('SleepCycleRunner with SQLite stores', () => {
  it('produces deterministic dry-run reports without mutating persisted atoms', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-promotable' as MemoryId,
        status: 'candidate',
        validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-stale' as MemoryId,
        status: 'candidate',
        validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
      }),
    );

    const runner = runnerFor(
      stores,
      evidenceProviderByMemoryId({
        'mem-promotable': 3,
        'mem-stale': 0,
      }),
    );
    const first = await runner.run(input());
    const second = await runner.run(input());

    expect(first).toEqual(second);
    expect(first.mode).toBe('dry_run');
    expect(first.plannedMemoryIds).toEqual(['mem-promotable', 'mem-stale']);
    expect(first.appliedMemoryIds).toEqual([]);

    expect((await stores.memoryStore.get('mem-promotable' as MemoryId, PERMITTED))?.status).toBe(
      'candidate',
    );
    expect((await stores.memoryStore.get('mem-stale' as MemoryId, PERMITTED))?.status).toBe(
      'candidate',
    );

    const promotableHistory = await stores.memoryStore.statusHistory('mem-promotable' as MemoryId);
    const staleHistory = await stores.memoryStore.statusHistory('mem-stale' as MemoryId);
    expect(promotableHistory).toHaveLength(1);
    expect(staleHistory).toHaveLength(1);
  });

  it('applies transitions through SQLite and records the sleep-cycle logical timestamp', async () => {
    const expired = atom({
      memoryId: 'mem-expired' as MemoryId,
      status: 'verified',
      validUntil: '2026-05-10T00:00:00Z' as IsoTimestamp,
    });
    await stores.memoryStore.insert(expired);

    const runner = runnerFor(stores, evidenceProviderFor(0));
    const report = await runner.run(input({ applyTransitions: true }));

    expect(report.mode).toBe('apply');
    expect(report.appliedMemoryIds).toEqual([expired.memoryId]);
    expect(report.decisions[0]).toMatchObject({
      reason: 'expired',
      recommendedStatus: 'deprecated',
    });

    const updated = await stores.memoryStore.get(expired.memoryId, PERMITTED);
    expect(updated?.status).toBe('deprecated');

    const history = await stores.memoryStore.statusHistory(expired.memoryId);
    const transition = history.find((entry) => entry.reason.rationale === 'phase2:expired');
    expect(transition?.at).toBe(NOW);
    expect(transition?.reason).toMatchObject({
      actor: ACTOR,
      rationale: 'phase2:expired',
    });
  });

  it('returns a fail-closed report without permitted visibility', async () => {
    await stores.memoryStore.insert(atom({ memoryId: 'mem-hidden-cycle' as MemoryId }));

    const runner = runnerFor(stores, evidenceProviderFor(3));
    const report = await runner.run(input({ permittedVisibilities: [] }));

    expect(report.outcome).toBe('fetch_abstain');
    expect(report.reasons).toEqual(['no_permitted_visibilities']);
    expect(report.decisions).toEqual([]);
  });

  it('runs multiple explicit cycles without hidden scheduling', async () => {
    const stale = atom({
      memoryId: 'mem-stale-cycle' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const promotable = atom({
      memoryId: 'mem-promotable-cycle' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    await stores.memoryStore.insert(stale);
    await stores.memoryStore.insert(promotable);

    const runner = runnerFor(
      stores,
      evidenceProviderByMemoryId({
        'mem-promotable-cycle': 3,
        'mem-stale-cycle': 0,
      }),
    );
    const report = await runner.runMany([
      input({ cycleId: 'cycle-1', applyTransitions: false }),
      input({ cycleId: 'cycle-2', applyTransitions: true }),
    ]);

    expect(report.reports.map((cycle) => cycle.cycleId)).toEqual(['cycle-1', 'cycle-2']);
    expect(report.plannedMemoryIds).toEqual(['mem-promotable-cycle', 'mem-stale-cycle']);
    expect(report.appliedMemoryIds).toEqual(['mem-promotable-cycle', 'mem-stale-cycle']);
    expect(report.plannedCount).toBe(2);
    expect(report.appliedCount).toBe(2);

    expect((await stores.memoryStore.get(promotable.memoryId, PERMITTED))?.status).toBe('verified');
    expect((await stores.memoryStore.get(stale.memoryId, PERMITTED))?.status).toBe('deprecated');
  });

  it('evolves a SQLite store from ledger recall evidence with auditable history', async () => {
    const promotable = atom({
      memoryId: 'mem-ledger-promotable' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const stale = atom({
      memoryId: 'mem-ledger-stale' as MemoryId,
      status: 'verified',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    await stores.memoryStore.insert(promotable);
    await stores.memoryStore.insert(stale);
    await stores.eventLedger.append(recallEvent(promotable, 'evt-recall-1' as EventId));
    await stores.eventLedger.append(
      recallEvent(promotable, 'evt-recall-2' as EventId, {
        occurredAt: '2026-05-16T12:00:00Z' as IsoTimestamp,
      }),
    );

    const runner = new SleepCycleRunner(
      new DynamicsEngine({
        stores: {
          memoryStore: stores.memoryStore,
          conflictRegistry: stores.conflictRegistry,
        },
        policy: createDynamicsPolicy(ACTOR, {
          decay: {
            candidateAfterMs: dayMs(3),
            verifiedAfterMs: dayMs(3),
            trustedAfterMs: dayMs(180),
          },
        }),
        evidenceProvider: new LedgerRecallEvidenceProvider({ eventLedger: stores.eventLedger }),
      }),
    );

    const report = await runner.run(input({ cycleId: 'cycle-ledger', applyTransitions: true }));

    expect(report.appliedMemoryIds).toEqual(['mem-ledger-promotable', 'mem-ledger-stale']);
    expect((await stores.memoryStore.get(promotable.memoryId, PERMITTED))?.status).toBe('verified');
    expect((await stores.memoryStore.get(stale.memoryId, PERMITTED))?.status).toBe('deprecated');

    const promotableHistory = await stores.memoryStore.statusHistory(promotable.memoryId);
    const staleHistory = await stores.memoryStore.statusHistory(stale.memoryId);
    expect(
      promotableHistory.find(
        (entry) => entry.reason.rationale === 'phase2:promotion_evidence_satisfied',
      ),
    ).toMatchObject({
      at: NOW,
      fromStatus: 'candidate',
      toStatus: 'verified',
      reason: {
        actor: ACTOR,
        rationale: 'phase2:promotion_evidence_satisfied',
      },
    });
    expect(
      staleHistory.find((entry) => entry.reason.rationale === 'phase2:stale_by_policy'),
    ).toMatchObject({
      at: NOW,
      fromStatus: 'verified',
      toStatus: 'deprecated',
      reason: {
        actor: ACTOR,
        rationale: 'phase2:stale_by_policy',
      },
    });
  });

  it('treats requires-human conflicts as sleep-cycle blockers with audited deprecation', async () => {
    const candidate = atom({
      memoryId: 'mem-sqlite-human-candidate' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const verified = atom({
      memoryId: 'mem-sqlite-human-verified' as MemoryId,
      status: 'verified',
      validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });
    const conflict = conflictFor([candidate.memoryId, verified.memoryId]);
    await stores.memoryStore.insert(candidate);
    await stores.memoryStore.insert(verified);
    await stores.conflictRegistry.record(conflict);

    const runner = runnerFor(stores, evidenceProviderFor(99));
    const report = await runner.run(
      input({ cycleId: 'cycle-human-conflict', applyTransitions: true }),
    );

    expect(report.appliedMemoryIds).toEqual([verified.memoryId]);
    expect(report.skippedMemoryIds).toEqual([candidate.memoryId]);
    expect((await stores.memoryStore.get(candidate.memoryId, PERMITTED))?.status).toBe('candidate');
    expect((await stores.memoryStore.get(verified.memoryId, PERMITTED))?.status).toBe('deprecated');

    const history = await stores.memoryStore.statusHistory(verified.memoryId);
    expect(
      history.find((entry) => entry.reason.rationale === 'phase2:unresolved_conflict'),
    ).toMatchObject({
      at: NOW,
      fromStatus: 'verified',
      toStatus: 'deprecated',
      reason: {
        actor: ACTOR,
        conflictId: conflict.conflictId,
        rationale: 'phase2:unresolved_conflict',
      },
    });
  });

  it('returns an empty aggregate for an empty explicit cycle list', async () => {
    const runner = runnerFor(stores, evidenceProviderFor(0));

    const report = await runner.runMany([]);

    expect(report).toEqual({
      reports: [],
      appliedMemoryIds: [],
      plannedMemoryIds: [],
      rejectedMemoryIds: [],
      skippedMemoryIds: [],
      appliedCount: 0,
      plannedCount: 0,
      rejectedCount: 0,
      skippedCount: 0,
    });
  });

  it('runs exactly one tick per explicit cycle input', async () => {
    const engine = new CountingEngine();
    const runner = new SleepCycleRunner(engine);

    await runner.runMany([
      input({ cycleId: 'count-1' }),
      input({ cycleId: 'count-2', permittedVisibilities: [] }),
    ]);

    expect(engine.inputs.map((cycle) => cycle.cycleId)).toEqual(['count-1', 'count-2']);
  });
});

function runnerFor(
  sqliteStores: SqliteStores,
  evidenceProvider: DynamicsEvidenceProvider,
): SleepCycleRunner {
  return new SleepCycleRunner(
    new DynamicsEngine({
      stores: {
        memoryStore: sqliteStores.memoryStore,
        conflictRegistry: sqliteStores.conflictRegistry,
      },
      policy: createDynamicsPolicy(ACTOR, {
        decay: {
          candidateAfterMs: dayMs(3),
          verifiedAfterMs: dayMs(30),
          trustedAfterMs: dayMs(180),
        },
      }),
      evidenceProvider,
    }),
  );
}

function input(
  overrides: Partial<{
    applyTransitions: boolean;
    cycleId: string;
    permittedVisibilities: readonly Visibility[];
  }> = {},
) {
  return {
    cycleId: 'sleep-cycle:test',
    now: NOW,
    scope: { kind: 'local' } as const,
    permittedVisibilities: PERMITTED,
    ...overrides,
  };
}

function evidenceProviderFor(sourceConsistentRecalls: number): DynamicsEvidenceProvider {
  return {
    async evidenceFor() {
      return { sourceConsistentRecalls };
    },
  };
}

function evidenceProviderByMemoryId(recalls: Record<string, number>): DynamicsEvidenceProvider {
  return {
    async evidenceFor(memory) {
      return { sourceConsistentRecalls: recalls[memory.memoryId] ?? 0 };
    },
  };
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-default' as MemoryId,
    memoryType: 'claim',
    content: 'A sleep-cycle claim.',
    sourceAgentId: 'agent-writer' as AgentId,
    sourceEventIds: ['evt-1' as EventId],
    sourceMemoryIds: [],
    scope: { kind: 'local' },
    visibility: VISIBILITY,
    status: 'candidate',
    scores: {
      confidence: 0.2,
      evidence: 0.9,
      authority: 0.8,
      freshness: 0.9,
      stability: 0.8,
      consensus: 0.2,
    },
    validFrom: '2026-05-16T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

function recallEvent(memory: MemoryAtom, eventId: EventId, overrides: Partial<Event> = {}): Event {
  return {
    eventId,
    kind: 'decision',
    agentId: ACTOR,
    occurredAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
    payload: sourceConsistentRecallPayload(memory),
    scope: { kind: 'local' },
    visibility: VISIBILITY,
    ...overrides,
  };
}

function conflictFor(memoryIds: readonly MemoryId[]): ConflictRecord {
  return {
    conflictId: 'conflict-requires-human' as ConflictId,
    topic: 'operator approval needed',
    scope: { kind: 'local' },
    claims: memoryIds.map((memoryId, index) => ({
      memoryId,
      value: `claim-${index}`,
      authority: 0.8,
      freshness: 'current',
    })),
    status: 'requires_human',
    decisionPolicy: 'ask_human',
    recordedAt: '2026-05-16T00:00:00Z' as IsoTimestamp,
    resolvedAt: null,
  };
}

function dayMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

class CountingEngine {
  readonly inputs: ReturnType<typeof input>[] = [];

  async tick(cycleInput: ReturnType<typeof input>) {
    this.inputs.push(cycleInput);
    return {
      outcome: 'ok' as const,
      now: cycleInput.now,
      scope: cycleInput.scope,
      reasons: [],
      decisions: [],
      appliedCount: 0,
      plannedCount: 0,
      rejectedCount: 0,
      skippedCount: 0,
    };
  }
}
