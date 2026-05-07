# Release Notes — Synaptic Mesh v0.1.3

Status: baseline shadow-gates release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.2

- Added GitHub Actions baseline gates for manifest verification, syntax checks, receiver adapter contracts, local shadow review, action-policy contracts, authority route fixtures, authority-envelope fixtures, RouteDecision schema evidence, threat-model route mapping evidence, RouteDecision wrong-route oracle evidence, and Receipt schema evidence.
- Added adversarial wrong-route fixtures for memory-claim laundering, hidden promotion, stale policy windows, replayed receipts, nested authority, free-text action tampering, external prose, and ambiguous verbs.
- Kept CI scoped to the local shadow package; it does not add runtime/framework integration, MCP/A2A integration, tool execution, or enforcement behavior.
- Preserved deterministic local evidence expectations for review runs.
- Added a deterministic local authority overhead benchmark comparing naive summaries, full context, simple receipts, and AuthorityEnvelope-shaped records without live LLM/API calls or runtime integration.
- Added a deterministic adversarial fixture generator that derives variants from existing RouteDecision wrong-route oracles and preserves source expected routes/reason codes.

## Validation snapshot

- review-local: pass 22/22
- receiver adapter contracts: pass 59/59
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false
- RouteDecision schema: pass 17/17 fixture records
- Threat-model route mapping: pass 11/11 mappings, 2 explicit known gaps
- RouteDecision wrong-route oracle fixtures: pass 9/9 fixtures, no classifier/runtime semantics
- Receipt schema: pass 1 valid and 4 invalid/adversarial fixtures, shape validation only
- Authority overhead benchmark: pass 6 fixtures across 4 representation modes, fixture proxy only
- Adversarial fixture generator: pass 9/9 generated fixtures, oracle-derived expectations only

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
