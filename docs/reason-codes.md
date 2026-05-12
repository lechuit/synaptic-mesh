# Reason code vocabulary

This document stabilizes the public vocabulary used by Synaptic Mesh local-shadow fixtures and evidence. Reason codes are **review signals**, not runtime authorization decisions.

Current gates require stable uppercase token strings in `reasonCodes` / `expectedReasonCodes`. This page groups those strings into official categories so tests, fixture reviews, and future specs can discuss the same failure modes without implying more coverage than exists.

## Rules

- Codes are stable, uppercase, underscore-separated identifiers.
- A code should describe the conservative reason for a selected route, not the route itself.
- Prefer category-based names for new codes. Existing fixtures include older family names; keep them stable unless a migration PR updates fixtures, evidence, docs, and release notes together.
- Do not use free-form prose as a reason code. Put explanations in adjacent `notes`, `expectedBehavior`, or fixture documentation.
- A reason code is evidence vocabulary only. It does not grant permission, enforce policy, or prove parser/classifier behavior.

## Official categories

| Category | Use for | Currently represented by |
| --- | --- | --- |
| `SCHEMA_*` | Receipt/RouteDecision shape, required fields, grammar/schema mismatch, malformed receipt candidates. | `INVALID_RECEIPT_SCHEMA`, `MISSING_POLICY_CHECKSUM`, `MISSING_BOUNDARY_FIELDS`, `RECEIPT_GRAMMAR_VERSION_UNRECOGNIZED`, `UNKNOWN_GRAMMAR_DIGEST`, `POLICY_CHECKSUM_MISSING` |
| `POLICY_*` | Policy version/window/checksum drift, receiver policy refresh, policy hot-swap, stale policy context. | `POLICY_HOT_SWAP_DETECTED`, `POLICY_VERSION_STALE`, `POLICY_WINDOW_STALE`, `STALE_POLICY_WINDOW`, `POLICY_CONTEXT_STALE_OR_MISSING`, `RECEIVER_POLICY_REFRESH_REQUIRED`, `REQUEST_FULL_RECEIPT_BEFORE_HUMAN_ESCALATION` |
| `BOUNDARY_*` | Boundary completeness, local-shadow limits, runtime/config/publication/permanent-memory boundaries. | `BOUNDARY_COVERAGE_MISSING`, `LOCAL_SHADOW_BOUNDARY_COMPLETE`, `NO_SENSITIVE_BOUNDARY`, `RUNTIME_OR_PERMANENT_MEMORY_BOUNDARY`, `CONFIG_CHANGE_REQUIRES_HUMAN_AUTHORITY`, `PERMANENT_MEMORY_REQUIRES_HUMAN_AUTHORITY`, `RUNTIME_TOOL_REQUIRES_HUMAN_AUTHORITY` |
| `FRESHNESS_*` | Source/receipt freshness, replay, digest/mtime revalidation, source refresh before escalation. | `SOURCE_REFRESH_REQUIRED`, `SOURCE_DIGEST_REVALIDATION_REQUIRED`, `SOURCE_DIGEST_OR_MTIME_REQUIRES_REVALIDATION`, `SOURCE_DIGEST_MISMATCH`, `REPLAYED_RECEIPT_STALE`, `LOCAL_SHADOW_RECEIPT_CURRENT` |
| `PARSER_*` | Raw artifact/parser-pressure signals where hostile prose or receipt-like material should not be treated as authority. | `PROMPT_INJECTION_STYLE_PROSE`, `EXTERNAL_PROSE_NOT_AUTHORITY`, `AGENT_INFERENCE_NOT_AUTHORITY`, `FREE_TEXT_NOT_AUTHORITY`, `TAMPERED_ACTION_FIELD_INVALIDATES_RECEIPT` |
| `CONFLICT_*` | Conflicting receipts, contradictory claims, route/effect conflicts, source-bound authority conflicts. | `BOUNDARY_CONFLICT`, `MULTIPLE_VALID_RECEIPTS`, `CONTRADICTORY_AUTHORITY_CLAIM_NO_VERIFIABLE_SOURCE`, `NEXT_ALLOWED_ACTION_TAMPERED`, `SOURCE_BOUND_AUTHORITY_MISSING`, `TAMPERED_RECEIPT_MUST_NOT_ESCALATE_AS_VALID` |
| `PROMOTION_*` | Attempts to upgrade authority across local-shadow, runtime, config, publication, shared/permanent-memory, or tool boundaries. | `CONFIG_CHANGE_PROMOTION`, `SENSITIVE_PROMOTION_HIDDEN_IN_PAYLOAD`, `HIDDEN_SENSITIVE_PROMOTION`, `PERMANENT_MEMORY_EXCEEDS_LOCAL_SHADOW`, `RUNTIME_TOOL_EXCEEDS_LOCAL_SHADOW`, `EXTERNAL_PUBLICATION_EXCEEDS_LOCAL_SHADOW` |
| `FREE_TEXT_*` | Free-text attempts to modify structured fields, next allowed action, or authority labels. | `FREE_TEXT_CANNOT_MODIFY_NEXT_ALLOWED_ACTION`, `CONFIG_CHANGE_PROMOTION_IN_FREE_TEXT`, `SENSITIVE_BOUNDARY_PROMOTION_IN_FREE_TEXT`, `EXTERNAL_PROSE_NOT_AUTHORITY` |
| `FOLDED_INDEX_*` | Folded/compact receipt index mismatch, hidden sensitive promotion, or tamper risk. | `FOLDED_INDEX_MISMATCH`, `FOLDED_INDEX_HIDES_SENSITIVE_PROMOTION`, `FOLDED_INDEX_TAMPER_RISK` |

