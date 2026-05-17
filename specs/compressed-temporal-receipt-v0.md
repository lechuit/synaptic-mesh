# Compressed Temporal Receipt v0

Status: executable compressed-receipt contract for the `0.1.0` release line.

## Purpose

A Compressed Temporal Receipt is a compact cross-source handoff tuple for memory-derived summaries. It preserves enough source, freshness, boundary, prohibition, temporal, completeness, and action information for a receiver to avoid laundering stale, denied, sensitive, or local-only claims into action authority.

## Current Authority-Critical Tuple

Authority-critical fields retained:

```text
SRC, SRCPATH, SRCDIGEST, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT
```

Optional audit/readability fields:

```text
CTRID, RB, CHAIN, CONF, PROSE
```

The historical fixture line reduced field count from 16 to 11 in local tests.
Those fixture artifacts are no longer part of the active tree, so the active
release guarantee is the executable tuple contract preserved here and in
`CompressedReceiptSchema`.

## Field definitions

| Field | Required | Meaning | Fail-closed behavior |
|---|---:|---|---|
| `SRC` | yes | Source artifact identity/lane | Unknown source → `fetch_abstain` |
| `SRCPATH` | yes | Source path or source lane binding | Wrong/prose-only path → `fetch_abstain` |
| `SRCDIGEST` | yes | Digest/lane binding for source artifact | Missing/wrong digest → `fetch_abstain` |
| `PROD` | yes | Produced-at timestamp | Missing/invalid/ambiguous → `fetch_abstain` |
| `FRESH` | yes | Receiver freshness (`current`, `stale`, `unknown`) | Non-current → `fetch_abstain` |
| `SCOPE` | yes | Usable scope of packet | Nonlocal/unknown → `fetch_abstain` or `ask_human` |
| `PB` | yes | Promotion/use boundary | Expansive/unknown → `fetch_abstain` |
| `NO` | yes | Explicit forbidden effects | Missing prohibitions → `fetch_abstain` |
| `LRE` | yes | Later restrictive event status | Anything except `none` → `fetch_abstain` or `ask_human` |
| `TOK` | yes | Tuple complete / not truncated | Not true → `fetch_abstain` |
| `ACT` | yes | Proposed action for receiver classification | Sensitive/unknown → `ask_human` |

## Optional fields

| Field | Role | Authority status |
|---|---|---|
| `CTRID` | Receipt identifier | audit/readability only |
| `RB` | Receiver behavior hint | useful, not permission |
| `CHAIN` | Lineage label | useful, not permission |
| `CONF` | Confidence | never authority by itself |
| `PROSE` | Human-readable summary | never authority by itself |

## Receiver validation order

1. Parse exact tuple.
2. Verify all authority-critical fields exist.
3. Verify `SRC` against known source lanes.
4. Verify `SRCPATH` and `SRCDIGEST` against source lane.
5. Require `FRESH=current` and valid `PROD`.
6. Require `LRE=none`.
7. Require `TOK=true`.
8. Interpret `NO` as a prohibition lane and require explicit forbidden effects.
9. Reject expansive tuple hints before action classification.
10. Normalize only narrow syntactic local-shadow L0/L1 boundary variants.
11. Independently classify `ACT`.
12. Decide `allow_local_shadow`, `fetch_abstain`, or `ask_human`.

## Boundary normalization

Allowed normalization is intentionally narrow and asymmetric.

May normalize harmless variants of local shadow L0/L1, such as:

- casing drift;
- spaces/slashes/hyphens;
- `Level 0 / Level 1 local shadow`;
- `only L0 + L1`.

Must fail closed for semantic expansions, including:

- `L2+`, `L2plus`;
- operational/runtime/production;
- enforcement/canary;
- `approved by sender` / sender-approved;
- any mixed string such as `L0_L1_only_but_L2plus_approved`.

## Action classification

`ACT` must be classified by the receiver, not accepted from sender labels.

Allowed without human approval only when all are true:

- source binding valid;
- current freshness;
- local L0/L1 boundary;
- no later restrictive event;
- tuple complete;
- explicit forbidden effects present;
- action is local/shadow documentation, fixture, diagnostic, or report;
- action is not external/runtime/config/publication/durable-memory/delete/canary/enforcement/production/L2+.

Sensitive or unknown actions require `ask_human` even if every receipt field is otherwise valid.

## `NO` prohibition lane

`NO` lists forbidden effects. It is not a permission field.

Correct interpretation:

- `no runtime` means runtime is forbidden;
- `no L2+` means L2+ is forbidden;
- `no external` means external send/publication is forbidden.

The receiver must not treat the presence of words like “runtime” or “L2+” inside `NO` as operational grants.

## Historical Test Summary

The local fixture line that produced this tuple covered role separation,
boundary normalization, cross-source binding, and minimal-field compression with
zero unsafe allows in the tested cases. The active TypeScript repo now keeps the
contract in specs and zod/runtime tests instead of carrying the old generated
fixture artifacts.

## Known failures repaired

1. **Boundary substring bug:** text containing L0/L1 was allowed even when it smuggled `L2plus operational approved by sender`. Repair: exact local boundary checks before local allow.
2. **Overstrict normalization:** benign local variants were rejected. Repair: narrow allowlist of syntactic local-shadow variants.
3. **Cross-source laundering:** known-looking source labels/prose could mislead receiver. Repair: source label + path + digest + freshness must bind before normalization.
4. **NO lane bug:** forbidden words inside `NO` were mistaken for grants. Repair: treat `NO` as prohibition lane.

## Boundary

This spec describes receipt semantics. It does not authorize production/canary
use, provider account access, host config changes, external sends, deletion, or
automatic enforcement beyond the explicit decisions returned by Aletheia APIs.

## Open questions

1. Can the 11-field tuple be reduced further without over-abstaining ordinary work?
2. How should conflicting compressed temporal receipts merge?
3. How should source alias collisions and nested handoffs be handled?
4. How should prepare-vs-send human-required effects be represented compactly?
5. What is the right byte/field budget for real handoffs?
