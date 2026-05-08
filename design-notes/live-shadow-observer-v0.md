# Live Shadow Observer v0 — Design Note

## Status

Design-only. No implementation.

The live shadow observer observes decisions, but cannot become part of the decision path.

It is not:

- runtime enforcement;
- blocking or allowing;
- tool authorization;
- memory write behavior;
- config mutation;
- external publication;
- adapter integration;
- production or safety-certification evidence.

## Purpose

The purpose of a future live shadow observer is to observe real multi-agent handoffs while preserving zero-effect behavior.

It may compute or record route decisions, decision traces, warnings, and scorecard rows. It must not influence execution.

Synaptic Mesh has already shown that offline receiver decisions can be explained with `goldDecision`, `classifierDecision`, `DecisionTrace`, mutation degradation checks, and coverage thresholds. The next design question is how to observe live flows without becoming an actor in those flows.

## Core invariant

The live shadow observer observes decisions, but cannot become part of the decision path.

Forbidden direction:

```text
Live Shadow Observer -X-> runtime
Live Shadow Observer -X-> tools
Live Shadow Observer -X-> memory
Live Shadow Observer -X-> config
Live Shadow Observer -X-> external publication
Live Shadow Observer -X-> agent instructions
Live Shadow Observer -X-> approval path
```

Allowed conceptual path:

```text
Real handoff artifact
  -> parser / normalizer
  -> routeDecisionInput
  -> classifierDecision
  -> DecisionTrace
  -> Live Shadow Observer
  -> local scorecard / warnings / audit report
```

The observer output is evidence, not permission.

## Non-goals

The observer must not:

- block execution;
- allow execution;
- approve actions;
- execute tools;
- authorize tools;
- mutate config;
- write persistent memory;
- publish externally;
- add GitHub comments or reviews;
- call MCP tools or expose MCP endpoints;
- import LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime adapter SDKs;
- run as an automatic daemon or watcher;
- change prompts, agent instructions, or task routing;
- become a policy-enforcement hook.

## Input boundary

A future passive observer may read only the minimum needed local shadow artifacts:

- handoff artifact identifier;
- parserEvidence;
- routeDecisionInput;
- policy snapshot metadata;
- grammar / registry metadata;
- classifierDecision;
- DecisionTrace.

It must not read:

- secrets;
- private tokens;
- unrelated user data;
- tool credentials;
- raw production logs without redaction;
- message bodies outside the chosen handoff artifact;
- persistent memory stores except through explicit local-shadow fixtures.

## Output boundary

A future passive observer may write local-only shadow artifacts:

- local observation record;
- local scorecard row;
- local warning list;
- local mismatch report;
- local audit digest.

It must not write:

- memory atoms;
- project config;
- runtime state;
- external comments;
- GitHub reviews;
- MCP tool calls;
- agent instructions;
- approval decisions;
- publication artifacts.

## Conceptual input contract

This is a design contract, not implemented code.

```ts
interface LiveShadowObservation {
  observationId: string;
  flowId: string;
  observedAt: string;
  sourceArtifactId: string;
  parserEvidenceRef: string;
  routeDecisionInputHash: string;
  classifierDecisionHash: string;
  decisionTraceHash: string;
  observerMode: 'passive';
  effectBoundary: 'no_effects';
  writeBoundary: 'local_shadow_only';
}
```

## Conceptual output contract

This is a design contract, not implemented code.

```ts
interface LiveShadowObservationResult {
  observationId: string;
  matchedExpectedPolicy: boolean;
  warnings: string[];
  safetySignals: string[];
  driftSignals: string[];
  forbiddenEffectsDetected: string[];
  observerAction: 'record_only';
}
```

## Proposed observer reason codes

These codes audit observer boundaries. They are not route decisions and must not be used as receiver authorization.

- `LIVE_SHADOW_OBSERVE_ONLY`
- `LIVE_SHADOW_NO_EFFECTS`
- `LIVE_SHADOW_FORBIDDEN_RUNTIME_PATH`
- `LIVE_SHADOW_FORBIDDEN_MEMORY_WRITE`
- `LIVE_SHADOW_FORBIDDEN_CONFIG_WRITE`
- `LIVE_SHADOW_FORBIDDEN_EXTERNAL_PUBLICATION`
- `LIVE_SHADOW_TRACE_ONLY`
- `LIVE_SHADOW_DECISION_PATH_SEPARATED`

## Risk model

### 1. Shadow influence creep

Risk: the observer starts passive, then its warnings are consumed to block, approve, or alter live prompts.

Mitigations:

- observer output is advisory-only;
- no automatic consumption by agents;
- no prompt-injection path;
- no blocking hook;
- no approval hook;
- no runtime import path.

### 2. Data overcollection

Risk: observing live handoffs captures more data than required.

Mitigations:

- minimal input set;
- redaction boundary before observation;
- no secrets or credentials;
- local-only artifacts;
- explicit retention policy before implementation.

### 3. Trace becomes authority

Risk: a `DecisionTrace` or observation result is mistaken for permission.

Mitigations:

- trace is evidence, not permission;
- classifierDecision is shadow, not enforcement;
- observationResult is audit, not command;
- release/docs must preserve this wording.

### 4. Silent coupling to runtime

Risk: observer code becomes coupled to real runtime paths even without executing actions.

Mitigations:

- no runtime adapter imports;
- no tool SDKs;
- no MCP client/server;
- no network calls;
- no daemon or watcher in v0.

### 5. Metric theater

Risk: observer emits attractive metrics that do not detect real problems.

Mitigations:

- mutation replay remains required;
- manual review samples remain required;
- false-human-escalation should be tracked before implementation;
- category coverage thresholds stay active;
- live-shadow metrics must be compared against offline replay and mutation baselines.

## Pre-implementation gates

Before implementing any live observer, Synaptic Mesh should have:

1. v0.1.7 decision-trace hardening released;
2. this design note reviewed;
3. an offline observation schema;
4. an observation-result schema;
5. a forbidden-effects gate;
6. synthetic observer replay from `DecisionTrace` to observation result;
7. redaction policy;
8. local retention policy;
9. explicit no-import checks for runtime/tool/adapters.

## Implementation boundary for a future alpha

A future `v0.2.0-alpha` passive observer, if approved, should be:

- `record_only`;
- `local_only`;
- `no_effects`;
- manual invocation only;
- no daemon;
- no automatic watcher;
- no runtime hook;
- no persistent memory write;
- no config write;
- no tool call;
- no external publication.

## Summary

The next step is not to make Synaptic Mesh act on live flows. The next step is to define how it could observe live flows while remaining unable to act.

A safe live shadow observer is an audit mirror, not a control surface.
