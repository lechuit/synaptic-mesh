/**
 * WriteGate — proposal-to-atom governance.
 *
 * Phase 1.3 implements the conservative path: validate sources, scope,
 * visibility, explicit conflict markers, and promotion boundary before any
 * MemoryAtom is inserted. The gate never upgrades a claim beyond `candidate`;
 * human/sensitive/conflicted proposals become non-actionable `human_required`
 * atoms instead.
 */

import type { ConflictRegistry, EventLedger, MemoryStore } from '../storage/index.js';
import type {
  ConflictId,
  ConflictRecord,
  DecisionReason,
  Event,
  MemoryAtom,
  MemoryId,
  MemoryProposal,
  Visibility,
  WriteGateDecision,
} from '../types/index.js';
import { MemoryAtomSchema, MemoryProposalSchema, scopeKey } from '../types/index.js';
import type { Clock } from './decision-helpers.js';
import { SYSTEM_CLOCK, decision } from './decision-helpers.js';
import { includesVisibility, sameScope } from './scope-helpers.js';
import { DENY_ALL_VISIBILITY_POLICY, type VisibilityPolicy } from './visibility-policy.js';

export interface WriteGateStores {
  readonly eventLedger: EventLedger;
  readonly memoryStore: MemoryStore;
  readonly conflictRegistry: ConflictRegistry;
}

export interface WriteGateOptions extends WriteGateStores {
  readonly visibilityPolicy?: VisibilityPolicy;
  readonly clock?: Clock;
  readonly memoryIdForProposal?: (proposal: MemoryProposal) => MemoryId;
}

export interface WriteGateResult {
  readonly decision: WriteGateDecision;
  readonly atom: MemoryAtom | null;
  readonly sourceEvents: readonly Event[];
  readonly conflicts: readonly ConflictRecord[];
}

function defaultMemoryIdForProposal(proposal: MemoryProposal): MemoryId {
  return `mem:${proposal.proposalId}` as MemoryId;
}

function proposalRequiresHuman(proposal: MemoryProposal): boolean {
  return (
    proposal.riskLevel === 'sensitive' ||
    proposal.intendedScope.kind === 'global' ||
    proposal.intendedVisibility.kind === 'global:safe' ||
    proposal.intendedVisibility.kind === 'sealed:sensitive'
  );
}

function proposalLinks(proposal: MemoryProposal): MemoryAtom['links'] {
  return proposal.knownConflicts.map((known) => ({
    relation: 'contradicts',
    targetMemoryId: known.conflictingMemoryId,
  }));
}

function baseScores(
  proposal: MemoryProposal,
  sourceEvents: readonly Event[],
): MemoryAtom['scores'] {
  // Informational metadata only. No runtime allow/abstain/ask_human decision
  // reads these numbers as authority; gates use explicit source, scope,
  // visibility, conflict, status, freshness, and action checks.
  const evidence = sourceEvents.length / proposal.sourceEventIds.length;
  const conflictPenalty = proposal.knownConflicts.length > 0 ? 0.25 : 0;
  const humanPenalty = proposalRequiresHuman(proposal) ? 0.2 : 0;

  return {
    confidence: Math.max(0.2, 0.65 - conflictPenalty),
    evidence,
    authority: Math.max(0, 0.4 - conflictPenalty - humanPenalty),
    freshness: 0.75,
    stability: Math.max(0.2, 0.45 - conflictPenalty),
    consensus: proposal.knownConflicts.length === 0 ? 0.4 : 0.1,
  };
}

function sourceScopeFailure(proposal: MemoryProposal, event: Event): DecisionReason {
  return {
    kind: 'scope_outside_boundary',
    requestedScope: scopeKey(proposal.intendedScope),
    allowedScope: scopeKey(event.scope),
  };
}

export class WriteGate {
  private readonly visibilityPolicy: VisibilityPolicy;
  private readonly clock: Clock;
  private readonly memoryIdForProposal: (proposal: MemoryProposal) => MemoryId;

  constructor(private readonly options: WriteGateOptions) {
    this.visibilityPolicy = options.visibilityPolicy ?? DENY_ALL_VISIBILITY_POLICY;
    this.clock = options.clock ?? SYSTEM_CLOCK;
    this.memoryIdForProposal = options.memoryIdForProposal ?? defaultMemoryIdForProposal;
  }

  async propose(proposal: MemoryProposal): Promise<WriteGateResult> {
    return this.evaluate(proposal);
  }

