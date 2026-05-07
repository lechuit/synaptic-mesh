# AuthorityEnvelope PR26 concept fixture

PR26 defines a local shadow-only `AuthorityEnvelope` concept for authority-claim examples. It is documentation and fixture evidence only: no classifier, no runtime enforcement, no tool authorization, no config behavior, no framework integration, no permanent memory promotion, and no external effects.

## Core rule

Knowing something does not imply permission to act on it. The receiver must keep epistemic confidence, evidence quality, action authority, boundary coverage, intended action, and actual effect as separate decision inputs.

A claim can be high-confidence but low-authority for action:

- `Project probably uses Angular` may have `claimConfidence: high` and `evidenceStrength: high`.
- `You may modify angular.json` still has low or missing authority unless boundary evidence grants filesystem/config authority.

## Envelope fields

Recommended fixture fields:

| Field | Values | Purpose |
|---|---|---|
| `claimConfidence` | `high`, `medium`, `low`, `unknown` | How likely the factual claim is true. Not permission. |
| `evidenceStrength` | `high`, `medium`, `low`, `none` | Strength of supporting evidence. Not permission. |
| `authorityLevel` | `read_only`, `local_shadow`, `memory_candidate`, `shared_memory`, `permanent_memory`, `config_change`, `runtime_tool`, `external_publication` | Maximum authority being asserted or required, aligned with boundary taxonomy. |
| `boundaryCoverage` | `complete`, `partial`, `missing`, `stale`, `conflicting` | Whether current boundary evidence covers the requested effect. |
| `actionIntent` | stable snake_case intent | What the sender says it wants to do. |
| `actionEffect` | `text_only`, `filesystem_write`, `runtime_execution`, `config_change`, `external_publication`, `permanent_memory_write` | What would actually change if allowed. Receiver gates on effect/boundary, not verb alone. |
| `routeDecision` | object | Mandatory decision evidence: selected route, rejected alternatives, decisive signals, and stable reason codes. |

Do not collapse these into `confidenceScore` or `permissionLevel`. Confidence and permission answer different questions.

## Intent vs effect

Verbs are insufficient. `generate migration` could mean either:

- `actionIntent: generate_migration_plan`, `actionEffect: text_only` — safe local prose, assuming no publication or durable promotion.
- `actionIntent: generate_migration`, `actionEffect: filesystem_write` — mutates files and requires filesystem boundary coverage.

Receiver policy should decide by `actionEffect` plus boundary evidence. The intent label can help explain the request, but it is not enough to authorize the effect.

## Route decision evidence

`routeDecision` is mandatory in PR26 fixtures. Tests should validate stable fields rather than prose wording.

Example shape:

```json
{
  "selectedRoute": "request_full_receipt",
  "rejectedRoutes": {
    "shadow_only": ["MISSING_BOUNDARY_FIELDS"],
    "ask_human": ["NO_SENSITIVE_PROMOTION"],
    "fetch_source": ["UNKNOWN_GRAMMAR_DIGEST"]
  },
  "decisiveSignals": [
    "COMPACT_RECEIPT_PRESENT",
    "UNKNOWN_GRAMMAR_DIGEST",
    "NO_RUNTIME_BOUNDARY"
  ],
  "reasonCodes": [
    "MISSING_BOUNDARY_FIELDS",
    "UNKNOWN_GRAMMAR_DIGEST",
    "REQUEST_FULL_RECEIPT_BEFORE_HUMAN_ESCALATION"
  ],
  "humanReason": "Compact receipt lacks authority-critical boundary fields, so request full receipt before escalating to a human."
}
```

Free text may accompany route decisions for humans, but tests should key on stable `reasonCodes`, `decisiveSignals`, `selectedRoute`, and `rejectedRoutes`.

The first formal schema is `schemas/route-decision.schema.json`, documented in `docs/concepts/route-decision-v0.md`. It validates the normalized RouteDecision evidence record extracted from these fixtures, including `humanRequired`, intent/effect separation, and boundary coverage metadata. This remains shape validation only; it does not prove semantic route correctness or add runtime enforcement.

## Non-goals and guardrails

Do **not** treat this concept object as permission to start integrations. PR26 explicitly does not do, promise, or prepare hidden runtime hooks for:

- runtime integration
- real MCP/A2A integration
- permanent memory writes
- external publication beyond normal repository/release documentation
- a public package marketed as safe
- protocol-standard promises
- many adapters before schemas
- semantic CRDT work
- a large dashboard

The current phase should strengthen tests, schemas after concepts, specs, threat model coverage, and multi-hop fixtures. AuthorityEnvelope is a local shadow evaluation object, not runtime authorization, production safety, or a protocol standard.

Guiding phrase: **Do not add memory yet; prove the receiver knows how to distrust.** AuthorityEnvelope should prepare route-decision evidence and distrust-first receiver evaluation, not trigger runtime or memory integration.

Suggested post-PR26 priority order:

1. CI real / baseline GitHub Actions gates
2. Release checklist plus `npm run release:check`
3. `RouteDecision` schema/evidence as the first schema, not all schemas at once
4. Boundary taxonomy
5. Threat model
6. Multi-hop fixtures
7. Authority claim model/spec consolidation
8. Public minimal spec only once vocabulary is stable

## Future benchmark

PR26 only adds concept fixtures, but the AuthorityEnvelope should be evaluated against naive alternatives in a repeatable benchmark rather than left as a research-note intuition. A later benchmark PR should compare:

- naive summary
- full context
- simple receipt
- AuthorityEnvelope

Candidate metrics:

- `wrongRouteRate`
- `falseCompactRate`
- `falseHumanEscalationRate`
- `tokenCost`
- `clarityScore`
- `receiverDecisionAccuracy`
- `boundaryLossRate`

This carries forward prior scorecard ideas: utility, safety misses, wrong-route rate, clarity, friction, and byte savings. It is likely a v0.1.7/separate benchmark PR, not part of the PR26 classifier-free concept guard.

## Boundary

This is a PR26/v0.1.4 concept guard. A future PR27/v0.1.5 classifier may consume these fields, but this PR deliberately avoids implementing runtime classification.
