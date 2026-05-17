# Roadmap

The forward plan from "research artifact" to "running system of memory governance for LLM agents", with naming and technical decisions made explicit.

---

## Central hypothesis

> Most "memory for LLM" projects are search engines in disguise. Aletheia argues that **the unsolved problem is not retrieval but authority**: deciding which recalled facts have the right to influence an action, and refusing to act when that right cannot be verified.

This is the design maxim from `specs/aletheia-memory-authority-v0.md`:

> *Do not build a memory that remembers more. Build a memory that knows when to distrust itself.*

The roadmap below operationalizes that maxim in three layered phases. Phase 1
and Phase 2 are closed; Phase 3 is in progress.

---

## Scope decision (2026-05)

Aletheia is a **library**, not a CLI or standalone app. The forward plan optimizes for being imported into other agents, runtimes, and pipelines:

```ts
const authority = new AletheiaAuthority({ eventLedger, memoryStore, conflictRegistry });
await authority.propose(proposal);
await authority.recall(query);
await authority.tryAct(action, context);
```

LLM adapters receive a caller-provided, already-authenticated client or runner. Aletheia does not own OAuth flows, refresh tokens, device login, terminal UX, or provider account state. `@aletheia/core` stays provider-free, SDK-free, and native-dependency-free.

Explicitly out of scope for the initial release cycle:

- `@aletheia/cli`
- `@aletheia/mcp-server`
- OAuth flows for Codex, Claude, ChatGPT, or any other provider
- ChatGPT Plus / Codex subscription plumbing
- terminal UI/ergonomics

Those may return later as separate packages once the library has external users or a concrete host integration needs them. Until then, examples and tests are the delivery shape.

---

## 0.1.0 release baseline (2026-05-17)

The initial public release target is `0.1.0` across six packages:

- `@aletheia/core`
- `@aletheia/store-sqlite`
- `@aletheia/adapters-anthropic`
- `@aletheia/adapters-openai`
- `@aletheia/dynamics`
- `@aletheia/episodic`

Measured at release prep:

- **Publishable packages**: 6.
- **Implementation source**: 50 TypeScript source files, 7,014 LOC under
  `packages/*/src`, excluding `*.test.ts`.
- **Executable package tests**: 19 test files, 183 tests.
- **Live evidence**: Anthropic happy-path and adversarial runs under
  `evidence/live-llm-e2e/`.
- **Specs**: `aletheia-memory-authority-v0.md` and
  `memory-authority-receipt-v0.md` aligned to the executable package surface.

`@aletheia/episodic` is included in `0.1.0` as an experimental public baseline:
it is useful enough to ship, but its projection APIs remain more likely to
move during the `0.x` line than the Phase 1 authority spine.

---

## Phase 0 — Saneamiento (closed)

**Goal**: make the repo legible to outside reviewers and pin the forward direction.

**Deliverables**:

- [x] `README.md` rewritten: short, honest about status, design maxim as central piece.
- [x] `CHANGELOG.md`: current Aletheia changes only; pre-Aletheia release
  ladder removed from the active tree and left to git history.
- [x] `GLOSSARY.md`: every recurring term defined.
- [x] `ROADMAP.md`: this document.
- [x] **Naming decision**: project renamed to **Aletheia**; npm namespace `@aletheia/*`. See below.
- [x] **Repo hygiene**: inactive historical docs, manifests, old schemas,
  fixture runs, archived JS implementation, and release-check tooling removed
  from the active tree to prevent reader confusion. Git history remains the
  archival record.
- [x] `CITATION.cff` updated for Aletheia.
- [ ] Update git remote — coordinate with whoever owns the org.

**Acceptance**: a new contributor can clone the repo, read README → GLOSSARY → architecture spec → roadmap in under 30 minutes and know exactly what the project is and is not.

---

## Phase 1 — Authority-governed memory, executable

**Goal**: deliver claim 1 from the README as **running TypeScript code an LLM can actually use**.

This is the phase that crossed the line from "research artifact" to "real software".

