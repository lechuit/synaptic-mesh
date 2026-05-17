/**
 * RetrievalRouter — authority-first recall.
 *
 * This is deliberately not semantic search. Routing order is permission,
 * status/scope/type, conflict state, then optional host-provided exact topic
 * matching. Without a topic matcher, topic queries fail closed.
 */

import type { ConflictRegistry, MemoryStore } from '../storage/index.js';
import type {
  ConflictRecord,
  DecisionReason,
  MemoryAtom,
  MemoryStatus,
  RecallQuery,
  RetrievalDecision,
  Visibility,
} from '../types/index.js';
import { RecallQuerySchema } from '../types/index.js';
import type { Clock } from './decision-helpers.js';
import { SYSTEM_CLOCK, decision } from './decision-helpers.js';
import { DENY_ALL_VISIBILITY_POLICY, type VisibilityPolicy } from './visibility-policy.js';

export interface RetrievalRouterOptions {
  readonly memoryStore: MemoryStore;
  readonly conflictRegistry: ConflictRegistry;
  readonly visibilityPolicy?: VisibilityPolicy;
  readonly topicMatcher?: (atom: MemoryAtom, topic: string) => boolean;
  readonly clock?: Clock;
}

export interface RetrievalResult {
  readonly decision: RetrievalDecision;
  readonly atoms: readonly MemoryAtom[];
  readonly conflicts: readonly ConflictRecord[];
}

const DEFAULT_RECALL_STATUSES: readonly MemoryStatus[] = ['verified', 'trusted'];

export class RetrievalRouter {
  private readonly visibilityPolicy: VisibilityPolicy;
  private readonly clock: Clock;

  /**
   * Create an authority-first recall router.
   *
   * @remarks
   * The optional topic matcher is an exact host-provided predicate, not an
   * embedding or semantic ranking hook. If a topic query is supplied without a
   * matcher, recall fails closed.
   */
  constructor(private readonly options: RetrievalRouterOptions) {
    this.visibilityPolicy = options.visibilityPolicy ?? DENY_ALL_VISIBILITY_POLICY;
    this.clock = options.clock ?? SYSTEM_CLOCK;
  }

  /**
   * Recall atoms that are visible, in scope, currently valid, and actionable.
   *
   * @remarks
   * Implementation order is permission before semantics: caller visibility is
   * resolved first, then the store query applies scope/status/freshness, then
   * optional type/topic filtering, then conflict checks. The returned decision
   * must be inspected before passing atoms to a model.
   */
  async recall(query: RecallQuery): Promise<RetrievalResult> {
    const emittedAt = this.clock.now();
    const queryResult = RecallQuerySchema.safeParse(query);
    if (!queryResult.success) {
      return {
        decision: decision(
          'fetch_abstain',
          [
            {
              kind: 'tuple_incomplete',
              missingFields: schemaIssuePaths(queryResult.error.issues, 'query'),
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atoms: [],
        conflicts: [],
      };
    }

    const validQuery = queryResult.data;
    const permitted = this.visibilityPolicy.permittedVisibilitiesForAgent(validQuery.agentId);

    if (permitted.length === 0) {
      return {
        decision: decision(
          'fetch_abstain',
          [
            {
              kind: 'visibility_denied',
              detail: 'caller has no permitted visibility planes',
            },
          ],
          [],
          [],
          emittedAt,
        ),
        atoms: [],
        conflicts: [],
      };
    }

    if (validQuery.topic !== undefined && this.options.topicMatcher === undefined) {
      return {
        decision: decision(
          'fetch_abstain',
          [{ kind: 'tuple_incomplete', missingFields: ['topicIndex'] }],
          [],
          [],
          emittedAt,
        ),
        atoms: [],
        conflicts: [],
      };
    }

    const atoms = await this.loadAtoms(validQuery, permitted);
    if (atoms.length === 0) {
      return {
        decision: decision(
          'fetch_abstain',
          [{ kind: 'tuple_incomplete', missingFields: ['memoryAtoms'] }],
          [],
          [],
          emittedAt,
        ),
        atoms: [],
        conflicts: [],
      };
    }

    const nonActionableReason = firstNonActionableReason(atoms);
    if (nonActionableReason !== null) {
      return {
        decision: decision(
          nonActionableReason.outcome,
          [nonActionableReason.reason],
          atoms.map((atom) => atom.memoryId),
          [],
          emittedAt,
        ),
        atoms,
        conflicts: [],
      };
    }

    const memoryIds = atoms.map((atom) => atom.memoryId);
    const conflicts = await this.options.conflictRegistry.query({
      touchingMemoryIds: memoryIds,
      statuses: ['unresolved', 'requires_human'],
      scope: validQuery.scope,
      permittedVisibilities: permitted,
    });

    if (conflicts.length > 0) {
      return {
        decision: decision(
          'conflict_boundary_packet',
          conflicts.map((conflict) => ({
            kind: 'unresolved_conflict',
            conflictId: conflict.conflictId,
          })),
          memoryIds,
          conflicts.map((conflict) => conflict.conflictId),
          emittedAt,
        ),
        atoms,
        conflicts,
      };
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [{ kind: 'all_checks_passed', citedMemoryIds: memoryIds }],
        memoryIds,
        [],
        emittedAt,
      ),
      atoms,
      conflicts,
    };
  }

  private async loadAtoms(
    query: RecallQuery,
    permittedVisibilities: readonly Visibility[],
  ): Promise<readonly MemoryAtom[]> {
    const atoms = await this.options.memoryStore.query({
      statuses: query.requiredStatus ?? DEFAULT_RECALL_STATUSES,
      scope: query.scope,
      permittedVisibilities,
      validAt: this.clock.now(),
    });

    const filtered = atoms.filter((atom) => {
      if (query.memoryTypes !== undefined && !query.memoryTypes.includes(atom.memoryType)) {
        return false;
      }
      if (query.topic !== undefined) {
        return this.options.topicMatcher?.(atom, query.topic) ?? false;
      }
      return true;
    });

    return query.limit !== undefined ? filtered.slice(0, query.limit) : filtered;
  }
}

function firstNonActionableReason(
  atoms: readonly MemoryAtom[],
): { outcome: 'ask_human' | 'deny' | 'fetch_abstain'; reason: DecisionReason } | null {
  const humanRequired = atoms.find(
    (atom) => atom.status === 'human_required' || atom.status === 'sealed',
  );
  if (humanRequired !== undefined) {
    return {
      outcome: 'ask_human',
      reason: {
        kind: 'promotion_boundary_blocked',
        detail: `memory ${humanRequired.memoryId} requires human or sealed handling`,
      },
    };
  }

  const rejected = atoms.find((atom) => atom.status === 'rejected' || atom.status === 'deprecated');
  if (rejected !== undefined) {
    return {
      outcome: 'deny',
      reason: {
        kind: 'promotion_boundary_blocked',
        detail: `memory ${rejected.memoryId} is ${rejected.status}`,
      },
    };
  }

  const candidate = atoms.find((atom) => atom.status === 'candidate');
  if (candidate !== undefined) {
    return {
      outcome: 'fetch_abstain',
      reason: {
        kind: 'tuple_incomplete',
        missingFields: [`verifiedAuthority:${candidate.memoryId}`],
      },
    };
  }

  return null;
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