  async evaluate(proposal: MemoryProposal): Promise<WriteGateResult> {
    const emittedAt = this.clock.now();
    const proposalResult = MemoryProposalSchema.safeParse(proposal);
    if (!proposalResult.success) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'tuple_incomplete',
              missingFields: schemaIssuePaths(proposalResult.error.issues, 'proposal'),
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents: [],
        conflicts: [],
      };
    }

    const validProposal = proposalResult.data;
    const permitted = this.visibilityPolicy.permittedVisibilitiesForAgent(validProposal.proposedBy);

    if (permitted.length === 0) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'visibility_denied',
              detail: 'proposer has no permitted visibility planes',
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents: [],
        conflicts: [],
      };
    }

    if (!includesVisibility(permitted, validProposal.intendedVisibility)) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'visibility_denied',
              detail: 'proposer cannot write the requested visibility plane',
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents: [],
        conflicts: [],
      };
    }

    const sourceEvents = await this.loadSourceEvents(validProposal.sourceEventIds, permitted);

    if (sourceEvents.length !== validProposal.sourceEventIds.length) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'source_check_failed',
              detail: 'one or more source events are missing or not visible',
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents,
        conflicts: [],
      };
    }

    const outOfScopeEvent = sourceEvents.find(
      (event) => !sameScope(event.scope, validProposal.intendedScope),
    );
    if (outOfScopeEvent !== undefined) {
      return {
        decision: decision(
          'block_local',
          [sourceScopeFailure(validProposal, outOfScopeEvent)],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents,
        conflicts: [],
      };
    }

    const knownConflictIds = validProposal.knownConflicts.map((known) => known.conflictingMemoryId);
    const conflicts =
      knownConflictIds.length > 0
        ? await this.options.conflictRegistry.query({
            touchingMemoryIds: knownConflictIds,
            statuses: ['unresolved', 'requires_human'],
            scope: validProposal.intendedScope,
            permittedVisibilities: permitted,
          })
        : [];

    const conflictIds = conflicts.map((conflict) => conflict.conflictId);
    const conflictTargetIds = validProposal.knownConflicts.map(
      (known) => known.conflictingMemoryId,
    );
    const requiresHuman =
      proposalRequiresHuman(validProposal) ||
      validProposal.knownConflicts.length > 0 ||
      conflicts.length > 0;

    const atom: MemoryAtom = {
      memoryId: this.memoryIdForProposal(validProposal),
      memoryType: validProposal.candidateType,
      content: validProposal.claim,
      sourceAgentId: validProposal.proposedBy,
      sourceEventIds: validProposal.sourceEventIds,
      sourceMemoryIds: [],
      scope: validProposal.intendedScope,
      visibility: validProposal.intendedVisibility,
      status: requiresHuman ? 'human_required' : 'candidate',
      scores: baseScores(validProposal, sourceEvents),
      validFrom: validProposal.proposedAt,
      validUntil: null,
      lastConfirmedAt: null,
      links: proposalLinks(validProposal),
    };

    const atomResult = MemoryAtomSchema.safeParse(atom);
    if (!atomResult.success) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'promotion_boundary_blocked',
              detail: `constructed atom failed validation: ${schemaIssuePaths(
                atomResult.error.issues,
                'atom',
              ).join(', ')}`,
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents,
        conflicts,
      };
    }

    const validAtom = atomResult.data;

    // Intentional: sourced/in-scope proposals are recorded even when conflict
    // state makes them non-actionable. The atom carries human_required plus
    // conflict links so the attempted claim remains auditable.
    try {
      await this.options.memoryStore.insert(validAtom);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'memory store insert failed';
      return {
        decision: decision(
          'deny',
          [{ kind: 'promotion_boundary_blocked', detail }],
          [],
          [],
          emittedAt,
        ),
        atom: null,
        sourceEvents,
        conflicts,
      };
    }

    if (conflicts.length > 0) {
      return this.conflictDecision(
        validAtom,
        sourceEvents,
        conflicts,
        conflictTargetIds,
        conflictIds,
        emittedAt,
      );
    }

    if (validProposal.knownConflicts.length > 0) {
      return {
        decision: decision(
          'conflict_boundary_packet',
          [
            {
              kind: 'promotion_boundary_blocked',
              detail: 'proposal declares known conflicts without a resolved conflict record',
            },
          ],
          [validAtom.memoryId, ...conflictTargetIds],
          [],
          emittedAt,
        ),
        atom: validAtom,
        sourceEvents,
        conflicts,
      };
    }

    if (proposalRequiresHuman(validProposal)) {
      return {
        decision: decision(
          'ask_human',
          [humanReason(validProposal)],
          [validAtom.memoryId],
          [],
          emittedAt,
        ),
        atom: validAtom,
        sourceEvents,
        conflicts,
      };
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: [validAtom.memoryId] }],
        [validAtom.memoryId],
        [],
        emittedAt,
      ),
      atom: validAtom,
      sourceEvents,
      conflicts,
    };
  }

  private async loadSourceEvents(
    sourceEventIds: readonly Event['eventId'][],
    permitted: readonly Visibility[],
  ): Promise<readonly Event[]> {
    const events = await Promise.all(
      sourceEventIds.map((eventId) => this.options.eventLedger.get(eventId, permitted)),
    );
    return events.filter((event): event is Event => event !== null);
  }

  private conflictDecision(
    atom: MemoryAtom,
    sourceEvents: readonly Event[],
    conflicts: readonly ConflictRecord[],
    conflictTargetIds: readonly MemoryId[],
    conflictIds: readonly ConflictId[],
    emittedAt: ReturnType<Clock['now']>,
  ): WriteGateResult {
    return {
      decision: decision(
        'conflict_boundary_packet',
        conflicts.map((conflict) => ({
          kind: 'unresolved_conflict',
          conflictId: conflict.conflictId,
        })),
        [atom.memoryId, ...conflictTargetIds],
        conflictIds,
        emittedAt,
      ),
      atom,
      sourceEvents,
      conflicts,
    };
  }
}

function schemaIssuePaths(
  issues: readonly { readonly path: readonly (string | number)[] }[],
  fallback: string,
): string[] {
  const paths = issues.map((issue) =>
    issue.path.length > 0 ? issue.path.map(String).join('.') : fallback,
  );
  return paths.length > 0 ? paths : [fallback];
}

function humanReason(proposal: MemoryProposal): DecisionReason {
  if (proposal.riskLevel === 'sensitive') {
    return { kind: 'sensitive_action', actionClass: 'durable_memory_write' };
  }
  return {
    kind: 'promotion_boundary_blocked',
    detail: 'global, sealed, or globally visible memory requires human review',
  };
}