**Status (closed 2026-05-17)**: Phase 1 is closed as an executable library baseline. The authority-governed memory spine, SQLite store, provider adapters, no-key canaries, package docs, and publish dry-runs are complete. Remaining unchecked items in this section are release-hardening evidence, not implementation blockers for starting Phase 2.

### Phase 1 closure metrics (2026-05-17)

Measured before Phase 2 work, excluding `dist/`, JSON config, Markdown, and generated artifacts.

- **Publishable packages**: 4
  - `@aletheia/core`
  - `@aletheia/store-sqlite`
  - `@aletheia/adapters-anthropic`
  - `@aletheia/adapters-openai`
- **Implementation source**: 39 TypeScript source files, 4,706 LOC under Phase 1 package `src/`, excluding `*.test.ts`.
  - `@aletheia/core`: 28 files, 2,643 LOC
  - `@aletheia/store-sqlite`: 7 files, 1,154 LOC
  - `@aletheia/adapters-anthropic`: 2 files, 450 LOC
  - `@aletheia/adapters-openai`: 2 files, 459 LOC
- **Executable test surface**: 103 package tests plus 1 no-LLM smoke test.
  - `@aletheia/core`: 62 package tests
  - `@aletheia/store-sqlite`: 27 package tests
  - `@aletheia/adapters-anthropic`: 6 package tests
  - `@aletheia/adapters-openai`: 8 package tests
  - `packages/core/examples/end-to-end.ts`: 1 smoke canary
- **Canary evidence**: 3 executable closure canaries report `boundaryViolations: []`.
  - `pnpm run smoke:core-e2e`
  - `node examples/anthropic-e2e/fixture-demo.mjs`
  - `pnpm -F @aletheia/adapters-openai run demo:fixture`
- **Publish dry-runs**: all 4 Phase 1 packages pass `pnpm -F <package> publish --dry-run --no-git-checks`.
- **Code/test/demo footprint**: 7,418 TS/MJS LOC across Phase 1 implementation, tests, and executable demos.

### Scope

1. **Implement `@aletheia/core` in TypeScript from scratch**, with formal types
   derived directly from `specs/` and zod schemas in
   `packages/core/src/types/`.
   - `Receipt`, `CompressedReceipt`, `MemoryAtom`, `MemoryProposal`, `ActionContextPacket`, `Coverage`, `ConflictRecord`, `Decision`.
   - All status / scope / visibility unions modeled as discriminated unions, not strings.

2. **Build the executable layers from the specs**:
   - `EventLedger` — append-only, SQLite-backed.
   - `MemoryProposalLayer` — agent surface to propose.
   - `WriteGate` — runs the SourceCheck → IntentCheck → ConflictCheck → PrivacyCheck → PromotionDecision chain.
   - `MemoryStore` — atoms, with status transitions, lineage links, validity windows.
   - `ConflictRegistry` — first-class contradictions, queryable.
   - `RetrievalRouter` — **not semantic**. Routes by receipt + status + scope, in the order specified in the architecture doc.
   - `ActionAuthorizer` — receiver-side `tryAct()` guard; context packets are evidence, not permission.
   - `AletheiaAuthority` — facade exposing the consumer API over WriteGate, RetrievalRouter, and ActionAuthorizer.

3. **Consumer API** for an LLM to use:
   ```ts
   propose(proposal: MemoryProposal): Promise<WriteGateDecision>
   recall(query: RecallQuery): Promise<RetrievalResult>
   tryAct(action: ProposedAction, ctx: ActionContext): Promise<ActionDecision>
   ```
   Every call returns a structured decision with reasons, never a raw bag of strings.

4. **End-to-end demos with live provider adapters** (Anthropic/OpenAI via caller-provided clients):
   - No-key canaries exercise core, Anthropic, and OpenAI paths without external services.
   - A live single-process Anthropic run with `:memory:` store is captured as release evidence.
   - A two-session, same-store continuity demo remains release-hardening evidence, not a blocker for Phase 2.

5. **Package as a publishable TypeScript library** (npm or GitHub Packages).

### Technical decisions (locked unless we explicitly revisit)

