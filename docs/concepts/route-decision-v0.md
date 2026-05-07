# RouteDecision schema v0

`schemas/route-decision.schema.json` is the first formal schema in this repository. It covers the normalized RouteDecision evidence record extracted from the local shadow AuthorityEnvelope/authority-route fixtures.

The schema answers the receiver-review question: **what route did the receiver choose, and what stable evidence explains why?**

## Covered fields

The schema requires:

- `selectedRoute` — one stable route from the authority degradation vocabulary.
- `humanRequired` — explicit boolean escalation signal from the fixture context.
- `reasonCodes` — stable machine-testable reasons, not prose.
- `rejectedRoutes` — rejected alternatives mapped to stable reason code(s).
- `decisiveSignals` — stable signals that influenced the route choice.
- `actionIntent` and `actionEffect` — intent/effect separation from the AuthorityEnvelope context.
- `authorityLevel` and `boundaryCoverage` — boundary/effect metadata used by the receiver evidence record.

`verificationFailureMode` is optional until dedicated failure-mode fixtures require it.

## Boundary

This is schema and fixture validation only. It does **not** add a runtime classifier, runtime enforcement, authorization, framework integration, memory promotion, or production safety claim.

Passing `npm run test:route-decision-schema` means the current fixture RouteDecision records have stable shape, route vocabulary, stable reason codes, rejected-route evidence, and coverage across known route/boundary examples. It does not prove that a future classifier chose the semantically correct route.

`npm run test:route-decision-wrong-routes` adds oracle-fixture pressure for adversarial cases where tempting routes must be rejected. The fixture suite covers malicious external prose, folded-index hidden promotion, policy hot-swap/stale windows, nested authority, memory-claim-to-permission-claim laundering, free-text `nextAllowedAction` tampering, stale replayed receipts, and ambiguous verbs inside prose. It validates expected route semantics for those hand-authored cases only; it still does not parse arbitrary input, implement a classifier, or authorize runtime behavior.

## Evidence

The local validators write:

- `implementation/synaptic-mesh-shadow-v0/evidence/route-decision-schema.out.json` with fixture count, valid count, reason-code/rejected-route validation totals, coverage areas, known uncovered risks, and the local-shadow safety claim scope.
- `implementation/synaptic-mesh-shadow-v0/evidence/route-decision-wrong-routes.out.json` with wrong-route fixture count, coverage areas, tempting rejected-route counts, known uncovered risks, and explicit `classifierImplemented: false` / `runtimeEnforcementImplemented: false` boundaries.
