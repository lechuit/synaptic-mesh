# Release Notes — Synaptic Mesh v0.1.16

Status: manual dry-run pilot reproducibility public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.15

- Added a manual dry-run pilot reproducibility gate over the 12-case expanded real-redacted pilot.
- The gate runs each already-redacted pilot input twice, compares the two fresh outputs, and compares the fresh output against committed canonical evidence.
- The gate verifies zero return/write mismatches, zero normalized output mismatches, zero DecisionTrace hash mismatches, zero scorecard mismatches, zero committed evidence mismatches, and zero input mutations.
- Added reproducibility negative controls that intentionally perturb normalized output, committed evidence, DecisionTrace hashes, scorecard rows, input mutation state, forbidden effects, capability flags, and boundary-loss state; all reject with expected reason codes.
- The gate preserves strict record-only behavior and does not add live/runtime behavior.
- Added `test:manual-dry-run-cli-pilot-reproducibility` and `test:manual-dry-run-cli-pilot-reproducibility-negative-controls`, then wired both into `check` and release validation.
- Preserved the strict boundary: manual invocation only, explicit local file input only, already-redacted bundle only, required redaction review record, local evidence output only, `record_only` result only.
- Still no live observer, watcher, daemon, adapter/MCP/A2A integration, runtime host integration, tool execution, memory/config writes, external publication by the CLI, approval path, blocking, allowing, authorization, or enforcement.

## New v0.1.16 evidence

- Manual dry-run pilot reproducibility: pass over 12/12 already-redacted expanded pilot cases.
- Fresh runs per case: 2.
- Canonical outputs compared: 12/12.
- Record-only outputs: 12/12.
- Return/write mismatches: 0.
- Normalized output mismatches: 0.
- Committed evidence mismatches: 0.
- DecisionTrace hash mismatches: 0.
- Scorecard mismatches: 0.
- Input mutations: 0.
- Forbidden effects: 0.
- Capability true count: 0.
- False permits: 0.
- False compacts: 0.
- Boundary loss: 0.
- Raw/private/secret/tool/memory/config/approval persistence: false.
- Runtime/live/tool/memory/config/approval/block/allow/authorization/enforcement implementations: false.
- Reproducibility negative controls: pass over 8/8 expected rejects.
- Unexpected accepts: 0.
- Expected reason-code misses: 0.
- Covered negative-control reason codes include normalized output mismatch, committed evidence mismatch, DecisionTrace hash mismatch, scorecard mismatch, input mutation, forbidden effect, capability true, and boundary loss.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, redaction/retention design boundaries, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the 3-case real-redacted handoff pack, real-redacted replay gate, 6-case real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, the 3-case CLI real-redacted positive path, 6-case real-redacted pilot, 14-case failure catalog, runbook/checklist, and 12-case expanded real-redacted pilot. These remain current validation artifacts, but they are not new v0.1.16 delta items.

## Validation snapshot

- review-local: pass 34/34
- receiver adapter contracts: pass 59/59
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false
- Manual dry-run contracts: pass 2 commands / 2 results, validation errors 0, command negative controls 21, result negative controls 39, forbidden effects 0, mayBlock 0, mayAllow 0.
- Manual dry-run CLI: pass, recordOnly true, validation errors 0, forbidden effects 0, mayBlock 0, mayAllow 0, capabilityTrue 0, raw/live/network/tool/memory/config/publication/approval/block/allow/enforcement all false.
- Manual dry-run CLI negative controls: pass, forbidden CLI flag rejections 16/16, forbidden input rejections 23/23, symlink output rejected, symlink parent rejected, outside evidence dir not created.
- Manual dry-run CLI real-redacted handoffs: pass 3/3, record-only 3, validation errors 0, forbidden effects 0, capabilityTrue 0, falsePermit 0, falseCompact 0, boundaryLoss 0.
- Manual dry-run CLI real-redacted pilot: pass 6/6, record-only 6, validation errors 0, forbidden effects 0, capabilityTrue 0, falsePermit 0, falseCompact 0, boundaryLoss 0.
- Manual dry-run CLI pilot failure catalog: pass 14/14 expected rejects, unexpected accepts 0, success evidence for rejected cases 0, forbidden effects 0, capabilityTrue 0.
- Manual dry-run CLI expanded real-redacted pilot: pass 12/12, redaction review records 12, record-only 12, validation errors 0, mismatches 0, forbidden effects 0, capabilityTrue 0, falsePermit 0, falseCompact 0, boundaryLoss 0, raw/private/secret/tool/memory/config/approval persistence false.
- Manual dry-run CLI pilot reproducibility: pass 12/12, two fresh runs per case, canonical outputs compared 12, return/write mismatches 0, normalized output mismatches 0, DecisionTrace hash mismatches 0, scorecard mismatches 0, committed evidence mismatches 0, input mutations 0, forbidden effects 0, capabilityTrue 0, falsePermit 0, falseCompact 0, boundaryLoss 0.
- Manual dry-run CLI pilot reproducibility negative controls: pass 8/8 expected rejects, unexpected accepts 0, expected reason-code misses 0.
- Real-redacted handoff pack: pass 3/3 manually curated real-redacted bundles, 3 redaction review records, validation errors 0, mismatch 0, raw/private/secret/tool/memory/config/approval persistence false, forbidden effects 0, mayBlock 0, mayAllow 0, capability attempts 0.
- Real-redacted handoff replay gate: pass 3 traces → 3 observations + 3 record-only results, validation errors 0, mismatch 0, falsePermit 0, falseCompact 0, boundaryLoss 0, forbidden effects detected 0, mayBlock 0, mayAllow 0, capabilityTrue 0.
- Real-redacted adversarial coverage: pass 6 manually reviewed metadata/control cases, route counts `request_full_receipt: 1`, `request_policy_refresh: 1`, `ask_human: 3`, `block: 1`, validation errors 0, falsePermit 0, falseCompact 0, boundaryLoss 0, forbidden effects detected 0, mayBlock 0, mayAllow 0, capabilityTrue 0.

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.16 adds reproducibility evidence for the already-redacted manual dry-run pilot. The CLI processes already-redacted artifacts; it does not capture reality.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, retention, authorization, approval, or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