| Decision | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | Per user — TS+Angular background, types-as-spec is the right level |
| Storage | SQLite (`better-sqlite3`) | Zero infra, real transactions, file-portable; can swap later |
| Runtime target | Node 20+ | Phase 1 is server-side; browser/edge is later |
| Packaging | Monorepo (pnpm workspaces) from day 1 | Phase 1.4 already needs `@aletheia/adapters-anthropic` separate from `@aletheia/core` to keep core SDK-free. Setting it up later costs more than setting it up now. |
| Lint/format | Biome | TS-native, single binary, replaces ESLint + Prettier |
| LLM clients | Caller-provided clients/runners | Aletheia is a library. Adapters accept authenticated clients; they do not own OAuth or provider login. |
| Tests | Vitest | Modern, TS-native, fast |
| Style | Functional core / imperative shell | Easier to test the gate logic in isolation |

### Library DX requirements

- Package READMEs are release artifacts: each publishable package needs a short quickstart, copyable examples, non-goals, and a stability section.
- Public API stability matters: `propose()`, `recall()`, `tryAct()`, storage interfaces, and exported zod schemas are the consumer surface.
- Schema stability matters: changes to `MemoryAtomSchema`, receipt schemas, or SQLite codecs require migration/replay thinking, not only SQL migration strings.
- Examples live under `packages/*/examples/` or top-level `examples/`; tests can validate examples, but tests are not the documentation surface.

### Acceptance

- [x] A no-LLM SQLite smoke canary exercises `propose()`, `recall()`, and `tryAct()` with zero boundary violations: `pnpm run smoke:core-e2e`.
- [x] Reference Anthropic adapter has deterministic fixture tests and a no-key fixture demo.
- [x] Reference OpenAI adapter has deterministic fixture tests and a no-key fixture demo.
- [x] Live Anthropic happy-path run with a user-provided API key is captured as release evidence: `evidence/live-llm-e2e/anthropic.json`.
- [x] Live Anthropic adversarial run is captured as release evidence: `evidence/live-llm-e2e/anthropic-adversarial.json`.
- [x] Phase 1 package set passes build plus publish dry-run: `@aletheia/core`, `@aletheia/store-sqlite`, `@aletheia/adapters-anthropic`, `@aletheia/adapters-openai`.
- [x] Package version strategy is decided: `0.1.0` is the initial public
  research-ready release line.

### Phase 1.4/1.5 library closure status

