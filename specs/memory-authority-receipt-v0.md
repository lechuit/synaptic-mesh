# Memory Authority Receipt v0

Status: executable receipt contract for the `0.1.0` release line.

## Purpose

A Memory Authority Receipt is a compact evidence contract attached to
memory-derived context. It preserves the source, freshness, status, lineage,
and effect boundary that survived transformation. Scope is represented by the
compressed receipt and action context packet surfaces, not by every
human-readable receipt field.

It is not a permission token. A receiver must always classify the proposed
action independently before acting.

## Problem addressed

Summaries can launder authority. A source may be stale, local-only, denied,
human-required, or non-promotable, while a later summary preserves only the
useful prose. Receipts keep the boundary attached to the claim.

## Implemented receipt classes

| Class | TypeScript schema | Use |
|---|---|---|
| Human-readable receipt | `HumanReadableReceiptSchema` | Verbose audit and handoff form. |
| Compressed temporal receipt | `CompressedReceiptSchema` | Compact cross-source tuple. |
| Coverage receipt | `CoverageReceiptSchema` | Retrieved vs required coverage. |
| Action context packet | `ActionContextPacketSchema` | Receiver-side action context. |

The zod schemas in `@aletheia/core` are the executable source of truth for the
library. This document explains the semantics those schemas preserve.

## Human-readable receipt fields

Required fields:

- `sourceArtifactId`;
- `sourceArtifactPath`;
- `producedAt`;
- `receiverFreshness`;
- `targetStatus`;
- `readinessBoundary`;
- `effectBoundary`;
- `promotionBoundary`;
- `lineageCompleteness`;
- `riskTier`;
- `nextAllowedAction`;
- `validation`;
- `safetyResult`.

`nextAllowedAction` must be exact. Generic instructions such as "continue" are
not authority.

## Compressed temporal receipt fields

Authority-critical tuple keys:

```text
SRC, SRCPATH, SRCDIGEST, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT
```

Optional audit/readability keys:

```text
CTRID, RB, CHAIN, CONF, PROSE
```

The optional fields never authorize by themselves. In particular, `CONF`,
`CHAIN`, and `PROSE` are audit context only.

## Authority-critical semantics

| Field family | Required meaning |
|---|---|
| Source identity | Which source artifact, event, or lane produced the claim. |
| Source path/lane | Source must be fetchable or registry-bound, not prose-only. |
| Produced/freshness | Currentness must be explicit; stale or unknown fails closed. |
| Status/readiness | Candidate or research-ready is not action authority. |
| Scope/effect boundary | Local/shadow permission does not authorize nonlocal effects. |
| Promotion boundary | Local continuity does not authorize durable/global promotion. |
| Lineage completeness | Partial/unknown lineage cannot promote or authorize sensitive action. |
| Risk tier | Helps routing; does not override hard boundaries. |
| Proposed action | Must be classified by the receiver. |

## Receiver algorithm

1. Parse the receipt or packet.
2. Verify required authority fields are present and non-ambiguous.
3. Verify source identity and source path/lane when available.
4. Require current freshness.
5. Check status/readiness boundary.
6. Check effect and promotion boundaries.
7. Check lineage completeness.
8. Interpret `NO` as a prohibition lane, not a grant.
9. Independently classify the proposed action.
10. Decide:
    - `allow_local_shadow` only for complete, current, local, non-sensitive
      action boundaries;
    - `fetch_abstain` for missing, stale, invisible, incomplete, or ambiguous
      evidence;
    - `ask_human` for sensitive, external, runtime, config, publication,
      durable-promotion, delete, production, or unknown actions.

## Fail-closed requirements

A receiver must fail closed when:

- source artifact is missing, unknown, invisible, or prose-only;
- source path/lane does not match expectations;
- freshness is stale or unknown;
- a later restrictive event exists or cannot be ruled out;
- boundary is partial, local-only but action is nonlocal, or promotion is
  human-required;
- receipt fields are truncated, duplicated, or missing;
- action is sensitive or unknown;
- sender labels claim safety without receiver-side classification.

## Non-authority fields

The following can help auditability but never authorize by themselves:

- confidence;
- consensus;
- checksum;
- optimistic prose;
- sender-safe labels;
- chain labels;
- summary quality;
- model self-assessment.

## Relationship to `AletheiaAuthority`

`AletheiaAuthority.propose()` creates memory only after source, visibility,
scope, safety, and conflict checks. `AletheiaAuthority.recall()` returns memory
only after visibility, scope, status, freshness, and conflict checks.
`AletheiaAuthority.tryAct()` re-checks cited memory and action class.

Receipts and packets carry evidence between those steps. They never bypass the
steps.

## Boundary

This spec describes receipt semantics in the library. It does not authorize
provider account access, host config changes, external sends, deletion,
production deployment, or runtime enforcement outside the structured decisions
returned by Aletheia APIs.

## Open questions

1. How should conflicting receipts merge without hiding unresolved conflict?
2. How compact can a receipt be before ordinary work over-abstains?
3. How should source spoofing be detected across nested handoffs?
4. How should prepare-vs-send human-required effects be represented?
5. Which receipt fields should become stable wire format before `1.0.0`?
