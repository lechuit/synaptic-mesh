# Synaptic Mesh v0.1.10

Status: manual offline ingestion / pre-live shadow readiness release candidate `v0.1.10`; **not runtime-ready**; **not production/canary/enforcement-ready**.

## What this is

A public review package for Synaptic Mesh / Multi-Agent Memory Authority Protocol: a protocol proposal for preserving authority/status/boundary receipts through multi-agent memory transforms.

## Compatibility / scope

Synaptic Mesh is intended to be **framework-agnostic**: the protocol idea should apply to any agent stack that retrieves, summarizes, compresses, or hands off memory-derived context.

Current v0.1.10 status is narrower:

- validated with the included local shadow workflow;
- shipped as a standalone reference package and fixture suite, not integrated with any production/runtime host;
- includes contract-shaped receiver adapter tests for Generic, LangGraph-like, AutoGen-like, CrewAI-like, Semantic Kernel-like, and MCP-like packet shapes;
- includes DecisionTrace, mutation, and category threshold gates from the v0.1.7 decision-trace hardening line;
- adds a design-only passive live-shadow observer boundary: the observer may observe future decision artifacts but cannot become part of the decision path;
- adds offline `LiveShadowObservation` and `LiveShadowObservationResult` schemas, fixtures, and forbidden-effects gates;
- adds synthetic offline replay from DecisionTrace evidence into passive observation/result records; all results remain `record_only`, `no_effects`, and `local_shadow_only`;
- adds a design-only redaction/retention boundary for future observation artifacts; no redaction code or retention scheduler is implemented;
- adds aggregate-only live-shadow drift scorecard shape validation over synthetic replay evidence; it stores counts/bucket labels, not raw prompts, transcripts, secrets, tool outputs, memory/config text, approval text, or private paths;
- adds manual/offline/redacted observation bundle schemas and fixtures for pre-live-shadow handoff readiness;
- adds `RedactionReviewRecord` audit records and a manual real-handoff capture protocol before any real-redacted replay artifacts are accepted;
- adds a manually curated real-redacted handoff pack with exactly 3 reviewed/redacted cases and no persisted raw handoff content;
- adds manual bundle → parserEvidence replay, then manual DecisionTrace → LiveShadowObservation/Result replay, all offline and record-only;
- adds a real-redacted handoff replay gate that compares generated classifier decisions, `DecisionTrace`, `LiveShadowObservationResult`, and replay scorecard rows against expected pack artifacts;
- adds strict manual and real-redacted observation scorecard thresholds: zero validation failures, mismatches, false permits, false compacts, boundary loss, forbidden effects, blocking/allowing, and capability attempts;
- no live observer, live traffic/log/session reads, daemons, watchers, MCP endpoints, tool execution, memory writes, config writes, external publication, approval paths, blocking, allowing, authorization, enforcement, or production safety claims are included;
- no real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters are included yet;
- real adapter/live-observer work is a future track and requires a separate explicit maintainer decision.

In short: **The current proving ground is the included local shadow package; the target is a portable protocol.**

Included:

- paper draft: `paper/synaptic-mesh-paper-v0.md`
- specs: `specs/`
- docs: [`docs/reason-codes.md`](docs/reason-codes.md), [`docs/coverage-matrix.md`](docs/coverage-matrix.md), and live-shadow design/schema docs stabilize review vocabulary and coverage status
- local shadow/reference implementation: `implementation/synaptic-mesh-shadow-v0/`
- bibliography and review artifacts: `research-package/`
- reproducibility snapshot: `evidence/`
- hardening roundup: `HARDENING_ROUNDUP.md`

## What this is not

- not production software;
- not runtime/tooling integration;
- not live monitoring;
- not a safety certification;
- not an enforcement/canary/L2+ operational artifact.

## Quick local review

From this bundle root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected current result: 33/33 commands pass, fixture parity 15/15, RouteDecision schema 17/17 fixture records, threat-model route mappings 11/11, RouteDecision wrong-route fixtures 9/9, generated adversarial fixtures 9/9, raw/parser adversarial fixtures 9/9, parser normalization fixtures 24/24, real-flow replay fixtures 24/24, classifier scorecard 24/24, decision traces 24/24, real-flow mutations 15/15, category coverage thresholds pass, live-shadow observation schemas pass, live-shadow synthetic replay 24 observations/24 results, live-shadow drift scorecard 24 observations/24 results, manual observation bundles 2/2, manual redaction fixture pack 2 positive/8 negative, manual parserEvidence replay 2/2, manual DecisionTrace/live-shadow replay 2 traces/2 observations/2 results, manual scorecard thresholds pass, redaction review records pass, real-redacted handoff pack 3/3, real-redacted replay gate 3 traces/3 observations/3 results, zero forbidden effects/capabilities, Receipt schema valid/invalid fixtures 1/4, authority overhead benchmark 6 fixtures/4 modes, unsafe allow signals 0, source fixture mutation false.

For adapter-shaped contract coverage specifically:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:receiver-adapters
```

Expected current result: 59/59 cases pass, unsafe allows 0.

For release/package verification:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.1.10
```

## Citation/source policy

The bundle includes quote-check reports and bibliography metadata. It intentionally excludes raw downloaded source PDFs/HTML caches; reviewers should retrieve primary sources from their official URLs/DOIs if needed.

## Public review requests

The most useful feedback right now is tracked in these starter issues:

1. [Adversarial fixture requests for authority-laundering cases](https://github.com/lechuit/synaptic-mesh/issues/1)
2. [Threat model gaps and missing attack classes](https://github.com/lechuit/synaptic-mesh/issues/2)
3. [Citation and quote-check review](https://github.com/lechuit/synaptic-mesh/issues/3)
4. [Reference implementation API and receipt format feedback](https://github.com/lechuit/synaptic-mesh/issues/4)
5. [Runtime boundary and non-goals clarity review](https://github.com/lechuit/synaptic-mesh/issues/5)

## Runtime boundary

Runtime/tooling integration, live observation, config changes, permanent memory promotion, publication, canary, enforcement, production, or L2+ operational use require a separate explicit maintainer approval track. This package is for protocol, citation, fixture, and reference-implementation review only.
