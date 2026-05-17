import type {
  AgentId,
  ConflictId,
  ConflictRegistry,
  Event,
  EventId,
  EventLedger,
  IsoTimestamp,
  MemoryAtom,
  MemoryId,
  MemoryStore,
  MemoryType,
  Scope,
  StatusTransitionReason,
  Visibility,
} from '@aletheia/core';
import { MemoryAtomSchema, scopeKey } from '@aletheia/core';

export type ReconsolidationOutcome = 'plan' | 'fetch_abstain';

export type ReconsolidationReason =
  | 'empty_source_events'
  | 'invalid_successor_draft'
  | 'no_permitted_visibilities'
  | 'previous_memory_missing_or_invisible'
  | 'previous_status_not_reconsolidatable'
  | 'source_event_missing_or_invisible'
  | 'source_event_scope_mismatch'
  | 'unresolved_conflict';

export interface ReconsolidationPlannerStores {
  readonly eventLedger: EventLedger;
  readonly memoryStore: MemoryStore;
  readonly conflictRegistry: ConflictRegistry;
}

export interface ReconsolidationPlanInput {
  readonly previousMemoryId: MemoryId;
  readonly successorMemoryId: MemoryId;
  readonly proposedBy: AgentId;
  readonly proposedAt: IsoTimestamp;
  readonly memoryType: MemoryType;
  readonly claim: string;
  readonly sourceEventIds: readonly EventId[];
  readonly scope: Scope;
  readonly permittedVisibilities: readonly Visibility[];
}

export interface PlannedStatusTransition {
  readonly memoryId: MemoryId;
  readonly nextStatus: 'deprecated';
  readonly reason: StatusTransitionReason;
}

export interface ReconsolidationPlan {
  readonly outcome: ReconsolidationOutcome;
  readonly reasons: readonly ReconsolidationReason[];
  readonly previousAtom: MemoryAtom | null;
  readonly sourceEvents: readonly Event[];
  readonly successorDraft: MemoryAtom | null;
  readonly plannedTransitions: readonly PlannedStatusTransition[];
  readonly relatedConflictIds: readonly ConflictId[];
}

export class ReconsolidationPlanner {
  constructor(private readonly stores: ReconsolidationPlannerStores) {}

  async plan(input: ReconsolidationPlanInput): Promise<ReconsolidationPlan> {
    if (input.permittedVisibilities.length === 0) {
      return abstain('no_permitted_visibilities', null, [], []);
    }
    if (input.sourceEventIds.length === 0) {
      return abstain('empty_source_events', null, [], []);
    }

    const previousAtom = await this.stores.memoryStore.get(
      input.previousMemoryId,
      input.permittedVisibilities,
    );
    if (previousAtom === null) {
      return abstain('previous_memory_missing_or_invisible', null, [], []);
    }

    if (!isReconsolidatableStatus(previousAtom.status)) {
      return abstain('previous_status_not_reconsolidatable', previousAtom, [], []);
    }

    if (scopeKey(previousAtom.scope) !== scopeKey(input.scope)) {
      return abstain('previous_memory_missing_or_invisible', null, [], []);
    }

    const sourceEvents: Event[] = [];
    for (const eventId of input.sourceEventIds) {
      const event = await this.stores.eventLedger.get(eventId, input.permittedVisibilities);
      if (event === null) {
        return abstain('source_event_missing_or_invisible', previousAtom, sourceEvents, []);
      }
      if (scopeKey(event.scope) !== scopeKey(previousAtom.scope)) {
        return abstain('source_event_scope_mismatch', previousAtom, sourceEvents, []);
      }
      sourceEvents.push(event);
    }

    const conflicts = await this.stores.conflictRegistry.query({
      touchingMemoryIds: [previousAtom.memoryId],
      statuses: ['unresolved', 'requires_human'],
      scope: previousAtom.scope,
      permittedVisibilities: input.permittedVisibilities,
    });
    const conflictIds = conflicts.map((conflict) => conflict.conflictId);
    if (conflictIds.length > 0) {
      return abstain('unresolved_conflict', previousAtom, sourceEvents, conflictIds);
    }

    const successorDraft: MemoryAtom = {
      memoryId: input.successorMemoryId,
      memoryType: input.memoryType,
      content: input.claim,
      sourceAgentId: input.proposedBy,
      sourceEventIds: [...input.sourceEventIds],
      sourceMemoryIds: [previousAtom.memoryId],
      scope: previousAtom.scope,
      visibility: previousAtom.visibility,
      status: 'candidate',
      // Conservative planner metadata only. The future apply gate must recompute
      // or validate scores before insertion; these values never authorize action.
      scores: {
        confidence: 0.2,
        evidence: sourceEvents.length / input.sourceEventIds.length,
        authority: 0.2,
        freshness: 0.5,
        stability: 0.2,
        consensus: 0.2,
      },
      validFrom: input.proposedAt,
      validUntil: previousAtom.validUntil,
      lastConfirmedAt: null,
      links: [{ relation: 'supersedes', targetMemoryId: previousAtom.memoryId }],
    };

    const parsed = MemoryAtomSchema.safeParse(successorDraft);
    if (!parsed.success) {
      return abstain('invalid_successor_draft', previousAtom, sourceEvents, []);
    }

    const plannedTransitions: PlannedStatusTransition[] =
      previousAtom.status === 'deprecated'
        ? []
        : [
            {
              memoryId: previousAtom.memoryId,
              nextStatus: 'deprecated',
              reason: {
                actor: input.proposedBy,
                rationale: `phase2:reconsolidated_by:${input.successorMemoryId}`,
              },
            },
          ];

    return {
      outcome: 'plan',
      reasons: [],
      previousAtom,
      sourceEvents,
      successorDraft: parsed.data,
      plannedTransitions,
      relatedConflictIds: [],
    };
  }
}

function isReconsolidatableStatus(status: MemoryAtom['status']): boolean {
  return (
    status === 'candidate' ||
    status === 'verified' ||
    status === 'trusted' ||
    status === 'deprecated'
  );
}

function abstain(
  reason: ReconsolidationReason,
  previousAtom: MemoryAtom | null,
  sourceEvents: readonly Event[],
  relatedConflictIds: readonly ConflictId[],
): ReconsolidationPlan {
  return {
    outcome: 'fetch_abstain',
    reasons: [reason],
    previousAtom,
    sourceEvents,
    successorDraft: null,
    plannedTransitions: [],
    relatedConflictIds,
  };
}
