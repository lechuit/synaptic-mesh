# Release Notes — Synaptic Mesh v0.1.17

Status: redaction/retention executable-gates public review package update. Not runtime-ready; not production/canary/enforcement-ready.

## Highlights since v0.1.16

- Added a redaction policy schema gate covering raw content, secret-like values, private paths, tool output, memory text, config text, approval text, long raw prompts, and unknown sensitive fields.
- Added a minimal executable redaction scanner over committed synthetic/already-redacted fixtures.
- The redaction scanner produces the expected compact pass output:

```json
{
  "redactionGate": "pass",
  "rawPersisted": false,
  "secretLikePersisted": false,
  "privatePathPersisted": false,
  "toolOutputPersisted": false,
  "memoryTextPersisted": false,
  "configTextPersisted": false,
  "approvalTextPersisted": false
}
```

- Added a retention policy schema gate with explicit metadata ceilings: raw live input 0 days, redacted observations/results up to 7 days, aggregate scorecards up to 90 days, and public release evidence only when synthetic/non-sensitive.
- Added retention negative controls for raw input retention, over-ceiling retention, unknown classes, raw persistence, missing redaction status, non-aggregate scorecards, non-synthetic public evidence, scheduler/deletion/live-observer/runtime attempts.
- Wired the new redaction/retention gates into local `check` and `release:check` validation.
- Preserved the strict boundary: committed fixture/evidence validation only; no live observer, watcher, daemon, adapter/MCP/A2A integration, runtime host integration, tool execution, memory/config writes, external publication, approval path, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## New v0.1.17 evidence

- Redaction policy schema: pass; 9 sensitive field classes; 7 required public output flags; raw/secret/private/tool/memory/config/approval/long-prompt/unknown-sensitive persistence all false.
- Minimal redaction scanner: pass; 2 pass cases; 9/9 blocking classes rejected; unexpected passes 0; unexpected rejects 0.
- Redaction scanner covered classes: raw content, secret-like value, private path, tool output, memory text, config text, approval text, long raw prompt, unknown sensitive field.
- Retention policy schema: pass; 5 artifact classes; raw live input retention 0 days; redacted observation/result ceilings 7 days; aggregate scorecard ceiling 90 days; no scheduler/deletion implementation.
- Retention negative controls: pass; 13/13 expected rejects; unexpected passes 0; unexpected rejects 0.
- Retention reason codes covered: `RETENTION_RAW_LIVE_INPUT_MUST_BE_ZERO_DAY`, `RETENTION_CEILING_EXCEEDED`, `RETENTION_UNKNOWN_CLASS_REJECTED`, `RETENTION_RAW_CONTENT_PERSISTED`, `RETENTION_REDACTION_STATUS_REQUIRED`, `RETENTION_AGGREGATE_ONLY_REQUIRED`, `RETENTION_PUBLIC_EVIDENCE_MUST_BE_SYNTHETIC_OR_NON_SENSITIVE`, `RETENTION_SCHEDULER_FORBIDDEN`, `RETENTION_DELETION_IMPLEMENTATION_FORBIDDEN`, `RETENTION_LIVE_OBSERVER_FORBIDDEN`, `RETENTION_RUNTIME_INTEGRATION_FORBIDDEN`.

## Carried-forward package evidence

The release package still includes earlier local-shadow gates from the v0.1.x line: reason-code vocabulary docs, conservative coverage matrix, raw/parser adversarial fixtures, adversarial fixture generation, authority-overhead benchmark evidence, decision traces, oracle/classifier separation, mutation degradation checks, category coverage thresholds, passive live-shadow schemas, synthetic live-shadow replay, aggregate drift scorecard shape checks, manual observation bundles, manual redaction fixtures, parserEvidence replay, manual DecisionTrace/live-shadow replay, strict manual scorecard thresholds, RedactionReviewRecord audit gates, the 3-case real-redacted handoff pack, real-redacted replay gate, 6-case real-redacted adversarial coverage gate, manual dry-run command/result contract schemas, the manual dry-run CLI skeleton, forbidden-effects CLI gates, the 3-case CLI real-redacted positive path, 6-case real-redacted pilot, 14-case failure catalog, runbook/checklist, 12-case expanded real-redacted pilot, pilot reproducibility gate, and reproducibility negative controls. These remain current validation artifacts, but they are not new v0.1.17 delta items.

## Validation snapshot

- review-local: pass 34/34
- receiver adapter contracts: pass 59/59
- fixture parity: 15/15
- unsafe allow signals: 0
- source fixture mutation: false
- Redaction policy schema: pass, 9 sensitive field classes, 7 output flags, validation errors 0.
- Minimal redaction scanner: pass, 2 pass cases, 9 block cases, rejected block cases 9, unexpected passes 0, unexpected rejects 0.
- Retention policy schema: pass, 5 artifact classes, raw live input retention 0 days, observation/result ceilings 7 days, aggregate ceiling 90 days, scheduler/deletion implemented false.
- Retention negative controls: pass, 13 negative controls, rejected negative controls 13, unexpected passes 0, unexpected rejects 0.
- Manual dry-run CLI pilot reproducibility: pass 12/12, two fresh runs per case, canonical outputs compared 12, return/write mismatches 0, normalized output mismatches 0, DecisionTrace hash mismatches 0, scorecard mismatches 0, committed evidence mismatches 0, input mutations 0, forbidden effects 0, capabilityTrue 0, falsePermit 0, falseCompact 0, boundaryLoss 0.
- Manual dry-run CLI pilot reproducibility negative controls: pass 8/8 expected rejects, unexpected accepts 0, expected reason-code misses 0.

## Compatibility note

Synaptic Mesh remains a framework-agnostic protocol proposal. v0.1.17 turns redaction/retention review boundaries into executable local fixture gates. It does not capture live traffic, run a live observer, retain raw prompts, schedule deletion, or authorize runtime actions.

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not production/canary/enforcement/L2+ ready.
- Runtime, live observation, adapter, retention scheduler, deletion, authorization, approval, or operational use requires a separate explicit maintainer decision.

## Public review requests

Feedback is especially welcome on:

- adversarial fixtures: https://github.com/lechuit/synaptic-mesh/issues/1
- threat-model gaps: https://github.com/lechuit/synaptic-mesh/issues/2
- citation / quote-check review: https://github.com/lechuit/synaptic-mesh/issues/3
- reference implementation API feedback: https://github.com/lechuit/synaptic-mesh/issues/4
- runtime boundary / non-goals clarity: https://github.com/lechuit/synaptic-mesh/issues/5
