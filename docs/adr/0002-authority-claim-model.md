# ADR 0002: Authority claim model

## Status

Accepted for local shadow research.

## Context

The current shadow receiver action policy is necessary, but it is not sufficient for safe handoff reasoning. Classifying verbs as `sensitive`, `ambiguous`, `local`, or `fallback` helps keep action behavior auditable, but handoff ambiguity often depends on the payload and the authority being asserted, not on the verb alone.

Examples that look similar at the action-policy layer can carry very different claims:

- a memory update can be a local note, a request to promote durable memory, or an unverified assertion about the user;
- an evidence reference can point to a reproducible local artifact, a stale summary, or a sender-provided label;
- a permission statement can report prior human approval, ask for approval, or attempt to authorize a future tool call.

The project has already identified the risk that work could get stuck in action policy and fail to reach the authority model. This ADR introduces the authority-claim seam while preserving the current local shadow boundary.

## Decision

Introduce an `AuthorityClaimType` taxonomy for local shadow research. The initial claim types are:

- `memoryClaim` — assertions about remembered preferences, facts, todos, or promotion candidates.
- `evidenceClaim` — assertions about supporting artifacts, test outputs, citations, diffs, logs, or reproducibility records.
- `permissionClaim` — assertions about user approval, standing authorization, review requirements, or missing consent.
- `actionClaim` — assertions about what action is requested, attempted, completed, blocked, or prohibited.
- `policyClaim` — assertions about applicable policy, project rules, release rules, or workflow gates.
- `boundaryClaim` — assertions about runtime boundary, publication boundary, privacy boundary, or local-only scope.
- `lineageClaim` — assertions about origin, chain of custody, upstream source, transformation history, or reviewer provenance.
- `freshnessClaim` — assertions about time, staleness, validity windows, clock source, or revalidation requirements.

Each authority claim should answer these questions before it can influence receiver behavior:

1. Who asserts it?
2. With what source?
3. With what scope?
4. With what freshness or validity window?
5. What does it permit?
6. What does it forbid?
7. What happens if it cannot be verified?

Claims can be represented by fixtures and shadow classifiers before any runtime implementation exists. The action policy remains one input into the model, not the full model.

## Receiver rule

Sender labels are not authority. A sender may label a claim as evidence, permission, memory, or policy, but the receiver must independently verify the claim, abstain, or ask a human when verification is missing or ambiguous.

The receiver must not treat a sender-provided authority label as sufficient to:

- promote memory;
- authorize tools or external effects;
- override project policy;
- expand runtime scope;
- bypass review gates;
- launder stale or unverifiable evidence into a trusted state.

## Boundary

This ADR is local shadow-only. It does not add runtime integration, enforcement authority, tool authorization, framework SDK behavior, production readiness, memory promotion authority, or config changes.

The authority-claim model is a research and review construct until future PRs add independently reviewed fixtures, shadow classifiers, and evidence. Any later runtime or enforcement work requires a separate ADR and explicit review.

## Consequences

- Future work can reason about handoff authority directly instead of relying only on action verbs.
- Tests can model sender/receiver disagreements, unverifiable claims, stale evidence, and required human escalation.
- Action-policy contracts remain useful, but they become one input to authority analysis rather than the final decision surface.
- The next safe step is to add fixtures and a local shadow classifier for authority claims.
- The model makes abstention explicit: unverified authority should produce abstain/escalate behavior, not silent fallback trust.
- Documentation and evidence must continue to state the local-only boundary so authority language does not imply runtime enforcement.
