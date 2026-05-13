# Release ladder to v0.3.0-alpha

This ladder records the intended boundary between the late v0.1.x hardening line, the passive canary hardening sequence, and the first advisory-only human-readable report alpha.

Strategic rule: keep hardening the receiver's distrust of inputs before adding more human-readable advisory output. No step in this ladder adds MemoryAtom, real adapters, runtime integration, tool execution, permanent memory, automatic agent consumption, approval, blocking, allowing, authorization, enforcement, or production safety claims.

## v0.1.18 — decision-counterfactual memory retrieval checklist

Local advisory checklist for retrieved-memory fragments before they affect a decision.

## v0.1.19 — checklist robustness

Reproducibility, failure catalog, and reviewer guide for the decision-counterfactual checklist.

## v0.1.20 — executable redaction/retention gates

Before any live-shaped work, prove that sensitive/raw material is not persisted and retention/deletion scheduler claims stay false.

## v0.1.21 — live input/source boundary contracts

Define what a future live-shaped source tuple must include and what remains forbidden: live reads, raw persistence, runtime, daemons/watchers, memory/config writes, publication automation, approval, blocking/allowing, authorization, deletion, retention scheduling, and enforcement.

## v0.1.22 — passive live-shadow simulator

Simulate the shape of passive `LiveShadowObservation` and `LiveShadowObservationResult` records from committed offline `DecisionTrace` evidence only.

Boundary:

- offline simulator only;
- no live traffic/log/session reads;
- no live observer implementation;
- no daemon/watcher/runtime/adapter integration;
- record-only local evidence;
- no effects.

Executable gate: `test:live-shadow-synthetic-replay`.

## v0.2.0-alpha — first passive live-shadow canary

First canary contract for a manual, local, opt-in, passive live-shadow run over already-redacted local canary packets.

Boundary:

- manual invocation only;
- local only;
- explicit opt-in required;
- already-redacted local canary packets only;
- record-only local evidence output;
- no authorization, blocking, allowing, or enforcement;
- no daemon/watcher/runtime/adapter integration;
- no tool execution, memory/config writes, external publication, approval path, deletion, or retention scheduler.

Executable gate: `test:passive-live-shadow-canary`.

This alpha is still not production-ready, not runtime-integrated, not a live daemon, and not a safety certification.

## v0.2.1 — passive canary reproducibility

Require repeated runs over the same passive canary packet to preserve normalized output, reason set, scorecard, and boundary verdict.

Boundary remains manual, local, opt-in, already-redacted, record-only, and no-effects. A pass is evidence of local passive boundary preservation, not runtime authorization.

Executable gate: `test:passive-live-shadow-canary-reproducibility`.

## v0.2.2 — passive canary operator runbook

Human operator guidance for preparing and reviewing passive canary packets.

Boundary remains documentation-only/manual/local/opt-in/passive/record-only/no-effects. It explains canary packet shape, opt-in verification, writable evidence artifacts, pass/non-pass meaning, and abort conditions without adding runtime behavior.

Document: `docs/passive-live-shadow-canary-runbook.md`.

## v0.2.3 — canary source-boundary stress

Stress malformed source tuple handling, stale digest evidence, missing `sourceMtime`, wrong source lane, and output containment hardening for passive canary packets.

Boundary:

- committed local fixtures only;
- already-redacted local canary packet metadata only;
- record-only local evidence output;
- no live traffic/log/session reads;
- no runtime, daemon, watcher, adapter, or tool integration;
- no memory/config writes, publication, automatic agent consumption, approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement.

Executable gate: `test:passive-live-shadow-canary-source-boundary-stress`.

## v0.2.4 — passive canary drift scorecard

Detect whether a passive canary produces changed decisions, reason sets, scorecards, or trace hashes when its normalized input has not changed.

Planned metrics:

- `routeDriftCount`
- `reasonCodeDriftCount`
- `boundaryVerdictDriftCount`
- `scorecardDriftCount`
- `traceHashDriftCount`
- `normalizedOutputMismatchCount`

Required invariants:

- `mayBlock = 0`
- `mayAllow = 0`
- `capabilityTrueCount = 0`
- `forbiddenEffects = 0`
- `automaticAgentConsumptionImplemented = false`

Boundary remains local deterministic evidence only. Drift rows must not become runtime authority, automatic gating for agents, approval signals, blocking/allowing decisions, or production safety claims.

Executable gate: `test:passive-live-shadow-canary-drift-scorecard`.

## v0.2.5 — expanded passive canary pack

Expand the passive canary pack to roughly 10–20 manual opt-in, already-redacted packets.

Target coverage:

- valid redacted packet;
- missing opt-in;
- raw input pressure;
- runtime pressure;
- memory/config pressure;
- publication pressure;
- wrong lane;
- stale digest;
- missing mtime;
- malformed tuple;
- output containment;
- advisory-looking text;
- agent-consumption pressure.

Boundary remains manual, local, opt-in, already-redacted, record-only, and no-effects. The pack may improve coverage, but it still does not authorize runtime behavior.

Executable gate: `test:passive-live-shadow-canary-expanded-pack`.

## v0.2.6 — source-boundary stress expansion

