import {
  type AgentId,
  type Clock,
  DENY_ALL_VISIBILITY_POLICY,
  type Decision,
  type Event,
  type EventId,
  type EventLedger,
  type IsoTimestamp,
  type MemoryAtom,
  type MemoryId,
  type MemoryStatus,
  type MemoryStore,
  type Scope,
  type Visibility,
  type VisibilityPolicy,
  decision,
} from '@aletheia/core';

export type EpisodeKind = 'conversation' | 'task' | 'decision_context' | 'session';

export interface EpisodeAnchor {
  readonly episodeId: string;
  readonly kind: EpisodeKind;
  readonly sessionId?: string;
  readonly conversationId?: string;
  readonly taskId?: string;
  readonly decisionContextId?: string;
}

export interface EpisodeEvent {
  readonly event: Event;
  readonly anchor: EpisodeAnchor;
}

export interface EpisodeSummary {
  readonly episodeId: string;
  readonly kind: EpisodeKind;
  readonly firstOccurredAt: IsoTimestamp;
  readonly lastOccurredAt: IsoTimestamp;
  readonly eventIds: readonly EventId[];
  readonly memoryIds: readonly MemoryId[];
}

export interface MemoryStatusAt {
  readonly memoryId: MemoryId;
  readonly status: MemoryStatus;
  readonly at: IsoTimestamp;
}

export interface EpisodeProjection {
  readonly decision: Decision;
  readonly episode: EpisodeSummary | null;
  readonly events: readonly EpisodeEvent[];
  readonly atoms: readonly MemoryAtom[];
  readonly statusesAt: readonly MemoryStatusAt[];
}

export interface BeliefSnapshot {
  readonly decision: Decision;
  readonly at: IsoTimestamp;
  readonly atoms: readonly MemoryAtom[];
  readonly statusesAt: readonly MemoryStatusAt[];
}

export interface EpisodeComparison {
  readonly decision: Decision;
  readonly fromEpisode: EpisodeSummary | null;
  readonly toEpisode: EpisodeSummary | null;
  readonly addedMemoryIds: readonly MemoryId[];
  readonly removedMemoryIds: readonly MemoryId[];
  readonly persistedMemoryIds: readonly MemoryId[];
  readonly statusChanged: readonly {
    readonly memoryId: MemoryId;
    readonly fromStatus: MemoryStatus;
    readonly toStatus: MemoryStatus;
  }[];
}

export interface SelfStateSnapshot {
  readonly decision: Decision;
  readonly at: IsoTimestamp;
  readonly beliefs: readonly MemoryAtom[];
  readonly uncertain: readonly MemoryAtom[];
  readonly distrusted: readonly MemoryAtom[];
  readonly humanRequired: readonly MemoryAtom[];
  readonly statusHistory: readonly {
    readonly memoryId: MemoryId;
    readonly status: MemoryStatus;
    readonly at: IsoTimestamp;
  }[];
}

export interface EpisodicTimelineOptions {
  readonly eventLedger: EventLedger;
  readonly memoryStore: MemoryStore;
  readonly visibilityPolicy?: VisibilityPolicy;
  readonly clock?: Clock;
}

export interface EpisodicQueryBase {
  readonly agentId: AgentId;
  readonly scope: Scope;
}

export interface EpisodeQuery extends EpisodicQueryBase {
  readonly episodeId: string;
  readonly statusesAt?: readonly MemoryStatus[];
  readonly asOf?: IsoTimestamp;
}

export interface BeliefsAtQuery extends EpisodicQueryBase {
  readonly asOf: IsoTimestamp;
  readonly statusesAt?: readonly MemoryStatus[];
  readonly contentIncludes?: string;
  readonly limit?: number;
}

export interface CompareEpisodesQuery extends EpisodicQueryBase {
  readonly fromEpisodeId: string;
  readonly toEpisodeId: string;
  readonly statusesAt?: readonly MemoryStatus[];
}

export interface SelfStateQuery extends EpisodicQueryBase {
  readonly at?: IsoTimestamp;
}

const ALL_STATUSES: readonly MemoryStatus[] = [
  'candidate',
  'verified',
  'trusted',
  'deprecated',
  'rejected',
  'sealed',
  'human_required',
];

const BELIEF_STATUSES: readonly MemoryStatus[] = ['verified', 'trusted'];

const SYSTEM_CLOCK: Clock = {
  now: () => new Date().toISOString() as IsoTimestamp,
};

export class EpisodicTimeline {
  private readonly visibilityPolicy: VisibilityPolicy;
  private readonly clock: Clock;

  constructor(private readonly options: EpisodicTimelineOptions) {
    this.visibilityPolicy = options.visibilityPolicy ?? DENY_ALL_VISIBILITY_POLICY;
    this.clock = options.clock ?? SYSTEM_CLOCK;
  }

