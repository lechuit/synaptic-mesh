# Release Notes — Synaptic Mesh v0.1.2

Status: adapter-contract hardening release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.1

- Added Framework Adapter Matrix coverage for Generic, LangGraph-like, AutoGen-like, CrewAI-like, Semantic Kernel-like, and MCP-like packet shapes.
- Expanded receiver adapter contract tests to 53/53 local cases.
- Added duplicate `SRC` regression coverage across all adapter shapes.
- Added representative duplicate authority-field variants for `SCOPE`, `NO`, `ACT`, and `SRCDIGEST`.
- Added sensitive verb aliases for network/send/config/memory/delete/publish/runtime-style actions so misleading `low_local` labels still ask a human.
- Added receiver-observed source mismatch coverage for digest, mtime staleness, and run-id drift.
- Added `HARDENING_ROUNDUP.md` for reviewer orientation.
- Kept runtime/framework integration explicitly out of scope.

## Validation snapshot

- review-local: pass 13/13
- receiver adapter contracts: pass 53/53
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.2 strengthens contract-shaped adapter tests for portability review, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

## Operational non-release status

- Not runtime/tooling integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