Expand the v0.2.3 source-boundary stress family with rarer source/output/path cases before introducing human-readable advisory reports.

Target coverage:

- digest mismatch distinct from stale digest;
- suspicious future `sourceMtime`;
- invalid `sourceMtime` format;
- source path traversal;
- source path symlink pressure;
- source path Unicode/bidi/confusable pressure;
- source lane alias confusion;
- duplicate `sourceArtifactId`;
- correct source digest with wrong source lane;
- indirect symlink pressure in output path;
- syntactically valid output path whose parent is not allowed.

Boundary remains committed local fixtures only, already-redacted local canary metadata only, record-only local evidence, and no-effects. It must not read live traffic, follow untrusted symlinks for authority, start watchers/daemons, write memory/config, publish, approve, block, allow, authorize, delete, schedule retention, enforce, or feed reports automatically to agents.

Executable gate: `test:passive-live-shadow-canary-source-boundary-expansion`.

## v0.3.0-alpha — advisory-only human-readable report

First human-readable advisory report over passive canary evidence. Example report language may include:

- `would request_full_receipt`
- `would fetch_source`
- `would reject_sensitive_pressure`

Hard rule: **advisory is not authority**. The report must not be consumed automatically by agents.

Required hard flags:

- `consumedByAgent = false`
- `mayBlock = false`
- `mayAllow = false`
- `mayApprove = false`
- `mayExecuteTool = false`
- `mayWriteMemory = false`
- `mayWriteConfig = false`
- `mayPublishExternally = false`

Boundary:

- human-readable report only;
- no runtime integration;
- no tools;
- no memory/config writes;
- no automatic consumption by agents;
- no approval path;
- no block/allow/authorization/enforcement.

Executable gate: `test:passive-live-shadow-canary-advisory-report`.

## v0.3.1 — advisory report Unicode/bidi guard

Formalize Unicode/bidi hygiene around advisory reports and selected machine-readable evidence fields.

Target coverage:

- no hidden/bidi controls in docs, evidence, fixtures, and reports;
- no invisible characters in reason codes;
- reason codes remain ASCII token strings;
- source/output paths remain ASCII-printable;
- dangerous source-path confusables are detected;
- selected machine-readable fields remain free of invisible/bidi controls.

Boundary remains local deterministic evidence hygiene only. The guard is not runtime protection, not authority, not agent-consumed policy, and not enforcement.

Executable gate: `test:passive-live-shadow-canary-advisory-unicode-bidi-guard`.

## v0.3.2 — advisory report misuse/failure catalog

Add a dedicated negative-control catalog for advisory report misuse.

Target rejects:

- machine-readable policy decision flags;
- agent-consumption flags;
- approval-like instructions;
- block/allow instructions;
- authorization and enforcement language;
- tool execution commands;
- memory/config write commands;
- publication automation language;
- agent-instruction mutation language;
- missing non-authority or human-readable-only markers.

Expected result: 12 expected rejects, zero unexpected accepts, and no machine-policy, agent-consumed, authoritative, block, or allow flags.

Boundary remains local deterministic report-misuse testing only. The catalog is not runtime protection, not authority, not agent-consumed policy, and not enforcement.

Executable gate: `test:passive-live-shadow-canary-advisory-report-failure-catalog`.

## v0.3.3 — advisory report reproducibility/drift gate

Add a deterministic local reproducibility gate for the committed human-readable advisory report.

Target checks:

- two local normalizer runs over the same committed report evidence;
- zero normalized-output mismatches;
- committed markdown byte count and report text hash bound to JSON evidence;
- negative controls for report text drift, byte-count drift, summary drift, authority-boundary drift, source-evidence order drift, machine-policy drift, and report-path drift.

Expected result: 2 runs, zero normalized-output mismatches, 6 expected rejects, zero unexpected accepts, and no machine-policy, agent-consumed, authoritative, block, or allow flags.

Boundary remains local deterministic evidence checking only. The reproducibility gate is not runtime protection, not authority, not agent-consumed policy, and not enforcement.

Executable gate: `test:passive-live-shadow-canary-advisory-report-reproducibility`.

## v0.3.4 — advisory reviewer runbook

Add a concise human-review runbook for advisory report evidence.

Target checks:

- required non-authority phrases including `ADVISORY ONLY` and `Advisory no es authority`;
- required sections for purpose, commands, checklist, stop conditions, wording, and boundary;
- local command checklist for advisory report, Unicode/bidi guard, failure catalog, reproducibility, `review:local`, and release check;
- stop conditions for policy/approval/block/allow/authorization/enforcement/tool/memory/config/publication drift;
- public wording guidance to say “two independent local reviews” when reviews are local/subagent-based;
- forbidden authority phrases absent from the runbook.

Expected result: required phrases 10/10, required sections 6/6, required commands 6/6, zero forbidden phrase findings, and no machine-policy, agent-consumed, authoritative, block, or allow flags.

Boundary remains human-readable local review guidance only. The runbook is not runtime protection, not authority, not agent-consumed policy, and not enforcement.

Executable gate: `test:passive-live-shadow-canary-advisory-reviewer-runbook`.
