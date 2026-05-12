# Release Notes — Synaptic Mesh v0.1.21

Status: live-input/source-boundary contracts public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since the previous release

- Added `implementation/synaptic-mesh-shadow-v0/tests/live-input-source-boundary-contracts.mjs`, a deterministic local boundary-contract gate for future live-input/source handoff candidates.
- Added `implementation/synaptic-mesh-shadow-v0/fixtures/live-input-source-boundary-contracts.json`, with 2 positive controls and 9 expected rejects.
- Added committed evidence at `implementation/synaptic-mesh-shadow-v0/evidence/live-input-source-boundary-contracts.out.json`.
- Wired the boundary-contract gate into local `check` and `release:check` validation.
- Updated README, coverage, reason-code docs, release metadata, and manifest target to `v0.1.21`.

## Conservative release statement

Adds local boundary contracts for representing future live-input/source candidates as explicit already-redacted source tuples with record-only output and complete forbidden-effect boundaries.
It proves only local fixture behavior over committed synthetic/metadata-only fixtures.
It does not add live traffic reads, raw input persistence, memory writes, MemoryAtom, runtime, live observer, daemon, watcher, adapter integration, tool authorization, external publication automation, approval paths, blocking/allowing, authorization, deletion, retention scheduler, or enforcement.

## New v0.1.21 evidence

- Live-input/source-boundary contracts: pass.
- Pass cases: 2.
- Expected rejects: 9.
- Unexpected passes: 0.
- Unexpected rejects: 0.
- Required tuple: explicit source kind, already-redacted input, source artifact id/path/digest/mtime/run id, receiver clock, record-only output, and complete forbidden-effect tuple including raw input persistence, daemon/watcher, publication automation, deletion, and retention scheduler boundaries.
- Capability/boundary claims remain false: live input read, raw input persistence, memory writes, MemoryAtom, runtime, live observer, daemon, watcher, adapter integration, tool authorization, external publication automation, approval paths, blocking/allowing, authorization, deletion, retention scheduler, and enforcement are not implemented.

## Boundary pressure cases

The new gate keeps the pre-live boundary conservative against:

- live stream/source kinds;
- raw or unredacted input boundaries;
- missing source digest;
- missing source mtime;
- non-record-only output boundary;
- incomplete forbidden-effect tuple;
- runtime or live-observer pressure;
- daemon, watcher, publication-automation, deletion, or retention-scheduler pressure.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the real-redacted handoff pack, real-redacted replay gate, real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, real-redacted positive path, real-redacted pilot, failure catalog, runbook/checklist, expanded pilot, pilot reproducibility gate, reproducibility negative controls, redaction/retention policy and composition gates, and the decision-counterfactual checklist robustness gates. These remain current validation artifacts, but they are not new v0.1.21 delta items.

## Validation snapshot

- Live-input/source-boundary contracts: pass 2 positive controls, 9 expected rejects, unexpected passes 0, unexpected rejects 0.
- Full release validation is expected through:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.1.21
```

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.21 adds local live-input/source-boundary contracts over committed already-redacted fixtures. It does not capture live traffic, persist raw input, run a live observer, start daemons/watchers, write memory, create MemoryAtom records, integrate adapters/tools, publish externally or automate publication, authorize runtime actions, create approval paths, block actions, allow actions, delete, schedule retention/deletion, or enforce policy.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, daemon/watcher, adapter, MemoryAtom, memory writing, tool authorization, external publication automation, approval, blocking/allowing, authorization, deletion, retention scheduler, enforcement, or operational use requires a separate explicit maintainer decision.
