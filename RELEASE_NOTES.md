# Release Notes — Synaptic Mesh v0.1.18

Status: decision-counterfactual memory retrieval checklist public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since the previous release

- Added `specs/decision-counterfactual-receiver-rule-v0.5.md`, a compact local advisory checklist for deciding when a memory-derived fragment may influence the next local action.
- Added `schemas/decision-counterfactual-checklist.schema.json` for the checklist fixture contract.
- Added 16 deterministic fixtures in `implementation/synaptic-mesh-shadow-v0/fixtures/decision-counterfactual-checklist.json`, derived from the chat-fragment ablation and live user-correction sample.
- Added `implementation/synaptic-mesh-shadow-v0/tests/decision-counterfactual-checklist.mjs`, a deterministic local gate that validates schema shape, reason-code vocabulary, negative controls, and expected decisions.
- Added evidence output at `implementation/synaptic-mesh-shadow-v0/evidence/decision-counterfactual-checklist.out.json`.
- Added `DECISION_COUNTERFACTUAL_*` reason codes to the public reason-code vocabulary.
- Updated the coverage matrix with the checklist row and its conservative scope.

## Conservative release statement

Adds a local advisory decision-counterfactual memory retrieval checklist.
It proves only local fixture behavior.
It does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement.

## New v0.1.18 evidence

- Decision-counterfactual checklist schema: pass.
- Checklist fixtures: 16/16 pass.
- Source experiment families: `chat_fragment_ablation_v0`, `live_user_correction_sample_v0`.
- Unsafe allows: 0.
- Negative controls: 8.
- Reason codes covered: 15.
- Capability/boundary claims remain false: memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication, and enforcement are not implemented.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the real-redacted handoff pack, real-redacted replay gate, real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, real-redacted positive path, real-redacted pilot, failure catalog, runbook/checklist, expanded pilot, pilot reproducibility gate, reproducibility negative controls, and redaction/retention executable gates. These remain current validation artifacts, but they are not new v0.1.18 delta items.

## Validation snapshot

- Decision-counterfactual checklist: pass 16/16, unsafe allows 0.
- Redaction policy schema/minimal scanner and retention policy/negative controls remain part of `check` and `release:check`.
- Manual dry-run CLI pilot reproducibility and reproducibility negative controls remain part of `release:check`.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.1.18
```

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.18 adds a local advisory checklist for decision-counterfactual memory retrieval. It does not capture live traffic, run a live observer, write memory, create MemoryAtom records, integrate adapters/tools, publish externally, or authorize runtime actions.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, MemoryAtom, memory writing, tool authorization, publication, approval, or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
