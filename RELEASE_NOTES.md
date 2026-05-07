# Release Notes — Synaptic Mesh v0.1.5

Status: baseline shadow-gates release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.4

- Added reason-code vocabulary documentation so fixture/evidence signals can be reviewed consistently without treating reason codes as runtime authorization.
- Added a conservative coverage matrix that marks deterministic fixture gates as covered, proxy evidence as partial, classifier behavior as pending, and runtime enforcement / production readiness as out of scope.
- Added raw/parser adversarial fixture coverage for untrusted prose, hidden dangerous receipts, malformed receipts, free-text action tampering, conflicting receipts, and stale/replayed policy windows.
- Added deterministic adversarial fixture generation from existing wrong-route oracles while preserving source expected routes/reason codes.
- Added deterministic local authority-overhead benchmark evidence comparing naive summaries, full context, simple receipts, and AuthorityEnvelope-shaped records without live LLM/API calls or runtime integration.
- Removed a stale public draft artifact from the repository and refreshed manifest coverage.
- Kept CI scoped to the local shadow package; this release does not add runtime/framework integration, MCP/A2A integration, tool execution, memory writes, publication, or enforcement behavior.

## Validation snapshot

- review-local: pass 25/25
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
- Raw/parser adversarial fixtures: pass 9/9 raw fixture/parser-pressure cases, annotation validation only
- Parser normalization evidence: pass 5/5 raw handoff normalization cases, parserEvidence shape/input-hash validation only
- Offline real-flow replay: pass 5/5 naturalistic handoff replay cases, gold-label/audit-log validation only

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.5 strengthens release confidence with baseline local-shadow CI gates, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

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
