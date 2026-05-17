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
  type StatusTransitionReason,
  type Visibility,
  type VisibilityPolicy,
  decision,
} from '@aletheia-labs/core';

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

export interface EpisodeCatalog {
  readonly decision: Decision;
  readonly episodes: readonly EpisodeSummary[];
  readonly events: readonly EpisodeEvent[];
}

export interface MemoryStatusAt {
  readonly memoryId: MemoryId;
  readonly status: MemoryStatus;
  readonly at: IsoTimestamp;
}

export interface MemoryTimelineEntry {
  readonly at: IsoTimestamp;
  readonly fromStatus: MemoryStatus | null;
  readonly toStatus: MemoryStatus;
  readonly reason: StatusTransitionReason;
}

export interface MemoryTimeline {
  readonly decision: Decision;
  readonly atom: MemoryAtom | null;
  readonly history: readonly MemoryTimelineEntry[];
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

export interface ContinuityChangeSet {
  readonly addedMemoryIds: readonly MemoryId[];
  readonly removedMemoryIds: readonly MemoryId[];
  readonly persistedMemoryIds: readonly MemoryId[];
  readonly statusChanged: readonly {
    readonly memoryId: MemoryId;
    readonly fromStatus: MemoryStatus;
    readonly toStatus: MemoryStatus;
  }[];
}

export interface ContinuitySelfState {
  readonly beliefs: readonly MemoryAtom[];
  readonly uncertain: readonly MemoryAtom[];
  readonly distrusted: readonly MemoryAtom[];
  readonly humanRequired: readonly MemoryAtom[];
  readonly statusesAt: readonly MemoryStatusAt[];
}

export interface ContinuityBrief {
  readonly decision: Decision;
  readonly at: IsoTimestamp;
  readonly since: IsoTimestamp | null;
  readonly recentEpisodes: readonly EpisodeSummary[];
  readonly selfState: ContinuitySelfState;
  readonly changedSince: ContinuityChangeSet | null;
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

export interface EpisodeCatalogQuery extends EpisodicQueryBase {
  readonly kind?: EpisodeKind;
  readonly since?: IsoTimestamp;
  readonly until?: IsoTimestamp;
  readonly limit?: number;
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

export interface ContinuityBriefQuery extends EpisodicQueryBase {
  readonly at?: IsoTimestamp;
  readonly since?: IsoTimestamp;
  readonly episodeKind?: EpisodeKind;
  readonly episodeLimit?: number;
}

export interface MemoryTimelineQuery extends EpisodicQueryBase {
  readonly memoryId: MemoryId;
  readonly until?: IsoTimestamp;
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

  /**
   * Create subjective-time projections over existing event and memory stores.
   *
   * @remarks
   * This component is read-only. It does not create memory, authorize actions,
   * or infer permission from episode membership.
   */
  constructor(private readonly options: EpisodicTimelineOptions) {
    this.visibilityPolicy = options.visibilityPolicy ?? DENY_ALL_VISIBILITY_POLICY;
    this.clock = options.clock ?? SYSTEM_CLOCK;
  }

  /**
   * List visible explicit episodes in a scope.
   *
   * @remarks
   * Use this to populate session/conversation/task catalogs. The implementation
   * queries permitted events first, extracts only explicit `payload.episodic`
   * anchors, groups them by episode, and fails closed when none are visible.
   */
  async listEpisodes(query: EpisodeCatalogQuery): Promise<EpisodeCatalog> {
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyCatalog(
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const events = await this.loadAnchoredEvents(query, permitted);
    const matchingEvents =
      query.kind !== undefined
        ? events.filter((event) => event.anchor.kind === query.kind)
        : events;
    const episodes = summarizeEpisodes(matchingEvents);
    const limitedEpisodes = query.limit !== undefined ? episodes.slice(0, query.limit) : episodes;
    const limitedEpisodeIds = new Set(limitedEpisodes.map((episode) => episode.episodeId));
    const limitedEvents = matchingEvents.filter((event) =>
      limitedEpisodeIds.has(event.anchor.episodeId),
    );

    if (limitedEpisodes.length === 0) {
      return emptyCatalog(failClosed('tuple_incomplete', 'episodeAnchors', emittedAt));
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: [] }],
        [],
        [],
        emittedAt,
      ),
      episodes: limitedEpisodes,
      events: limitedEvents,
    };
  }

