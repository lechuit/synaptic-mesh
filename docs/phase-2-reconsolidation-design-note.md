# Phase 2 Reconsolidation Design Note

Status: planner implemented; mutating apply path implemented behind explicit human confirmation.

Phase 2.0 and 2.1 now cover lifecycle dynamics: decay, promotion planning, conflict revisits, deterministic sleep-cycle reports, and auditable status transitions. The next roadmap item was reconsolidation:

> when new evidence enters that bears on an existing atom, produce a successor atom and a `supersedes` link, not an overwrite.

That sentence is directionally clear, but the mutating path needed an explicit gate so reconsolidation could not become silent durable memory promotion.

## Current Facts

- `MemoryAtom` already has the necessary lineage fields: `sourceMemoryIds` and `links` with `supersedes`.
- `MemoryStore.insert()` stores a successor atom without mutating the original.
- `MemoryStore.transitionStatus()` deprecates the superseded atom with an auditable reason.
- `WriteGate` currently builds atoms from `MemoryProposal`, but `MemoryProposal` has no successor/source-memory field.
- `WriteGate` currently always emits `sourceMemoryIds: []`; it cannot express "this proposal reconsolidates memory X".
- Known conflicts map to `contradicts` links only; there is no proposal-level way to request a `supersedes` link.

## Decisions Resolved For Phase 2.4

1. Reconsolidation uses a dedicated `ReconsolidationApplier` over the planner output, not `WriteGate.propose()`, because `MemoryProposal` cannot yet express `sourceMemoryIds` or `supersedes`.
2. A successor requires a visible previous atom, explicit visible source events, matching scope, no unresolved/requires-human conflicts touching the previous atom, and explicit human confirmation before mutation.
3. Confirmed apply inserts the successor first and then deprecates the prior atom through `MemoryStore.transitionStatus()`.
4. Every successor starts as `candidate`; reconsolidation never creates `verified`/`trusted` authority.
5. The successor combines new `sourceEventIds` with `sourceMemoryIds: [previousMemoryId]` and a `supersedes` link.
6. The caller supplies the deterministic `successorMemoryId`; duplicate IDs reject before deprecating the previous atom.
7. Unresolved/requires-human conflicts block insertion and return `fetch_abstain`.
8. The generic `MemoryStore` contract does not provide a transaction boundary across successor insertion plus prior-atom transition. The applier therefore validates confirmation before any mutation and reports `partial_applied` if insertion succeeds but a later status transition is rejected, so hosts can surface the case for human cleanup instead of treating it as success.

## Implemented Safe Path

The conservative path now has two layers:

- `ReconsolidationPlanner.plan(input)` returns a proposed successor shape plus required transitions.
- It never inserts atoms and never transitions status.
- It verifies visibility/scope before looking at content.
- It requires explicit new source events and an existing visible atom.
- It emits `fetch_abstain` when the previous atom or new evidence is missing, invisible, out-of-scope, or conflicted.
- `ReconsolidationApplier.apply(input)` calls the planner, validates `humanConfirmation`, inserts only a `candidate` successor, and applies planned status transitions with the confirmation timestamp in audit history.
- If a transition rejects after successor insertion, the applier returns `partial_applied` with the successor and transition results; it never silently reports success.
