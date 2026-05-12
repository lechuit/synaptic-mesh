# Coverage matrix

This matrix summarizes what the current Synaptic Mesh local-shadow package covers before the current release decision. It is intentionally conservative: **covered** means a tracked deterministic gate exists; **partial** means useful evidence exists but important semantics are still outside the gate; **pending** means planned or desired but not implemented; **out of scope** means not a goal for this release line.

## Status legend

- **Covered** — deterministic fixtures/tests/evidence exercise the stated contract.
- **Partial** — covered by proxy, fixtures, or shape checks, but not by a full semantic/runtime implementation.
- **Pending** — not implemented yet.
- **Out of scope** — explicitly not part of the local-shadow review package.

## Matrix

| Risk / behavior | Contract or gate | Status | Notes |
| --- | --- | --- | --- |
| Ambiguous verbs | Action-policy contracts (`npm run test:action-policy`) | Covered | Classifies sensitive/ambiguous/local/fallback verbs and keeps unsafe allow signals out of expected cases. |
| Wrong route selection | Authority routes, threat-model routes, wrong-route oracle fixtures (`test:authority-routes`, `test:threat-model-routes`, `test:route-decision-wrong-routes`) | Covered | Deterministic expected routes/reasons are checked; no learned classifier is claimed. |
| Receipt shape | Receipt schema gate (`test:receipt-schema`) | Covered | Validates strict local-shadow receipt shape fixtures. This is shape validation, not semantic authorization. |
| RouteDecision shape | RouteDecision schema gate (`test:route-decision-schema`) | Covered | Checks route-decision records against schema vocabulary and required fields. |
| Benchmark proxy | Authority overhead benchmark (`test:authority-benchmark`) | Partial | Compares deterministic representation modes and fixture outcomes. It is not a production performance benchmark. |
| Summary-level adversarial generator | Adversarial fixture generator (`test:adversarial-generator`) | Partial | Generates variants from hand-authored wrong-route oracles while preserving expected routes/reasons; does not prove arbitrary adversarial robustness. |
| Raw parser attacks | Raw/parser adversarial gate (`test:raw-parser-adversarial`) | Partial | Covers hand-authored raw artifacts and parser-signal annotations for hostile prose/receipt-like inputs. It is not a real parser/classifier robustness proof. |
| Parser normalization evidence | Parser normalization gate (`test:parser-normalization-evidence`) | Partial | Covers hand-authored raw handoff examples normalized into `parserEvidence` and route-decision input hashes. It is not a live parser, classifier, or live shadow observer. |
| Offline real-flow replay | Real-flow replay gate (`test:real-flow-replay`) | Partial | Covers naturalistic handoff-like replay fixtures with gold labels, audit logs, scorecard metrics, hash binding to linked parser evidence, benign vs sensitive folded-index mismatch, policy/grammar refresh, block, and abstain routes. It is fixture-driven replay, not an automatic receiver decision, live traffic, a classifier, or a live shadow observer. |
| Stale receipt replay | Raw/parser adversarial gate plus wrong-route/freshness reason codes | Covered | Includes stale policy-window/replayed receipt cases with conservative fetch-source or ask-human expectations. |
| Hidden promotion | Raw/parser folded-index fixtures, generated adversarial fixtures, wrong-route oracles | Covered | Includes folded-index mismatch/hidden sensitive promotion cases. Runtime detection remains outside scope. |
| Free-text next-action tampering | Raw/parser and wrong-route fixtures | Covered | Valid receipts remain authoritative over free-text attempts to modify `nextAllowedAction`. |
| Conflicting valid receipts | Raw/parser adversarial fixtures | Covered | Multiple valid receipts with conflicting boundaries are expected to avoid compact/local promotion. |
| Source freshness / digest drift | Source freshness regression/profile tests and route fixtures | Covered | Deterministic digest/mtime/run-id drift cases are checked in local fixtures. |
| Framework adapter packet shapes | Receiver adapter contract tests (`test:receiver-adapters`) | Covered | Generic, LangGraph-like, AutoGen-like, CrewAI-like, Semantic Kernel-like, and MCP-like packet shapes are contract-shaped only; no real framework adapters are included. |
| Deterministic classifier behavior | Route classifier shadow gate (`test:route-classifier-shadow`) | Partial | Covers deterministic routing over hand-authored `parserEvidence` + `routeDecisionInput` fixtures. It is not raw parsing, live traffic, runtime enforcement, or semantic robustness proof. |
| Decision-counterfactual memory retrieval checklist | Decision-counterfactual receiver checklist (`test:decision-counterfactual-checklist`) | Covered | 16 local advisory fixtures derived from the chat-fragment ablation and live user-correction sample. Proves only local fixture behavior; no memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement. |
| Decision-counterfactual reproducibility | Checklist reproducibility gate (`test:decision-counterfactual-reproducibility`) | Covered | Runs the same 16-fixture checklist twice, normalizes output, and requires matching digest, zero unsafe allows, and the core allow tuple requirement. Local Node/evidence only; no new runtime or live capability. |
| Decision-counterfactual misuse/failure catalog | Checklist failure catalog (`test:decision-counterfactual-failure-catalog`) | Covered | 10 expected-reject pressure cases: similarity-only, recency-only, wrong lane, missing source/boundary/blocked-effects/fallback, stale authorization, unverified mutable fact, and release-success promotion. |
| Runtime enforcement | None | Out of scope | The package is review/local-shadow only; it does not authorize tools, write memory, publish, or enforce runtime policy. |
| Production/canary readiness | None | Out of scope | Release gates support public review and fixture reproducibility, not deployment readiness. |

## Reviewer focus

Reviewers should look for rows marked **partial** or **pending** before treating the package as stronger than it is. In particular, raw/parser, parser-normalization, real-flow replay, and adversarial-generator evidence should be read as fixture pressure, not as proof that unstructured malicious inputs are reliably detected in a live system.
