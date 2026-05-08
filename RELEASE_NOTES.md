# Release Notes — Synaptic Mesh v0.1.8

Status: live-shadow contract hardening release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.7

- Added a design-only passive live-shadow observer boundary: future observers may record audit artifacts but must not become part of the decision path.
- Added offline `LiveShadowObservation` and `LiveShadowObservationResult` schemas/fixtures with forbidden-effects gates and negative controls.
- Added synthetic offline replay from DecisionTrace evidence into passive live-shadow observation/result records; all outputs remain `record_only`, `no_effects`, and `local_shadow_only`.
- Added a design-only redaction/retention boundary for future live-shadow artifacts: raw prompts, transcripts, secrets, tool outputs, memory/config text, approval text, and private paths are redacted/refused by design.
- Added aggregate-only live-shadow drift scorecard shape validation over synthetic replay evidence, with zero tolerated forbidden effects, capability attempts, raw content persistence, redaction implementation, retention scheduler, or enforcement.
- Kept CI scoped to the local shadow package; this release does not add runtime/framework integration, live observer implementation, MCP/A2A integration, tool execution, memory writes, config writes, publication, approval paths, blocking/allowing, or enforcement behavior.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, and category coverage thresholds. These remain current validation artifacts, but they are not new v0.1.8 delta items.

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
- Offline real-flow replay: pass 24/24 naturalistic handoff replay cases, gold-decision/audit-log validation only, hash-bound to linked parser evidence
- Deterministic route classifier shadow gate: pass 24/24 parser-evidence fixture decisions plus 24/24 real-flow scorecard, falsePermit 0, falseCompact 0, includes inconsistent sensitive-summary negative control, no runtime/live observer/tool authorization
- DecisionTrace schema/evidence: pass 24/24 traces, matchedGold 24, mismatch 0, falsePermit 0, falseCompact 0, boundaryLoss 0
- Real-flow mutation suite: pass 15/15 unique mutations, nonDegraded 0, falsePermit 0, falseCompact 0
- Category coverage thresholds: pass, thresholdFailures 0
- LiveShadowObservation schema: pass 2/2 observation fixtures plus negative controls; no observer/live traffic/daemon/adapter/tool/memory/config/publication/blocking/approval implementation
- LiveShadowObservationResult schema: pass 2/2 result fixtures plus negative controls; all operational `may*` fields forced false
- Live-shadow forbidden-effects gate: pass, violations 0
- Synthetic live-shadow replay: pass 24 traces → 24 observations + 24 results, 48 valid records, forbidden effects 0, mayBlock/mayAllow/capabilityTrue 0
- Live-shadow drift scorecard shape: pass 24 observations/24 results, validation errors 0, forbidden effects 0, capability attempts 0, capabilityTrue 0, rawContentPersisted false, redactionImplementationAdded false, retentionSchedulerImplemented false

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.8 strengthens release confidence with passive live-shadow contracts, synthetic replay, redaction/retention design boundaries, and aggregate drift scorecard shape checks, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, runtime host adapters, live observers, daemons, watchers, retention schedulers, or enforcement hooks. Real runtime/live-observer work remains future work.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, retention, or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
