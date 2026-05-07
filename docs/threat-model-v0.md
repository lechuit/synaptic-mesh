# Synaptic Mesh threat model v0

## Status

Draft threat-model scaffold for local shadow research. This is not runtime enforcement, not a security certification, not config, not production readiness, and not authorization for tools or external effects.

## Purpose

The authority-claim model should not be designed only from happy paths. Before a PR26 classifier chooses degradation routes, it needs explicit adversarial and failure-mode pressure from sender bugs, stale receivers, lossy compression, tampering, boundary smuggling, and policy drift.

## Actors

| Actor | Description | Primary risk |
|---|---|---|
| `BenignSenderBug` | Sender accidentally emits incomplete, malformed, or contradictory authority metadata. | Unsafe trust from accidental omission or wrong labels. |
| `OverconfidentAgent` | Agent infers authority from prior context, summary, or confidence instead of evidence. | Human-required effects become “safe” by assertion. |
| `StaleReceiver` | Receiver uses stale policy, grammar, source digest, or memory. | Validity windows and current boundaries are misread. |
| `NaiveCompressor` | Compression drops fields that distinguish safe shadow work from sensitive effects. | Compact handoff erases boundary/freshness constraints. |
| `MaliciousExternalDocument` | External content includes instructions or labels claiming authority. | Prompt/document text is laundered into policy or permission. |
| `ReceiptTamperer` | Actor modifies receipt fields, duplicates keys, or changes action/boundary values. | Source lineage no longer matches claimed authority. |
| `BoundarySmuggler` | Actor hides sensitive scope in prose, ambiguous verbs, encoded strings, or next-action fields. | External/config/memory promotion crosses local-shadow boundary. |
| `PolicyHotSwap` | Policy changes after a receipt was produced or between sender/receiver runs. | Receiver applies obsolete approval or review rules. |
| `NestedHandoffConfuser` | Nested or quoted handoffs blur who asserted what and which receipt is authoritative. | Sender labels or quoted authority are mistaken for receiver-verified authority. |

## Capabilities

| Capability | Description | Expected degradation pressure |
|---|---|---|
| `canAddFreeText` | Add persuasive prose, labels, or notes around a receipt. | Do not treat prose labels as authority. |
| `canOmitReceipt` | Provide no receipt or omit authority-critical fields. | `request_full_receipt`, `fetch_source`, or `abstain`; not generic `ask_human`. |
| `canReplayOldReceipt` | Reuse a once-valid receipt after policy/source/freshness changed. | Freshness/source checks; `fetch_source` or `request_policy_refresh`. |
| `canChangeNextAllowedAction` | Alter `ACT`/next allowed action while leaving other fields safe-looking. | Detect sensitive action smuggling; block/ask human as appropriate. |
| `canInjectAmbiguousVerb` | Use verbs like sync/apply/promote that hide external effects. | Route through ambiguity policy; do not allow by confidence. |
| `canModifyFoldedIndex` | Change compressed/folded indexes that refer to omitted full fields. | Request grammar/full receipt/source before trusting compact references. |
| `canClaimAuthorityWithoutEvidence` | Assert permission, memory, or policy without source binding. | Abstain or ask human depending on boundary. |
| `canHideSensitivePromotion` | Bury durable memory, shared memory, runtime, config, or publication effects in local-looking payloads. | Boundary taxonomy must override sender label. |

## Initial threat-to-test mapping

| Threat pressure | Existing or PR25 coverage | Needed next |
|---|---|---|
| Duplicate/tampered fields | `authority-laundering-regression` covers duplicate `SCOPE`/`NO` and sensitive `ACT`. | Expand to folded indexes and nested receipts. |
| Free-text authority labels | `authority-laundering-regression` includes safe-looking prose metadata. | Add malicious external document fixtures. |
| Missing compact boundary fields | `authority-claim-routes-fixtures` sentinel routes to `request_full_receipt`. | Classifier should implement route choice. |
| Config/runtime inferred authority | `authority-claim-routes-fixtures` sentinels route to `ask_human`. | Classifier should enforce boundary taxonomy. |
| Boundary differences | `authority-claim-routes-fixtures` includes 8-boundary taxonomy and coverage. | ADR/table or classifier input in PR26/PR27. |
| Stale source/policy/grammar | Route fixtures cover `fetch_source`, `request_policy_refresh`, `request_grammar_refresh`. | Add classifier tests for each stale mode. |
| Nested handoff confusion | Prior fixture manifest lists nested handoff source-spoofing priority fixture. | Formal nested handoff adversarial tests. |

## Known uncovered risks

- No implemented authority-route classifier yet; PR25 only records fixtures, evidence, and docs.
- No formal malicious external document fixture yet.
- No folded-index tamper regression yet.
- No complete policy hot-swap regression across receipt production/receiver time yet.
- No full nested handoff authority-resolution suite yet.

## PR26/PR27 requirement

Before or alongside a classifier, map each actor/capability pair to at least one fixture or explicit non-goal. The classifier should be designed against this threat model, not only against valid receipts.
