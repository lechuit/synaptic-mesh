# Glossary

The repo and specs use a dense, deliberately precise vocabulary. This file defines every recurring term so newcomers can read specs and code without reverse-engineering meanings.

Terms are grouped by concept area, not alphabetical.

---

## About the name

**Aletheia** (ἀλήθεια) — Greek: "unconcealment", "disclosure", or truth as *that which is no longer hidden*. The project's design maxim is "build a memory that knows when to distrust itself"; the name encodes exactly that — pursuing the unconcealment of gaps, contradictions, and stale claims over the comfort of always producing an answer. The project was previously developed as "Synaptic Mesh" (see `CHANGELOG.md` and `ROADMAP.md` for the rename rationale).

---

## Core concepts

**Memory authority** — the property that lets a recalled fact legitimately influence an action. Authority is not given by storage, similarity, or confidence; it comes from verifiable source, freshness, scope, and lineage.

**Receipt** — a compact, verifiable contract attached to any memory-derived claim that records the authority fields needed for a receiver to decide whether to act. A receipt is *not* a permission token; it's evidence that a permission decision can be made fail-closed.

**MemoryAtom** — the smallest actionable memory unit. Holds content, type, source references, scope, visibility, status, scores, validity window, and links to other atoms (supports, contradicts, supersedes, derived_from). See `specs/aletheia-memory-authority-v0.md` §4.

**ActionContextPacket (ACP)** — the handoff packet given to the agent about to act. Includes allowed action boundary, source references, freshness, conflicts/gaps, forbidden effects, promotion boundary, receiver instructions. Not a permission token.

**EventLedger** — append-only record of raw events (conversations, tool outputs, documents, observations). Events are evidence, not memory authority by themselves.

**Memory Proposal Layer** — the surface where agents *propose* memory changes instead of writing directly to shared memory.

**Write Gate** — the component that decides a proposal's terminal status (candidate, verified, trusted, deprecated, rejected, sealed, human-required) via SourceCheck → IntentCheck → ConflictCheck → PrivacyCheck → PromotionDecision.

**Conflict Registry** — first-class store of contradictions. Conflicts are never overwritten by summaries; they remain queryable until explicitly resolved.

**Retrieval Router** — selects which atoms to surface for a given query. Permission/visibility filtering happens *before* semantic ranking. Never the other way around.

---

## Receipt fields (compressed-temporal-receipt v0)

The 11 minimum authority fields a receiver verifies before acting. From `specs/compressed-temporal-receipt-v0.md`.

| Key | Meaning |
|---|---|
| `SRC` | source artifact id |
| `SRCPATH` | source artifact path |
| `SRCDIGEST` | content digest of the source |
| `PROD` | producer (who emitted this) |
| `FRESH` | freshness marker (current / stale / unknown) |
| `SCOPE` | applicable scope (local / project / user / team / global) |
| `PB` | promotion boundary (how far this can be promoted) |
| `NO` | forbidden / negated effects |
| `LRE` | later restrictive events (events that may override) |
| `TOK` | tuple completeness token |
| `ACT` | proposed action classification |

---

## Memory status (lifecycle of an atom)

- **candidate** — proposed, not yet verified.
- **verified** — evidence checked, can be used locally.
- **trusted** — strong evidence + clearance, usable across scopes.
- **deprecated** — superseded; kept for lineage, not for action.
- **rejected** — refused by the Write Gate.
- **sealed** — sensitive; not retrievable without special authorization.
- **human_required** — needs explicit human approval before any use.

Promotion between statuses is never automatic for sensitive effects.

---

## Memory planes (visibility scopes)

- **private:agent** — usable only by one agent.
- **private:user** — user-private, highly restricted.
- **team:<name>** — shared within a named team.
- **global:safe** — cross-agent memory after strong checks.
- **sealed:sensitive** — not retrievable without special authorization.
- **ephemeral** — expires or is never promoted.

---

## Decisions a receiver can emit

- **allow_local_shadow** — proceed locally with the proposed action (shadow = no external effects).
- **fetch_abstain** — go get source evidence; do not proceed.
- **ask_human** — request explicit human approval (sensitive/unknown effects).
- **block_local** — stop local action when clearly disallowed.
- **conflict_boundary_packet** — return a packet that surfaces the conflict instead of acting.
- **deny** — flat refusal.

---

## Release-ladder vocabulary (used in CHANGELOG)

**Ladder** — the sequence of small, fail-closed barriers crossed during research releases (v0.45.5 → v0.52.5). Each rung adds exactly one new capability under tight boundaries.

**Shadow** — a mode that exercises the protocol locally with no external effects, no persistence, no runtime authorization. Used to validate behavior before any real integration.

**Rehearsal** — a one-shot, operator-run, read-only invocation of a candidate runtime path. Outputs are evidence, never authority.

**Harness** — the local test/consumption surface used to exercise candidate behaviors without giving them runtime power.

**Shim** — a thin adapter used to invoke a candidate runtime path inside a rehearsal, without touching production.

**Fail-closed** — when verification fails, the system refuses to act (or routes to human) rather than guessing. The opposite of "graceful degradation".

**Source-bound** — every output carries an explicit reference back to its source events; nothing floats.

**Boundary violation** — any case where authority crosses a line it shouldn't (e.g., a local-only claim influencing a global action). The whole ladder counts these per release; the target is always zero.

**Pinned evidence** — the exact metric values recorded at release time, preserved verbatim so a re-run can be compared deterministically.

**Recommendation is not authority** — even when a release recommends "advance to next rung", that recommendation is never an automatic green light. A human decides.

---

## Things often confused

- **Receipt vs. permission token** — a receipt is evidence for a decision; a permission token *is* the decision. We only emit receipts.
- **Authority vs. confidence** — high confidence in a claim doesn't upgrade its authority. Authority comes from source/freshness/scope/lineage, not from internal certainty scores.
- **Memory vs. retrieval** — memory is the substrate (atoms, status, lineage, conflicts). Retrieval is one operation over that substrate, and permission-gated.
- **Shadow vs. dry-run** — shadow runs the real pipeline with effects blocked; dry-run only simulates the pipeline shape without exercising it.
