# Aletheia Specs v0

These specs define the protocol contracts behind the TypeScript packages. They
are the source of truth for authority semantics; executable zod schemas live in
`packages/core/src/types/`.

## Current Spec Set

| Spec | Purpose | Status |
|---|---|---|
| `aletheia-memory-authority-v0.md` | System architecture and runtime contracts for core, SQLite, adapters, dynamics, and episodic packages | executable baseline |
| `memory-dynamics-v0.md` | Phase 2 lifecycle dynamics: decay, source-consistent recall evidence, audited sleep cycles, and reconsolidation | executable baseline |
| `memory-authority-receipt-v0.md` | Receipt semantics and fail-closed interpretation rules | executable baseline |
| `compressed-temporal-receipt-v0.md` | Compact cross-source handoff tuple and receiver validation order | executable baseline |
| `decision-counterfactual-receiver-rule-v0.5.md` | Receiver-side counterfactual check rule | draft |
| `framework-adapter-matrix-v0.md` | Adapter boundary notes for future host integrations | draft |

## Core Claim

In multi-agent memory systems, authority/status/boundary receipts must survive
compression transforms so stale, denied, sealed, local-only, partial-lineage, or
human-required evidence cannot be laundered into action authority.

Phase 2 extends that claim: memory status itself is a process. Lifecycle
transitions must be deterministic, permission-bounded, and auditable, or they
become another way to launder weak evidence into authority.

## Interpretation Priority

1. Human/operator instruction and guardrails.
2. Explicit approval boundaries.
3. Source, freshness, scope, promotion, and forbidden-effect receipt fields.
4. Later restrictive events and conflict state.
5. Receiver-side action classification.
6. Audited lifecycle dynamics.
7. Exact host filters and receipt-derived ranking.
8. Semantic relevance, similarity, confidence, and prose.

Semantic relevance never upgrades authority and is not part of the substrate.

## Shared Fail-Closed Rule

If a receiver cannot verify source binding, freshness, scope, promotion
boundary, forbidden effects, later restrictive events, tuple completeness, or
proposed action boundary, it must choose one of:

- `fetch_abstain`: get source evidence or do not proceed;
- `ask_human`: request explicit human approval for sensitive or unknown effects;
- `block_local`: stop local action when the action is clearly disallowed.

It must not infer permission from confidence, consensus, checksum, chain labels,
sender-safe labels, or polished prose.

Lifecycle code follows the same rule: if clock, visibility, source evidence,
or conflict state cannot be verified, dynamics must skip, plan conservatively,
or return `fetch_abstain` rather than silently promoting memory.
