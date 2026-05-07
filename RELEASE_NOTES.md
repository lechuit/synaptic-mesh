# Release Notes — Synaptic Mesh v0.1.1

Status: hardening release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.0-rc1

- Added adversarial authority-laundering regression fixtures.
- Added duplicate receipt-field detection so later duplicate fields cannot launder earlier unsafe values.
- Added receiver-side checks for restrictive lineage events and sensitive `ACT` smuggling.
- Added unicode-confusable and encoded sensitive-scope regression coverage.
- Added a contract-only receiver policy adapter module.
- Added generic, LangGraph-like, and AutoGen-like packet mapping tests into the receiver-side validator.
- Clarified historical reproducibility snapshots versus current live review evidence.
- Kept runtime/framework integration explicitly out of scope.

## Validation snapshot

- review-local: pass 13/13
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.1 adds contract-shaped adapter tests for portability review, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

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
