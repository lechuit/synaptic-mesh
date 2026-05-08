# RedactionReviewRecord schema v0

Status: v0.1.10 schema gate for manually reviewed real-redacted handoff ingestion.

`RedactionReviewRecord` records the human redaction review barrier that must pass before a manually curated handoff is eligible for offline/local replay.

It is a schema/fixture gate only. It does **not** read raw handoffs, observe live traffic, read runtime logs, implement an observer, daemon, watcher, adapter, MCP/A2A endpoint, execute tools, write memory/config, publish externally, enter approval paths, block, allow, authorize, or enforce.

## Why this exists

`ManualObservationBundle` proves that a redacted handoff-shaped artifact can be represented safely. `RedactionReviewRecord` makes the human 1→2 step auditable:

1. a real handoff exists outside the repo;
2. a human manually redacts it;
3. only the redacted/summary-safe artifact becomes eligible for repo fixtures;
4. the review record asserts hard no-persistence invariants before replay.

A real-redacted bundle without a matching review record must fail future real-redacted replay gates.

## Hard invariants

The schema forces:

- `captureMode = manual_offline`
- `humanReviewed = true`
- `rawContentPersisted = false`
- `privatePathsPersisted = false`
- `secretLikeValuesPersisted = false`
- `toolOutputsPersisted = false`
- `memoryTextPersisted = false`
- `configTextPersisted = false`
- `approvalTextPersisted = false`
- `redactedMetadataOnly = true`
- `allowedForLocalShadowReplay = true`
- `forbiddenForLiveObservation = true`
- `forbiddenForRuntimeUse = true`

These are not recommendations. They are the minimum acceptance bar for handoff replay.

## Required boundary language

Review records must carry audit/boundary vocabulary that preserves the v0.1.10 scope:

- manual/offline only;
- human review required;
- redacted metadata only;
- raw content, private paths, secret-like values, tool outputs, memory text, config text, and approval text not persisted;
- local-shadow replay only;
- no live observation;
- no runtime;
- no daemon/watcher;
- no adapter integration;
- no tool execution;
- no memory/config writes;
- no external publication;
- no approval path;
- no blocking/allowing;
- no authorization/enforcement.

## Fixture scope

Current fixtures are metadata-only review records for existing manual observation bundles. They are not real-redacted handoff cases yet.

The future v0.1.10 real-redacted pack should add 2–3 low-risk handoffs only after this schema is merged:

1. benign documentation/release handoff;
2. Planner → Reviewer handoff with explicit non-runtime boundaries;
3. mild ambiguity case that should degrade conservatively.

Avoid handoffs involving tools, memory, config, external publication, MCP/A2A, approvals, private paths, raw logs, user data, credentials, tokens, account IDs, or session IDs.

## Validation

Run:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:redaction-review-record-schema
```

Expected result:

- all review records validate;
- all persistence flags remain false;
- live observation and runtime use are forbidden;
- negative controls fail for raw content, paths, secrets, tool output, memory/config/approval text, live-observer properties, and invalid boundaries;
- output remains schema/fixture evidence only, not runtime behavior.
