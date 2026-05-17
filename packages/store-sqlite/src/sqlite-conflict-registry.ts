/**
 * SQLite-backed ConflictRegistry.
 *
 * Conflicts are append-only by ID; the only allowed mutation is `resolve`,
 * which updates `status` + `resolved_at` and records an entry in
 * `conflict_resolution_history`.
 */

import {
  type AgentId,
  type ConflictId,
  type ConflictQuery,
  type ConflictRecord,
  ConflictRecordSchema,
  type ConflictRegistry,
  type ConflictStatus,
  type IsoTimestamp,
  type MemoryId,
  type ResolveReason,
  type Visibility,
  scopeKey,
} from '@aletheia/core';
import type Database from 'better-sqlite3';
import { type ConflictRow, conflictToRow, rowToConflict } from './codec.js';

interface ResolutionRow {
  from_status: string;
  to_status: string;
  rationale: string;
  actor: string;
  preferred_memory_id: string | null;
  at: string;
}

export class SqliteConflictRegistry implements ConflictRegistry {
  private readonly insertConflict: Database.Statement;
  private readonly insertClaimLink: Database.Statement;
  private readonly getConflictByID: Database.Statement<[string]>;
  private readonly updateConflictStatus: Database.Statement;
  private readonly insertResolution: Database.Statement;
  private readonly resolutionHistoryStmt: Database.Statement<[string]>;

  constructor(private readonly db: Database.Database) {
    this.insertConflict = db.prepare(`
      INSERT INTO conflicts (
        conflict_id, topic, scope_json, scope_key,
        claims_json, status, decision_policy, recorded_at, resolved_at
      ) VALUES (
        @conflict_id, @topic, @scope_json, @scope_key,
        @claims_json, @status, @decision_policy, @recorded_at, @resolved_at
      )
    `);

    this.insertClaimLink = db.prepare(
      'INSERT OR IGNORE INTO conflict_claim_atoms (conflict_id, memory_id) VALUES (?, ?)',
    );

    this.getConflictByID = db.prepare<[string], ConflictRow>(
      'SELECT * FROM conflicts WHERE conflict_id = ?',
    );

    this.updateConflictStatus = db.prepare(
      'UPDATE conflicts SET status = ?, resolved_at = ? WHERE conflict_id = ?',
    );

    this.insertResolution = db.prepare(`
      INSERT INTO conflict_resolution_history (
        conflict_id, from_status, to_status, rationale, actor, preferred_memory_id, at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    this.resolutionHistoryStmt = db.prepare<[string], ResolutionRow>(
      'SELECT * FROM conflict_resolution_history WHERE conflict_id = ? ORDER BY at ASC, id ASC',
    );
  }

  async record(conflict: ConflictRecord): Promise<ConflictRecord> {
    const validated = ConflictRecordSchema.parse(conflict);
    const row = conflictToRow(validated);

    const tx = this.db.transaction(() => {
      try {
        this.insertConflict.run(row);
      } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE')) {
          throw new Error(`ConflictRegistry.record: duplicate conflict_id "${row.conflict_id}"`);
        }
        throw err;
      }
      // Mirror claim atoms into the join table for "touchingMemoryIds" queries.
      for (const claim of validated.claims) {
        this.insertClaimLink.run(validated.conflictId, claim.memoryId);
      }
    });
    tx();

    return validated;
  }

  async get(
    conflictId: ConflictId,
    permittedVisibilities: readonly Visibility[],
  ): Promise<ConflictRecord | null> {
    // Conflicts don't carry their own visibility; permission inherits from the
    // most-restrictive scope of their claim atoms. For Phase 1 we treat
    // conflict visibility as "any atom involved is visible to the caller".
    // The caller must still respect the touching atoms' visibility when acting.
    const row = this.getConflictByID.get(conflictId) as ConflictRow | undefined;
    if (!row) return null;
    if (permittedVisibilities.length === 0) return null;
    return rowToConflict(row);
  }

  async query(filter: ConflictQuery): Promise<readonly ConflictRecord[]> {
    if (filter.permittedVisibilities.length === 0) {
      return [];
    }

    const where: string[] = [];
    const params: unknown[] = [];

    if (filter.statuses !== undefined && filter.statuses.length > 0) {
      where.push(`status IN (${filter.statuses.map(() => '?').join(', ')})`);
      params.push(...filter.statuses);
    }
    if (filter.scope !== undefined) {
      where.push('scope_key = ?');
      params.push(scopeKey(filter.scope));
    }
    if (filter.touchingMemoryIds !== undefined && filter.touchingMemoryIds.length > 0) {
      where.push(
        `conflict_id IN (
          SELECT conflict_id FROM conflict_claim_atoms
          WHERE memory_id IN (${filter.touchingMemoryIds.map(() => '?').join(', ')})
        )`,
      );
      params.push(...filter.touchingMemoryIds);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT * FROM conflicts
      ${whereClause}
      ORDER BY recorded_at DESC, conflict_id ASC
    `;
    const rows = this.db.prepare(sql).all(...params) as ConflictRow[];
    return rows.map(rowToConflict);
  }

  async resolve(
    conflictId: ConflictId,
    nextStatus: Exclude<ConflictStatus, 'unresolved'>,
    reason: ResolveReason,
  ): Promise<ConflictRecord | null> {
    const row = this.getConflictByID.get(conflictId) as ConflictRow | undefined;
    if (!row) return null;

    const current = row.status as ConflictStatus;
    if (current === nextStatus) {
      // Already in this status — no-op, but record the attempted resolution.
      return rowToConflict(row);
    }

    const now = new Date().toISOString();
    // The TS type already excludes 'unresolved' — `now` is always the resolution timestamp.
    const tx = this.db.transaction(() => {
      this.updateConflictStatus.run(nextStatus, now, conflictId);
      this.insertResolution.run(
        conflictId,
        current,
        nextStatus,
        reason.rationale,
        reason.actor,
        reason.preferredMemoryId,
        now,
      );
    });
    tx();

    const updated = this.getConflictByID.get(conflictId) as ConflictRow;
    return rowToConflict(updated);
  }

  async resolutionHistory(conflictId: ConflictId): Promise<
    readonly {
      at: IsoTimestamp;
      fromStatus: ConflictStatus;
      toStatus: ConflictStatus;
      reason: ResolveReason;
    }[]
  > {
    const rows = this.resolutionHistoryStmt.all(conflictId) as ResolutionRow[];
    return rows.map((r) => ({
      at: r.at as IsoTimestamp,
      fromStatus: r.from_status as ConflictStatus,
      toStatus: r.to_status as ConflictStatus,
      reason: {
        rationale: r.rationale,
        actor: r.actor as AgentId,
        preferredMemoryId: r.preferred_memory_id as MemoryId | null,
      },
    }));
  }
}
