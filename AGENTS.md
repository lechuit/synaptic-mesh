#Aletheia

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
(2) memory as a process — autonomous consolidation/decay/reconsolidation,
(3) subjective time / episodic continuity. See ROADMAP.md.

## Non-negotiable rules (do NOT break these in any code you write)

1. **Fail-closed**: when verification fails → `fetch_abstain` / `ask_human` /
   `block_local`. Never assume permission. Never throw — return a structured
   refusal.
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
- Storage interfaces in `@aletheia/core`. Implementations in adapter packages
  (`@aletheia/store-sqlite`, etc.). Core has zero native deps.
- Decisions are values (`Decision` discriminated union), never exceptions.
- Tests with vitest, explicit imports (no `globals`). One test file per
  source file when it makes sense; use round-trip tests for storage.
- Append-only by default. No UPDATE paths for content/scope/visibility/links.
  Status transitions go through `transitionStatus()` and are recorded in a
  history table.
- Migrations are versioned + idempotent + embedded as strings (no
  filesystem at runtime).

## Repo layout

- `packages/core/src/types/` — domain types and schemas.
- `packages/core/src/storage/` — interfaces only.
- `packages/core/src/runtime/` — WriteGate, RetrievalRouter, ActionAuthorizer,
  AuthorityEngine.
- `packages/store-sqlite/` — SQLite implementation of storage interfaces.
- `specs/` — protocol specs (the source of truth when in doubt).
- `archive/synaptic-mesh-shadow-v0/` — JS reference impl, read-only, used as
  parity baseline.
- `runs/2026-05-03-memory-retrieval-contradiction-lab/` — fixture lab, used as
  regression suite.
- `CHANGELOG.md`, `GLOSSARY.md`, `ROADMAP.md` — read these first.

## Working style

- Before implementing: read the relevant spec in `specs/`. If the spec is
  ambiguous, fix the spec first.
- Before adding a new dependency: justify it. Core stays light.
- Before deviating from these rules: write down the reason and ask the user
  to confirm.
- Tests are spec executable, not afterthought. Write the failing test, then
  the implementation, then check it passes.
- Use the existing fixtures in `runs/2026-05-03-*` to check that new
  implementations preserve the historical behavior.

## What NOT to do

- Don't add semantic retrieval / embeddings / vector storage.
- Don't add an auth/permission service. Aletheia is the layer beneath that.
- Don't promote memory automatically beyond `verified`. Trusted requires
  human-actor reasoning.
- Don't introduce a watcher / daemon by default.
- Don't expand `SAFE_LOCAL_ACTIONS`. Adding a verb to that set is a spec change.
