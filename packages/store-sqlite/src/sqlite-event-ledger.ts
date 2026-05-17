/**
 * SQLite-backed EventLedger.
 *
 * Enforces append-only at the storage layer:
 *   - INSERT only. Duplicate event_id throws (no OR REPLACE, no OR IGNORE).
 *   - No DELETE or UPDATE path exposed.
 *
 * Permission filtering is done in SQL via the `visibility_key` index.
 */

import {
  type Event,
  type EventId,
  type EventLedger,
  type EventQuery,
  EventSchema,
  type Visibility,
  scopeKey,
} from '@aletheia/core';
import type Database from 'better-sqlite3';
import { type EventRow, eventToRow, permittedClause, rowToEvent } from './codec.js';

export class SqliteEventLedger implements EventLedger {
  private readonly insertStmt: Database.Statement;
  private readonly getStmt: Database.Statement<[string]>;

  /**
   * Create an EventLedger backed by an existing `better-sqlite3` connection.
   *
   * @remarks
   * Callers normally use `openSqliteStores()` instead. Direct construction is
   * useful when a host owns connection lifecycle or wants to compose stores
   * manually.
   */
  constructor(private readonly db: Database.Database) {
    this.insertStmt = db.prepare(`
      INSERT INTO events (
        event_id, kind, agent_id, occurred_at,
        payload_json, scope_json, visibility_json,
        scope_key, visibility_key, inserted_at
      ) VALUES (
        @event_id, @kind, @agent_id, @occurred_at,
        @payload_json, @scope_json, @visibility_json,
        @scope_key, @visibility_key, @inserted_at
      )
    `);

    this.getStmt = db.prepare<[string], EventRow>('SELECT * FROM events WHERE event_id = ?');
  }

  /**
   * Append one validated event to SQLite.
   *
   * @remarks
   * Implementation uses plain INSERT and lets the primary key enforce
   * append-only semantics. Duplicate IDs throw instead of replacing or ignoring
   * existing evidence.
   */
  async append(event: Event): Promise<EventId> {
    // Validate before persisting. The schema enforces shape; SQLite enforces uniqueness.
    const validated = EventSchema.parse(event);
    const row = eventToRow(validated, new Date().toISOString());

    try {
      this.insertStmt.run(row);
    } catch (err) {
      // better-sqlite3 throws SqliteError with code SQLITE_CONSTRAINT_PRIMARYKEY on duplicate
      if (err instanceof Error && err.message.includes('UNIQUE')) {
        throw new Error(`EventLedger.append: duplicate event_id "${row.event_id}"`);
      }
      throw err;
    }

    return validated.eventId;
  }

  /**
   * Load one event if the caller can see its visibility plane.
   *
   * @remarks
   * A missing row and a hidden row both return `null` so callers cannot infer
   * the existence of inaccessible evidence.
   */
  async get(eventId: EventId, permittedVisibilities: readonly Visibility[]): Promise<Event | null> {
    const row = this.getStmt.get(eventId) as EventRow | undefined;
    if (!row) return null;

    // Permission filter: never leak existence of events the caller can't see.
    const allowed = permittedClause(permittedVisibilities);
    if (allowed.params.length === 0 || !allowed.params.includes(row.visibility_key)) {
      return null;
    }

    return rowToEvent(row);
  }

  /**
   * Query visible events in deterministic chronological order.
   *
   * @remarks
   * The SQL WHERE clause always starts with the permission predicate generated
   * by `permittedClause()`, preserving permission-before-selection.
   */
  async query(filter: EventQuery): Promise<readonly Event[]> {
    const where: string[] = [];
    const params: unknown[] = [];

    // Permission filter ALWAYS first.
    const allowed = permittedClause(filter.permittedVisibilities);
    where.push(allowed.clause);
    params.push(...allowed.params);

    if (filter.agentId !== undefined) {
      where.push('agent_id = ?');
      params.push(filter.agentId);
    }
    if (filter.since !== undefined) {
      where.push('occurred_at >= ?');
      params.push(filter.since);
    }
    if (filter.until !== undefined) {
      where.push('occurred_at <= ?');
      params.push(filter.until);
    }
    if (filter.scope !== undefined) {
      where.push('scope_key = ?');
      params.push(scopeKey(filter.scope));
    }

    const limitClause = filter.limit !== undefined ? `LIMIT ${Math.floor(filter.limit)}` : '';
    const sql = `
      SELECT * FROM events
      WHERE ${where.join(' AND ')}
      ORDER BY occurred_at ASC, event_id ASC
      ${limitClause}
    `;

    const rows = this.db.prepare(sql).all(...params) as EventRow[];
    return rows.map(rowToEvent);
  }

  /**
   * Count visible events matching the same filters as `query()`.
   *
   * @remarks
   * Use this for coverage/audit summaries without materializing rows.
   */
  async count(filter: EventQuery): Promise<number> {
    const where: string[] = [];
    const params: unknown[] = [];

    const allowed = permittedClause(filter.permittedVisibilities);
    where.push(allowed.clause);
    params.push(...allowed.params);

    if (filter.agentId !== undefined) {
      where.push('agent_id = ?');
      params.push(filter.agentId);
    }
    if (filter.since !== undefined) {
      where.push('occurred_at >= ?');
      params.push(filter.since);
    }
    if (filter.until !== undefined) {
      where.push('occurred_at <= ?');
      params.push(filter.until);
    }
    if (filter.scope !== undefined) {
      where.push('scope_key = ?');
      params.push(scopeKey(filter.scope));
    }

    const sql = `SELECT COUNT(*) as n FROM events WHERE ${where.join(' AND ')}`;
    const row = this.db.prepare(sql).get(...params) as { n: number };
    return row.n;
  }
}
