# @aletheia/episodic

Subjective time and episodic continuity projections for Aletheia.

> **Status**: Phase 3.0. Episodic timeline projections are live; they read from existing event and memory stores and do not add authority by themselves.

## What this package does

- Extracts explicit episodic anchors from event payloads.
- Finds memories formed during a visible conversation, task, session, or decision context.
- Reconstructs belief snapshots at a historical instant from visible atoms plus audited status history.
- Compares two visible episodes to show added, removed, persisted, and status-changed beliefs.
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