## Existing non-prefix families

The current fixture suite predates this category list and also uses these stable families:

- `ACTION_*` — action effects and external-effect pressure, for example `ACTION_EFFECT_RUNTIME_EXECUTION` and `ACTIONABLE_EXTERNAL_EFFECT_PRESENT`.
- `AUTHORITY_*` / authority phrasing — authority refresh and unresolved receipt authority, for example `AUTHORITY_REFRESH_REQUIRED` and `AUTHORITATIVE_RECEIPT_UNRESOLVED`.
- `CLAIM_TYPE_*` — claim taxonomy signals, for example `CLAIM_TYPE_LAUNDERING_DETECTED`.
- `MEMORY_*`, `RUNTIME_*`, `EXTERNAL_*`, `SOURCE_*`, `SELECTED_ROUTE_*`, and `NO_*` — older stable fixture vocabulary used by authority-route, threat-model, benchmark, generated adversarial, and raw/parser gates.
- Manual dry-run reject codes — local CLI failure vocabulary for invalid pilot usage, including `REDACTION_REVIEW_RECORD_MISSING`, `RAW_CONTENT_PERSISTED`, `PRIVATE_PATH_PERSISTED`, `SECRET_LIKE_VALUE_PERSISTED`, `TOOL_OUTPUT_PERSISTED`, `MEMORY_TEXT_PERSISTED`, `CONFIG_TEXT_PERSISTED`, `APPROVAL_TEXT_PERSISTED`, `URL_INPUT_FORBIDDEN`, `DIRECTORY_INPUT_FORBIDDEN`, `OUTPUT_PATH_OUTSIDE_EVIDENCE`, `CAPABILITY_ALLOW_FORBIDDEN`, `CAPABILITY_BLOCK_FORBIDDEN`, `TOOL_EXECUTION_FORBIDDEN`, `MEMORY_WRITE_FORBIDDEN`, and `CONFIG_WRITE_FORBIDDEN`. These codes mean local rejection/no success evidence; they do not imply runtime blocking or enforcement.
- Retention negative-control codes — local retention metadata gate vocabulary, including `RETENTION_RAW_LIVE_INPUT_MUST_BE_ZERO_DAY`, `RETENTION_CEILING_EXCEEDED`, `RETENTION_UNKNOWN_CLASS_REJECTED`, `RETENTION_RAW_CONTENT_PERSISTED`, `RETENTION_REDACTION_STATUS_REQUIRED`, `RETENTION_AGGREGATE_ONLY_REQUIRED`, `RETENTION_PUBLIC_EVIDENCE_MUST_BE_SYNTHETIC_OR_NON_SENSITIVE`, `RETENTION_SCHEDULER_FORBIDDEN`, `RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN`, `RETENTION_LIVE_OBSERVER_FORBIDDEN`, and `RETENTION_RUNTIME_INTEGRATION_FORBIDDEN`. These codes mean local fixture rejection only; they do not schedule deletion, delete files, authorize retention, block/allow runtime actions, or enforce policy.

