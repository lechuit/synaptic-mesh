# Synaptic Mesh: Receipt-Preserving Memory Authority for Multi-Agent Systems

Status: public release-candidate paper draft v0.1 / not peer-reviewed / not runtime-ready  
Generated: 2026-05-06T19:55Z  
Project: Synaptic Mesh research package  
Boundary: public research release candidate; not runtime, not production/canary/enforcement, not operational use

## Title candidates

1. **Synaptic Mesh: Receipt-Preserving Memory Authority for Multi-Agent Systems**
2. **When Agent Memory Should Not Authorize Action: A Receipt-Through-Transform Protocol**
3. **Laundering-Resistant Memory Handoffs for Multi-Agent AI Systems**
4. **Beyond Relevance: Authority, Boundary, and Lineage Receipts for Agent Memory**
5. **Memory That Distrusts Itself: Authority-Preserving Context Transforms for AI Agents**

Working title: **Synaptic Mesh: Receipt-Preserving Memory Authority for Multi-Agent Systems**

## Abstract draft

Agent memory systems increasingly persist, retrieve, summarize, and share context across tools, sessions, and specialized agents. Recent retrieval, agent-memory, policy/provenance, and stateful-framework lines emphasize retrieval, persistence, reflection, personalization, provenance, access control, and state management [R01, R02, R03, R04, R07, R12, R14, R16-R18]. These mechanisms are useful, but they do not by themselves answer a narrower multi-agent question: what authority survives when memory-derived summaries travel through compression, handoff, and action-planning steps? A memory can be relevant, well-summarized, and correctly sourced while still being stale, local-only, denied, partial-lineage, human-required, or unsafe to use as action authority.

This paper introduces **Synaptic Mesh**, a protocol proposal for multi-agent memory authority. v0.1.0-rc1 is validated in a local shadow workflow, but the protocol target is framework-agnostic rather than tied to one specific framework. Borrowing from provenance and authorization traditions [R03, R04, R07, R08], the core claim is that memory claims should carry compact authority/status/boundary receipts that survive transformations such as source result → summary → handoff → next-action → action proposal. Receipts bind source identity, freshness, scope, promotion boundary, forbidden effects, later restrictive events, tuple completeness, and the proposed action boundary. The receiving agent checks these receipts before treating a memory-derived summary as permission, readiness, or durable truth.

Local adversarial fixtures suggest that receipt-through-transform can catch several memory laundering failures in the tested cases: sender-safe labels overriding receiver classification, boundary substring smuggling, cross-source authority laundering, stale receipt reuse, and over-trust in confidence/prose/checksum fields. The latest compressed-temporal fixture identifies an 11-field authority-critical receipt tuple that preserves zero unsafe allows and zero false rejects in local tests while reducing field count by 31.25% relative to a fuller audit receipt. These results are not production benchmarks; they are a falsification ledger supporting a narrower protocol hypothesis: multi-agent memory may need authority-preserving transforms, not only better retrieval.

## One-sentence thesis

Synaptic Mesh treats memory not as stored truth but as a network of claims whose authority boundaries must survive compression, handoff, and action construction.

## Core design maxim

> Do not build a memory that remembers more. Build a memory that knows when to distrust itself.

## Narrow claim

In multi-agent memory systems, authority/status/boundary receipts must survive compression transforms — source result → summary → handoff → next-action → action proposal — so stale, denied, sealed, local-only, partial-lineage, or human-required evidence cannot be laundered into action authority.

## Current implementation scope

v0.1.0-rc1 is currently validated in a local shadow workflow. The included implementation is a standalone reference package and fixture suite, not integrated with any production/runtime host. The intended direction is portable: other agent frameworks could implement the same receiver-side receipt validation discipline through adapters, but those adapters are future work.

## Non-claims

Synaptic Mesh does **not** claim novelty for:

- vector retrieval or RAG;
- metadata filters or namespaces;
- access-control lists;
- memory stores or generic agent memory products;
- knowledge graphs;
- provenance graphs;
- CRDTs/conflict logs;
- audit logs;
- blackboard systems;
- final-action policy engines;
- human approval gates;
- summarization or handoff formats alone.

Those mechanisms are adjacent or borrowed vocabulary. Synaptic Mesh becomes interesting only when it binds them into a receipt discipline that survives agent-to-agent compression and helps the receiver classify what action boundary, if any, is supported.

## Problem statement

A multi-agent system may have many agents that observe, summarize, retrieve, critique, and act. These agents often exchange compressed context rather than raw evidence. This creates a laundering problem:

1. a source artifact says a claim is local-only, stale, rejected, partial, or human-required;
2. a summarizer compresses the useful part but drops the boundary;
3. a handoff labels the result “safe” or “ready”;
4. a receiver treats the summary as permission;
5. an action planner performs or proposes an effect that the original evidence did not authorize.

