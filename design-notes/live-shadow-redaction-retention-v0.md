# Live-shadow redaction and retention design v0

Status: unreleased v0.1.8-track design note only. Not implemented. Not runtime-ready; not production/canary/enforcement-ready.

This note defines the privacy boundary a future passive live-shadow observer would need before any real observation, live log reading, runtime adapter, daemon, watcher, MCP endpoint, tool integration, memory write, config write, publication, blocking, approval, or enforcement exists.

## Scope

This design covers future `LiveShadowObservation` and `LiveShadowObservationResult` artifacts only. It is a contract for what would be safe to record in local shadow evidence and what must be redacted, hashed, summarized, or refused before a future observer can be considered.

It does not add:

- redaction code
- retention scheduler
- live traffic observation
- live log/session reads
- runtime/adapters/tools imports
- daemon, watcher, CLI, MCP endpoint, or GitHub hook
- memory writes or config writes
- external publication
- blocking, allowing, approval, authorization, or enforcement

## Redaction principle

A live-shadow record must be useful for audit without becoming a transcript, secret cache, or hidden authority channel.

Default rule:

> Prefer stable hashes, ids, counts, reason codes, and boundary labels over raw content.

A future observer result must never need raw private content to decide an operational action because the result is always `record_only` and cannot authorize anything.

## Allowed-by-default fields

Offline/live-shadow-shaped records may carry:

- schema version
- synthetic or local observation/result ids
- flow ids that do not expose private content
- timestamps rounded to the precision required by the test
- parser evidence references
- decision trace references
- `sha256:` hashes of parser evidence, route input, classifier decision, and decision trace artifacts
- route names and reason codes already in the offline vocabulary
- boolean no-effect capability fields fixed to `false`
- counts, validation verdicts, and aggregate drift labels
- explicit boundary labels such as `passive`, `record_only`, `no_effects`, and `local_shadow_only`

## Redact or refuse

A future observer must not persist these in live-shadow records:

- raw user messages, prompts, or chat transcripts
- raw external page/email/message content
- secrets, credentials, API keys, tokens, cookies, auth headers, private keys, or one-time codes
- tool arguments or tool outputs containing private data
- full memory records or private preference text
- config values or config diffs
- approval transcripts, approval grants, or human-authorization text
- private contact/channel ids unless explicitly replaced by stable local aliases
- filesystem paths that reveal private project or user details, except repo-relative public package paths already committed
- unredacted error logs that may contain prompts, tokens, paths, or payloads

If a field cannot be represented safely as an id, label, count, or hash, the future observer should omit it and record a redaction warning. If omission breaks auditability, the result should remain `record_only` and mark the evidence incomplete; it still must not block, allow, approve, execute, or write.

## Hashing and linkage

Hash linkage should bind evidence without storing content:

- use `sha256:` prefixed digests
- hash canonicalized artifacts where possible
- keep hash purpose clear: parser evidence hash, route decision input hash, classifier decision hash, decision trace hash
- never treat a hash match as human approval or runtime authorization
- never use a hash of private content as a public identifier unless the source is already public and non-sensitive

Hash-only linkage proves equality with a known artifact; it does not prove source authenticity, freshness truth, semantic correctness, or safety.

## Retention model

This PR implements no retention mechanism. The following is a proposed future policy ceiling, not current behavior:

| Artifact class | Proposed future retention ceiling | Notes |
| --- | ---: | --- |
| Raw live inputs | 0 days / do not persist | Redact before record creation; prefer no storage. |
| Redacted observation records | short local window, e.g. 7 days | Local shadow only; enough for debugging/review. |
| Redacted result records | short local window, e.g. 7 days | Same boundary as observations. |
| Aggregate scorecards | longer local window, e.g. 30-90 days | Counts/labels only; no raw content. |
| Public release evidence | indefinite if synthetic/non-sensitive | Only committed fixtures/evidence that contain no private raw content. |

Any future retention implementation must be a separate explicit PR with tests and review. It must not delete user files or modify memory/config without explicit maintainer approval.

## Redaction failure modes

A future gate should include negative controls for:

- raw prompt accidentally copied into observation
- secret-like token copied into result warning
- tool output persisted in drift signal
- approval phrase preserved as evidence
- config diff or memory text embedded in a record
- full file path leaked where a repo-relative or hashed reference should be used
- hash label used as if it were authorization

Expected outcome for all such cases: the artifact is rejected or converted to a redaction warning while remaining `record_only` with all capability fields `false`.

## Receiver-side interpretation

Redaction can reduce evidence detail. The receiver must treat missing/redacted evidence conservatively:

- do not infer permission from absence
- do not upgrade route decisions from redacted text
- do not convert live-shadow warnings into authority
- prefer `abstain`, `request_full_receipt`, or similar non-effect routes in future receiver tests when necessary

Live-shadow reason codes audit observer boundaries. They are not RouteDecision authorization codes.

## Future gates

Before any implementation, add offline gates for:

1. redaction vocabulary and fixture shapes
2. negative controls for raw content leakage
3. retention metadata shape (`retentionClass`, `retentionCeiling`, `redactionStatus`)
4. aggregate-only scorecard checks
5. no-import/no-runtime checks for observer-adjacent files

Until those exist, this design note remains only a boundary document.

## Drift scorecard follow-up

The next unreleased v0.1.8-track gate is [Live-shadow drift scorecard shape v0](../docs/live-shadow-drift-scorecard.md). It is aggregate shape validation only and does not implement live monitoring, redaction code, retention scheduling, runtime integration, tools, memory/config writes, publication, approval, or enforcement.
