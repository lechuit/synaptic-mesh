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
  StatusTransitionResult,
  Visibility,
} from '@aletheia-labs/core';
import { AgentIdSchema, IsoTimestampSchema, MemoryAtomSchema, scopeKey } from '@aletheia-labs/core';

export type ReconsolidationOutcome = 'plan' | 'fetch_abstain';
export type ReconsolidationApplyOutcome =
  | 'applied'
  | 'ask_human'
  | 'fetch_abstain'
  | 'partial_applied'
  | 'rejected';

export type ReconsolidationReason =
  | 'empty_source_events'
  | 'invalid_successor_draft'
  | 'no_permitted_visibilities'
  | 'previous_memory_missing_or_invisible'
  | 'previous_status_not_reconsolidatable'
  | 'source_event_missing_or_invisible'
  | 'source_event_scope_mismatch'
  | 'successor_insert_failed'
  | 'transition_rejected'
  | 'human_confirmation_required'
  | 'invalid_human_confirmation'
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

export interface ReconsolidationHumanConfirmation {
  readonly confirmedBy: AgentId;
  readonly confirmedAt: IsoTimestamp;
  readonly rationale: string;
}

export interface ReconsolidationApplyInput extends ReconsolidationPlanInput {
  readonly humanConfirmation?: ReconsolidationHumanConfirmation;
}

export interface ReconsolidationApplyResult {
  readonly outcome: ReconsolidationApplyOutcome;
  readonly reasons: readonly ReconsolidationReason[];
  readonly plan: ReconsolidationPlan;
  readonly successorAtom: MemoryAtom | null;
  readonly transitionResults: readonly StatusTransitionResult[];
}

export class ReconsolidationPlanner {
  /**
   * Create a reconsolidation planner over existing authority stores.
   *
   * @remarks
   * The planner is read-only. It validates visibility, source events, scope,
   * status, and conflict state before producing a successor draft.
   */
  constructor(private readonly stores: ReconsolidationPlannerStores) {}

  /**
   * Plan a candidate successor atom and prior-atom deprecation.
   *
   * @remarks
   * Use this when new evidence should update the meaning of an existing atom.
   * The plan never mutates storage and never upgrades authority: successor
   * drafts start as `candidate` and carry `supersedes` lineage back to the
   * previous atom.
   */
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

export class ReconsolidationApplier {
  private readonly planner: ReconsolidationPlanner;

  /**
   * Create a human-confirmed reconsolidation applier.
   *
   * @remarks
   * This wraps `ReconsolidationPlanner` and adds the explicit mutation path.
   * Hosts should call `plan()` directly when they only need a preview.
   */
  constructor(private readonly stores: ReconsolidationPlannerStores) {
    this.planner = new ReconsolidationPlanner(stores);
  }

  /**
   * Apply a reconsolidation plan after human confirmation.
   *
   * @remarks
   * The method fails closed with `ask_human` without valid confirmation. When
   * confirmed, it inserts the successor candidate first and then applies
   * planned deprecations through `MemoryStore.transitionStatus()`. If successor
   * insertion fails, no prior atom is deprecated.
   */
  async apply(input: ReconsolidationApplyInput): Promise<ReconsolidationApplyResult> {
    const plan = await this.planner.plan(input);
    if (plan.outcome !== 'plan' || plan.successorDraft === null) {
      return {
        outcome: 'fetch_abstain',
        reasons: plan.reasons,
        plan,
        successorAtom: null,
        transitionResults: [],
      };
    }

    if (input.humanConfirmation === undefined) {
      return {
        outcome: 'ask_human',
        reasons: ['human_confirmation_required'],
        plan,
        successorAtom: null,
        transitionResults: [],
      };
    }
    if (!validHumanConfirmation(input.humanConfirmation)) {
      return {
        outcome: 'ask_human',
        reasons: ['invalid_human_confirmation'],
        plan,
        successorAtom: null,
        transitionResults: [],
      };
    }

    let successorAtom: MemoryAtom;
    try {
      successorAtom = await this.stores.memoryStore.insert(plan.successorDraft);
    } catch {
      return {
        outcome: 'rejected',
        reasons: ['successor_insert_failed'],
        plan,
        successorAtom: null,
        transitionResults: [],
      };
    }

    const transitionResults: StatusTransitionResult[] = [];
    for (const transition of plan.plannedTransitions) {
      try {
        transitionResults.push(
          await this.stores.memoryStore.transitionStatus(
            transition.memoryId,
            transition.nextStatus,
            confirmationReason(transition.reason, input.humanConfirmation),
            { at: input.humanConfirmation.confirmedAt },
          ),
        );
      } catch (err) {
        transitionResults.push({
          kind: 'rejected',
          reason: err instanceof Error ? err.message : 'transition threw',
        });
      }
    }

    const rejected = transitionResults.some((result) => result.kind === 'rejected');
    return {
      outcome: rejected ? 'partial_applied' : 'applied',
      reasons: rejected ? ['transition_rejected'] : [],
      plan,
      successorAtom,
      transitionResults,
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

function validHumanConfirmation(confirmation: ReconsolidationHumanConfirmation): boolean {
  return (
    AgentIdSchema.safeParse(confirmation.confirmedBy).success &&
    IsoTimestampSchema.safeParse(confirmation.confirmedAt).success &&
    typeof confirmation.rationale === 'string' &&
    confirmation.rationale.trim().length > 0
  );
}

function confirmationReason(
  plannedReason: StatusTransitionReason,
  confirmation: ReconsolidationHumanConfirmation,
): StatusTransitionReason {
  return {
    actor: confirmation.confirmedBy,
    rationale: `${plannedReason.rationale}; human_confirmed: ${confirmation.rationale}`,
    ...(plannedReason.conflictId !== undefined ? { conflictId: plannedReason.conflictId } : {}),
  };
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