Classic retrieval relevance does not by itself answer this. RAG improves access to external knowledge and context [R01, R02], but a retrieved/vector result can be semantically relevant while still unauthorized for a proposed effect. Access-control and zero-trust traditions distinguish possession of information from permission to use it [R03-R05]. Provenance describes derivation [R07], but provenance alone is insufficient for this protocol question if receiver-side action classification does not consume authority-critical fields preserved through the memory transform. A policy engine at final action time helps [R08], but a final decision still needs adequate memory lineage to know whether an apparently benign action derives from a denied or stale claim.

## Failure model

A multi-agent memory mesh fails when it:

1. stores false or malicious content as stable fact;
2. shares private memory with the wrong agent or scope;
3. lets one weak/local claim become global authority;
4. hides semantic conflicts under last-writer-wins summaries;
5. compresses away evidence, boundary, or conditions;
6. retrieves by superficial similarity instead of decision utility and authority;
7. cannot preserve tombstones, rejection receipts, or later restrictive events;
8. lets confidence, consensus, checksum, sender labels, or polished prose override source/freshness/scope/boundary validation;
9. becomes too ceremonious and overblocks routine local work.

## Architecture overview

Baseline flow:

```text
User / Environment
  ↓
Event Ledger
  ↓
Memory Proposal Layer
  ↓
Write Gate
  ↓
Private Memory / Team Memory / Global Memory
  ↓
Conflict Registry
  ↓
Retrieval Router
  ↓
Action Context Packet
  ↓
Action Proposal / Agent Work
```

### Event Ledger

An append-only record of observations, conversations, tool outputs, and source documents. Events preserve raw evidence so summaries do not become the only truth source.

### Memory Proposal Layer

Agents propose memory changes instead of directly writing authoritative shared memory. Proposals include source events, intended scope, intended visibility, risk level, and known conflicts.

### Write Gate

The Write Gate classifies proposals as candidate, verified, trusted, deprecated, rejected, sealed, or human-required. Low-risk private/team candidate memory may move quickly; shared trusted memory requires evidence, authority, privacy clearance, and conflict review.

### MemoryAtom

A MemoryAtom is the smallest actionable memory unit. It contains content plus source references, scope, visibility, status, authority scores, freshness, stability, consensus, validity windows, and conflict links. No single score is authority.

### Conflict Registry

Contradictions are preserved as explicit conflict records rather than overwritten. A retrieval packet may need to surface conflict state, stop reasons, or human-required gates.

### Retrieval Router

The router ranks by permission, authority, scope, freshness, conflict, decision impact, and then relevance. Semantic similarity is useful after unsafe/stale/unauthorized candidates have been shaped or removed.

### Action Context Packet

A compact packet sent to the acting agent. It includes allowed action boundary, source identity, evidence, gaps, conflicts, redactions, and stop reasons. The packet is not a permission token; it is a context/authority contract to check.

## Receipt-through-transform

The distinctive primitive is **receipt-through-transform**: compact authority receipts travel with compressed summaries and are checked before the receiving agent treats the summary as permission, readiness, or durable memory.

A current compressed temporal receipt requires at least these fields in local tests:

```text
SRC, SRCPATH, SRCDIGEST, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT
```

Field roles:

| Field | Role |
|---|---|
| `SRC` | Source artifact identity |
| `SRCPATH` | Source path/lane binding |
| `SRCDIGEST` | Source digest/lane binding |
| `PROD` | Produced-at time |
| `FRESH` | Receiver freshness status |
| `SCOPE` | Scope of usable context |
| `PB` | Promotion/use boundary |
| `NO` | Explicit forbidden effects |
| `LRE` | Later restrictive event status |
| `TOK` | Tuple completeness / truncation guard |
| `ACT` | Proposed action for receiver-side classification |

Useful but non-authority-critical in the latest local fixture:

```text
CTRID, RB, CHAIN, CONF, PROSE
```

These improve auditability and human readability, but do not authorize action.

## Interpretation rules v0

1. Missing required fields should fetch/abstain, not trust polished prose.
2. Permission filtering happens before semantic ranking.
3. Boundary normalization is allowed only after source binding and only for harmless L0/L1 local-shadow formatting drift.
4. Sender-local or sender-safe labels are not authority.
5. Receiver independently classifies `ACT`.
6. Confidence, consensus, checksums, chain labels, and prose never override source/freshness/scope/boundary validation.
7. Sensitive, external, runtime, config, publication, durable-memory, delete, canary, enforcement, production, or L2+ effects require human approval.
8. `NO` is a prohibition lane: “no runtime” is not “runtime approved.”

## Local evidence summary

These are local fixtures, not production benchmarks. Their role is to falsify specific failure modes.

