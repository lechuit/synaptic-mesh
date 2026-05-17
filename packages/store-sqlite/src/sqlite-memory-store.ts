/**
 * SQLite-backed MemoryStore.
 *
 * Enforces:
 *   - Atoms inserted exactly once (UNIQUE memory_id).
 *   - Status transitions go through `transitionStatus` only — no UPDATE path
 *     for `content`, `scope`, `visibility`, `scores`, or `links`.
 *   - Allowed transitions come from `isAllowedTransition` in core.
 *   - Every transition is recorded in `memory_status_history`.
 */

import {
  type AgentId,
  type IsoTimestamp,
  IsoTimestampSchema,
  type MemoryAtom,
  MemoryAtomSchema,
  type MemoryId,
  type MemoryQuery,
  type MemoryStatus,
  type MemoryStore,
  type StatusTransitionOptions,
  type StatusTransitionReason,
  type StatusTransitionResult,
  type Visibility,
  isAllowedTransition,
  scopeKey,
} from '@aletheia/core';
import type Database from 'better-sqlite3';
import { type AtomRow, atomToRow, permittedClause, rowToAtom } from './codec.js';

interface StatusHistoryRow {
  from_status: string | null;
  to_status: string;
  rationale: string;
  actor: string;
  conflict_id: string | null;
  at: string;
}

export class SqliteMemoryStore implements MemoryStore {
  private readonly insertAtom: Database.Statement;
  private readonly getAtom: Database.Statement<[string]>;
  private readonly updateStatus: Database.Statement;
  private readonly insertHistory: Database.Statement;
  private readonly historyQuery: Database.Statement<[string]>;

  constructor(private readonly db: Database.Database) {
    this.insertAtom = db.prepare(`
      INSERT INTO memory_atoms (
        memory_id, memory_type, content, source_agent_id,
        source_event_ids_json, source_memory_ids_json,
        scope_json, visibility_json, status, scores_json,
        valid_from, valid_until, last_confirmed_at, links_json,
        scope_key, visibility_key, inserted_at
      ) VALUES (
        @memory_id, @memory_type, @content, @source_agent_id,
        @source_event_ids_json, @source_memory_ids_json,
        @scope_json, @visibility_json, @status, @scores_json,
        @valid_from, @valid_until, @last_confirmed_at, @links_json,
        @scope_key, @visibility_key, @inserted_at
      )
    `);

    this.getAtom = db.prepare<[string], AtomRow>('SELECT * FROM memory_atoms WHERE memory_id = ?');

    this.updateStatus = db.prepare('UPDATE memory_atoms SET status = ? WHERE memory_id = ?');

    this.insertHistory = db.prepare(`
      INSERT INTO memory_status_history (
        memory_id, from_status, to_status, rationale, actor, conflict_id, at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    this.historyQuery = db.prepare<[string], StatusHistoryRow>(
      'SELECT * FROM memory_status_history WHERE memory_id = ? ORDER BY at ASC, id ASC',
    );
  }

  async insert(atom: MemoryAtom): Promise<MemoryAtom> {
    const validated = MemoryAtomSchema.parse(atom);
    const now = new Date().toISOString();
    const row = atomToRow(validated, now);

    const tx = this.db.transaction(() => {
      try {
        this.insertAtom.run(row);
      } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE')) {
          throw new Error(`MemoryStore.insert: duplicate memory_id "${row.memory_id}"`);
        }
        throw err;
      }
      // Record the initial status with from_status=null.
      this.insertHistory.run(
        row.memory_id,
        null,
        row.status,
        'initial insertion',
        row.source_agent_id,
        null,
        now,
      );
    });
    tx();

    return validated;
  }

  async get(
    memoryId: MemoryId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<MemoryAtom | null> {
    const row = this.getAtom.get(memoryId) as AtomRow | undefined;
    if (!row) return null;

    const allowed = permittedClause(permittedVisibilities);
    if (allowed.params.length === 0 || !allowed.params.includes(row.visibility_key)) {
      return null;
    }
    return rowToAtom(row);
  }

  async query(filter: MemoryQuery): Promise<readonly MemoryAtom[]> {
    const where: string[] = [];
    const params: unknown[] = [];

    // Permission first.
    const allowed = permittedClause(filter.permittedVisibilities);
    where.push(allowed.clause);
    params.push(...allowed.params);

    if (filter.statuses !== undefined && filter.statuses.length > 0) {
      where.push(`status IN (${filter.statuses.map(() => '?').join(', ')})`);
      params.push(...filter.statuses);
    }
    if (filter.scope !== undefined) {
      where.push('scope_key = ?');
      params.push(scopeKey(filter.scope));
    }
    if (filter.validAt !== undefined) {
      where.push('valid_from <= ?');
      params.push(filter.validAt);
      where.push('(valid_until IS NULL OR valid_until >= ?)');
      params.push(filter.validAt);
    }

    const limitClause = filter.limit !== undefined ? `LIMIT ${Math.floor(filter.limit)}` : '';
    const sql = `
      SELECT * FROM memory_atoms
      WHERE ${where.join(' AND ')}
      ORDER BY valid_from DESC, memory_id ASC
      ${limitClause}
    `;
    const rows = this.db.prepare(sql).all(...params) as AtomRow[];
    return rows.map(rowToAtom);
  }

  async transitionStatus(
    memoryId: MemoryId,
    nextStatus: MemoryStatus,
    reason: StatusTransitionReason,
    options?: StatusTransitionOptions,
  ): Promise<StatusTransitionResult> {
    const row = this.getAtom.get(memoryId) as AtomRow | undefined;
    if (!row) {
      return { kind: 'rejected', reason: `memory_id "${memoryId}" not found` };
    }

    const current = row.status as MemoryStatus;
    if (current === nextStatus) {
      return { kind: 'rejected', reason: `already in status "${current}"` };
    }
    if (!isAllowedTransition(current, nextStatus)) {
      return {
        kind: 'rejected',
        reason: `transition not allowed: ${current} → ${nextStatus}`,
      };
    }

    const now =
      options?.at !== undefined ? IsoTimestampSchema.parse(options.at) : new Date().toISOString();
    const tx = this.db.transaction(() => {
      this.updateStatus.run(nextStatus, memoryId);
      this.insertHistory.run(
        memoryId,
        current,
        nextStatus,
        reason.rationale,
        reason.actor,
        reason.conflictId ?? null,
        now,
      );
    });
    tx();

    const updated = this.getAtom.get(memoryId) as AtomRow;
    return { kind: 'applied', atom: rowToAtom(updated) };
  }

  async statusHistory(memoryId: MemoryId): Promise<
    readonly {
      at: IsoTimestamp;
      fromStatus: MemoryStatus | null;
      toStatus: MemoryStatus;
      reason: StatusTransitionReason;
    }[]
  > {
    const rows = this.historyQuery.all(memoryId) as StatusHistoryRow[];
    return rows.map((r) => ({
      at: r.at as IsoTimestamp,
      fromStatus: r.from_status as MemoryStatus | null,
      toStatus: r.to_status as MemoryStatus,
      reason: {
        rationale: r.rationale,
        actor: r.actor as AgentId,
        ...(r.conflict_id !== null ? { conflictId: r.conflict_id } : {}),
      },
    }));
  }
}
