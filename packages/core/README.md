# @aletheia/core

The core authority engine of Aletheia — memory as governance for LLM agents.

> **Status**: Phase 1.3. Domain types, storage interfaces, WriteGate, RetrievalRouter, and receiver-side action authorization are live.

## What this package does (when complete)

- **Types** for the receipt protocol: `Receipt`, `MemoryAtom`, `ActionContextPacket`, `Coverage`, `ConflictRecord`, `Decision`, discriminated unions for status / scope / visibility.
- **WriteGate** — runs `SourceCheck → IntentCheck → ConflictCheck → PrivacyCheck → PromotionDecision` over memory proposals.
- **MemoryStore** — atoms with status transitions, lineage links, validity windows. Storage is pluggable; SQLite implementation in `@aletheia/store-sqlite`.
- **ConflictRegistry** — first-class contradictions, queryable.
- **RetrievalRouter** — **not semantic**. Routes by receipt + status + scope, in the order specified in `specs/aletheia-memory-authority-v0.md`.
- **Consumer API facade** — `AletheiaAuthority.propose(proposal)`, `recall(query)`, `tryAct(action, ctx)`.

## What this package does NOT do

- No embeddings, no vector store, no semantic retrieval. Ever. That is not the substrate Aletheia is.
- No LLM SDK dependencies. Adapters live in their own packages (`@aletheia/adapters-anthropic`, etc.).
- No automatic memory promotion to production-affecting state. Fail-closed is non-negotiable.

## Development

From the repo root:

```bash
pnpm install
pnpm -F @aletheia/core build
pnpm -F @aletheia/core test
pnpm -F @aletheia/core typecheck
```

## Specs

This package implements:

- `specs/aletheia-memory-authority-v0.md` — system architecture.
- `specs/memory-authority-receipt-v0.md` — receipt contract.
- `specs/compressed-temporal-receipt-v0.md` — compressed-temporal-receipt format.

Where the spec is ambiguous, the spec gets fixed first.