  async episodeMemories(query: EpisodeQuery): Promise<EpisodeProjection> {
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyEpisodeProjection(
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const events = await this.loadEpisodeEvents(query, permitted);
    if (events.length === 0) {
      return emptyEpisodeProjection(
        failClosed('tuple_incomplete', `episodeEvents:${query.episodeId}`, emittedAt),
      );
    }

    const asOf = query.asOf ?? maxIso(events.map((event) => event.event.occurredAt));
    const snapshot = await this.loadSnapshot(
      {
        agentId: query.agentId,
        scope: query.scope,
        asOf,
        statusesAt: query.statusesAt ?? ALL_STATUSES,
      },
      permitted,
    );
    const eventIds = new Set(events.map((event) => event.event.eventId));
    const atoms = snapshot.atoms.filter((atom) =>
      atom.sourceEventIds.some((eventId) => eventIds.has(eventId)),
    );
    const statusesAt = snapshot.statusesAt.filter((status) =>
      atoms.some((atom) => atom.memoryId === status.memoryId),
    );

    if (atoms.length === 0) {
      return {
        decision: failClosed(
          'tuple_incomplete',
          `episodeMemoryAtoms:${query.episodeId}`,
          emittedAt,
        ),
        episode: summarizeEpisode(query.episodeId, events, []),
        events,
        atoms: [],
        statusesAt: [],
      };
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: atoms.map((atom) => atom.memoryId) }],
        atoms.map((atom) => atom.memoryId),
        [],
        emittedAt,
      ),
      episode: summarizeEpisode(query.episodeId, events, atoms),
      events,
      atoms,
      statusesAt,
    };
  }

  async beliefsAt(query: BeliefsAtQuery): Promise<BeliefSnapshot> {
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyBeliefSnapshot(
        query.asOf,
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const snapshot = await this.loadSnapshot(query, permitted);
    if (snapshot.atoms.length === 0) {
      return emptyBeliefSnapshot(
        query.asOf,
        failClosed('tuple_incomplete', 'memoryAtoms', emittedAt),
      );
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [
          {
            kind: 'all_checks_passed',
            citedMemoryIds: snapshot.atoms.map((atom) => atom.memoryId),
          },
        ],
        snapshot.atoms.map((atom) => atom.memoryId),
        [],
        emittedAt,
      ),
      at: query.asOf,
      atoms: snapshot.atoms,
      statusesAt: snapshot.statusesAt,
    };
  }

  async compareEpisodes(query: CompareEpisodesQuery): Promise<EpisodeComparison> {
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyComparison(
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const fromEvents = await this.loadEpisodeEvents(
      { agentId: query.agentId, scope: query.scope, episodeId: query.fromEpisodeId },
      permitted,
    );
    const toEvents = await this.loadEpisodeEvents(
      { agentId: query.agentId, scope: query.scope, episodeId: query.toEpisodeId },
      permitted,
    );
    if (fromEvents.length === 0 || toEvents.length === 0) {
      return emptyComparison(
        failClosed(
          'tuple_incomplete',
          fromEvents.length === 0
            ? `episodeEvents:${query.fromEpisodeId}`
            : `episodeEvents:${query.toEpisodeId}`,
          emittedAt,
        ),
      );
    }

    const fromAt = maxIso(fromEvents.map((event) => event.event.occurredAt));
    const toAt = maxIso(toEvents.map((event) => event.event.occurredAt));
    const statusesAt = query.statusesAt ?? BELIEF_STATUSES;
    const fromSnapshot = await this.loadSnapshot(
      { agentId: query.agentId, scope: query.scope, asOf: fromAt, statusesAt },
      permitted,
    );
    const toSnapshot = await this.loadSnapshot(
      { agentId: query.agentId, scope: query.scope, asOf: toAt, statusesAt },
      permitted,
    );

    const fromById = new Map(fromSnapshot.statusesAt.map((status) => [status.memoryId, status]));
    const toById = new Map(toSnapshot.statusesAt.map((status) => [status.memoryId, status]));
    const fromIds = new Set(fromById.keys());
    const toIds = new Set(toById.keys());
    const addedMemoryIds = [...toIds].filter((memoryId) => !fromIds.has(memoryId));
    const removedMemoryIds = [...fromIds].filter((memoryId) => !toIds.has(memoryId));
    const persistedMemoryIds = [...toIds].filter((memoryId) => fromIds.has(memoryId));
    const statusChanged = persistedMemoryIds.flatMap((memoryId) => {
      const fromStatus = fromById.get(memoryId)?.status;
      const toStatus = toById.get(memoryId)?.status;
      if (fromStatus === undefined || toStatus === undefined || fromStatus === toStatus) {
        return [];
      }
      return [{ memoryId, fromStatus, toStatus }];
    });

    const relatedMemoryIds = uniqueMemoryIds([
      ...addedMemoryIds,
      ...removedMemoryIds,
      ...persistedMemoryIds,
    ]);

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: [...relatedMemoryIds] }],
        relatedMemoryIds,
        [],
        emittedAt,
      ),
      fromEpisode: summarizeEpisode(query.fromEpisodeId, fromEvents, fromSnapshot.atoms),
      toEpisode: summarizeEpisode(query.toEpisodeId, toEvents, toSnapshot.atoms),
      addedMemoryIds,
      removedMemoryIds,
      persistedMemoryIds,
      statusChanged,
    };
  }

  async selfState(query: SelfStateQuery): Promise<SelfStateSnapshot> {
    const at = query.at ?? this.clock.now();
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptySelfState(
        at,
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const snapshot = await this.loadSnapshot(
      { agentId: query.agentId, scope: query.scope, asOf: at, statusesAt: ALL_STATUSES },
      permitted,
    );
    if (snapshot.atoms.length === 0) {
      return emptySelfState(at, failClosed('tuple_incomplete', 'memoryAtoms', emittedAt));
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [
          {
            kind: 'all_checks_passed',
            citedMemoryIds: snapshot.atoms.map((atom) => atom.memoryId),
          },
        ],
        snapshot.atoms.map((atom) => atom.memoryId),
        [],
        emittedAt,
      ),
      at,
      beliefs: atomsWithStatus(snapshot, ['verified', 'trusted']),
      uncertain: atomsWithStatus(snapshot, ['candidate']),
      distrusted: atomsWithStatus(snapshot, ['deprecated', 'rejected']),
      humanRequired: atomsWithStatus(snapshot, ['sealed', 'human_required']),
      statusHistory: snapshot.statusesAt,
    };
  }

  private permittedFor(agentId: AgentId): readonly Visibility[] {
    return this.visibilityPolicy.permittedVisibilitiesForAgent(agentId);
  }

  private async loadEpisodeEvents(
    query: EpisodicQueryBase & { readonly episodeId: string },
    permitted: readonly Visibility[],
  ): Promise<readonly EpisodeEvent[]> {
    const events = await this.options.eventLedger.query({
      scope: query.scope,
      permittedVisibilities: permitted,
    });
    return events
      .map((event) => {
        const anchor = episodeAnchorFromEvent(event);
        return anchor !== null && anchor.episodeId === query.episodeId ? { event, anchor } : null;
      })
      .filter((event): event is EpisodeEvent => event !== null);
  }

  private async loadSnapshot(
    query: BeliefsAtQuery,
    permitted: readonly Visibility[],
  ): Promise<{
    readonly atoms: readonly MemoryAtom[];
    readonly statusesAt: readonly MemoryStatusAt[];
  }> {
    const atoms = await this.options.memoryStore.query({
      statuses: ALL_STATUSES,
      scope: query.scope,
      permittedVisibilities: permitted,
      validAt: query.asOf,
    });
    const statusResults = await Promise.all(
      atoms.map(async (atom): Promise<MemoryStatusAt | null> => {
        const status = await this.statusAt(atom, query.asOf);
        if (status === null) return null;
        return {
          memoryId: atom.memoryId,
          status,
          at: query.asOf,
        };
      }),
    );
    const statusesAt = statusResults.filter((status): status is MemoryStatusAt => status !== null);
    const statusByMemoryId = new Map(statusesAt.map((status) => [status.memoryId, status.status]));
    const allowedStatuses = new Set(query.statusesAt ?? BELIEF_STATUSES);
    const matchingAtoms = atoms.filter((atom) => {
      const status = statusByMemoryId.get(atom.memoryId);
      if (status === undefined || !allowedStatuses.has(status)) return false;
      if (query.contentIncludes !== undefined && !atom.content.includes(query.contentIncludes)) {
        return false;
      }
      return true;
    });
    const filteredAtoms =
      query.limit !== undefined ? matchingAtoms.slice(0, query.limit) : matchingAtoms;
    const filteredIds = new Set(filteredAtoms.map((atom) => atom.memoryId));
    return {
      atoms: filteredAtoms,
      statusesAt: statusesAt.filter((status) => filteredIds.has(status.memoryId)),
    };
  }

  private async statusAt(atom: MemoryAtom, at: IsoTimestamp): Promise<MemoryStatus | null> {
    const history = await this.options.memoryStore.statusHistory(atom.memoryId);
    const latest = history.filter((entry) => entry.at <= at).at(-1);
    return latest?.toStatus ?? null;
  }
}

