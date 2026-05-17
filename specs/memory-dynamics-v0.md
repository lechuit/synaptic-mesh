# Memory Dynamics v0

Status: executable dynamics contract for the `0.1.x` release line.

## Purpose

Memory dynamics turns Aletheia from a disciplined validator into a memory
substrate that can age, revisit, and reconsolidate claims over time. The point
is not to make memory more eager. The point is to make distrust observable.

Dynamics is still governance. It never bypasses source, scope, visibility,
status, conflict, freshness, or receiver-side action classification.

## Design boundary

Autonomous does **not** mean hidden background authority. In Aletheia v0,
autonomy means:

- a host can invoke a deterministic lifecycle pass;
- the lifecycle pass can plan or apply status transitions from explicit policy
  and auditable evidence;
- every mutation goes through storage APIs that record history.

Autonomous does **not** mean:

- a daemon starts by default;
- content is rewritten in place;
- a model gets to promote memory because it sounds confident;
- action permission is inferred from lifecycle state;
- `trusted` or `sealed` is reached without human/operator reasoning.

## Components

### `decayedAuthority()`

`decayedAuthority(atom, now, policy)` is a pure ranking helper.

It:

- reads an atom and logical timestamp;
- returns an effective authority score;
- treats invalid timestamps or expired validity as zero authority;
- scores `deprecated`, `rejected`, and `human_required` as zero;
- leaves `sealed` at its stored authority;
- decays `candidate`, `verified`, and `trusted` with separate half-lives.

It never:

- mutates a memory atom;
- changes status;
- grants permission;
- bypasses retrieval filters;
- performs semantic ranking.

Hosts may pass it as `RetrievalRouter.authorityScorer`, where it runs only
after visibility, scope, status, freshness, type, exact topic, conflict, and
supersession filters.

### `DynamicsEngine.tick()`

`DynamicsEngine.tick(input)` is the lifecycle pass. It is deterministic for a
fixed store state, policy, evidence provider, and `input.now`.

Required input:

- `now`: host-provided logical timestamp;
- `scope`: lifecycle scope;
- `permittedVisibilities`: visibility planes the lifecycle actor may inspect.

Optional input:

- `applyTransitions`: `false`/omitted means dry-run, `true` means apply;
- `statuses`: statuses to scan, defaulting to `candidate`, `verified`,
  `trusted`;
- `limit`: per-call scan limit.

The engine returns a value, not an exception:

- `ok`: scan completed;
- `fetch_abstain`: invalid clock or no permitted visibility.

Each atom produces one decision:

- `planned`: transition would be requested in dry-run mode;
- `applied`: transition was recorded;
- `rejected`: storage refused the transition;
- `skipped`: no transition is due.

### `SleepCycleRunner`

`SleepCycleRunner` wraps a dynamics-compatible engine and formats lifecycle
reports. It is not a scheduler.

The host decides:

- when a cycle runs;
- which scope it scans;
- what logical time it uses;
- whether it is dry-run or apply mode;
- whether multiple cycles are run in sequence.

`runMany()` is deterministic orchestration. It does not retry, sleep, watch the
filesystem, or start a worker.

### Recall evidence

`LedgerRecallEvidenceProvider` derives lifecycle evidence from append-only
events. It counts only events carrying the explicit
`aletheia.source_consistent_recall` payload for the target atom and all of its
source event ids.

Source-consistent recall evidence is not model confidence. It is auditable host
evidence that a memory was used while its original sources were still cited.

### Reconsolidation

Reconsolidation is how new evidence changes a belief without overwriting the
old one.

`ReconsolidationPlanner` is read-only. It validates:

- caller visibility;
- previous atom existence and scope;
- reconsolidatable previous status;
- non-empty source events;
- source event visibility and scope;
- absence of unresolved or human-required conflicts.

It then drafts:

- a successor atom with status `candidate`;
- a `supersedes` link to the previous atom;
- a planned deprecation transition for the previous atom when needed.

`ReconsolidationApplier` requires human confirmation. Without valid
confirmation it returns `ask_human` and mutates nothing. With confirmation it
inserts the successor first; only then does it transition the previous atom.
If successor insertion fails, the previous atom is not deprecated.

## Lifecycle algorithm

