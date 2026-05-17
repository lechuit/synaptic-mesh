import type {
  AgentId,
  ConflictId,
  ConflictQuery,
  ConflictRecord,
  ConflictRegistry,
  ConflictStatus,
  Event,
  EventId,
  EventLedger,
  EventQuery,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  MemoryQuery,
  MemoryStatus,
  MemoryStore,
  ResolveReason,
  Scope,
  StatusTransitionReason,
  StatusTransitionResult,
  Visibility,
} from '@aletheia/core';
import { scopeKey, visibilityKey } from '@aletheia/core';
import { describe, expect, it } from 'vitest';
import { ReconsolidationApplier, ReconsolidationPlanner } from './reconsolidation-planner.js';

const ACTOR = 'agent-reconsolidator' as AgentId;
const NOW = '2026-05-17T05:30:00Z' as IsoTimestamp;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const OTHER_SCOPE: Scope = { kind: 'project', projectId: 'other' };
const VISIBILITY: Visibility = { kind: 'private:user' };
const PERMITTED: readonly Visibility[] = [VISIBILITY];

describe('ReconsolidationPlanner', () => {
  it('plans a candidate successor with supersedes lineage and no mutation', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId, status: 'verified' });
    const newEvent = event({ eventId: 'evt-new' as EventId });
    const stores = storesFor({ atoms: [previous], events: [newEvent] });
    const planner = new ReconsolidationPlanner(stores);

    const result = await planner.plan(input());

    expect(result.outcome).toBe('plan');
    expect(result.successorDraft).toMatchObject({
      memoryId: 'mem-next',
      status: 'candidate',
      scope: previous.scope,
      visibility: previous.visibility,
      sourceMemoryIds: [previous.memoryId],
      sourceEventIds: [newEvent.eventId],
      links: [{ relation: 'supersedes', targetMemoryId: previous.memoryId }],
    });
    expect(result.plannedTransitions).toEqual([
      {
        memoryId: previous.memoryId,
        nextStatus: 'deprecated',
        reason: {
          actor: ACTOR,
          rationale: 'phase2:reconsolidated_by:mem-next',
        },
      },
    ]);
    expect(stores.memoryStore.insertCalls).toBe(0);
    expect(stores.memoryStore.transitionCalls).toBe(0);
  });

  it('fails closed before store reads when no visibility is permitted', async () => {
    const stores = storesFor({
      atoms: [atom({ memoryId: 'mem-prev' as MemoryId })],
      events: [event({ eventId: 'evt-new' as EventId })],
    });
    const planner = new ReconsolidationPlanner(stores);

    const result = await planner.plan(input({ permittedVisibilities: [] }));

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['no_permitted_visibilities'],
      successorDraft: null,
    });
    expect(stores.memoryStore.getCalls).toBe(0);
    expect(stores.eventLedger.getCalls).toBe(0);
    expect(stores.conflictRegistry.queryCalls).toBe(0);
  });

  it('fails closed when previous memory is missing or invisible', async () => {
    const planner = new ReconsolidationPlanner(
      storesFor({ atoms: [], events: [event({ eventId: 'evt-new' as EventId })] }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['previous_memory_missing_or_invisible'],
      previousAtom: null,
      successorDraft: null,
    });
  });

  it('fails closed when the requested scope does not match the previous memory', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId, scope: OTHER_SCOPE });
    const planner = new ReconsolidationPlanner(
      storesFor({ atoms: [previous], events: [event({ eventId: 'evt-new' as EventId })] }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['previous_memory_missing_or_invisible'],
      successorDraft: null,
    });
  });

  it('fails closed when a new source event is missing or invisible', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const planner = new ReconsolidationPlanner(storesFor({ atoms: [previous], events: [] }));

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['source_event_missing_or_invisible'],
      successorDraft: null,
    });
  });

  it('fails closed when a new source event is outside the previous memory scope', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const newEvent = event({ eventId: 'evt-new' as EventId, scope: OTHER_SCOPE });
    const planner = new ReconsolidationPlanner(
      storesFor({ atoms: [previous], events: [newEvent] }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['source_event_scope_mismatch'],
      successorDraft: null,
    });
    expect(result.sourceEvents).toEqual([]);
  });

  it('fails closed when source event ids are empty', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const planner = new ReconsolidationPlanner(storesFor({ atoms: [previous], events: [] }));

    const result = await planner.plan(input({ sourceEventIds: [] }));

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['empty_source_events'],
      previousAtom: null,
      sourceEvents: [],
      successorDraft: null,
    });
  });

  it('fails closed when a source event exists but is not visible', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const hiddenEvent = event({
      eventId: 'evt-new' as EventId,
      visibility: { kind: 'team', name: 'hidden' },
    });
    const planner = new ReconsolidationPlanner(
      storesFor({ atoms: [previous], events: [hiddenEvent] }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['source_event_missing_or_invisible'],
      successorDraft: null,
    });
  });

  it('fails closed when unresolved conflicts touch the previous memory', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const conflict = conflictFor(previous.memoryId);
    const planner = new ReconsolidationPlanner(
      storesFor({
        atoms: [previous],
        events: [event({ eventId: 'evt-new' as EventId })],
        conflicts: [conflict],
      }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['unresolved_conflict'],
      successorDraft: null,
      relatedConflictIds: [conflict.conflictId],
    });
  });

  it('fails closed for requires-human conflicts touching the previous memory', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId });
    const conflict = conflictFor(previous.memoryId, 'requires_human');
    const planner = new ReconsolidationPlanner(
      storesFor({
        atoms: [previous],
        events: [event({ eventId: 'evt-new' as EventId })],
        conflicts: [conflict],
      }),
    );

    const result = await planner.plan(input());

    expect(result).toMatchObject({
      outcome: 'fetch_abstain',
      reasons: ['unresolved_conflict'],
      successorDraft: null,
      relatedConflictIds: [conflict.conflictId],
    });
  });

  it('does not reconsolidate sealed or human-required memories', async () => {
    for (const status of ['sealed', 'human_required'] as const) {
      const previous = atom({ memoryId: `mem-${status}` as MemoryId, status });
      const planner = new ReconsolidationPlanner(
        storesFor({ atoms: [previous], events: [event({ eventId: 'evt-new' as EventId })] }),
      );

      const result = await planner.plan(
        input({
          previousMemoryId: previous.memoryId,
          successorMemoryId: `mem-${status}-next` as MemoryId,
        }),
      );

      expect(result).toMatchObject({
        outcome: 'fetch_abstain',
        reasons: ['previous_status_not_reconsolidatable'],
        successorDraft: null,
      });
    }
  });

  it('does not plan a redundant deprecation for already-deprecated previous memory', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId, status: 'deprecated' });
    const planner = new ReconsolidationPlanner(
      storesFor({ atoms: [previous], events: [event({ eventId: 'evt-new' as EventId })] }),
    );

    const result = await planner.plan(input());

    expect(result.outcome).toBe('plan');
    expect(result.plannedTransitions).toEqual([]);
    expect(result.successorDraft?.links).toEqual([
      { relation: 'supersedes', targetMemoryId: previous.memoryId },
    ]);
  });

  it('reports partial apply when successor insertion succeeds but transition rejects', async () => {
    const previous = atom({ memoryId: 'mem-prev' as MemoryId, status: 'verified' });
    const newEvent = event({ eventId: 'evt-new' as EventId });
    const stores = storesFor({ atoms: [previous], events: [newEvent] });
    const applier = new ReconsolidationApplier(stores);

    const result = await applier.apply(
      input({
        humanConfirmation: {
          confirmedBy: ACTOR,
          confirmedAt: NOW,
          rationale: 'fake store transition rejection fixture',
        },
      }),
    );

    expect(result.outcome).toBe('partial_applied');
    expect(result.reasons).toEqual(['transition_rejected']);
    expect(result.successorAtom?.memoryId).toBe('mem-next');
    expect(result.transitionResults).toEqual([
      { kind: 'rejected', reason: 'planner should not transition' },
    ]);
    expect(stores.memoryStore.insertCalls).toBe(1);
    expect(stores.memoryStore.transitionCalls).toBe(1);
  });
});

