# Release Notes — Synaptic Mesh v0.1.6

Status: real-flow scorecard release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.5

- Added reason-code vocabulary documentation so fixture/evidence signals can be reviewed consistently without treating reason codes as runtime authorization.
- Added a conservative coverage matrix that marks deterministic fixture gates as covered, proxy evidence as partial, deterministic classifier shadow behavior as partial, and runtime enforcement / production readiness as out of scope.
- Added raw/parser adversarial fixture coverage for untrusted prose, hidden dangerous receipts, malformed receipts, free-text action tampering, conflicting receipts, and stale/replayed policy windows.
- Added deterministic adversarial fixture generation from existing wrong-route oracles while preserving source expected routes/reason codes.
- Added deterministic local authority-overhead benchmark evidence comparing naive summaries, full context, simple receipts, and AuthorityEnvelope-shaped records without live LLM/API calls or runtime integration.
- Expanded offline real-flow replay from 13 to 24 cases and added a classifier-vs-gold scorecard; `observedDecision` is deprecated metadata and scorecards compare `classifierDecision` against `goldDecision`.
- Kept CI scoped to the local shadow package; this release does not add runtime/framework integration, MCP/A2A integration, tool execution, memory writes, publication, or enforcement behavior.

## Validation snapshot

- review-local: pass 27/27
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
- Parser normalization evidence: pass 24/24 raw handoff normalization cases, parserEvidence shape/input-hash validation only
- Offline real-flow replay: pass 24/24 naturalistic handoff replay cases, gold-label/audit-log validation only, hash-bound to linked parser evidence
- Deterministic route classifier shadow gate: pass 24/24 parser-evidence fixture decisions plus 24/24 real-flow scorecard, falsePermit 0, falseCompact 0, includes inconsistent sensitive-summary negative control, no runtime/live observer/tool authorization

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.6 strengthens release confidence with 24-case offline real-flow replay and classifier scorecard gates, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

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
