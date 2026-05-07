# Synaptic Mesh hardening roundup

Status: research / protocol package / local shadow validation only

This note summarizes the post-`v0.1.1` hardening work after the release branch landed. It is a coordination aid for reviewers, not a runtime readiness claim.

## Landed after `v0.1.1`

- Framework Adapter Matrix contract coverage:
  - Generic packet
  - LangGraph-like state
  - AutoGen-like message
  - CrewAI-like task context
  - Semantic Kernel-like planner state
  - MCP-like tool request
- Duplicate `SRC` receipt-field regressions across all adapter shapes.
- Sensitive verb alias regressions for network/send/config/memory/delete/publish/runtime-style actions.
- Receiver-observed source digest mismatch regressions across all adapter shapes.
- Duplicate authority-field variant regressions for `SCOPE`, `NO`, `ACT`, and `SRCDIGEST`.

## Current local evidence shape

The receiver adapter contract suite now exercises representative fail-closed behavior across adapter-shaped packets:

- complete local receipt + low-risk local action allows local shadow review;
- missing receipt/metadata abstains;
- source mismatch abstains;
- receiver-observed source digest/mtime/run-id mismatch abstains;
- duplicate authority fields abstain;
- stale/missing digest abstains;
- sensitive actions and sensitive verb aliases ask a human;
- framework/server prose such as “safe” does not authorize sensitive effects.

## Boundaries

This work is still **not**:

- a real framework integration;
- a runtime hook;
- an enforcement system;
- production/canary/L2 operational readiness;
- permission to publish/send/delete/configure without a human.

The useful claim is narrower: the local shadow package now has stronger contract tests for how receiver-side authority receipts should fail closed when mapped through several common framework-shaped packet formats.

## Next work candidates

1. Add more source-observation mismatch variants after real receiver observation formats are clearer.
2. Add a compact duplicate-field coverage table once more variants are covered per framework shape.
3. Add fixture examples for ambiguous framework action names and require explicit receiver classification before local allow.