function input(overrides: Partial<Parameters<ReconsolidationPlanner['plan']>[0]> = {}) {
  return {
    previousMemoryId: 'mem-prev' as MemoryId,
    successorMemoryId: 'mem-next' as MemoryId,
    proposedBy: ACTOR,
    proposedAt: NOW,
    memoryType: 'claim' as const,
    claim: 'Aletheia should reconsolidate through explicit successor plans.',
    sourceEventIds: ['evt-new' as EventId],
    scope: SCOPE,
    permittedVisibilities: PERMITTED,
    ...overrides,
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

function conflictFor(memoryId: MemoryId, status: ConflictStatus = 'unresolved'): ConflictRecord {
  return {
    conflictId: 'conflict-reconsolidation' as ConflictId,
    topic: 'old claim',
    scope: SCOPE,
    claims: [
      { memoryId, value: 'old', authority: 0.5, freshness: 'current' },
      { memoryId: 'mem-other' as MemoryId, value: 'other', authority: 0.5, freshness: 'current' },
    ],
    status,
    decisionPolicy: 'surface_conflict',
    recordedAt: NOW,
    resolvedAt: null,
  };
}

function storesFor(options: {
  atoms: readonly MemoryAtom[];
  events: readonly Event[];
  conflicts?: readonly ConflictRecord[];
}): {
  eventLedger: FakeEventLedger;
  memoryStore: FakeMemoryStore;
  conflictRegistry: FakeConflictRegistry;
} {
  return {
    eventLedger: new FakeEventLedger(options.events),
    memoryStore: new FakeMemoryStore(options.atoms),
    conflictRegistry: new FakeConflictRegistry(options.conflicts ?? []),
  };
}

class FakeEventLedger implements EventLedger {
  getCalls = 0;
  private readonly events = new Map<EventId, Event>();

  constructor(events: readonly Event[]) {
    for (const eventValue of events) {
      this.events.set(eventValue.eventId, eventValue);
    }
  }

  async append(eventValue: Event): Promise<EventId> {
    this.events.set(eventValue.eventId, eventValue);
    return eventValue.eventId;
  }

  async get(eventId: EventId, permittedVisibilities: readonly Visibility[]): Promise<Event | null> {
    this.getCalls += 1;
    const eventValue = this.events.get(eventId);
    if (eventValue === undefined) return null;
    const permitted = new Set(permittedVisibilities.map(visibilityKey));
    return permitted.has(visibilityKey(eventValue.visibility)) ? eventValue : null;
  }

  async query(filter: EventQuery): Promise<readonly Event[]> {
    if (filter.permittedVisibilities.length === 0) return [];
    return [...this.events.values()];
  }

  async count(filter: EventQuery): Promise<number> {
    return (await this.query(filter)).length;
  }
}

class FakeMemoryStore implements MemoryStore {
  getCalls = 0;
  insertCalls = 0;
  transitionCalls = 0;
  private readonly atoms = new Map<MemoryId, MemoryAtom>();

  constructor(atoms: readonly MemoryAtom[]) {
    for (const atomValue of atoms) {
      this.atoms.set(atomValue.memoryId, atomValue);
    }
  }

  async insert(atomValue: MemoryAtom): Promise<MemoryAtom> {
    this.insertCalls += 1;
    this.atoms.set(atomValue.memoryId, atomValue);
    return atomValue;
  }

  async get(
    memoryId: MemoryId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<MemoryAtom | null> {
    this.getCalls += 1;
    const atomValue = this.atoms.get(memoryId);
    if (atomValue === undefined) return null;
    const permitted = new Set(permittedVisibilities.map(visibilityKey));
    return permitted.has(visibilityKey(atomValue.visibility)) ? atomValue : null;
  }

  async query(filter: MemoryQuery): Promise<readonly MemoryAtom[]> {
    if (filter.permittedVisibilities.length === 0) return [];
    return [...this.atoms.values()];
  }

  async transitionStatus(
    memoryId: MemoryId,
    nextStatus: MemoryStatus,
    reason: StatusTransitionReason,
  ): Promise<StatusTransitionResult> {
    this.transitionCalls += 1;
    void memoryId;
    void nextStatus;
    void reason;
    return { kind: 'rejected', reason: 'planner should not transition' };
  }

  async statusHistory(): Promise<readonly []> {
    return [];
  }
}

class FakeConflictRegistry implements ConflictRegistry {
  queryCalls = 0;

  constructor(private readonly conflicts: readonly ConflictRecord[]) {}

  async record(conflict: ConflictRecord): Promise<ConflictRecord> {
    return conflict;
  }

  async get(
    conflictId: ConflictId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<ConflictRecord | null> {
    if (permittedVisibilities.length === 0) return null;
    return this.conflicts.find((conflict) => conflict.conflictId === conflictId) ?? null;
  }

  async query(filter: ConflictQuery): Promise<readonly ConflictRecord[]> {
    this.queryCalls += 1;
    if (filter.permittedVisibilities.length === 0) return [];
    let result = [...this.conflicts];
    if (filter.statuses !== undefined && filter.statuses.length > 0) {
      result = result.filter((conflict) => filter.statuses?.includes(conflict.status) ?? false);
    }
    if (filter.scope !== undefined) {
      const targetScope = scopeKey(filter.scope);
      result = result.filter((conflict) => scopeKey(conflict.scope) === targetScope);
    }
    if (filter.touchingMemoryIds !== undefined && filter.touchingMemoryIds.length > 0) {
      const touching = new Set(filter.touchingMemoryIds);
      result = result.filter((conflict) =>
        conflict.claims.some((claim) => touching.has(claim.memoryId)),
      );
    }
    return result;
  }

  async resolve(
    conflictId: ConflictId,
    nextStatus: Exclude<ConflictStatus, 'unresolved'>,
    reason: ResolveReason,
  ): Promise<ConflictRecord | null> {
    void conflictId;
    void nextStatus;
    void reason;
    return null;
  }

  async resolutionHistory(): Promise<readonly []> {
    return [];
  }
}
