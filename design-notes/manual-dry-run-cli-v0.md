# Manual dry-run CLI contract v0

Status: design contract only. This note does not implement a CLI, live observer, watcher, daemon, adapter, network integration, tool execution path, approval path, blocker/allower, authorization path, memory write, config write, or external publication path.

## Purpose

The previous real-redacted replay gates show that the offline receiver pipeline can accept manually reviewed, redacted handoff bundles and produce parser evidence, classifier decisions, decision traces, record-only live-shadow results, and scorecard rows without forbidden effects.

The next safe step is not a live observer. It is a manual dry-run contract: a human explicitly invokes a future command over an already-redacted artifact and receives local evidence records only.

Guiding rule:

> The manual dry-run CLI processes redacted artifacts; it does not capture reality.

## Proposed invocation shape

Conceptual only:

```sh
synaptic-shadow dry-run --input fixtures/real-redacted/example.json
```

This design note intentionally does not add that command. The command may be implemented only after the command/result schemas, negative controls, and release gates prove the boundaries below.

## Accepted input

A future dry-run command may accept only:

- a manually prepared `ManualObservationBundle`;
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
- any input where `rawContentIncluded` is true;
- live traffic, live session, log tail, watcher, daemon, webhook, adapter, or runtime event sources;
- network URLs or remote fetch targets;
- tool outputs, private paths, secrets, memory text, config text, approval text, or unnecessary private identifiers;
- commands that request blocking, allowing, authorization, approval, memory writes, config writes, publication, tool execution, or agent-instruction modification.

## Output

A future dry-run command may produce only local evidence artifacts equivalent to the current offline replay chain:

1. `parserEvidence`
2. `classifierDecision`
3. `DecisionTrace`
4. `LiveShadowObservationResult` with `observerAction: record_only`
5. scorecard row
6. `ManualDryRunResult` summarizing that the run stayed record-only

The result is audit evidence. It does not authorize anything and does not become runtime state.

## Forbidden routes and effects

The contract forbids all of the following:

- watcher or daemon behavior;
- reading live traffic, live logs, or live sessions;
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

## Readiness to move beyond this design

A later implementation block may be considered only if this design contract remains green and the implementation is still:

- manual;
- local;
- file-input only;
- redacted-bundle only;
- record-only;
- evidence-output only;
- no observer/watcher/daemon/runtime.

A passive live-shadow prototype should wait until the manual dry-run contract and implementation have separate scorecards over a larger set of real-redacted handoffs with zero forbidden effects, zero `mayBlock`/`mayAllow`, and zero raw/private/secret/tool/memory/config/approval persistence.
