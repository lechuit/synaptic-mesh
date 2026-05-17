# @aletheia/store-sqlite

SQLite-backed implementations of the storage interfaces declared in `@aletheia/core`.

> **Status**: Phase 1.2 — initial implementation.

## What this package provides

- `SqliteEventLedger` — append-only event log, with permission-filtered queries.
- `SqliteMemoryStore` — atom storage with strict status-transition enforcement and an audit history.
- `SqliteConflictRegistry` — conflicts as first-class records with resolution history.
- `openSqliteStores(path)` — convenience that opens a database, runs migrations, and hands back all three implementations sharing the same connection.

## Design choices

- **`better-sqlite3`** as the driver: synchronous, in-process, no FFI surprises. The async surface of the interfaces is preserved (the methods return Promises) so future async backends remain drop-in compatible.
- **Migrations are embedded SQL strings** loaded into the `schema_migrations` table. No file-system loading at runtime — the package works the same when bundled.
- **Permission filtering is done in SQL** via the `visibility_key` index, not in TypeScript. The store never serializes a row a caller cannot see.
- **Status transitions go through `transitionStatus`** — there is no `UPDATE` path. The status-history table is the audit log.

## Quickstart

```ts
import { openSqliteStores } from '@aletheia/store-sqlite';

const { eventLedger, memoryStore, conflictRegistry, close } =
  await openSqliteStores('./aletheia.sqlite');

// ... use them ...

close();
```

For an in-memory database (testing / ephemeral demos), pass `':memory:'`.
