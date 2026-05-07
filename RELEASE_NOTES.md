# Release Notes — Synaptic Mesh v0.1.3

Status: baseline shadow-gates release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.2

- Added GitHub Actions baseline gates for manifest verification, syntax checks, receiver adapter contracts, local shadow review, action-policy contracts, authority route fixtures, authority-envelope fixtures, and RouteDecision schema evidence.
- Kept CI scoped to the local shadow package; it does not add runtime/framework integration, MCP/A2A integration, tool execution, or enforcement behavior.
- Preserved deterministic local evidence expectations for review runs.

## Validation snapshot

- review-local: pass 18/18
- receiver adapter contracts: pass 59/59
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false
- RouteDecision schema: pass 17/17 fixture records

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.3 strengthens release confidence with baseline local-shadow CI gates, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

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