export function episodeAnchorFromEvent(event: Event): EpisodeAnchor | null {
  if (!hasEpisodicPayload(event.payload)) return null;
  const raw = event.payload.episodic;
  if (!isRecord(raw)) return null;
  const episodeId = stringField(raw, 'episodeId');
  const kind = episodeKindField(raw, 'kind');
  if (episodeId === null || kind === null) return null;
  return optionalFields({
    episodeId,
    kind,
    sessionId: stringField(raw, 'sessionId'),
    conversationId: stringField(raw, 'conversationId'),
    taskId: stringField(raw, 'taskId'),
    decisionContextId: stringField(raw, 'decisionContextId'),
  });
}

function failClosed(
  kind: 'tuple_incomplete' | 'visibility_denied',
  detail: string,
  emittedAt: IsoTimestamp,
): Decision {
  return decision(
    'fetch_abstain',
    [kind === 'tuple_incomplete' ? { kind, missingFields: [detail] } : { kind, detail }],
    [],
    [],
    emittedAt,
  );
}

function emptyEpisodeProjection(decisionValue: Decision): EpisodeProjection {
  return {
    decision: decisionValue,
    episode: null,
    events: [],
    atoms: [],
    statusesAt: [],
  };
}

function emptyBeliefSnapshot(at: IsoTimestamp, decisionValue: Decision): BeliefSnapshot {
  return {
    decision: decisionValue,
    at,
    atoms: [],
    statusesAt: [],
  };
}

