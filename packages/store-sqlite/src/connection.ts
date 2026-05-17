/**
 * Database connection lifecycle.
 *
 * Opens a SQLite file (or in-memory database), enables sane pragmas,
 * applies migrations, and returns the connection.
 */

import Database from 'better-sqlite3';
import { applyMigrations } from './migrations.js';

export interface OpenOptions {
  /**
   * Filesystem path to the database file, or `:memory:` for an ephemeral
   * in-process database (useful for tests).
   */
  readonly path: string;
  /** Open in read-only mode. Migrations are skipped. */
  readonly readOnly?: boolean;
}

export interface AletheiaConnection {
  readonly db: Database.Database;
  /** Close the connection. Subsequent calls are no-ops. */
  close(): void;
}

/**
 * Open a connection, enable WAL + foreign keys, and apply migrations.
 */
export function openConnection(options: OpenOptions): AletheiaConnection {
  const db = new Database(options.path, {
    readonly: options.readOnly ?? false,
    fileMustExist: false,
  });

  // Pragmas: WAL for concurrent readers, foreign keys ON (off by default in SQLite),
  // synchronous=NORMAL for a reasonable durability/perf trade-off in WAL mode.
  if (!options.readOnly) {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    applyMigrations(db);
  } else {
    db.pragma('foreign_keys = ON');
  }

  let closed = false;
  return {
    db,
    close(): void {
      if (closed) return;
      closed = true;
      db.close();
    },
  };
}
