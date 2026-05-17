# Aletheia

> Formerly developed as **"Synaptic Mesh"**. The project was renamed in 2026-05 to avoid permanent confusion with the unrelated [ruvnet/Synaptic-Mesh](https://github.com/ruvnet/Synaptic-Mesh). The historical release titles in `CHANGELOG.md` preserve the original name; the rationale for the rename lives in `ROADMAP.md`. The npm namespace is **`@aletheia/*`** (e.g. `@aletheia/core`).

> **Do not build a memory that remembers more. Build a memory that knows when to distrust itself.**

A research protocol — and, in upcoming releases, an executable reference implementation — for **memory as governance** in LLM-based agents.

Most "memory for LLM" projects are retrieval systems (RAG, vector stores, mem0, MemGPT, Letta, Zep): they answer *"how do I find what's relevant"*. Aletheia asks a different question: *"what authority does a recalled fact have to influence an action"*. Every remembered claim carries a verifiable receipt — source, freshness, scope, status, lineage, effect-boundary — and the system **fails closed** whenever that authority cannot be verified. Stale, denied, sealed, local-only or human-required evidence cannot be laundered into action authority through summarization or handoff.

This is not RAG. It is not semantic memory. It is the substrate underneath both.

## Status (honest)

This repo is in **Phase 3.0: executable authority memory with dynamics and episodic projections**. What exists today:

- a paper draft (`paper/aletheia-paper-v0.md`)
- protocol specifications (`specs/`)
- a fixture/experiment lab on memory retrieval, contradiction handling, and boundary coverage (`runs/2026-05-03-memory-retrieval-contradiction-lab/`)
- reproducibility evidence (`evidence/`)
- a public-review research package (`research-package/`)
- the historical no-effect reference implementation in JS, preserved for parity testing (`archive/synaptic-mesh-shadow-v0/`)
- `@aletheia/core`: strict TypeScript authority types, storage interfaces, WriteGate, RetrievalRouter, and ActionAuthorizer
- `@aletheia/store-sqlite`: SQLite-backed event, memory, and conflict stores
- `@aletheia/dynamics`: deterministic lifecycle dynamics and explicit sleep-cycle reports
- `@aletheia/episodic`: subjective-time projections, historical belief snapshots, and restart self-state reconstruction

What does **not** exist yet:

- live LLM integration
- published npm packages
- a mutating reconsolidation apply path for successor atoms; the current surface is planner-only until the gate contract is explicit

See `ROADMAP.md` for the phase breakdown.

## What's the novel claim?

Three claims, layered, increasing in ambition:

1. **Authority-governed memory** — every memory carries verifiable provenance; semantic relevance never upgrades authority; contradictions are first-class and block action until resolved.
2. **Memory as a process, not an index** — memories consolidate, decay, re-evaluate themselves when new evidence arrives; the system has internal dynamics, not just a query interface.
3. **Subjective time / episodic continuity** — the agent has a sense of its own lived experience; "what I believed last week" is a first-class query.

Phase 1 delivers claim 1 as running code; Phase 2 adds lifecycle dynamics; Phase 3 begins subjective-time continuity.

## Repository layout

```
packages/               TypeScript monorepo (pnpm workspaces) — the live system
  ├── core/             @aletheia/core — types, write gate, memory store, retrieval router
  ├── store-sqlite/     @aletheia/store-sqlite — SQLite storage implementations
  ├── dynamics/         @aletheia/dynamics — decay, promotion, conflict revisit, sleep cycles
  └── episodic/         @aletheia/episodic — subjective time and continuity projections
paper/                  research paper draft (aletheia-paper-v0.md)
specs/                  protocol specs (memory authority, compressed receipts, system architecture)
runs/                   experiment lab — fixtures, scenarios, validators (preserves Synaptic Mesh names as historical evidence)
evidence/               reproducibility outputs
research-package/       public-review trace maps, audits, blocker ledger (T-* tasks preserve original names)
archive/                pre-rename and pre-TS artifacts kept for parity testing and citation
  └── synaptic-mesh-shadow-v0/   the JS reference implementation (read-only)
CHANGELOG.md            full v0.45.5 → v0.52.5 release-ladder history
GLOSSARY.md             every term used in this repo, defined
ROADMAP.md              the forward plan and naming decision
```

## Design principles (carry-forward through all phases)

- **Fail-closed**: if you can't verify authority, abstain or ask a human. Never infer permission from confidence, polished prose, sender label, checksum, or chain length.
- **Permission before semantics**: visibility/scope filtering happens *before* semantic ranking, never after.
- **Summaries never replace sources**: every summary carries a receipt back to the originating event.
- **Later restrictive events override older optimistic ones**: time has a direction.
- **Sensitive effects ask human**: there is no automatic promotion path for high-risk action.

These come from `specs/aletheia-memory-authority-v0.md` and are not negotiable across phases.

## Reading order for new contributors

1. This README.
2. `GLOSSARY.md` (~5 min — necessary before any spec).
3. `specs/aletheia-memory-authority-v0.md` (the architecture).
4. `specs/memory-authority-receipt-v0.md` (the receipt contract).
5. `ROADMAP.md` (where we're going next).
6. `paper/aletheia-paper-v0.md` (the long-form argument).

## Boundaries (what this is NOT)

- Not production-ready, not runtime-ready, not L2+ operational.
- Not a permission system or authorization service.
- Not connected to any production runtime.
- Not a daemon or watcher.

## License

See `LICENSE` (code) and `LICENSE-DOCS` (documents).
