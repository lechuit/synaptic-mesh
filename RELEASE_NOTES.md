# Release Notes — Synaptic Mesh v0.1.20

Status: redaction/retention executable-gate composition public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since the previous release

- Added `implementation/synaptic-mesh-shadow-v0/tests/redaction-retention-executable-gates.mjs`, a deterministic local composition gate for redaction-first / retention-second evidence checks.
- Added `implementation/synaptic-mesh-shadow-v0/fixtures/redaction-retention-executable-gates.json`, with 3 positive controls and 7 expected rejects.
- Added committed evidence at `implementation/synaptic-mesh-shadow-v0/evidence/redaction-retention-executable-gates.out.json`.
- Wired the composition gate into local `check` and `release:check` validation.
- Updated README, coverage, reason-code docs, release metadata, and manifest target to `v0.1.20`.
- Tightened release-check stale-version matching so a stale token like `v0.1.2` is not falsely detected inside `v0.1.20`.

## Conservative release statement

Adds a local executable composition gate that requires redaction to pass before retention can pass and keeps retention rejects explicit after redaction passes.
It proves only local fixture behavior over committed synthetic/metadata-only fixtures.
It does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication automation, approval paths, blocking/allowing, deletion implementation, retention scheduler, or enforcement.

## New v0.1.20 evidence

- Redaction/retention executable composition: pass.
- Pass cases: 3.
- Expected rejects: 7.
- Unexpected passes: 0.
- Unexpected rejects: 0.
- Redaction-first rejects before retention can matter: 2.
- Retention rejects after redaction passes: 5.
- Scheduler/deletion/live-observer/runtime pressure remains reject-only and local.
- Capability/boundary claims remain false: memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication automation, approval paths, blocking/allowing, deletion implementation, retention scheduler, and enforcement are not implemented.

## Composition pressure cases

The new gate keeps the composition conservative against:

- secret-like value persistence before retention can matter;
- private-path persistence before retention can matter;
- retention ceiling exceeded after redaction passes;
- missing redaction status after redaction passes;
- unknown retention class after redaction passes;
- retention scheduler or deletion implementation pressure;
- runtime or live-observer pressure.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the real-redacted handoff pack, real-redacted replay gate, real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, real-redacted positive path, real-redacted pilot, failure catalog, runbook/checklist, expanded pilot, pilot reproducibility gate, reproducibility negative controls, redaction/retention policy gates, and the decision-counterfactual checklist robustness gates. These remain current validation artifacts, but they are not new v0.1.20 delta items.

## Validation snapshot

- Redaction/retention executable composition: pass 3 positive controls, 7 expected rejects, unexpected passes 0, unexpected rejects 0.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.1.20
```

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.20 adds a local redaction/retention composition gate over committed fixtures. It does not capture live traffic, run a live observer, write memory, create MemoryAtom records, integrate adapters/tools, publish externally, authorize runtime actions, create approval paths, block actions, allow actions, schedule retention, delete files, or enforce policy.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, MemoryAtom, memory writing, tool authorization, external publication automation, approval, blocking/allowing, deletion, retention scheduling, enforcement, or operational use requires a separate explicit maintainer decision.
