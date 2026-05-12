# Release Notes — Synaptic Mesh v0.2.0-alpha

Status: first passive live-shadow canary alpha. Manual, local, opt-in, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Release ladder

- `v0.1.18` — decision-counterfactual memory retrieval checklist.
- `v0.1.19` — checklist robustness: reproducibility, failure catalog, reviewer guide.
- `v0.1.20` — executable redaction/retention gates before live-shaped work.
- `v0.1.21` — live input/source boundary contracts.
- `v0.1.22` — passive live-shadow simulator: simulate live-shaped observation/result flow without reading live traffic.
- `v0.2.0-alpha` — first passive live-shadow canary: manual, local, opt-in, record-only, no effects.

See `docs/release-ladder-v0.2-alpha.md`.

## Highlights since v0.1.21

- Added `implementation/synaptic-mesh-shadow-v0/fixtures/passive-live-shadow-canary.json`, a canary contract with 2 allowed manual opt-in controls and 8 reject controls.
- Added `implementation/synaptic-mesh-shadow-v0/tests/passive-live-shadow-canary.mjs`, an executable gate for the alpha canary boundary.
- Added committed evidence at `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary.out.json`.
- Wired the canary gate into local `check` and `release:check` validation.
- Updated release metadata/docs/manifest target to `v0.2.0-alpha` and documented the `v0.1.22` simulator layer separately from the alpha canary layer.

## Conservative release statement

`v0.2.0-alpha` proves only local fixture behavior for a first passive live-shadow canary contract. The canary is manual, local, opt-in, record-only, and no-effects. It consumes only already-redacted local canary packets and writes only local evidence records.

It does not read live traffic, persist raw input, start a daemon/watcher, integrate runtime/adapters, execute tools, write memory/config, publish externally, enter approval paths, block, allow, authorize, delete, schedule retention/deletion, or enforce policy.

## New v0.2.0-alpha evidence

- Passive live-shadow canary: pass.
- Pass cases: 2.
- Reject cases: 8.
- Unexpected accepts: 0.
- Unexpected rejects: 0.
- Passing capability-true count: 0.
- Required tuple: explicit opt-in, manual redacted canary packet source, source artifact id/path/digest/mtime, receiver time, already-redacted input, record-only local evidence output, passive observer mode, and no-effects boundary.
- Reject coverage includes missing opt-in, live stream source, explicit live-traffic-read pressure, raw input/raw persistence, runtime/daemon pressure, allowing/authorization pressure, memory/config/publication effects, publication automation, and agent-instruction modification.

## v0.1.22 simulator layer carried into this alpha

The alpha carries forward the passive live-shadow simulator gate:

- `test:live-shadow-synthetic-replay` maps committed offline `DecisionTrace` evidence into passive `LiveShadowObservation`/`LiveShadowObservationResult` records.
- It does not read live traffic or implement a live observer.
- All synthetic replay results remain record-only, local-shadow-only, and no-effects.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, real-redacted handoff gates, manual dry-run gates, pilot reproducibility gates, redaction/retention gates, decision-counterfactual checklist robustness gates, and live-input/source-boundary contracts. These remain current validation artifacts, but the new alpha delta is the manual opt-in canary contract and gate.

## Validation snapshot

- Passive live-shadow canary: pass 2 positive controls, 8 expected rejects, unexpected accepts 0, unexpected rejects 0.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.0-alpha
```

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. `v0.2.0-alpha` adds a first manual/local/opt-in passive canary contract over already-redacted local packets. It does not capture live traffic, persist raw input, run a live daemon, start watchers, write memory, create MemoryAtom records, integrate adapters/tools, publish externally or automate publication, authorize runtime actions, create approval paths, block actions, allow actions, delete, schedule retention/deletion, or enforce policy.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
