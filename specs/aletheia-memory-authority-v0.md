# Aletheia Memory Authority v0

Status: executable TypeScript baseline for the `0.1.0` release line.

## Purpose

Aletheia is a TypeScript library for memory as governance for LLM agents. It
does not treat memory as stored truth or as better retrieval. It treats each
memory as an auditable claim with source, scope, visibility, status, lineage,
freshness, conflict state, and effect boundary.

Design maxim:

> Do not build a memory that remembers more. Build a memory that knows when to distrust itself.

## Public package surface

The `0.1.0` release line is a library surface, not an application:

- `@aletheia-labs/core`: zod domain schemas, storage ports, runtime gates, and the
  `AletheiaAuthority` facade.
- `@aletheia-labs/store-sqlite`: SQLite implementation of the core storage ports.
- `@aletheia-labs/adapters-anthropic`: BYO Anthropic client adapter that drafts
  proposals and answers after governed recall.
- `@aletheia-labs/adapters-openai`: BYO OpenAI client adapter with the same boundary.
- `@aletheia-labs/dynamics`: lifecycle policies, authority decay, sleep-cycle
  orchestration, recall evidence, and reconsolidation helpers.
- `@aletheia-labs/episodic`: read-only subjective-time projections over events and
  memory status history.

Core has no native database dependency and no provider SDK dependency. Storage,
provider authentication, scheduling, and real-world permission systems are host
responsibilities.

## System flow

```text
Host / Provider Adapter
  |
  v
EventLedger.append()                 append-only source evidence
  |
  v
AletheiaAuthority.propose()
  |
  v
WriteGate                            source, visibility, scope, safety, conflict
  |
  v
MemoryStore.insert()                 append-only atom content
  |
  +--> ConflictRegistry.record()
  |
  v
AletheiaAuthority.recall()
  |
  v
RetrievalRouter                      permission before ranking
  |
  v
AletheiaAuthority.tryAct()
  |
  v
ActionAuthorizer                     receiver-side action classification
```

Phase 2 lifecycle work is explicit and host-triggered:

```text
SleepCycleRunner.run()
  |
  v
DynamicsEngine.tick(now)             deterministic plan/apply pass
  |
  v
MemoryStore.transitionStatus()       audited status transition only
```

Phase 3 subjective-time work is read-only:

```text
EpisodicTimeline                     episodes, beliefsAt, memoryTimeline, selfState
```

## Non-negotiable invariants

1. Fail closed: unverifiable authority returns `fetch_abstain`, `ask_human`,
   `deny`, or `block_local`.
2. Permission before semantics: visibility and scope filtering happen before
   type/topic filtering, scoring, ranking, or model prose.
3. Receipts are evidence, not permission tokens. The receiver always
   re-classifies the proposed action.
4. Sensitive actions always return `ask_human`.
5. Unresolved conflicts block action and local use.
6. Confidence, consensus, CHAIN labels, and prose are never authority.
7. No semantic retrieval, embeddings, or vector store.
8. Content, scope, visibility, and links are append-only. Status changes go
   through `transitionStatus()` and must be auditable.

## Domain objects

### Event

An `Event` is raw source evidence: conversation text, tool output, document
observation, model draft, operator decision, or host fact. Events are
append-only. They do not become authority by themselves.

Event reads are visibility-filtered. If a source event is missing, invisible,
or outside the proposal scope, `WriteGate` refuses to create actionable memory.

### MemoryProposal

A `MemoryProposal` is an agent or adapter request to store a claim. It includes:

- proposer identity and timestamp;
- memory type and claim text;
- source event ids;
- intended scope and visibility;
- risk level;
- known conflicts.

Proposals are not memory. They must pass the `WriteGate`.

### MemoryAtom

A `MemoryAtom` is the smallest actionable memory unit. It includes:

- typed content;
- source event ids and optional source memory ids;
- scope and visibility;
- status;
- scores;
- validity window;
- lineage links such as `contradicts`, `supports`, `derived_from`, and
  `supersedes`.

Scores are routing metadata. They do not grant permission. A high authority
score cannot override stale validity, wrong scope, missing visibility,
candidate status, or unresolved conflict.

### Status

`candidate` means recorded but not actionable by default. `verified` and
`trusted` are the normal recall statuses. `sealed`, `human_required`,
`deprecated`, and `rejected` are non-actionable in ordinary recall/action paths.

`trusted` and `sealed` are human/operator-level states. The dynamics package
does not automatically promote to them.

## WriteGate contract

`WriteGate` and `AletheiaAuthority.propose()` implement proposal-to-atom
governance.

Order of checks:

1. Parse the proposal through zod.
2. Resolve permitted visibilities for the proposer.
3. Verify requested write visibility is allowed.
4. Load all source events under the same visibility boundary.
5. Verify each source event is in the proposal scope.
6. Evaluate deterministic proposal safety.
7. Query conflict state.
8. Build and zod-validate a memory atom.
9. Insert the atom or return a structured refusal.

The proposal safety guard can deny or escalate claims that look like secrets,
permission-bypass policies, or destructive durable instructions. It is not a
general DLP system and never grants authority.

Human-required or conflicted proposals may be stored as non-actionable audit
atoms. They are not returned as ordinary actionable recall.

## Storage contract

`@aletheia-labs/core` defines storage ports only:

- `EventLedger`;
- `MemoryStore`;
- `ConflictRegistry`.

`@aletheia-labs/store-sqlite` implements those ports with embedded idempotent
migrations, WAL, foreign keys, zod decode on read, append-only inserts, and
status/history tables.

`MemoryStore.query()` is a low-level port and can intentionally omit
`validAt` for scanners such as dynamics. Agent-facing recall must pass the
current `validAt` through `RetrievalRouter`.

## RetrievalRouter contract

