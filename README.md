# Synaptic Mesh v0.1.6

Status: offline real-flow scorecard release candidate `v0.1.6`; **not runtime-ready**; **not production/canary/enforcement-ready**.

## What this is

A public review package for Synaptic Mesh / Multi-Agent Memory Authority Protocol: a protocol proposal for preserving authority/status/boundary receipts through multi-agent memory transforms.

## Compatibility / scope

Synaptic Mesh is intended to be **framework-agnostic**: the protocol idea should apply to any agent stack that retrieves, summarizes, compresses, or hands off memory-derived context.

Current v0.1.6 status is narrower:

- validated with the included local shadow workflow;
- shipped as a standalone reference package and fixture suite, not integrated with any production/runtime host;
- includes contract-shaped receiver adapter tests for Generic, LangGraph-like, AutoGen-like, CrewAI-like, Semantic Kernel-like, and MCP-like packet shapes;
- expands fail-closed coverage for duplicate authority fields, sensitive verb aliases, and receiver-observed source mismatch by digest/mtime/run-id;
- adds RouteDecision wrong-route oracle fixtures for adversarial route semantics without adding a classifier or runtime enforcement;
- adds a strict local-shadow Receipt schema fixture/evidence gate for structured receipt shape validation, not semantic proof or runtime authorization;
- adds a deterministic local benchmark/overhead harness comparing naive summary, full context, simple receipt, and AuthorityEnvelope representations without runtime integration;
- adds a deterministic adversarial fixture generator that derives variants from hand-authored wrong-route oracles while preserving expected RouteDecision routes/reasons;
- adds raw/parser adversarial fixtures for untrusted prose, folded-index mismatches, malformed receipts, free-text next-action tampering, conflicting receipts, and stale/replayed policy windows;
- adds parser normalization evidence for raw handoff examples into `parserEvidence` / route-decision input shape without classifier, runtime, or live shadow observer behavior;
- adds offline real-flow replay fixtures with gold labels, parserEvidence hash binding, scorecards, and audit logs without live traffic, automatic receiver decisions, runtime, or live shadow observer behavior;
- adds deterministic route classifier v0 for shadow-only fixture evaluation over parser evidence; it is not raw parsing, live observation, runtime enforcement, tool authorization, or production safety evidence;
- no real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters are included yet;
- real adapter work is a future track and should preserve the same runtime/non-goal boundaries.

In short: **The current proving ground is the included local shadow package; the target is a portable protocol.**

Included:

- paper draft: `paper/synaptic-mesh-paper-v0.md`
- specs: `specs/`
- docs: [`docs/reason-codes.md`](docs/reason-codes.md) and [`docs/coverage-matrix.md`](docs/coverage-matrix.md) stabilize review vocabulary and coverage status
- local shadow/reference implementation: `implementation/synaptic-mesh-shadow-v0/`
- bibliography and review artifacts: `research-package/`
- reproducibility snapshot: `evidence/`
- hardening roundup: `HARDENING_ROUNDUP.md`

## What this is not

- not production software;
- not runtime/tooling integration;
- not a safety certification;
- not an enforcement/canary/L2+ operational artifact.

## Quick local review

From this bundle root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected current result: 28/28 commands pass, fixture parity 15/15, RouteDecision schema 17/17 fixture records, threat-model route mappings 11/11, RouteDecision wrong-route fixtures 9/9, generated adversarial fixtures 9/9, raw/parser adversarial fixtures 9/9, parser normalization fixtures 24/24, real-flow replay fixtures 24/24, classifier scorecard 24/24, decision traces 24/24, Receipt schema valid/invalid fixtures 1/4, authority overhead benchmark 6 fixtures/4 modes, unsafe allow signals 0, source fixture mutation false.

For adapter-shaped contract coverage specifically:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:receiver-adapters
```

Expected current result: 59/59 cases pass, unsafe allows 0.

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

Runtime/tooling integration requires a separate explicit maintainer approval track. This package is for protocol, citation, fixture, and reference-implementation review only.
