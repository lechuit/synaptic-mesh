# Release Notes — Synaptic Mesh v0.1.7

Status: decision trace hardening release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.6

- Separated `goldDecision` from `classifierDecision`; deprecated `observedDecision` metadata and gated scorecards so they compare classifier output against gold decisions only.
- Added offline `DecisionTrace` schema/evidence with parser/input/gold/classifier hash bindings.
- Added synthetic real-flow mutation suite and category coverage thresholds to prove degraded behavior and avoid superficial route coverage.
- Kept CI scoped to the local shadow package; this release does not add runtime/framework integration, MCP/A2A integration, tool execution, memory writes, publication, or enforcement behavior.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, and authority-overhead benchmark evidence. These remain current validation artifacts, but they are not new v0.1.7 delta items.

## Validation snapshot

- review-local: pass 30/30
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

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.7 strengthens release confidence with decision traces, oracle/classifier separation, mutation degradation checks, and category coverage thresholds, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters. Real runtime adapters remain future work.

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
