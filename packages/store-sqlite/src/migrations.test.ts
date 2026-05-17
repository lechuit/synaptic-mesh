import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { MIGRATIONS, applyMigrations } from './migrations.js';

describe('migrations', () => {
  it('applies all migrations on a fresh database', () => {
    const db = new Database(':memory:');
    try {
      const applied = applyMigrations(db);
      expect(applied).toHaveLength(MIGRATIONS.length);

      const tables = db
        .prepare<[], { name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .all()
        .map((r) => r.name);

      // We expect at least the core tables.
      expect(tables).toContain('events');
      expect(tables).toContain('memory_atoms');
      expect(tables).toContain('memory_status_history');
      expect(tables).toContain('conflicts');
      expect(tables).toContain('conflict_claim_atoms');
      expect(tables).toContain('conflict_resolution_history');
      expect(tables).toContain('schema_migrations');
    } finally {
      db.close();
    }
  });

  it('is idempotent — running twice applies nothing the second time', () => {
    const db = new Database(':memory:');
    try {
      applyMigrations(db);
      const second = applyMigrations(db);
      expect(second).toHaveLength(0);
    } finally {
      db.close();
    }
  });

  it('records each applied migration', () => {
    const db = new Database(':memory:');
    try {
      applyMigrations(db);
      const rows = db
        .prepare<[], { version: number; name: string }>(
          'SELECT version, name FROM schema_migrations ORDER BY version',
        )
        .all();
      expect(rows).toHaveLength(MIGRATIONS.length);
      expect(rows[0]?.version).toBe(1);
      expect(rows[0]?.name).toBe('initial-schema');
    } finally {
      db.close();
    }
  });
});
