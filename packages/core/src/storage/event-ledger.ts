/**
 * EventLedger — append-only record of raw events.
 *
 * Hard contract (from specs/aletheia-memory-authority-v0.md §1):
 *   - APPEND ONLY. No update, no delete. Tombstones are themselves events.
 *   - Events are evidence, not authority.
 *   - Order is stable: an event written at t cannot be re-ordered against
 *     an event written at t' > t.
 *
 * Implementations must enforce all of the above at the storage level, not
 * trust callers.
 */

import type { Scope, Visibility } from '../types/enums.js';
import type { Event } from '../types/event.js';
import type { AgentId, EventId, IsoTimestamp } from '../types/primitives.js';

/**
 * Filter passed to `query`. All fields optional; an empty filter returns
 * everything the caller is permitted to see.
 */
export interface EventQuery {
  /** Filter to events from a specific agent. */
  readonly agentId?: AgentId;
  /** Filter to events recorded at or after this time. */
  readonly since?: IsoTimestamp;
  /** Filter to events recorded at or before this time. */
  readonly until?: IsoTimestamp;
  /** Filter to a specific scope. */
  readonly scope?: Scope;
  /**
   * The visibility planes the caller is permitted to see.
   * Spec rule: permission filtering happens BEFORE any other selection.
   */
  readonly permittedVisibilities: readonly Visibility[];
  /** Max results to return (default implementation-defined). */
  readonly limit?: number;
}

export interface EventLedger {
  /**
   * Append an event to the ledger.
   * @returns the EventId actually stored. Implementations may generate the ID
   *          if `event.eventId` is left to the implementation.
   * @throws if the event is malformed or if an event with the same ID exists.
   *         Append-only means duplicate IDs are an error, not an overwrite.
   */
  append(event: Event): Promise<EventId>;

  /**
   * Retrieve a specific event by ID. Returns null if not found OR if the
   * caller does not have visibility to it (the ledger does not leak existence).
   */
  get(eventId: EventId, permittedVisibilities: readonly Visibility[]): Promise<Event | null>;

  /**
   * Query events. Returns in `occurredAt` ascending order (oldest first).
   * Permission filtering applies before any other selection.
   */
  query(filter: EventQuery): Promise<readonly Event[]>;

  /**
   * Count events matching the filter. Useful for coverage receipts.
   */
  count(filter: EventQuery): Promise<number>;
}