  /**
   * Project memories formed from the source events of one episode.
   *
   * @remarks
   * The method first verifies the episode events are visible and in scope, then
   * reconstructs memory status at the requested episode instant. It returns
   * audit context only; callers still need `tryAct()` before acting.
   */
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

  /**
   * Reconstruct the caller-visible belief snapshot at a historical instant.
   *
   * @remarks
   * Status is read from `MemoryStore.statusHistory()` rather than trusting the
   * atom's current status, so reopened stores can answer "what was believed
   * then" even after later decay or reconsolidation.
   */
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

  /**
   * Compare visible belief snapshots at two episode boundaries.
   *
   * @remarks
   * This compares the agent's visible belief state at each boundary, not only
   * atoms born inside those episodes. It reports added, removed, persisted, and
   * status-changed memory IDs.
   */
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

  /**
   * Build a restart-oriented self-state snapshot.
   *
   * @remarks
   * Use this when a host wants to rehydrate an agent's current memory posture:
   * beliefs, uncertain candidates, distrusted/deprecated atoms, and
   * human-required material remain separate categories.
   */
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

  /**
   * Build a compact restart brief for an agent host.
   *
   * @remarks
   * This is a read-only continuity projection: it combines current self-state,
   * recent explicit episodes, and an optional status diff since an earlier
   * instant. It does not summarize prose, infer hidden memories, or authorize
   * any action. Hosts must still call `tryAct()` before using the brief to act.
   * `changedSince` is an endpoint snapshot diff; use `memoryTimeline()` when
   * the full transition audit path matters.
   */
  async continuityBrief(query: ContinuityBriefQuery): Promise<ContinuityBrief> {
    const at = query.at ?? this.clock.now();
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyContinuityBrief(
        at,
        query.since ?? null,
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    if (query.since !== undefined && query.since > at) {
      return emptyContinuityBrief(
        at,
        query.since,
        failClosed('tuple_incomplete', 'timeRange:since<=at', emittedAt),
      );
    }

    const currentSnapshot = await this.loadSnapshot(
      { agentId: query.agentId, scope: query.scope, asOf: at, statusesAt: ALL_STATUSES },
      permitted,
    );
    if (currentSnapshot.atoms.length === 0) {
      return emptyContinuityBrief(
        at,
        query.since ?? null,
        failClosed('tuple_incomplete', 'memoryAtoms', emittedAt),
      );
    }

    const recentEvents = await this.loadAnchoredEvents(
      {
        agentId: query.agentId,
        scope: query.scope,
        ...(query.since !== undefined ? { since: query.since } : {}),
        until: at,
      },
      permitted,
    );
    const matchingEpisodes =
      query.episodeKind !== undefined
        ? summarizeEpisodes(recentEvents).filter((episode) => episode.kind === query.episodeKind)
        : summarizeEpisodes(recentEvents);
    const recentEpisodes = takeLast(matchingEpisodes, query.episodeLimit ?? 10);

    const changedSince =
      query.since !== undefined
        ? diffSnapshots(
            await this.loadSnapshot(
              {
                agentId: query.agentId,
                scope: query.scope,
                asOf: query.since,
                statusesAt: ALL_STATUSES,
              },
              permitted,
            ),
            currentSnapshot,
          )
        : null;
    const relatedMemoryIds = [
      ...uniqueMemoryIds([
        ...currentSnapshot.atoms.map((atom) => atom.memoryId),
        ...(changedSince?.addedMemoryIds ?? []),
        ...(changedSince?.removedMemoryIds ?? []),
        ...(changedSince?.persistedMemoryIds ?? []),
      ]),
    ];

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: relatedMemoryIds }],
        relatedMemoryIds,
        [],
        emittedAt,
      ),
      at,
      since: query.since ?? null,
      recentEpisodes,
      selfState: {
        beliefs: atomsWithStatus(currentSnapshot, ['verified', 'trusted']),
        uncertain: atomsWithStatus(currentSnapshot, ['candidate']),
        distrusted: atomsWithStatus(currentSnapshot, ['deprecated', 'rejected']),
        humanRequired: atomsWithStatus(currentSnapshot, ['sealed', 'human_required']),
        statusesAt: currentSnapshot.statusesAt,
      },
      changedSince,
    };
  }

  /**
   * Return the permission-guarded status timeline for one memory.
   *
   * @remarks
   * The atom must be visible and exactly in scope before status history is
   * exposed. This prevents timeline lookups from leaking hidden memory IDs.
   */
  async memoryTimeline(query: MemoryTimelineQuery): Promise<MemoryTimeline> {
    const emittedAt = this.clock.now();
    const permitted = this.permittedFor(query.agentId);
    if (permitted.length === 0) {
      return emptyMemoryTimeline(
        failClosed('visibility_denied', 'caller has no permitted visibility planes', emittedAt),
      );
    }

    const scopedAtoms = await this.options.memoryStore.query({
      statuses: ALL_STATUSES,
      scope: query.scope,
      permittedVisibilities: permitted,
    });
    const atom = scopedAtoms.find((candidate) => candidate.memoryId === query.memoryId) ?? null;
    if (atom === null) {
      return emptyMemoryTimeline(
        failClosed(
          'source_check_failed',
          'memory is missing, not visible, or outside requested scope',
          emittedAt,
        ),
      );
    }

    const fullHistory = await this.options.memoryStore.statusHistory(atom.memoryId);
    const until = query.until;
    const history =
      until !== undefined ? fullHistory.filter((entry) => entry.at <= until) : fullHistory;
    if (history.length === 0) {
      return emptyMemoryTimeline(
        failClosed('tuple_incomplete', `statusHistory:${atom.memoryId}`, emittedAt),
      );
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: [atom.memoryId] }],
        [atom.memoryId],
        [],
        emittedAt,
      ),
      atom,
      history,
    };
  }

  private permittedFor(agentId: AgentId): readonly Visibility[] {
    return this.visibilityPolicy.permittedVisibilitiesForAgent(agentId);
  }

  private async loadEpisodeEvents(
    query: EpisodicQueryBase & { readonly episodeId: string },
    permitted: readonly Visibility[],
  ): Promise<readonly EpisodeEvent[]> {
    const events = await this.loadAnchoredEvents(query, permitted);
    return events.filter((event) => event.anchor.episodeId === query.episodeId);
  }

  private async loadAnchoredEvents(
    query: EpisodicQueryBase & {
      readonly since?: IsoTimestamp;
      readonly until?: IsoTimestamp;
    },
    permitted: readonly Visibility[],
  ): Promise<readonly EpisodeEvent[]> {
    const events = await this.options.eventLedger.query({
      scope: query.scope,
      permittedVisibilities: permitted,
      ...(query.since !== undefined ? { since: query.since } : {}),
      ...(query.until !== undefined ? { until: query.until } : {}),
    });
    return events
      .map((event) => {
        const anchor = episodeAnchorFromEvent(event);
        return anchor !== null ? { event, anchor } : null;
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

/**
 * Parse an explicit episodic anchor from an event payload.
 *
 * @remarks
 * This helper is intentionally conservative: malformed or missing
 * `payload.episodic` objects return `null` instead of being inferred from
 * prose, timestamps, or event kind.
 */
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
  kind: 'tuple_incomplete' | 'visibility_denied' | 'source_check_failed',
  detail: string,
  emittedAt: IsoTimestamp,
): Decision {
  return decision('fetch_abstain', [failClosedReason(kind, detail)], [], [], emittedAt);
}

function failClosedReason(
  kind: 'tuple_incomplete' | 'visibility_denied' | 'source_check_failed',
  detail: string,
) {
  if (kind === 'tuple_incomplete') return { kind, missingFields: [detail] };
  return { kind, detail };
}

function emptyCatalog(decisionValue: Decision): EpisodeCatalog {
  return {
    decision: decisionValue,
    episodes: [],
    events: [],
  };
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

function emptyContinuityBrief(
  at: IsoTimestamp,
  since: IsoTimestamp | null,
  decisionValue: Decision,
): ContinuityBrief {
  return {
    decision: decisionValue,
    at,
    since,
    recentEpisodes: [],
    selfState: {
      beliefs: [],
      uncertain: [],
      distrusted: [],
      humanRequired: [],
      statusesAt: [],
    },
    changedSince: null,
  };
}

function emptyMemoryTimeline(decisionValue: Decision): MemoryTimeline {
  return {
    decision: decisionValue,
    atom: null,
    history: [],
  };
}

function summarizeEpisodes(events: readonly EpisodeEvent[]): readonly EpisodeSummary[] {
  const grouped = new Map<string, EpisodeEvent[]>();
  for (const event of events) {
    const key = `${event.anchor.kind}:${event.anchor.episodeId}`;
    const existing = grouped.get(key);
    if (existing !== undefined) {
      existing.push(event);
    } else {
      grouped.set(key, [event]);
    }
  }

  return [...grouped.values()]
    .map((episodeEvents) =>
      summarizeEpisode(episodeEvents[0]?.anchor.episodeId ?? '', episodeEvents, []),
    )
    .sort((a, b) => {
      if (a.firstOccurredAt !== b.firstOccurredAt) {
        return a.firstOccurredAt.localeCompare(b.firstOccurredAt);
      }
      return a.episodeId.localeCompare(b.episodeId);
    });
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

function diffSnapshots(
  fromSnapshot: {
    readonly atoms: readonly MemoryAtom[];
    readonly statusesAt: readonly MemoryStatusAt[];
  },
  toSnapshot: {
    readonly atoms: readonly MemoryAtom[];
    readonly statusesAt: readonly MemoryStatusAt[];
  },
): ContinuityChangeSet {
  const fromById = new Map(fromSnapshot.statusesAt.map((status) => [status.memoryId, status]));
  const toById = new Map(toSnapshot.statusesAt.map((status) => [status.memoryId, status]));
  const fromIds = new Set(fromById.keys());
  const toIds = new Set(toById.keys());
  const addedMemoryIds = sortMemoryIds([...toIds].filter((memoryId) => !fromIds.has(memoryId)));
  const removedMemoryIds = sortMemoryIds([...fromIds].filter((memoryId) => !toIds.has(memoryId)));
  const persistedMemoryIds = sortMemoryIds([...toIds].filter((memoryId) => fromIds.has(memoryId)));
  const statusChanged = persistedMemoryIds.flatMap((memoryId) => {
    const fromStatus = fromById.get(memoryId)?.status;
    const toStatus = toById.get(memoryId)?.status;
    if (fromStatus === undefined || toStatus === undefined || fromStatus === toStatus) {
      return [];
    }
    return [{ memoryId, fromStatus, toStatus }];
  });

  return {
    addedMemoryIds,
    removedMemoryIds,
    persistedMemoryIds,
    statusChanged,
  };
}

function takeLast<T>(items: readonly T[], limit: number): readonly T[] {
  if (limit <= 0) return [];
  return items.slice(Math.max(items.length - limit, 0));
}

function sortMemoryIds(memoryIds: readonly MemoryId[]): readonly MemoryId[] {
  return [...memoryIds].sort((a, b) => a.localeCompare(b));
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