- [x] `AletheiaAuthority` facade exposes the roadmap-shaped consumer API: `propose()`, `recall()`, `tryAct()`.
- [x] `packages/core/examples/end-to-end.ts` opens a SQLite store and verifies sealed proposal -> recall abstain, verified recall -> allow, sensitive action -> ask human, and safe local action -> allow.
- [x] `@aletheia/adapters-anthropic` added as a separate SDK-compatible adapter package; `@aletheia/core` remains SDK-free.
- [x] Anthropic-compatible bridge records conversation events, asks the model only for proposal drafts, and routes drafts through `AletheiaAuthority.propose()`.
- [x] Answer path calls the model only after governed `recall()` and receiver-side `tryAct()` both allow local/shadow use.
- [x] Fixture tests validate malformed model JSON, recall fail-closed, sensitive-action ask-human, and local allowed answer behavior.
- [x] `examples/anthropic-e2e/README.md` documents live Claude wiring with a user-provided API key.
- [x] `@aletheia/adapters-openai` accepts a caller-provided Responses-compatible client and does not implement OAuth.
- [x] OpenAI fixture demo runs without an API key after build: `pnpm -F @aletheia/adapters-openai run demo:fixture`.
- [x] Publish dry-run passed for `@aletheia/core`, `@aletheia/store-sqlite`, `@aletheia/adapters-anthropic`, and `@aletheia/adapters-openai`.
- [x] No-key closure canaries pass with `boundaryViolations: []`: core SQLite smoke, Anthropic fixture demo, OpenAI fixture demo.
- [x] Real-provider live demo script exists: `pnpm run demo:live-llm` with `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.
- [x] Live Anthropic API run passed with an operator-provided key and explicit approval; evidence captured in `evidence/live-llm-e2e/anthropic.json`.
- [x] Adversarial live run passed against Anthropic: Claude suppressed credential/policy/destructive prompts, and direct WriteGate canaries denied or escalated matching unsafe proposals.

---

## Phase 2 — Memory as a process, not an index

**Goal**: deliver claim 2 — memories that evolve through explicit, auditable lifecycle passes, not only when queried.

Built on top of Phase 1.

**Status (closed through Phase 2.4, 2026-05-17)**: the lifecycle substrate is executable. Aletheia can age already-authorized recall results, derive promotion/staleness evidence from append-only recall events, apply deterministic sleep-cycle transitions through audited storage APIs, and reconstruct successor lineage without overwriting prior beliefs.

### Phase 2.0 status

- [x] `@aletheia/dynamics` package created as the first Phase 2 surface.
- [x] Deterministic `DynamicsEngine.tick()` plans/applies status transitions from explicit policy and evidence.
- [x] Decay is per status: candidates and verified memories expire sooner than trusted memories.
- [x] Candidate promotion requires explicit source-consistent recall evidence; confidence/consensus do not authorize promotion.
- [x] Unresolved conflicts touching an atom block candidate promotion and deprecate previously actionable verified/trusted claims.
- [x] Sealed and human-required atoms are skipped by the dynamics engine.
- [x] `SleepCycleRunner` produces deterministic dry-run/apply reports over host-provided stores.
- [x] SQLite-backed sleep-cycle tests verify apply mode and logical transition timestamps.
- [x] Reconsolidation planner with successor drafts, `sourceMemoryIds`, `supersedes` lineage, and planned deprecation transitions.
- [x] Explicit multi-cycle sleep harness over a SQLite store, without daemon/scheduler behavior.
- [x] Human-confirmed reconsolidation apply path inserts only `candidate` successors and deprecates previous atoms through audited `transitionStatus`.

### Phase 2.1 — Decay model status

- [x] Pure `decayedAuthority(atom, now)` helper exported from `@aletheia/dynamics`.
- [x] Configurable half-life curves: candidates decay fastest, verified memories over weeks, trusted memories over months, sealed memories do not decay, and non-actionable terminal statuses score zero.
- [x] `RetrievalRouter` accepts an optional `authorityScorer` hook that runs only after visibility, scope, status, freshness, type, and topic filters, and before recall limits.
- [x] `AletheiaAuthority` passes the optional scorer through without making `@aletheia/core` depend on `@aletheia/dynamics`.
- [x] Deterministic tests cover status-specific decay, advancing logical time, future/expired validity windows, and filtered recall ranking.

### Phase 2.2 — Auto-transition evidence status

- [x] Candidate promotion is evaluated before stale-candidate deprecation, so a source-consistently recalled candidate can become `verified` instead of being discarded only because it is old.
- [x] `LedgerRecallEvidenceProvider` derives promotion and last-used evidence from append-only `EventLedger` records after ledger-level scope and visibility filtering.
- [x] `sourceConsistentRecallPayload(atom)` gives hosts a canonical event payload for recording source-consistent memory use.
- [x] Verified/trusted staleness uses the latest available anchor among `validFrom`, `lastConfirmedAt`, and ledger-derived `lastUsedAt`.
- [x] Tests cover no-permission fail-closed behavior, stale deprecation, candidate promotion, recent recall protection, unresolved/requires-human conflict handling, and sealed/human-required skipping.
- [x] No auto-promotion to `trusted` or `sealed`; those remain outside operational lifecycle transitions.

### Phase 2.3 — Reconsolidation and lineage status

- [x] Reconsolidation uses successor atoms with `supersedes` links; it does not overwrite existing memory content, scope, visibility, scores, or links.
- [x] Successor insertion remains gated: `ReconsolidationApplier` requires explicit human confirmation and inserts successors as `candidate`.
- [x] Superseded prior atoms are deprecated only through `MemoryStore.transitionStatus()` with audit history.
- [x] `LineageTracer.traceBack()` reconstructs visible `supersedes` chains newest-to-oldest and fails closed on missing/invisible ancestors, cycles, or excessive depth.
- [x] `RetrievalRouter` omits older visible atoms when a visible successor supersedes them, after hard permission/scope/status/freshness filters and before recall limits.
- [x] Tests reconstruct belief history from lineage, verify fail-closed lineage gaps, and verify recall returns the latest visible atom in a successor chain.

### Phase 2.4 — Sleep cycle status

- [x] `SleepCycleRunner` remains a host-triggered function, not a daemon or watcher.
- [x] Dry-run and apply modes are deterministic for the same store, policy, evidence, and logical clock.
- [x] SQLite sleep-cycle tests now exercise ledger-derived recall evidence end to end: candidate promotion, verified staleness deprecation, logical transition timestamps, and status-history audit rows.
- [x] Explicit multi-cycle runs aggregate planned/applied/rejected/skipped memory IDs without hidden scheduling.
- [x] A store left to explicit `tick()` calls evolves observably through `memory_status_history`; transitions can be explained from policy, evidence, unresolved/requires-human conflicts, validity windows, and the cycle clock.

### Scope

- **Status transitions driven by use/disuse**: candidate → verified after repeated source-consistent recall; verified → deprecated after contradicting evidence or staleness threshold.
- **Decay curves**: explicit per-status decay, not a single TTL. Sealed memories never decay; trusted memories decay slower than candidates.
- **Reconsolidation**: when new evidence enters that bears on an existing atom, an explicit human-confirmed reconsolidation gate can produce a candidate successor atom and a `supersedes` link. This is *not* an overwrite and it does not upgrade authority.
- **"Sleep cycle"**: an explicit host-triggered lifecycle pass that walks the store and runs consolidation/decay/conflict-revisit. Inspired by — not literally modeling — biological memory consolidation. No hidden daemon is started by default.

### What's genuinely novel here

Most memory libraries treat memory as read-mostly storage. Treating it as a continuously-evolving substrate, with explicit lifecycle dynamics that an external observer can reason about, is rare territory. The trick will be: keep the dynamics simple enough to debug, expressive enough to matter.

### Acceptance (sketch)

- [x] A memory store subjected to explicit lifecycle passes, with no semantic queries, visibly evolves in observable, deterministic ways.
- [x] Reconsolidation produces lineage chains the user can inspect.
- [x] A simulated agent's belief history can be reconstructed from `memory_status_history` plus `supersedes` links.
- [x] Permission, scope, status, freshness, and conflict checks stay ahead of ranking or lifecycle decisions.

---

## Phase 3 — Subjective time / episodic continuity

**Goal**: deliver claim 3 — the agent has a sense of its own lived experience.

Built on top of Phases 1 + 2.

### Phase 3.0 status

- [x] `@aletheia/episodic` package created as the first Phase 3 surface.
- [x] Explicit episodic anchors are parsed from event payloads without treating them as authority.
- [x] Episode memory projection respects visibility and scope before matching source-event anchors.
- [x] Historical belief snapshots reconstruct status at an `asOf` time from `MemoryStore.statusHistory`, not just current atom status.
- [x] Episode comparison reports added, removed, persisted, and status-changed beliefs across session boundaries.
- [x] Restart self-state reconstruction categorizes visible atoms into beliefs, uncertain, distrusted, and human-required memory.

### Phase 3.1 status

- [x] Visible episode catalog lists conversation/task/session/decision-context anchors after visibility and scope filtering.
- [x] Permission-guarded memory timeline exposes audited status history only after the atom is visible and in scope.
- [x] Episode comparison semantics are explicit: compare visible belief snapshots at episode boundaries, not only atoms born inside each episode.

### Scope

- Atoms indexed not just by wall-clock time but by the agent's **experiential timeline**: which conversation, which task, which decision context they emerged from.
- Queries like *"what did I believe about X last week"*, *"the memory I formed during conversation Y"*, *"what changed between session A and session B"* become first-class.
- **Identity continuity across sessions**: when an agent process restarts, the memory store reconstitutes a coherent "self" — what it believes, what it doesn't trust, what it's still uncertain about.

### Why last

This phase requires Phase 1's lineage (to reconstruct chains) and Phase 2's dynamics (to have anything interesting to remember about). Doing it first would be building the cathedral spire before the foundation.

---

## Naming decision (RESOLVED, 2026-05)

### The problem we had to solve

The original name "Synaptic Mesh" collided with [ruvnet/Synaptic-Mesh](https://github.com/ruvnet/Synaptic-Mesh) — a peer-to-peer neural network mesh with agents and SQLite. Same vocabulary surface, same audience. Continuing under that name was asking for permanent confusion.

### Why Aletheia

From Greek, *aletheia* (ἀλήθεια): "unconcealment", "disclosure", or "truth" in the sense of what is no longer hidden — distinct from *veritas* (truth as correspondence). Heidegger's reading is the most-cited modern one but is not the project's anchor; we use the older epistemic sense.

The name encodes the design maxim directly:

> A memory that knows when to distrust itself is one that pursues *aletheia* — the unconcealment of its own gaps, contradictions, and stale claims — over the *comfort* of always producing an answer.

### Alternatives considered, and why rejected

| Candidate | Rejected because |
|---|---|
| Mnesis | Direct collision with [Lucenor/mnesis](https://github.com/Lucenor/mnesis), a Python library doing memory management for long-running LLM agents with SQLite append-only logs — exact same conceptual space, different language. Renaming into the same conflict would be self-defeating. |
| Custos | Adequate but functional; loses the epistemic emphasis. Kept as a fallback if Aletheia ever needs to change. |
| AuthoredMemory / WarrantedRecall | Descriptive but bland; doesn't carry a thesis. |

### npm namespace

The bare package `aletheia` on npm is taken but abandoned (last published 9 years ago, ~1 download/week, unrelated compile-to-JS toy). Rather than fight for the squatted name, we publish under the **scoped namespace `@aletheia/*`**:

- `@aletheia/core` — the authority engine (Phase 1).
- `@aletheia/store-sqlite` — the SQLite-backed MemoryStore (Phase 1).
- `@aletheia/adapters-anthropic` — reference LLM integration (Phase 1).
- `@aletheia/adapters-openai` — OpenAI Responses-compatible reference LLM integration (Phase 1).
- `@aletheia/dynamics` — deterministic lifecycle dynamics (Phase 2).
- `@aletheia/episodic` — subjective-time projections and continuity snapshots (Phase 3).

Scoped namespace keeps optional future packages possible, but CLI/MCP packages are explicitly outside the initial library release cycle.

### Rename Surface

- [x] `README.md`, `ROADMAP.md`, `GLOSSARY.md`, `CHANGELOG.md` — prose updates (this commit).
- [x] `CITATION.cff` updated for Aletheia.
- [x] Historical Synaptic Mesh artifacts removed from the active tree during
  repo hygiene cleanup.
- [ ] Git remote / GitHub repo name. Coordinate with whoever owns the org.

---

## Out of scope (explicit)

To keep this honest:

- No semantic vector store. Ever. If embeddings show up, it's a clearly-labeled optional adapter, never the substrate.
- No automatic memory promotion to production-affecting state without human confirmation. The fail-closed maxim is non-negotiable across all phases.
- No daemon / watcher by default.
- No CLI, MCP server, terminal UX, or OAuth/account-management flow in the initial library release cycle.
- No claim of biological plausibility. Phase 2's "sleep cycle" is an engineering pattern inspired by neuroscience, not a model of it.

---

## How to read this roadmap

- Phase 0 is a sprint. Phase 1 is a quarter-scale effort. Phases 2 and 3 are open-ended research.
- Each phase has an explicit acceptance criterion. We don't declare a phase "done" by feature count; we declare it done by what an outside observer can verify.
- Every spec in `specs/` is binding on the implementation. Where a spec is ambiguous, fix the spec first.