| Fixture | Result | Main lesson |
|---|---:|---|
| `T-synaptic-mesh-end-to-end-shadow-flow-v0` | PASS 12/12; unsafe 0; false rejects 0 | End-to-end local shadow flow can preserve boundaries. |
| `T-synaptic-mesh-retrieval-threshold-cliff-v0` | PASS; unsafe 0 | Boundary/decision-first retrieval catches blockers that similarity-first misses. |
| `T-synaptic-mesh-boundary-coverage-receipt-v0` | PASS | Compact receipts need coverage counts/digests/decision. |
| `T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0` | PASS 8/8 | Receipts must survive paraphrase/transport drift. |
| `T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0` | PASS 9/9 | Source/freshness/route binding blocks swapped lanes. |
| `T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0` | PASS 10/10 | Stale/current conflicts fail closed or ask human. |
| `T-synaptic-mesh-temporal-precedence-compressed-handoff-v0` | PASS 10/10 | Later restrictive events override optimistic old receipts. |
| `T-synaptic-mesh-compressed-temporal-receipt-receiver-v0` | PASS 12/12 | Receiver does not over-trust compact/prose packets. |
| `T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0` | PASS 10/10 | Receiver classifies `ACT`; sender labels are not authority. |
| `T-synaptic-mesh-compressed-temporal-boundary-normalization-v0` | PASS 12/12 | Narrow formatting normalization can avoid overblocking without allowing L2+ expansion. |
| `T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0` | PASS 14/14 | Source binding must precede boundary normalization. |
| `T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0` | PASS 23/23 | 11 authority-critical fields preserved unsafe 0 / false rejects 0 with ~31% field savings. |

Latest compressed-temporal metrics:

| Artifact | Cases | Allow | Ask-human | Fetch/abstain | Unsafe allows | False rejects |
|---|---:|---:|---:|---:|---:|---:|
| `role-separation-v0` | 10 | 2 | 6 | 2 | 0 | 0 |
| `boundary-normalization-v0` | 12 | 4 | 3 | 5 | 0 | 0 |
| `boundary-normalization-cross-source-v0` | 14 | 3 | 3 | 8 | 0 | 0 |
| `cross-source-minimal-fields-v0` | 23 | 3 | 3 | 17 | 0 | 0 |

## Useful failures and repairs

| Failure | Repair |
|---|---|
| Boundary substring bug: `PB` text containing L0/L1 could smuggle `L2plus operational approved by sender`. | Require exact local boundary values before local allow. |
| Boundary normalizer overblocked harmless variants or risked accepting semantic expansion. | Normalize only narrow syntactic local-shadow variants; reject expansion terms first. |
| Cross-source packet could launder authority through known-looking labels or prose. | Verify `SRC`, `SRCPATH`, `SRCDIGEST`, and freshness before boundary normalization. |
| Evaluator treated forbidden words inside `NO` as grants. | Interpret `NO` as prohibition lane; distinguish “no runtime” from “runtime approved”. |

## Related work positioning

This draft uses citation IDs from the active local bibliography. Tier A/B references have source quotes or conservative downgrade decisions recorded in the research package; product/vendor docs remain landscape references only, not novelty evidence.

### RAG and vector retrieval

Retrieval-Augmented Generation and later RAG surveys establish the value of retrieving external/non-parametric context for knowledge-intensive generation [R01, R02]. Synaptic Mesh does not claim novelty for retrieval, ranking, grounding, or vector stores. Its narrower question is whether retrieved or summarized memory may authorize a proposed effect after it has passed through compression, handoff, and action-planning transforms.

### Access control and zero trust

RBAC, ABAC, and zero-trust architectures provide established ways to separate subjects, resources, actions, attributes, and continuous authorization checks [R03-R05]. Synaptic Mesh is complementary: it asks how an acting agent obtains trustworthy source/freshness/scope/boundary attributes from a memory-derived packet after summarization, rather than treating polished memory text as permission.

### Provenance and policy engines

PROV-DM supplies a vocabulary for entities, activities, agents, derivations, and transformations [R07]. Policy engines such as OPA provide decision frameworks over policy inputs [R08]. Synaptic Mesh does not replace either. Its proposed primitive is a compact receipt-through-transform discipline: preserve enough provenance-derived authority fields that a receiver or policy layer can classify the proposed `ACT` without relying on sender labels or prose.

### Blackboards and multi-agent shared state

Blackboard architectures show a long lineage of shared workspaces for coordinating uncertain knowledge sources [R10]. Synaptic Mesh borrows the intuition that many specialized agents can contribute partial state, but focuses on the authority boundary of reused claims: a shared or summarized claim is not necessarily permitted for every receiver or effect.

### Agent memory systems and stateful frameworks

