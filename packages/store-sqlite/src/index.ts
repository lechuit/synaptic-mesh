/**
 * @aletheia/store-sqlite
 *
 * SQLite-backed implementations of the @aletheia/core storage interfaces.
 */

import { type AletheiaConnection, type OpenOptions, openConnection } from './connection.js';
import { SqliteConflictRegistry } from './sqlite-conflict-registry.js';
import { SqliteEventLedger } from './sqlite-event-ledger.js';
import { SqliteMemoryStore } from './sqlite-memory-store.js';

export { openConnection, type AletheiaConnection, type OpenOptions };
export { SqliteEventLedger };
export { SqliteMemoryStore };
export { SqliteConflictRegistry };
export { MIGRATIONS, applyMigrations, type Migration } from './migrations.js';

export interface SqliteStores {
  readonly eventLedger: SqliteEventLedger;
  readonly memoryStore: SqliteMemoryStore;
  readonly conflictRegistry: SqliteConflictRegistry;
  readonly close: () => void;
}

/**
 * Open a SQLite database and return the three storage implementations sharing
 * the same connection. Convenience wrapper for the common case.
 *
 * For tests, pass `:memory:`.
 */
export function openSqliteStores(path: string): SqliteStores {
  const conn: AletheiaConnection = openConnection({ path });
  return {
    eventLedger: new SqliteEventLedger(conn.db),
    memoryStore: new SqliteMemoryStore(conn.db),
    conflictRegistry: new SqliteConflictRegistry(conn.db),
    close: conn.close,
  };
}
