# @aletheia-labs/episodic

Subjective time and episodic continuity projections for Aletheia.

> **Status**: `0.1.x` experimental public baseline. Episodic timeline projections are live; they read from existing event and memory stores and do not add authority by themselves.

## Requirements

- Node 20+.
- ESM-only. Add `"type": "module"` to your `package.json`, use `.mjs`, or use
  a build tool/runtime that handles ESM. CommonJS `require()` is not shipped in
  `0.1.x`.

## Quickstart

```bash
pnpm add @aletheia-labs/core @aletheia-labs/store-sqlite @aletheia-labs/episodic
```

```ts
import { AgentIdSchema, staticVisibilityPolicy } from '@aletheia-labs/core';
import { EpisodicTimeline } from '@aletheia-labs/episodic';
import { openSqliteStores } from '@aletheia-labs/store-sqlite';

const stores = openSqliteStores('./aletheia.sqlite');
const timeline = new EpisodicTimeline({
  eventLedger: stores.eventLedger,
  memoryStore: stores.memoryStore,
  visibilityPolicy: staticVisibilityPolicy([{ kind: 'private:user' }]),
});

const catalog = await timeline.listEpisodes({
  agentId: AgentIdSchema.parse('agent-1'),
  scope: { kind: 'project', projectId: 'demo' },
  kind: 'conversation',
  limit: 10,
});

console.log(catalog.decision.outcome, catalog.episodes.length);
stores.close();
```

The timeline only projects what the caller can already see through visibility and scope filtering.

## What this package does

- Extracts explicit episodic anchors from event payloads.
- Lists visible episodes by conversation, task, decision context, or session.
- Indexes visible atoms by the conversation, task, session, or decision context
  events that produced them.
- Finds memories formed during a visible conversation, task, session, or decision context.
- Reconstructs belief snapshots at a historical instant from visible atoms plus audited status history.
- Compares visible belief snapshots at two episode boundaries to show added, removed, persisted, and status-changed beliefs.
- Exposes a permission-guarded timeline for one visible memory's audited status history.
- Builds a self-state snapshot so a restarted agent can recover what it currently believes, doubts, distrusts, or must route to a human.
- Builds a compact restart continuity brief from current self-state, recent visible episodes, and optional status changes since a prior instant.

`continuityBrief().changedSince` compares endpoint snapshots. Use
`memoryTimeline()` when you need the full audited transition path for one
memory.

## Non-goals

- No semantic search, vector ranking, or fuzzy topic inference.
- No new permission model. Host-provided visibility is still the boundary.
- No action authorization. Episodic projections are audit context, not permission tokens.

## Event payload convention

Events can opt into subjective time by carrying an `episodic` object:

```json
{
  "episodic": {
    "episodeId": "conversation-2026-05-17-a",
    "kind": "conversation",
    "sessionId": "session-a",
    "conversationId": "conversation-a"
  }
}
```

Supported `kind` values are `conversation`, `task`, `decision_context`, and `session`.

Use `experienceIndex()` to map visible episodes to visible atoms:

```ts
const index = await timeline.experienceIndex({
  agentId,
  scope: { kind: 'project', projectId: 'demo' },
  kind: 'conversation',
  asOf: '2026-05-17T00:00:00Z',
});
```

The join is receipt-based: event visibility/scope first, memory visibility,
scope, status, and freshness second, then source-event matching. By default,
`experienceIndex()` includes every memory status because it is an audit
projection; pass `statusesAt: ['verified', 'trusted']` when you only want
belief-state entries. `contentIncludes` is case-sensitive literal matching and
only runs as a post-filter inside the already-authorized set.

## Stability

Public surface for the initial library cycle:

- `EpisodicTimeline`
- episode catalog/projection/comparison types
- experience index types
- belief snapshot and self-state snapshot types
- continuity brief and continuity change-set types
- memory timeline types
- explicit `EpisodeAnchor` payload convention

Everything else is projection plumbing and may change during the `0.x` line. Episodic outputs are audit context, not permission tokens; callers must still route actions through `tryAct()`.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia-labs/episodic typecheck
pnpm -F @aletheia-labs/episodic test
pnpm -F @aletheia-labs/episodic build
```
