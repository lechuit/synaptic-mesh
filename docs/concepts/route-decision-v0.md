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

## Evidence

The local validator writes `implementation/synaptic-mesh-shadow-v0/evidence/route-decision-schema.out.json` with fixture count, valid count, reason-code/rejected-route validation totals, coverage areas, known uncovered risks, and the local-shadow safety claim scope.
