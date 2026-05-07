# Authority degradation routes (fixture vocabulary)

PR25 keeps this as fixture metadata only. It does not implement a classifier, runtime enforcement, config behavior, tool authorization, or framework integration.

The purpose is to prevent `requires_human` / `ask_human` from becoming a generic uncertainty dump. Authority failures should degrade through the narrowest safe route:

| Route | Human required by default | Intended use |
|---|---:|---|
| `block` | false | Deterministically reject an explicitly prohibited local action. |
| `ask_human` | true | Escalate for consent, sensitive effects, config/runtime changes, or policy-required review. |
| `fetch_source` | false | Re-check cited source artifacts, digests, logs, or mtimes. |
| `request_full_receipt` | false | Ask for an uncompressed receipt when compact metadata omits authority-critical fields. |
| `request_policy_refresh` | false | Refresh project/policy context when stale or missing. |
| `request_grammar_refresh` | false | Refresh receipt/handoff grammar when parsing semantics are stale or unknown. |
| `shadow_only` | false | Continue only as local shadow research; do not promote, publish, integrate, or authorize tools. |
| `abstain` | false | Make no authority decision when evidence is insufficient and no safe mechanical route is available. |

Fixture examples live in `implementation/synaptic-mesh-shadow-v0/fixtures/authority-claim-routes.json` and are verified by `tests/authority-claim-routes-fixtures.mjs`.

Two sentinel examples are intentionally captured for PR26 classifier work:

- Compact receipt missing boundary fields -> `selectedRoute: request_full_receipt`, `humanRequired: false`, `reason: compact_receipt_missing_boundary_fields`.
- Config change requested by agent inference -> `selectedRoute: ask_human`, `humanRequired: true`, `reason: config_change_requested_by_agent_inference`.


## Boundary taxonomy for fixture metadata

Receiver decisions should not treat every boundary as equal. Compactability and human requirement differ by boundary:

| Boundary | Risk | Can compact? | Requires human by default? |
|---|---|---|---:|
| `read_only` | low | yes | no |
| `local_shadow` | low/medium | yes, with receipt | no |
| `memory_candidate` | medium | exact/full preferred | not necessarily |
| `shared_memory` | high | no compact route by default | possibly |
| `permanent_memory` | high | no | yes |
| `config_change` | high | no | yes |
| `runtime_tool` | high | no | yes |
| `external_publication` | high | no | yes |

PR25 records this in fixture metadata as `boundaryTaxonomy`; PR26/PR27 should turn it into either classifier input or a dedicated boundary-taxonomy ADR. The important constraint is precision: a compact local-shadow receipt is not authority for permanent memory, config changes, runtime tools, or external publication.

## PR26 note

A future shadow classifier should make this route vocabulary central. Not every authority error requires a human; some require more source, policy, grammar, or a full receipt. `ask_human` should remain reserved for authority that truly depends on human consent or human review.
