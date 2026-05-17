# @aletheia-labs/episodic

Subjective time and episodic continuity projections for Aletheia.

> **Status**: `0.1.0` experimental public baseline. Episodic timeline projections are live; they read from existing event and memory stores and do not add authority by themselves.

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
- Finds memories formed during a visible conversation, task, session, or decision context.
- Reconstructs belief snapshots at a historical instant from visible atoms plus audited status history.
- Compares visible belief snapshots at two episode boundaries to show added, removed, persisted, and status-changed beliefs.
- Exposes a permission-guarded timeline for one visible memory's audited status history.
- Builds a self-state snapshot so a restarted agent can recover what it currently believes, doubts, distrusts, or must route to a human.

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

## Stability

Public surface for the initial library cycle:

- `EpisodicTimeline`
- episode catalog/projection/comparison types
- belief snapshot and self-state snapshot types
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
