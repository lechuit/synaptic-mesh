/**
 * ActionAuthorizer — receiver-side `tryAct` guard.
 *
 * The Action Context Packet is not a permission token. This guard re-checks
 * the cited atoms against visibility, scope, status, conflicts, and action
 * sensitivity before allowing only local/shadow effects.
 */

import type { ConflictRegistry, MemoryStore } from '../storage/index.js';
import {
  type ActionContext,
  ActionContextSchema,
  type ActionDecision,
  type ConflictRecord,
  type DecisionReason,
  type MemoryAtom,
  type MemoryId,
  type ProposedAction,
  ProposedActionSchema,
  SAFE_LOCAL_ACTIONS,
  SENSITIVE_ACTIONS,
  type Visibility,
  scopeKey,
} from '../types/index.js';
import type { Clock } from './decision-helpers.js';
import { SYSTEM_CLOCK, decision } from './decision-helpers.js';
import { sameScope } from './scope-helpers.js';
import { DENY_ALL_VISIBILITY_POLICY, type VisibilityPolicy } from './visibility-policy.js';

export interface ActionAuthorizerOptions {
  readonly memoryStore: MemoryStore;
  readonly conflictRegistry: ConflictRegistry;
  readonly visibilityPolicy?: VisibilityPolicy;
  readonly clock?: Clock;
}

export interface ActionAuthorizationResult {
  readonly decision: ActionDecision;
  readonly citedAtoms: readonly MemoryAtom[];
  readonly conflicts: readonly ConflictRecord[];
}

export class ActionAuthorizer {
  private readonly visibilityPolicy: VisibilityPolicy;
  private readonly clock: Clock;

  constructor(private readonly options: ActionAuthorizerOptions) {
    this.visibilityPolicy = options.visibilityPolicy ?? DENY_ALL_VISIBILITY_POLICY;
    this.clock = options.clock ?? SYSTEM_CLOCK;
  }

  async tryAct(action: ProposedAction, context: ActionContext): Promise<ActionAuthorizationResult> {
    const emittedAt = this.clock.now();

    const contextResult = ActionContextSchema.safeParse(context);
    if (!contextResult.success) {
      return {
        decision: decision(
          'fetch_abstain',
          [
            {
              kind: 'tuple_incomplete',
              missingFields: schemaIssuePaths(contextResult.error.issues, 'context'),
            },
          ],
          [],
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    const validContext = contextResult.data;
    const actionResult = ProposedActionSchema.safeParse(action);
    if (!actionResult.success) {
      return {
        decision: decision(
          'ask_human',
          [{ kind: 'unknown_action', raw: 'invalid proposed action' }],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    const validAction = actionResult.data;

    if (SENSITIVE_ACTIONS.has(validAction.classifiedAction)) {
      return {
        decision: decision(
          'ask_human',
          [
            {
              kind: 'sensitive_action',
              actionClass: validAction.classifiedAction,
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    if (!SAFE_LOCAL_ACTIONS.has(validAction.classifiedAction)) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'forbidden_effect_present',
              effect: validAction.classifiedAction,
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    if (validContext.citedMemoryIds.length === 0) {
      return {
        decision: decision(
          'fetch_abstain',
          [{ kind: 'tuple_incomplete', missingFields: ['citedMemoryIds'] }],
          [],
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    const permitted = this.visibilityPolicy.permittedVisibilitiesForAgent(validContext.agentId);
    if (permitted.length === 0) {
      return {
        decision: decision(
          'deny',
          [
            {
              kind: 'visibility_denied',
              detail: 'actor has no permitted visibility planes',
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: [],
        conflicts: [],
      };
    }

    const atoms = await this.loadCitedAtoms(validContext.citedMemoryIds, permitted);
    if (atoms.length !== validContext.citedMemoryIds.length) {
      return {
        decision: decision(
          'fetch_abstain',
          [
            {
              kind: 'source_check_failed',
              detail: 'one or more cited memories are missing or not visible',
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: atoms,
        conflicts: [],
      };
    }

    const outOfScope = atoms.find((atom) => !sameScope(atom.scope, validContext.scope));
    if (outOfScope !== undefined) {
      return {
        decision: decision(
          'block_local',
          [
            {
              kind: 'scope_outside_boundary',
              requestedScope: scopeKey(validContext.scope),
              allowedScope: scopeKey(outOfScope.scope),
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: atoms,
        conflicts: [],
      };
    }

    const invalidAt = atoms.find((atom) => !atomIsValidAt(atom, emittedAt));
    if (invalidAt !== undefined) {
      return {
        decision: decision(
          'fetch_abstain',
          [
            {
              kind: 'freshness_not_current',
              observed: `memory ${invalidAt.memoryId} is not valid at ${emittedAt}`,
            },
          ],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: atoms,
        conflicts: [],
      };
    }

    const statusReason = firstUnsafeStatusReason(atoms);
    if (statusReason !== null) {
      return {
        decision: decision(
          statusReason.outcome,
          [statusReason.reason],
          validContext.citedMemoryIds,
          [],
          emittedAt,
        ),
        citedAtoms: atoms,
        conflicts: [],
      };
    }

    const conflicts = await this.options.conflictRegistry.query({
      touchingMemoryIds: validContext.citedMemoryIds,
      statuses: ['unresolved', 'requires_human'],
      scope: validContext.scope,
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
          validContext.citedMemoryIds,
          conflicts.map((conflict) => conflict.conflictId),
          emittedAt,
        ),
        citedAtoms: atoms,
        conflicts,
      };
    }

    return {
      decision: decision(
        'allow_local_shadow',
        [
          {
            kind: 'all_checks_passed',
            citedMemoryIds: validContext.citedMemoryIds,
          },
        ],
        validContext.citedMemoryIds,
        [],
        emittedAt,
      ),
      citedAtoms: atoms,
      conflicts,
    };
  }

  private async loadCitedAtoms(
    memoryIds: readonly MemoryId[],
    permitted: readonly Visibility[],
  ): Promise<readonly MemoryAtom[]> {
    const atoms = await Promise.all(
      memoryIds.map((memoryId) => this.options.memoryStore.get(memoryId, permitted)),
    );
    return atoms.filter((atom): atom is MemoryAtom => atom !== null);
  }
}

function firstUnsafeStatusReason(
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

function atomIsValidAt(atom: MemoryAtom, at: ReturnType<Clock['now']>): boolean {
  if (atom.validFrom > at) return false;
  if (atom.validUntil !== null && atom.validUntil < at) return false;
  return true;
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
