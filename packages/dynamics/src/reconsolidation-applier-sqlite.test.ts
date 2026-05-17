import type {
  AgentId,
  ConflictId,
  Event,
  EventId,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  Scope,
  Visibility,
} from '@aletheia-labs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from '../../store-sqlite/src/index.js';
import { ReconsolidationApplier } from './reconsolidation-planner.js';

const ACTOR = 'agent-reconsolidator' as AgentId;
const HUMAN = 'agent-human-reviewer' as AgentId;
const NOW = '2026-05-17T05:30:00Z' as IsoTimestamp;
const CONFIRMED_AT = '2026-05-17T06:00:00Z' as IsoTimestamp;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const VISIBILITY: Visibility = { kind: 'private:user' };
const PERMITTED: readonly Visibility[] = [VISIBILITY];

describe('ReconsolidationApplier with SQLite stores', () => {
  let stores: SqliteStores;

  beforeEach(() => {
    stores = openSqliteStores(':memory:');
  });

  afterEach(() => {
    stores.close();
  });

  it('requires explicit human confirmation before mutating memory', async () => {
    await stores.memoryStore.insert(atom());
    await stores.eventLedger.append(event());
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(input());

    expect(result.outcome).toBe('ask_human');
    expect(result.reasons).toEqual(['human_confirmation_required']);
    expect(await stores.memoryStore.get('mem-next' as MemoryId, PERMITTED)).toBeNull();
    expect((await stores.memoryStore.get('mem-prev' as MemoryId, PERMITTED))?.status).toBe(
      'verified',
    );
  });

  it('validates human confirmation before inserting a successor', async () => {
    await stores.memoryStore.insert(atom());
    await stores.eventLedger.append(event());
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(
      input({
        humanConfirmation: {
          confirmedBy: HUMAN,
          confirmedAt: 'not-a-date' as IsoTimestamp,
          rationale: 'reviewed fixture',
        },
      }),
    );

    expect(result.outcome).toBe('ask_human');
    expect(result.reasons).toEqual(['invalid_human_confirmation']);
    expect(await stores.memoryStore.get('mem-next' as MemoryId, PERMITTED)).toBeNull();
    expect((await stores.memoryStore.get('mem-prev' as MemoryId, PERMITTED))?.status).toBe(
      'verified',
    );
  });

  it('inserts a candidate successor and deprecates the previous atom with audit history', async () => {
    await stores.memoryStore.insert(atom());
    await stores.eventLedger.append(event());
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(input({ humanConfirmation: confirmation() }));

    expect(result.outcome).toBe('applied');
    expect(result.successorAtom).toMatchObject({
      memoryId: 'mem-next',
      status: 'candidate',
      sourceMemoryIds: ['mem-prev'],
      links: [{ relation: 'supersedes', targetMemoryId: 'mem-prev' }],
    });
    expect((await stores.memoryStore.get('mem-prev' as MemoryId, PERMITTED))?.status).toBe(
      'deprecated',
    );

    const history = await stores.memoryStore.statusHistory('mem-prev' as MemoryId);
    expect(history.find((entry) => entry.toStatus === 'deprecated')).toMatchObject({
      at: CONFIRMED_AT,
      fromStatus: 'verified',
      toStatus: 'deprecated',
      reason: {
        actor: HUMAN,
        rationale: 'phase2:reconsolidated_by:mem-next; human_confirmed: reviewed fixture',
      },
    });
  });

  it('does not deprecate the previous atom when successor insertion fails', async () => {
    await stores.memoryStore.insert(atom());
    await stores.memoryStore.insert(atom({ memoryId: 'mem-next' as MemoryId }));
    await stores.eventLedger.append(event());
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(input({ humanConfirmation: confirmation() }));

    expect(result.outcome).toBe('rejected');
    expect(result.reasons).toEqual(['successor_insert_failed']);
    expect((await stores.memoryStore.get('mem-prev' as MemoryId, PERMITTED))?.status).toBe(
      'verified',
    );
  });

  it('fails closed without mutation when unresolved conflict touches the previous atom', async () => {
    await stores.memoryStore.insert(atom());
    await stores.eventLedger.append(event());
    await stores.conflictRegistry.record({
      conflictId: 'conflict-reconsolidation' as ConflictId,
      topic: 'old claim',
      scope: SCOPE,
      claims: [
        {
          memoryId: 'mem-prev' as MemoryId,
          value: 'old',
          authority: 0.7,
          freshness: 'current',
        },
        {
          memoryId: 'mem-other' as MemoryId,
          value: 'other',
          authority: 0.7,
          freshness: 'current',
        },
      ],
      status: 'unresolved',
      decisionPolicy: 'surface_conflict',
      recordedAt: NOW,
      resolvedAt: null,
    });
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(input({ humanConfirmation: confirmation() }));

    expect(result.outcome).toBe('fetch_abstain');
    expect(result.reasons).toEqual(['unresolved_conflict']);
    expect(await stores.memoryStore.get('mem-next' as MemoryId, PERMITTED)).toBeNull();
    expect((await stores.memoryStore.get('mem-prev' as MemoryId, PERMITTED))?.status).toBe(
      'verified',
    );
  });
});

function input(overrides: Partial<Parameters<ReconsolidationApplier['apply']>[0]> = {}) {
  return {
    previousMemoryId: 'mem-prev' as MemoryId,
    successorMemoryId: 'mem-next' as MemoryId,
    proposedBy: ACTOR,
    proposedAt: NOW,
    memoryType: 'claim' as const,
    claim: 'Aletheia should reconsolidate through explicit successor atoms.',
    sourceEventIds: ['evt-new' as EventId],
    scope: SCOPE,
    permittedVisibilities: PERMITTED,
    ...overrides,
  };
}

function confirmation() {
  return {
    confirmedBy: HUMAN,
    confirmedAt: CONFIRMED_AT,
    rationale: 'reviewed fixture',
  };
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-prev' as MemoryId,
    memoryType: 'claim',
    content: 'Old claim.',
    sourceAgentId: 'agent-writer' as AgentId,
    sourceEventIds: ['evt-old' as EventId],
    sourceMemoryIds: [],
    scope: SCOPE,
    visibility: VISIBILITY,
    status: 'verified',
    scores: {
      confidence: 0.3,
      evidence: 0.8,
      authority: 0.6,
      freshness: 0.8,
      stability: 0.7,
      consensus: 0.2,
    },
    validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    eventId: 'evt-new' as EventId,
    kind: 'observation',
    agentId: ACTOR,
    occurredAt: NOW,
    payload: { claim_of: 'new evidence' },
    scope: SCOPE,
    visibility: VISIBILITY,
    ...overrides,
  };
}
