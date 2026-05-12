# Release Notes — Synaptic Mesh v0.1.19

Status: decision-counterfactual checklist robustness public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since the previous release

- Added `implementation/synaptic-mesh-shadow-v0/tests/decision-counterfactual-reproducibility.mjs`, a deterministic local reproducibility gate for the decision-counterfactual checklist.
- Added evidence output at `implementation/synaptic-mesh-shadow-v0/evidence/decision-counterfactual-reproducibility.out.json`.
- Wired the reproducibility gate into local `check` and `release:check` validation.
- Updated coverage and README references for the checklist robustness line.

## Conservative release statement

Adds robustness evidence for the local advisory decision-counterfactual memory retrieval checklist.
It proves only local fixture reproducibility over committed fixtures.
It does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement.

## New v0.1.19 evidence

- Decision-counterfactual reproducibility: pass.
- Runs: 2.
- Fixtures: 16.
- Normalized output mismatches: 0.
- Unsafe allows: 0.
- Core allow tuple required: true.
- Capability/boundary claims remain false: memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication, and enforcement are not implemented.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the real-redacted handoff pack, real-redacted replay gate, real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, real-redacted positive path, real-redacted pilot, failure catalog, runbook/checklist, expanded pilot, pilot reproducibility gate, reproducibility negative controls, redaction/retention executable gates, and the decision-counterfactual checklist. These remain current validation artifacts, but they are not new v0.1.19 delta items.

## Validation snapshot

- Decision-counterfactual checklist: pass 16/16, unsafe allows 0.
- Decision-counterfactual reproducibility: pass 2 runs, normalized output mismatches 0, unsafe allows 0.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.1.19
```

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.19 adds local reproducibility evidence for the decision-counterfactual checklist. It does not capture live traffic, run a live observer, write memory, create MemoryAtom records, integrate adapters/tools, publish externally, or authorize runtime actions.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, MemoryAtom, memory writing, tool authorization, publication, approval, or operational use requires a separate explicit maintainer decision.
