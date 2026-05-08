# Live-shadow schemas v0

Status: offline schema fixtures only. Not runtime-ready; not live-observer-ready; not production/canary/enforcement-ready.

This document defines the first contractual cage for future live-shadow observation records. The goal is to validate the shape of future observation artifacts before any observer implementation exists.

## Boundary

These schemas and fixtures do **not**:

- observe live traffic
- read live logs or sessions
- create daemons, watchers, CLIs, MCP tools, GitHub hooks, or adapters
- execute tools
- write memory
- write config
- publish externally
- block, allow, approve, grant, or enforce anything
- modify agent instructions or approval paths

They only validate offline JSON fixtures.

## Schema 1: `LiveShadowObservation`

Path: `schemas/live-shadow-observation.schema.json`

A `LiveShadowObservation` represents what a future observer could record as input context, not something the observer does. Required invariants:

- `observerMode` is exactly `passive`
- `effectBoundary` is exactly `no_effects`
- `writeBoundary` is exactly `local_shadow_only`
- `forbiddenPaths` explicitly includes `runtime`, `tools`, `memory_write`, `config_write`, `external_publication`, `agent_instruction`, and `approval_path`
- `decisionTraceHash`, `routeDecisionInputHash`, and `classifierDecisionHash` are hash-shaped audit links
- `additionalProperties: false`

Allowed inputs are limited to existing offline/shadow artifacts: `decision_trace`, `parser_evidence`, `route_decision_input`, and `classifier_decision`.

## Schema 2: `LiveShadowObservationResult`

Path: `schemas/live-shadow-observation-result.schema.json`

A `LiveShadowObservationResult` represents what a future observer could emit as audit evidence. It is not an order and cannot become a receiver decision. Required invariants:

- `observerAction` is exactly `record_only`
- `mayBlock` is `false`
- `mayAllow` is `false`
- `mayExecuteTool` is `false`
- `mayWriteMemory` is `false`
- `mayWriteConfig` is `false`
- `mayPublishExternally` is `false`
- `mayModifyAgentInstructions` is `false`
- `mayEnterApprovalPath` is `false`
- `forbiddenEffectsDetected` is empty
- `additionalProperties: false`

A result may contain warnings or drift signals, such as `classifier_decision_changed_from_previous_trace`, but it remains `record_only` and cannot block, allow, approve, execute, or write.

## Reason-code vocabulary

The live-shadow reason codes audit the observer boundary only. They are not RouteDecision reason codes and must not be used to authorize receiver routes.

Initial vocabulary:

- `LIVE_SHADOW_OBSERVE_ONLY`
- `LIVE_SHADOW_NO_EFFECTS`
- `LIVE_SHADOW_TRACE_ONLY`
- `LIVE_SHADOW_LOCAL_ONLY`
- `LIVE_SHADOW_DECISION_PATH_SEPARATED`
- `LIVE_SHADOW_FORBIDDEN_RUNTIME_PATH`
- `LIVE_SHADOW_FORBIDDEN_TOOL_PATH`
- `LIVE_SHADOW_FORBIDDEN_MEMORY_WRITE`
- `LIVE_SHADOW_FORBIDDEN_CONFIG_WRITE`
- `LIVE_SHADOW_FORBIDDEN_EXTERNAL_PUBLICATION`
- `LIVE_SHADOW_FORBIDDEN_AGENT_INSTRUCTION`
- `LIVE_SHADOW_FORBIDDEN_APPROVAL_PATH`

## Gates

Package scripts:

- `npm run test:live-shadow-observation-schema`
- `npm run test:live-shadow-observation-result-schema`
- `npm run test:live-shadow-forbidden-effects`

The forbidden-effects gate is deliberately redundant with schema checks. Its purpose is to make the project intention visible: live-shadow fixtures must not smuggle operational capabilities through fields that look like audit metadata.

## What comes after this

A future PR may add synthetic offline replay or scorecard shape checks. It should still avoid real observation, runtime integration, daemon/watchers, adapter imports, tool authorization, memory writes, config writes, publication, blocking, approval, or enforcement until there is a separate explicit maintainer decision.

## Synthetic replay follow-up

The next offline gate is documented in [Synthetic live-shadow replay v0](live-shadow-synthetic-replay.md). It consumes existing DecisionTrace evidence and emits synthetic `LiveShadowObservation` / `LiveShadowObservationResult` records while preserving `passive`, `record_only`, `no_effects`, and `local_shadow_only`. It is still not a live observer and does not add runtime, adapters, tools, memory/config writes, publication, blocking, approval, or enforcement.
