/**
 * Schema migrations for @aletheia/store-sqlite.
 *
 * Migrations are embedded as strings so the package works the same when
 * bundled. Each migration runs once and is recorded in `schema_migrations`.
 *
 * To add a migration: append to the MIGRATIONS array with the next version
 * number. NEVER edit an existing migration — write a new one.
 */

import type Database from 'better-sqlite3';

export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
}

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: 'initial-schema',
    sql: `
-- Schema versioning ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

-- Events: append-only --------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  agent_id TEXT,
  occurred_at TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  visibility_json TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  visibility_key TEXT NOT NULL,
  inserted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_agent ON events(agent_id);
CREATE INDEX IF NOT EXISTS idx_events_visibility_key ON events(visibility_key);
CREATE INDEX IF NOT EXISTS idx_events_scope_key ON events(scope_key);

-- Memory atoms ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memory_atoms (
  memory_id TEXT PRIMARY KEY,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_agent_id TEXT NOT NULL,
  source_event_ids_json TEXT NOT NULL,
  source_memory_ids_json TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  visibility_json TEXT NOT NULL,
  status TEXT NOT NULL,
  scores_json TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT,
  last_confirmed_at TEXT,
  links_json TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  visibility_key TEXT NOT NULL,
  inserted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atoms_status ON memory_atoms(status);
CREATE INDEX IF NOT EXISTS idx_atoms_visibility_key ON memory_atoms(visibility_key);
CREATE INDEX IF NOT EXISTS idx_atoms_scope_key ON memory_atoms(scope_key);
CREATE INDEX IF NOT EXISTS idx_atoms_valid_from ON memory_atoms(valid_from);

-- Status history -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memory_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_id TEXT NOT NULL REFERENCES memory_atoms(memory_id),
  from_status TEXT,
  to_status TEXT NOT NULL,
  rationale TEXT NOT NULL,
  actor TEXT NOT NULL,
  conflict_id TEXT,
  at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_msh_memory_at ON memory_status_history(memory_id, at);

-- Conflicts ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conflicts (
  conflict_id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  claims_json TEXT NOT NULL,
  status TEXT NOT NULL,
  decision_policy TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_scope_key ON conflicts(scope_key);

-- Conflict → atoms (many-to-many) for "touchingMemoryIds" queries -----------
CREATE TABLE IF NOT EXISTS conflict_claim_atoms (
  conflict_id TEXT NOT NULL REFERENCES conflicts(conflict_id),
  memory_id TEXT NOT NULL,
  PRIMARY KEY (conflict_id, memory_id)
);

CREATE INDEX IF NOT EXISTS idx_cca_memory ON conflict_claim_atoms(memory_id);

-- Conflict resolution history ------------------------------------------------
CREATE TABLE IF NOT EXISTS conflict_resolution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conflict_id TEXT NOT NULL REFERENCES conflicts(conflict_id),
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  rationale TEXT NOT NULL,
  actor TEXT NOT NULL,
  preferred_memory_id TEXT,
  at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crh_conflict_at ON conflict_resolution_history(conflict_id, at);
    `.trim(),
  },
];

/**
 * Apply all pending migrations in order, inside a single transaction per migration.
 * Idempotent — already-applied migrations are skipped.
 */
export function applyMigrations(db: Database.Database): readonly Migration[] {
  // Bootstrap the schema_migrations table if it doesn't exist yet.
  // Done outside the migration loop so the loop can rely on its presence.
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    db
      .prepare<[], { version: number }>('SELECT version FROM schema_migrations')
      .all()
      .map((r) => r.version),
  );

  const newlyApplied: Migration[] = [];

  const insertMigration = db.prepare(
    'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)',
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;

    const tx = db.transaction(() => {
      db.exec(migration.sql);
      insertMigration.run(migration.version, migration.name, new Date().toISOString());
    });
    tx();
    newlyApplied.push(migration);
  }

  return newlyApplied;
}
