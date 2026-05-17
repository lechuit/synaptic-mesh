/**
 * MemoryStore — persistent store of MemoryAtoms.
 *
 * Hard contracts (from specs/aletheia-memory-authority-v0.md):
 *   - Atoms are append-only by ID. "Modifying" an atom produces a successor
 *     atom with a `supersedes` link; the original is never mutated.
 *   - Status transitions are tracked explicitly via `transitionStatus` —
 *     never a free-form UPDATE.
 *   - Permission filtering precedes selection. Always.
 *   - Sealed and human_required atoms never come back from `query` for
 *     non-authorized callers (the store does not leak existence).
 */

import type { MemoryStatus, Scope, Visibility } from '../types/enums.js';
import type { MemoryAtom } from '../types/memory-atom.js';
import type { AgentId, IsoTimestamp, MemoryId } from '../types/primitives.js';

/**
 * Reason a status transition was requested. The store records this in an
 * audit log alongside the transition.
 */
export interface StatusTransitionReason {
  /** Free-form rationale. Short. */
  readonly rationale: string;
  /** Agent or operator responsible for the transition. */
  readonly actor: AgentId;
  /** Optional related conflict that motivated the transition. */
  readonly conflictId?: string;
}

export interface StatusTransitionOptions {
  /**
   * Effective transition timestamp. Deterministic runners pass their logical
   * clock here; stores default to their local clock when omitted.
   */
  readonly at?: IsoTimestamp;
}

export interface MemoryQuery {
  /** Filter to atoms of these statuses. */
  readonly statuses?: readonly MemoryStatus[];
  /** Filter to a specific scope. */
  readonly scope?: Scope;
  /**
   * The visibility planes the caller is permitted to see.
   * Spec rule: permission filtering happens BEFORE any other selection.
   */
  readonly permittedVisibilities: readonly Visibility[];
  /** Filter to atoms valid at this instant (default: now). */
  readonly validAt?: IsoTimestamp;
  /** Max results to return. */
  readonly limit?: number;
}

/**
 * Outcome of a status transition request.
 *
 * `applied` means the transition was recorded; `rejected` means the store
 * refused (illegal transition, permission denial, etc.). Rejections never
 * throw — fail-closed returns a structured value.
 */
export type StatusTransitionResult =
  | { readonly kind: 'applied'; readonly atom: MemoryAtom }
  | { readonly kind: 'rejected'; readonly reason: string };

export interface MemoryStore {
  /**
   * Insert a new atom. Atoms are immutable once written; ID collisions throw.
   */
  insert(atom: MemoryAtom): Promise<MemoryAtom>;

  /**
   * Retrieve an atom by ID, subject to permission filtering.
   * Returns null both when the atom does not exist and when the caller cannot see it.
   */
  get(memoryId: MemoryId, permittedVisibilities: readonly Visibility[]): Promise<MemoryAtom | null>;

  /**
   * Query atoms. Returns in `validFrom` descending order (newest first)
   * unless an implementation documents otherwise.
   */
  query(filter: MemoryQuery): Promise<readonly MemoryAtom[]>;

  /**
   * Transition an atom's status. Records the transition in an internal log.
   * Never a free-form UPDATE — only documented transitions are accepted.
   */
  transitionStatus(
    memoryId: MemoryId,
    nextStatus: MemoryStatus,
    reason: StatusTransitionReason,
    options?: StatusTransitionOptions,
  ): Promise<StatusTransitionResult>;

  /**
   * Get the full status history of an atom. Useful for audit and Phase 2 dynamics.
   */
  statusHistory(memoryId: MemoryId): Promise<
    readonly {
      readonly at: IsoTimestamp;
      readonly fromStatus: MemoryStatus | null;
      readonly toStatus: MemoryStatus;
      readonly reason: StatusTransitionReason;
    }[]
  >;
}
