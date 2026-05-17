# Aletheia Specs v0

These specs define the protocol contracts behind the TypeScript packages. They
are the source of truth for authority semantics; executable zod schemas live in
`packages/core/src/types/`.

## Current Spec Set

| Spec | Purpose | Status |
|---|---|---|
| `aletheia-memory-authority-v0.md` | System architecture: Event Ledger, Proposal Layer, Write Gate, MemoryAtom, Conflict Registry, Retrieval Router, Action Context Packet | draft stable |
| `memory-authority-receipt-v0.md` | Receipt semantics and fail-closed interpretation rules | draft stable |
| `compressed-temporal-receipt-v0.md` | Compact cross-source handoff tuple and receiver validation order | draft stable |
| `decision-counterfactual-receiver-rule-v0.5.md` | Receiver-side counterfactual check rule | draft |
| `framework-adapter-matrix-v0.md` | Adapter boundary notes for future host integrations | draft |

## Core Claim

In multi-agent memory systems, authority/status/boundary receipts must survive
compression transforms so stale, denied, sealed, local-only, partial-lineage, or
human-required evidence cannot be laundered into action authority.

## Interpretation Priority

1. Human/operator instruction and guardrails.
2. Explicit approval boundaries.
3. Source, freshness, scope, promotion, and forbidden-effect receipt fields.
4. Later restrictive events and conflict state.
5. Receiver-side action classification.
6. Semantic relevance, similarity, confidence, and prose.

Semantic relevance never upgrades authority.

## Shared Fail-Closed Rule

If a receiver cannot verify source binding, freshness, scope, promotion
boundary, forbidden effects, later restrictive events, tuple completeness, or
proposed action boundary, it must choose one of:

- `fetch_abstain`: get source evidence or do not proceed;
- `ask_human`: request explicit human approval for sensitive or unknown effects;
- `block_local`: stop local action when the action is clearly disallowed.

It must not infer permission from confidence, consensus, checksum, chain labels,
sender-safe labels, or polished prose.
