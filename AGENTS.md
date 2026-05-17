# Aletheia

This file is loaded automatically in every session for this repo.
Read it before doing any work. Update it when project conventions change.

## What this project is

Aletheia is a TypeScript library implementing **memory as governance** for LLM
agents — not retrieval, not RAG. Every recalled fact carries a verifiable
receipt (source, freshness, scope, status, lineage, effect-boundary). The
system fails closed when authority cannot be verified.

**Design maxim** (the entire project derives from this):
> Do not build a memory that remembers more.
> Build a memory that knows when to distrust itself.

The roadmap has three phases: (1) authority-governed memory executable in TS,
(2) memory as a process — explicit consolidation/decay/reconsolidation passes,
(3) subjective time / episodic continuity. See ROADMAP.md.

## Non-negotiable rules (do NOT break these in any code you write)

1. **Fail-closed**: when verification fails → `fetch_abstain` / `ask_human` /
   `block_local`. Never assume permission. Authority-decision paths return a
   structured refusal instead of throwing for verification failure.
2. **Permission before semantics**: visibility/scope filtering BEFORE any
   ranking, scoring, or relevance. Always.
3. **Receipts are evidence, not tokens**: never use a receipt as proof of
   permission. The receiver always re-classifies the action.
4. **Sensitive actions always `ask_human`** regardless of receipt validity.
   List: `SENSITIVE_ACTIONS` in `packages/core/src/types/enums.ts`.
5. **Confidence / consensus / CHAIN / PROSE are never authority.**
6. **Unresolved conflicts block action.**
7. **No semantic retrieval, no embeddings, no vector store.** Ever. Routing is
   by receipt + status + scope, in the order from
   `specs/aletheia-memory-authority-v0.md`.

## Conventions

- TypeScript strict. `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `verbatimModuleSyntax` are all ON. Never weaken them.
- Domain types: zod is the source of truth. `FooSchema` is the schema,
  `type Foo = z.infer<typeof FooSchema>` is the type. No hand-written brands.
- Storage interfaces in `@aletheia-labs/core`. Implementations in adapter packages
  (`@aletheia-labs/store-sqlite`, etc.). Core has zero native deps.
- Authority decisions are values (`Decision` discriminated union), never
  exceptions. Storage may still throw on malformed inserts or duplicate IDs.
- Tests with vitest, explicit imports (no `globals`). One test file per
  source file when it makes sense; use round-trip tests for storage.
- Append-only by default. No UPDATE paths for content/scope/visibility/links.
  Status transitions go through `transitionStatus()` and are recorded in a
  history table.
- Migrations are versioned + idempotent + embedded as strings (no
  filesystem at runtime).
- Public library methods/classes/interfaces must carry TSDoc that explains
  usage, fail-closed behavior, and implementation boundaries. Prefer `@remarks`
  for design/architecture notes; keep comments truthful and close to the code.

## Repo layout

- `packages/core/src/types/` — domain types and schemas.
- `packages/core/src/storage/` — interfaces only.
- `packages/core/src/runtime/` — WriteGate, RetrievalRouter, ActionAuthorizer,
  and the `AletheiaAuthority` facade in `authority-engine.ts`.
- `packages/store-sqlite/` — SQLite implementation of storage interfaces.
- `packages/dynamics/` — deterministic decay, promotion evidence, sleep-cycle
  reports, and human-confirmed reconsolidation.
- `packages/episodic/` — subjective-time projections and continuity snapshots.
- `examples/` — executable demos and live-provider wiring.
- `evidence/live-llm-e2e/` — live provider evidence intentionally kept in
  the active tree.
- `specs/` — protocol specs (the source of truth when in doubt).
- `CHANGELOG.md`, `GLOSSARY.md`, `ROADMAP.md` — read these first.

## Working style

- Before implementing: read the relevant spec in `specs/`. If the spec is
  ambiguous, fix the spec first.
- Before adding a new dependency: justify it. Core stays light.
- Before deviating from these rules: write down the reason and ask the user
  to confirm.
- Tests are spec executable, not afterthought. Write the failing test, then
  the implementation, then check it passes.
- Keep the active tree legible for external readers. Historical research
  artifacts that are not part of the library surface belong in git history, not
  in the current repo root.

## What NOT to do

- Don't add semantic retrieval / embeddings / vector storage.
- Don't add an auth/permission service. Aletheia is the layer beneath that.
- Don't promote memory automatically to `trusted`. Trusted requires human-actor
  reasoning.
- Don't introduce a watcher / daemon by default.
- Don't expand `SAFE_LOCAL_ACTIONS`. Adding a verb to that set is a spec change.
