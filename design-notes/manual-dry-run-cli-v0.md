# Manual dry-run CLI contract v0

Status: design contract only. This note defines the allowed shape for a future minimal CLI. It does not implement a CLI, live observer, watcher, daemon, adapter, network integration, tool execution path, approval path, blocker/allower, authorization path, memory write, config write, or external publication path.

## Purpose

The previous real-redacted replay gates show that the offline receiver pipeline can accept manually reviewed, redacted handoff bundles and produce parser evidence, classifier decisions, decision traces, record-only live-shadow results, and scorecard rows without forbidden effects.

The next safe step is not a live observer. It is a manual dry-run CLI contract: a human explicitly invokes a local command over an already-redacted artifact and receives local evidence records only.

Guiding rule:

> The manual dry-run CLI processes redacted artifacts; it does not capture reality.

Spanish shorthand:

> La CLI procesa artefactos redactados; no captura realidad.

## Minimal implementation scope

A future v0.1.13 implementation may add a small local runner only if it stays within this scope:

- manual invocation;
- explicit local file input;
- already-redacted `ManualObservationBundle` only;
- associated valid `RedactionReviewRecord` required;
- local evidence output only;
- `record_only` result only;
- no new authority logic in the CLI itself.

The CLI should be a boring orchestrator for the existing offline pipeline, not a new receiver. Authority and routing logic must remain in the existing schemas/pipeline/tests.

## Proposed invocation shape

Conceptual only for this design block:

```sh
node tools/manual-dry-run.mjs \
  --input fixtures/real-redacted-handoffs/case-001.json \
  --output evidence/manual-dry-run/case-001.out.json
```

or:

```sh
npm run manual:dry-run -- \
  --input fixtures/real-redacted-handoffs/case-001.json \
  --output evidence/manual-dry-run/case-001.out.json
```

This design note intentionally does not add that command. The command may be implemented only after the command/result schemas, negative controls, and release gates prove the boundaries below.

## Allowed flags

A future minimal CLI may accept only:

- `--input` — one explicit local file path;
- `--output` — one explicit local evidence output path;
- `--target` — optional expected target/version label for evidence metadata.

The first implementation should not accept stdin, directories, glob patterns, URL inputs, repository discovery, automatic folder scans, or batch manifests.

## Forbidden flags and modes

A future minimal CLI must reject unknown or overpowered flags, including:

- `--watch`
- `--daemon`
- `--url`
- `--repo`
- `--network`
- `--tool`
- `--memory`
- `--config`
- `--publish`
- `--approve`
- `--block`
- `--allow`
- any adapter/runtime/live-observer equivalent

If one of those appears, the command should fail closed with a stable reason code and must not write output evidence.

## Accepted input

A future dry-run command may accept only:

- a manually prepared `ManualObservationBundle` with `schemaVersion: manual-observation-bundle-v0`;
- redacted content or redacted metadata only;
- an associated `RedactionReviewRecord` that marks the bundle as human-reviewed and allowed for local shadow replay;
- a local file path supplied by a human at invocation time;
- inputs whose command contract sets `mode: manual_offline`, `inputKind: redacted_manual_observation_bundle`, and `expectedObserverAction: record_only`.

The command contract must preserve these invariants:

- raw handoff text is not allowed;
- live session streams are not allowed;
- live logs are not allowed;
- runtime events are not allowed;
- network input is not allowed;
- tool output is not allowed;
- memory/config/approval text is not allowed.

## Rejected input

A future dry-run command must reject or fail closed on:

- raw or unredacted handoff content;
- `--input` pointing to a URL;
- `--input` pointing to a directory;
- `--input` using a glob pattern;
- any input that is not a `manual-observation-bundle-v0` artifact;
- any input without an associated valid `RedactionReviewRecord`;
- any input where `rawContentIncluded` or `rawContentPersisted` is true;
- live traffic, live session, log tail, watcher, daemon, webhook, adapter, or runtime event sources;
- network URLs or remote fetch targets;
- tool outputs, private paths, secrets, memory text, config text, approval text, or unnecessary private identifiers;
- commands that request blocking, allowing, authorization, approval, memory writes, config writes, publication, tool execution, or agent-instruction modification.

## Output

A future dry-run command may produce only local evidence artifacts equivalent to the current offline replay chain:

1. `parserEvidence`
2. `classifierDecision`
3. `DecisionTrace`
4. `LiveShadowObservation`
5. `LiveShadowObservationResult` with `observerAction: record_only`
6. scorecard row
7. `ManualDryRunResult` summarizing that the run stayed record-only

The result is audit evidence. It does not authorize anything and does not become runtime state.

A minimal result must preserve hard invariants like:

```json
{
  "manualDryRun": "pass",
  "recordOnly": true,
  "inputKind": "redacted_manual_observation_bundle",
  "rawInputRead": false,
  "liveInputRead": false,
  "networkUsed": false,
  "toolExecuted": false,
  "memoryWritten": false,
  "configWritten": false,
  "publishedExternally": false,
  "approvalEntered": false,
  "blocked": false,
  "allowed": false,
  "enforced": false
}
```

Tests must fail if any forbidden capability field changes to true.

## Output path restrictions

The first implementation should write only to the explicit `--output` path. It should not create side channels, logs with raw content, hidden temp artifacts, memory/config updates, comments, releases, or network posts.

The output path should be treated as evidence output, not runtime state. A separate test should verify that failed inputs do not create output evidence.

## Forbidden routes and effects

The contract forbids all of the following:

- watcher or daemon behavior;
- reading live traffic, live logs, or live sessions;
- automatic folder scanning;
- glob discovery;
- network access;
- MCP/A2A/framework adapter integration;
- tool execution;
- memory writes;
- config writes;
- external publication;
- blocking;
- allowing;
- approval path entry;
- authorization;
- enforcement;
- runtime host integration.

## Required CLI negative controls

A future implementation must include CLI-specific negative controls, not just schema negative controls. At minimum, these cases must fail with non-zero exit, stable reason code, and no output evidence written:

- `--input` is a URL;
- `--input` is a directory;
- `--input` is a glob pattern;
- input lacks `schemaVersion: manual-observation-bundle-v0`;
- input lacks a valid `RedactionReviewRecord`;
- input has raw content included or persisted;
- input or command asks for live input;
- input or command asks for network;
- input or command asks for tool execution;
- input or command asks for memory write;
- input or command asks for config write;
- input or command asks for publication;
- input or command asks for approval path;
- input or command asks for block;
- input or command asks for allow;
- input or command asks for authorization or enforcement.

## Difference from live observer

A live observer discovers or receives events from the world. A manual dry-run does not.

Manual dry-run:

- starts only by explicit human invocation;
- consumes only already-redacted local files;
- is record-only;
- writes only local evidence output;
- has no watcher, daemon, network, adapter, or runtime hooks.

Live observer:

- would monitor or receive ongoing activity;
- may touch live logs, sessions, adapters, runtime hosts, or event streams;
- would require separate privacy, retention, authorization, rollback, approval, and failure-mode design.

This contract deliberately stays on the manual dry-run side.

## Difference from runtime

Runtime integration can affect behavior. Manual dry-run cannot.

The dry-run result must not be consumed as a permission, approval, block, allow, memory update, config update, publication trigger, or enforcement event. It is a local audit artifact only.

## Preconditions before implementation

Before implementing a real CLI, the repository must have:

1. `ManualDryRunCommand` schema.
2. `ManualDryRunResult` schema.
3. Positive fixtures for record-only manual offline commands/results.
4. Negative controls proving raw/live/network/tools/memory/config/publication/block/allow/approval paths fail schema validation.
5. Release gate coverage for the schemas and negative controls.
6. Documentation that states the dry-run processes redacted artifacts and does not capture reality.
7. No watcher, daemon, network, adapter, runtime, approval, authorization, or enforcement implementation.
8. This CLI boundary note merged before implementation.

## Merge criteria for the implementation block

The future minimal CLI implementation should merge only if:

- `npm run check` passes;
- `npm run review:local` passes;
- `npm run release:check -- --target v0.1.13` passes during release prep;
- `test:manual-dry-run-cli` passes;
- `test:manual-dry-run-cli-negative-controls` passes;
- `MANIFEST.json` is updated;
- docs say manual/local/redacted/record-only;
- no watcher/daemon/network imports or behavior exist;
- no real adapters, MCP/A2A SDKs, runtime hooks, memory/config writes, approval paths, blockers/allowers, authorization, or enforcement paths exist.

Reviewers should especially check:

- Does the CLI write only to `--output`?
- Can it overwrite outside expected evidence paths?
- Does it accept URLs?
- Does it accept directories?
- Does it read raw content?
- Can it run in watch/daemon/live mode?
- Does it add its own authority logic instead of calling the existing pipeline?

Any risky answer blocks the PR.

## Readiness to move beyond this design

A later implementation block may be considered only if this design contract remains green and the implementation is still:

- manual;
- local;
- file-input only;
- redacted-bundle only;
- record-only;
- evidence-output only;
- no observer/watcher/daemon/runtime.

Batch dry-run, if needed later, should use an explicit reviewed manifest of already-redacted files. It should not discover folders, accept globs, or watch directories.

A passive live-shadow prototype should wait until the manual dry-run contract and implementation have separate scorecards over a larger set of real-redacted handoffs with zero forbidden effects, zero `mayBlock`/`mayAllow`, and zero raw/private/secret/tool/memory/config/approval persistence.
