# Phase 2 Reconsolidation Design Note

Status: blocked pending explicit design decision.

Phase 2.0 and 2.1 now cover lifecycle dynamics: decay, promotion planning, conflict revisits, deterministic sleep-cycle reports, and auditable status transitions. The next roadmap item is reconsolidation:

> when new evidence enters that bears on an existing atom, the atom re-enters the Write Gate; this produces a successor atom and a `supersedes` link, not an overwrite.

That sentence is directionally clear, but the current executable contract is not yet specific enough to implement safely.

## Current Facts

- `MemoryAtom` already has the necessary lineage fields: `sourceMemoryIds` and `links` with `supersedes`.
- `MemoryStore.insert()` can store a successor atom without mutating the original.
- `MemoryStore.transitionStatus()` can deprecate the superseded atom with an auditable reason.
- `WriteGate` currently builds atoms from `MemoryProposal`, but `MemoryProposal` has no successor/source-memory field.
- `WriteGate` currently always emits `sourceMemoryIds: []`; it cannot express "this proposal reconsolidates memory X".
- Known conflicts map to `contradicts` links only; there is no proposal-level way to request a `supersedes` link.

## Decisions Needed

1. Should reconsolidation enter through `WriteGate.propose()` with an extended `MemoryProposal`, or through a separate `ReconsolidationGate`?
2. What evidence is required before a successor may `supersedes` an existing atom?
3. Does successor creation automatically transition the prior atom to `deprecated`, or does it only plan that transition for a later sleep-cycle?
4. Can reconsolidation create an actionable `verified` successor, or must every successor begin as `candidate` / `human_required`?
5. How are source events and source memories combined? The successor likely needs both `sourceEventIds` for new evidence and `sourceMemoryIds` for lineage.
6. What is the deterministic ID rule for successor atoms?
7. How should unresolved conflicts interact with a proposed successor: block insertion, insert as `human_required`, or insert as `candidate` but non-actionable?

## Safe Next Implementation

The conservative next step is a planner, not a mutator:

- `ReconsolidationPlanner.plan(input)` returns a proposed successor shape plus required transitions.
- It never inserts atoms and never transitions status.
- It verifies visibility/scope before looking at content.
- It requires explicit new source events and an existing visible atom.
- It emits `fetch_abstain` when the previous atom or new evidence is missing, invisible, out-of-scope, or conflicted.

Only after that planner is reviewed should we add an apply path that calls `WriteGate` or a dedicated gate.
