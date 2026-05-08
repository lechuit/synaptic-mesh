# Manual dry-run command contracts

Status: offline/local-shadow contract evidence only. This is not a CLI implementation, live observer, watcher, daemon, network integration, adapter integration, tool execution path, approval path, blocker/allower, authorization path, enforcement path, memory write, config write, or publication path.

## Purpose

The manual dry-run contracts define the next safe step after real-redacted handoff replay: a future human-invoked command that processes an already-redacted `ManualObservationBundle` and emits local evidence records only.

The contract keeps the core boundary explicit:

> Manual dry-run processes redacted artifacts; it does not capture reality.

## Schemas

- `schemas/manual-dry-run-command.schema.json`
- `schemas/manual-dry-run-result.schema.json`

## Command contract

`ManualDryRunCommand` accepts only a manually invoked offline command over a redacted manual observation bundle:

- `mode: manual_offline`
- `inputKind: redacted_manual_observation_bundle`
- `redactionReviewRequired: true`
- `humanInvocationRequired: true`
- `expectedObserverAction: record_only`
- `outputKind: local_evidence_record_only`

It pins all effect and capture capabilities to false:

- raw input
- live input
- network
- watcher
- daemon
- adapter integration
- tool execution
- memory writes
- config writes
- external publication
- blocking
- allowing
- approval path
- authorization
- enforcement
- runtime integration

## Result contract

`ManualDryRunResult` is a local evidence summary for the future dry-run path. It records that the offline chain produced:

- parser evidence;
- classifier decision;
- `DecisionTrace`;
- `LiveShadowObservationResult` with `record_only` action;
- scorecard row.

The result pins forbidden effects and operational capabilities to zero/false. It cannot be consumed as permission, approval, block, allow, authorization, enforcement, memory/config update, or publication trigger.

## Negative controls

`test:manual-dry-run-contracts` fails if command or result fixtures attempt to enable:

- raw input;
- live input;
- network;
- watcher;
- daemon;
- adapter/runtime integration;
- tool execution;
- memory/config writes;
- publication;
- blocking/allowing;
- approval path;
- authorization/enforcement;
- non-record-only output;
- persisted raw/private/secret/tool/memory/config/approval content.

## Evidence

Evidence output:

- `implementation/synaptic-mesh-shadow-v0/evidence/manual-dry-run-contracts.out.json`

Expected summary:

- command schema validation: pass;
- result schema validation: pass;
- command count: 2;
- result count: 2;
- validation errors: 0;
- negative controls: all fail as expected;
- `recordOnlyResultCount` equals result count;
- no forbidden effects or capability booleans.

## Boundary

This gate is intentionally pre-implementation. It does not add a `synaptic-shadow dry-run` binary or any equivalent command. A later implementation block must keep the same boundary: manual, local, file-input only, redacted-bundle only, record-only, evidence-output only, no observer/watcher/daemon/runtime.