For each `tick()`:

1. Validate `now`.
2. Fail closed if `permittedVisibilities` is empty.
3. Query `MemoryStore` by permission, scope, and status.
4. Intentionally do **not** pass `validAt` to `MemoryStore.query()`.
5. Evaluate validity windows locally against `input.now`.
6. Query unresolved or human-required conflicts for each atom.
7. Load explicit evidence from the configured evidence provider.
8. Plan/apply at most one status transition per atom.
9. Record transition through `MemoryStore.transitionStatus()` when applying.
10. Return an audit-friendly summary.

Step 4 is intentional. Ordinary recall must pass `validAt=now`, but lifecycle
scanners must be able to see expired or malformed atoms so they can deprecate
them instead of silently forgetting them.

## Automatic transitions

The dynamics engine may request only operational transitions.

| Current status | Condition | Requested status |
|---|---|---|
| `candidate` | validity expired or stale by policy | `deprecated` |
| `candidate` | source-consistent recall evidence meets policy thresholds | `verified` |
| `verified` | validity expired, stale by policy, or blocked by unresolved conflict | `deprecated` |
| `trusted` | validity expired, stale by policy, or blocked by unresolved conflict | `deprecated` |

The engine skips:

- `sealed`;
- `human_required`;
- `deprecated` unless explicitly scanned;
- `rejected`;
- future-valid atoms;
- candidates blocked by unresolved conflict.

The engine never promotes to `trusted` or `sealed`.

## Evidence and scores

Promotion from `candidate` to `verified` requires all configured promotion
thresholds to pass:

- minimum source-consistent recall count;
- minimum evidence score;
- minimum authority score;
- minimum stability score.

The score thresholds are necessary but insufficient metadata checks. They are
not authority by themselves. A candidate with high scores and no
source-consistent recall evidence must remain candidate or become deprecated
when stale.

`confidence`, `consensus`, CHAIN labels, and prose never influence automatic
promotion.

## Conflict handling

Unresolved or human-required conflicts are lifecycle blockers:

- a conflicted `candidate` is skipped and remains non-actionable;
- a conflicted `verified` or `trusted` atom is planned/applied to
  `deprecated`;
- conflict ids are attached to decisions and transition reasons when
  available.

The dynamics engine must not summarize away a conflict or prefer the latest
claim semantically.

## Audit history

Every applied lifecycle transition must be recorded by `MemoryStore` with:

- transition timestamp;
- previous status;
- next status;
- actor;
- rationale;
- optional conflict id.

The policy actor identifies the lifecycle authority, commonly a sleep-cycle or
system actor. This actor does not imply human approval; it identifies the
automated process that requested the transition.

## Determinism

For the same:

- store contents;
- conflict state;
- event ledger contents;
- dynamics policy;
- evidence provider;
- `now`;
- scope and permitted visibilities;

the engine must produce the same decisions. Implementations must not call
provider APIs, random sources, semantic rankers, or wall-clock time inside the
decision path.

## Relationship to core gates

Dynamics is downstream of Phase 1 authority gates:

- new ordinary memories still enter through `WriteGate`;
- ordinary recall still enters through `RetrievalRouter`;
- action still enters through `ActionAuthorizer`;
- lifecycle status mutation enters through `MemoryStore.transitionStatus()`;
- reconsolidation successor content is candidate-only and human-confirmed
  before storage mutation.

Status transition is not content creation. A lifecycle promotion to `verified`
means the candidate survived explicit operational evidence. It does not grant
permission for sensitive action, nonlocal effects, or future action without
`tryAct()`.

## Out of scope

- Hidden daemon or watcher.
- Semantic retrieval or embeddings.
- Automatic promotion to `trusted` or `sealed`.
- In-place content/scope/visibility/link updates.
- Model-authored lifecycle evidence.
- Production permission enforcement outside returned decisions.

## Open questions

1. What host evidence should count as source-consistent recall in richer
   frameworks?
2. Should some reconsolidation classes eventually allow non-human apply, or
   should successor creation remain human-confirmed?
3. How should lifecycle policies be versioned when persisted stores outlive
   application deployments?
4. Should dynamics decisions emit compact receipts for external audit logs?
5. How should multiple lifecycle actors coordinate without central authority?