`RetrievalRouter` and `AletheiaAuthority.recall()` implement authority-first
recall. This is not semantic search.

Order of checks:

1. Parse the query.
2. Resolve caller visibility.
3. Fail closed if a topic query is supplied without a host exact matcher.
4. Query the store by permitted visibility, scope, status, and `validAt=now`.
5. Apply optional memory-type and exact topic filters.
6. Collapse superseded atoms from the result set.
7. Apply optional authority scoring only within the already-authorized set.
8. Query unresolved or human-required conflicts.
9. Return `allow_local_shadow`, `conflict_boundary_packet`, or
   `fetch_abstain`.

The optional authority scorer is a ranking hook, not a permission hook. It must
not call embeddings, perform semantic retrieval, or use confidence/prose as
authority.

## ActionAuthorizer contract

`ActionAuthorizer` and `AletheiaAuthority.tryAct()` are receiver-side guards.
They re-check action authority immediately before a host uses memory for an
effect.

Order of checks:

1. Parse action and action context.
2. Sensitive action classes return `ask_human`.
3. Unknown or non-local actions return `deny` or `ask_human`.
4. Empty citations fail closed.
5. Resolve actor visibility.
6. Reload cited atoms under visibility filtering.
7. Verify scope and current validity.
8. Verify status is actionable.
9. Query unresolved or human-required conflicts.
10. Return `allow_local_shadow` only after all checks pass.

The action context packet is not a permission token. It is evidence for the
receiver algorithm.

## Dynamics contract

`@aletheia-labs/dynamics` implements memory-as-process without introducing a daemon
or hidden mutation. Its detailed contract is
`specs/memory-dynamics-v0.md`; this section states how dynamics fits the
authority protocol.

Dynamics is downstream of Phase 1 gates. It does not accept raw model prose as
authority and it does not authorize action. It can only compute effective
ranking values, plan/apply status transitions, and create human-confirmed
reconsolidation successors.

### Authority decay

`decayedAuthority(atom, now, policy)` is pure. It never mutates the atom and
never changes status. It returns an effective ranking score:

- `candidate` decays quickly;
- `verified` decays moderately;
- `trusted` decays slowly;
- `sealed` keeps its stored authority;
- `deprecated`, `rejected`, and `human_required` score zero.

Decay can influence ranking after hard filters. It never grants permission.

### Lifecycle tick

`DynamicsEngine.tick(input)` scans visible atoms in a scope. It intentionally
does not pass `validAt` to `MemoryStore.query()` because expired atoms must
remain visible to the lifecycle pass so they can be deprecated.

The engine can run in dry-run mode or apply mode. Apply mode mutates only
through `MemoryStore.transitionStatus()` using the configured policy actor.
The logical timestamp comes from the host so tests, audits, and replays can
reproduce the same decisions.

Allowed automatic transitions are operational:

- stale or expired memories can become `deprecated`;
- candidates with explicit source-consistent recall evidence can become
  `verified`;
- unresolved conflicts keep candidates non-actionable and can deprecate
  already verified/trusted atoms.

Automatic dynamics do not promote to `trusted` or `sealed`.

Candidate promotion to `verified` requires explicit operational evidence plus
configured metadata thresholds. Confidence, consensus, CHAIN labels, prose, or
model self-assessment never count as evidence.

### Reconsolidation

Reconsolidation does not overwrite. It plans a successor atom with a
`supersedes` link to the prior atom. The successor starts as `candidate`.

`ReconsolidationPlanner` is read-only. `ReconsolidationApplier` requires
explicit human confirmation before inserting the successor and deprecating the
prior atom. If successor insertion fails, the prior atom is not deprecated.

This is the only Phase 2 path that creates new memory content, and it creates
candidate content only. It does not bypass the action receiver or promote the
successor to `verified`, `trusted`, or `sealed`.

### Sleep cycle

`SleepCycleRunner` is an orchestrator, not a scheduler. The host supplies each
cycle input and logical timestamp. Given the same store state, policy, and
timestamp, the reported decisions are deterministic.

Sleep-cycle reports are audit records, not permission tokens. A host may log
or inspect them, but acting on memory still requires governed recall and
`tryAct()`.

## Episodic contract

`@aletheia-labs/episodic` implements subjective-time projections over explicit
event anchors and memory status history. It is read-only.

It can:

- list visible episodes;
- project memories for one episode;
- reconstruct beliefs at a historical instant;
- compare two episodes;
- return memory status timelines;
- produce a self-state snapshot grouped into beliefs, uncertain, distrusted,
  and human-required memory.

Episode membership is audit context, not permission. Hosts still need governed
recall and `tryAct()` before acting.

## Provider adapter contract

Provider adapters are BYO-client. Aletheia does not own OAuth flows, API keys,
CLI sessions, or provider accounts.

Adapters may ask an LLM to draft memory proposals or answer using recalled
context. All proposal writes still go through `AletheiaAuthority.propose()`.
All answer-context retrieval still goes through governed recall. Model prose is
never authority.

## Out of scope for v0

- OAuth flows, CLI UX, MCP server, daemon, watcher, or background scheduler.
- Production authorization service.
- Secret scanning guarantees beyond the deterministic proposal safety guard.
- Semantic retrieval, embeddings, vector stores, or model-ranked recall.
- Automatic promotion to `trusted` or `sealed`.
- Runtime enforcement outside the decisions returned by the library.

## Open design questions

1. How should richer host evidence prove that repeated recall was
   source-consistent?
2. Which reconsolidation cases should remain human-only after `0.1.x`?
3. How much receipt detail can be compressed without over-abstaining normal
   developer workflows?
4. How should framework-specific action vocabularies map into the fixed
   receiver-side action classes?
5. Which API shapes should be stabilized before `1.0.0`?
