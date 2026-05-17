# Roadmap

The forward plan from "research artifact" to "running system of memory governance for LLM agents", with naming and technical decisions made explicit.

---

## Central hypothesis

> Most "memory for LLM" projects are search engines in disguise. Aletheia argues that **the unsolved problem is not retrieval but authority**: deciding which recalled facts have the right to influence an action, and refusing to act when that right cannot be verified.

This is the design maxim from `specs/aletheia-memory-authority-v0.md`:

> *Do not build a memory that remembers more. Build a memory that knows when to distrust itself.*

The roadmap below operationalizes that maxim in three layered phases. **Phase 1 is the commitment of the upcoming release cycle.** Phases 2 and 3 are explicit goals, not aspirations.

---

## Phase 0 — Saneamiento (current sprint)

**Goal**: make the repo legible to outside reviewers and pin the forward direction.

**Deliverables**:

- [x] `README.md` rewritten: short, honest about status, design maxim as central piece.
- [x] `CHANGELOG.md`: the v0.45.5 → v0.52.5 release-ladder history archived in one place.
- [x] `GLOSSARY.md`: every recurring term defined.
- [x] `ROADMAP.md`: this document.
- [x] **Naming decision**: project renamed to **Aletheia**; npm namespace `@aletheia/*`. See below.
- [x] **Physical artifacts**: live artifacts renamed (`paper/aletheia-paper-v0.md`, `specs/aletheia-memory-authority-v0.md`, `research-package/aletheia-{bibliography,index}-v0.*`). Historical evidence preserved with original names (`research-package/T-synaptic-mesh-*`, `runs/2026-05-03-*/T-synaptic-mesh-*`) — renaming them would break pinned-evidence reproducibility.
- [x] **JS reference impl archived**: `implementation/synaptic-mesh-shadow-v0/` → `archive/synaptic-mesh-shadow-v0/`. Read-only, preserved as parity baseline for the TS migration.
- [ ] Update `ANNOUNCEMENT.md` and `CITATION.cff` to reflect the new name (next sub-task).
- [ ] Update git remote — coordinate with whoever owns the org.

**Acceptance**: a new contributor can clone the repo, read README → GLOSSARY → architecture spec → roadmap in under 30 minutes and know exactly what the project is and is not.

---

## Phase 1 — Authority-governed memory, executable (next major cycle)

**Goal**: deliver claim 1 from the README as **running TypeScript code an LLM can actually use**.

This is the phase that crosses the line from "research artifact" to "real software". It does not innovate algorithms; it implements with discipline what the specs already define.

### Scope

1. **Implement `@aletheia/core` in TypeScript from scratch**, with formal types derived directly from `specs/` and `schemas/`. The archived `archive/synaptic-mesh-shadow-v0/` JS implementation serves as a parity reference — every fixture that passed there must pass against the TS implementation.
   - `Receipt`, `CompressedReceipt`, `MemoryAtom`, `MemoryProposal`, `ActionContextPacket`, `Coverage`, `ConflictRecord`, `Decision`.
   - All status / scope / visibility unions modeled as discriminated unions, not strings.

2. **Build the layers that today only exist in specs**:
   - `EventLedger` — append-only, SQLite-backed.
   - `MemoryProposalLayer` — agent surface to propose.
   - `WriteGate` — runs the SourceCheck → IntentCheck → ConflictCheck → PrivacyCheck → PromotionDecision chain.
   - `MemoryStore` — atoms, with status transitions, lineage links, validity windows.
   - `ConflictRegistry` — first-class contradictions, queryable.
   - `RetrievalRouter` — **not semantic**. Routes by receipt + status + scope, in the order specified in the architecture doc.
   - `ActionContextPacketBuilder` — assembles a handoff packet from the above.

3. **Consumer API** for an LLM to use:
   ```ts
   propose(proposal: MemoryProposal): Promise<WriteGateDecision>
   recall(query: RecallQuery): Promise<RetrievalResult>
   tryAct(action: ProposedAction, ctx: ActionContext): Promise<ActionDecision>
   ```
   Every call returns a structured decision with reasons, never a raw bag of strings.

4. **End-to-end demo with a live LLM** (Claude via API):
   - Session A: a short conversation where the agent proposes some memories.
   - Session B (separate process, same store): the agent tries to act on those memories. The system surfaces stale/unverified ones and blocks action where appropriate.
   - This is the moment the repo earns the phrase "memory real".

5. **Package as a publishable TypeScript library** (npm or GitHub Packages).

### Technical decisions (locked unless we explicitly revisit)

| Decision | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | Per user — TS+Angular background, types-as-spec is the right level |
| Storage | SQLite (`better-sqlite3`) | Zero infra, real transactions, file-portable; can swap later |
| Runtime target | Node 20+ | Phase 1 is server-side; browser/edge is later |
| Packaging | Monorepo (pnpm workspaces) from day 1 | Phase 1.4 already needs `@aletheia/adapters-anthropic` separate from `@aletheia/core` to keep core SDK-free. Setting it up later costs more than setting it up now. |
| Lint/format | Biome | TS-native, single binary, replaces ESLint + Prettier |
| LLM client | Anthropic SDK (`@anthropic-ai/sdk`) | Reference integration; SDK-agnostic adapter underneath |
| Tests | Vitest | Modern, TS-native, fast |
| Style | Functional core / imperative shell | Easier to test the gate logic in isolation |

