# Synaptic Mesh Shadow v0

Status: **local shadow/reference only**.

This package is a minimum functional reference for Synaptic Mesh / Multi-Agent Memory Authority Protocol handoff receipts. It was validated in a local research workflow, but it is standalone and is not integrated with any production/runtime host. It exists so reviewers can inspect receipt parsing, validation, transform regression, CLI behavior, synthetic handoff examples, and local evidence gates without confusing the work for runtime enforcement.

## Boundary

This package is:

- a local research/reference artifact;
- a shadow-only validator/checklist harness;
- safe to run as local tests that write local evidence files under `implementation/synaptic-mesh-shadow-v0/evidence/`.

This package is **not**:

- production/runtime tooling integration;
- production/runtime config;
- durable/permanent memory;
- canary, production, or enforcement;
- an approval system for sensitive actions;
- permission to send externally beyond this public repository, delete, change config, or promote memory.

Any L2+ operational/runtime use requires separate explicit maintainer approval.

## What it checks

The reference currently covers:

- receipt parser/validator behavior;
- receipt transform regression;
- local CLI validation;
- synthetic handoff examples;
- fixture parity over the canonical local fixture set;
- normalized fixture summary output;
- RouteDecision schema, threat-model mapping, wrong-route oracle fixture evidence, generated adversarial fixture variants, raw/parser adversarial fixture pressure, parser normalization evidence across all canonical routes, offline real-flow replay evidence, deterministic route classifier shadow evidence, decision-counterfactual checklist fixtures, live-shadow shape/replay gates, manual offline observation ingestion readiness gates, and manual dry-run CLI gates over explicit already-redacted local files;
- deterministic local benchmark/overhead evidence comparing representation strategies (fixture proxy only, no live LLM/API calls);
- one-command local review evidence.

Current local gates observed in `evidence/review-local.out.json`:

- review-local verdict: `pass`;
- commands: `40/40` passing;
- fixture parity: `15/15` passing;
- normalized summary fixtures: `15`;
- unsafe allow signals: `0`;
- source fixture mutation: `false`.

## Quickstart

