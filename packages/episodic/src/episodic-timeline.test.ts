import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type AgentId,
  type Event,
  type EventId,
  type EventLedger,
  type IsoTimestamp,
  type MemoryAtom,
  type MemoryId,
  type MemoryStore,
  type Scope,
  type Visibility,
  staticVisibilityPolicy,
} from '@aletheia-labs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type SqliteStores, openSqliteStores } from '../../store-sqlite/src/index.js';
import { EpisodicTimeline, episodeAnchorFromEvent } from './episodic-timeline.js';

const AGENT = 'agent-episodic' as AgentId;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia' };
const OTHER_SCOPE: Scope = { kind: 'project', projectId: 'other' };
const VISIBILITY: Visibility = { kind: 'private:user' };
const HIDDEN_VISIBILITY: Visibility = { kind: 'private:agent' };

describe('EpisodicTimeline', () => {
  let stores: SqliteStores;

  beforeEach(() => {
    stores = openSqliteStores(':memory:');
  });

  afterEach(() => {
    stores.close();
  });

  it('fails closed before reading stores when visibility is denied', async () => {
    const timeline = new EpisodicTimeline({
      eventLedger: stores.eventLedger,
      memoryStore: stores.memoryStore,
    });

    const snapshot = await timeline.beliefsAt({
      agentId: AGENT,
      scope: SCOPE,
      asOf: '2026-05-17T00:00:00Z' as IsoTimestamp,
    });

    expect(snapshot.decision.outcome).toBe('fetch_abstain');
    expect(snapshot.decision.reasons).toEqual([
      {
        kind: 'visibility_denied',
        detail: 'caller has no permitted visibility planes',
      },
    ]);
    expect(snapshot.atoms).toEqual([]);
  });

  it('lists only visible in-scope explicit episodes in chronological order', async () => {
    await stores.eventLedger.append(
      event({
        eventId: 'evt-session-later' as EventId,
        episodeId: 'session-b',
        episodeKind: 'session',
        occurredAt: '2026-05-12T00:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-conversation-earlier' as EventId,
        episodeId: 'conversation-a',
        occurredAt: '2026-05-10T00:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-conversation-hidden' as EventId,
        episodeId: 'conversation-hidden',
        visibility: HIDDEN_VISIBILITY,
        occurredAt: '2026-05-09T00:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-conversation-other-scope' as EventId,
        episodeId: 'conversation-other-scope',
        scope: OTHER_SCOPE,
        occurredAt: '2026-05-08T00:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append({
      ...event({
        eventId: 'evt-malformed-catalog' as EventId,
        episodeId: 'conversation-malformed',
      }),
      payload: { episodic: { episodeId: 'conversation-malformed' } },
    });

    const catalog = await timeline().listEpisodes({
      agentId: AGENT,
      scope: SCOPE,
    });
    const conversations = await timeline().listEpisodes({
      agentId: AGENT,
      scope: SCOPE,
      kind: 'conversation',
    });

    expect(catalog.decision.outcome).toBe('allow_local_shadow');
    expect(catalog.episodes.map((episode) => episode.episodeId)).toEqual([
      'conversation-a',
      'session-b',
    ]);
    expect(catalog.events.map((episodeEvent) => episodeEvent.event.eventId)).toEqual([
      'evt-conversation-earlier',
      'evt-session-later',
    ]);
    expect(conversations.episodes.map((episode) => episode.episodeId)).toEqual(['conversation-a']);
  });

  it('projects memories from a visible episode without leaking hidden or out-of-scope anchors', async () => {
    const visibleEvent = event({
      eventId: 'evt-visible' as EventId,
      episodeId: 'conversation-a',
    });
    const hiddenEvent = event({
      eventId: 'evt-hidden' as EventId,
      episodeId: 'conversation-a',
      visibility: HIDDEN_VISIBILITY,
    });
    const outOfScopeEvent = event({
      eventId: 'evt-other-scope' as EventId,
      episodeId: 'conversation-a',
      scope: OTHER_SCOPE,
    });
    await stores.eventLedger.append(visibleEvent);
    await stores.eventLedger.append(hiddenEvent);
    await stores.eventLedger.append(outOfScopeEvent);
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-visible' as MemoryId,
        sourceEventIds: [visibleEvent.eventId],
      }),
    );
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-hidden-source' as MemoryId,
        sourceEventIds: [hiddenEvent.eventId],
      }),
    );
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-other-scope' as MemoryId,
        sourceEventIds: [outOfScopeEvent.eventId],
        scope: OTHER_SCOPE,
      }),
    );

    const result = await timeline().episodeMemories({
      agentId: AGENT,
      scope: SCOPE,
      episodeId: 'conversation-a',
      asOf: '2100-01-01T00:00:00Z' as IsoTimestamp,
    });

    expect(result.decision.outcome).toBe('allow_local_shadow');
    expect(result.events.map((episodeEvent) => episodeEvent.event.eventId)).toEqual([
      'evt-visible',
    ]);
    expect(result.atoms.map((memory) => memory.memoryId)).toEqual(['mem-visible']);
    expect(result.episode?.memoryIds).toEqual(['mem-visible']);
  });

  it('reconstructs historical belief status from audit history, not current atom status', async () => {
    const sourceEvent = event({
      eventId: 'evt-belief' as EventId,
      episodeId: 'conversation-belief',
      occurredAt: '2026-05-02T09:00:00Z' as IsoTimestamp,
    });
    const memory = atom({
      memoryId: 'mem-changing-belief' as MemoryId,
      sourceEventIds: [sourceEvent.eventId],
      status: 'candidate',
      content: 'User prefers quiet mornings with coffee.',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    await stores.eventLedger.append(sourceEvent);
    await stores.memoryStore.insert(memory);
    await stores.memoryStore.transitionStatus(
      memory.memoryId,
      'verified',
      { actor: AGENT, rationale: 'historical verification' },
      { at: '2026-05-02T10:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      memory.memoryId,
      'deprecated',
      { actor: AGENT, rationale: 'later correction' },
      { at: '2026-05-15T10:00:00Z' as IsoTimestamp },
    );

    const historical = await timeline().beliefsAt({
      agentId: AGENT,
      scope: SCOPE,
      asOf: '2026-05-10T00:00:00Z' as IsoTimestamp,
      contentIncludes: 'coffee',
    });
    const current = await timeline().selfState({
      agentId: AGENT,
      scope: SCOPE,
      at: '2026-05-16T00:00:00Z' as IsoTimestamp,
    });

    expect(historical.atoms.map((atom) => atom.memoryId)).toEqual(['mem-changing-belief']);
    expect(historical.statusesAt).toEqual([
      {
        memoryId: 'mem-changing-belief',
        status: 'verified',
        at: '2026-05-10T00:00:00Z',
      },
    ]);
    expect(current.distrusted.map((atom) => atom.memoryId)).toEqual(['mem-changing-belief']);
  });

  it('returns a permission-guarded timeline for one visible memory', async () => {
    const memory = atom({
      memoryId: 'mem-timeline' as MemoryId,
      status: 'candidate',
    });
    await stores.memoryStore.insert(memory);
    await stores.memoryStore.transitionStatus(
      memory.memoryId,
      'verified',
      { actor: AGENT, rationale: 'first confirmation' },
      { at: '2026-05-02T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      memory.memoryId,
      'deprecated',
      { actor: AGENT, rationale: 'later correction' },
      { at: '2026-05-12T00:00:00Z' as IsoTimestamp },
    );

    const result = await timeline().memoryTimeline({
      agentId: AGENT,
      scope: SCOPE,
      memoryId: memory.memoryId,
      until: '2026-05-10T00:00:00Z' as IsoTimestamp,
    });

    expect(result.decision.outcome).toBe('allow_local_shadow');
    expect(result.atom?.memoryId).toBe('mem-timeline');
    expect(result.history.map((entry) => entry.toStatus)).toEqual(['verified']);
  });

  it('does not leak a visible memory timeline across scope boundaries', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-other-scope-timeline' as MemoryId,
        scope: OTHER_SCOPE,
      }),
    );

    const result = await timeline().memoryTimeline({
      agentId: AGENT,
      scope: SCOPE,
      memoryId: 'mem-other-scope-timeline' as MemoryId,
    });

    expect(result.decision.outcome).toBe('fetch_abstain');
    expect(result.decision.reasons).toEqual([
      {
        kind: 'source_check_failed',
        detail: 'memory is missing, not visible, or outside requested scope',
      },
    ]);
    expect(result.atom).toBeNull();
    expect(result.history).toEqual([]);
  });

  it('excludes atoms with no audited status at the requested historical time', async () => {
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-future-current-status' as MemoryId,
        status: 'trusted',
        validFrom: '2000-01-01T00:00:00Z' as IsoTimestamp,
      }),
    );

    const past = await timeline().beliefsAt({
      agentId: AGENT,
      scope: SCOPE,
      asOf: '2001-01-01T00:00:00Z' as IsoTimestamp,
    });

    expect(past.decision.outcome).toBe('fetch_abstain');
    expect(past.decision.reasons).toEqual([
      { kind: 'tuple_incomplete', missingFields: ['memoryAtoms'] },
    ]);
    expect(past.atoms).toEqual([]);
    expect(past.statusesAt).toEqual([]);
  });

  it('compares two episodes by reconstructing belief snapshots at each episode boundary', async () => {
    await stores.eventLedger.append(
      event({
        eventId: 'evt-session-a' as EventId,
        episodeId: 'session-a',
        episodeKind: 'session',
        occurredAt: '2026-05-03T12:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-session-b' as EventId,
        episodeId: 'session-b',
        episodeKind: 'session',
        occurredAt: '2026-05-12T12:00:00Z' as IsoTimestamp,
      }),
    );
    const persisted = atom({
      memoryId: 'mem-persisted' as MemoryId,
      sourceEventIds: ['evt-session-a' as EventId],
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const added = atom({
      memoryId: 'mem-added' as MemoryId,
      sourceEventIds: ['evt-session-b' as EventId],
      status: 'candidate',
      validFrom: '2026-05-11T00:00:00Z' as IsoTimestamp,
    });
    await stores.memoryStore.insert(persisted);
    await stores.memoryStore.insert(added);
    await stores.memoryStore.transitionStatus(
      persisted.memoryId,
      'verified',
      { actor: AGENT, rationale: 'session-a belief' },
      { at: '2026-05-02T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      persisted.memoryId,
      'trusted',
      { actor: AGENT, rationale: 'session-b stronger evidence' },
      { at: '2026-05-10T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      added.memoryId,
      'verified',
      { actor: AGENT, rationale: 'session-b belief' },
      { at: '2026-05-11T00:00:00Z' as IsoTimestamp },
    );

    const comparison = await timeline().compareEpisodes({
      agentId: AGENT,
      scope: SCOPE,
      fromEpisodeId: 'session-a',
      toEpisodeId: 'session-b',
    });

    expect(comparison.decision.outcome).toBe('allow_local_shadow');
    expect(comparison.addedMemoryIds).toEqual(['mem-added']);
    expect(comparison.removedMemoryIds).toEqual([]);
    expect(comparison.persistedMemoryIds).toEqual(['mem-persisted']);
    expect(comparison.statusChanged).toEqual([
      {
        memoryId: 'mem-persisted',
        fromStatus: 'verified',
        toStatus: 'trusted',
      },
    ]);
  });

  it('keeps self-state categories explicit after reopening a SQLite store', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'aletheia-episodic-'));
    const dbPath = join(tmp, 'memory.sqlite');
    const firstStores = openSqliteStores(dbPath);
    try {
      await firstStores.memoryStore.insert(
        atom({ memoryId: 'mem-belief' as MemoryId, status: 'trusted' }),
      );
      await firstStores.memoryStore.insert(
        atom({ memoryId: 'mem-uncertain' as MemoryId, status: 'candidate' }),
      );
      await firstStores.memoryStore.insert(
        atom({ memoryId: 'mem-distrusted' as MemoryId, status: 'deprecated' }),
      );
      await firstStores.memoryStore.insert(
        atom({ memoryId: 'mem-human' as MemoryId, status: 'human_required' }),
      );
    } finally {
      firstStores.close();
    }

    const reopenedStores = openSqliteStores(dbPath);
    try {
      const state = await timelineFor(reopenedStores).selfState({
        agentId: AGENT,
        scope: SCOPE,
        at: '2100-01-01T00:00:00Z' as IsoTimestamp,
      });

      expect(state.decision.outcome).toBe('allow_local_shadow');
      expect(state.beliefs.map((memory) => memory.memoryId)).toEqual(['mem-belief']);
      expect(state.uncertain.map((memory) => memory.memoryId)).toEqual(['mem-uncertain']);
      expect(state.distrusted.map((memory) => memory.memoryId)).toEqual(['mem-distrusted']);
      expect(state.humanRequired.map((memory) => memory.memoryId)).toEqual(['mem-human']);
    } finally {
      reopenedStores.close();
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('builds a restart continuity brief with recent episodes and status changes', async () => {
    await stores.eventLedger.append(
      event({
        eventId: 'evt-session-a' as EventId,
        episodeId: 'session-a',
        episodeKind: 'session',
        occurredAt: '2026-05-01T12:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-session-b' as EventId,
        episodeId: 'session-b',
        episodeKind: 'session',
        occurredAt: '2026-05-12T12:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-hidden-session' as EventId,
        episodeId: 'session-hidden',
        episodeKind: 'session',
        visibility: HIDDEN_VISIBILITY,
        occurredAt: '2026-05-13T12:00:00Z' as IsoTimestamp,
      }),
    );
    await stores.eventLedger.append(
      event({
        eventId: 'evt-other-scope-session' as EventId,
        episodeId: 'session-other-scope',
        episodeKind: 'session',
        scope: OTHER_SCOPE,
        occurredAt: '2026-05-14T12:00:00Z' as IsoTimestamp,
      }),
    );

    const persisted = atom({
      memoryId: 'mem-continuity-persisted' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    const added = atom({
      memoryId: 'mem-continuity-added' as MemoryId,
      status: 'candidate',
      sourceEventIds: ['evt-session-b' as EventId],
      validFrom: '2026-05-12T00:00:00Z' as IsoTimestamp,
    });
    const removed = atom({
      memoryId: 'mem-continuity-removed' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
      validUntil: '2026-05-10T00:00:00Z' as IsoTimestamp,
    });
    const human = atom({
      memoryId: 'mem-continuity-human' as MemoryId,
      status: 'candidate',
      validFrom: '2026-05-01T00:00:00Z' as IsoTimestamp,
    });
    await stores.memoryStore.insert(persisted);
    await stores.memoryStore.insert(added);
    await stores.memoryStore.insert(removed);
    await stores.memoryStore.insert(human);
    await stores.memoryStore.transitionStatus(
      persisted.memoryId,
      'verified',
      { actor: AGENT, rationale: 'pre-restart belief' },
      { at: '2026-05-02T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      persisted.memoryId,
      'trusted',
      { actor: AGENT, rationale: 'stronger later evidence' },
      { at: '2026-05-13T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      added.memoryId,
      'verified',
      { actor: AGENT, rationale: 'new session belief' },
      { at: '2026-05-12T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      removed.memoryId,
      'verified',
      { actor: AGENT, rationale: 'expired belief before restart' },
      { at: '2026-05-02T00:00:00Z' as IsoTimestamp },
    );
    await stores.memoryStore.transitionStatus(
      human.memoryId,
      'human_required',
      { actor: AGENT, rationale: 'requires operator review' },
      { at: '2026-05-03T00:00:00Z' as IsoTimestamp },
    );

    const brief = await timeline().continuityBrief({
      agentId: AGENT,
      scope: SCOPE,
      since: '2026-05-05T00:00:00Z' as IsoTimestamp,
      at: '2026-05-15T00:00:00Z' as IsoTimestamp,
      episodeKind: 'session',
      episodeLimit: 1,
    });

    expect(brief.decision.outcome).toBe('allow_local_shadow');
    expect(brief.recentEpisodes.map((episode) => episode.episodeId)).toEqual(['session-b']);
    expect(brief.selfState.beliefs.map((memory) => memory.memoryId).sort()).toEqual([
      'mem-continuity-added',
      'mem-continuity-persisted',
    ]);
    expect(brief.selfState.humanRequired.map((memory) => memory.memoryId)).toEqual([
      'mem-continuity-human',
    ]);
    expect(brief.changedSince).toEqual({
      addedMemoryIds: ['mem-continuity-added'],
      removedMemoryIds: ['mem-continuity-removed'],
      persistedMemoryIds: ['mem-continuity-human', 'mem-continuity-persisted'],
      statusChanged: [
        {
          memoryId: 'mem-continuity-persisted',
          fromStatus: 'verified',
          toStatus: 'trusted',
        },
      ],
    });
  });

  it('allows continuity reconstruction even when no explicit episodes are visible', async () => {
    const memory = atom({
      memoryId: 'mem-continuity-no-episodes' as MemoryId,
      status: 'candidate',
    });
    await stores.memoryStore.insert(memory);
    await stores.memoryStore.transitionStatus(
      memory.memoryId,
      'verified',
      { actor: AGENT, rationale: 'visible belief without episode anchor' },
      { at: '2026-05-01T00:00:00Z' as IsoTimestamp },
    );

    const brief = await timeline().continuityBrief({
      agentId: AGENT,
      scope: SCOPE,
      at: '2026-05-15T00:00:00Z' as IsoTimestamp,
    });

    expect(brief.decision.outcome).toBe('allow_local_shadow');
    expect(brief.recentEpisodes).toEqual([]);
    expect(brief.selfState.beliefs.map((memory) => memory.memoryId)).toEqual([
      'mem-continuity-no-episodes',
    ]);
    expect(brief.changedSince).toBeNull();
  });

  it('fails closed on continuity brief requests with no visibility or invalid time range', async () => {
    const denied = await new EpisodicTimeline({
      eventLedger: throwingEventLedger(),
      memoryStore: throwingMemoryStore(),
    }).continuityBrief({
      agentId: AGENT,
      scope: SCOPE,
      at: '2026-05-15T00:00:00Z' as IsoTimestamp,
    });
    const invalidRange = await timeline().continuityBrief({
      agentId: AGENT,
      scope: SCOPE,
      since: '2026-05-16T00:00:00Z' as IsoTimestamp,
      at: '2026-05-15T00:00:00Z' as IsoTimestamp,
    });

    expect(denied.decision.outcome).toBe('fetch_abstain');
    expect(denied.selfState.beliefs).toEqual([]);
    expect(invalidRange.decision.outcome).toBe('fetch_abstain');
    expect(invalidRange.decision.reasons).toEqual([
      { kind: 'tuple_incomplete', missingFields: ['timeRange:since<=at'] },
    ]);
  });

  it('parses only explicit episodic payload anchors', () => {
    expect(episodeAnchorFromEvent(event({ eventId: 'evt-anchor' as EventId }))).toMatchObject({
      episodeId: 'conversation-a',
      kind: 'conversation',
      sessionId: 'session-a',
      conversationId: 'conversation-a',
    });
    expect(
      episodeAnchorFromEvent({
        ...event({ eventId: 'evt-invalid-anchor' as EventId }),
        payload: { topic: 'not episodic authority' },
      }),
    ).toBeNull();
  });

  it('ignores malformed episodic payloads from the ledger', async () => {
    const malformedEvent = {
      ...event({
        eventId: 'evt-malformed-anchor' as EventId,
        episodeId: 'conversation-malformed',
      }),
      payload: { episodic: { episodeId: 'conversation-malformed' } },
    };
    await stores.eventLedger.append(malformedEvent);
    await stores.memoryStore.insert(
      atom({
        memoryId: 'mem-malformed-anchor' as MemoryId,
        sourceEventIds: [malformedEvent.eventId],
      }),
    );

    const result = await timeline().episodeMemories({
      agentId: AGENT,
      scope: SCOPE,
      episodeId: 'conversation-malformed',
    });

    expect(result.decision.outcome).toBe('fetch_abstain');
    expect(result.events).toEqual([]);
    expect(result.atoms).toEqual([]);
  });

  function timeline(): EpisodicTimeline {
    return timelineFor(stores);
  }
});

function timelineFor(stores: SqliteStores): EpisodicTimeline {
  return new EpisodicTimeline({
    eventLedger: stores.eventLedger,
    memoryStore: stores.memoryStore,
    visibilityPolicy: staticVisibilityPolicy([VISIBILITY]),
    clock: { now: () => '2026-05-17T00:00:00Z' as IsoTimestamp },
  });
}

function event(
  overrides: Partial<{
    eventId: EventId;
    episodeId: string;
    episodeKind: 'conversation' | 'task' | 'decision_context' | 'session';
    occurredAt: IsoTimestamp;
    scope: Scope;
    visibility: Visibility;
  }> = {},
): Event {
  const episodeId = overrides.episodeId ?? 'conversation-a';
  return {
    eventId: overrides.eventId ?? ('evt-default' as EventId),
    kind: 'conversation',
    agentId: AGENT,
    occurredAt: overrides.occurredAt ?? ('2026-05-10T00:00:00Z' as IsoTimestamp),
    payload: {
      episodic: {
        episodeId,
        kind: overrides.episodeKind ?? 'conversation',
        sessionId: 'session-a',
        conversationId: episodeId,
      },
    },
    scope: overrides.scope ?? SCOPE,
    visibility: overrides.visibility ?? VISIBILITY,
  };
}

function atom(overrides: Partial<MemoryAtom> = {}): MemoryAtom {
  return {
    memoryId: overrides.memoryId ?? ('mem-default' as MemoryId),
    memoryType: overrides.memoryType ?? 'claim',
    content: overrides.content ?? 'Aletheia should preserve authority boundaries.',
    sourceAgentId: overrides.sourceAgentId ?? AGENT,
    sourceEventIds: overrides.sourceEventIds ?? ['evt-default' as EventId],
    sourceMemoryIds: overrides.sourceMemoryIds ?? [],
    scope: overrides.scope ?? SCOPE,
    visibility: overrides.visibility ?? VISIBILITY,
    status: overrides.status ?? 'verified',
    scores: overrides.scores ?? {
      confidence: 0.8,
      evidence: 0.9,
      authority: 0.9,
      freshness: 0.9,
      stability: 0.7,
      consensus: 0.5,
    },
    validFrom: overrides.validFrom ?? ('2026-05-01T00:00:00Z' as IsoTimestamp),
    validUntil: overrides.validUntil ?? null,
    lastConfirmedAt: overrides.lastConfirmedAt ?? null,
    links: overrides.links ?? [],
  };
}

function throwingEventLedger(): EventLedger {
  return {
    append: async () => {
      throw new Error('event ledger should not be called');
    },
    get: async () => {
      throw new Error('event ledger should not be called');
    },
    query: async () => {
      throw new Error('event ledger should not be called');
    },
    count: async () => {
      throw new Error('event ledger should not be called');
    },
  };
}

function throwingMemoryStore(): MemoryStore {
  return {
    insert: async () => {
      throw new Error('memory store should not be called');
    },
    get: async () => {
      throw new Error('memory store should not be called');
    },
    query: async () => {
      throw new Error('memory store should not be called');
    },
    transitionStatus: async () => {
      throw new Error('memory store should not be called');
    },
    statusHistory: async () => {
      throw new Error('memory store should not be called');
    },
  };
}
