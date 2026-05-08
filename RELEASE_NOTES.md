# Release Notes — Synaptic Mesh v0.1.11

Status: real-redacted adversarial coverage / offline replay gate release candidate / public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.10

- Added a follow-on real-redacted adversarial coverage pack with exactly 6 manually reviewed metadata-only/control-message cases.
- Covered non-happy-path replay routes: `request_full_receipt`, `request_policy_refresh`, `ask_human`, and `block`.
- Added a dedicated `real-redacted-adversarial-coverage` gate and wired it into `review:local`.
- Hardened the new gate after process review: it now recomputes/asserts `goldDecisionHash`, `classifierDecisionHash`, classifier reason/decisive/rejected-route alignment, observation-to-trace/classifier/input bindings, and result-to-observation/policy bindings.
- Kept the boundary conservative: manually curated redacted metadata/control-message replay fixtures only; no live observer, live traffic/log/session reads, daemon, watcher, adapter/MCP/A2A integration, tool execution, memory/config writes, external publication beyond the repo release flow, approval path, blocking, allowing, authorization, or enforcement.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, redaction/retention design boundaries, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the initial 3-case real-redacted handoff pack, and the real-redacted handoff replay gate. These remain current validation artifacts, but they are not new v0.1.11 delta items.

## Validation snapshot

- review-local: pass 34/34
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
- Manual observation bundle schema: pass 2/2 bundles, validation errors 0, negative controls 14, human review required, raw content persisted false, forbidden effects 0
- Manual observation redaction fixture pack: pass 2 positive / 8 negative synthetic cases, redactionFailures 0, raw/private/secret/tool/memory/config/approval persistence false, capabilityAttempts 0, forbiddenEffects 0
- Manual bundle parserEvidence replay: pass 2/2 replay rows, parserEvidenceValidCount 2, validation errors 0, routeDecisionInputHashBound true, classifierDecisionComputed false, decisionTraceGenerated false
- Manual DecisionTrace/live-shadow replay: pass 2 traces → 2 observations + 2 results, validation errors 0, mismatch 0, falsePermit 0, falseCompact 0, boundaryLoss 0, forbiddenEffectsDetected 0, mayBlock/mayAllow/capabilityTrue 0
- Manual observation scorecard thresholds: pass, thresholdFailureCount 0, validationErrorCount 0, rawContentPersisted false, redactedMetadataOnly true, capabilityAttempts 0, forbiddenEffects 0
- RedactionReviewRecord schema: pass 2/2 base records, validation errors 0, negative controls 19, raw/private/secret/tool/memory/config/approval persistence false, forbidden for live observation/runtime use true
- Real-redacted handoff pack: pass 3/3 manually curated real-redacted bundles, 3 redaction review records, 3 scorecard rows, validation errors 0, mismatch 0, raw/private/secret/tool/memory/config/approval persistence false, forbidden effects 0, mayBlock 0, mayAllow 0, capability attempts 0
- Real-redacted handoff replay gate: pass 3 traces → 3 observations + 3 record-only results, validation errors 0, mismatch 0, falsePermit 0, falseCompact 0, boundaryLoss 0, forbidden effects detected 0, mayBlock 0, mayAllow 0, capabilityTrue 0
- Real-redacted adversarial coverage: pass 6 manually reviewed metadata/control cases, route counts `request_full_receipt: 1`, `request_policy_refresh: 1`, `ask_human: 3`, `block: 1`, validation errors 0, falsePermit 0, falseCompact 0, boundaryLoss 0, forbidden effects detected 0, mayBlock 0, mayAllow 0, capabilityTrue 0

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.11 strengthens release confidence around real-redacted adversarial handoff coverage in an offline replay setting before any live observer exists, but does not ship real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, runtime host adapters, live observers, daemons, watchers, retention schedulers, authorization paths, or enforcement hooks. Real runtime/live-observer work remains future work and requires a separate explicit maintainer decision.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, retention, authorization, or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