From the repository/workspace root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Equivalent from this package directory:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run review:local
```

The review runner writes/refreshes:

```text
implementation/synaptic-mesh-shadow-v0/evidence/review-local.out.json
```

## Individual local gates

From `implementation/synaptic-mesh-shadow-v0/`:

```bash
npm run check
npm run smoke
npm run test:receipt
npm run test:transform
npm run test:cli
npm run test:handoff
npm run test:decision-counterfactual-checklist
npm run test:decision-counterfactual-reproducibility
npm run test:decision-counterfactual-failure-catalog
npm run test:passive-live-shadow-canary-source-boundary-stress
npm run test:compression
npm run test:receipt-schema
npm run test:adversarial-generator
npm run test:raw-parser-adversarial
npm run test:parser-normalization-evidence
npm run test:real-flow-replay
npm run test:real-flow-classifier-scorecard
npm run review:local
```


Manual dry-run CLI gates:

```bash
npm run test:manual-dry-run-cli
npm run test:manual-dry-run-cli-negative-controls
npm run test:manual-dry-run-cli-real-redacted-handoffs
npm run test:manual-dry-run-cli-real-redacted-pilot
```

Primary commands requested for reviewer quickstart:

```bash
npm run review:local
npm run test:receipt
npm run test:transform
npm run test:cli
npm run test:handoff
npm run test:decision-counterfactual-checklist
npm run test:decision-counterfactual-reproducibility
npm run test:decision-counterfactual-failure-catalog
```

## CLI usage

The local CLI validates compact authority receipts against an intended action and a source identity.

Help:

```bash
node bin/validate-receipt.mjs --help
```

Synthetic example receipts live at:

```text
examples/synthetic-handoff-receipts.json
```

The CLI/test suite exercises these classes of outcomes:

- `allow_local_shadow` for current, source-matched, low-risk local shadow actions;
- `fetch_abstain` for missing digest/source mismatch/freshness problems;
- `ask_human` for sensitive or unknown actions such as publication;
- no unsafe allow for spoofed, incomplete, stale, or sensitive receipts.

Run the CLI validator regression:

```bash
npm run test:cli
```

## Receiver policy adapter contract

The local reference includes a contract-only adapter module, `src/receiver-policy-adapter.mjs`, that maps framework-shaped packets into the same receiver-side receipt validation call. Current tests include generic, LangGraph-like, and AutoGen-like packet shapes. This is **not** a real framework adapter or runtime integration; it is a portability contract for review.

## Evidence files

Local evidence outputs are written under:

```text
implementation/synaptic-mesh-shadow-v0/evidence/
```

Key files:

- `review-local.out.json` — one-command local review summary;
- `receipt-transform-regression.out.json` — transform regression cases;
- `authority-laundering-regression.out.json` — adversarial laundering regression cases;
- `route-decision-schema.out.json` — RouteDecision schema shape-validation evidence;
- `receipt-schema.out.json` — strict local-shadow structured Receipt schema shape-validation evidence; not semantic proof or runtime authorization;
- `authority-overhead-benchmark.out.json` — deterministic local fixture proxy benchmark comparing naive summary, full context, simple receipt, and AuthorityEnvelope representations; not a production benchmark;
- `threat-model-routes.out.json` — threat-model actor/capability to expected route mapping evidence;
- `route-decision-wrong-routes.out.json` — adversarial wrong-route oracle fixture evidence; not a classifier or runtime semantic parser;
- `adversarial-fixture-generator.out.json` — deterministic generated variants derived from source wrong-route oracles; not semantic proof or replacement oracles;
- `raw-parser-adversarial.out.json` — raw/prose/receipt parser-pressure fixture evidence; not semantic parser robustness proof or runtime authorization;
- `parser-normalization-evidence.out.json` — raw handoff to `parserEvidence` / route-decision input fixture evidence; not a classifier, live parser, runtime authorization, or live shadow observer;
- `real-flow-replay.out.json` — naturalistic handoff replay evidence with gold labels, parserEvidence hash binding, scorecard, and audit log; not live traffic, an automatic receiver decision, runtime authorization, or live shadow observer;
- `real-flow-classifier-scorecard.out.json` — compares deterministic `classifierDecision` output against 24 offline real-flow `goldDecision` records; deprecated `observedDecision` metadata is not consumed;
- `decision-trace-schema.out.json` — validates 24 offline `DecisionTrace` records with parser/input/gold/classifier hash bindings; not a live observer, runtime gate, or authorization layer;
- `real-flow-mutation-suite.out.json` — validates synthetic degradation mutations derived from clean real-flow cases; not live traffic or runtime enforcement;
- `category-coverage-thresholds.out.json` — enforces offline route/category/mutation coverage thresholds and records next target of 30 real-flow cases; not a runtime readiness claim;
- `manual-observation-bundle-schema.out.json` — validates manual/offline/redacted observation bundle shape; not live capture, runtime authorization, or monitoring;
- `manual-observation-redaction-fixtures.out.json` — validates positive redacted fixtures and synthetic negative leakage labels; not redaction implementation;
- `manual-bundle-parser-evidence-replay.out.json` — replays accepted manual bundles into parserEvidence shape with routeDecisionInput hash binding; not a classifier or runtime parser;
- `manual-decisiontrace-live-shadow-replay.out.json` — replays manual parserEvidence rows into offline DecisionTrace and record-only LiveShadowObservation/Result records; not a live observer;
- `manual-observation-scorecard-thresholds.out.json` — aggregates manual replay counters with zero-tolerance thresholds; not monitoring, authorization, or enforcement;
- `redaction-review-record-schema.out.json` — validates human redaction review records and negative controls; not a redaction implementation or runtime approval path;
- `real-redacted-handoff-pack.out.json` — validates 3 manually curated real-redacted handoff fixtures and expected artifacts; raw handoff content is not persisted;
- `real-redacted-handoff-replay-gate.out.json` — replays the real-redacted pack through parser/classifier/DecisionTrace/LiveShadowObservationResult and scorecard comparisons; offline record-only evidence, not a live observer;
- `real-redacted-adversarial-coverage.out.json` — validates six manually reviewed real-redacted/control-message metadata cases across request_full_receipt/request_policy_refresh/ask_human/block routes; offline record-only evidence, not a live observer or runtime gate;
- `manual-dry-run-cli.out.json` — validates the minimal manual dry-run CLI skeleton over one explicit redacted local input;
- `manual-dry-run-cli-negative-controls.out.json` — validates forbidden flags/claims and output containment negative controls;
- `manual-dry-run-cli-real-redacted-handoffs.out.json` — runs the manual dry-run CLI over exactly 3 explicit real-redacted handoffs, record-only with zero forbidden effects/capabilities/boundary loss;
- `manual-dry-run-cli-real-redacted-pilot.out.json` — runs a six-case manually reviewed real-redacted pilot over internal release-handoff metadata only; record-only with zero forbidden effects/capabilities/boundary loss;
- `route-classifier-shadow.out.json` — deterministic route classifier shadow evidence over parserEvidence fixtures; not raw parsing, live observation, runtime enforcement, tool authorization, or publication readiness;
- `receiver-policy-adapter-contracts.out.json` — framework-shaped receiver adapter contract cases;
- `cli-validator.out.json` — CLI behavior cases;
- `synthetic-handoff-examples.out.json` — synthetic handoff cases;
- `partial-receipt-degrade.out.json` — partial receipt fail-closed behavior;
- `fixture-parity.out.json` — canonical fixture parity;
- `normalized-fixture-summary.out.json` — normalized summary over fixtures.

## Research package links

Related local research package artifacts:

- `research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md`
- `research-package/T-synaptic-mesh-local-cli-validator-v0.md`
- `research-package/T-synaptic-mesh-synthetic-handoff-examples-v0.md`
- `research-package/T-synaptic-mesh-review-local-runner-v0.md`
- `research-package/T-synaptic-mesh-readme-boundary-quickstart-v0.md`
- `research-package/T-synaptic-mesh-partial-receipt-degrade-gracefully-v0.md`
- `research-package/synaptic-mesh-index-v0.md`

## Publication and runtime status

Publication status: **public release candidate**. Current validation is a local shadow workflow only; runtime/tooling integration remains out of scope and requires separate maintainer approval.

Runtime status: **not approved / not runtime-ready**. This local reference does not integrate with production/runtime tools, config, scheduled jobs, memory plugins, or external messaging.

Reviewer interpretation: a passing local review means the reference package is reproducible locally. It does **not** mean the protocol is safe for operational authority, enforcement, production, or autonomous sensitive actions.