Generative Agents, Reflexion, MemGPT, AutoGen, and LangGraph-style persistence demonstrate persistent memory, reflection, context management, multi-agent orchestration, checkpointing, and durable state [R12-R16]. Synaptic Mesh targets a complementary failure mode: whether a remembered or reflected claim is current, scoped, conflict-aware, and authorized for the receiver's proposed action after handoff. This is a protocol-scope claim from local fixtures, not a claim that prior systems lack safety or policy mechanisms.

### Managed agent-memory products

Managed memory systems such as Amazon Bedrock AgentCore Memory and Google Agent Platform Memory Bank indicate that persistent agent memory is becoming product infrastructure [R17, R18]. This draft cites those docs only to describe the landscape. They do not establish a peer-reviewed novelty gap, and Synaptic Mesh should not be framed as competing with managed memory products.

### Differentiation summary

| Existing area | Synaptic Mesh should not overclaim | Targeted gap |
|---|---|---|
| RAG / vector search | retrieval and ranking | whether memory-derived context may authorize an effect after transformation |
| ACLs / namespaces | basic access control | permission receipts that survive summary/handoff/promotion |
| Provenance graphs | source tracking | provenance as action boundary, not only citation |
| Policy engines | allow/deny rules | binding policy decisions to memory transformations before final action |
| Agent memory products | persistent personalized memory | laundering-resistant multi-agent authority semantics |

## Minimum functional reference snapshot

The research package now includes a local-only minimum functional reference spine under `implementation/synaptic-mesh-shadow-v0/`. Its purpose is to make the protocol executable for review without implying runtime integration. The reference package includes:

- a compressed temporal receipt parser;
- a receiver-side validator/action classifier;
- a local CLI validator;
- synthetic handoff examples for `allow_local_shadow`, `fetch_abstain`, and `ask_human`;
- a one-command local review runner;
- a README boundary quickstart.

Current local gate snapshot from the package index: review-local `13/13`, fixture parity `15/15`, normalized summary `15`, unsafe allow signals `0`, and source fixture mutation `false`. This is useful evidence that the paper's receipt discipline can be made executable in a small local shadow reference. It is not evidence of production readiness, scalability, usability, or safety as an enforcement system.

## Limitations

1. Current evidence is local and hand-authored, not an independent production benchmark.
2. A local shadow reference exists, but no external or production implementation exists yet.
3. Related work has local quote-check support, but still needs final venue/editorial review.
4. The protocol may become too ceremonious for routine local work.
5. Conflict merge behavior is not yet mature.
6. Source spoofing and nested handoff attacks need stronger tests.
7. Human-required effect splitting — e.g. prepare notification vs send notification — needs clearer semantics.
8. No usability evaluation exists for humans or agents reading Action Context Packets.
9. No performance/scaling measurement exists over large messy memory stores.

## Threat model draft

Attacks/failures to model before publication or prototype:

- sender-safe label smuggling;
- boundary substring smuggling;
- summary/prose laundering;
- source-label spoofing;
- stale receipt reuse;
- missing field optimism;
- high-confidence wrong boundary;
- cross-agent collusion or accidental reinforcement;
- overblocking ordinary low-risk work;
- privacy leakage via shared/team/global memory;
- tombstone/rejection loss through paraphrase;
- final-action policy seeing too little lineage.

## Local publication-review checklist

Ready for staged local review except explicit human/release approval:

- [x] Paper draft complete for local review.
- [ ] Paper draft reviewed and approved by a human reviewer.
- [x] Stable specs extracted into `specs/`.
- [x] Curated reproducibility manifest created.
- [x] One-command local validation path created.
- [x] Related work section citation-backed for local publication review; final venue/editorial review still allowed.
- [x] Threat model complete for local review.
- [x] Limitations explicit and honest.
- [x] Reference implementation separated from runtime integration.
- [x] Public-facing bundle redaction scan passed.
- [ ] Release/publication approved by the project owner/human reviewer.

## Implementation-readiness checklist

Not ready until all checked:

- [ ] Stable schemas for MemoryAtom, Evidence Ledger, Conflict Registry, Receipt, Retrieval Router.
- [ ] Deterministic validators extracted from fixtures.
- [ ] Shadow-mode reference library plan reviewed.
- [ ] Synthetic multi-agent examples created.
- [ ] Failure policy formalized: allow-local vs fetch/abstain vs ask-human.
- [ ] Canary/rollback/audit plan drafted.
- [ ] Explicit human approval for any runtime/tooling/L2+ step.

## Current exit verdict

This paper draft is public as a release-candidate research draft. It is **not peer-reviewed**, **not runtime-approved**, and **not production-ready**.

Allowed next: public review, issue/PR-based feedback, citation corrections, fixture expansion, or further editorial revisions.

Recommended next: collect public review feedback and keep runtime/tooling integration out of scope unless separately designed, reviewed, and approved.
