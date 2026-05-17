# Status snapshot — Synaptic Mesh v0.2.3

This page preserves the full public-review status snapshot for `v0.2.3`. The root README is intentionally shorter for first-pass reviewers.


Status: passive canary source-boundary stress public review release `v0.2.3`; **manual, local, opt-in, record-only, no effects**; **not runtime-ready**; **not production/enforcement-ready**.

## What this is

A public review package for Synaptic Mesh / Multi-Agent Memory Authority Protocol: a protocol proposal for preserving authority/status/boundary receipts through multi-agent memory transforms.

## Compatibility / scope

Synaptic Mesh is intended to be **framework-agnostic**: the protocol idea should apply to any agent stack that retrieves, summarizes, compresses, or hands off memory-derived context.

Current v0.2.3 status is narrower:

- validated with the included local shadow workflow;
- shipped as a standalone reference package and fixture suite, not integrated with any production/runtime host;
- includes contract-shaped receiver adapter tests for Generic, LangGraph-like, AutoGen-like, CrewAI-like, Semantic Kernel-like, and MCP-like packet shapes;
- includes DecisionTrace, mutation, and category threshold gates from the v0.1.7 decision-trace hardening line;
- adds a design-only passive live-shadow observer boundary: the observer may observe future decision artifacts but cannot become part of the decision path;
- adds offline `LiveShadowObservation` and `LiveShadowObservationResult` schemas, fixtures, and forbidden-effects gates;
- adds synthetic offline replay from DecisionTrace evidence into passive observation/result records; all results remain `record_only`, `no_effects`, and `local_shadow_only`;
- adds a local advisory decision-counterfactual memory retrieval checklist with 16 deterministic fixtures, schema validation, evidence output, and reason codes; this proves only local fixture behavior and does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement;
- adds a reproducibility gate for the decision-counterfactual checklist: two normalized runs over the same 16 fixtures must produce the same digest, zero unsafe allows, and preserve the core allow tuple requirement;
- adds a failure catalog for decision-counterfactual misuse pressure: 10 expected rejects covering similarity-only, recency-only, wrong-lane, missing tuple slots, stale authorization, unverified mutable facts, and release-success promotion;
- adds a short reviewer guide for evaluating retrieved-memory fragments before they influence local advisory decisions;
- adds executable local redaction gates for committed fixture evidence: redaction policy schema, minimal redaction scanner, and pass-output contract for metadata-only cases;
- adds executable retention metadata gates: retention policy schema and negative controls for zero-day raw input, retention ceilings, unknown retention classes, raw persistence, missing redaction status, non-aggregate scorecards, non-synthetic public evidence, scheduler/deletion/live-observer/runtime attempts; no deletion or retention scheduler is implemented;
- adds an executable redaction/retention composition gate over committed fixtures: redaction must pass before retention can pass, retention ceilings/status/classes remain enforced after redaction passes, and scheduler/deletion/live-observer/runtime pressure remains reject-only;
- adds live-input/source-boundary contracts over committed already-redacted fixtures: future live/input candidates must be represented as explicit source tuples with already-redacted input, record-only output, complete forbidden-effect tuple including raw input persistence, daemon/watcher, publication automation, deletion, and retention-scheduler boundaries, and no live observer/runtime/daemon/watcher/publication-automation/deletion/retention-scheduler path;
- carries the `v0.1.22` passive live-shadow simulator layer: committed offline DecisionTrace evidence is mapped into live-shaped passive observation/result records without reading live traffic or implementing a live observer;
- preserves the first passive live-shadow canary contract: manual, local, opt-in, already-redacted canary packets only, record-only local evidence, no effects, and explicit rejects for missing opt-in, live stream sources, raw input, runtime/daemon pressure, allowing/authorization pressure, and memory/config/publication effects;
- adds the `v0.2.1` passive canary reproducibility gate: the same canary packet must produce the same normalized output, reason set, scorecard, and boundary verdict across two runs before any move toward more live-shaped operation;
- adds the passive canary operator runbook for human review of canary packets, opt-in, record-only artifacts, pass/non-pass meaning, and abort conditions;
- adds the `v0.2.3` passive canary source-boundary stress gate: malformed source tuples, stale digest evidence, missing source mtime, wrong source lane, and output containment escape pressure fail closed as record-only local evidence;
- adds aggregate-only live-shadow drift scorecard shape validation over synthetic replay evidence; it stores counts/bucket labels, not raw prompts, transcripts, secrets, tool outputs, memory/config text, approval text, or private paths;
- adds manual/offline/redacted observation bundle schemas and fixtures for pre-live-shadow handoff readiness;
- adds `RedactionReviewRecord` audit records and a manual real-handoff capture protocol before any real-redacted replay artifacts are accepted;
- adds a manually curated real-redacted handoff pack with exactly 3 reviewed/redacted cases and no persisted raw handoff content;
- adds manual bundle → parserEvidence replay, then manual DecisionTrace → LiveShadowObservation/Result replay, all offline and record-only;
- adds a real-redacted handoff replay gate that compares generated classifier decisions, `DecisionTrace`, `LiveShadowObservationResult`, and replay scorecard rows against expected pack artifacts;
- adds a follow-on real-redacted adversarial coverage gate with six reviewed metadata-only/control-message cases covering `request_full_receipt`, `request_policy_refresh`, `ask_human`, and `block` while remaining record-only/no-effects;
- adds a minimal manual dry-run CLI for explicit local already-redacted bundle files, evidence output under the package evidence directory only, and record-only results;
- adds CLI negative controls for forbidden flags/claims, symlink output containment, symlinked parent containment, and outside-evidence directory side effects;
- adds a CLI positive path over exactly 3 manually reviewed real-redacted handoffs, all record-only with zero forbidden effects, zero capability true counts, zero false permits, zero false compacts, and zero boundary loss;
- adds a six-case real-redacted manual dry-run pilot over internal release-handoff metadata only, including valid approvals, failed-review retry decisions, and release-publication boundary status; all outputs remain record-only with zero forbidden effects, zero capability true counts, zero false permits, zero false compacts, and zero boundary loss;
- adds a manual dry-run pilot failure catalog with 14 explicit reject-only misuse cases; rejected cases write local reject evidence only and do not write success evidence, normal DecisionTrace, normal LiveShadowObservationResult, or scorecard success rows;
- expands the real-redacted manual dry-run pilot to 12 already-redacted metadata/control-message handoff cases with one redaction review record per case and all outputs record-only with zero forbidden effects, capability true counts, false permits, false compacts, boundary loss, or raw/private/secret/tool/memory/config/approval persistence;
- adds a manual dry-run pilot reproducibility gate over the 12-case expanded pilot: two fresh CLI runs per case match each other and the committed canonical evidence with zero normalized output mismatches, zero DecisionTrace hash mismatches, zero scorecard mismatches, zero committed evidence mismatches, and zero input mutations;
- adds reproducibility negative controls that intentionally perturb normalized output, committed evidence, DecisionTrace hashes, scorecard rows, input mutation state, forbidden effects, capability flags, and boundary-loss state; all 8/8 controls reject with expected reason codes;
- adds strict manual and real-redacted observation scorecard thresholds: zero validation failures, mismatches, false permits, false compacts, boundary loss, forbidden effects, blocking/allowing, and capability attempts;
- no live observer, live traffic/log/session reads, daemons, watchers, MCP endpoints, tool execution, memory writes, config writes, external publication, automatic agent consumption, approval paths, blocking, allowing, authorization, enforcement, or production safety claims are included;
- no real LangGraph, AutoGen, CrewAI, Semantic Kernel, MCP, or runtime host adapters are included yet;
- real adapter/live-observer work is a future track and requires a separate explicit maintainer decision.

