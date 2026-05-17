# Aletheia

> **Do not build a memory that remembers more. Build a memory that knows when to distrust itself.**

Aletheia is a TypeScript library for **memory as governance** in LLM agents.
It is not RAG, not semantic retrieval, and not a vector store. Aletheia asks a
different question: **what authority does a recalled fact have to influence an
action?**

Every remembered claim carries a verifiable receipt: source, freshness, scope,
status, lineage, and effect boundary. The system fails closed whenever that
authority cannot be verified.

## Status

This repo is preparing the **0.1.0 public library release**: executable
authority memory with dynamics and episodic continuity.

What exists today:

- `@aletheia-labs/core`: strict TypeScript authority types, storage interfaces,
  WriteGate, RetrievalRouter, ActionAuthorizer, and `AletheiaAuthority`.
- `@aletheia-labs/store-sqlite`: SQLite-backed event, memory, and conflict stores.
- `@aletheia-labs/adapters-anthropic`: Anthropic-compatible reference adapter.
- `@aletheia-labs/adapters-openai`: OpenAI Responses-compatible reference adapter.
- `@aletheia-labs/dynamics`: deterministic decay, promotion evidence, sleep-cycle
  reports, and human-confirmed reconsolidation.
- `@aletheia-labs/episodic`: subjective-time projections, episode catalog,
  historical timelines, and restart self-state reconstruction.
- No-key canaries, package tests, publish dry-runs, and live Anthropic happy
  path plus adversarial evidence in `evidence/live-llm-e2e/`.

What does **not** exist yet:

- production-runtime integration;
- a CLI, MCP server, daemon, watcher, or OAuth flow;
- `1.0.0` API stability.

## Novel Claim

1. **Authority-governed memory**: every memory carries provenance; semantic
   relevance never upgrades authority; contradictions block action until
   resolved.
2. **Memory as a process, not an index**: memories decay, consolidate, and
   re-evaluate themselves through explicit lifecycle passes.
3. **Subjective time / episodic continuity**: the agent can ask what it knew,
   believed, or was allowed to use at a prior point in its own history.

## Repository Layout

```text
packages/                 TypeScript monorepo, the live system
  core/                   @aletheia-labs/core
  store-sqlite/           @aletheia-labs/store-sqlite
  adapters-anthropic/     @aletheia-labs/adapters-anthropic
  adapters-openai/        @aletheia-labs/adapters-openai
  dynamics/               @aletheia-labs/dynamics
  episodic/               @aletheia-labs/episodic
examples/                 executable demos and live-provider wiring
evidence/live-llm-e2e/    live Claude happy-path and adversarial evidence
specs/                    protocol specs
CHANGELOG.md              current Aletheia change history
GLOSSARY.md               project vocabulary
ROADMAP.md                phase plan and scope decisions
```

Historical pre-Aletheia research artifacts were removed from the active tree to
keep the repo legible. They remain available through git history.

## Quick Commands

```sh
pnpm install
pnpm -r run typecheck
pnpm -r run test
pnpm -r run build
pnpm run smoke:core-e2e
```

Live demos use caller-provided provider credentials:

```sh
ANTHROPIC_API_KEY=... pnpm run demo:live-llm
ANTHROPIC_API_KEY=... pnpm run demo:live-llm:adversarial
```

## Design Principles

- **Fail closed**: if authority cannot be verified, abstain, block locally, or
  ask a human.
- **Permission before semantics**: visibility, scope, status, freshness, and
  conflict filters run before ranking.
- **Receipts are evidence, not permission tokens**: the receiver always
  classifies the proposed action.
- **Sensitive effects ask human**: receipts never auto-authorize high-risk
  action.
- **Confidence, consensus, CHAIN, and PROSE are never authority**.
- **No semantic retrieval, embeddings, or vector store**.

## Reading Order

1. `GLOSSARY.md`
2. `ROADMAP.md`
3. `specs/aletheia-memory-authority-v0.md`
4. `specs/memory-authority-receipt-v0.md`
5. package READMEs under `packages/*/README.md`

## Boundaries

Aletheia is a library. It does not own OAuth, provider accounts, terminal UX,
production authorization, or background workers. Hosts call explicit APIs and
pass in already-authenticated provider clients when they want LLM integration.

## License

See `LICENSE` for code and `LICENSE-DOCS` for documentation.
