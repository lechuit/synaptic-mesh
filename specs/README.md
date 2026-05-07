# Synaptic Mesh Specs v0

Status: public spec draft v0 / not runtime-ready  
Generated: 2026-05-06T16:42Z

## Boundary

These specs are local research documentation only. They do not authorize:

- runtime/tooling implementation;
- host/runtime configuration changes;
- permanent memory writes or promotion;
- external publication or public release;
- external sends except human-facing milestone/blocker updates;
- deletion;
- paused-project work;
- canary/enforcement/production/L2+ operational use.

## Current spec set

| Spec | Purpose | Status |
|---|---|---|
| `memory-authority-receipt-v0.md` | Common receipt semantics and fail-closed interpretation rules | draft stable local spec |
| `synaptic-mesh-memory-authority-v0.md` | System-level architecture: Event Ledger, Proposal Layer, Write Gate, MemoryAtom, Conflict Registry, Retrieval Router, Action Context Packet | draft stable local spec |
| `compressed-temporal-receipt-v0.md` | Compact cross-source handoff tuple and receiver validation order | draft stable local spec |
| `../schemas/receipt.schema.json` | Strict local-shadow structured Receipt shape for fixture/evidence validation | schema evidence only; not semantic proof or runtime authorization |

## Core claim

In multi-agent memory systems, authority/status/boundary receipts must survive compression transforms — source result → summary → handoff → next-action → action proposal — so stale, denied, sealed, local-only, partial-lineage, or human-required evidence cannot be laundered into action authority.

## Interpretation priority

1. Human/operator instruction and guardrails.
2. Explicit approval boundaries.
3. Source/freshness/scope/promotion/forbidden-effect receipt fields.
4. Later restrictive events and conflict state.
5. Receiver-side action classification.
6. Semantic relevance / similarity / confidence / prose.

Semantic relevance never upgrades authority.

## Shared fail-closed rule

If a receiver cannot verify source binding, freshness, scope, promotion boundary, forbidden effects, later restrictive events, tuple completeness, or proposed action boundary, it must choose one of:

- `fetch_abstain` — get source evidence / do not proceed;
- `ask_human` — request explicit human approval for sensitive/unknown effects;
- `block_local` — stop local action when the action is clearly disallowed.

It must not infer permission from confidence, consensus, checksum, chain labels, sender-safe labels, or polished prose.

## Current readiness

- Research/spec drafting: allowed locally.
- Reference implementation: not started; should wait until specs and reproducibility manifest are clearer.
- Runtime integration: not authorized.
- Publication: not authorized.

## Next recommended package step

`T-synaptic-mesh-repro-suite-manifest-v0`: curate a reproducibility manifest from existing fixtures, commands, expected metrics, and pass/fail gates.
