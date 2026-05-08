# Manual real handoff capture protocol v0

Status: design/protocol document for the v0.1.10 real-redacted handoff ingestion block.

This document defines the human capture barrier for turning a real handoff into a safe, manually curated replay fixture. It does **not** add live observation, runtime integration, a daemon, watcher, adapter, tool execution, memory writes, config writes, publication, approval handling, blocking, allowing, authorization, or enforcement.

## Purpose

v0.1.10 should prove a narrower claim than live shadow:

> The offline pipeline can accept manually reviewed, real-redacted handoff replay fixtures without importing raw operational risk into the repository.

The correct phrase is **manually curated real-redacted replay fixtures**.

Do not describe this as live real-flow observation, live shadow, runtime monitoring, traffic processing, or observer behavior.

## Central rule

A real handoff may enter the pipeline only after it has been transformed into a redacted artifact.

The raw input must not enter the repository, fixtures, evidence outputs, release package, issue comments, PR descriptions, CI logs, generated scorecards, or any durable project artifact.

If a case cannot be represented without persisting raw sensitive material, private paths, tool outputs, memory/config/approval text, or unnecessary internal names, it is not eligible for this protocol.

## Capture boundary

Allowed:

- manual/offline capture only;
- human-reviewed redaction before any repo write;
- low-risk real handoff summaries;
- metadata and summary-safe labels;
- stable synthetic identifiers;
- hashes of redacted artifacts;
- offline/local replay only, with no live shadow, observer, runtime, daemon, or watcher;
- `record_only`, `no_effects`, `local_shadow_only` downstream results.

Forbidden:

- raw handoff content in the repo;
- live traffic/log/session reads by the pipeline;
- observer, daemon, watcher, MCP/A2A endpoint, or adapter integration;
- tool execution;
- memory writes or permanent memory promotion;
- config reads copied into fixtures or config writes;
- approval-path text or approval handling;
- external publication as part of the pipeline;
- blocking, allowing, authorization, enforcement, canary, production, or safety-certification claims.

## Human checklist before creating a bundle

The reviewer must confirm all of the following before creating a `ManualObservationBundle` for a real handoff:

- [ ] Raw content is not persisted.
- [ ] Private paths are not persisted.
- [ ] Secrets, tokens, credentials, account IDs, chat IDs, session IDs, or other sensitive identifiers are not persisted.
- [ ] Tool outputs are not persisted.
- [ ] Prior memory text is not copied.
- [ ] Real config text is not copied.
- [ ] Approval text, approval commands, approval IDs, or approval decisions are not copied.
- [ ] Unnecessary internal names are reduced to stable synthetic labels.
- [ ] User/private data not needed for route classification is removed.
- [ ] The remaining content is metadata-only or summary-safe.
- [ ] The case is low risk.
- [ ] The intended downstream replay is offline/local-shadow only.
- [ ] The expected downstream result is `record_only` / `no_effects` / `local_shadow_only`.

If any checklist item fails, stop and do not create the bundle.

## Minimal real-redacted artifact shape

A real-redacted handoff fixture should preserve only the minimum needed for replay:

- `bundleId`: synthetic ID, for example `mob_real_release_boundary_001`.
- `sourceKind`: broad class, for example `planner_reviewer_release_boundary`.
- `capturedAt`: capture timestamp.
- `redactedSnapshotRef`: synthetic stable reference.
- `redactedSnapshotHash`: hash of the redacted artifact, not the raw source.
- `captureMode`: `manual_offline`.
- `humanReviewRequiredForCapture`: `true`.
- persistence flags: all false for raw content, paths, secrets, tool outputs, memory text, config text, approval text.
- `allowedProcessing`: `local_shadow_only`.
- `forbiddenEffects`: at least runtime, tools, memory writes, config writes, external publication, approval path, blocking, and allowing.
- audit reason codes showing manual capture, human review, raw-not-persisted, redacted-only, local-shadow-only, and no operational effects.

The redacted artifact may include short summary-safe labels such as:

- `task_type: release_notes_boundary_review`
- `handoff_direction: planner_to_reviewer`
- `boundary_labels: [manual_offline, no_runtime, no_observer, no_tools, no_memory_write, no_config_write, no_approval_path, no_blocking, no_allowing]`
- `expected_route: abstain` or `shadow_only`, depending on the classifier gate being tested.

It must not include the original handoff prose if that prose contains sensitive details, local paths, tool output, memory text, config text, approval text, or unnecessary internal names.

## Required redaction review record

Each real-redacted handoff must have a redaction review record before it is eligible for replay.

Example shape:

```json
{
  "schemaVersion": "redaction-review-record-v0",
  "reviewId": "rrr_real_001",
  "bundleId": "mob_real_001",
  "captureMode": "manual_offline",
  "humanReviewed": true,
  "rawContentPersisted": false,
  "privatePathsPersisted": false,
  "secretLikeValuesPersisted": false,
  "toolOutputsPersisted": false,
  "memoryTextPersisted": false,
  "configTextPersisted": false,
  "approvalTextPersisted": false,
  "allowedForLocalShadowReplay": true,
  "forbiddenForLiveObservation": true,
  "forbiddenForRuntimeUse": true
}
```