These are official for the current release candidate because they appear in tracked fixtures/evidence. New fixture work should prefer the category-based names above unless preserving an existing gate contract.

## Planned aliases only

The following are suggested future aliases, not currently asserted by tests unless a later PR migrates fixtures/evidence:

- `SCHEMA_INVALID_RECEIPT`, `SCHEMA_MISSING_POLICY_CHECKSUM`
- `POLICY_WINDOW_STALE`, `POLICY_CHECKSUM_MISMATCH`
- `BOUNDARY_LOCAL_SHADOW_EXCEEDED`, `BOUNDARY_HUMAN_REQUIRED`
- `FRESHNESS_SOURCE_REFRESH_REQUIRED`, `FRESHNESS_RECEIPT_REPLAYED`
- `PARSER_PROMPT_INJECTION_PROSE`, `PARSER_TAMPERED_ACTION_FIELD`
- `CONFLICT_MULTIPLE_RECEIPTS`, `CONFLICT_BOUNDARY_MISMATCH`
- `PROMOTION_CONFIG_CHANGE`, `PROMOTION_RUNTIME_TOOL`
- `FREE_TEXT_NEXT_ALLOWED_ACTION_TAMPERED`
- `FOLDED_INDEX_MISMATCH`, `FOLDED_INDEX_HIDDEN_PROMOTION`

A migration should be docs-first and evidence-preserving: add aliases, regenerate fixture/evidence outputs, and keep old codes documented until removed by a release note.

## Decision-counterfactual checklist codes

The v0.1.18 local advisory checklist adds `DECISION_COUNTERFACTUAL_*` reason codes for memory-retrieval fragments that should affect next-action selection only when they are source-backed and boundary-preserving. These codes are fixture/review vocabulary only. They do not write memory, create MemoryAtom records, integrate with runtime/adapters/tools, publish externally, authorize tools, or enforce policy.

Current codes:

- `DECISION_COUNTERFACTUAL_COMPLETE_LOCAL_TUPLE` — exact action, active lane/source, local boundary, blocked effects, and fallback are all present for local advisory use.
- `DECISION_COUNTERFACTUAL_EXACT_ACTION_REQUIRED` — an exact current action is missing.
- `DECISION_COUNTERFACTUAL_ACTIVE_LANE_SOURCE_REQUIRED` — current active lane/source evidence is missing.
- `DECISION_COUNTERFACTUAL_LOCAL_BOUNDARY_REQUIRED` — local-only boundary is missing.
- `DECISION_COUNTERFACTUAL_BLOCKED_EFFECTS_REQUIRED` — blocked effects are missing.
- `DECISION_COUNTERFACTUAL_FALLBACK_REQUIRED` — fallback/fetch/abstain path is missing.
- `DECISION_COUNTERFACTUAL_SIMILARITY_NOT_AUTHORITY` — similar memory text is only a recall hint, not action authority.
- `DECISION_COUNTERFACTUAL_WRONG_LANE_PRESSURE_REJECTED` — wrong-lane branch pressure invalidates local continuation.
- `DECISION_COUNTERFACTUAL_PAUSED_PROJECT_PRESSURE_REJECTED` — paused-project pressure invalidates local continuation.
- `DECISION_COUNTERFACTUAL_NEW_USER_CORRECTION_WINS` — newest explicit user correction determines next-action selection.
- `DECISION_COUNTERFACTUAL_STALE_MEMORY_RETIRED_NO_ACTION` — stale memory is retired as inactive/no-action without deleting history.
- `DECISION_COUNTERFACTUAL_EXTERNAL_FACT_SOURCE_REQUIRED` — mutable external facts require source verification before answer/action.
- `DECISION_COUNTERFACTUAL_VERIFIED_SOURCE_TUPLE` — verified source tuple may support a local advisory answer.
- `DECISION_COUNTERFACTUAL_CURRENT_USER_LOCAL_TEST_AUTHORITY` — current user request permits local advisory/shadow testing only when the core allow tuple is present.
- `DECISION_COUNTERFACTUAL_RELEASE_SUCCESS_NOT_PROMOTION_AUTHORITY` — PR/release/CI success does not authorize memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, config, or enforcement.
