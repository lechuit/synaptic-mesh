# @aletheia-labs/store-sqlite

SQLite-backed implementations of the storage interfaces declared in `@aletheia-labs/core`.

> **Status**: `0.1.0` public baseline. Event, memory, conflict, migrations, and audit-history paths are live.

## Requirements

- Node 20+.
- ESM-only. Add `"type": "module"` to your `package.json`, use `.mjs`, or use
  a build tool/runtime that handles ESM. CommonJS `require()` is not shipped in
  `0.1.x`.

## Quickstart

```bash
pnpm add @aletheia-labs/core @aletheia-labs/store-sqlite
```

```ts
import { AletheiaAuthority, staticVisibilityPolicy } from '@aletheia-labs/core';
import { openSqliteStores } from '@aletheia-labs/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const authority = new AletheiaAuthority({
  eventLedger: stores.eventLedger,
  memoryStore: stores.memoryStore,
  conflictRegistry: stores.conflictRegistry,
  visibilityPolicy: staticVisibilityPolicy([{ kind: 'private:user' }]),
});
```

For an in-memory database in tests or demos:

```ts
const stores = openSqliteStores(':memory:');
```

Always call `stores.close()` when the host is done.

## What this package provides

- `SqliteEventLedger` — append-only event log, with permission-filtered queries.
- `SqliteMemoryStore` — atom storage with strict status-transition enforcement and audit history.
- `SqliteConflictRegistry` — conflicts as first-class records with resolution history.
- `openSqliteStores(path)` — convenience wrapper that opens one database connection, runs migrations, and returns all three stores with a shared `close()`.
- `openConnection(options)` — lower-level connection helper for custom wiring.
- `MIGRATIONS` / `applyMigrations` — embedded, idempotent SQL migrations.

## Storage contract

- Events are append-only.
- Memory atoms are immutable by ID. Duplicate `memoryId` insertions throw.
- Content, scope, visibility, source links, and lineage do not have UPDATE paths.
- Status changes go through `transitionStatus()` and are recorded in `memory_status_history`.
- Conflict resolution goes through `resolve()` and is recorded in `conflict_resolution_history`.
- Visibility filtering happens in SQL before rows are decoded.
- Reads decode through zod-backed codecs; corrupt persisted data becomes a parse error instead of a silent value.

## Example

```ts
import { EventSchema } from '@aletheia-labs/core';
import { openSqliteStores } from '@aletheia-labs/store-sqlite';

const stores = openSqliteStores(':memory:');

await stores.eventLedger.append(
  EventSchema.parse({
    eventId: 'evt-1',
    kind: 'observation',
    agentId: 'agent-1',
    occurredAt: '2026-05-17T12:00:00Z',
    payload: { note: 'source event' },
    scope: { kind: 'project', projectId: 'demo' },
    visibility: { kind: 'private:user' },
  }),
);

const events = await stores.eventLedger.query({
  permittedVisibilities: [{ kind: 'private:user' }],
  scope: { kind: 'project', projectId: 'demo' },
  limit: 10,
});

console.log(events.length);
stores.close();
```

## What this package does NOT do

- No LLM calls.
- No semantic retrieval, embeddings, vector index, or ranking.
- No authorization service or OAuth.
- No background daemon, watcher, or scheduler.
- No automatic memory promotion beyond the status transition requested by the host.

## Stability

Public surface for the initial library cycle:

- `openSqliteStores(path)`
- `openConnection(options)`
- `SqliteEventLedger`
- `SqliteMemoryStore`
- `SqliteConflictRegistry`
- migration exports

The SQL schema is versioned through `schema_migrations`. Future changes that alter persisted rows or zod codecs need both SQL migration and data compatibility notes, because existing SQLite files may fail to decode if the TypeScript schema changes without a migration path.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia-labs/store-sqlite typecheck
pnpm -F @aletheia-labs/store-sqlite test
pnpm -F @aletheia-labs/store-sqlite build
```

Publish dry-run:

```bash
pnpm -F @aletheia-labs/store-sqlite publish --dry-run --no-git-checks
```
