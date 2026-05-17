import type {
  AgentId,
  Event,
  EventId,
  EventLedger,
  EventQuery,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  Scope,
  Visibility,
} from '@aletheia/core';
import { scopeKey, visibilityKey } from '@aletheia/core';
import { describe, expect, it } from 'vitest';
import { LedgerRecallEvidenceProvider, sourceConsistentRecallPayload } from './recall-evidence.js';

const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const VISIBILITY: Visibility = { kind: 'private:user' };
const NOW = '2026-05-17T00:00:00Z' as IsoTimestamp;

describe('LedgerRecallEvidenceProvider', () => {
  it('counts only visible source-consistent recall events for the target atom', async () => {
    const memory = atom();
    const provider = new LedgerRecallEvidenceProvider({
      eventLedger: new FakeEventLedger([
        recallEvent(memory, 'evt-recall-1' as EventId, '2026-05-16T00:00:00Z' as IsoTimestamp),
        recallEvent(memory, 'evt-recall-2' as EventId, '2026-05-16T12:00:00Z' as IsoTimestamp),
        recallEvent(
          atom({ memoryId: 'mem-other' as MemoryId }),
          'evt-other-memory' as EventId,
          '2026-05-16T13:00:00Z' as IsoTimestamp,
        ),
        recallEvent(memory, 'evt-hidden' as EventId, '2026-05-16T14:00:00Z' as IsoTimestamp, {
          visibility: { kind: 'team', name: 'hidden' },
        }),
        recallEvent(
          memory,
          'evt-outside-scope' as EventId,
          '2026-05-16T15:00:00Z' as IsoTimestamp,
          {
            scope: { kind: 'project', projectId: 'other' },
          },
        ),
      ]),
    });

    const evidence = await provider.evidenceFor(memory, {
      now: NOW,
      scope: SCOPE,
      permittedVisibilities: [VISIBILITY],
    });

    expect(evidence).toEqual({
      sourceConsistentRecalls: 2,
      sourceConsistentSince: '2026-05-16T00:00:00Z',
      lastUsedAt: '2026-05-16T12:00:00Z',
    });
  });

  it('ignores recall events missing complete source coverage', async () => {
    const memory = atom({ sourceEventIds: ['evt-source-a' as EventId, 'evt-source-b' as EventId] });
    const event = recallEvent(memory, 'evt-incomplete' as EventId, NOW);
    const provider = new LedgerRecallEvidenceProvider({
      eventLedger: new FakeEventLedger([
        {
          ...event,
          payload: {
            ...sourceConsistentRecallPayload(memory),
            sourceEventIds: ['evt-source-a' as EventId],
          },
        },
      ]),
    });

    const evidence = await provider.evidenceFor(memory, {
      now: NOW,
      scope: SCOPE,
      permittedVisibilities: [VISIBILITY],
    });

    expect(evidence.sourceConsistentRecalls).toBe(0);
    expect(evidence.lastUsedAt).toBeUndefined();
  });
});

function recallEvent(
  memory: MemoryAtom,
  eventId: EventId,
  occurredAt: IsoTimestamp,
  overrides: Partial<Event> = {},
): Event {
  return {
    eventId,
    kind: 'decision',
    agentId: 'agent-recall' as AgentId,
    occurredAt,
    payload: sourceConsistentRecallPayload(memory),
    scope: SCOPE,
    visibility: VISIBILITY,
    ...overrides,
  };
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: 'mem-recalled' as MemoryId,
    memoryType: 'claim',
    content: 'Aletheia recall evidence is source-consistent.',
    sourceAgentId: 'agent-writer' as AgentId,
    sourceEventIds: ['evt-source' as EventId],
    sourceMemoryIds: [],
    scope: SCOPE,
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
    validFrom: '2026-05-15T00:00:00Z' as IsoTimestamp,
    validUntil: null,
    lastConfirmedAt: null,
    links: [],
    ...overrides,
  };
}

class FakeEventLedger implements EventLedger {
  constructor(private readonly events: readonly Event[]) {}

  async append(event: Event): Promise<EventId> {
    void event;
    throw new Error('not implemented');
  }

  async get(eventId: EventId, permittedVisibilities: readonly Visibility[]): Promise<Event | null> {
    void eventId;
    void permittedVisibilities;
    throw new Error('not implemented');
  }

  async query(filter: EventQuery): Promise<readonly Event[]> {
    const permitted = new Set(filter.permittedVisibilities.map(visibilityKey));
    return this.events
      .filter((event) => permitted.has(visibilityKey(event.visibility)))
      .filter((event) =>
        filter.scope !== undefined ? scopeKey(event.scope) === scopeKey(filter.scope) : true,
      )
      .filter((event) => (filter.since !== undefined ? event.occurredAt >= filter.since : true))
      .filter((event) => (filter.until !== undefined ? event.occurredAt <= filter.until : true))
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  }

  async count(filter: EventQuery): Promise<number> {
    return (await this.query(filter)).length;
  }
}
