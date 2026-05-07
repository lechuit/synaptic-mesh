# Memory Authority Receipt v0

Status: public spec draft v0 / not runtime-ready  
Generated: 2026-05-06T16:42Z

## Purpose

A Memory Authority Receipt is a compact evidence/authority contract attached to memory-derived context. It tells a receiving agent what source, status, boundary, lineage, and action constraints survived transformation.

It is **not** a permission token and **not** runtime enforcement. It is a local protocol object that receivers must check before treating memory-derived content as permission, readiness, or durable truth.

## Problem addressed

Agent summaries can launder authority. A source may say “local-only”, “stale”, “denied”, “human required”, or “do not promote”, but a later summary may preserve the useful text and drop the boundary. The receipt preserves the boundary.

## Receipt classes

| Class | Use |
|---|---|
| Human-readable receipt | Explicit markdown/YAML block for audits and handoffs. |
| Compact temporal receipt | Short tuple for cross-source compressed handoff. |
| Coverage receipt | Shows which high-boundary/must-surface claims were retrieved or missing. |
| Handoff receipt | Root/local handoff authority boundary between cycles or agents. |

## Canonical human-readable fields v0

```yaml
sourceArtifactId: <source evidence identity>
sourceArtifactPath: <path or lane to source evidence>
producedAt: <ISO timestamp>
receiverFreshness: <current|stale|unknown>
targetStatus: <candidate|partial|experiment_ready|pass_closed|blocked|requires_human>
readinessBoundary: <paper_only|fixture_only|research_ready_not_implementation_ready|implementation_ready>
effectBoundary: <local_only|no_runtime_effect|external_send_requires_human|config_change_forbidden>
promotionBoundary: <no_memory_write|no_durable_promotion|human_confirmation_required>
lineageCompleteness: <complete|partial|unknown>
riskTier: <low_local|medium_local|sensitive>
nextAllowedAction:
  action: <specific verb>
  target: <exact next target>
  successorOf: <source target>
  redoAllowed: <true|false>
validation: <how the claim was checked>
safetyResult: <local/shadow/no external effects status>
```

## Authority-critical semantics

| Field family | Required meaning |
|---|---|
| Source identity | Which source artifact/lane produced the claim. |
| Source path/lane | The source must be fetchable or registry-bound, not prose-only. |
| Produced/freshness | Currentness must be explicit; stale/unknown fails closed. |
| Status/readiness | A candidate or research-ready claim is not implementation-ready. |
| Scope/effect boundary | Local/shadow permission does not authorize external/runtime/config/publication effects. |
| Promotion boundary | Local continuity does not authorize durable/global memory promotion. |
| Lineage completeness | Partial/unknown lineage cannot promote or authorize sensitive action. |
| Risk tier | Helps route, but does not override effect/promotion boundaries. |
| Next allowed action | Must be exact; generic “continue” is not authority. |

## Non-authority fields

The following can help auditability, but never authorize by themselves:

- confidence;
- consensus;
- checksum;
- optimistic prose;
- sender-safe labels;
- chain labels;
- summary quality;
- model self-assessment.

## Receiver algorithm v0

1. Parse the receipt.
2. Verify required fields are present.
3. Verify source identity/path/lane when available.
4. Check freshness/currentness.
5. Check status/readiness.
6. Check effect and promotion boundaries.
7. Check lineage completeness.
8. Classify proposed action independently.
9. Decide:
   - `allow_local_shadow` only for complete, current, local L0/L1, non-sensitive actions;
   - `fetch_abstain` for missing/stale/unknown/incomplete evidence;
   - `ask_human` for sensitive, external, runtime, config, publication, durable-memory, delete, canary/enforcement, production, L2+, or unknown actions.

## Fail-closed requirements

A receiver must fail closed when:

- source artifact is missing, unknown, or prose-only;
- source path/lane does not match registry expectations;
- freshness is stale or unknown;
- later restrictive event exists or is ambiguous;
- boundary is partial, local-only but action is nonlocal, or promotion is human-required;
- receipt fields are truncated or missing;
- action is sensitive or unknown;
- sender labels claim safety without receiver-side classification.

## Local-only approval boundary

This spec permits only local research interpretation. It does not authorize implementation, enforcement, runtime hooks, config changes, durable memory writes, external sends, publication, deletion, or paused-project work.

## Known repairs incorporated

- Sender labels are not authority; receiver classifies action independently.
- Exact boundary checks are required before local allow.
- Forbidden words inside `NO` are prohibitions, not grants.
- Missing blockers in retrieval are absence-of-retrieval, not permission.

## Open questions

1. How small can a receipt be before ordinary work over-abstains?
2. How should conflicting receipts merge?
3. How should prepare-vs-send external effects be represented?
4. How should source spoofing be detected across nested handoffs?
5. What usability threshold avoids ceremony fatigue?
