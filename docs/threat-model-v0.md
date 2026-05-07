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

## Threat-to-route mapping artifact

`implementation/synaptic-mesh-shadow-v0/fixtures/threat-model-routes.json` maps each threat-model actor and each listed capability to at least one expected route-decision fixture or explicit known gap. `npm run test:threat-model-routes` validates that mapping and writes `implementation/synaptic-mesh-shadow-v0/evidence/threat-model-routes.out.json`.

This is a threat-to-fixture/evidence map only. It validates route vocabulary, stable reason codes, expected rejected routes, boundary coverage, and the absence of runtime/enforcement claims. It is not semantic proof, not an implemented classifier, not authorization, and not runtime protection.

| Threat pressure | Current mapping evidence | Remaining gap |
|---|---|---|
| Duplicate/tampered fields | `TM-R06` maps tampered `ACT` / next-action runtime execution to `block`. | No runtime tamper detector. |
| Free-text authority labels | `TM-R05` maps external prose authority labels to `abstain`; `TM-G01` keeps malicious-document semantic parsing explicit as a gap. | No malicious external document parser/classifier. |
| Missing compact boundary fields | `TM-R01` maps omitted PB/NO boundary fields to `request_full_receipt`. | No classifier implementation. |
| Config/runtime inferred authority | `TM-R02`, `TM-R06`, `TM-R08` map config/runtime/publication pressure to `ask_human`/`block` expectations. | No runtime enforcement. |
| Boundary differences | Mapping spans read-only, local shadow, shared memory, permanent memory, config, runtime, and publication boundaries. | No semantic boundary classifier. |
| Stale source/policy/grammar | `TM-R03`, `TM-R09`, and `TM-R11` map stale policy/source replay pressure to refresh/fetch routes. | No live policy hot-swap regression. |
| Folded index compression loss | `TM-R04` maps folded-index tamper risk to `request_full_receipt`; `TM-G02` records folded-index/hidden-promotion interaction as a gap. | No folded-index tamper detector. |
| Nested handoff confusion | `TM-R10` maps ambiguous nested/quoted authority to `fetch_source`. | No full nested authority-resolution suite. |

## Known uncovered risks

- No implemented authority-route classifier yet; PR25 only records fixtures, evidence, and docs.
- No formal malicious external document fixture yet.
- No folded-index tamper regression yet.
- No complete policy hot-swap regression across receipt production/receiver time yet.
- No full nested handoff authority-resolution suite yet.

## PR26/PR27 requirement

Before or alongside a classifier, map each actor/capability pair to at least one fixture or explicit non-goal. The classifier should be designed against this threat model, not only against valid receipts.