function emptyComparison(decisionValue: Decision): EpisodeComparison {
  return {
    decision: decisionValue,
    fromEpisode: null,
    toEpisode: null,
    addedMemoryIds: [],
    removedMemoryIds: [],
    persistedMemoryIds: [],
    statusChanged: [],
  };
}

function emptySelfState(at: IsoTimestamp, decisionValue: Decision): SelfStateSnapshot {
  return {
    decision: decisionValue,
    at,
    beliefs: [],
    uncertain: [],
    distrusted: [],
    humanRequired: [],
    statusHistory: [],
  };
}

function summarizeEpisode(
  episodeId: string,
  events: readonly EpisodeEvent[],
  atoms: readonly MemoryAtom[],
): EpisodeSummary {
  const kind = events[0]?.anchor.kind ?? 'session';
  const occurredAts = events.map((event) => event.event.occurredAt);
  return {
    episodeId,
    kind,
    firstOccurredAt: minIso(occurredAts),
    lastOccurredAt: maxIso(occurredAts),
    eventIds: events.map((event) => event.event.eventId),
    memoryIds: atoms.map((atom) => atom.memoryId),
  };
}

function atomsWithStatus(
  snapshot: {
    readonly atoms: readonly MemoryAtom[];
    readonly statusesAt: readonly MemoryStatusAt[];
  },
  statuses: readonly MemoryStatus[],
): readonly MemoryAtom[] {
  const allowed = new Set(statuses);
  const statusByMemoryId = new Map(
    snapshot.statusesAt.map((status) => [status.memoryId, status.status]),
  );
  return snapshot.atoms.filter((atom) => {
    const status = statusByMemoryId.get(atom.memoryId);
    return status !== undefined && allowed.has(status);
  });
}

function uniqueMemoryIds(memoryIds: readonly MemoryId[]): readonly MemoryId[] {
  return [...new Set(memoryIds)];
}

function minIso(values: readonly IsoTimestamp[]): IsoTimestamp {
  const first = values[0];
  if (first === undefined) {
    throw new Error('minIso requires at least one timestamp');
  }
  return values.reduce((min, value) => (value < min ? value : min), first);
}

function maxIso(values: readonly IsoTimestamp[]): IsoTimestamp {
  const first = values[0];
  if (first === undefined) {
    throw new Error('maxIso requires at least one timestamp');
  }
  return values.reduce((max, value) => (value > max ? value : max), first);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasEpisodicPayload(value: unknown): value is { readonly episodic?: unknown } {
  return isRecord(value);
}

function stringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function episodeKindField(record: Record<string, unknown>, key: string): EpisodeKind | null {
  const value = record[key];
  if (
    value === 'conversation' ||
    value === 'task' ||
    value === 'decision_context' ||
    value === 'session'
  ) {
    return value;
  }
  return null;
}

function optionalFields(anchor: {
  readonly episodeId: string;
  readonly kind: EpisodeKind;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly taskId: string | null;
  readonly decisionContextId: string | null;
}): EpisodeAnchor {
  return {
    episodeId: anchor.episodeId,
    kind: anchor.kind,
    ...(anchor.sessionId !== null ? { sessionId: anchor.sessionId } : {}),
    ...(anchor.conversationId !== null ? { conversationId: anchor.conversationId } : {}),
    ...(anchor.taskId !== null ? { taskId: anchor.taskId } : {}),
    ...(anchor.decisionContextId !== null ? { decisionContextId: anchor.decisionContextId } : {}),
  };
}
