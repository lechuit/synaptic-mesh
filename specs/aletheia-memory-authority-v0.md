# Synaptic Mesh Memory Authority v0

Status: public spec draft v0 / not runtime-ready  
Generated: 2026-05-06T16:42Z

## Purpose

Synaptic Mesh is a proposed multi-agent memory authority protocol. It treats memories as claims with evidence, scope, authority, conflict state, and effect boundaries — not as stored truth.

## Design maxim

> Do not build a memory that remembers more. Build a memory that knows when to distrust itself.

## System flow

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

## Components

### 1. Event Ledger

Append-only record of raw events: conversations, tool outputs, documents, observations, decisions, and artifact changes.

Rules:

- events are evidence, not memory authority by themselves;
- summaries never replace original events;
- rollback/debug requires source events;
- external/untrusted text is remembered as “source X claims Y”, not as instruction.

### 2. Memory Proposal Layer

Agents propose memory changes rather than writing directly into shared memory.

Recommended proposal fields:

```json
{
  "proposalId": "prop_001",
  "proposedBy": "AgentPlanner",
  "proposedAt": "2026-05-06T16:42:00Z",
  "candidateType": "preference | decision | policy | claim | warning | skill | task_state",
  "claim": "...",
  "sourceEventIds": ["event_123"],
  "intendedScope": "local | project | user | team | global",
  "intendedVisibility": "private:agent | private:user | team:<name> | global:safe | sealed:sensitive",
  "riskLevel": "low | medium | high",
  "knownConflicts": []
}
```

### 3. Write Gate

The Write Gate decides whether a proposal becomes candidate, verified, trusted, deprecated, rejected, sealed, or human-required.

Checks:

1. SourceCheck — evidence exists and is in scope.
2. IntentCheck — user/operator intent supports this memory class.
3. ConflictCheck — contradiction and supersession state is known.
4. PrivacyCheck — visibility is allowed before ranking/search.
5. PromotionDecision — determines status and scope.

Default rules:

- low-risk local/team candidates may be cheap;
- global/trusted memory requires stronger evidence and clearance;
- durable memory promotion requires explicit human confirmation in this project;
- sensitive or sealed memory is not retrievable without special authorization.

### 4. MemoryAtom

Smallest actionable memory unit.

Recommended shape:

```json
{
  "memoryId": "mem_123",
  "memoryType": "observation | claim | preference | policy | decision | task_state | warning | skill",
  "content": "...",
  "sourceAgentId": "AgentReviewer",
  "sourceEventIds": ["event_901"],
  "sourceMemoryIds": [],
  "scope": { "kind": "project", "projectId": "example" },
  "visibility": "team:research",
  "status": "candidate | verified | trusted | deprecated | rejected | sealed | human_required",
  "scores": {
    "confidence": 0.0,
    "evidence": 0.0,
    "authority": 0.0,
    "freshness": 0.0,
    "stability": 0.0,
    "consensus": 0.0
  },
  "validFrom": "2026-05-06T00:00:00Z",
  "validUntil": null,
  "lastConfirmedAt": null,
  "links": [
    { "relation": "supports | contradicts | supersedes | derived_from", "targetMemoryId": "mem_045" }
  ]
}
```

No single score is authoritative. `confidence` cannot override weak evidence, stale freshness, wrong scope, or missing permission.

### 5. Memory Planes

| Plane | Meaning |
|---|---|
| `private:agent` | Usable only by one agent. |
| `private:user` | User-private, highly restricted. |
| `team:<team>` | Shared within a named team. |
| `global:safe` | Safe cross-agent memory after strong checks. |
| `sealed:sensitive` | Not retrievable without special authorization. |
| `ephemeral` | Expires or is never promoted. |

Hard rule: permission filtering happens before semantic ranking.

### 6. Conflict Registry

Contradictions are first-class records, not overwritten summaries.

Recommended conflict record:

```json
{
  "conflictId": "conf_001",
  "topic": "...",
  "scope": { "kind": "project", "projectId": "example" },
  "claims": [
    { "memoryId": "mem_a", "value": "A", "authority": 0.7, "freshness": "current" },
    { "memoryId": "mem_b", "value": "B", "authority": 0.9, "freshness": "current" }
  ],
  "status": "unresolved | resolved | superseded | requires_human",
  "decisionPolicy": "surface_conflict | prefer_latest_authoritative | ask_human | abstain"
}
```

Rules:

- unresolved current-source conflicts preserve candidate claims;
- summaries must not hide conflicts;
- later restrictive events override older optimistic receipts;
- tombstones/rejections remain non-actionable through summaries.

### 7. Retrieval Router

Retrieval order:

1. Permission and visibility.
2. Source/evidence availability.
3. Freshness and temporal precedence.
4. Scope and promotion boundary.
5. Conflict/tombstone/rejection state.
6. Decision impact and risk.
7. Semantic relevance.

Outputs:

- `allow_local_shadow_packet`;
- `conflict_boundary_packet`;
- `fetch_more`;
- `ask_human`;
- `abstain`;
- `deny`.

### 8. Action Context Packet

A handoff packet for the acting agent. It must include:

- allowed action boundary;
- source references;
- freshness;
- conflicts/gaps;
- forbidden effects;
- promotion boundary;
- receiver instructions for fail-closed behavior.

It is not a permission token; the receiver still classifies the proposed action.

## Safety invariants

1. Memory claims are proposals/evidence, not authority by themselves.
2. Permission filtering precedes semantic ranking.
3. Local/shadow continuity does not imply durable/global memory promotion.
4. Relevance does not authorize action.
5. Sender labels do not authorize action.
6. Later restrictive events override older optimistic receipts.
7. Sensitive effects ask human.
8. Missing or ambiguous authority fetches/abstains.
9. Summaries must carry receipts or trigger source fetch.

## Allowed local use now

- local paper specs;
- local fixtures;
- local Node simulations;
- local package/index/docs;
- local shadow implementation planning after specs/repro manifest.

## Not authorized

- runtime parser/enforcement;
- config changes;
- automatic durable memory writes or promotions;
- external sends/publication;
- approval bypass;
- using receipts as real permission tokens;
- canary/enforcement/production/L2+ use.

## Open questions before implementation

1. Conflict-merge semantics for contradictory receipts.
2. Source spoofing and nested handoff validation.
3. Human-required effect split: prepare vs send.
4. Ordinary workload overhead and ceremony fatigue.
5. Scaling over large messy memory stores.
6. UX of Action Context Packets.