Hard invariants for the future schema:

- `humanReviewed = true`
- `rawContentPersisted = false`
- `privatePathsPersisted = false`
- `secretLikeValuesPersisted = false`
- `toolOutputsPersisted = false`
- `memoryTextPersisted = false`
- `configTextPersisted = false`
- `approvalTextPersisted = false`
- `allowedForLocalShadowReplay = true`
- `forbiddenForLiveObservation = true`
- `forbiddenForRuntimeUse = true`

This review record converts the human 1→2 step into an auditable precondition. A real-redacted bundle without a matching review record must fail the replay gate.

## First eligible cases

Preferred first cases:

1. benign documentation/release handoff;
2. Planner → Reviewer handoff with explicit non-runtime boundaries;
3. mild ambiguity case that should degrade conservatively.

Avoid for v0.1.10:

- Agent → Tool handoffs;
- Agent → Memory handoffs;
- Agent → Config handoffs;
- Agent → GitHub comment or external-publication handoffs;
- Agent → MCP/A2A handoffs;
- handoffs containing logs, tool outputs, private paths, approvals, config, memory text, user data, credentials, tokens, account IDs, or session IDs.

## Candidate A for first controlled trial

The preferred first controlled trial is a real handoff from an internal development workstream, reduced to a benign release/boundary-review shape.

Use only a redacted summary such as:

- broad source kind: `planner_reviewer_release_boundary` or `internal_research_handoff`;
- task class: review release notes and non-runtime boundary language;
- expected boundary: manual/offline/local-shadow only;
- expected operational result: `record_only`, `no_effects`, no block, no allow, no capability attempts.

Do not copy the raw handoff body, local filesystem paths, tool command output, memory text, config text, approval text, private identifiers, or user/private project details into the repo.

## Real-redacted replay gate expectations

A future v0.1.10 replay gate should report:

- `realRedactedBundles`: 2 or 3 initially;
- `redactionReviewRecords`: same count as bundles;
- `parserEvidence`: pass;
- `classifierDecision`: pass;
- `DecisionTrace`: pass;
- `LiveShadowObservationResult`: `record_only`;
- `forbiddenEffects`: 0;
- `mayBlock`: 0;
- `mayAllow`: 0;
- `capabilityAttempts`: 0;
- `rawContentPersisted`: false;
- `privatePathsPersisted`: false;
- `secretLikeValuesPersisted`: false;
- `toolOutputsPersisted`: false;
- `memoryTextPersisted`: false;
- `configTextPersisted`: false;
- `approvalTextPersisted`: false;
- `mismatch`: 0.

The output should say:

> The offline pipeline accepts real-redacted handoffs under human review.

The output must not say:

> The observer works.

## Real-redacted scorecard threshold direction

The real-redacted scorecard should be separate from synthetic/manual fixture scorecards. Suggested thresholds:

```json
{
  "minRealRedactedBundles": 2,
  "requiredRawContentPersisted": false,
  "requiredPrivatePathsPersisted": false,
  "requiredSecretLikeValuesPersisted": false,
  "requiredForbiddenEffects": 0,
  "requiredMayBlock": 0,
  "requiredMayAllow": 0,
  "requiredCapabilityAttempts": 0,
  "requiredMismatch": 0
}
```

This separation prevents the project from drifting from “manual offline replay” into “almost live.”

## Promotion criteria before any live-observer discussion

Do not consider a passive live-shadow prototype until at least:

- 10–20 real-redacted handoffs have passed;
- raw content persisted: 0;
- private paths persisted: 0;
- secret-like values persisted: 0;
- tool outputs persisted: 0;
- memory text persisted: 0;
- config text persisted: 0;
- approval text persisted: 0;
- forbidden effects: 0;
- mayBlock: 0;
- mayAllow: 0;
- capability attempts: 0;
- mismatches: 0;
- redaction review is mandatory;
- real-redacted scorecard is separate;
- DecisionTrace remains hash-bound;
- LiveShadowObservationResult remains `record_only`.

The next step after that should be manual dry-run design, then local-only manual dry-run CLI, and only later a passive live-shadow prototype. Even then, no blocking, allowing, approval, tool authorization, memory writes, config writes, publication, or enforcement.

## v0.1.10 release language

If the full v0.1.10 block passes, release notes should use language like:

> Adds manually reviewed, redacted real handoff replay fixtures. Still no live observer, runtime integration, daemon/watcher, tool/memory/config/publication effects, approval path, blocking/allowing, authorization, or enforcement.

Avoid language that implies live processing of real traffic.

## Summary

Before observing in vivo, demonstrate that the project can ingest reality without bringing raw operational risk into the repo.