In short: **The current proving ground is the included local shadow package; the target is a portable protocol.**

Included:

- paper draft: `paper/aletheia-paper-v0.md`
- specs: `specs/`
- docs: [`reason-codes.md`](reason-codes.md), [`coverage-matrix.md`](coverage-matrix.md), and live-shadow design/schema docs stabilize review vocabulary and coverage status
- local shadow/reference implementation: `implementation/synaptic-mesh-shadow-v0/`
- bibliography and review artifacts: `research-package/`
- reproducibility snapshot: `evidence/`
- hardening roundup: `HARDENING_ROUNDUP.md`

## What this is not

- not production software;
- not runtime/tooling integration;
- not live monitoring;
- not a safety certification;
- not an autonomous/live/runtime canary, enforcement artifact, or L2+ operational artifact.

## Quick local review

From this bundle root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected current result: 35/35 commands pass, fixture parity 15/15, RouteDecision schema 17/17 fixture records, threat-model route mappings 11/11, RouteDecision wrong-route fixtures 9/9, generated adversarial fixtures 9/9, raw/parser adversarial fixtures 9/9, parser normalization fixtures 24/24, real-flow replay fixtures 24/24, classifier scorecard 24/24, decision traces 24/24, real-flow mutations 15/15, category coverage thresholds pass, live-shadow observation schemas pass, live-shadow synthetic replay 24 observations/24 results, live-shadow drift scorecard 24 observations/24 results, manual observation bundles 2/2, manual redaction fixture pack 2 positive/8 negative, decision-counterfactual checklist 16/16 with unsafe allows 0, reproducibility gate 2/2 with normalized mismatches 0, failure catalog 10/10 expected rejects, redaction policy schema/minimal scanner, retention policy schema/negative controls, redaction/retention composition gate, live-input/source-boundary contracts, manual parserEvidence replay 2/2, manual DecisionTrace/live-shadow replay 2 traces/2 observations/2 results, manual scorecard thresholds pass, redaction review records pass, real-redacted handoff pack 3/3, real-redacted replay gate 3 traces/3 observations/3 results, real-redacted adversarial coverage 6 cases with routes request_full_receipt/request_policy_refresh/ask_human/block, manual dry-run contracts 2 commands/2 results with 21 command negative controls and 39 result negative controls, manual dry-run CLI skeleton/negative controls/3 real-redacted positive handoffs/6-case real-redacted pilot/14-case failure catalog/12-case expanded pilot plus pilot reproducibility gate/reproducibility negative controls all pass with zero forbidden effects/capabilities, passive live-shadow canary 2 pass/8 reject controls, canary reproducibility 2 runs with normalized output/scorecard mismatches 0, canary source-boundary stress 1 pass/5 reject controls with malformed tuple/stale digest/missing mtime/wrong lane/output containment rejects, Receipt schema valid/invalid fixtures 1/4, authority overhead benchmark 6 fixtures/4 modes, unsafe allow signals 0, source fixture mutation false.

For adapter-shaped contract coverage specifically:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:receiver-adapters
```

Expected current result: 59/59 cases pass, unsafe allows 0.

For release/package verification:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.3
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

Runtime/tooling integration, live observation, config changes, permanent memory promotion, publication, automatic agent consumption, autonomous/live/runtime canary, enforcement, production, or L2+ operational use require a separate explicit maintainer approval track. This package is for protocol, citation, fixture, and reference-implementation review only.
