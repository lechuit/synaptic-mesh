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
- one-command local review evidence.

Current local gates observed in `evidence/review-local.out.json`:

- review-local verdict: `pass`;
- commands: `11/11` passing;
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
npm run test:compression
npm run review:local
```

Primary commands requested for reviewer quickstart:

```bash
npm run review:local
npm run test:receipt
npm run test:transform
npm run test:cli
npm run test:handoff
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

## Evidence files

Local evidence outputs are written under:

```text
implementation/synaptic-mesh-shadow-v0/evidence/
```

Key files:

- `review-local.out.json` — one-command local review summary;
- `receipt-parser-validator.out.json` — parser/validator cases;
- `receipt-transform-regression.out.json` — transform regression cases;
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
