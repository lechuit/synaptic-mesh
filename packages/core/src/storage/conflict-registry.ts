/**
 * ConflictRegistry — first-class store of contradictions.
 *
 * Hard contracts (from specs/aletheia-memory-authority-v0.md §6):
 *   - Contradictions are NEVER overwritten by summaries.
 *   - Unresolved current-source conflicts preserve candidate claims.
 *   - Summaries must not hide conflicts.
 *   - Tombstones/rejections remain non-actionable through summaries.
 *
 * Like atoms, conflict records are append-only; resolution is itself a new
 * record (or an update to the status field via an explicit `resolve` call,
 * which is recorded in history).
 */

import type { ConflictRecord, ConflictStatus } from '../types/conflict.js';
import type { Scope, Visibility } from '../types/enums.js';
import type { AgentId, ConflictId, IsoTimestamp, MemoryId } from '../types/primitives.js';

export interface ConflictQuery {
  /** Filter to conflicts touching these atoms (any side of the conflict). */
  readonly touchingMemoryIds?: readonly MemoryId[];
  /** Filter to specific statuses. */
  readonly statuses?: readonly ConflictStatus[];
  /** Filter by scope. */
  readonly scope?: Scope;
  /** Permission filter — applied first. */
  readonly permittedVisibilities: readonly Visibility[];
}

export interface ResolveReason {
  readonly rationale: string;
  readonly actor: AgentId;
  /** Which claim was preferred, if any (null when the resolution is "all rejected"). */
  readonly preferredMemoryId: MemoryId | null;
}

export interface ConflictRegistry {
  /**
   * Record a new conflict. The conflict is `unresolved` by default.
   */
  record(conflict: ConflictRecord): Promise<ConflictRecord>;

  /**
   * Retrieve a conflict by ID, subject to permission filtering.
   */
  get(
    conflictId: ConflictId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<ConflictRecord | null>;

  /**
   * Query conflicts. Returns in `recordedAt` descending order.
   */
  query(filter: ConflictQuery): Promise<readonly ConflictRecord[]>;

  /**
   * Resolve a conflict. Records the resolution in history.
   * Returns the updated record, or null if not found / not permitted.
   */
  resolve(
    conflictId: ConflictId,
    nextStatus: Exclude<ConflictStatus, 'unresolved'>,
    reason: ResolveReason,
  ): Promise<ConflictRecord | null>;

  /**
   * History of resolution attempts on a conflict.
   */
  resolutionHistory(conflictId: ConflictId): Promise<
    readonly {
      readonly at: IsoTimestamp;
      readonly fromStatus: ConflictStatus;
      readonly toStatus: ConflictStatus;
      readonly reason: ResolveReason;
    }[]
  >;
}