### Acceptance

- All existing fixtures in `runs/2026-05-03-memory-retrieval-contradiction-lab/` pass against the TS implementation.
- An external developer can `npm install` the package, follow a 5-minute quickstart, and run the end-to-end demo with their own Claude API key.
- Zero boundary violations in the demo, validated by an automated reproducibility check.

---

## Phase 2 — Memory as a process, not an index

**Goal**: deliver claim 2 — memories that **evolve on their own**, not on query.

Built on top of Phase 1.

### Phase 2.0 status

- [x] `@aletheia/dynamics` package created as the first Phase 2 surface.
- [x] Deterministic `DynamicsEngine.tick()` plans/applies status transitions from explicit policy and evidence.
- [x] Decay is per status: candidates and verified memories expire sooner than trusted memories.
- [x] Candidate promotion requires explicit source-consistent recall evidence; confidence/consensus do not authorize promotion.
- [x] Unresolved conflicts touching an atom block candidate promotion and deprecate previously actionable verified/trusted claims.
- [x] Sealed and human-required atoms are skipped by the dynamics engine.
- [x] `SleepCycleRunner` produces deterministic dry-run/apply reports over host-provided stores.
- [x] SQLite-backed sleep-cycle tests verify apply mode and logical transition timestamps.
- [ ] Reconsolidation with successor atoms and `supersedes` lineage. See `docs/phase-2-reconsolidation-design-note.md` for the current design blocker.
- [ ] Long-running multi-cycle harness over a SQLite store.

### Scope

- **Status transitions driven by use/disuse**: candidate → verified after repeated source-consistent recall; verified → deprecated after contradicting evidence or staleness threshold.
- **Decay curves**: explicit per-status decay, not a single TTL. Sealed memories never decay; trusted memories decay slower than candidates.
- **Reconsolidation**: when new evidence enters that bears on an existing atom, the atom re-enters the Write Gate. This is *not* an overwrite — it produces a successor atom and a `supersedes` link.
- **"Sleep cycle"**: a background pass that walks the store and runs consolidation/decay/conflict-revisit. Inspired by — not literally modeling — biological memory consolidation.

### What's genuinely novel here

Most memory libraries treat memory as read-mostly storage. Treating it as a continuously-evolving substrate, with explicit lifecycle dynamics that an external observer can reason about, is rare territory. The trick will be: keep the dynamics simple enough to debug, expressive enough to matter.

### Acceptance (sketch)

- A memory store left running for N hours, with no queries, visibly evolves in observable, deterministic ways.
- Reconsolidation produces lineage chains the user can inspect.
- A simulated agent's beliefs over time can be reconstructed from the store alone.

---

## Phase 3 — Subjective time / episodic continuity

**Goal**: deliver claim 3 — the agent has a sense of its own lived experience.

Built on top of Phases 1 + 2.

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
- Future sub-packages (`@aletheia/dynamics`, `@aletheia/episodic`) for Phases 2 and 3.

Scoped namespace also clears the way for a CLI binary `aletheia` (e.g. `aletheia recall --status verified`).

### Rename surface (what still needs to change)

- [x] `README.md`, `ROADMAP.md`, `GLOSSARY.md`, `CHANGELOG.md` — prose updates (this commit).
- [ ] `ANNOUNCEMENT.md`, `CITATION.cff`, `paper/` — sweep prose references.
- [ ] Physical directory names (`implementation/synaptic-mesh-shadow-v0/` → `implementation/aletheia-shadow-v0/`, `specs/synaptic-mesh-*` → `specs/aletheia-*`, `research-package/T-synaptic-mesh-*` → `research-package/T-aletheia-*`). Deferred to the first commit of Phase 1 to keep the rename atomic with the TS migration and avoid two cycles of repo-wide path churn.
- [ ] Git remote / GitHub repo name. Coordinate with whoever owns the org.

---

## Out of scope (explicit)

To keep this honest:

- No semantic vector store. Ever. If embeddings show up, it's a clearly-labeled optional adapter, never the substrate.
- No automatic memory promotion to production-affecting state without human confirmation. The fail-closed maxim is non-negotiable across all phases.
- No daemon / watcher by default.
- No claim of biological plausibility. Phase 2's "sleep cycle" is an engineering pattern inspired by neuroscience, not a model of it.

---

## How to read this roadmap

- Phase 0 is a sprint. Phase 1 is a quarter-scale effort. Phases 2 and 3 are open-ended research.
- Each phase has an explicit acceptance criterion. We don't declare a phase "done" by feature count; we declare it done by what an outside observer can verify.
- Every spec in `specs/` is binding on the implementation. Where a spec is ambiguous, fix the spec first.
